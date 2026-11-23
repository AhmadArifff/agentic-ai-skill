"""Turn a signed distance function into a smooth quad mesh, for products that have no 3D model.

Plain Python with numpy and scipy; it does not run inside Blender. Describe the shape as f(x, y, z) -> distance,
negative inside, using numpy arrays, then call

    nets(f, lo=(x0, y0, z0), hi=(x1, y1, z1), step=0.01, name='body', out='mesh')

which writes mesh/body.npz with `v` (vertices, float32, n x 3) and `f` (quads, int32, m x 4, counter-clockwise seen
from outside). kit.load_npz() reads it in Blender and the asset skill's mesh_export.py writes it as GLB and OBJ.

The mesher is surface nets: one vertex per grid cell the surface passes through, placed at the average of the points
where the surface crosses that cell's edges, and one quad around every grid edge the surface crosses.

Shapes are y-up. The helpers below build the usual parts: smooth unions and cuts, ellipsoids, rounded bars,
superellipsoid recesses, and outlines spun round an axis.
"""
import os

import numpy as np
from scipy.ndimage import map_coordinates


# ---- combining shapes ---------------------------------------------------------------------------------------------

def smin(a, b, k):
    """Union of two shapes with a fillet about k wide where they meet."""
    h = np.maximum(k - np.abs(a - b), 0) / k
    return np.minimum(a, b) - h * h * k * 0.25


def smax(a, b, k):
    """Intersection with a fillet. smax(shape, -hole, k) cuts hole out of shape with a soft edge."""
    return -smin(-a, -b, k)


# ---- parts --------------------------------------------------------------------------------------------------------

def ellipsoid(x, y, z, rx, ry, rz):
    """An ellipsoid centred on the origin (a close approximation of the true distance near the surface)."""
    scaled = np.sqrt((x / rx) ** 2 + (y / ry) ** 2 + (z / rz) ** 2)
    grad = np.sqrt((x / rx ** 2) ** 2 + (y / ry ** 2) ** 2 + (z / rz ** 2) ** 2) + 1e-9
    return scaled * (scaled - 1) / grad


def extrude(d2, along, start, end):
    """Extend a 2D distance d2 (computed across the other two axes) between start and end on one axis."""
    half = (end - start) / 2
    out_of_range = np.abs(along - (start + end) / 2) - half
    return np.minimum(np.maximum(d2, out_of_range), 0) + np.hypot(np.maximum(d2, 0), np.maximum(out_of_range, 0))


def pill(x, y, z, y0, y1, a, b):
    """An upright bar from y0 to y1: across x it is 2a wide, across z 2b deep, with round sides of radius b."""
    across = np.hypot(np.maximum(np.abs(x) - (a - b), 0), z) - b
    return extrude(across, y, y0, y1)


def rounded_pocket(x, y, z, a, b, ry, p=3.2):
    """A squarish scoop: a superellipse a x b across x and z (higher p is boxier), rounded to depth ry along y."""
    ring = (np.abs(x / a) ** p + np.abs(z / b) ** p) ** (1 / p)
    return (np.sqrt(ring ** 2 + (y / ry) ** 2) - 1) * 0.8 * min(a, b, ry)


def polygon_2d(u, v, points):
    """Signed distance from (u, v) to a closed polygon, negative inside."""
    pts = np.asarray(points, float)
    u, v = np.broadcast_arrays(np.asarray(u, float), np.asarray(v, float))
    nearest = np.full(u.shape, np.inf)
    crossings = np.zeros(u.shape, bool)
    for (ax, ay), (bx, by) in zip(pts, np.roll(pts, -1, axis=0)):
        ex, ey = bx - ax, by - ay
        px, py = u - ax, v - ay
        s = np.clip((px * ex + py * ey) / (ex * ex + ey * ey + 1e-18), 0, 1)
        nearest = np.minimum(nearest, (px - s * ex) ** 2 + (py - s * ey) ** 2)
        straddles = (ay > v) != (by > v)   # a ray towards +u crosses this edge
        with np.errstate(divide='ignore', invalid='ignore'):
            hit_u = ax + (v - ay) * ex / (ey if ey else 1e-18)
        crossings ^= straddles & (u < hit_u)
    return np.sqrt(nearest) * np.where(crossings, -1.0, 1.0)


