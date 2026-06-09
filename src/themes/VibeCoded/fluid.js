/*
 * Compact Stam "stable fluids" solver (semi-Lagrangian advection + Jacobi
 * pressure projection) reproducing vibe-coded.com's WebGPU fluid: the pointer
 * injects velocity + dye (splatForce / splatRadius), drifting "ball" emitters
 * keep it alive, and dissipation fades it back down. Runs on a coarse grid; the
 * renderer bilinearly samples the density field into ASCII cells.
 */
export class Fluid {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    const n = w * h;
    this.vx = new Float32Array(n);
    this.vy = new Float32Array(n);
    this.vx0 = new Float32Array(n);
    this.vy0 = new Float32Array(n);
    this.d = new Float32Array(n);
    this.d0 = new Float32Array(n);
    this.p = new Float32Array(n);
    this.div = new Float32Array(n);
    this.curl = new Float32Array(n);
    this.iters = 18;
    this.velDiss = 0.986;
    this.denDiss = 0.992;
  }

  clampX(x) {
    return x < 0 ? 0 : x >= this.w ? this.w - 1 : x;
  }
  clampY(y) {
    return y < 0 ? 0 : y >= this.h ? this.h - 1 : y;
  }

  // Inject force + dye in a soft radius (one pointer move or ball emit).
  splat(cx, cy, dx, dy, amt, radius) {
    const { w, h, vx, vy, d } = this;
    const r2 = radius * radius;
    const x0 = Math.max(0, Math.floor(cx - radius));
    const x1 = Math.min(w - 1, Math.ceil(cx + radius));
    const y0 = Math.max(0, Math.floor(cy - radius));
    const y1 = Math.min(h - 1, Math.ceil(cy + radius));
    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        const ax = x - cx;
        const ay = y - cy;
        const dd = ax * ax + ay * ay;
        if (dd > r2) continue;
        const f = Math.exp(-dd / (r2 * 0.42));
        const i = x + y * w;
        vx[i] += dx * f;
        vy[i] += dy * f;
        d[i] += amt * f;
      }
    }
  }

  sampleBilinear(field, x, y) {
    const { w, h } = this;
    if (x < 0) x = 0;
    else if (x > w - 1.001) x = w - 1.001;
    if (y < 0) y = 0;
    else if (y > h - 1.001) y = h - 1.001;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const i00 = x0 + y0 * w;
    const i10 = i00 + 1;
    const i01 = i00 + w;
    const i11 = i01 + 1;
    const a = field[i00] + (field[i10] - field[i00]) * fx;
    const b = field[i01] + (field[i11] - field[i01]) * fx;
    return a + (b - a) * fy;
  }

  advect(dst, src, dt) {
    const { w, h, vx, vy } = this;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const i = x + y * w;
        const px = x - dt * vx[i];
        const py = y - dt * vy[i];
        dst[i] = this.sampleBilinear(src, px, py);
      }
    }
  }

  project() {
    const { w, h, vx, vy, p, div } = this;
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const i = x + y * w;
        div[i] = -0.5 * (vx[i + 1] - vx[i - 1] + vy[i + w] - vy[i - w]);
        p[i] = 0;
      }
    }
    for (let k = 0; k < this.iters; k += 1) {
      for (let y = 1; y < h - 1; y += 1) {
        for (let x = 1; x < w - 1; x += 1) {
          const i = x + y * w;
          p[i] = (div[i] + p[i - 1] + p[i + 1] + p[i - w] + p[i + w]) * 0.25;
        }
      }
    }
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const i = x + y * w;
        vx[i] -= 0.5 * (p[i + 1] - p[i - 1]);
        vy[i] -= 0.5 * (p[i + w] - p[i - w]);
      }
    }
  }

  // Vorticity confinement — re-injects the small swirls numerical diffusion
  // eats, giving the turbulent, curling smoke look (source param: curl 1.05).
  vorticity(strength) {
    const { w, h, vx, vy, curl } = this;
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const i = x + y * w;
        curl[i] = vy[i + 1] - vy[i - 1] - (vx[i + w] - vx[i - w]);
      }
    }
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const i = x + y * w;
        const dx = Math.abs(curl[i + 1]) - Math.abs(curl[i - 1]);
        const dy = Math.abs(curl[i + w]) - Math.abs(curl[i - w]);
        const len = Math.hypot(dx, dy) + 1e-5;
        const nx = dx / len;
        const ny = dy / len;
        vx[i] += strength * ny * curl[i];
        vy[i] -= strength * nx * curl[i];
      }
    }
  }

  step(dt, curlStrength = 0) {
    const { vx, vy, vx0, vy0, d, d0, velDiss, denDiss } = this;
    if (curlStrength > 0) this.vorticity(curlStrength);
    this.project();
    vx0.set(vx);
    vy0.set(vy);
    this.advect(vx, vx0, dt);
    this.advect(vy, vy0, dt);
    this.project();
    d0.set(d);
    this.advect(d, d0, dt);
    const n = this.w * this.h;
    for (let i = 0; i < n; i += 1) {
      vx[i] *= velDiss;
      vy[i] *= velDiss;
      d[i] *= denDiss;
    }
  }
}
