"""Animation curves for Blender scenes, in plain Python.

mono(keys) passes through every key and never overshoots between two of them (monotone cubic interpolation), so a
move cannot drift backwards and come back. Use one curve for a whole move: joining two curves at a handover leaves a
kink in the speed.

    turn = mono([(0, -1.2), (2.0, 0.2), (4.0, 0.5)])      # (seconds, value)
    path = tracks([(0, (0, -5, 1)), (4.0, (0, -12, 1))])   # several values per key, each with its own curve
    turn(1.0); path(1.0)
"""
from bisect import bisect_right


def _tangents(times, values):
    slopes = [(values[i + 1] - values[i]) / (times[i + 1] - times[i]) for i in range(len(times) - 1)]
    if not slopes:
        return [0.0]
    out = [slopes[0]]
    for left, right in zip(slopes, slopes[1:]):
        # Flat where the curve turns round, otherwise the harmonic mean of the two slopes (Fritsch and Carlson).
        out.append(0.0 if left * right <= 0 else 2 * left * right / (left + right))
    out.append(slopes[-1])
    return out


def mono(keys):
    keys = sorted(keys)
    times = [float(k[0]) for k in keys]
    values = [float(k[1]) for k in keys]
    tangents = _tangents(times, values)

    def at(t):
        if t <= times[0]:
            return values[0]
        if t >= times[-1]:
            return values[-1]
        i = bisect_right(times, t) - 1
        span = times[i + 1] - times[i]
        u = (t - times[i]) / span
        u2, u3 = u * u, u * u * u
        return ((2 * u3 - 3 * u2 + 1) * values[i] + (u3 - 2 * u2 + u) * span * tangents[i]
                + (3 * u2 - 2 * u3) * values[i + 1] + (u3 - u2) * span * tangents[i + 1])

    return at


def tracks(keys):
    width = len(keys[0][1])
    curves = [mono([(t, v[n]) for t, v in keys]) for n in range(width)]
    return lambda t: [curve(t) for curve in curves]


def smooth(x):
    """0 to 1 with an eased start and end, clamped outside 0..1."""
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


sm = smooth   # older scenes call it sm
