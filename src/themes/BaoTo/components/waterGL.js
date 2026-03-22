/**
 * WebGL Water Shader + Paper Overlay — from baothiento.com source
 * Modules 41712, 57408, 97237, 35236, 38211
 */

/* ── Constants ── */
const PAPER = {
  brightness: 21, contrast: 31, warmth: 23, grain: 71, grainPop: 9,
  fog: 63, lightLeak: 12, edgeFade: 10, cornerRadius: 28, edgeNoise: 27, edgeMargin: 5,
};
const BG = { r: 245, g: 241, b: 236 };

/* ── Noise (module 35236) ── */
function hash2d(x, y) {
  let a = x * 374761393 + y * 668265263;
  return (((a = (a ^ (a >> 13)) * 1274126177) ^ (a >> 16)) & 2147483647) / 2147483647;
}
function smoothNoise(x, y, scale) {
  const sx = x * scale, sy = y * scale;
  const ix = Math.floor(sx), iy = Math.floor(sy);
  const fx = sx - ix, fy = sy - iy;
  const ux = fx * fx * (3 - fx * 2), uy = fy * fy * (3 - fy * 2);
  return (hash2d(ix, iy) * (1 - ux) + hash2d(ix + 1, iy) * ux) * (1 - uy)
       + (hash2d(ix, iy + 1) * (1 - ux) + hash2d(ix + 1, iy + 1) * ux) * uy;
}
function fractalNoise(x, y) {
  return smoothNoise(x, y, 0.004) * 0.6 + smoothNoise(x, y, 0.01) * 0.25 + smoothNoise(x, y, 0.025) * 0.15;
}
function filmGrain(amount, popChance, popScale) {
  const r = Math.random();
  if (r < popChance * 0.6) return popScale * (0.5 + Math.random() * 0.5) * amount;
  if (r < popChance) return -(popScale * (0.3 + Math.random() * 0.4) * amount);
  return ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * amount * 2;
}

/* ── Edge mask SDF (module 97237) ── */
export function createEdgeMask(w, h) {
  const mask = new Float32Array(w * h);
  const margin = (PAPER.edgeMargin / 100) * Math.min(w, h);
  const cx = w / 2, cy = h / 2;
  const sx = cx - margin, sy = cy - margin;
  const d = Math.min(sx, sy);
  const cr = (PAPER.cornerRadius / 100) * d;
  const noiseAmt = (PAPER.edgeNoise / 100) * Math.min(w, h) * 0.06;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let dx = Math.abs(x - cx) - (sx - cr);
      let dy = Math.abs(y - cy) - (sy - cr);
      let gx = Math.max(dx, 0), gy = Math.max(dy, 0);
      let f = Math.sqrt(gx * gx + gy * gy) + Math.min(Math.max(dx, dy), 0) - cr;
      if (noiseAmt > 0) f += (fractalNoise(x, y) * 2 - 1) * noiseAmt;
      mask[y * w + x] = f;
    }
  }
  return mask;
}

