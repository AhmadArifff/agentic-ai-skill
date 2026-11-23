"""Helpers for rendering a product shot with Blender and Cycles, with no window open.

A scene script puts this folder on sys.path, imports kit, builds its objects and calls kit.render():

    blender -b -P scene.py -- <out dir> <width> <samples> [flat] [times...]

Frame f (from 1) shows the scene at (f - 1) / fps seconds and is saved as <out dir>/<f:04d>.png with a transparent
background. Frames that already exist are skipped, so running the same command again after a crash carries on.
Given times (in seconds), only the frames nearest those times are rendered, for quick checks.
"""
import os
import sys

import bpy
import numpy as np
from mathutils import Quaternion, Vector


def args():
    """The arguments after `--`: (out dir, width, samples, flat, times)."""
    rest = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    flat = 'flat' in rest
    rest = [a for a in rest if a != 'flat']
    if len(rest) < 3:
        sys.exit('usage: blender -b -P scene.py -- <out dir> <width> <samples> [flat] [times...]')
    return os.path.abspath(rest[0]), int(rest[1]), int(rest[2]), flat, [float(a) for a in rest[3:]]


def fresh():
    """An empty scene, with no default cube, light or camera."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def _link(obj, parent=None):
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent
    obj.rotation_mode = 'QUATERNION'
    return obj


def empty(name, parent=None):
    """A null object to group and move other objects."""
    return _link(bpy.data.objects.new(name, None), parent)


def mat(name, base, rough=0.3, coat=0.0, metal=0.0, sss=0.0):
    """A Principled BSDF material. base is linear RGB in 0..1."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    values = {'Base Color': (*base, 1.0), 'Roughness': rough, 'Metallic': metal,
              'Coat Weight': coat, 'Subsurface Weight': sss}
    for socket, value in values.items():
        if socket in bsdf.inputs:
            bsdf.inputs[socket].default_value = value
    return m


def load_npz(path, material, parent=None, smooth=20):
    """A mesh written by mesh_from_sdf.nets(), shaded smooth, with a Smooth modifier of `smooth` iterations."""
    data = np.load(path)
    name = os.path.splitext(os.path.basename(path))[0]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(data['v'].astype(float).tolist(), [], data['f'].tolist())
    mesh.validate()
    mesh.polygons.foreach_set('use_smooth', [True] * len(mesh.polygons))
    mesh.update()
    mesh.materials.append(material)
    obj = _link(bpy.data.objects.new(name, mesh), parent)
    if smooth:
        mod = obj.modifiers.new('smooth', 'SMOOTH')
        mod.factor = 0.6
        mod.iterations = smooth
    return obj


def load_model(path, parent=None):
    """Import a .glb, .gltf, .fbx or .obj file and return the objects it added."""
    before = set(bpy.data.objects)
    ext = os.path.splitext(path)[1].lower()
    if ext in ('.glb', '.gltf'):
        bpy.ops.import_scene.gltf(filepath=path)
    elif ext == '.fbx':
        bpy.ops.import_scene.fbx(filepath=path)
    elif ext == '.obj':
        bpy.ops.wm.obj_import(filepath=path)
    else:
        raise ValueError(f'cannot import {ext} files')
    added = [o for o in bpy.data.objects if o not in before]
    if parent is not None:
        for o in added:
            if o.parent is None:
                o.parent = parent
    return added


def _aim(obj, eye, target, roll=0.0):
    obj.location = eye
    obj.rotation_quaternion = (Vector(target) - Vector(eye)).to_track_quat('-Z', 'Y') @ Quaternion((0, 0, 1), roll)


def key_light(loc, size=(7, 9), power=4200, target=(0, 0, 0)):
    """One large, soft rectangular area light aimed at target. A single source is what makes the shot look lit."""
    light = bpy.data.lights.new('key', 'AREA')
    light.shape = 'RECTANGLE'
    light.size, light.size_y = size
    light.energy = power
    obj = _link(bpy.data.objects.new('key', light))
    _aim(obj, loc, target)
    return obj


def camera():
    """A camera that becomes the scene's camera. Aim it with look_at()."""
    obj = _link(bpy.data.objects.new('cam', bpy.data.cameras.new('cam')))
    bpy.context.scene.camera = obj
    return obj


def look_at(cam, eye, target, roll=0.0):
    _aim(cam, eye, target, roll)


def _use_gpu(scene):
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for backend in ('OPTIX', 'CUDA', 'HIP', 'METAL', 'ONEAPI'):
        try:
            prefs.compute_device_type = backend
            prefs.get_devices()
        except Exception:
            continue
        found = [d for d in prefs.devices if d.type == backend]
        if found:
            for d in prefs.devices:
                d.use = d.type == backend
            scene.cycles.device = 'GPU'
            return backend
    scene.cycles.device = 'CPU'
    return 'CPU'


