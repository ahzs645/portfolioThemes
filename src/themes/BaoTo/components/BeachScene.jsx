import { useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { SHELL_TYPES } from './beachShells';
import { drawCrab, CRAB_PALETTES } from './beachCrabs';

/* ═══ Beach Scene — Sand, waves, shells, seaweed, crabs ═══ */

const Wrapper = styled.div`
  position: relative;
  width: 88vw;
  max-width: 900px;
  cursor: pointer;
  user-select: none;
  height: clamp(370px, 40vh, 480px);
  touch-action: pan-y;
  @media (min-width: 640px) { width: 70vw; }
`;
const SandCanvas = styled.canvas`position:absolute;inset:0;width:100%;height:100%;`;
const OverlayCanvas = styled.canvas`position:absolute;inset:0;z-index:1;`;

/* ── Colors ── */
const SAND = [{ r:237,g:220,b:185 },{ r:225,g:205,b:165 },{ r:210,g:188,b:148 },{ r:205,g:190,b:155 }];
const BG = { r:245, g:241, b:236 };
const SEAWEED = [
  { a:'#8A8258',b:'#7E7850',c:'#96905E' },{ a:'#7A8860',b:'#6E7C55',c:'#889868' },
  { a:'#6A7858',b:'#5E6C50',c:'#788862' },{ a:'#8A8868',b:'#7E7C60',c:'#969470' },
];

/* ── Noise ── */
function D(x,y){let a=x*374761393+y*668265263;return(((a=(a^(a>>13))*1274126177)^(a>>16))&2147483647)/2147483647}
function sn(x,y,s){const sx=x*s,sy=y*s,ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;const ux=fx*fx*(3-fx*2),uy=fy*fy*(3-fy*2);return(D(ix,iy)*(1-ux)+D(ix+1,iy)*ux)*(1-uy)+(D(ix,iy+1)*(1-ux)+D(ix+1,iy+1)*ux)*uy}
function fn(x,y){return sn(x,y,0.004)*0.6+sn(x,y,0.01)*0.25+sn(x,y,0.025)*0.15}
function ss(a,b,t){const l=Math.max(0,Math.min(1,(t-a)/(b-a)));return l*l*(3-l*2)}
function clp(v){return Math.max(0,Math.min(255,Math.round(v)))}

/* ── PRNG ── */
function prng(s){let t=s;return()=>(t=(t*16807)%2147483647)/2147483647}

/* ── Sand texture (rendered once) — exact port from source lines 3038-3141 ── */
function renderSand(canvas, cssW, cssH) {
  const dpr = Math.min(devicePixelRatio||1, 2);
  const w = Math.round(cssW*dpr), h = Math.round(cssH*dpr);
  canvas.width = w; canvas.height = h;
  canvas.style.width = cssW+'px'; canvas.style.height = cssH+'px';
  const ctx = canvas.getContext('2d'); if(!ctx) return;
  const img = ctx.createImageData(w,h), s = img.data;

  const margin = Math.min(w,h)*0.005;
  const hw=w/2, hh=h/2, fw=hw-margin, fh=hh-margin;
  const cr = Math.min(fw,fh)*0.28; // corner radius (28% of min half-dim)
  const edgeNoiseAmp = Math.min(w,h)*0.06*0.55;

  for(let y=0;y<h;y++){
    const t=y/h;
    for(let x=0;x<w;x++){
      const pi=(y*w+x)*4;
      // SDF
      const ox=Math.abs(x-hw)-(fw-cr), oy=Math.abs(y-hh)-(fh-cr);
      let g=Math.sqrt(Math.max(ox,0)**2+Math.max(oy,0)**2)+Math.min(Math.max(ox,oy),0)-cr;
      // 3-octave edge noise (source frequencies: 0.8, 2.5, 6.0)
      g += (fn(x*0.8,y*0.8)*2-1)*edgeNoiseAmp
         + (fn(x*2.5,y*2.5+500)*2-1)*edgeNoiseAmp*0.35
         + (fn(x*6,y*6+1000)*2-1)*edgeNoiseAmp*0.12;

      if(g>0){s[pi]=BG.r;s[pi+1]=BG.g;s[pi+2]=BG.b;s[pi+3]=255;continue}

      // Sand gradient with noise perturbation
      const m=ss(0.03,0.55,
        t + (fn(x*0.01,y*0.01+400)-0.5)*0.2
          + (fn(x*0.035,y*0.035+450)-0.5)*0.08
          + (fn(x*0.08,y*0.08+480)-0.5)*0.03
      );
      const col = m<0.4 ? lrp(SAND[3],SAND[0],m/0.4)
                : m<0.7 ? lrp(SAND[0],SAND[1],(m-0.4)/0.3)
                :         lrp(SAND[1],SAND[2],Math.min(1,(m-0.7)/0.3));

      // Per-channel noise (source applies different multipliers per channel)
      const v=(fn(x*0.012,y*0.02+500)*0.6+fn(x*0.025,y*0.004+700)*0.4-0.5)*14;
      const yy=(fn(x*0.08,y*0.08)-0.5)*16;
      const M=(D(x*3,y*3)-0.5)*10;
      const b7=D(x*7+100,y*7+200); const ww=b7>0.97?-18:b7>0.95?-8:0;
      const k=filmGrain(10,0.015,1.4);

      let rr=col.r+v+yy+M*0.5+ww+k;
      let gg=col.g+v*0.9+yy*0.85+M*0.4+ww+k;
      let bb=col.b+v*0.7+yy*0.7+M*0.3+ww*0.8+k;

      // Edge vignette (28% of min dim)
      const C=Math.min(w,h)*0.28;
      if(-g<C){const e=-g/C;const t2=e*e*(3-e*2);const a=1-t2;rr=rr*t2+BG.r*a;gg=gg*t2+BG.g*a;bb=bb*t2+BG.b*a}

      s[pi]=clp(rr);s[pi+1]=clp(gg);s[pi+2]=clp(bb);s[pi+3]=255;
    }
  }
  ctx.putImageData(img,0,0);

  // Sea foam dots (drawn in CSS-pixel space after DPR scale)
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr,dpr);
  const rr=prng(77);
  for(let i=0;i<40;i++){
    const fx=rr()*cssW, fy=(0.06+rr()*0.08)*cssH;
    ctx.globalAlpha=0.12+rr()*0.2;
    ctx.fillStyle='#FEFCF6';
    ctx.beginPath();ctx.arc(fx,fy,0.3+rr(),0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
}

function lrp(a,b,t){return{r:a.r+(b.r-a.r)*t,g:a.g+(b.g-a.g)*t,b:a.b+(b.b-a.b)*t}}
function filmGrain(amt,pop,scale){const r=Math.random();if(r<pop*0.6)return scale*(0.5+Math.random()*0.5)*amt;if(r<pop)return-(scale*(0.3+Math.random()*0.4)*amt);return((Math.random()+Math.random()+Math.random())/3-0.5)*amt*2}

/* ── Seaweed ── */
function drawSeaweed(ctx, cl, time) {
  const colors = SEAWEED[cl.colorIdx % SEAWEED.length];
  const rand = prng(cl.seed);
  for (let i = 0; i < cl.density; i++) {
    const t = (rand()+rand()+rand())/3;
    const bx = cl.x + (t-0.5)*cl.scaleX*2;
    const by = cl.y + (rand()-0.5)*cl.scaleY;
    const h = 8+rand()*18;
    const wind = Math.sin(time*0.5+i*0.7+cl.seed*0.1)*1.2;
    ctx.beginPath(); ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx+wind+(rand()-0.5)*6, by-h*0.6, bx+wind*2, by-h);
    ctx.strokeStyle = [colors.a,colors.b,colors.c][Math.floor(rand()*3)];
    ctx.globalAlpha = 0.3+rand()*0.3;
    ctx.lineWidth = 0.5+rand()*0.8;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/* ── Waves — exact port from source (lines 3318-4075) ── */
const WAVE_AMPS = [0.16,0.22,0.14,0.38,0.18,0.13,0.45,0.2,0.25,0.15];

// Wave state (persistent across frames like source)
const waveState = { time:0, waveIdx:0, foam:[], edgeOffsets:new Float32Array(0), _frameCount:0 };

// Source em(): sample edge offset at pixel x, return baseY + offset * amplitude
function em(offsets, x, baseY, amp) {
  if(!offsets.length) return baseY;
  const i = Math.min(Math.max(x|0, 0), offsets.length-1);
  return baseY + offsets[i] * amp;
}

// Source ex(): independent edge offset arrays for foam bands (cached per seed)
const exCache = new Map();
let exWidth = 0;
function ex(seed, w, step) {
  if(exWidth!==w){exCache.clear();exWidth=w}
  let arr=exCache.get(seed);
  if(arr)return arr;
  const count=((w/step)|0)+2;
  arr=new Float32Array(count);
  for(let i=0;i<count;i++){
    const x=i*step;
    arr[i]=(fn(x*0.005,seed)-0.5)*38+(fn(x*0.014,seed+300)-0.5)*18+(fn(x*0.04,seed+700)-0.5)*8+Math.sin(x*0.004+seed*0.007)*12;
  }
  exCache.set(seed,arr);return arr;
}
function eg(offsets, x, step){const i=(x/step)|0;return i<offsets.length?offsets[i]:0}

function updateWaveState(dt, w) {
  const ws = waveState;
  const prevIdx = Math.floor(ws.time/7);
  ws.time += dt;
  if(Math.floor(ws.time/7)>prevIdx) ws.waveIdx++;

  const progress = (ws.time%7)/7;
  const amp = WAVE_AMPS[ws.waveIdx % WAVE_AMPS.length];
  const isBig = amp > 0.3;

  // Foam particles
  const spawnRate = (isBig?30:16)*dt;
  const base = 0; // waveY computed later
  if(ws.foam.length<90){
    for(let i=0;i<spawnRate;i++){
      const x=Math.random()*w;
      const edgeOff=ws.edgeOffsets.length>0?ws.edgeOffsets[Math.min(x|0,ws.edgeOffsets.length-1)]:0;
      ws.foam.push({x,y:0,edgeOff,rx:1.5+Math.random()*3,rot:Math.random()*Math.PI,life:1,drift:(Math.random()-0.5)*2});
    }
  }
  const fadeRate = dt/(isBig?4:2.8);
  let len=ws.foam.length;
  for(let i=len-1;i>=0;i--){
    ws.foam[i].life-=fadeRate;
    ws.foam[i].x+=ws.foam[i].drift*dt;
    ws.foam[i].y+=dt*0.3;
    if(ws.foam[i].life<=0){ws.foam[i]=ws.foam[--len]}
  }
  ws.foam.length=len;

  // Edge offsets: per-pixel, updated every 3rd frame, 3 octaves (55, 25, 12)
  if(ws.edgeOffsets.length!==w){ws.edgeOffsets=new Float32Array(w);ws._frameCount=3}
  if(++ws._frameCount>=3){
    ws._frameCount=0;
    const a=ws.time*12;
    let prev=0;
    for(let i=0;i<w;i+=16){
      const r=(fn(i,a+42)*2-1)*55+(fn(i+5000,a*1.3+142)*2-1)*25+(fn(i+12000,a*0.7+242)*2-1)*12;
      if(i===0){ws.edgeOffsets[0]=r}
      else{for(let j=i-16;j<i&&j<w;j++){const t=(j-(i-16))*0.0625;ws.edgeOffsets[j]=prev+(r-prev)*t}}
      prev=r;ws.edgeOffsets[Math.min(i,w-1)]=r;
    }
    const lastChunk=((w-1)/16|0)*16;
    for(let j=lastChunk+1;j<w;j++)ws.edgeOffsets[j]=prev;
  }
}

function drawWaves(ctx, w, h, time, dt) {
  updateWaveState(dt, w);
  const ws = waveState;
  const progress = (ws.time%7)/7;
  const amp = WAVE_AMPS[ws.waveIdx % WAVE_AMPS.length];
  const isBig = amp>0.3;
  const c = ws.edgeOffsets;

  // Wave Y position (source ei function)
  const base = h*0.18;
  const target = base + amp*h;
  let waveY;
  if(progress<0.25){const t=progress/0.25;waveY=base+(target-base)*(1-(1-t)*(1-t)*(1-t))}
  else{const t=(progress-0.25)/0.75;waveY=base+(target-base)*(1-t*t)}

  // Water body fill
  const opacity = isBig?0.5:0.38;
  ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w,0);
  ctx.lineTo(w,em(c,w,waveY+25,1));
  for(let x=w-5;x>=0;x-=5)ctx.lineTo(x,em(c,x,waveY+25,1));
  ctx.lineTo(0,em(c,0,waveY+25,1));ctx.closePath();
  const grad=ctx.createLinearGradient(0,0,0,waveY+25);
  grad.addColorStop(0,'rgba(55,130,140,0)');
  grad.addColorStop(0.12,`rgba(55,130,140,${opacity*0.2})`);
  grad.addColorStop(0.4,`rgba(60,140,148,${opacity*0.8})`);
  grad.addColorStop(0.7,`rgba(70,155,155,${opacity})`);
  grad.addColorStop(0.88,`rgba(85,165,162,${opacity*0.5})`);
  grad.addColorStop(1,`rgba(90,170,165,${opacity*0.15})`);
  ctx.fillStyle=grad;ctx.fill();ctx.restore();

  // 8 water bands (filled shapes, gaussian opacity)
  const bandAlpha = isBig?0.28:0.2;
  for(let l=0;l<8;l++){
    const i=l/7;const r=-35+i*65;
    const o=bandAlpha*Math.exp(-((i-0.3)*(i-0.3))/0.08);
    if(o<0.005)continue;
    const sr=Math.round(70+i*160),sg=Math.round(155+i*80),sb=Math.round(158+i*65);
    const f=0.7+i*0.5,u=f+0.15,p=8+(1-Math.abs(i-0.3))*12;
    ctx.save();ctx.globalAlpha=o;ctx.beginPath();
    for(let x=0;x<=w;x+=5)x===0?ctx.moveTo(x,em(c,x,waveY+r,f)):ctx.lineTo(x,em(c,x,waveY+r,f));
    for(let x=w;x>=0;x-=5)ctx.lineTo(x,em(c,x,waveY+r+p,u));
    ctx.closePath();ctx.fillStyle=`rgba(${sr},${sg},${sb},1)`;ctx.fill();ctx.restore();
  }

  // 7 foam bands (filled shapes with independent offsets)
  const foamAlpha = isBig?0.22:0.16;
  for(let l=0;l<7;l++){
    const i=l/6;const r=-12+i*60;
    const o=foamAlpha*Math.exp(-((i-0.25)*(i-0.25))/0.1);
    if(o<0.005)continue;
    const s=0.8+i*0.5,hh=5+(1-Math.abs(i-0.25))*10;
    const d=ex(5000+l*300,w,5),f=ex(6000+l*300,w,5);
    const ur=Math.round(245-i*25),ug=Math.round(250-i*35),ub=Math.round(248-i*50);
    ctx.save();ctx.globalAlpha=o;ctx.beginPath();
    for(let x=0;x<=w;x+=5){const a=eg(d,x,5)*0.3;x===0?ctx.moveTo(x,em(c,x,waveY+r+a,s)):ctx.lineTo(x,em(c,x,waveY+r+a,s))}
    for(let x=w;x>=0;x-=5){const a=eg(f,x,5)*0.35;ctx.lineTo(x,em(c,x,waveY+r+hh+a,s+0.12))}
    ctx.closePath();ctx.fillStyle=`rgba(${ur},${ug},${ub},1)`;ctx.fill();ctx.restore();
  }

  // Foam dots (deterministic per wave)
  ctx.save();
  const dotCount=isBig?80:50;
  for(let i=0;i<dotCount;i++){
    const hash=(ws.waveIdx*1000+777+i*7919)&65535;
    const dx=(hash/65535)*w;
    const hash2=(hash*31+5381)&65535;
    const dy=(hash2/65535-0.4)*40;
    const ey=waveY+(c.length>0?c[Math.min(dx|0,c.length-1)]:0)*0.9+dy;
    const radius=1+(((hash2*17+1013)&65535)/65535)*3;
    const alpha=(isBig?0.35:0.25)*Math.max(0,1-Math.abs(dy)/20);
    if(alpha<0.03)continue;
    ctx.globalAlpha=alpha;ctx.fillStyle='#F8F6F0';
    ctx.beginPath();ctx.arc(dx,ey,radius,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;ctx.restore();

  // Foam particles
  const foamPartAlpha=isBig?0.45:0.3;
  ctx.fillStyle='#FEFCF4';
  for(const fp of ws.foam){
    const r=0.3+fp.life*0.7;
    const alpha=fp.life*foamPartAlpha;
    if(alpha<0.02)continue;
    const fy=waveY+(c.length>0?c[Math.min(fp.x|0,c.length-1)]:0)*0.3+(fp.y||0);
    const subCount=2+(fp.rx|0);
    for(let t=0;t<subCount;t++){
      const a=fp.rot+t*1.9;
      const l=(0.3+t*0.25)*r*fp.rx*0.5;
      const ox=fp.x+Math.cos(a)*l,oy=fy+Math.sin(a)*l;
      const cr=(0.4+(t%3)*0.3)*r;
      ctx.globalAlpha=alpha*(0.6+(t&1)*0.4);
      ctx.beginPath();ctx.arc(ox,oy,cr,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.globalAlpha=1;

  // Wet sand darkening
  const sandDark = h*0.18+amp*h;
  ctx.globalAlpha=isBig?0.03:0.02;ctx.fillStyle='rgb(105,92,68)';
  ctx.fillRect(0,waveY,w,sandDark+10-waveY);ctx.globalAlpha=1;

  return waveY;
}

/* ── Vignette ── */
function applyVignette(ctx, w, h) {
  const e = Math.min(w,h)*0.13;
  ctx.save(); ctx.globalCompositeOperation='destination-in';
  const gH=ctx.createLinearGradient(0,0,w,0);
  gH.addColorStop(0,'rgba(0,0,0,0)');gH.addColorStop(e/w,'rgba(0,0,0,0.3)');gH.addColorStop(e*2/w,'rgba(0,0,0,0.85)');
  gH.addColorStop(1-e*2/w,'rgba(0,0,0,0.85)');gH.addColorStop(1-e/w,'rgba(0,0,0,0.3)');gH.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=gH;ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation='destination-in';
  const gV=ctx.createLinearGradient(0,0,0,h);
  gV.addColorStop(0,'rgba(0,0,0,0)');gV.addColorStop(e/h,'rgba(0,0,0,0.3)');gV.addColorStop(e*2/h,'rgba(0,0,0,0.85)');
  gV.addColorStop(1-e*2/h,'rgba(0,0,0,0.85)');gV.addColorStop(1-e/h,'rgba(0,0,0,0.3)');gV.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=gV;ctx.fillRect(0,0,w,h);
  ctx.restore();
}

/* ═══ Main Component ═══ */

export function BeachScene() {
  const sandRef = useRef(null);
  const overlayRef = useRef(null);
  const dataRef = useRef(null);
  const animRef = useRef(0);

  useEffect(() => {
    const sandCanvas = sandRef.current, ovCanvas = overlayRef.current;
    if (!sandCanvas||!ovCanvas) return;

    const rect = sandCanvas.getBoundingClientRect();
    const cssW = Math.round(rect.width), cssH = Math.round(rect.height);
    renderSand(sandCanvas, cssW, cssH);

    // Overlay canvas at 1x CSS resolution (source does NOT use DPR for overlay)
    const w = cssW, h = cssH;
    ovCanvas.width = w; ovCanvas.height = h;
    ovCanvas.style.width = w+'px'; ovCanvas.style.height = h+'px';

    // Shells (32, exact source placement)
    const r1 = prng(314159);
    const shells = Array.from({length:32},()=>{
      const type = Math.floor(r1()*SHELL_TYPES.length);
      return {
        x:(0.05+r1()*0.9)*w, y:(0.38+r1()*0.55)*h,
        size:10+r1()*26, rotation:r1()*Math.PI*2,
        type, alpha:0.5+r1()*0.35, cracked:false, crackT:0,
      };
    });

    // Crabs (8)
    const r2 = prng(271828);
    const crabs = Array.from({length:8},()=>({
      x:(0.1+r2()*0.8)*w, y:(0.55+r2()*0.38)*h,
      size:24+r2()*14, colorIdx:Math.floor(r2()*6),
      dir:r2()>0.5?1:-1, vx:(r2()-0.5)*40, vy:0,
      state:r2()<0.4?'idle':'walking', timer:1+r2()*2, frame:0,
    }));

    // Seaweed (9 clumps)
    const r3 = prng(161803);
    const seaweed = Array.from({length:9},()=>({
      x:(0.06+r3()*0.88)*w, y:h*(0.37+(r3()-0.5)*0.1),
      scaleX:8+r3()*16, scaleY:4+r3()*6,
      density:35+Math.floor(r3()*40), colorIdx:Math.floor(r3()*4), seed:Math.floor(r3()*10000),
    }));

    dataRef.current = { shells, crabs, seaweed };

    const ctx = ovCanvas.getContext('2d'); if(!ctx) return;
    let lastFrame=0, running=true;
    const start = performance.now();

    const frame = (now) => {
      if (!running) return;
      animRef.current = requestAnimationFrame(frame);
      if (now-lastFrame<1000/30) return;
      lastFrame=now;

      const dt = Math.min(0.05, 1/30);
      const time = waveState.time; // use wave state's own time
      ctx.clearRect(0,0,w,h);

      // Seaweed (behind waves)
      for (const sw of seaweed) drawSeaweed(ctx, sw, time);

      // Waves
      const waveY = drawWaves(ctx, w, h, time, dt);

      // Shells (use exact source draw functions, fade near wave)
      for (const shell of shells) {
        const distToWave = shell.y - waveY;
        ctx.save();
        ctx.translate(shell.x, shell.y);
        ctx.rotate(shell.rotation);
        ctx.globalAlpha = distToWave<0?0.08:distToWave<30?0.15+(distToWave/30)*0.4:0.5+Math.min(0.35,distToWave/200);

        if (shell.cracked && shell.crackT < 1) {
          shell.crackT = Math.min(1, shell.crackT + dt * 2.5);
          if (shell.crackT > 0.8) ctx.globalAlpha *= (1 - shell.crackT) / 0.2;
          SHELL_TYPES[shell.type].drawCracked(ctx, shell.size, shell.crackT);
        } else if (!shell.cracked) {
          SHELL_TYPES[shell.type].draw(ctx, shell.size);
        }
        ctx.restore();
      }

      // Crab AI + rendering
      for (const crab of crabs) {
        crab.timer -= dt;
        crab.frame += dt * 6;

        if (crab.state === 'idle') {
          crab.vx *= 0.85; crab.vy *= 0.85;
          if (crab.timer<=0) {
            crab.state='walking'; crab.timer=1+Math.random()*2;
            crab.vx = (40+Math.random()*90)*(Math.random()>0.5?1:-1);
            crab.vy = (Math.random()-0.5)*65;
            crab.dir = crab.vx>0?1:-1;
          }
        } else if (crab.state === 'walking') {
          if (crab.timer<=0) { crab.state='idle'; crab.timer=1+Math.random()*3; }
          if (Math.random()<0.8*dt) {
            crab.vx = (40+Math.random()*90)*(Math.random()>0.5?1:-1);
            crab.vy = (Math.random()-0.5)*65;
            crab.dir = crab.vx>0?1:-1;
          }
        } else if (crab.state === 'fleeing') {
          crab.vx *= 0.88; crab.vy *= 0.88;
          if (crab.timer<=0) { crab.state='idle'; crab.timer=1+Math.random()*2; }
        }

        crab.x += crab.vx*dt; crab.y += crab.vy*dt;
        crab.x = Math.max(25,Math.min(w-25,crab.x));
        crab.y = Math.max(h*0.42,Math.min(h-25,crab.y));

        // Shadow
        ctx.save();
        ctx.translate(crab.x, crab.y);
        ctx.beginPath(); ctx.ellipse(0, crab.size*0.15, crab.size*0.5, crab.size*0.12, 0, 0, Math.PI*2);
        ctx.fillStyle='rgba(80,50,20,0.1)'; ctx.fill();
        ctx.restore();

        drawCrab(ctx, crab);
      }

      applyVignette(ctx, w, h);
    };

    animRef.current = requestAnimationFrame(frame);
    return () => { running=false; cancelAnimationFrame(animRef.current); };
  }, []);

  // Click: crack shells + scare crabs
  const handleClick = useCallback((e) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect||!dataRef.current) return;
    const cx = e.clientX-rect.left, cy = e.clientY-rect.top;

    // Crack nearest shell
    for (const shell of dataRef.current.shells) {
      if (shell.cracked) continue;
      const dx=shell.x-cx, dy=shell.y-cy;
      if (dx*dx+dy*dy < (shell.size*2)*(shell.size*2)) {
        shell.cracked = true;
        break;
      }
    }

    // Scare crabs within 90px
    for (const crab of dataRef.current.crabs) {
      const dx=crab.x-cx, dy=crab.y-cy;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < 90) {
        crab.state='fleeing'; crab.timer=0.8;
        const angle = Math.atan2(dy, dx);
        crab.vx = Math.cos(angle)*260;
        crab.vy = Math.sin(angle)*78;
        crab.dir = crab.vx>0?1:-1;
      }
    }
  }, []);

  return (
    <Wrapper onClick={handleClick}>
      <SandCanvas ref={sandRef} />
      <OverlayCanvas ref={overlayRef} />
    </Wrapper>
  );
}
