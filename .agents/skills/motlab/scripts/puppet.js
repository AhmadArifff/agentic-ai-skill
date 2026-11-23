// Puppet pins for flat illustrations: a grid mesh laid over a cut-out PNG and bent by a few pins.
//
//   const P = Puppet.create(img, pins, { cols: 64, power: 3 });
//   P.draw(ctx, moves, x, y, scale, canvasWidth, canvasHeight);
//
// pins:  [{ x, y, r }] in the image's pixels. r (default 1) widens a pin's reach.
// moves: one per pin, { dx, dy, rot, s, ox, oy }: move by (dx, dy) image pixels, turn by rot radians and scale by s
//        about the pivot (ox, oy), which defaults to the pin itself. An empty {} holds that part still.
// draw:  puts image pixel (0, 0) at (x, y) on ctx, scaled by scale; canvasWidth x canvasHeight is ctx's canvas size
//        in device pixels. ctx's shadow settings apply, so a flat shadow can be set before drawing.
//
// Every mesh vertex follows a weighted blend of the pins' moves; a pin's weight falls off with distance (higher power
// keeps each pin's influence more local). Cells of the grid that hold no visible pixel are left out of the mesh.
// The mesh is drawn with WebGL2 on one hidden canvas shared by all puppets, then copied onto ctx.
window.Puppet = (() => {
  let shared = null;

  function context() {
    if (shared) return shared;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: true, preserveDrawingBuffer: true });
    if (!gl) throw new Error('puppet.js needs WebGL2');
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, `#version 300 es
      layout(location = 0) in vec2 clip;
      layout(location = 1) in vec2 uv;
      out vec2 texUV;
      void main() { texUV = uv; gl_Position = vec4(clip, 0.0, 1.0); }`));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, `#version 300 es
      precision highp float;
      in vec2 texUV;
      uniform sampler2D art;
      out vec4 colour;
      void main() { colour = texture(art, texUV); }`));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    shared = { canvas, gl, program, art: gl.getUniformLocation(program, 'art') };
    return shared;
  }

  // Which grid cells show any of the art: the image is shrunk to 3 x 3 samples per cell and checked for alpha.
  function coverage(img, cols, rows) {
    const probe = document.createElement('canvas');
    probe.width = cols * 3; probe.height = rows * 3;
    const pc = probe.getContext('2d', { willReadFrequently: true });
    pc.drawImage(img, 0, 0, probe.width, probe.height);
    const alpha = pc.getImageData(0, 0, probe.width, probe.height).data;
    const covered = new Uint8Array(cols * rows);
    for (let py = 0; py < probe.height; py++) {
      for (let px = 0; px < probe.width; px++) {
        if (alpha[(py * probe.width + px) * 4 + 3] > 8) covered[Math.floor(py / 3) * cols + Math.floor(px / 3)] = 1;
      }
    }
    return covered;
  }

  function create(img, pins, opts = {}) {
    const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
    const cols = opts.cols || 64, rows = Math.max(1, Math.round(cols * H / W)), power = opts.power || 3;
    const across = cols + 1, count = across * (rows + 1);

    const rest = new Float32Array(count * 2), uv = new Float32Array(count * 2);
    for (let j = 0; j <= rows; j++) {
      for (let i = 0; i <= cols; i++) {
        const v = j * across + i;
        uv[v * 2] = i / cols; uv[v * 2 + 1] = j / rows;
        rest[v * 2] = uv[v * 2] * W; rest[v * 2 + 1] = uv[v * 2 + 1] * H;
      }
    }
    const covered = coverage(img, cols, rows), tris = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        if (!covered[j * cols + i]) continue;
        const a = j * across + i, b = a + 1, c = a + across, d = c + 1;
        tris.push(a, c, b, b, c, d);
      }
    }

    // Weights: one row of pins.length values per vertex, summing to 1.
    const weights = new Float32Array(count * pins.length);
    for (let v = 0; v < count; v++) {
      let sum = 0;
      pins.forEach((pin, p) => {
        const reach = pin.r || 1, dx = (rest[v * 2] - pin.x) / reach, dy = (rest[v * 2 + 1] - pin.y) / reach;
        const w = Math.pow(dx * dx + dy * dy + 36, -power / 2);
        weights[v * pins.length + p] = w; sum += w;
      });
      for (let p = 0; p < pins.length; p++) weights[v * pins.length + p] /= sum;
    }

    const clip = new Float32Array(count * 2);
    let gpu = null;

    function upload() {
      const { gl } = context();
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const clipBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, clipBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, clip.byteLength, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(tris), gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      gpu = { texture, vao, clipBuffer };
    }

    // Bend the mesh, then place it on the target canvas in clip space.
    function pose(moves, x, y, scale, cw, ch) {
      const xf = pins.map((pin, p) => {
        const m = moves[p] || {}, s = m.s ?? 1, turn = m.rot || 0;
        return { cos: Math.cos(turn) * s, sin: Math.sin(turn) * s, ox: m.ox ?? pin.x, oy: m.oy ?? pin.y, dx: m.dx || 0, dy: m.dy || 0 };
      });
      for (let v = 0; v < count; v++) {
        const rx = rest[v * 2], ry = rest[v * 2 + 1];
        let bx = 0, by = 0;
        for (let p = 0; p < xf.length; p++) {
          const w = weights[v * xf.length + p];
          if (w < 1e-5) continue;
          const t = xf[p], lx = rx - t.ox, ly = ry - t.oy;
          bx += w * (t.ox + t.cos * lx - t.sin * ly + t.dx);
          by += w * (t.oy + t.sin * lx + t.cos * ly + t.dy);
        }
        clip[v * 2] = (x + bx * scale) / cw * 2 - 1;
        clip[v * 2 + 1] = 1 - (y + by * scale) / ch * 2;
      }
    }

    function draw(ctx, moves, x, y, scale, cw, ch) {
      const g = context(), gl = g.gl;
      if (!gpu) upload();
      if (g.canvas.width !== cw || g.canvas.height !== ch) { g.canvas.width = cw; g.canvas.height = ch; }
      pose(moves, x, y, scale, cw, ch);
      gl.viewport(0, 0, cw, ch);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(g.program);
      gl.bindVertexArray(gpu.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, gpu.clipBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, clip);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gpu.texture);
      gl.uniform1i(g.art, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawElements(gl.TRIANGLES, tris.length, gl.UNSIGNED_INT, 0);
      gl.bindVertexArray(null);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(g.canvas, 0, 0);
      ctx.restore();
    }

    return { draw, pins, W, H, tris: tris.length / 3 };
  }

  return { create };
})();
