// WebGL post for the 2D battle: the stage is a diorama of
// flat planes at real depths (src/flat.js MV.PLANE_Z), filmed by a 3D camera - pan, dolly,
// pitch / yaw about the point it looks at, roll, and the lens (fov) - so a tilt or a dolly makes
// the walls, the jars, him and the battle slide against each other (HD-2D). Each plane is
// enlarged to make up for its distance: at the home framing the picture is the game's, pixel
// for pixel. Then: restrained bloom from each plane's glow, motion smear on fast camera moves,
// the old photograph / the grey on the planes behind the battle (the battle plane is toned in
// 2D), shade / dim, impact frames (hard black-and-white, inverted), flash, fade, letterbox,
// vignette, and a soft shoulder that keeps whites from blooming into glare.
(function () {
  const MV = window.MV;

  const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
  const FS = `
precision highp float;
uniform sampler2D uP0, uP1, uP2, uP3, uG1, uG2, uG3, uScreen;
uniform vec2 uWorldSize, uPad, uC0;
uniform vec4 uRect, uZ;
uniform float uD0;
uniform vec3 uCamPos, uF, uR, uD;
uniform vec2 uTan, uSmear;
uniform float uBloom, uVig, uFlash, uLetter, uFade, uWhite, uWash, uInv, uBW;
uniform float uShade, uDim, uSepia, uGray, uToneK;
uniform vec3 uFlashCol;

vec3 rayAt(vec2 uv){ vec2 s = (uv - 0.5) * 2.0; return uF + uR * s.x * uTan.x + uD * s.y * uTan.y; }
// where a ray meets the plane at depth z, as a texture coordinate of that plane's canvas
vec2 hitUV(vec3 dir, float z, out float ok){
  float t = (z - uCamPos.z) / dir.z;
  ok = step(0.0, t) * step(1e-4, abs(dir.z));
  vec2 h = uCamPos.xy + dir.xy * t;
  vec2 p = uC0 + (h - uC0) * uD0 / (uD0 + z);
  return (p + uPad) / uWorldSize;
}
vec4 tex(sampler2D s, vec2 uv){
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(0.0);
  return texture2D(s, uv);
}
vec3 glowS(sampler2D s, vec2 uv){ vec4 g = tex(s, uv); return g.rgb * g.a * 1.25; }
// the walls go on past their canvas (its edge continues); the fire's bed runs on sideways
vec4 texWall(sampler2D s, vec2 uv){ return texture2D(s, clamp(uv, 0.0, 1.0)); }
vec4 texSide(sampler2D s, vec2 uv){ if (uv.y < 0.0 || uv.y > 1.0) return vec4(0.0); return texture2D(s, vec2(clamp(uv.x, 0.0, 1.0), uv.y)); }
// the canvas filter sepia(a) grayscale(b) brightness(c), for the planes behind the battle
vec3 tone(vec3 c){
  vec3 sp = vec3(dot(c, vec3(0.393, 0.769, 0.189)), dot(c, vec3(0.349, 0.686, 0.168)), dot(c, vec3(0.272, 0.534, 0.131)));
  c = mix(c, min(sp, 1.0), uSepia);
  c = mix(c, vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))), uGray);
  return c * (1.0 - 0.18 * uSepia - 0.25 * uGray);
}
vec3 sceneAt(vec2 uv){
  vec3 dir = rayAt(uv);
  float ok;
  float kB = (1.0 - uShade) * (1.0 - uDim), kK = 1.0 - uDim, gk = uBloom * (1.0 - uToneK);
  vec2 q = hitUV(dir, uZ.x, ok);
  vec3 col = ok > 0.5 ? tone(texWall(uP0, q).rgb) * kB : vec3(0.0);
  q = hitUV(dir, uZ.y, ok);
  if (ok > 0.5) { vec4 c = texSide(uP1, q); col = mix(col, tone(c.rgb) * kB, c.a) + glowS(uG1, q) * gk * kB; }
  q = hitUV(dir, uZ.z, ok);
  if (ok > 0.5) { vec4 c = tex(uP2, q); col = mix(col, tone(c.rgb) * kK, c.a) + glowS(uG2, q) * gk * kK; }
  q = hitUV(dir, uZ.w, ok);
  if (ok > 0.5) { vec4 c = tex(uP3, q); col = mix(col, c.rgb, c.a) + glowS(uG3, q) * uBloom; }
  return col;
}
void main(){
  vec2 uv = vec2((gl_FragCoord.x - uRect.x) / uRect.z, 1.0 - (gl_FragCoord.y - uRect.y) / uRect.w);
  vec3 col = sceneAt(uv);
  // motion smear along the camera's own movement (whip pans)
  if (dot(uSmear, uSmear) > 1e-7) {
    vec3 acc = col;
    for (int i = 1; i <= 4; i++) acc += sceneAt(uv - uSmear * float(i) * 0.25);
    col = acc / 5.0;
  }
  vec4 sc = texture2D(uScreen, uv);
  col = mix(col, sc.rgb, sc.a);
  // soft shoulder above 0.82 into uWhite: highlights roll off instead of glaring
  vec3 hi = max(col - 0.82, 0.0);
  col = min(col, 0.82) + (uWhite - 0.82) * (1.0 - exp(-hi / max(uWhite - 0.82, 1e-3)));
  float v = length((uv - 0.5) * vec2(1.0, 0.8));
  col *= 1.0 - uVig * smoothstep(0.35, 0.85, v);
  // impact frames: hard black and white, inverted
  if (uBW > 0.5) col = vec3(step(0.2, dot(col, vec3(0.333))));
  if (uInv > 0.5) col = 1.0 - col;
  col = mix(col, uFlashCol, uFlash);
  col = mix(col, vec3(0.94, 0.94, 0.96), uWash); // the barrier's light flooding the picture (act two)
  col *= 1.0 - uFade;
  float lb = uLetter * 0.12;
  if (uv.y < lb || uv.y > 1.0 - lb) col = vec3(0.0);
  gl_FragColor = vec4(col, 1.0);
}`;

  const makeTex = (gl, filter) => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const FOV0 = 0.7; // the home lens: the planes are laid out for it

  MV.Post2D = class {
    constructor(canvas) {
      const gl = (this.gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false }));
      if (!gl) throw new Error('WebGL unavailable');
      const sh = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      const pr = (this.pr = gl.createProgram());
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
      gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      // texture units: 0-3 the planes (back..front), 4-6 the glows of mid, king, front, 7 the screen
      this.tex = [0, 1, 2, 3].map(() => makeTex(gl, gl.NEAREST)).concat([4, 5, 6].map(() => makeTex(gl, gl.LINEAR)), [makeTex(gl, gl.NEAREST)]);
      this.u = {};
      const n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(pr, i); this.u[info.name] = gl.getUniformLocation(pr, info.name); }
      ['uP0', 'uP1', 'uP2', 'uP3', 'uG1', 'uG2', 'uG3', 'uScreen'].forEach((name, i) => this.u[name] && gl.uniform1i(this.u[name], i));
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    }
    upload(unit, src) {
      const gl = this.gl;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, this.tex[unit]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    }
    // src: {planes: [{c, g, z} x 4, back to front], screen}; cam: {x, y, zoom, roll, pitch, yaw,
    // fov}; p: post
    render(src, cam, p) {
      const gl = this.gl, u = this.u, cv = gl.canvas, P = src.planes;
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform4f(u.uRect, 0, 0, cv.width, cv.height);
      P.forEach((pl, i) => { this.upload(i, pl.c); if (i) this.upload(3 + i, pl.g); });
      this.upload(7, src.screen);
      // the camera: it looks along +z at (x, y) on the battle plane (z = 0) from dist away;
      // screen y = world +y
      const fov = cam.fov || FOV0, tanY = Math.tan(fov / 2), tanX = tanY * (cv.width / cv.height);
      const dist = MV.OH / 2 / (tanY * (cam.zoom || 1));
      const cp = Math.cos(cam.pitch || 0), sp = Math.sin(cam.pitch || 0);
      const cy = Math.cos(cam.yaw || 0), sy = Math.sin(cam.yaw || 0);
      const cr = Math.cos(cam.roll || 0), sr = Math.sin(cam.roll || 0);
      const rotX = (v) => [v[0], v[1] * cp - v[2] * sp, v[1] * sp + v[2] * cp];
      const rotY = (v) => [v[0] * cy + v[2] * sy, v[1], -v[0] * sy + v[2] * cy];
      const F = rotY(rotX([0, 0, 1])), Rv = rotY(rotX([cr, sr, 0])), Dv = rotY(rotX([-sr, cr, 0]));
      gl.uniform3fv(u.uCamPos, [cam.x - F[0] * dist, cam.y - F[1] * dist, -F[2] * dist]);
      gl.uniform3fv(u.uF, F); gl.uniform3fv(u.uR, Rv); gl.uniform3fv(u.uD, Dv);
      gl.uniform2f(u.uTan, tanX, tanY);
      gl.uniform2f(u.uWorldSize, P[0].c.width, P[0].c.height);
      gl.uniform2f(u.uPad, MV.PADX, MV.PADY);
      gl.uniform2f(u.uC0, MV.OW / 2, MV.OH / 2);
      gl.uniform1f(u.uD0, MV.OH / 2 / Math.tan(FOV0 / 2));
      gl.uniform4f(u.uZ, P[0].z, P[1].z, P[2].z, P[3].z);
      gl.uniform2fv(u.uSmear, p.smear || [0, 0]);
      const f1 = (n, v) => u[n] && gl.uniform1f(u[n], v);
      f1('uBloom', p.bloom); f1('uVig', p.vig); f1('uFlash', p.flash || 0); f1('uLetter', p.letter); f1('uFade', p.fade); f1('uWhite', p.white ?? 0.97); f1('uWash', p.wash || 0);
      f1('uInv', p.inv || 0); f1('uBW', p.bw || 0);
      f1('uShade', p.shade || 0); f1('uDim', p.dim || 0); f1('uSepia', p.sepia || 0); f1('uGray', p.gray || 0); f1('uToneK', p.toneK || 0);
      gl.uniform3fv(u.uFlashCol, p.flashCol || [1, 1, 1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  };
})();
