---
name: 3d-configurator-simulator
description: "Comprehensive 3D WebGL Configurator & Biomechanical Prosthesis Simulator knowledge skill. Covers Three.js, Draco mesh compression (DRACOLoader), GLTF/GLB asset pipelines, interactive raycasting, material configurators (carbon fiber, titanium, medical silicone), kinematics & articulation rigging, exploded view animation, performance optimization, and clean HTML5 HUD overlays."
tags: ["Three.js", "WebGL", "3D", "Simulator", "Configurator", "Prosthesis", "Interactive", "Draco", "HTML"]
---

# 3D Configurator & Biomechanical Prosthesis Simulator

> **Tags**: `Three.js`, `WebGL`, `3D`, `Simulator`, `Configurator`, `Prosthesis`, `Interactive`, `Draco`, `HTML`
> 
> Panduan arsitektur rekayasa grafis 3D interaktif untuk membangun WebGL configurator dan simulator biomekanik prostesis tingkat industri. Menggabungkan kompresi geometri Draco 10x lebih ringan, perakitan modular multi-komponen, simulasi kinematika persendian, inspeksi raycasting, material PBR fotorealistik, dan antarmuka overlay HTML5 responsif berkinerja tinggi (60-120fps).

---

## 1. Arsitektur Inti: 3D Configurator & Simulator

Sistem ini memisahkan secara tegas antara **WebGL Render Engine** (Three.js), **State Management Configurator**, dan **HTML5 Overlay HUD**:

```
+--------------------------------------------------------------------------------------------------------+
|                                  ARSITEKTUR 3D CONFIGURATOR & SIMULATOR                                |
+--------------------------------------------------------------------------------------------------------+
|  [HTML5 DOM Overlay HUD] (z-index: 10, pointer-events: none)                                           |
|  - Panel Pemilihan Bagian (Socket, Pylon, Knee Joint, Ankle/Foot, Shell Casing)                       |
|  - Material & Finish Swatches (Carbon Fiber, Titanium Brushed, Medical Silicone, Anodized Gold)        |
|  - Slider Kinematika & Simulator Beban (Flexion/Extension angle, Gait cycle speed, Load test kPa)     |
|  - Action Dock (Exploded View Toggle, Reset Camera, Wireframe Mode, Export Config JSON / glTF)         |
+--------------------------------------------------------------------------------------------------------+
                                                    | (Two-Way Reactive State Binding)
+--------------------------------------------------------------------------------------------------------+
|  [Configurator & Kinematics State Manager]                                                             |
|  - Active Modules Registry (Map partId -> 3D Object3D Node)                                            |
|  - Joint Limits & Degree of Freedom (DOF): Knee [-5°..135°], Ankle [-20°..25°]                         |
|  - Exploded View Target Coordinates (Local displacement vectors along normal vectors)                  |
|  - Stress Heatmap Shader Uniforms (Dynamic pressure threshold)                                         |
+--------------------------------------------------------------------------------------------------------+
                                                    | (WebGL Scene Graph Execution)
+--------------------------------------------------------------------------------------------------------+
|  [Three.js WebGL Engine] (z-index: 1, pointer-events: auto)                                            |
|  - Renderer: WebGLRenderer (antialias: true, powerPreference: "high-performance", toneMapping: ACES)    |
|  - Geometry Streamer: GLTFLoader + DRACOLoader (WASM multi-threaded geometry decoding)                 |
|  - Interaction: Raycasting (hover glow, part selection, 3D tooltips projected to 2D screen coordinates) |
|  - Lighting: HDR Environment Map + Directional Key Light + Soft Rim Light                             |
+--------------------------------------------------------------------------------------------------------+
```

---

## 2. Pipeline Draco Compression & glTF Mesh Loading

Model 3D prostesis dan komponen mekanikal presisi tinggi (CAD/STEP export) seringkali memiliki ukuran 30MB - 100MB+. **Draco Compression** mengompresi buffer vertex positions, normals, dan UV coordinates hingga **85% – 95% lebih kecil** (menjadi 1.5MB – 4MB), memungkinkan pemuatan instan pada browser web desktop dan mobile.

