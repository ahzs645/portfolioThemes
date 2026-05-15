const includes = `
float random (in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise2d(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u*u*(3.0-2.0*u);
  float res = mix(
    mix(random(ip), random(ip+vec2(1.0,0.0)), u.x),
    mix(random(ip+vec2(0.0,1.0)), random(ip+vec2(1.0,1.0)), u.x),
    u.y
  );
  return res*res;
}

float noise (in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
`;

export const heroFrag = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform sampler2D texture0;
uniform float u_textureX;
uniform float u_textureY;
uniform float u_scroll;
uniform float u_effectType;
varying vec2 v_texcoord;

${includes}

float fbm (in vec2 st, in float extra) {
  float value = 0.0;
  float amplitude = .6;
  for (int i = 0; i < 2; i++) {
    value += amplitude * noise(st)*1.1 + extra;
    st *= 3.4;
    amplitude *= 0.5;
  }
  return value;
}

void main(void) {
  float textureAspect = u_textureX / u_textureY;
  float frameAspect = u_resolution.x / u_resolution.y;
  float scaleX = 1.0;
  float scaleY = 1.0;
  float textureFrameRatio = textureAspect / frameAspect;
  bool landscapeFrame = u_resolution.x >= u_resolution.y;

  if (landscapeFrame) {
    scaleX = 1.0 / textureFrameRatio;
  } else {
    scaleY = textureFrameRatio;
  }

  vec2 uv = v_texcoord;
  uv.y *= -1.0;
  vec2 mouse = u_mouse / u_resolution;
  mouse.y *= -1.0;
  float dist = mix(0.0, 1.0, distance(mouse, uv));
  vec2 mouseDelta = uv - mouse;
  float mouseRadius = max(0.001, length(mouseDelta));
  float mouseWake = smoothstep(0.62, 0.0, mouseRadius);
  vec2 mouseWarp = normalize(mouseDelta + vec2(0.001)) * mouseWake * 0.035;

  vec4 foreground = vec4(0.7098039216,0.8137254902,0.5098039216,1.0);
  vec4 background = vec4(0.275,0.275,0.1,1.0);
  vec4 background1 = vec4(0.24,0.2,0.25,1.0);
  vec4 background2 = vec4(0.2666666667,0.2156862745,0.1882352941,1.0);
  vec4 background3 = vec4(0.2666666667,0.2156862745,0.1282352941,1.0);

  if (u_effectType == 1.0) {
    background = background1;
  } else if (u_effectType == 2.0) {
    background = background2;
  } else if (u_effectType == 3.0) {
    background = background3;
  }

  vec2 image_uv = (v_texcoord + mouseWarp) * vec2(scaleX, scaleY);
  image_uv += vec2(sin(uv.y + u_time*2.0) * 0.02, sin(uv.x*3.0 + u_time) * 0.03);
  image_uv *= 2.0;
  if (landscapeFrame) {
    image_uv.y -= 0.5;
    image_uv.x -= 0.2;
  } else {
    image_uv.x -= 0.1;
    image_uv.y -= 0.1;
  }

  float image_dist = mix(0.0, 1.0, distance(vec2(mouse.x, -mouse.y), image_uv));
  image_uv += 0.1*image_dist - 0.05;

  vec4 image_color = texture2D(texture0, image_uv);
  if (image_uv.x <= 0.0 || image_uv.y <= 0.0 || image_uv.x >= 1.0 || image_uv.y >= 1.0) {
    image_color = vec4(0.0, 0.0, 0.0, 0.0);
  }
  image_color.a = step(0.2, image_color.a);

  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  vec2 p = st * 2.65;
  p += vec2(sin(st.y * 7.0 + u_time * 0.55), cos(st.x * 6.0 - u_time * 0.45)) * 0.11;
  p += mouseWarp * vec2(3.2, -2.4);

  float warpA = fbm(p + vec2(u_time * 0.045, -u_time * 0.035), dist * 0.03);
  float warpB = fbm(vec2(p.y, p.x) * 1.35 + warpA * 1.8 - u_time * 0.04, image_color.a * 0.12);
  float field = fbm(p * 1.15 + vec2(warpA, warpB) * 2.4, image_color.a * 0.2 + u_scroll * 0.08);
  float rings = abs(sin((field + warpA * 0.35 + st.x * 0.13) * 27.0));
  float contour = smoothstep(0.06, 0.0, rings);
  float soft = smoothstep(0.85, 0.12, rings);
  float logoCut = image_color.a * (0.18 + 0.08 * sin(u_time * 2.0));
  float ripple = sin(mouseRadius * 36.0 - u_time * 5.0) * mouseWake * 0.08;
  float amount = clamp(0.92 - soft * 0.16 - contour * 0.30 - ripple + logoCut + uv.x * 0.06, 0.0, 1.0);
  vec4 background_color = mix(foreground, background, amount);
  gl_FragColor = background_color;
}
`;

export const miniFrag = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_scroll;
varying vec2 v_texcoord;

${includes}

float fbm (in vec2 st) {
  float value = 0.0;
  float amplitude = .5;
  for (int i = 0; i < 6; i++) {
    value += amplitude * abs(noise(st) - 0.5)*3.0;
    st *= 2.0;
    amplitude *= .5;
  }
  return value;
}

void main(void) {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  vec2 mouse = u_mouse / u_resolution;
  vec2 mouseField = vec2(mouse.x * u_resolution.x / u_resolution.y, mouse.y);
  vec2 delta = st - mouseField;
  float dist = length(delta);
  float mouseWake = smoothstep(0.55, 0.0, dist);
  st += normalize(delta + vec2(0.001)) * mouseWake * 0.12;
  vec4 foreground = vec4(0.7098039216,0.8137254902,0.5098039216,1.0);
  vec4 background = vec4(0.275,0.275,0.1 + u_scroll - 1.0,1.0);
  float fbmified = fbm(vec2(fbm(st), fbm(vec2(st.y, st.x)))*20.0 + u_time + u_scroll*10.0 + dist*0.9);
  gl_FragColor = mix(foreground, background, fbmified);
}
`;

