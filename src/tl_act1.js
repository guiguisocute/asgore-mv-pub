// Act one · the barrier (silent, 0 – T.m1). The game's barrier room, seen as the game
// sees it: unlit, looking straight down the barrier tube from its axis, so the voxel set
// reads as the flat picture. Frisk stands near, Asgore deeper in the tube (each scaled so
// the picture keeps the game's sizes), which the front view hides. The lines from
// 「这就是结界。」 to 「准备好了？」, the 继续 / 回去 prompt, he turns, the containers rise.
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, H = MV.H, LAY = MV.LAY, TB = MV.TUBE;
  MV.sections.push(() => {
    const [ax, ay, az, ak] = LAY.asg, [fx, fy, fz, fk] = LAY.frisk;
    TL.asg.set(0, { x: ax, y: ay, z: az, sc: ak, a: 1 });
    TL.frisk.set(0, { x: fx, y: fy, z: fz, sc: fk, a: 1 });
    // the eye on the tube's axis; the framed plane is Frisk's depth (h 480 = the game's frame)
    MV.ACT1_CAM = { x: 0, y: TB.AXY, z: TB.EYEZ - TB.F, fov: TB.FOV, h: 480, yaw: 0, pitch: 0, roll: 0 };
    TL.cam.set(0, MV.ACT1_CAM);
    // a slow zoom over the whole act (the eye stays put: fov and framing shrink together)
    const fov1 = TB.FOV - 1.6, h1 = 2 * TB.F * Math.tan((fov1 / 2) * Math.PI / 180);
    H.cam(0, T.m1, { fov: fov1, h: h1 }, 'lin');
    H.look(0, 1.6, { fade: 0 }, 'out');

    const V = { voice: 'VoiceAsg' };
    H.say(1.4, 3.7, '这就是结界。', V);
    H.say(3.9, 7.1, ['这就是我们被囚禁', '在地下世界的原因。'], V);
    H.say(7.3, 10.2, ['……如果你碰巧有什么', '未完成的，'], V);
    H.say(10.4, 12.7, '就请去做你必须做的吧。', V);
    H.choice(12.9, 15.0, ['继续', '回去'], { pick: 0, from: 0, tMove: 13.0, tSel: 14.3 });
    H.say(15.2, 17.5, '……我明白了……', V);
    H.say(17.7, 19.5, '那么，就这样吧。', V);

    // he turns to face Frisk
    TL.asgFace.set(19.7, 'down');
    H.sfx(19.7, 'Grab', 0.25);
    // the seven containers rise out of the floor together (the game raises them as one row);
    // the empty one is for the seventh soul
    const [, jy, jz, jk] = LAY.jar;
    MV.JARS.forEach((key, i) => {
      const t0 = 20.0 + Math.abs(i - 3) * 0.06;
      TL.jar[key].set(0, { x: LAY.jarX[key] * jk, y: jy, z: jz, a: 1, rise: 0, sc: 2 * jk, glow: 0 });
      TL.jar[key].to(t0, t0 + 1.1, { rise: 1 }, 'out');
      TL.jar[key].to(t0 + 0.8, t0 + 1.6, { glow: 0.3 }, 'out');
    });
    H.sfx(20.0, 'SpearRise', 0.3);
    // 「准备好了？」 with his portrait in the box, mouth moving while he talks (facing down)
    const tReady = 21.7;
    H.say(tReady, T.m1 - 0.05, '准备好了？', Object.assign({ face: 'face0' }, V));
    TL.flags.asgTalk = (t) => t >= tReady && t < tReady + 0.6;
  });
})();