/* ── Paper overlay (module 57408) ── */
export function renderPaperOverlay(canvas, edgeMask) {
  const w = canvas.width, h = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Pass 1: grain + warmth
  const img = ctx.createImageData(w, h);
  const data = img.data;
  const edgeFade = (PAPER.edgeFade / 100) * Math.min(w, h) * 0.45;
  const grainAmt = (PAPER.grain / 100) * 80;
  const popPct = PAPER.grainPop / 100;
  const popThresh = popPct * 0.15;
  const popExp = 1.5 + popPct * 2.5;
  const warmth = PAPER.warmth * 0.3;
  const brightness = (PAPER.brightness / 100) * 255;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const pi = idx * 4;
      const f = edgeMask[idx];
      if (f > 0) continue;
      let rr = warmth + brightness, gg = brightness, bb = -warmth + brightness;
      const grain = filmGrain(grainAmt, popThresh, popExp);
      rr += grain; gg += grain; bb += grain;
      const avg = (rr + gg + bb) / 3;
      const alpha = Math.min(255, Math.max(0, Math.abs(avg) * 0.7));
      if (avg >= 0) {
        data[pi] = Math.min(255, 245 + Math.round(warmth * 0.5));
        data[pi + 1] = 240;
        data[pi + 2] = Math.max(0, 230 - Math.round(warmth * 0.3));
        data[pi + 3] = Math.round(alpha);
      } else {
        data[pi] = 30; data[pi + 1] = 25; data[pi + 2] = 20;
        data[pi + 3] = Math.round(alpha * 0.6);
      }
      if (edgeFade > 0 && -f < edgeFade) {
        const e = -f / edgeFade;
        const a = Math.round((1 - e * e * (3 - e * 2)) * 255);
        const curA = data[pi + 3] / 255;
        const fadeA = a / 255;
        const n = curA + fadeA * (1 - curA);
        if (n > 0) {
          data[pi] = Math.round((data[pi] * curA + BG.r * fadeA * (1 - curA)) / n);
          data[pi + 1] = Math.round((data[pi + 1] * curA + BG.g * fadeA * (1 - curA)) / n);
          data[pi + 2] = Math.round((data[pi + 2] * curA + BG.b * fadeA * (1 - curA)) / n);
        }
        data[pi + 3] = Math.round(n * 255);
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  // Pass 2: fog + light leaks
  const rcx = w / 2, rcy = h / 2, rad = Math.sqrt(rcx * rcx + rcy * rcy);
  const fogAmt = (PAPER.fog / 100) * 0.35;
  const fogGrad = ctx.createRadialGradient(rcx, rcy, w * 0.05, rcx, rcy, rad);
  fogGrad.addColorStop(0, `rgba(240,235,228,${fogAmt})`);
  fogGrad.addColorStop(0.5, `rgba(240,235,228,${fogAmt * 0.6})`);
  fogGrad.addColorStop(1, `rgba(220,215,210,${fogAmt * 0.8})`);
  ctx.fillStyle = fogGrad;
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillRect(0, 0, w, h);
  const leakAmt = (PAPER.lightLeak / 100) * 0.35;
  for (const spot of [
    { x: w * 0.15, y: h * 0.2, r: w * 0.5 },
    { x: w * 0.85, y: h * 0.7, r: w * 0.4 },
    { x: w * 0.5, y: h * 0.1, r: w * 0.35 },
  ]) {
    const lg = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.r);
    lg.addColorStop(0, `rgba(255,252,245,${leakAmt})`);
    lg.addColorStop(0.4, `rgba(255,250,240,${leakAmt * 0.4})`);
    lg.addColorStop(1, 'rgba(255,250,240,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = 'source-over';

  // Pass 3: BG outside mask
  const imgOut = ctx.getImageData(0, 0, w, h);
  const dOut = imgOut.data;
  for (let i = 0; i < w * h; i++) {
    if (edgeMask[i] > 0) {
      const pi = i * 4;
      dOut[pi] = BG.r; dOut[pi + 1] = BG.g; dOut[pi + 2] = BG.b; dOut[pi + 3] = 255;
    }
  }
  ctx.putImageData(imgOut, 0, 0);
}

/* ── GLSL Shader (module 41712) ── */
const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}`;
const FRAG = `
precision highp float;
uniform float u_time;uniform vec2 u_resolution;uniform vec4 u_ripples[12];
float hash(vec2 p){float h=dot(p,vec2(127.1,311.7));return fract(sin(h)*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);return -1.0+2.0*mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);}
float sea_octave(vec2 uv,float choppy){uv+=noise(uv);vec2 wv=1.0-abs(sin(uv));vec2 swv=abs(cos(uv));wv=mix(wv,swv,wv);return pow(1.0-pow(wv.x*wv.y,0.65),choppy);}
const mat2 octave_m=mat2(1.6,1.2,-1.2,1.6);
float getHeight(vec2 uv){float SEA_TIME=u_time*0.8;float freq=0.16;float amp=0.6;float choppy=4.0;float h=0.0;for(int i=0;i<5;i++){float d=sea_octave((uv+SEA_TIME)*freq,choppy);d+=sea_octave((uv-SEA_TIME)*freq,choppy);h+=d*amp;uv*=octave_m;freq*=1.9;amp*=0.22;choppy=mix(choppy,1.0,0.2);}return h;}
vec3 getNormal(vec2 uv,float eps){float h=getHeight(uv);float hx=getHeight(uv+vec2(eps,0.0));float hy=getHeight(uv+vec2(0.0,eps));return normalize(vec3(h-hx,eps*8.0,h-hy));}
float ripple(vec2 pos,vec2 center,float time,float dropTime){float age=time-dropTime;if(age<0.0||age>4.0)return 0.0;float eps=0.04;float hc=getHeight(pos);float hx=getHeight(pos+vec2(eps,0.0));float hy=getHeight(pos+vec2(0.0,eps));vec2 grad=vec2(hx-hc,hy-hc)/eps;vec2 diff=pos-center+grad*1.2;float n=noise(pos*3.0+time*0.5)*0.15;diff+=vec2(n,-n);float dist=length(diff);float speedMod=1.0+hc*0.3;float wavefront=age*4.5*speedMod;float envelope=exp(-pow(dist-wavefront,2.0)/1.5);float decay=exp(-age*1.4);return 0.45*envelope*decay*cos(dist*5.0-time*6.0);}
vec3 getWaterColor(vec2 uv,vec3 normal,float height){vec3 deepColor=vec3(0.02,0.18,0.32);vec3 waterColor=vec3(0.25,0.65,0.60);vec3 skyColor=vec3(0.50,0.82,0.88);vec3 lightDir=normalize(vec3(0.4,0.7,0.3));vec3 eye=vec3(0.0,1.0,0.0);float fresnel=1.0-max(dot(normal,eye),0.0);fresnel=clamp(pow(fresnel,3.0)*0.65,0.0,1.0);float diff=pow(dot(normal,lightDir)*0.4+0.6,80.0);vec3 refracted=deepColor+diff*waterColor*0.12;vec3 color=mix(refracted,skyColor,fresnel);color+=waterColor*(height-0.6)*0.18;vec3 refl=reflect(-eye,normal);float spec=pow(max(dot(refl,lightDir),0.0),60.0);float nrm=(60.0+8.0)/(3.14159*8.0);color+=vec3(spec*nrm*0.15);return color;}
void main(){vec2 px=gl_FragCoord.xy;px.y=u_resolution.y-px.y;float scale=30.0;vec2 uv=(px/min(u_resolution.x,u_resolution.y))*scale;float height=getHeight(uv);for(int i=0;i<12;i++){vec2 mouseUV=(u_ripples[i].xy/min(u_resolution.x,u_resolution.y))*scale;height+=ripple(uv,mouseUV,u_time,u_ripples[i].z)*u_ripples[i].w;}vec3 normal=getNormal(uv,0.01);vec3 color=getWaterColor(uv,normal,height);color=pow(color,vec3(0.75));gl_FragColor=vec4(clamp(color,0.0,1.0),1.0);}`;

function compileShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('Shader:', gl.getShaderInfoLog(s)); return null; }
  return s;
}

export function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
}

/**
 * Initialize WebGL water + paper overlay.
 * Returns { addRipple, timeRef, destroy } or null if WebGL unavailable.
 */
export function initWaterGL(glCanvas, overlayCanvas) {
  resizeCanvas(glCanvas);
  const rect = glCanvas.getBoundingClientRect();
  overlayCanvas.width = Math.round(rect.width);
  overlayCanvas.height = Math.round(rect.height);

  const gl = glCanvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return null;

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uRipples = [];
  for (let i = 0; i < 12; i++) uRipples.push(gl.getUniformLocation(prog, `u_ripples[${i}]`));

  gl.uniform2f(uRes, glCanvas.width, glCanvas.height);
  for (let i = 0; i < 12; i++) gl.uniform4f(uRipples[i], 0, 0, -10, 0);

  const edgeMask = createEdgeMask(overlayCanvas.width, overlayCanvas.height);
  renderPaperOverlay(overlayCanvas, edgeMask);

  const startTime = performance.now();
  const ripples = [];
  const timeRef = { current: 0 };
  let animId = 0;
  let running = true;

  const frame = () => {
    if (!running) return;
    const t = (performance.now() - startTime) / 1000;
    timeRef.current = t;
    gl.uniform1f(uTime, t);
    for (let i = 0; i < 12; i++) {
      if (i < ripples.length) {
        gl.uniform4f(uRipples[i], ripples[i].x, ripples[i].y, ripples[i].time, ripples[i].amp);
      } else {
        gl.uniform4f(uRipples[i], 0, 0, -10, 0);
      }
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    animId = requestAnimationFrame(frame);
  };
  animId = requestAnimationFrame(frame);

  let resizeTimer = 0;
  const onResize = () => {
    resizeCanvas(glCanvas);
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.uniform2f(uRes, glCanvas.width, glCanvas.height);
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const r2 = glCanvas.getBoundingClientRect();
      overlayCanvas.width = Math.round(r2.width);
      overlayCanvas.height = Math.round(r2.height);
      const mask = createEdgeMask(overlayCanvas.width, overlayCanvas.height);
      renderPaperOverlay(overlayCanvas, mask);
    }, 150);
  };
  window.addEventListener('resize', onResize);

  function addRipple(px, py, amp = 1.0) {
    const t = timeRef.current;
    // Expire old, keep max 11 so we can add 1
    while (ripples.length > 0 && t - ripples[0].time > 4) ripples.shift();
    if (ripples.length >= 12) ripples.shift();
    ripples.push({ x: px, y: py, time: t, amp });
  }

  function destroy() {
    running = false;
    cancelAnimationFrame(animId);
    clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
  }

  return { addRipple, timeRef, destroy };
}