export const introFrag = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;
uniform sampler2D texture4;
uniform float u_scroll;
varying vec2 v_texcoord;

${includes}

float fbm (in vec2 st) {
  float value = 0.0;
  float amplitude = .5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise(st);
    st *= 2.0;
    amplitude *= .5;
  }
  return value;
}

vec2 get_image_uv(vec2 textureSize) {
  float textureAspect = textureSize.x / textureSize.y;
  float frameAspect = u_resolution.x / u_resolution.y;
  float scaleX = 1.0;
  float scaleY = 1.0;
  float extraX = 0.0;
  float extraY = 0.0;
  float textureFrameRatio = textureAspect / frameAspect;
  if (textureFrameRatio < 1.0) {
    scaleY = textureFrameRatio;
    extraY = (scaleY - 1.0) / 2.0;
  } else {
    scaleX = 1.0 / textureFrameRatio;
    extraX = (scaleX - 1.0) / 2.0;
  }
  vec2 image_uv = v_texcoord * vec2(scaleX, scaleY);
  image_uv -= vec2(extraX, extraY);
  return image_uv;
}

void main(void) {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  vec2 mouse = u_mouse / u_resolution;
  vec2 mouseDelta = v_texcoord - mouse;
  float dist = length(mouseDelta);
  float mouseWake = smoothstep(0.58, 0.0, dist);
  float transitionAmt = smoothstep(-0.3, 1.0, fract(u_scroll)) * 2.0 - 1.0;
  float adjustedTime = u_time*0.05;
  vec2 uv_fbm = (3.0 - 2.0*st);
  float grain = noise2d(sin(v_texcoord * u_time)*10000.0 + 300.0);
  uv_fbm += normalize(mouseDelta + vec2(0.001)) * mouseWake * 0.45;
  float amount = fbm(vec2(adjustedTime*0.05, fbm(uv_fbm * fbm(uv_fbm*3.0 + grain*0.04) + adjustedTime*0.3 + sin(transitionAmt*0.3))*50.0 - 0.6) + 4.0 + adjustedTime*0.2 + dist*2.0 + mouseWake * 0.5) + transitionAmt;

  vec4 image1 = texture2D(texture1, get_image_uv(vec2(2000.0, 1370.0)));
  vec4 image2 = texture2D(texture2, get_image_uv(vec2(2000.0, 1470.0)));
  vec4 image3 = texture2D(texture3, get_image_uv(vec2(2000.0, 1333.0)));
  vec4 image4 = texture2D(texture4, get_image_uv(vec2(2000.0, 1333.0)));
  vec4 first_image = vec4(0.0, 0.0, 0.0, 1.0);
  vec4 second_image = image1;

  if (u_scroll >= 1.0 && u_scroll <= 2.0) {
    first_image = image1;
    second_image = image2;
  }
  if (u_scroll >= 2.0 && u_scroll <= 3.0) {
    first_image = image2;
    second_image = image3;
  }
  if (u_scroll >= 3.0) {
    first_image = image3;
    second_image = image4;
  }
  gl_FragColor = mix(first_image, second_image, clamp(amount, 0.0, 1.0));
}
`;

export const titleFrag = `
precision highp float;

uniform vec2 u_resolution;
uniform sampler2D texture0;
uniform float image_size_x;
uniform float image_size_y;
uniform float u_scroll;
varying vec2 v_texcoord;

${includes}

void main(void) {
  float textureAspect = image_size_x / image_size_y;
  float frameAspect = u_resolution.x / u_resolution.y;
  float scaleX = 1.0;
  float scaleY = 1.0;
  float textureFrameRatio = textureAspect / frameAspect;
  if (u_resolution.x >= u_resolution.y) {
    scaleY = textureFrameRatio;
  } else {
    scaleX = 1.0 / textureFrameRatio;
  }

  vec2 image_scale = vec2(scaleX, scaleY) * 1.5;
  vec2 extra_uv = (image_scale - 1.0) / 2.0;
  vec2 image_uv = v_texcoord * image_scale - extra_uv;
  float grain = noise2d(sin(v_texcoord)*60.0 + 5.0);
  vec2 distortionAmt = vec2(noise2d(image_uv*100.0) - 0.5) * vec2(u_scroll*1.7, u_scroll*0.4);
  image_uv += distortionAmt * grain;
  vec4 image_color = texture2D(texture0, image_uv);
  if (image_uv.x < 0.0 || image_uv.y < 0.0 || image_uv.x > 1.0 || image_uv.y > 1.0) {
    image_color = vec4(0.0);
  }
  gl_FragColor = image_color;
}
`;
