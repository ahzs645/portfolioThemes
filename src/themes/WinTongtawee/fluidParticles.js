/*
 * WebGL fluid-driven particle field, adapted from Pavel Dobryakov's "WebGL
 * Fluid Simulation" (MIT License) — the same Navier–Stokes velocity/dye
 * advection used by the BensonYan theme's fluidSimulation.js. Here the dye is
 * monochrome and, instead of being blitted to screen, it drives a fixed grid
 * of points: each point samples the dye at its location to set its brightness
 * and size, so a sparse field of white dots lights up where the (cursor-driven)
 * fluid flows. Points are dampened over the content card so text stays legible.
 * This recreates the background effect on wintongtawee.dev.
 *
 * createFluidParticles(canvas, options) returns a cleanup function.
 * options.getContentRect() may return a DOMRect (in CSS px) of the content
 * column to dampen, or null for no dampening.
 */

export function createFluidParticles(canvas, options = {}) {
  // Tuned to the source: a tiny constant dye injection, a very gentle push, and
  // fast velocity decay so the field lights up softly under the cursor and
  // settles the moment you stop. No idle animation — it is purely mouse-driven.
  const config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,
    DENSITY_DISSIPATION: 0.35, // dye lingers (source dye *0.995/step); it stays dim
    VELOCITY_DISSIPATION: 4.5, // motion calms quickly (source velocity *0.92/step)
    PRESSURE: 0.8,
    PRESSURE_ITERATIONS: 2, // source: 2 — light, so flow doesn't spread far
    CURL: 24,
    SPLAT_RADIUS: 0.0009, // source: 0.001 — tight splats
    SPLAT_FORCE: options.splatForce ?? 90, // gentle push (source pushes delta*12)
    DYE_AMOUNT: options.dyeAmount ?? 0.12, // source dye splat color (constant, dim)
    MOVE_DEADZONE: 0.0008, // ignore micro-jitter (source: |delta|>0.001)
    GRID_SPACING: options.gridSpacing ?? 8, // CSS px between points (source: 8)
    POINT_MAX: options.pointMax ?? 5, // source: mix(1.0, 5.0, brightness)
    CONTENT_HALF_WIDTH: options.contentHalfWidth ?? 280, // CSS px each side of center
  };

  const getContentRect =
    typeof options.getContentRect === 'function' ? options.getContentRect : () => null;

  const { gl, ext } = getWebGLContext(canvas);
  if (!gl) return () => {};

  function getWebGLContext(c) {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let glc = c.getContext('webgl2', params);
    const isWebGL2 = !!glc;
    if (!isWebGL2) glc = c.getContext('webgl', params) || c.getContext('experimental-webgl', params);
    if (!glc) return { gl: null, ext: null };

    let halfFloat;
    let supportLinearFiltering;
    if (isWebGL2) {
      glc.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = glc.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = glc.getExtension('OES_texture_half_float');
      supportLinearFiltering = glc.getExtension('OES_texture_half_float_linear');
    }
    glc.clearColor(0, 0, 0, 0);

    const halfFloatTexType = isWebGL2 ? glc.HALF_FLOAT : halfFloat && halfFloat.HALF_FLOAT_OES;
    let formatRGBA;
    let formatRG;
    let formatR;
    if (isWebGL2) {
      formatRGBA = getSupportedFormat(glc, glc.RGBA16F, glc.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(glc, glc.RG16F, glc.RG, halfFloatTexType);
      formatR = getSupportedFormat(glc, glc.R16F, glc.RED, halfFloatTexType);
    } else {
      formatRGBA = getSupportedFormat(glc, glc.RGBA, glc.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(glc, glc.RGBA, glc.RGBA, halfFloatTexType);
      formatR = getSupportedFormat(glc, glc.RGBA, glc.RGBA, halfFloatTexType);
    }

    return {
      gl: glc,
      ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering, isWebGL2 },
    };
  }

  function getSupportedFormat(glc, internalFormat, format, type) {
    if (!supportRenderTextureFormat(glc, internalFormat, format, type)) {
      if (glc.RG16F !== undefined) {
        switch (internalFormat) {
          case glc.R16F:
            return getSupportedFormat(glc, glc.RG16F, glc.RG, type);
          case glc.RG16F:
            return getSupportedFormat(glc, glc.RGBA16F, glc.RGBA, type);
          default:
            return null;
        }
      }
      return null;
    }
    return { internalFormat, format };
  }

  function supportRenderTextureFormat(glc, internalFormat, format, type) {
    const texture = glc.createTexture();
    glc.bindTexture(glc.TEXTURE_2D, texture);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MIN_FILTER, glc.NEAREST);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MAG_FILTER, glc.NEAREST);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_S, glc.CLAMP_TO_EDGE);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_T, glc.CLAMP_TO_EDGE);
    glc.texImage2D(glc.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = glc.createFramebuffer();
    glc.bindFramebuffer(glc.FRAMEBUFFER, fbo);
    glc.framebufferTexture2D(glc.FRAMEBUFFER, glc.COLOR_ATTACHMENT0, glc.TEXTURE_2D, texture, 0);
    return glc.checkFramebufferStatus(glc.FRAMEBUFFER) === glc.FRAMEBUFFER_COMPLETE;
  }

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  function createProgram(vs, fs, bindAttribs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    if (bindAttribs) {
      for (const [loc, name] of bindAttribs) gl.bindAttribLocation(program, loc, name);
    }
    gl.linkProgram(program);
    return program;
  }

  function getUniforms(program) {
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i += 1) {
      const name = gl.getActiveUniform(program, i).name;
      uniforms[name] = gl.getUniformLocation(program, name);
    }
    return uniforms;
  }

  class Program {
    constructor(vs, fs, bindAttribs) {
      this.program = createProgram(vs, fs, bindAttribs);
      this.uniforms = getUniforms(this.program);
    }

    bind() {
      gl.useProgram(this.program);
    }
  }

  const baseVertexShader = compileShader(
    gl.VERTEX_SHADER,
    `precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }`,
  );

  const clearShader = compileShader(
    gl.FRAGMENT_SHADER,
    `precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`,
  );

  const splatShader = compileShader(
    gl.FRAGMENT_SHADER,
    `precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
      vec2 p = vUv - point.xy;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.0);
    }`,
  );

  const advectionShader = compileShader(
    gl.FRAGMENT_SHADER,
    `precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;
    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
      vec2 st = uv / tsize - 0.5;
      vec2 iuv = floor(st);
      vec2 fuv = fract(st);
      vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
      vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
      vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
      vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
      return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }
    void main () {
      vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
      vec4 result = bilerp(uSource, coord, dyeTexelSize);
      float decay = 1.0 + dissipation * dt;
      gl_FragColor = result / decay;
    }`,
  );

  const divergenceShader = compileShader(
    gl.FRAGMENT_SHADER,
    `precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) { L = -C.x; }
      if (vR.x > 1.0) { R = -C.x; }
      if (vT.y > 1.0) { T = -C.y; }
      if (vB.y < 0.0) { B = -C.y; }
      float div = 0.5 * (R - L + T - B);
      gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }`,
  );

  const curlShader = compileShader(
    gl.FRAGMENT_SHADER,
    `precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      float vorticity = R - L - T + B;
      gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }`,
  );

  const vorticityShader = compileShader(
    gl.FRAGMENT_SHADER,
    `precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity += force * dt;
      velocity = min(max(velocity, -1000.0), 1000.0);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }`,
  );

  const pressureShader = compileShader(
    gl.FRAGMENT_SHADER,
    `precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float divergence = texture2D(uDivergence, vUv).x;
      float pressure = (L + R + B + T - divergence) * 0.25;
      gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }`,
  );

  const gradientSubtractShader = compileShader(
    gl.FRAGMENT_SHADER,
    `precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity.xy -= vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }`,
  );

  // Particle pass: a fixed NDC grid of points sampling the dye for brightness.
  // Math mirrors the original wintongtawee.dev shaders (pow(dye,1.4)*0.35,
  // a 0.25 content dampen, a soft round point fading from a 0.3 gray floor to
  // white), drawn with additive blending for a soft glow.
  const particleVertexShader = compileShader(
    gl.VERTEX_SHADER,
    `precision highp float;
    attribute vec2 aGrid;
    uniform sampler2D uDye;
    uniform float uPointMax;
    uniform float uDpr;
    uniform vec2 uPad;          // soft falloff width (NDC) at content edges
    uniform vec4 uContentBounds; // left, right, top, bottom in NDC
    varying float vBrightness;
    void main () {
      vec2 uv = aGrid * 0.5 + 0.5;
      float dye = length(texture2D(uDye, uv).rgb);
      float brightness = pow(dye, 1.4) * 0.35;

      // Dampen inside the central content band so the text stays readable.
      float dL = smoothstep(0.0, uPad.x, aGrid.x - uContentBounds.x);
      float dR = smoothstep(0.0, uPad.x, uContentBounds.y - aGrid.x);
      float dT = smoothstep(0.0, uPad.y, uContentBounds.z - aGrid.y);
      float dB = smoothstep(0.0, uPad.y, aGrid.y - uContentBounds.w);
      float inside = dL * dR * dT * dB;
      float dampen = mix(1.0, 0.25, inside);
      brightness *= dampen;

      brightness = clamp(brightness, 0.0, 1.0);
      gl_PointSize = brightness < 0.01 ? 0.0 : mix(1.0, uPointMax, brightness * dampen) * uDpr;
      gl_Position = vec4(aGrid, 0.0, 1.0);
      vBrightness = brightness;
    }`,
  );

  const particleFragmentShader = compileShader(
    gl.FRAGMENT_SHADER,
    `precision mediump float;
    varying float vBrightness;
    void main () {
      if (vBrightness < 0.01) discard;
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;
      float edgeAlpha = 1.0 - smoothstep(0.35, 0.5, dist);
      vec3 color = vec3(mix(0.3, 1.0, vBrightness));
      float alpha = edgeAlpha * vBrightness;
      gl_FragColor = vec4(color, alpha);
    }`,
  );

  const clearProgram = new Program(baseVertexShader, clearShader);
  const splatProgram = new Program(baseVertexShader, splatShader);
  const advectionProgram = new Program(baseVertexShader, advectionShader);
  const divergenceProgram = new Program(baseVertexShader, divergenceShader);
  const curlProgram = new Program(baseVertexShader, curlShader);
  const vorticityProgram = new Program(baseVertexShader, vorticityShader);
  const pressureProgram = new Program(baseVertexShader, pressureShader);
  const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);
  const particleProgram = new Program(particleVertexShader, particleFragmentShader, [[1, 'aGrid']]);

  // Full-screen quad used by every simulation pass (attribute location 0).
  let quadVertexBuffer;
  let quadIndexBuffer;
  const blit = (() => {
    quadVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    quadIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    return (target) => {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  })();

  // Restore the quad buffer/attribute after a particle draw so blit() works.
  function bindQuad() {
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIndexBuffer);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
  }

  let dye;
  let velocity;
  let divergence;
  let curl;
  let pressure;

  function createFBO(w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const texelSizeX = 1.0 / w;
    const texelSizeY = 1.0 / h;
    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX,
      texelSizeY,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  function createDoubleFBO(w, h, internalFormat, format, type, param) {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = createFBO(w, h, internalFormat, format, type, param);
    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() {
        return fbo1;
      },
      set read(value) {
        fbo1 = value;
      },
      get write() {
        return fbo2;
      },
      set write(value) {
        fbo2 = value;
      },
      swap() {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      },
    };
  }

  function getResolution(resolution) {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);
    if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min };
    return { width: min, height: max };
  }

  function initFramebuffers() {
    const simRes = getResolution(config.SIM_RESOLUTION);
    const dyeRes = getResolution(config.DYE_RESOLUTION);
    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const rg = ext.formatRG;
    const r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    gl.disable(gl.BLEND);

    dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
  }

  initFramebuffers();

  // ---- Particle grid -------------------------------------------------------
  const gridBuffer = gl.createBuffer();
  let gridCount = 0;

  function buildGrid() {
    // Mirror the source: world grid of step px, spanning (size + 80) so the
    // field overscans the viewport, mapped from centered world px to NDC.
    const w = window.innerWidth;
    const h = window.innerHeight;
    const step = config.GRID_SPACING;
    const dWidth = w + 80;
    const dHeight = h + 80;
    const cols = Math.max(2, Math.ceil(dWidth / step));
    const rows = Math.max(2, Math.ceil(dHeight / step));
    const data = new Float32Array(cols * rows * 2);
    let i = 0;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const worldX = step * x - dWidth / 2;
        const worldY = step * y - dHeight / 2;
        data[i] = worldX / (w / 2); // → NDC
        data[i + 1] = worldY / (h / 2);
        i += 2;
      }
    }
    gridCount = cols * rows;
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }

  const pointers = [{ id: -1, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0, deltaX: 0, deltaY: 0, moved: false }];
  // Source injects a constant, dim gray dye regardless of cursor speed — this is
  // the main reason the field stays subtle rather than blowing out to white.
  const DYE = { r: config.DYE_AMOUNT, g: config.DYE_AMOUNT, b: config.DYE_AMOUNT };

  let lastTime = typeof performance !== 'undefined' ? performance.now() : 0;
  let running = true;

  function splat(x, y, dx, dy, color) {
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProgram.uniforms.aspectRatio, 1.0); // source uses aspect 1
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(splatProgram.uniforms.radius, config.SPLAT_RADIUS);
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
    blit(dye.write);
    dye.swap();
  }

  function step(dt) {
    gl.disable(gl.BLEND);

    curlProgram.bind();
    gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    vorticityProgram.bind();
    gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    divergenceProgram.bind();
    gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    pressureProgram.bind();
    gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i += 1) {
      gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    gradienSubtractProgram.bind();
    gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    advectionProgram.bind();
    gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0));
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
  }

  // Content bounds, in NDC: a centered vertical band (full height) the width of
  // the content column, matching the source's ±280px, top/bottom = ±height/2.
  // If a live content rect is provided we center the band on it; otherwise it
  // stays screen-centered.
  function contentBoundsNDC() {
    const w = window.innerWidth;
    const halfBand = (config.CONTENT_HALF_WIDTH / w) * 2; // CSS px → NDC half-width
    let centerNDC = 0;
    const rect = getContentRect();
    if (rect && rect.width) {
      centerNDC = ((rect.left + rect.width / 2) / w) * 2 - 1;
    }
    return [centerNDC - halfBand, centerNDC + halfBand, 1, -1];
  }

  function render() {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive glow (source: THREE.AdditiveBlending)

    particleProgram.bind();
    const bounds = contentBoundsNDC();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    gl.uniform1i(particleProgram.uniforms.uDye, dye.read.attach(0));
    gl.uniform1f(particleProgram.uniforms.uPointMax, config.POINT_MAX);
    gl.uniform1f(particleProgram.uniforms.uDpr, dpr);
    // Source falloff: padX 60px, padY 40px (world) → NDC.
    gl.uniform2f(particleProgram.uniforms.uPad, (60 / window.innerWidth) * 2, (40 / window.innerHeight) * 2);
    gl.uniform4f(particleProgram.uniforms.uContentBounds, bounds[0], bounds[1], bounds[2], bounds[3]);

    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, gridCount);
    gl.disableVertexAttribArray(1);

    gl.disable(gl.BLEND);
    bindQuad();
  }

  // Mouse-only: a splat is emitted only when the cursor actually moves past a
  // small deadzone. No idle drift — the field settles when the cursor stops.
  function applyInputs() {
    for (const p of pointers) {
      if (p.moved) {
        p.moved = false;
        const dx = p.deltaX * config.SPLAT_FORCE;
        const dy = p.deltaY * config.SPLAT_FORCE;
        splat(p.texcoordX, p.texcoordY, dx, dy, DYE);
      }
    }
  }

  let rafId;
  function update() {
    if (!running) return;
    const now = typeof performance !== 'undefined' ? performance.now() : lastTime + 16;
    let dt = (now - lastTime) / 1000;
    dt = Math.min(dt, 0.05); // source clamps to 0.05
    lastTime = now;
    applyInputs();
    step(dt);
    render();
    rafId = window.requestAnimationFrame(update);
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      initFramebuffers();
    }
    buildGrid();
  }

  function updatePointerMove(pointer, x, y) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = (x * dpr) / canvas.width;
    pointer.texcoordY = 1.0 - (y * dpr) / canvas.height;
    let dX = pointer.texcoordX - pointer.prevTexcoordX;
    const dY = pointer.texcoordY - pointer.prevTexcoordY;
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio < 1) dX *= aspectRatio;
    pointer.deltaX = dX;
    pointer.deltaY = aspectRatio > 1 ? dY / aspectRatio : dY;
    pointer.moved =
      Math.abs(pointer.deltaX) > config.MOVE_DEADZONE ||
      Math.abs(pointer.deltaY) > config.MOVE_DEADZONE;
  }

  function onPointerMove(e) {
    const pointer = pointers[0];
    if (pointer.prevTexcoordX === 0 && pointer.prevTexcoordY === 0) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      pointer.texcoordX = (e.clientX * dpr) / canvas.width;
      pointer.texcoordY = 1.0 - (e.clientY * dpr) / canvas.height;
    }
    updatePointerMove(pointer, e.clientX, e.clientY);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('pointermove', onPointerMove);
  update();

  return function destroy() {
    running = false;
    window.cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('pointermove', onPointerMove);
    // Like BensonYan's sim: don't lose the GL context here so React 18
    // StrictMode's mount→unmount→remount on the same canvas survives.
  };
}
