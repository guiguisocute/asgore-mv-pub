// The cage: the battle box as a voxel cube, for the voxel windows inside the 2D battle
// (bar 71: the flat box swells back into a cube and is broken from inside). Solid edges,
// nothing inside; red cracks in its faces; edges that shatter.
//
// World scale of the battle: 2 units per px of the original screen (box 300, soul 32).
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, M4 = MV.M4, V3 = MV.V3;
  const L = U.lin;

  MV.ARENA = { c: [0, 0, 0], h: 150 };
  const EDGES = [
    [[-1, -1, -1], [1, -1, -1]], [[1, -1, -1], [1, -1, 1]], [[1, -1, 1], [-1, -1, 1]], [[-1, -1, 1], [-1, -1, -1]],
    [[-1, -1, -1], [-1, 1, -1]], [[1, -1, -1], [1, 1, -1]], [[1, -1, 1], [1, 1, 1]], [[-1, -1, 1], [-1, 1, 1]],
    [[-1, 1, -1], [1, 1, -1]], [[1, 1, -1], [1, 1, 1]], [[1, 1, 1], [-1, 1, 1]], [[-1, 1, 1], [-1, 1, -1]],
  ];
  MV.CAGE_EDGES = EDGES;
  // TL.cage: {x,y,z centre, h half size, sx,sy,sz per-axis stretch, a, edge (brightness),
  // w (bar thickness), pulse}
  TL.cage.init = Object.assign(TL.cage.init, { h: MV.ARENA.h, sx: 1, sy: 1, sz: 1, w: 9, edge: 1, pulse: 0, panel: 0 });
  const EDGE_COL = L('#e2e1ec');
  // TL.aura: the colour of the soul being drawn on (r, g, b linear, k amount) tints the cage
  // edges and the floor's glow
  TL.aura = new MV.Track({ r: 1, g: 1, b: 1, k: 0 });
  MV.cageBox = (t) => { const c = TL.cage.at(t); return { c: [c.x, c.y, c.z], hx: c.h * c.sx, hy: c.h * c.sy, hz: c.h * c.sz, a: c.a }; };
  MV.ACTORS.push((V, t) => {
    const c = TL.cage.at(t);
    if (c.a <= 0.001) return;
    const au = TL.aura.at(t);
    const hx = c.h * c.sx, hy = c.h * c.sy, hz = c.h * c.sz;
    const toW = (p) => [c.x + p[0] * hx, c.y + p[1] * hy, c.z + p[2] * hz];
    const e = (0.12 + c.pulse * 0.6 + au.k * 0.25) * c.edge;
    const col = U.mix3(EDGE_COL, [au.r, au.g, au.b], au.k * 0.7);
    // a dark pane on the back face while the box is a text box (act three)
    if (c.panel > 0.001) V.box(c.x, c.y, c.z - hz, 2 * hx, 2 * hy, 4, [0.004, 0.003, 0.006], 0, c.a * c.panel);
    // the edges; broken edges (TL.cageBreak: fn(t) -> per-edge 0..1) fall apart into pieces
    const br = TL.cageBreak ? TL.cageBreak(t) : null;
    EDGES.forEach((ed, i) => {
      const a = toW(ed[0]), b = toW(ed[1]);
      const k = br ? br[i] : 0;
      if (k <= 0) {
        const mid = V3.lerp(a, b, 0.5), d = V3.sub(b, a);
        V.box(mid[0], mid[1], mid[2], Math.abs(d[0]) + c.w, Math.abs(d[1]) + c.w, Math.abs(d[2]) + c.w, col, e, c.a);
        return;
      }
      // shattered: 8 pieces flying outward from the cage centre, tumbling, shrinking
      const n = 8, out = V3.norm(V3.sub(V3.lerp(a, b, 0.5), [c.x, c.y, c.z]));
      for (let j = 0; j < n; j++) {
        const p = V3.lerp(a, b, (j + 0.5) / n), r = U.hash(i * 13 + j * 7.7);
        const fly = k * (260 + r * 380), up = k * (120 * r) - 600 * k * k * (0.4 + r);
        const q = [p[0] + out[0] * fly + (r - 0.5) * 80 * k, p[1] + out[1] * fly + up, p[2] + out[2] * fly];
        const s = (V3.len(V3.sub(b, a)) / n) * (1 - 0.7 * k);
        V.box(q[0], q[1], q[2], s * (0.6 + r * 0.4), c.w, c.w, col, e + 0.5 * (1 - k), c.a * (1 - U.smooth(U.clamp((k - 0.7) / 0.3))));
      }
    });
    // cracks of red light in the faces (the soul's determination pushing out): TL.cageCrack(t)
    // -> list of {f: face 0..5, pts: [[u, v]...] in -1..1, k}
    if (TL.cageCrack) for (const cr of TL.cageCrack(t)) {
      const F = FACES[cr.f], red = L('#ff2a2a');
      for (let j = 0; j + 1 < cr.pts.length; j++) {
        const p0 = F(cr.pts[j]), p1 = F(cr.pts[j + 1]);
        const P0 = toW(p0), P1 = toW(p1);
        V.seg(P0, P1, 3.2, red, 1.4 * cr.k, c.a * U.clamp(cr.k * 3), 5);
      }
    }
  });
  // face (u, v) -> unit-cube point: 0 front (+z), 1 back, 2 left, 3 right, 4 top, 5 bottom
  const FACES = [(q) => [q[0], q[1], 1], (q) => [-q[0], q[1], -1], (q) => [-1, q[1], q[0]], (q) => [1, q[1], -q[0]], (q) => [q[0], 1, -q[1]], (q) => [q[0], -1, q[1]]];
})();
