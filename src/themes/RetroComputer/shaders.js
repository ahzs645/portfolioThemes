// CRT effect shaders adapted from edh.dev retro-computer-website

export const crtVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const crtFragmentShader = `
#define PI 3.1415926538

#define LINE_SIZE 288.0
#define LINE_STRENGTH 0.05
#define LINE_OFFSET 2.0
#define NOISE_STRENGTH 0.2

uniform sampler2D uDiffuse;
uniform float uTime;
uniform float uProgress;
varying vec2 vUv;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float squareWave(float x) {
  return (
    (4.0 / PI * sin(PI * LINE_SIZE * x))
    + (4.0 / PI * 1.0 / 3.0 * sin(3.0 * PI * LINE_SIZE * x))
    + (4.0 / PI * 1.0 / 5.0 * sin(5.0 * PI * LINE_SIZE * x))
    - LINE_OFFSET
  ) * LINE_STRENGTH;
}

vec4 progress() {
  if (vUv.y < uProgress && vUv.y > uProgress - 0.2) {
    return vec4(0.1, 0.1, 0.1, 1.0) * (uProgress - vUv.y);
  } else {
    return vec4(0.0, 0.0, 0.0, 0.0);
  }
}

void main() {
  vec4 color = texture2D(uDiffuse, vUv);
  float r = rand(vUv * uTime);
  vec4 p = progress();

  // Fake bloom: sample neighbors and add soft glow
  float b = 0.003;
  vec4 glow = vec4(0.0);
  glow += texture2D(uDiffuse, vUv + vec2(-b, 0.0));
  glow += texture2D(uDiffuse, vUv + vec2( b, 0.0));
  glow += texture2D(uDiffuse, vUv + vec2(0.0, -b));
  glow += texture2D(uDiffuse, vUv + vec2(0.0,  b));
  glow += texture2D(uDiffuse, vUv + vec2(-b, -b));
  glow += texture2D(uDiffuse, vUv + vec2( b, -b));
  glow += texture2D(uDiffuse, vUv + vec2(-b,  b));
  glow += texture2D(uDiffuse, vUv + vec2( b,  b));
  glow /= 8.0;

  vec4 bloomed = color + glow * 0.6;

  gl_FragColor = bloomed + (vec4(r, r, r, 0.0) * (p.a + NOISE_STRENGTH)) + squareWave(vUv.y);
}
`;

export const lagFragmentShader = `
#define LAG 0.8
#define LAG_INVERSE 0.2

uniform sampler2D uDiffuse;
uniform sampler2D uLagTex;
varying vec2 vUv;

void main() {
  vec4 Diffuse = texture2D(uDiffuse, vUv);
  vec4 LagTex = texture2D(uLagTex, vUv);
  gl_FragColor = (Diffuse * LAG_INVERSE) + (LagTex * LAG);
}
`;
