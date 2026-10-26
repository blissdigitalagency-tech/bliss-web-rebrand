// Moving silk backgrounds.
// Recreates Figma's shader fill on the Hero (node 166:272): a slow-morphing
// dark maroon silk with soft diagonal folds. Colours are sampled from the
// Figma export. Used by <SilkCanvas>; pass droplets to float soft glowing
// droplets over it (behind the tagline).

const vert = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const frag = `
  precision mediump float;
  uniform vec2 u_res;
  uniform float u_time;
  uniform float u_drift;
  uniform float u_droplets;
  uniform vec3 u_dark;
  uniform vec3 u_mid;
  uniform vec3 u_light;
  uniform vec3 u_glow;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  // Out-of-focus droplets rising through a grid of cells; some cells stay empty
  float droplets(vec2 uv, float scale, float rise, float seed) {
    vec2 g = uv * scale;
    g.y -= rise;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash(id + seed);
    if (h < 0.7) return 0.0;
    vec2 off = (vec2(hash(id + seed + 1.3), hash(id + seed + 7.1)) - 0.5) * 0.5;
    off.x += sin(u_time * 0.4 + h * 20.0) * 0.06;
    float r = mix(0.08, 0.2, hash(id + seed + 3.7));
    float d = length(f - off);
    float disc = smoothstep(r, r - 0.04, d);
    float rim = smoothstep(r - 0.07, r - 0.015, d) * disc;
    return disc * 0.14 + rim * 0.4;
  }

  // Height of the cloth at p: long folds bent by noise that is itself
  // moved by noise, so the sheets flow like smoke (after portfolite)
  // Smoother noise (fewer layers) for the big sheets
  float soft(vec2 p) {
    return noise(p) * 0.65 + noise(p * 2.0) * 0.35;
  }

  float cloth(vec2 p, float t) {
    vec2 q = vec2(soft(p * 0.45 + vec2(t * 0.5, -t * 0.35)),
                  soft(p * 0.45 + vec2(5.2 - t * 0.4, 1.3 + t * 0.25)));
    float warp = soft(p * 0.55 + q * 1.6 + vec2(-t * 0.25, t * 0.2));
    return sin(p.x * 2.6 + warp * 4.6 + q.y * 1.6);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res.y;
    float t = u_time * 0.16;

    // Folds run bottom-left to top-right, leaning right as they rise (as in Figma)
    vec2 across = normalize(vec2(1.0, -0.34));
    vec2 along = vec2(-across.y, across.x);
    vec2 p = vec2(dot(uv, across), dot(uv, along));

    // Light the cloth like a surface: its slope sets how much light it catches
    float e = 0.012;
    float h = cloth(p, t);
    vec3 n = normalize(vec3(h - cloth(p + vec2(e, 0.0), t), h - cloth(p + vec2(0.0, e), t), e * 1.1));
    vec3 lightDir = normalize(vec3(-0.4, 0.55, 0.75));
    float diffuse = clamp(dot(n, lightDir), 0.0, 1.0);
    float spec = pow(clamp(dot(reflect(-lightDir, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 10.0);

    // Some areas fall into shadow, so the light moves across the surface
    float pool = smoothstep(0.2, 0.7, soft(p * 0.35 + vec2(-t * 0.2, t * 0.12) + 4.0));

    vec3 col = mix(u_dark, u_mid, pow(diffuse, 1.3) * (0.45 + 0.55 * pool));
    col = mix(col, u_light, spec * pool * 0.85);

    if (u_droplets > 0.5) {
      // Two depths: big slow ones in front, small fast ones behind
      float near = droplets(uv, 3.0, u_time * 0.05 + u_drift * 1.2, 0.0);
      float far = droplets(uv, 7.0, u_time * 0.09 + u_drift * 2.4, 11.0) * 0.5;
      col = mix(col, u_glow, clamp(near + far, 0.0, 1.0) * 0.45);
    }

    // Tiny dither to avoid banding in the dark tones
    col += (hash(gl_FragCoord.xy + u_time) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/** Starts the silk on a canvas. Returns a function that stops it. */
export function initSilk(canvas: HTMLCanvasElement, droplets: boolean): () => void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!gl) return () => {}; // the section's CSS background stays as the fallback

  function compile(type: number, src: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
      console.error(gl!.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, vert);
  const fs = compile(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return () => {};

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u: Record<string, WebGLUniformLocation | null> = {};
  ["res", "time", "drift", "droplets", "dark", "mid", "light", "glow"].forEach((n) => {
    u[n] = gl.getUniformLocation(prog, "u_" + n);
  });

  gl.uniform3fv(u.dark, rgb("#1e030a"));
  gl.uniform3fv(u.mid, rgb("#561228"));
  gl.uniform3fv(u.light, rgb("#b8607a"));
  gl.uniform3fv(u.glow, rgb("#d9a3b4"));
  gl.uniform1f(u.droplets, droplets ? 1 : 0);

  // The silk is soft, so a lower resolution looks the same and costs less
  const SCALE = 0.5;
  function resize() {
    const w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
    const h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl!.viewport(0, 0, w, h);
      gl!.uniform2f(u.res, w, h);
    }
  }

  let visible = true;
  let stopped = false;
  let raf = 0;
  let elapsed = 20; // start mid-motion so the first frame already has folds
  let last = 0;

  function draw(now: number) {
    raf = 0;
    if (stopped) return;
    if (last) elapsed += (now - last) / 1000;
    last = now;
    resize();
    gl!.uniform1f(u.time, elapsed);
    // Set by the tagline's scroll progress so the droplets rise as you scroll
    gl!.uniform1f(u.drift, parseFloat(canvas.dataset.drift || "") || 0);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    if (visible && !reduceMotion.matches && !document.hidden) raf = requestAnimationFrame(draw);
  }

  function start() {
    last = 0;
    if (!raf && !stopped) raf = requestAnimationFrame(draw);
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  });
  io.observe(canvas);
  const ro = new ResizeObserver(() => start());
  ro.observe(canvas);
  const onVisibility = () => { if (!document.hidden) start(); };
  document.addEventListener("visibilitychange", onVisibility);
  reduceMotion.addEventListener("change", start);
  canvas.addEventListener("silk:redraw", start);

  start();

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    reduceMotion.removeEventListener("change", start);
    canvas.removeEventListener("silk:redraw", start);
  };
}
