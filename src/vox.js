// Voxel renderer (WebGL2). Everything on screen is a box: static models (voxelized
// sprites, uploaded once, drawn with a model matrix) and per-frame dynamic boxes
// (bullets, particles, lattice dots). One directional key light with a shadow map,
// hemisphere ambient, baked per-voxel AO, emissive voxels, distance fog, then HDR
// bloom, a soft tone curve with a capped white, and an average-luminance limiter
// (no full-screen white: see README «画面规则»). A 2D overlay canvas (dialogue,
// narration) is composited last.
//
// World: x right, y up, z toward the default camera; 1 unit = 1 px of the original
// 640x480 screen (enemy sprites are 2 units per sprite px, like the game's 2x).
(function () {
  const MV = window.MV, U = MV.U;

  // ---------------------------------------------------------------- math
  const V3 = (MV.V3 = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    len: (a) => Math.hypot(a[0], a[1], a[2]),
    norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
    lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
  });
  // column-major 4x4
  const M4 = (MV.M4 = {
    id: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    mul(a, b) {
      const o = new Array(16);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
        o[i * 4 + j] = s;
      }
      return o;
    },
    persp(fovy, asp, n, f) {
      const t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f);
      return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0];
    },
    ortho(l, r, b, t, n, f) {
      return [2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0, -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1];
    },
    look(e, c, up) {
      const z = V3.norm(V3.sub(e, c)), x = V3.norm(V3.cross(up, z)), y = V3.cross(z, x);
      return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -V3.dot(x, e), -V3.dot(y, e), -V3.dot(z, e), 1];
    },
    trans: (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1],
    scale: (x, y = x, z = x) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1],
    rx(a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; },
    ry(a) { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; },
    rz(a) { const c = Math.cos(a), s = Math.sin(a); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; },
    // translate * rz * ry * rx * scale, the usual node transform
    trs(p, r = [0, 0, 0], s = 1) {
      let m = M4.trans(p[0], p[1], p[2]);
      if (r[2]) m = M4.mul(m, M4.rz(r[2]));
      if (r[1]) m = M4.mul(m, M4.ry(r[1]));
      if (r[0]) m = M4.mul(m, M4.rx(r[0]));
      if (s !== 1) m = M4.mul(m, Array.isArray(s) ? M4.scale(s[0], s[1], s[2]) : M4.scale(s));
      return m;
    },
    apply(m, p) {
      return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
    },
  });

  // ---------------------------------------------------------------- camera
  // c: {x,y,z target, yaw, pitch, roll (rad), fov (deg), h: world height framed at the
  // target}. The eye distance follows from h and fov, so animating fov is a dolly zoom:
  // fov -> 1 deg looks orthographic (act one reads as flat 2D), wider reveals depth.
  MV.camera = (c, aspect) => {
    const fov = U.clamp(c.fov ?? 35, 0.3, 120) * Math.PI / 180;
    const dist = (c.h ?? 540) / 2 / Math.tan(fov / 2);
    const cp = Math.cos(c.pitch || 0), sp = Math.sin(c.pitch || 0);
    // forward (from eye to target): yaw 0 looks toward -z; pitch < 0 looks down
    const f = [-Math.sin(c.yaw || 0) * cp, sp, -Math.cos(c.yaw || 0) * cp];
    const tgt = [c.x || 0, c.y || 0, c.z || 0];
    const eye = V3.sub(tgt, V3.mul(f, dist));
    const r0 = V3.norm(V3.cross(f, [0, 1, 0])), u0 = V3.cross(r0, f);
    const ro = c.roll || 0;
    const up = V3.add(V3.mul(u0, Math.cos(ro)), V3.mul(r0, Math.sin(ro)));
    // (far reaches past the whole barrier tube: its end must never show; near stays off the eye
    // so the depth buffer keeps its precision that far out)
    const near = c.near || Math.max(30, dist - 3000), far = c.far || dist + 40000;
    // flat < 1 presses the whole world along z onto the cage's plane (z = 0) before the camera
    // sees it (act two's last bar: the space is compressed into the 2D battle)
    const view = c.flat !== undefined && c.flat < 1 ? M4.mul(M4.look(eye, tgt, up), M4.scale(1, 1, Math.max(c.flat, 0.004))) : M4.look(eye, tgt, up);
    const proj = M4.persp(fov, aspect, near, far);
    return { view, proj, vp: M4.mul(proj, view), eye, tgt, dist, fov, f, right: V3.norm(V3.cross(f, up)), up, near, far };
  };
  // world point -> screen px of a W x H frame (null behind the camera)
  MV.project = (cam, p, W, H) => {
    const m = cam.vp;
    const x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
    const w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
    if (w <= 0) return null;
    return [(x / w * 0.5 + 0.5) * W, (1 - (y / w * 0.5 + 0.5)) * H, w];
  };

  // ---------------------------------------------------------------- shaders
  const HDR = `#version 300 es
`;
  const INST_VS = HDR + `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNrm;
layout(location=2) in vec3 iPos; layout(location=3) in vec3 iSize; layout(location=4) in vec4 iCol; layout(location=5) in vec2 iMisc;
uniform mat4 uVP, uModel, uLightVP;
uniform vec4 uScatter; uniform vec3 uScatterDir; uniform float uSeed; uniform float uSizeMul;
uniform vec4 uTint; uniform float uWallOn, uWallU, uWallUnlit; uniform float uWave[40];
out vec3 vN; out vec4 vCol; out vec3 vW; out vec4 vLS; out vec2 vMisc; out float vH;
float hash(vec3 p){ p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
void main(){
  vec3 c = iPos;
  float h = hash(iPos * 0.37 + uSeed);
  if (uScatter.w != 0.0) {
    // stateless burst / assemble: every voxel flies out from the pivot along its own random
    // direction (amount w in units), biased by uScatterDir
    vec3 r = vec3(hash(iPos * 1.7 + 1.3 + uSeed), hash(iPos * 2.3 + 4.1 + uSeed), hash(iPos * 3.1 + 7.7 + uSeed)) * 2.0 - 1.0;
    vec3 d = normalize(c - uScatter.xyz + r * 24.0 + 0.001);
    c += (d * 0.6 + r * 0.5 + uScatterDir) * uScatter.w * (0.4 + h);
  }
  vec3 sz = iSize * uSizeMul;
  vec4 col = iCol;
  // barrier-room walls: the light wave (iCol = lo, hi, phase lag; uWave = the waveform)
  if (uWallOn > 0.5) {
    float x = fract(uWallU - iCol.b) * 40.0;
    int i0 = int(floor(x)) % 40, i1 = (i0 + 1) % 40;
    float wv = mix(uWave[i0], uWave[i1], fract(x));
    float gv = mix(iCol.r, iCol.g, wv) * 0.98;
    // the game's gray as a linear albedo (unlit, the fragment pass shows it exactly)
    col = vec4(vec3(pow(gv, 2.2) * mix(0.85, 1.0, uWallUnlit)), 0.0);
  }
  vec4 w = uModel * vec4(c + aPos * sz, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(uModel) * aNrm);
  vCol = col; vMisc = iMisc; vH = h;
  vLS = uLightVP * w;
  gl_Position = uVP * w;
}`;
  const INST_FS = HDR + `
precision highp float; precision highp sampler2DShadow;
in vec3 vN; in vec4 vCol; in vec3 vW; in vec4 vLS; in vec2 vMisc; in float vH;
uniform vec4 uTint; uniform vec4 uGlow; uniform vec4 uClip; uniform float uEmi, uDissolve, uUnlit, uShadowOn, uFogStart, uLit, uToneW, uClipSoft;
uniform vec3 uL, uLCol, uSky, uGround, uEye; uniform vec4 uFog;
uniform sampler2DShadow uShadow;
layout(location=0) out vec4 o;
// the inverse of the grade pass's tone curve: unlit things come out exactly their colour
float invTone1(float d) { const float K = 0.78; if (d <= K) return d; d = min(d, uToneW - 0.002); return K - (uToneW - K) * log(1.0 - (d - K) / (uToneW - K)); }
vec3 invTone(vec3 c) { return vec3(invTone1(c.r), invTone1(c.g), invTone1(c.b)); }
float bayer(vec2 p){ ivec2 q = ivec2(mod(p, 4.0)); int i = q.x + q.y * 4;
  int b[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5); return (float(b[i]) + 0.5) / 16.0; }
void main(){
  float a = vMisc.x * uTint.a;
  if (vH < uDissolve || dot(vW, uClip.xyz) < uClip.w) discard;
  if (a < 0.999 && a <= bayer(gl_FragCoord.xy)) discard;
  vec3 n = normalize(vN);
  vec3 alb = vCol.rgb * uTint.rgb;
  float sh = 1.0;
  if (uShadowOn > 0.5) {
    vec3 p = vLS.xyz / vLS.w * 0.5 + 0.5;
    if (p.x > 0.0 && p.x < 1.0 && p.y > 0.0 && p.y < 1.0 && p.z < 1.0) {
      float bias = 0.0015;
      float s = 0.0; vec2 px = vec2(1.0 / 2048.0);
      for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) s += texture(uShadow, vec3(p.xy + vec2(i, j) * px, p.z - bias));
      sh = s / 9.0;
    }
  }
  float ndl = max(dot(n, uL), 0.0);
  // voxel readability: faces get a fixed per-axis shade on top of the light
  float face = abs(n.y) > 0.5 ? (n.y > 0.0 ? 1.0 : 0.62) : (abs(n.x) > 0.5 ? 0.82 : 0.92);
  vec3 amb = mix(uGround, uSky, n.y * 0.5 + 0.5) * vMisc.y;
  vec3 lit = alb * (amb + uLCol * ndl * sh) * face;
  vec3 col = mix(lit * uLit + alb * (1.0 - uLit), alb, uUnlit);
  col += alb * (vCol.a + uEmi) + uGlow.rgb * uGlow.a;
  col = mix(col, invTone(col), uUnlit);
  float d = length(vW - uEye);
  float f = 1.0 - exp(-max(0.0, d - uFogStart) * uFog.a);
  col = mix(col, uFog.rgb, clamp(f, 0.0, 1.0) * (1.0 - clamp(vCol.a, 0.0, 1.0) * 0.5));
  // a soft clip: the surface sinks into black over uClipSoft before the plane (act two's darkness
  // has no hard front)
  if (uClipSoft > 0.0) { float k = smoothstep(0.0, uClipSoft, dot(vW, uClip.xyz) - uClip.w); col *= k * k; }
  o = vec4(col, 1.0);
}`;
  const SHADOW_FS = HDR + `
precision highp float;
in vec3 vN; in vec4 vCol; in vec3 vW; in vec4 vLS; in vec2 vMisc; in float vH;
uniform vec4 uTint; uniform vec4 uClip; uniform float uDissolve;
out vec4 o;
void main(){ if (vH < uDissolve || vMisc.x * uTint.a < 0.5 || dot(vW, uClip.xyz) < uClip.w) discard; o = vec4(1.0); }`;
  const QUAD_VS = HDR + `
const vec2 P[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 vUv;
void main(){ vec2 p = P[gl_VertexID]; vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
  const BG_FS = HDR + `