def chaikin(points, n=4):
    """Round a profile's corners by cutting each one n times. The first two and last two points stay put."""
    pts = np.asarray(points, float)
    for _ in range(n):
        middle = []
        for p, q in zip(pts[1:-2], pts[2:-1]):
            middle += [0.75 * p + 0.25 * q, 0.25 * p + 0.75 * q]
        pts = np.array([pts[0], pts[1], *middle, pts[-2], pts[-1]])
    return pts


def revolve(profile, rmax=1.5, zmin=-1.5, zmax=1.5, res=600):
    """Spin a closed (radius, height) outline round the z axis: bottles, caps, bells, buttons.

    Returns f(x, y, z). The outline's distance is tabulated once on a res x res grid covering radius 0..rmax and
    height zmin..zmax, then read back with bilinear interpolation.
    """
    r = np.linspace(0, rmax, res)
    h = np.linspace(zmin, zmax, res)
    table = polygon_2d(*np.meshgrid(r, h, indexing='ij'), profile)

    def f(x, y, z):
        radius, height = np.broadcast_arrays(np.hypot(x, y), z)
        coords = [(radius / rmax * (res - 1)).ravel(), ((height - zmin) / (zmax - zmin) * (res - 1)).ravel()]
        return map_coordinates(table, coords, order=1, mode='nearest').reshape(radius.shape).astype(np.float32)

    return f


# ---- the mesher ---------------------------------------------------------------------------------------------------

def _cell_ids(shape, index):
    return np.ravel_multi_index(index, shape)


def nets(fn, lo, hi, step, name, out='mesh'):
    axes = [np.arange(lo[n], hi[n] + step * 0.5, step, dtype=np.float32) for n in range(3)]
    field = np.asarray(fn(*np.meshgrid(*axes, indexing='ij', sparse=True)), np.float32)
    field = np.broadcast_to(field, tuple(len(a) for a in axes))
    inside = field < 0
    cells = tuple(n - 1 for n in field.shape)
    total = np.zeros((int(np.prod(cells)), 3))
    count = np.zeros(int(np.prod(cells)))
    edges = []

    for axis in range(3):
        lead = [slice(None)] * 3
        lead[axis] = slice(0, -1)
        tail = [slice(None)] * 3
        tail[axis] = slice(1, None)
        a, b = field[tuple(lead)], field[tuple(tail)]
        flips = np.argwhere(inside[tuple(lead)] != inside[tuple(tail)])
        if not len(flips):
            continue
        fa, fb = a[tuple(flips.T)], b[tuple(flips.T)]
        frac = np.clip(fa / (fa - fb), 0, 1)
        point = np.stack([axes[n][flips[:, n]] for n in range(3)], axis=1).astype(np.float64)
        point[:, axis] += frac * step

        others = [(axis + 1) % 3, (axis + 2) % 3]   # cyclic, so the corner order below winds round +axis
        for d1 in (0, -1):
            for d2 in (0, -1):
                idx = flips.copy()
                idx[:, others[0]] += d1
                idx[:, others[1]] += d2
                ok = np.all((idx >= 0) & (idx < np.array(cells)), axis=1)
                ids = _cell_ids(cells, tuple(idx[ok].T))
                np.add.at(total, ids, point[ok])
                np.add.at(count, ids, 1)
        edges.append((axis, others, flips, inside[tuple(flips.T)]))

    used = count > 0
    vertex_of = np.full(len(count), -1, np.int64)
    vertex_of[used] = np.arange(used.sum())
    verts = (total[used] / count[used, None]).astype(np.float32)

    quads = []
    for axis, (b, c), flips, starts_inside in edges:
        corners = []
        for db, dc in ((-1, -1), (0, -1), (0, 0), (-1, 0)):   # counter-clockwise round +axis
            idx = flips.copy()
            idx[:, b] += db
            idx[:, c] += dc
            corners.append(idx)
        ok = np.ones(len(flips), bool)
        for idx in corners:
            ok &= np.all((idx >= 0) & (idx < np.array(cells)), axis=1)
        ring = np.stack([vertex_of[_cell_ids(cells, tuple(idx[ok].T))] for idx in corners], axis=1)
        # The surface faces away from the inside: +axis when the edge starts inside, -axis when it ends inside.
        ring[~starts_inside[ok]] = ring[~starts_inside[ok]][:, ::-1]
        quads.append(ring)

    faces = np.concatenate(quads).astype(np.int32) if quads else np.zeros((0, 4), np.int32)
    os.makedirs(out, exist_ok=True)
    np.savez(os.path.join(out, name + '.npz'), v=verts, f=faces)
    print(f'{name}: {len(verts)} vertices, {len(faces)} quads')
    return verts, faces
