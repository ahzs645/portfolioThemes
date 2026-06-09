import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 760 } });
const errs=[];
p.on('pageerror', e=>errs.push(e.message));
p.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
await p.goto('http://localhost:5191/vibe-coded', { waitUntil:'networkidle' });
await p.waitForTimeout(1500);
// frame rate over 1s
const fps = await p.evaluate(()=>new Promise(res=>{let n=0,s=performance.now();function f(){n++;if(performance.now()-s<1000)requestAnimationFrame(f);else res(n);}requestAnimationFrame(f);}));
// motion: diff two snapshots ~500ms apart (no mouse)
async function snap(){return p.evaluate(()=>{const c=document.querySelector('canvas');const x=c.getContext('2d');const d=x.getImageData(0,0,c.width,c.height).data;let acc=0;for(let i=0;i<d.length;i+=40)acc+=d[i];return acc;});}
const s1=await snap(); await p.waitForTimeout(500); const s2=await snap();
// mouse response: capture region, stir, capture region
async function region(){return p.evaluate(()=>{const c=document.querySelector('canvas');const x=c.getContext('2d');const d=x.getImageData(0,0,Math.floor(c.width/2),c.height).data;let acc=0,br=0;for(let i=0;i<d.length;i+=4){const v=d[i]+d[i+1]+d[i+2];acc+=v;if(v>200)br++;}return {acc,br};});}
const r1=await region();
for(let i=0;i<26;i++){await p.mouse.move(200+i*22,360+Math.sin(i*0.6)*180);await p.waitForTimeout(14);}
await p.waitForTimeout(120);
const r2=await region();
console.log('fps~',fps);
console.log('motion(no-mouse) snapDiff=', Math.abs(s2-s1), '(non-zero => animating)');
console.log('mouse brightDelta=', r2.br-r1.br, 'accDelta=', r2.acc-r1.acc);
console.log('errors', errs.join('|')||'none');
await b.close();