precision highp float; in vec2 vUv; uniform vec3 uTop, uBot, uGlowCol; uniform float uGlowY, uGlowAmt, uTime; out vec4 o;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec3 c = mix(uBot, uTop, smoothstep(0.0, 1.0, vUv.y));
  float g = exp(-pow(max(0.0, vUv.y - uGlowY) * 3.2, 2.0)) * smoothstep(-0.2, uGlowY + 0.05, vUv.y);
  c += uGlowCol * g * uGlowAmt;
  // (dither against banding - none on a black field: past the gamma it showed as grey speckle,
  // and the 2D battle's black after act two must match it)
  c += (h(floor(vUv * vec2(480.0, 270.0)) + floor(uTime * 12.0)) - 0.5) * 0.006 * smoothstep(0.0, 0.004, max(c.r, max(c.g, c.b)));
  o = vec4(max(c, 0.0), 0.0); // alpha 0 = background (objects write 1): the flash's silhouette mask
}`;
  const BRIGHT_FS = HDR + `
precision highp float; in vec2 vUv; uniform sampler2D uTex; uniform float uTh; out vec4 o;
void main(){ vec3 c = texture(uTex, vUv).rgb; float l = max(c.r, max(c.g, c.b));
  float k = max(0.0, l - uTh) / max(l, 1e-4); o = vec4(c * k, 1.0); }`;
  const DOWN_FS = HDR + `
