"""A small complete Blender scene: a white speaker with a dark band rises, turns and settles under one light while the
camera eases in. Copy it next to your assets and replace the object.

Build the meshes first (plain Python), then render (Blender with no window):

    python3 example_scene.py mesh
    blender -b -P example_scene.py -- frames 1280 24 [flat] [times...]
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
MESH = os.path.join(HERE, 'example_mesh')
END, FPS = 4.0, 25

if len(sys.argv) > 1 and sys.argv[1] == 'mesh':
    import numpy as np
    import mesh_from_sdf as sdf

    # The outline of half the speaker as (radius, height), spun round its upright axis. The shapes are y-up.
    outline = sdf.chaikin(np.array([(0, -0.62), (0.5, -0.62), (0.6, -0.5), (0.63, 0.25), (0.5, 0.58), (0.2, 0.66), (0, 0.66)]), 4)
    spun = sdf.revolve(outline, rmax=0.8, zmin=-0.8, zmax=0.8, res=500)

    def body(x, y, z):
        return spun(x, z, y)

    def band(x, y, z):
        surface = body(x, y, z)
        shell = np.maximum(surface - 0.008, -(surface + 0.02))   # a thin skin just over the body
        return np.maximum(shell, np.abs(y + 0.12) - 0.16)          # only round the lower middle

    sdf.nets(body, (-0.75, -0.75, -0.75), (0.75, 0.8, 0.75), 0.01, 'body', MESH)
    sdf.nets(band, (-0.75, -0.35, -0.75), (0.75, 0.1, 0.75), 0.008, 'band', MESH)
    sys.exit()

import kit
import tracks
from mathutils import Euler

OUT, WIDTH, SAMPLES, FLAT, TIMES = kit.args()
kit.fresh()
kit.setup(WIDTH, SAMPLES, FPS)

white = kit.mat('white', (0.85, 0.85, 0.84), rough=0.25, coat=0.5, sss=0.1)
dark = kit.mat('dark', (0.015, 0.015, 0.018), rough=0.7)
upright = kit.empty('upright')
upright.rotation_quaternion = Euler((math.pi / 2, 0, 0)).to_quaternion()   # y-up meshes into Blender's z-up
speaker = kit.empty('speaker', upright)
kit.load_npz(os.path.join(MESH, 'body.npz'), white, speaker)
kit.load_npz(os.path.join(MESH, 'band.npz'), dark, speaker, smooth=4)

cam = kit.camera()
cam.data.lens = 80
kit.key_light((-9, -8, 10), size=(6, 8), power=3800)
if FLAT:
    kit.flat_mode(black_materials=('dark',))

# Every curve only moves one way, so nothing turns back on itself.
lift = tracks.mono([(0, -0.5), (1.6, 0.05), (END, 0.1)])
spin = tracks.mono([(0, -1.4), (2.4, 0.15), (END, 0.35)])
eye = tracks.tracks([(0, (1.2, -9.5, 1.6)), (2.0, (0.5, -6.6, 1.0)), (END, (0.2, -5.8, 0.8))])


def pose(t):
    speaker.location = (0, lift(t), 0)   # in the upright parent, y is up
    speaker.rotation_quaternion = Euler((0, spin(t), 0), 'XYZ').to_quaternion()
    kit.look_at(cam, eye(t), (0, 0, 0.05))


kit.render(pose, [speaker, cam], END, FPS, OUT, TIMES)