### Konfigurasi Standar DRACOLoader + GLTFLoader:
```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class AssetPipeline {
  constructor(loadingManager) {
    this.loadingManager = loadingManager || new THREE.LoadingManager();
    
    // Inisialisasi DRACOLoader
    this.dracoLoader = new DRACOLoader(this.loadingManager);
    
    // Path decoder WASM (dapat diarahkan ke CDN Google atau aset lokal ./draco/)
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.dracoLoader.setDecoderConfig({ type: 'js' }); // 'js' atau 'wasm'
    this.dracoLoader.preload();

    // Inisialisasi GLTFLoader dengan decoder Draco terpasang
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  async loadDracoModel(url, onProgress) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          // Traversal untuk optimasi geometri & bayangan
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (!child.geometry.attributes.normal) {
                child.geometry.computeVertexNormals();
              }
            }
          });
          resolve(gltf);
        },
        (progress) => {
          if (onProgress && progress.total > 0) {
            const percent = (progress.loaded / progress.total) * 100;
            onProgress(percent);
          }
        },
        (error) => reject(error)
      );
    });
  }

  dispose() {
    this.dracoLoader.dispose();
  }
}
```

---

## 3. Domain Pemodelan Prostesis & Simulasi Biomekanik

Dalam perancangan prostesis (misalnya prostesis tungkai bawah transtibial/transfemoral atau bionic hand), model 3D dibagi menjadi **sub-sistem modular**:

### A. Anatomi Komponen Modular Prostesis:
1. **Limb Socket (Soket Stump Pasien)**: Wadah penerima sisa anggota tubuh. Memerlukan kustomisasi material medical-grade silicone liner dan carbon-fiber outer frame.
2. **Pylon / Strut (Tiang Penyangga)**: Batang struktural berbahan titanium atau serat karbon dengan pengukuran panjang yang dapat disesuaikan (*interactive height adjustment*).
3. **Biomechanical Joint (Sendi Lutut/Pergelangan)**:
   - Polycentric 4-bar linkage (lutut mekanis 4 engsel).
   - Microprocessor-controlled hydraulic knee unit (bionic knee).
4. **Terminal Prosthetic Foot / Hand**:
   - Dynamic response carbon fiber energy storage foot blade.
   - Multi-articulating motorized fingers (5 motor linear independen).

### B. Material Library PBR Realistis:
```javascript
export const ProsthesisMaterials = {
  // 1. Carbon Fiber Twill Weave (Kuat, Ringan, Tampilan Bertekstur)
  carbonFiber: (textures = {}) => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x1a1a1a),
    roughness: 0.35,
    metalness: 0.1,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15,
    normalMap: textures.carbonNormal || null,
    roughnessMap: textures.carbonRoughness || null,
    name: 'CarbonFiber_Mat'
  }),

  // 2. Grade 5 Aerospace Titanium (Matte, Brushed Metal, Anti-Karat)
  aerospaceTitanium: () => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd2d7df),
    metalness: 0.88,
    roughness: 0.28,
    name: 'Titanium_Mat'
  }),

  // 3. Medical-Grade Silicone Liner (Translucent, Hypoallergenic)
  medicalSilicone: (colorHex = 0xe8cfb8) => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.65,
    metalness: 0.0,
    transmission: 0.45,
    thickness: 1.2,
    ior: 1.41,
    name: 'SiliconeLiner_Mat'
  }),

  // 4. Anodized Aluminum Accents (Pewarnaan Kustom: Biru, Merah, Emas)
  anodizedAluminum: (accentHex = 0x00d2ff) => new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentHex),
    metalness: 0.75,
    roughness: 0.32,
    name: 'AnodizedAccent_Mat'
  })
};
```

---

## 4. Fitur Interaktif: Exploded View, Raycasting, & Inspeksi

### A. Exploded View (Tampilan Bongkar Pasang Animatif):
Menggeser setiap komponen modular menjauh dari titik pusat perakitan sepanjang vektor sumbu spesifik secara mulus:

```javascript
export class ExplodedViewManager {
  constructor(partsMap) {
    this.parts = partsMap; // Map partId -> { mesh, originalPos, explodeOffset }
    this.isExploded = false;
  }

  toggleExplode(progressRatio) {
    // progressRatio: 0.0 (assembled) hingga 1.0 (fully exploded)
    this.parts.forEach((item) => {
      const targetPos = new THREE.Vector3().copy(item.originalPos).addScaledVector(item.explodeOffset, progressRatio);
      item.mesh.position.lerp(targetPos, 0.1);
    });
  }
}
```

### B. Raycasting & 3D Annotations Projected to 2D HTML:
```javascript
export class PartInspector {
  constructor(camera, scene, domCanvas) {
    this.camera = camera;
    this.scene = scene;
    this.domCanvas = domCanvas;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedMesh = null;

    this.domCanvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
  }

  onPointerDown(event) {
    const rect = this.domCanvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const hit = intersects.find(i => i.object.isMesh && i.object.userData.interactive);
      if (hit) {
        this.selectPart(hit.object);
      }
    }
  }

  selectPart(mesh) {
    this.selectedMesh = mesh;
    if (mesh.material && mesh.material.emissive) {
      mesh.material.emissive.setHex(0x00f0ff);
      setTimeout(() => mesh.material.emissive.setHex(0x000000), 800);
    }
  }

  getScreenCoordinates(worldPoint) {
    if (!worldPoint) return { x: 0, y: 0 };
    const projected = worldPoint.clone().project(this.camera);
    return {
      x: (projected.x * 0.5 + 0.5) * this.domCanvas.clientWidth,
      y: (-projected.y * 0.5 + 0.5) * this.domCanvas.clientHeight
    };
  }
}
```

---

## 5. Simulasi Kinematika & Range of Motion (ROM)

Dalam simulator biomekanik, sendi prostesis digerakkan berdasarkan sudut fleksi/ekstensi (*kinematic chain*):

```javascript
export class BiomechanicalKinematics {
  constructor(kneeJointNode, ankleJointNode) {
    this.kneeJoint = kneeJointNode;
    this.ankleJoint = ankleJointNode;
    
    this.limits = {
      kneeFlexionMax: 130,   // Fleksi maksimal (lutut menekuk)
      kneeExtensionMin: -2,  // Hiperekstensi minimal
      ankleDorsiflexionMax: 20,
      anklePlantarflexionMin: -30
    };
  }

  setKneeAngle(angleDegrees) {
    const clamped = Math.max(this.limits.kneeExtensionMin, Math.min(this.limits.kneeFlexionMax, angleDegrees));
    const rad = THREE.MathUtils.degToRad(clamped);
    if (this.kneeJoint) {
      this.kneeJoint.rotation.x = rad;
    }
  }

  simulateGaitCycle(normalizedPhase) {
    const radPhase = normalizedPhase * Math.PI * 2;
    const kneeAngle = Math.sin(radPhase) * 35 + 25;
    const ankleAngle = Math.cos(radPhase) * 15;
    
    this.setKneeAngle(kneeAngle);
    if (this.ankleJoint) {
      this.ankleJoint.rotation.x = THREE.MathUtils.degToRad(ankleAngle);
    }
  }
}
```

---

## 6. Blueprint Template Kode Produksi Lengkap (HTML + Three.js)