precision highp float; in vec2 vUv; uniform sampler2D uTex; uniform vec2 uPx; out vec4 o;
void main(){ vec3 c = texture(uTex, vUv + uPx * vec2(-1.0, -1.0)).rgb + texture(uTex, vUv + uPx * vec2(1.0, -1.0)).rgb
  + texture(uTex, vUv + uPx * vec2(-1.0, 1.0)).rgb + texture(uTex, vUv + uPx * vec2(1.0, 1.0)).rgb; o = vec4(c * 0.25, 1.0); }`;
  const UP_FS = HDR + `
precision highp float; in vec2 vUv; uniform sampler2D uTex, uBase; uniform vec2 uPx; out vec4 o;
void main(){
  vec3 c = texture(uTex, vUv).rgb * 4.0;
  c += texture(uTex, vUv + vec2(uPx.x, 0.0)).rgb * 2.0 + texture(uTex, vUv - vec2(uPx.x, 0.0)).rgb * 2.0;
  c += texture(uTex, vUv + vec2(0.0, uPx.y)).rgb * 2.0 + texture(uTex, vUv - vec2(0.0, uPx.y)).rgb * 2.0;
  c += texture(uTex, vUv + uPx).rgb + texture(uTex, vUv - uPx).rgb + texture(uTex, vUv + vec2(uPx.x, -uPx.y)).rgb + texture(uTex, vUv + vec2(-uPx.x, uPx.y)).rgb;
  o = vec4(c / 16.0 + texture(uBase, vUv).rgb, 1.0); }`;
  // grade: bloom add, exposure, soft tone curve with capped white, saturation, vignette,
  // chromatic aberration, colour flash (capped), grain
  const GRADE_FS = HDR + `
