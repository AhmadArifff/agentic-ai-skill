# Blender helpers for a 3D asset: UVs, baked PBR textures, export to GLB + FBX + OBJ, a re-import check and a turntable.
# Your build.py puts this folder and the motlab skill's scripts/blender folder (kit.py, mesh_from_sdf.py) on sys.path, builds
# the objects with kit.py, then calls these. Run it with no window: blender -b -P build.py -- <out dir>
# Check exported files in a clean Blender: blender -b --factory-startup -P asset3d.py -- check model.glb model.fbx model.obj
import bpy, os, sys, math
from mathutils import Vector

def meshes(objs=None): return [o for o in (objs or bpy.context.scene.objects) if o.type == 'MESH']

def select(objs):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.hide_set(False); o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]

def apply_modifiers(o):   # bake and UVs work on the final shape
    select([o])
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)

def unwrap(o, margin=0.02):   # Smart UV Project when the mesh has no UVs. Hand-made seams are better for characters
    if o.data.uv_layers: return
    select([o]); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=margin); bpy.ops.object.mode_set(mode='OBJECT')

def _image_node(mat, img):
    n = mat.node_tree.nodes.new('ShaderNodeTexImage'); n.image = img; mat.node_tree.nodes.active = n; return n

def bake(o, out, size=2048, maps=('basecolor', 'roughness', 'normal'), samples=16):
    # Bakes the object's materials into PNG maps <name>_<map>.png in `out`, then gives the object one new material that
    # uses them, so every exporter carries the look. Procedural nodes, several materials and bump all end up in the maps.
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = samples
    apply_modifiers(o); unwrap(o); os.makedirs(out, exist_ok=True); name = o.name; files = {}
    kinds = {'basecolor': ('DIFFUSE', {'COLOR'}, 'sRGB'), 'roughness': ('ROUGHNESS', set(), 'Non-Color'), 'normal': ('NORMAL', set(), 'Non-Color'),
             'ao': ('AO', set(), 'Non-Color'), 'emission': ('EMIT', set(), 'sRGB')}
    for m in maps:
        kind, passes, space = kinds[m]
        img = bpy.data.images.new(f'{name}_{m}', size, size, alpha=False, float_buffer=False); img.colorspace_settings.name = space
        tmp = [(mat, _image_node(mat, img)) for mat in o.data.materials if mat and mat.use_nodes]
        select([o]); sc.render.bake.margin = 8
        bpy.ops.object.bake(type=kind, pass_filter=passes, use_clear=True, margin=8)
        p = os.path.join(out, f'{name}_{m}.png'); img.filepath_raw = p; img.file_format = 'PNG'; img.save(); files[m] = p
        for mat, n in tmp: mat.node_tree.nodes.remove(n)
        print('BAKED', p, flush=True)
    mat = bpy.data.materials.new(f'{name}_baked'); mat.use_nodes = True; nt = mat.node_tree; P = nt.nodes['Principled BSDF']
    def tex(m, space):
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(files[m]); n.image.colorspace_settings.name = space; return n
    if 'basecolor' in files: nt.links.new(tex('basecolor', 'sRGB').outputs['Color'], P.inputs['Base Color'])
    if 'roughness' in files: nt.links.new(tex('roughness', 'Non-Color').outputs['Color'], P.inputs['Roughness'])
    if 'normal' in files:
        nm = nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(tex('normal', 'Non-Color').outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], P.inputs['Normal'])
    metal = [mt.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value for mt in o.data.materials if mt and mt.use_nodes and 'Principled BSDF' in mt.node_tree.nodes]
    P.inputs['Metallic'].default_value = max(metal) if metal else 0.0   # Cycles cannot bake metalness; one value is kept
    o.data.materials.clear(); o.data.materials.append(mat)
    return files