Berikut adalah struktur kode bersih, modular, dan bebas AI-slop:

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biomechanical Prosthesis 3D Configurator & Simulator</title>
  <style>
    :root {
      --bg-dark: #0a0b0e;
      --card-bg: rgba(18, 20, 26, 0.85);
      --border-color: rgba(255, 255, 255, 0.1);
      --accent-cyan: #00f0ff;
      --text-main: #f0f3f6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: var(--bg-dark); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--text-main); }
    #canvas-container { position: absolute; inset: 0; z-index: 1; }
    canvas { width: 100%; height: 100%; display: block; }
    
    /* HUD Overlay */
    .hud-overlay { position: absolute; inset: 0; z-index: 10; pointer-events: none; display: flex; flex-direction: column; justify-content: space-between; padding: 24px; }
    .interactive { pointer-events: auto; }
    .panel { background: var(--card-bg); backdrop-filter: blur(12px); border: 1px solid var(--border-color); border-radius: 14px; padding: 18px; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4); }
    .header-bar { display: flex; justify-content: space-between; align-items: center; }
    .swatch-group { display: flex; gap: 8px; margin-top: 10px; }
    .swatch { width: 32px; height: 32px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 0.2s; }
    .swatch:hover { transform: scale(1.15); border-color: var(--accent-cyan); }
    .btn { background: #1a1d24; color: var(--text-main); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
    .btn:hover { background: var(--accent-cyan); color: #000; border-color: var(--accent-cyan); }
    .slider-row { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
    input[type=range] { flex: 1; accent-color: var(--accent-cyan); }
  </style>
</head>
<body>
  <div id="canvas-container"></div>

  <div class="hud-overlay">
    <!-- Top Header -->
    <header class="header-bar panel interactive" style="width: fit-content;">
      <div>
        <h1 style="font-size: 18px; font-weight: 600;">Titan-X Bionic Prosthetic Limb</h1>
        <p style="font-size: 12px; color: #8a92a0;">Real-Time Kinematic Simulator & Modular Configurator</p>
      </div>
    </header>

    <!-- Bottom Controls Deck -->
    <footer class="panel interactive" style="max-width: 600px; width: 100%; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 14px; font-weight: 500;">Material Frame Finish:</span>
        <div class="swatch-group">
          <button class="swatch" id="btn-carbon" style="background: #1c1c1c;" title="Carbon Fiber"></button>
          <button class="swatch" id="btn-titanium" style="background: #b8c0cc;" title="Aerospace Titanium"></button>
          <button class="swatch" id="btn-gold" style="background: #d4af37;" title="Anodized Gold"></button>
        </div>
      </div>

      <div class="slider-row">
        <label for="joint-slider" style="font-size: 13px; min-width: 130px;">Knee Flexion: <span id="angle-val">0°</span></label>
        <input type="range" id="joint-slider" min="0" max="120" value="0">
      </div>

      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button class="btn" id="btn-explode">Toggle Exploded View</button>
        <button class="btn" id="btn-gait">Run Gait Cycle Simulation</button>
        <button class="btn" id="btn-reset">Reset View</button>
      </div>
    </footer>
  </div>

  <script type="module">
    import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
    import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

    // 1. Scene & Camera Setup
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0b0e);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.2, 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;

    // 2. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.0);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // 3. Grid & Ground Shadow Receiver
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.25 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.8;
    floor.receiveShadow = true;
    scene.add(floor);

    // 4. Procedural Prosthesis Hierarchy (Demo Assembly)
    const rootAssembly = new THREE.Group();
    scene.add(rootAssembly);

    // Socket
    const socketGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.7, 32);
    const mainMaterial = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, metalness: 0.3, roughness: 0.4 });
    const socketMesh = new THREE.Mesh(socketGeo, mainMaterial);
    socketMesh.position.y = 0.6;
    socketMesh.castShadow = true;
    rootAssembly.add(socketMesh);

    // Knee Hinge Node
    const kneeHinge = new THREE.Group();
    kneeHinge.position.set(0, 0.2, 0);
    rootAssembly.add(kneeHinge);

    const kneeJointGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.26, 24);
    kneeJointGeo.rotateZ(Math.PI / 2);
    const jointMesh = new THREE.Mesh(kneeJointGeo, new THREE.MeshStandardMaterial({ color: 0xb8c0cc, metalness: 0.9, roughness: 0.2 }));
    jointMesh.castShadow = true;
    kneeHinge.add(jointMesh);

    // Pylon & Blade Assembly attached to Knee Hinge
    const lowerLeg = new THREE.Group();
    kneeHinge.add(lowerLeg);

    const pylonGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 16);
    const pylonMesh = new THREE.Mesh(pylonGeo, new THREE.MeshStandardMaterial({ color: 0x333742, metalness: 0.8, roughness: 0.3 }));
    pylonMesh.position.y = -0.35;
    pylonMesh.castShadow = true;
    lowerLeg.add(pylonMesh);

    const footGeo = new THREE.BoxGeometry(0.14, 0.05, 0.38);
    const footMesh = new THREE.Mesh(footGeo, mainMaterial);
    footMesh.position.set(0, -0.7, 0.08);
    footMesh.castShadow = true;
    lowerLeg.add(footMesh);

    // 5. Interactivity Bindings
    const jointSlider = document.getElementById('joint-slider');
    const angleVal = document.getElementById('angle-val');
    jointSlider.addEventListener('input', (e) => {
      const angle = parseFloat(e.target.value);
      angleVal.textContent = `${angle}°`;
      lowerLeg.rotation.x = THREE.MathUtils.degToRad(angle);
    });

    document.getElementById('btn-carbon').onclick = () => {
      mainMaterial.color.setHex(0x1a1a1a);
      mainMaterial.roughness = 0.4;
      mainMaterial.metalness = 0.2;
    };
    document.getElementById('btn-titanium').onclick = () => {
      mainMaterial.color.setHex(0xb8c0cc);
      mainMaterial.roughness = 0.25;
      mainMaterial.metalness = 0.88;
    };
    document.getElementById('btn-gold').onclick = () => {
      mainMaterial.color.setHex(0xd4af37);
      mainMaterial.roughness = 0.3;
      mainMaterial.metalness = 0.75;
    };

    let isExploded = false;
    document.getElementById('btn-explode').onclick = () => {
      isExploded = !isExploded;
      const targetSocketY = isExploded ? 1.0 : 0.6;
      const targetFootY = isExploded ? -1.0 : -0.7;
      socketMesh.position.y = targetSocketY;
      footMesh.position.y = targetFootY;
    };

    let gaitActive = false;
    document.getElementById('btn-gait').onclick = (e) => {
      gaitActive = !gaitActive;
      e.target.textContent = gaitActive ? 'Stop Gait Simulation' : 'Run Gait Cycle Simulation';
    };

    document.getElementById('btn-reset').onclick = () => {
      camera.position.set(0, 1.2, 3.5);
      controls.target.set(0, 0, 0);
      lowerLeg.rotation.x = 0;
      jointSlider.value = 0;
      angleVal.textContent = '0°';
    };

    // 6. Responsive Resize Handling
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 7. Render Loop with Gait Simulation
    let clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (gaitActive) {
        const gaitAngle = (Math.sin(elapsed * 4) * 0.5 + 0.5) * 60;
        lowerLeg.rotation.x = THREE.MathUtils.degToRad(gaitAngle);
        jointSlider.value = Math.round(gaitAngle);
        angleVal.textContent = `${Math.round(gaitAngle)}°`;
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  </script>
</body>
</html>
```

---

## 7. Checklist Integritas & Anti-Slop 3D

- [ ] **Draco WASM Decoder Resilience**: Path decoder lokal atau CDN terpercaya dikonfigurasi dengan fallback gracefully jika WebAssembly dinonaktifkan di client.
- [ ] **Memory Leak Prevention**: Setiap kali komponen ditukar (*swapped*), panggil `.dispose()` pada geometry, material, dan texture lama sebelum menghapusnya dari scene graph.
- [ ] **Responsive Canvas Layout**: Menggunakan dynamic resize listener dengan pembaruan `camera.aspect` dan `renderer.setSize()`.
- [ ] **Zero Dead Buttons (R-26)**: Semua tombol di HUD overlay (swatch warna, exploded view, slider gerak) wajib terikat ke fungsi logika Three.js nyata.
- [ ] **Keyboard & Accessible Controls (R-32)**: Input slider dan tombol swatches dapat diakses menggunakan Tab, Shift+Tab, dan Space/Enter.
- [ ] **Performance Cap**: Batasi `devicePixelRatio` maksimal 2 (`Math.min(window.devicePixelRatio, 2)`) untuk menghindari kejatuhan frame rate pada layar mobile Retina 3x-4x.
