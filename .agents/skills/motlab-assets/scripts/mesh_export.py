# The light 3D path, without Blender: writes meshes made with mesh_from_sdf.py (.npz) as one GLB and one OBJ + MTL.
# Each part gets one flat PBR material (colour, roughness, metalness). No textures, no rig, no FBX: that is the Blender path.
# Usage: python mesh_export.py <out_dir> <name> <part.npz>:<#hex>[:<roughness>[:<metalness>]] ... [--smooth 20]
#   --smooth N   Laplacian smoothing passes (0.6 each), like the Blender path's smooth modifier. Default 20; 0 for small sharp parts
# The meshes are y-up, like glTF. Units are whatever the distance functions used.
import sys, os, json, struct
import numpy as np
from scipy import sparse

def load(path):
    d = np.load(path); v = d['v'].astype(np.float64); f = d['f'].astype(np.int64)
    if f.shape[1] == 4: f = np.concatenate([f[:, [0, 1, 2]], f[:, [0, 2, 3]]])   # quads to triangles
    return v, f

def smooth(v, f, n, k=0.6):
    if not n: return v
    e = np.concatenate([f[:, [0, 1]], f[:, [1, 2]], f[:, [2, 0]]]); e = np.concatenate([e, e[:, ::-1]])
    A = sparse.coo_matrix((np.ones(len(e)), (e[:, 0], e[:, 1])), shape=(len(v), len(v))).tocsr(); A.data[:] = 1
    deg = np.asarray(A.sum(1)).ravel(); deg[deg == 0] = 1
    for _ in range(n): v = v + k * (A @ v / deg[:, None] - v)
    return v

def normals(v, f):
    fn = np.cross(v[f[:, 1]] - v[f[:, 0]], v[f[:, 2]] - v[f[:, 0]])   # area-weighted
    n = np.zeros_like(v)
    for i in range(3): np.add.at(n, f[:, i], fn)
    return n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-12)

def srgb_to_linear(c): c = np.asarray(c); return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

def parse(spec):
    p = spec.split(':'); path = p[0]
    if len(p) > 1 and len(p[0]) == 1: path = p[0] + ':' + p[1]; p = [path] + p[2:]   # a Windows drive letter
    hx = (p[1] if len(p) > 1 else '#cccccc').lstrip('#'); rgb = [int(hx[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return path, rgb, float(p[2]) if len(p) > 2 else 0.5, float(p[3]) if len(p) > 3 else 0.0

def main():
    a = sys.argv[1:]; n = 20
    if '--smooth' in a: i = a.index('--smooth'); n = int(a[i + 1]); del a[i:i + 2]
    out, name, specs = a[0], a[1], a[2:]
    if not specs: sys.exit('usage: mesh_export.py <out_dir> <name> <part.npz>:<#hex>[:rough[:metal]] ... [--smooth 20]')
    os.makedirs(out, exist_ok=True)
    parts = []
    for s in specs:
        path, rgb, rough, metal = parse(s); v, f = load(path); v = smooth(v, f, n); parts.append((os.path.splitext(os.path.basename(path))[0], v.astype(np.float32), normals(v, f).astype(np.float32), f.astype(np.uint32), rgb, rough, metal))

    # GLB: one buffer, one mesh and node per part, all under one root node
    blob = bytearray(); views = []; acc = []; meshes = []; mats = []; nodes = []
    def add_view(arr, target):
        while len(blob) % 4: blob.append(0)
        views.append({'buffer': 0, 'byteOffset': len(blob), 'byteLength': arr.nbytes, 'target': target}); blob.extend(arr.tobytes()); return len(views) - 1
    for i, (pn, v, nr, f, rgb, rough, metal) in enumerate(parts):
        acc.append({'bufferView': add_view(v, 34962), 'componentType': 5126, 'count': len(v), 'type': 'VEC3', 'min': v.min(0).tolist(), 'max': v.max(0).tolist()})
        acc.append({'bufferView': add_view(nr, 34962), 'componentType': 5126, 'count': len(nr), 'type': 'VEC3'})
        acc.append({'bufferView': add_view(f.ravel(), 34963), 'componentType': 5125, 'count': f.size, 'type': 'SCALAR'})
        mats.append({'name': pn, 'pbrMetallicRoughness': {'baseColorFactor': [*srgb_to_linear(rgb).tolist(), 1], 'metallicFactor': metal, 'roughnessFactor': rough}})
        meshes.append({'name': pn, 'primitives': [{'attributes': {'POSITION': 3 * i, 'NORMAL': 3 * i + 1}, 'indices': 3 * i + 2, 'material': i}]})
        nodes.append({'name': pn, 'mesh': i})
    nodes.append({'name': name, 'children': list(range(len(parts)))})
    while len(blob) % 4: blob.append(0)
    doc = {'asset': {'version': '2.0', 'generator': 'motlab-assets mesh_export.py'}, 'scene': 0, 'scenes': [{'nodes': [len(parts)]}], 'nodes': nodes, 'meshes': meshes,
           'materials': mats, 'accessors': acc, 'bufferViews': views, 'buffers': [{'byteLength': len(blob)}]}
    js = json.dumps(doc, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
    glb = os.path.join(out, name + '.glb')
    with open(glb, 'wb') as fh:
        fh.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)))
        fh.write(struct.pack('<II', len(js), 0x4E4F534A)); fh.write(js); fh.write(struct.pack('<II', len(blob), 0x004E4942)); fh.write(blob)

    # OBJ + MTL (Kd in sRGB, as most importers expect; Pr/Pm are the PBR extension Blender reads)
    with open(os.path.join(out, name + '.mtl'), 'w', newline='\n') as m:
        for pn, _, _, _, rgb, rough, metal in parts: m.write(f'newmtl {pn}\nKd {rgb[0]:.4f} {rgb[1]:.4f} {rgb[2]:.4f}\nPr {rough:.3f}\nPm {metal:.3f}\n\n')
    with open(os.path.join(out, name + '.obj'), 'w', newline='\n') as o:
        o.write(f'mtllib {name}.mtl\n'); base = 1
        for pn, v, nr, f, *_ in parts:
            o.write(f'o {pn}\nusemtl {pn}\n')
            o.write(''.join(f'v {x:.5f} {y:.5f} {z:.5f}\n' for x, y, z in v)); o.write(''.join(f'vn {x:.4f} {y:.4f} {z:.4f}\n' for x, y, z in nr))
            o.write(''.join(f'f {a}//{a} {b}//{b} {c}//{c}\n' for a, b, c in (f + base))); base += len(v)
    tris = sum(len(p[3]) for p in parts)
    print(f'{glb} ({os.path.getsize(glb) / 1e6:.1f} MB), {name}.obj, {name}.mtl: {len(parts)} parts, {tris} triangles')

if __name__ == '__main__': main()
