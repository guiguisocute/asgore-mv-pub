// The 2D battle's stage rebuilt in voxels, for the voxel windows of act four (the FEZ turn at
// bar 30). Same picture as the 2D diorama when the voxel camera is MV.FLAT_CAM (2 units per
// px, y up, the battle plane at z = 0, depth pressed flat); turn the camera and it is a real
// stage: he stands behind the box, the containers behind him on their pedestals. Sprites stand
// as reliefs that turn to face the camera (HD-2D's standing pictures), so from the side they are
// still pictures, not cardboard.
//   TL.vStage {a: the stage lit 0..1 (him, the jars, the pedestals), kingZ, jarZ}
//   TL.kingVox (Steps): the time whose pose his relief is built from (null: not there)
//   the box: TL.cage (src/cage.js); the soul: TL.soul / TL.soulMode (src/actors.js)
(function () {
  const MV = window.MV, TL = MV.TL, U = MV.U, M4 = MV.M4, VX = MV.VX, FL = MV.FL;
  const L = U.lin;
  MV.VPX = 2; // voxel units per world px
  // (ped: the pedestals under the jars - off where another room stands round them)
  TL.vStage = new MV.Track({ a: 0, kingZ: -2 * MV.PLANE_Z.king, jarZ: -2 * MV.PLANE_Z.mid, ped: 1 });
  TL.kingVox = new MV.Steps(null);
  // world px (2D) -> voxel point at depth z
  MV.v3 = (x, y, z = 0) => { const [vx, vy] = MV.toVox(x, y); return [vx, vy, z]; };
  // turned to face the camera's eye (0 at the flat front view, whose eye is far down +z)
  MV.billboard = (S, x, z) => Math.atan2(S.cam.eye[0] - x, S.cam.eye[2] - z);

  // his relief: the puppet as it stands at time tk, voxelized once (the line art proud of the fill)
  const kingMap = VX.mapLineArt({ fill: '#0b0910', line: '#e9e6f0', raise: 1.2 });
  const kingModel = (tk) => MV.MODEL('kingVox:' + tk.toFixed(3), () => {
    const c = MV.kingSnapshot(tk);
    return VX.sprite(c, { s: 2 * MV.VPX, ax: c.width / 2, ay: c.height - 8, base: 1.5, k: 0.35, max: 5, round: 6, map: kingMap });
  });
  const STONE = L('#251d31');
  MV.ACTORS.push((V, t, S) => {
    const st = TL.vStage.at(t);
    if (st.a <= 0.001) return;
    const a = st.a, tint = [a, a, a, 1];
    const tk = TL.kingVox.at(t);
    if (tk !== null) {
      const [x, y] = MV.toVox(FL.king[0], FL.king[1]);
      V.draw(kingModel(tk), { m: M4.mul(M4.trans(x, y, st.kingZ), M4.ry(MV.billboard(S, x, st.kingZ))), tint, shadow: false });
    }
    // the containers on their pedestals (stone columns down into the dark)
    MV.JARS.forEach((key, i) => {
      const s = TL.jar[key].at(t);
      if (s.a <= 0.001) return;
      const [x, y] = MV.toVox(...MV.jarAt(key, t)), z = st.jarZ - Math.abs(x) * 0.18;
      const f = Math.floor(t * 5 + i * 1.3) % 4;
      V.draw(MV.jarModel(key, f, s.empty > 0.5), { m: M4.mul(M4.trans(x, y, z), M4.mul(M4.ry(MV.billboard(S, x, z)), M4.scale(2 * MV.VPX / 2 * 2))), tint, emi: s.glow * (key === 'empty' ? 0.2 : 0.8), shadow: false });
      const ph = y - MV.toVox(0, FL.fireY + 30)[1];
      if (st.ped > 0.5) V.box(x, y - ph / 2 - 2, z, 76, ph, 60, STONE.map((v) => v * a), 0, 1);
    });
  });
  // a sprite (canvas) as a voxel model, px world px per sprite px
  MV.vSprite = (key, img, px = 2, o = {}) => MV.MODEL('vspr:' + key + ':' + px, () => VX.sprite(img, Object.assign({ s: px * MV.VPX, ax: img.width / 2, ay: img.height / 2, base: 1, k: 0.5, max: 3, round: 2, map: VX.mapColor() }, o)));
  // draw one at a voxel point, facing the camera; o: {rot (about the view axis), flip, sc, a, emi}
  MV.vDraw = (V, S, model, p, o = {}) => {
    const yaw = MV.billboard(S, p[0], p[2]) + (o.flip ? Math.PI : 0);
    V.draw(model, { m: M4.mul(M4.trans(p[0], p[1], p[2]), M4.mul(M4.ry(yaw), M4.mul(M4.rz(-(o.rot || 0)), M4.scale(o.sc ?? 1)))), tint: [1, 1, 1, o.a ?? 1], emi: o.emi ?? 0.1, shadow: false });
  };
})();