def export(objs, out, name, formats=('glb', 'fbx', 'obj')):
    # Writes <name>.glb and <name>.fbx with the textures inside, and <name>.obj + .mtl pointing at the texture files where they are. Modifiers are applied in the files.
    os.makedirs(out, exist_ok=True); objs = list(objs)
    for o in list(objs):   # take parents and children along, so empties that place the parts are kept
        objs += [c for c in o.children_recursive if c not in objs]
    select(objs); done = []
    if 'glb' in formats:
        p = os.path.join(out, name + '.glb'); bpy.ops.export_scene.gltf(filepath=p, export_format='GLB', use_selection=True, export_apply=True); done.append(p)
    if 'fbx' in formats:
        p = os.path.join(out, name + '.fbx'); bpy.ops.export_scene.fbx(filepath=p, use_selection=True, apply_scale_options='FBX_SCALE_ALL', path_mode='COPY', embed_textures=True, use_mesh_modifiers=True); done.append(p)
    if 'obj' in formats:
        p = os.path.join(out, name + '.obj'); bpy.ops.wm.obj_export(filepath=p, export_selected_objects=True, export_materials=True, export_pbr_extensions=True, path_mode='RELATIVE', apply_modifiers=True); done.append(p)
    for p in done: print('EXPORTED', p, f'{os.path.getsize(p) / 1e6:.1f} MB', flush=True)
    return done

def bounds(objs):
    pts = [o.matrix_world @ Vector(c) for o in meshes(objs) for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi

def turntable(objs, out, views=8, width=2048, samples=64, lens=70, elevation=12, light=(-1, -1, 1.1), world=0.04):
    # Renders `views` angles round the object, square, transparent PNG: <out>/view_00.png ... The camera and the key light
    # turn together, so every view is lit the same way. `light` is the light's direction seen from the front view (x right, y towards the object, z up).
    import kit
    from mathutils import Matrix
    sc = kit.setup(width, samples, 24, world=world); sc.render.resolution_y = width; sc.render.use_motion_blur = False
    lo, hi = bounds(objs); c = (lo + hi) / 2; r = (hi - lo).length / 2
    cam = kit.camera(); cam.data.lens = lens; d = r / math.tan(cam.data.angle / 2) * 1.08
    key = kit.key_light(tuple(c + Vector(light).normalized() * r * 6), size=(r * 4, r * 5), power=900 * r * r, target=tuple(c))
    os.makedirs(out, exist_ok=True); files = []
    for i in range(views):
        a = 2 * math.pi * i / views - math.pi / 2; e = math.radians(elevation)
        kit.look_at(cam, tuple(c + Vector((d * math.cos(e) * math.cos(a), d * math.cos(e) * math.sin(a), d * math.sin(e)))), tuple(c))
        lp = c + Matrix.Rotation(a + math.pi / 2, 3, 'Z') @ Vector(light).normalized() * r * 6
        key.location = lp; key.rotation_quaternion = (c - lp).to_track_quat('-Z', 'Y')
        p = os.path.join(out, f'view_{i:02d}.png'); sc.render.filepath = p; bpy.ops.render.render(write_still=True); files.append(p); print('VIEW', p, flush=True)
    return files

def check(paths):   # imports each file into an empty scene and reports what came back
    for p in paths:
        bpy.ops.wm.read_factory_settings(use_empty=True); e = p.lower().rsplit('.', 1)[-1]
        if e in ('glb', 'gltf'): bpy.ops.import_scene.gltf(filepath=p)
        elif e == 'fbx': bpy.ops.import_scene.fbx(filepath=p)
        elif e == 'obj': bpy.ops.wm.obj_import(filepath=p)
        ms = meshes(); imgs = [i for i in bpy.data.images if i.type == 'IMAGE']
        verts = sum(len(o.data.vertices) for o in ms); mats = {m.name for o in ms for m in o.data.materials if m}
        lo, hi = bounds(ms) if ms else (Vector(), Vector())
        print(f'CHECK {os.path.basename(p)}: {len(ms)} meshes, {verts} vertices, {len(mats)} materials, {len(imgs)} images, size {tuple(round(v, 3) for v in (hi - lo))}', flush=True)

if __name__ == '__main__' and '--' in sys.argv:
    a = sys.argv[sys.argv.index('--') + 1:]
    if a and a[0] == 'check': check([os.path.abspath(p) for p in a[1:]])
