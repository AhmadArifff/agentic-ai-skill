# Reports what the Blender path can use on this machine: version, render device, and the add-ons that matter for assets.
# Run it with the user's own settings (no --factory-startup), so their add-ons and extensions are loaded:
#   blender -b -P check_blender.py
import bpy, addon_utils
print('BLENDER', bpy.app.version_string, flush=True)
pr = bpy.context.preferences.addons['cycles'].preferences; device = 'CPU'
for kind in ('OPTIX', 'CUDA', 'METAL', 'HIP', 'ONEAPI'):
    try:
        pr.compute_device_type = kind; pr.get_devices()
        ds = [d.name for d in pr.devices if d.type == kind]
        if ds: device = f'{kind}: {", ".join(ds)}'; break
    except Exception: pass
print('DEVICE', device, flush=True)
enabled = {a.module for a in bpy.context.preferences.addons}
installed = {m.__name__ for m in addon_utils.modules()}
def find(*words): return sorted(m for m in installed | enabled if any(w in m.lower() for w in words))
for label, words in (('MPFB (human characters)', ('mpfb',)), ('Blender MCP add-on', ('mcp',)), ('Rigify', ('rigify',))):
    hits = find(*words)
    print('ADDON', label + ':', ', '.join(f'{h} ({"on" if h in enabled else "off"})' for h in hits) if hits else 'not installed', flush=True)
