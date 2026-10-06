// Battle Asgore's puppet data: the sheet's body parts (cape, legs, belt, torso, head,
// feet, arms, fists) placed like the game composes him (offsets fitted against the
// recording, tools/fit_puppet.py), and his trident. Drawn by src/stage.js at 2x.
//
// Composite space: sprite px, origin = cape left / head top; the puppet's own origin is the
// centre of the feet line (79.5, 118). rot: radians, counter-clockwise, about the part's
// top-left corner. z: the parts' depth order (larger = in front).
(function () {
  const MV = window.MV, TL = MV.TL;

  MV.BOSS_PARTS = {
    cape: { img: 'cape0', x: 0, y: 33, z: -16 },
    legs: { img: 'legs', x: 48, y: 86, z: -6 },
    belt: { img: 'belt', x: 47, y: 60, z: -2 },
    torso: { img: 'torso', x: 22, y: 20, z: 2 },
    head: { img: 'head', x: 56, y: 2, z: 9 },
    feet: { img: 'feet', x: 37, y: 109, z: 4 },
    // battle arms (idle: the trident held diagonally across the body)
    armL: { img: 'arm1', x: 16.5, y: 39, z: 12, rot: 0.12, plain: true }, // under the upper fist: a plain outline (the recording)
    armR: { img: 'arm0', x: 112, y: 52, z: 12, rot: -0.1 },
    fistL: { img: 'fistL', x: 29, y: 31.5, z: 20, rot: -0.45 },
    fistR: { img: 'fistR', x: 104, y: 67, z: 20, rot: -0.45 },
  };
  // the trident in the idle pose: its butt (the pivot, sprite row 31 of 'spear') beyond the
  // upper fist, 25.25 deg down to the right, the sprite at the game's own 2x; both fists grip
  // it at the middle of the shaft. Fitted on the recording with landmarks (horn tips, feet:
  // 2.98 x 2.92 recording px per game px): butt at world (332, 80), ring at (633, 220)
  // (tools/fit_puppet.py)
  MV.TRIDENT_IDLE = { x: 5.5, y: 27.8, rot: -0.4407, sc: 1 };

  // TL.bossPose: 'intro' (no arms) | 'idle' (the trident) | 'f:<frame>' (a whole original frame:
  // brandish0..13, flashSil, kneel) | 'none'
  // TL.trident: on, x, y (pivot, composite space), rot, sc, len (stretch along the shaft), free
  // (drawn with any pose), glow, ghost (afterimages)
  TL.trident = new MV.Track(Object.assign({ on: 0, len: 1, free: 0, glow: 0, ghost: 0 }, MV.TRIDENT_IDLE));
  TL.tridentCol = new MV.Steps(null); // a soul's hex while it lends its power, else the red
})();