def setup(width, samples, fps, world=0.002):
    """Cycles on the GPU when there is one, a 16:9 frame `width` wide, a transparent film, a near-black world,
    motion blur over half a frame, and the AgX view transform."""
    scene = bpy.context.scene
    scene.world = bpy.data.worlds.new('world')
    scene.world.use_nodes = True
    background = next(n for n in scene.world.node_tree.nodes if n.type == 'BACKGROUND')
    background.inputs['Color'].default_value = (world, world, world, 1)

    scene.render.engine = 'CYCLES'
    print('Cycles device:', _use_gpu(scene), flush=True)
    c = scene.cycles
    c.samples = samples
    c.use_adaptive_sampling = True
    c.adaptive_threshold = 0.04
    c.use_denoising = True
    c.max_bounces = 4

    r = scene.render
    r.resolution_x, r.resolution_y, r.resolution_percentage = width, width * 9 // 16, 100
    r.fps = fps
    r.film_transparent = True
    r.use_motion_blur = True
    r.motion_blur_shutter = 0.5
    r.use_persistent_data = True
    r.image_settings.file_format = 'PNG'
    r.image_settings.color_mode = 'RGBA'

    scene.view_settings.view_transform = 'AgX'
    for look in ('AgX - Medium High Contrast', 'Medium High Contrast'):
        try:
            scene.view_settings.look = look
            break
        except TypeError:
            pass
    return scene


def flat_mode(black_materials=()):
    """The silhouette look: every mesh flat white, except meshes whose first material is named in black_materials,
    which go flat black. Text objects are hidden. No shading, no denoising, no tone mapping."""
    def emission(name, level):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        nodes = m.node_tree.nodes
        nodes.clear()
        glow = nodes.new('ShaderNodeEmission')
        glow.inputs['Color'].default_value = (level, level, level, 1)
        m.node_tree.links.new(glow.outputs[0], nodes.new('ShaderNodeOutputMaterial').inputs['Surface'])
        return m

    white, black = emission('flat white', 1.0), emission('flat black', 0.0)
    for obj in bpy.data.objects:
        if obj.type == 'FONT':
            obj.hide_render = True
        elif obj.type == 'MESH' and obj.data.materials:
            base = obj.data.materials[0].name.split('.')[0]
            obj.data.materials[0] = black if base in black_materials else white
    scene = bpy.context.scene
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    scene.cycles.use_denoising = False
    scene.cycles.use_adaptive_sampling = False
    scene.cycles.filter_width = 1.5
    scene.render.dither_intensity = 0


def keyframe(objects, frame):
    """Key location, rotation and scale. A quaternion that flipped sign since the last key is flipped back, so the
    rotation between keys takes the short way round."""
    for obj in objects:
        q = obj.rotation_quaternion.copy()
        last = obj.get('_last_q')
        if last is not None and Quaternion(last).dot(q) < 0:
            obj.rotation_quaternion = Quaternion((-q.w, -q.x, -q.y, -q.z))
        obj['_last_q'] = list(obj.rotation_quaternion)
        for path in ('location', 'rotation_quaternion', 'scale'):
            obj.keyframe_insert(path, frame=frame)


def render(setf, animated, end, fps, out, times=()):
    """Call setf(t) for every frame of `end` seconds, key the animated objects, then render the frames.

    setf poses the scene for time t. animated lists every object setf moves, the camera included.
    """
    scene = bpy.context.scene
    count = max(1, round(end * fps))
    prefs = bpy.context.preferences.edit
    old = prefs.keyframe_new_interpolation_type
    prefs.keyframe_new_interpolation_type = 'LINEAR'   # keys on every frame; straight lines between them
    for f in range(1, count + 2):                       # one extra key so the last frame has motion blur
        setf((f - 1) / fps)
        keyframe(animated, f)
    prefs.keyframe_new_interpolation_type = old
    scene.frame_start, scene.frame_end = 1, count

    wanted = sorted({min(count, max(1, round(t * fps) + 1)) for t in times}) if times else range(1, count + 1)
    os.makedirs(out, exist_ok=True)
    for f in wanted:
        path = os.path.join(out, f'{f:04d}.png')
        if os.path.isfile(path) and os.path.getsize(path):
            continue
        scene.frame_set(f)
        scene.render.filepath = path
        bpy.ops.render.render(write_still=True)
        print('FRAME', f, flush=True)
