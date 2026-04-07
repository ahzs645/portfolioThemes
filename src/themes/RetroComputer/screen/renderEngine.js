import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import Lag from './lag';
import ShaderToScreen from './shaderToScreen';
import { noiseFragmentShader, vertexShader } from './shaders';

export default function createRenderEngine(assets, renderer, sceneRTT) {
  const resolution = 512 + 64;

  const cameraRTT = new THREE.OrthographicCamera(-0.1, 1.496, 0.1, -1.1, 1, 3);
  cameraRTT.position.set(0, 0, 1);
  sceneRTT.add(cameraRTT);

  const rtTexture = new THREE.WebGLRenderTarget(resolution * 1.33, resolution, {
    format: THREE.RGBAFormat,
  });

  const composer = new EffectComposer(renderer, rtTexture);
  composer.renderToScreen = false;
  composer.addPass(new RenderPass(sceneRTT, cameraRTT));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(128, 128), 0.95, 0.28, 0));

  const lag = new Lag(composer.readBuffer, resolution * 1.33, resolution);

  const shaderToScreen = new ShaderToScreen(
    {
      uniforms: {
        uDiffuse: { value: lag.outputTexture.texture },
        uTime: { value: 1 },
        uProgress: { value: 1.2 },
      },
      vertexShader,
      fragmentShader: noiseFragmentShader,
    },
    resolution * 1.33,
    resolution,
  );

  shaderToScreen.outputTexture.texture.colorSpace = THREE.SRGBColorSpace;

  const environmentMapTexture = assets.environmentMapTexture;
  if (environmentMapTexture) {
    environmentMapTexture.colorSpace = THREE.SRGBColorSpace;
  }

  const material = new THREE.MeshStandardMaterial();
  material.metalness = 0;
  material.roughness = 0.24;
  if (environmentMapTexture) {
    material.envMap = environmentMapTexture;
    material.envMapIntensity = 0.08;
  }
  material.map = shaderToScreen.outputTexture.texture;
  material.emissive = new THREE.Color(0xffffff);
  material.emissiveMap = shaderToScreen.outputTexture.texture;
  material.emissiveIntensity = 0.16;

  let progress = 1.2;

  function tick(deltaTime, elapsedTime) {
    shaderToScreen.shader.uniforms.uTime.value = elapsedTime;
    shaderToScreen.shader.uniforms.uProgress.value = progress;

    shaderToScreen.render(renderer);

    progress -= deltaTime * 0.2;
    if (progress < 0) progress = 1.2;

    lag.render(renderer);
    composer.render();
  }

  function destroy() {
    composer.dispose();
    rtTexture.dispose();
    lag.destroy();
    shaderToScreen.destroy();
    material.dispose();
  }

  return { tick, material, destroy };
}
