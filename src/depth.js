// Depth on the diorama. src/post2d.js films four flat planes at fixed depths (the walls 900, the
// jars 170, him 110, the battle 0) with a real 3D camera, each plane enlarged to make up for its
// distance, so that at home the picture is the game's pixel for pixel. Something that travels
// between the planes - a gate rushing out of the door at the soul, the soul up on a jar, flying at
// his chest - must be drawn at its own depth or it slides against everything round it as soon as
// the camera turns (user, 2026-10-06: the gates "visually off" against the hall's rings).
// A thing is designed in home picture coordinates (where it is on screen with the camera at home)
// plus a depth z; MV.depthXf(cam, z, zp) gives where to draw it on the plane at depth zp under the
// camera cam: {k, ox, oy} - plane px = (ox + k x, oy + k y) (a central projection between parallel
// planes is a similarity: a scale about the camera's foot). At home k = 1, ox = oy = 0.
(function () {
  const MV = window.MV;
  const FOV0 = 0.7, D0 = MV.OH / 2 / Math.tan(FOV0 / 2), C0x = MV.OW / 2, C0y = MV.OH / 2;
  MV.D0 = D0;
  // where the eye is (world px, the battle plane at z = 0), exactly as post2d places it
  MV.camPos = (cam) => {
    const fov = cam.fov || FOV0, dist = MV.OH / 2 / (Math.tan(fov / 2) * (cam.zoom || 1));
    const cp = Math.cos(cam.pitch || 0), sp = Math.sin(cam.pitch || 0), cy = Math.cos(cam.yaw || 0), sy = Math.sin(cam.yaw || 0);
    // (its forward ray: rotY(rotX([0, 0, 1])) = [cp sy, -sp, cp cy])
    return [cam.x - cp * sy * dist, cam.y + sp * dist, -cp * cy * dist];
  };
  MV.depthXf = (cam, z, zp) => {
    const C = MV.camPos(cam), zz = Math.max(z, C[2] + 60); // (never at the eye or behind it)
    const a = (D0 + zz) / D0, m = (zp - C[2]) / (zz - C[2]), b = D0 / (D0 + zp), k = b * m * a;
    return { k, ox: C0x * (1 - k) + b * (1 - m) * (C[0] - C0x), oy: C0y * (1 - k) + b * (1 - m) * (C[1] - C0y) };
  };
  // a point / a drawing at depth z, on the plane zp (S: the frame's state - its camera)
  MV.depthPt = (S, p, z, zp = 0) => { const x = MV.depthXf(S.cam, z, zp); return [x.ox + x.k * p[0], x.oy + x.k * p[1]]; };
  MV.withDepth = (ctx, S, z, zp, fn) => {
    const x = MV.depthXf(S.cam, z, zp);
    ctx.save(); ctx.transform(x.k, 0, 0, x.k, x.ox, x.oy);
    try { fn(x.k); } finally { ctx.restore(); }
  };
  // where a point drawn on the plane at depth z (its home coordinates p) is on the screen (px) under
  // the camera cam - post2d's own camera, for what is drawn on the screen layer over a plane
  MV.toScreen = (cam, p, z = 0) => {
    const fov = cam.fov || FOV0, tanY = Math.tan(fov / 2), tanX = tanY * (MV.OW / MV.OH), dist = MV.OH / 2 / (tanY * (cam.zoom || 1));
    const cp = Math.cos(cam.pitch || 0), sp = Math.sin(cam.pitch || 0), cy = Math.cos(cam.yaw || 0), sy = Math.sin(cam.yaw || 0), cr = Math.cos(cam.roll || 0), sr = Math.sin(cam.roll || 0);
    const rot = (v) => { const w = [v[0], v[1] * cp - v[2] * sp, v[1] * sp + v[2] * cp]; return [w[0] * cy + w[2] * sy, w[1], -w[0] * sy + w[2] * cy]; };
    const Fv = rot([0, 0, 1]), Rv = rot([cr, sr, 0]), Dv = rot([-sr, cr, 0]), s = (D0 + z) / D0;
    const h = [C0x + (p[0] - C0x) * s - (cam.x - Fv[0] * dist), C0y + (p[1] - C0y) * s - (cam.y - Fv[1] * dist), z + Fv[2] * dist];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], f = dot(h, Fv);
    return [MV.OW * (0.5 + dot(h, Rv) / f / tanX / 2), MV.OH * (0.5 + dot(h, Dv) / f / tanY / 2)];
  };
})();