precision highp float; in vec2 vUv; uniform sampler2D uScene, uBloom;
uniform float uBloomK, uExposure, uWhite, uSat, uVig, uCA, uGrain, uTime, uFlash, uContrast, uInv;
uniform vec3 uInvCol;
uniform vec3 uFlashCol, uLift, uGain; out vec4 o;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
// exact up to 0.78, then a soft shoulder into uWhite: colours stay the sprites' own, only
// highlights (emissive fire, light) are rolled off
float tone1(float x){ const float K = 0.78; x = max(x, 0.0); return x <= K ? x : K + (uWhite - K) * (1.0 - exp(-(x - K) / (uWhite - K))); }
vec3 tone(vec3 x){ return vec3(tone1(x.r), tone1(x.g), tone1(x.b)); }
void main(){
  vec2 d = vUv - 0.5;
  vec2 off = d * uCA * 0.004;
  vec3 c;
  c.r = texture(uScene, vUv + off).r; c.g = texture(uScene, vUv).g; c.b = texture(uScene, vUv - off).b;
  c += texture(uBloom, vUv).rgb * uBloomK;
  c *= uExposure;
  c = tone(c);
  c = pow(c, vec3(1.0 / 2.2)); // linear -> display (albedos are linear: U.lin)
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, uSat);
  c = (c - 0.5) * uContrast + 0.5;
  c = c * uGain + uLift;
  c = mix(c, uFlashCol, uFlash);
  // the game's intro flash, kept dim: a pale field, everything on it a black silhouette,
  // except the red of the trident
  if (uInv > 0.0) {
    float lv = dot(c, vec3(0.2126, 0.7152, 0.0722));
    bool red = c.r > 0.16 && c.r > c.g * 2.2 && c.r > c.b * 2.0;
    float cov = texture(uScene, vUv).a;
    vec3 iv = red ? c : mix(uInvCol, vec3(0.012), smoothstep(0.25, 0.75, cov));
    c = mix(c, iv, uInv);
  }
  c *= 1.0 - uVig * smoothstep(0.35, 0.95, length(d * vec2(1.0, 0.75)) * 1.3);
  c += (h(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * uGrain;
  o = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;
  // final: average-luminance limiter (top mip), 2D overlay, fade to black, letterbox
  const FINAL_FS = HDR + `
precision highp float; in vec2 vUv; uniform sampler2D uImg, uOv; uniform float uMaxLvl, uCap, uFade, uLetter, uOvA, uWash; out vec4 o;
void main(){
  vec3 c = texture(uImg, vUv).rgb;
  vec3 avg = vec3(0.0); // mean of a 6x4 grid on a mid mip (the 1x1 mip of an NPOT chain is not a mean)
  for (int i = 0; i < 6; i++) for (int j = 0; j < 4; j++) avg += textureLod(uImg, vec2((float(i) + 0.5) / 6.0, (float(j) + 0.5) / 4.0), uMaxLvl).rgb;
  avg /= 24.0;
  float l = dot(avg, vec3(0.2126, 0.7152, 0.0722));
  c *= l > uCap ? uCap / l : 1.0;
  // wash: the barrier's light flooding the picture (act two), past the limiter on purpose
  c = mix(c, vec3(0.94, 0.94, 0.96), uWash);
  vec4 ov = texture(uOv, vec2(vUv.x, 1.0 - vUv.y));
  c = mix(c, ov.rgb, ov.a * uOvA);
  c *= 1.0 - uFade;
  if (abs(vUv.y - 0.5) > 0.5 - uLetter) c = vec3(0.0);
  o = vec4(c, 1.0);
}`;

  // unit cube: 24 verts (pos, normal), 36 indices
  function cubeGeo() {
    const P = [], I = [];
    const faces = [
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
      [[0, 1, 0], [0, 0, 1], [1, 0, 0]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
      [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]],
    ];
    for (const [n, u, v] of faces) {
      const b = P.length / 6;
      for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        P.push(0.5 * (n[0] + su * u[0] + sv * v[0]), 0.5 * (n[1] + su * u[1] + sv * v[1]), 0.5 * (n[2] + su * u[2] + sv * v[2]), n[0], n[1], n[2]);
      }
      I.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
    return { P: new Float32Array(P), I: new Uint16Array(I) };
  }

  const FL = 12; // floats per instance: pos3 size3 col4 (rgb, emissive) misc2 (alpha, ao)
  MV.VOX_FL = FL;

  MV.Vox = class {
    constructor(canvas, o = {}) {
      const gl = (this.gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' }));
      if (!gl) throw new Error('WebGL2 unavailable');
      this.cbf = gl.getExtension('EXT_color_buffer_float');
      gl.getExtension('OES_texture_float_linear');
      this.canvas = canvas;
      this.samples = this.cbf ? Math.min(4, gl.getParameter(gl.MAX_SAMPLES)) : 0;
      const prog = (vs, fs) => {
        const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) + '\n' + s); return sh; };
        const p = gl.createProgram();
        gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
        return { p, u };
      };
      this.P = {
        inst: prog(INST_VS, INST_FS), shadow: prog(INST_VS, SHADOW_FS), bg: prog(QUAD_VS, BG_FS),
        bright: prog(QUAD_VS, BRIGHT_FS), down: prog(QUAD_VS, DOWN_FS), up: prog(QUAD_VS, UP_FS),
        grade: prog(QUAD_VS, GRADE_FS), final: prog(QUAD_VS, FINAL_FS),
      };
      const g = cubeGeo();
      this.cubeVB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVB); gl.bufferData(gl.ARRAY_BUFFER, g.P, gl.STATIC_DRAW);
      this.cubeIB = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIB); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.I, gl.STATIC_DRAW);
      this.emptyVao = gl.createVertexArray();
      // dynamic instances
      this.dyn = new Float32Array(FL * 65536);
      this.dynN = 0;
      this.dynModel = this.model(null, 65536);
      this.ovCanvas = o.overlay;
      this.ovTex = this.tex(1, 1, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST);
      // shadow map
      this.SH = 2048;
      this.shadowTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, this.SH, this.SH);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.shadowFB = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFB);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.shadowTex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.W = this.H = 0;
      this.draws = [];
    }
    tex(w, h, ifmt, fmt, type, filt, mips) {
      const gl = this.gl, t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, type, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : filt);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filt);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }
    fbo(tex) {
      const gl = this.gl, f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return f;
    }
    // (re)allocate the frame targets for a W x H canvas
    resize(W, H) {
      if (W === this.W && H === this.H) return;
      const gl = this.gl;
      this.W = W; this.H = H;
      const F = this.cbf ? [gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT] : [gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE];
      // multisampled HDR scene -> resolved texture
      this.sceneTex = this.tex(W, H, F[0], F[1], F[2], gl.LINEAR);
      this.sceneFB = this.fbo(this.sceneTex);
      this.msFB = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.msFB);
      const cr = gl.createRenderbuffer(), dr = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, cr);
      if (this.samples) gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.samples, F[0], W, H); else gl.renderbufferStorage(gl.RENDERBUFFER, F[0], W, H);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, cr);
      gl.bindRenderbuffer(gl.RENDERBUFFER, dr);
      if (this.samples) gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.samples, gl.DEPTH_COMPONENT24, W, H); else gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, W, H);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, dr);
      // bloom chain
      this.bl = [];
      let w = W >> 1, h = H >> 1;
      for (let i = 0; i < 6 && w > 4 && h > 4; i++) {
        const t = this.tex(w, h, F[0], F[1], F[2], gl.LINEAR), u = this.tex(w, h, F[0], F[1], F[2], gl.LINEAR);
        this.bl.push({ w, h, t, f: this.fbo(t), u, uf: this.fbo(u) });
        w >>= 1; h >>= 1;
      }
      // graded image with mips (limiter reads the top mip)
      this.gradeTex = this.tex(W, H, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR, true);
      gl.generateMipmap(gl.TEXTURE_2D);
      this.gradeFB = this.fbo(this.gradeTex);
      this.maxLvl = Math.floor(Math.log2(Math.max(W, H)));
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    // ------------------------------------------------------------ models
    // instances: Float32Array of n * FL floats (null = dynamic buffer)
    model(inst, cap) {
      const gl = this.gl;
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVB);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIB);
      const ib = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, ib);
      if (inst) gl.bufferData(gl.ARRAY_BUFFER, inst, gl.STATIC_DRAW);
      else gl.bufferData(gl.ARRAY_BUFFER, cap * FL * 4, gl.DYNAMIC_DRAW);
      const S = FL * 4;
      for (const [loc, n, off] of [[2, 3, 0], [3, 3, 12], [4, 4, 24], [5, 2, 40]]) {
        gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, S, off); gl.vertexAttribDivisor(loc, 1);
      }
      gl.bindVertexArray(null);
      return { vao, ib, n: inst ? inst.length / FL : 0 };
    }
    // ------------------------------------------------------------ per frame
    // a dynamic box: centre, size, colour [r,g,b] (0..1), emissive, alpha, ao
    box(x, y, z, sx, sy, sz, c, e = 0, a = 1, ao = 1) {
      if (this.dynN >= 65536) return;
      const d = this.dyn, i = this.dynN++ * FL;
      d[i] = x; d[i + 1] = y; d[i + 2] = z; d[i + 3] = sx; d[i + 4] = sy; d[i + 5] = sz;
      d[i + 6] = c[0]; d[i + 7] = c[1]; d[i + 8] = c[2]; d[i + 9] = e; d[i + 10] = a; d[i + 11] = ao;
    }
    // a box from a to b with thickness w (axis-aligned approximation for short pieces is wrong
    // for long diagonals, so long segments are laid as a row of small cubes)
    seg(a, b, w, c, e = 0, a2 = 1, step) {
      const d = V3.sub(b, a), L = V3.len(d);
      const n = Math.max(1, Math.ceil(L / (step || w)));
      for (let i = 0; i <= n; i++) { const p = V3.lerp(a, b, i / n); this.box(p[0], p[1], p[2], w, w, w, c, e, a2); }
    }
    // queue a model draw. o: {m (mat4), tint [r,g,b,a], emi, glow [r,g,b,k], dissolve, scatter
    // [px,py,pz,amount], sdir [x,y,z], seed, sizeMul, clip, clipSoft, wall, unlit (overrides the frame's),
    // shadow (cast, default true), layer}
    draw(model, o = {}) { if (model && model.n) this.draws.push({ model, o }); }
    // f: {cam, light:{dir,col,sky,ground}, fog:[r,g,b,density], fogStart, bg:{top,bot,glow,glowY,glowAmt},
    //     unlit, lit, post:{bloom, th, exposure, white, sat, vig, ca, grain, flash, flashCol, contrast, lift, gain, cap, fade, letter}, time}
    render(f) {
      const gl = this.gl, W = this.canvas.width, H = this.canvas.height;
      this.resize(W, H);
      const cam = MV.camera(f.cam, W / H);
      this.lastCam = cam;
      // dynamic instances
      if (this.dynN) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dynModel.ib);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.dyn, 0, this.dynN * FL);
        this.dynModel.n = this.dynN;
        this.draws.push({ model: this.dynModel, o: {} });
      }
      const L = f.light || {};
      const ldir = V3.norm(L.dir || [-0.45, 0.75, 0.5]);
      // shadow camera: ortho box around the light target
      const sc = L.center || [0, 0, 0], sr = L.radius || 700;
      const leye = V3.add(sc, V3.mul(ldir, 2000));
      const lview = M4.look(leye, sc, Math.abs(ldir[1]) > 0.99 ? [0, 0, 1] : [0, 1, 0]);
      const lproj = M4.ortho(-sr, sr, -sr, sr, 1, 4000);
      const lvp = M4.mul(lproj, lview);
      const shadowOn = f.shadow !== false && !f.unlit;
      const toneW = (f.post && f.post.white) || 0.9;
      const setInst = (P, d) => {
        const u = P.u, o = d.o;
        gl.uniformMatrix4fv(u.uModel, false, o.m || M4.id());
        gl.uniform4fv(u.uTint, o.tint || [1, 1, 1, 1]);
        gl.uniform1f(u.uDissolve, o.dissolve || 0);
        gl.uniform4fv(u.uScatter, o.scatter || [0, 0, 0, 0]);
        gl.uniform3fv(u.uScatterDir, o.sdir || [0, 0, 0]);
        gl.uniform1f(u.uSeed, o.seed || 0);
        gl.uniform4fv(u.uClip, o.clip || [0, 0, 0, -1]);
        if (u.uClipSoft) gl.uniform1f(u.uClipSoft, o.clip && o.clipSoft || 0);
        gl.uniform1f(u.uSizeMul, o.sizeMul ?? 1);
        const wl = o.wall;
        gl.uniform1f(u.uWallOn, wl ? 1 : 0);
        if (wl) { gl.uniform1f(u.uWallU, wl.u); gl.uniform1fv(u.uWave, wl.wave); gl.uniform1f(u.uWallUnlit, wl.unlit ?? 1); }
        if (u.uToneW) gl.uniform1f(u.uToneW, toneW);
        if (u.uUnlit) gl.uniform1f(u.uUnlit, o.unlit ?? f.unlit ?? 0); // per draw: o.unlit overrides the frame's
        if (u.uEmi) gl.uniform1f(u.uEmi, o.emi || 0);
        if (u.uGlow) gl.uniform4fv(u.uGlow, o.glow || [0, 0, 0, 0]);
      };
      // ---- shadow pass
      if (shadowOn) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFB);
        gl.viewport(0, 0, this.SH, this.SH);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
        gl.colorMask(false, false, false, false);
        const P = this.P.shadow; gl.useProgram(P.p);
        gl.uniformMatrix4fv(P.u.uVP, false, lvp);
        gl.uniformMatrix4fv(P.u.uLightVP, false, lvp);
        for (const d of this.draws) {
          if (d.o.shadow === false) continue;
          setInst(P, d);
          gl.bindVertexArray(d.model.vao);
          gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, d.model.n);
        }
        gl.colorMask(true, true, true, true);
      }
      // ---- scene pass (multisampled)
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.msFB);
      gl.viewport(0, 0, W, H);
      gl.disable(gl.DEPTH_TEST);
      const B = f.bg || {};
      gl.useProgram(this.P.bg.p);
      gl.uniform3fv(this.P.bg.u.uTop, B.top || [0.02, 0.015, 0.04]);
      gl.uniform3fv(this.P.bg.u.uBot, B.bot || [0.0, 0.0, 0.0]);
      gl.uniform3fv(this.P.bg.u.uGlowCol, B.glow || [0.25, 0.05, 0.22]);
      gl.uniform1f(this.P.bg.u.uGlowY, B.glowY ?? 0.1);
      gl.uniform1f(this.P.bg.u.uGlowAmt, B.glowAmt ?? 0);
      gl.uniform1f(this.P.bg.u.uTime, f.time || 0);
      gl.bindVertexArray(this.emptyVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
      const P = this.P.inst; gl.useProgram(P.p);
      gl.uniformMatrix4fv(P.u.uVP, false, cam.vp);
      gl.uniformMatrix4fv(P.u.uLightVP, false, lvp);
      gl.uniform3fv(P.u.uL, ldir);
      gl.uniform3fv(P.u.uLCol, L.col || [1.0, 0.92, 0.85]);
      gl.uniform3fv(P.u.uSky, L.sky || [0.32, 0.3, 0.45]);
      gl.uniform3fv(P.u.uGround, L.ground || [0.16, 0.08, 0.14]);
      gl.uniform3fv(P.u.uEye, cam.eye);
      const fog = f.fog || [0.02, 0.015, 0.04, 0.0006];
      gl.uniform4fv(P.u.uFog, fog);
      gl.uniform1f(P.u.uFogStart, cam.dist + (f.fogStart ?? 200));
      gl.uniform1f(P.u.uUnlit, f.unlit || 0);
      gl.uniform1f(P.u.uLit, f.lit ?? 1);
      gl.uniform1f(P.u.uShadowOn, shadowOn ? 1 : 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
      gl.uniform1i(P.u.uShadow, 1);
      for (const d of this.draws) {
        setInst(P, d);
        gl.bindVertexArray(d.model.vao);
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, d.model.n);
      }
      gl.bindVertexArray(null);
      gl.disable(gl.DEPTH_TEST);
      // resolve
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.msFB);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.sceneFB);
      gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      // ---- bloom
      const Q = f.post || {};
      const quad = (prog, fb, w, h, set) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, w, h);
        gl.useProgram(prog.p); set(prog.u);
        gl.bindVertexArray(this.emptyVao); gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      const bind = (unit, t) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); return unit; };
      const bl = this.bl;
      quad(this.P.bright, bl[0].f, bl[0].w, bl[0].h, (u) => { gl.uniform1i(u.uTex, bind(0, this.sceneTex)); gl.uniform1f(u.uTh, Q.th ?? 1.0); });
      for (let i = 1; i < bl.length; i++)
        quad(this.P.down, bl[i].f, bl[i].w, bl[i].h, (u) => { gl.uniform1i(u.uTex, bind(0, bl[i - 1].t)); gl.uniform2f(u.uPx, 1 / bl[i - 1].w, 1 / bl[i - 1].h); });
      // upsample: u[i] = blur(u[i+1]) + t[i]
      for (let i = bl.length - 2; i >= 0; i--) {
        const src = i === bl.length - 2 ? bl[i + 1].t : bl[i + 1].u;
        quad(this.P.up, bl[i].uf, bl[i].w, bl[i].h, (u) => { gl.uniform1i(u.uTex, bind(0, src)); gl.uniform1i(u.uBase, bind(1, bl[i].t)); gl.uniform2f(u.uPx, 1 / bl[i + 1].w, 1 / bl[i + 1].h); });
      }
      // ---- grade
      quad(this.P.grade, this.gradeFB, W, H, (u) => {
        gl.uniform1i(u.uScene, bind(0, this.sceneTex)); gl.uniform1i(u.uBloom, bind(1, bl[0].u));
        gl.uniform1f(u.uBloomK, Q.bloom ?? 0.35); gl.uniform1f(u.uExposure, Q.exposure ?? 1);
        gl.uniform1f(u.uWhite, Q.white ?? 0.9); gl.uniform1f(u.uSat, Q.sat ?? 1); gl.uniform1f(u.uVig, Q.vig ?? 0.35);
        gl.uniform1f(u.uCA, Q.ca ?? 0.5); gl.uniform1f(u.uGrain, Q.grain ?? 0.025); gl.uniform1f(u.uTime, f.time || 0);
        gl.uniform1f(u.uFlash, Math.min(0.6, Q.flash || 0)); gl.uniform3fv(u.uFlashCol, Q.flashCol || [0.6, 0.12, 0.1]);
        gl.uniform1f(u.uContrast, Q.contrast ?? 1); gl.uniform3fv(u.uLift, Q.lift || [0, 0, 0]); gl.uniform3fv(u.uGain, Q.gain || [1, 1, 1]);
        gl.uniform1f(u.uInv, Q.inv || 0); gl.uniform3fv(u.uInvCol, Q.invCol || [0.8, 0.79, 0.84]);
      });
      gl.bindTexture(gl.TEXTURE_2D, this.gradeTex);
      gl.generateMipmap(gl.TEXTURE_2D);
      // ---- overlay texture
      if (this.ovCanvas) {
        gl.bindTexture(gl.TEXTURE_2D, this.ovTex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, this.ovCanvas);
      }
      // ---- final
      quad(this.P.final, null, W, H, (u) => {
        gl.uniform1i(u.uImg, bind(0, this.gradeTex)); gl.uniform1i(u.uOv, bind(1, this.ovTex));
        gl.uniform1f(u.uMaxLvl, Math.max(0, this.maxLvl - 4)); gl.uniform1f(u.uCap, Q.cap ?? 0.42);
        gl.uniform1f(u.uFade, Q.fade || 0); gl.uniform1f(u.uLetter, Q.letter || 0); gl.uniform1f(u.uOvA, this.ovCanvas ? 1 : 0); gl.uniform1f(u.uWash, Q.wash || 0);
      });
      this.draws.length = 0;
      this.dynN = 0;
      return cam;
    }
  };
})();
