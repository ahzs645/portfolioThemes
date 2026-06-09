/*
 * Self-contained WebGL fluid simulation adapted from Pavel Dobryakov's
 * "WebGL Fluid Simulation" (MIT License) — the same Navier–Stokes dye/velocity
 * advection used by 1800benson.ca. Trimmed to the features this theme needs:
 * pointer-drag splats, idle auto-splats, and a fixed rose/peach color palette
 * over a near-black background.
 *
 * createFluidSimulation(canvas, options) returns a cleanup function.
 */

function hexToRgb01(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

export function createFluidSimulation(canvas, options = {}) {
  const config = {
    // Higher sim resolution gives finer, smoother fold detail (the source reads
    // as smooth silk/satin, not big blobs).
    SIM_RESOLUTION: 192,
    DYE_RESOLUTION: 1024,
    // Moderate dissipation so the dye persists into a continuous folded "satin"
    // sheet (not isolated fading blobs). It can't blow out bright because the
    // DYE_CAP below is a hard display ceiling regardless of accumulation.
    DENSITY_DISSIPATION: 1.4,
    VELOCITY_DISSIPATION: 1.5,
    PRESSURE: 0.8,
    PRESSURE_ITERATIONS: 20,
    CURL: 18,
    DYE_INTENSITY: 0.045,
    // Hard ceiling on displayed dye (added to BACK_COLOR ≈ rgb(26,18,22) this
    // tops the lit fluid out at ≈ rgb(59,36,37), matching the source's lit red).
    DYE_CAP: { r: 35 / 255, g: 19 / 255, b: 15 / 255 },
    // Small splats so individual injections blend into the continuous sheet
    // instead of reading as big circular blooms.
    SPLAT_RADIUS: 0.0016 * (options.cursorSize ? options.cursorSize / 100 : 1),
    SPLAT_FORCE: 6000 * (options.mouseForce ? options.mouseForce / 20 : 1),
    // The cursor is the primary driver: it pushes hard and lays a brighter plume
    // so its swirls clearly focus around the pointer.
    CURSOR_FORCE: 2.2,
    CURSOR_DYE: 3.0,
    // Several gentle emitters keep the whole field filled with flowing dye so it
    // reads as continuous silk rather than sparse blobs.
    AMBIENT_FORCE: 0.5,
    AUTO_SPEED: options.autoSpeed ?? 0.3,
    AUTO_INTENSITY: options.autoIntensity ?? 1.5,
    BACK_COLOR: options.background ? hexToRgb01(options.background) : { r: 17 / 255, g: 17 / 255, b: 21 / 255 },
  };

  const palette = (options.colors || ['#FFD1CA', '#E8B4AB', '#4A3845']).map(hexToRgb01);
  // Weight the emitters heavily toward the dark plum (index 2) so it forms the
  // maroon base, with rose (1) as flowing highlights and peach (0) used rarely.
  const colorWeights = [2, 1, 2, 2, 1, 2, 0, 2, 1, 2];

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
    glc.clearColor(0, 0, 0, 1);

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
    const status = glc.checkFramebufferStatus(glc.FRAMEBUFFER);
    return status === glc.FRAMEBUFFER_COMPLETE;
  }

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  function createProgram(vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
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
    constructor(vs, fs) {
      this.program = createProgram(vs, fs);
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

  const copyShader = compileShader(
    gl.FRAGMENT_SHADER,
    `precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    void main () { gl_FragColor = texture2D(uTexture, vUv); }`,
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

  const displayShader = compileShader(
    gl.FRAGMENT_SHADER,
    `precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec3 uDyeCap;
    void main () {
      // Hard ceiling on the dye so it can NEVER render brighter than the
      // source's lit fluid, regardless of how much dye accumulates over time.
      vec3 c = min(texture2D(uTexture, vUv).rgb, uDyeCap);
      float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c, a);
    }`,
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

  const copyProgram = new Program(baseVertexShader, copyShader);
  const clearProgram = new Program(baseVertexShader, clearShader);
  const splatProgram = new Program(baseVertexShader, splatShader);
  const advectionProgram = new Program(baseVertexShader, advectionShader);
  const divergenceProgram = new Program(baseVertexShader, divergenceShader);
  const curlProgram = new Program(baseVertexShader, curlShader);
  const vorticityProgram = new Program(baseVertexShader, vorticityShader);
  const pressureProgram = new Program(baseVertexShader, pressureShader);
  const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);
  const displayProgram = new Program(baseVertexShader, displayShader);

  const blit = (() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
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

  const pointers = [{ id: -1, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0, deltaX: 0, deltaY: 0, down: false, moved: false, color: palette[0] }];

  let lastTime = (typeof performance !== 'undefined' ? performance.now() : 0);
  let running = true;
  let colorIndex = 0;

  // Several wandering emitters that continuously fill the field with dye, so
  // the whole screen carries flowing colour like the source (not sparse trails).
  const emitters = Array.from({ length: 5 }, (_, i) => ({
    x: 0.15 + Math.random() * 0.7,
    y: 0.15 + Math.random() * 0.7,
    angle: Math.random() * Math.PI * 2,
    ci: i,
  }));
  let autoLastSplat = 0;
  let lastUserInteraction = lastTime;

  function correctRadius(radius) {
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) return radius * aspectRatio;
    return radius;
  }

  function splat(x, y, dx, dy, color, radiusScale = 1) {
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS * radiusScale));
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
    const k = config.DYE_INTENSITY;
    gl.uniform3f(splatProgram.uniforms.color, color.r * k, color.g * k, color.b * k);
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

  function render() {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    // Paint the dark base color, then additively composite the dye on top.
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(config.BACK_COLOR.r, config.BACK_COLOR.g, config.BACK_COLOR.b, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    displayProgram.bind();
    gl.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
    gl.uniform3f(displayProgram.uniforms.uDyeCap, config.DYE_CAP.r, config.DYE_CAP.g, config.DYE_CAP.b);
    blit(null);
  }

  function applyInputs() {
    for (const p of pointers) {
      if (p.moved) {
        p.moved = false;
        // Cursor drives the field: strong velocity push + a brighter, larger
        // plume (always the highlight tone) so the swirls clearly focus on the
        // pointer path against the dark ambient field.
        const dx = p.deltaX * config.SPLAT_FORCE * config.CURSOR_FORCE;
        const dy = p.deltaY * config.SPLAT_FORCE * config.CURSOR_FORCE;
        const c = palette[0];
        const k = config.CURSOR_DYE;
        splat(p.texcoordX, p.texcoordY, dx, dy, { r: c.r * k, g: c.g * k, b: c.b * k }, 1.5);
      }
    }
  }

  function pickColor(i) {
    return palette[colorWeights[i % colorWeights.length] % palette.length];
  }

  function autoSplats(now) {
    // Gentle ambient emitters keep the red field alive, but fade out while the
    // user is actively moving so the cursor stays the focus.
    if (now - autoLastSplat < 24) return;
    autoLastSplat = now;
    const active = now - lastUserInteraction < 600;
    const force = config.SPLAT_FORCE * config.AMBIENT_FORCE * (active ? 0.25 : 1);
    const speed = 0.0006 * config.AUTO_SPEED * 60;
    for (const e of emitters) {
      e.angle += (Math.random() - 0.5) * 0.35;
      const nx = e.x + Math.cos(e.angle) * speed;
      const ny = e.y + Math.sin(e.angle) * speed;
      const dx = nx - e.x;
      const dy = ny - e.y;
      e.x = Math.min(Math.max(nx, 0.06), 0.94);
      e.y = Math.min(Math.max(ny, 0.06), 0.94);
      if (e.x <= 0.06 || e.x >= 0.94) e.angle = Math.PI - e.angle;
      if (e.y <= 0.06 || e.y >= 0.94) e.angle = -e.angle;
      splat(e.x, e.y, dx * force, dy * force, pickColor(e.ci++));
    }
  }

  let rafId;
  function update() {
    if (!running) return;
    const now = (typeof performance !== 'undefined' ? performance.now() : lastTime + 16);
    let dt = (now - lastTime) / 1000;
    dt = Math.min(dt, 0.016666);
    lastTime = now;
    autoSplats(now);
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
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
  }

  function onPointerMove(e) {
    const pointer = pointers[0];
    if (pointer.prevTexcoordX === 0 && pointer.prevTexcoordY === 0) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      pointer.texcoordX = (e.clientX * dpr) / canvas.width;
      pointer.texcoordY = 1.0 - (e.clientY * dpr) / canvas.height;
    }
    updatePointerMove(pointer, e.clientX, e.clientY);
    lastUserInteraction = (typeof performance !== 'undefined' ? performance.now() : lastTime);
  }

  // Pre-fill the field so the very first frame already shows a dense maroon
  // wash rather than building up from black.
  function seed() {
    for (let i = 0; i < 26; i += 1) {
      const color = pickColor(i);
      const x = Math.random();
      const y = Math.random();
      const dx = (Math.random() - 0.5) * 1400;
      const dy = (Math.random() - 0.5) * 1400;
      splat(x, y, dx, dy, color);
    }
  }

  resizeCanvas();
  seed();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('pointermove', onPointerMove);
  update();

  return function destroy() {
    running = false;
    window.cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('pointermove', onPointerMove);
    // Intentionally do NOT call WEBGL_lose_context here. Under React 18
    // StrictMode the effect mounts, unmounts, then remounts on the same canvas
    // DOM node; losing the context would leave the remount with a dead context
    // (a blank/white canvas). Dropping the listeners + stopping the rAF is
    // enough — the context is reclaimed when the canvas node is removed.
  };
}
