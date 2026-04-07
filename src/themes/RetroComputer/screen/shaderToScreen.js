import * as THREE from 'three';

export default class ShaderToScreen {
  constructor(shaderParams, width, height) {
    const aspect = width / height;

    this.sceneRTT = new THREE.Scene();
    this.cameraRTT = new THREE.OrthographicCamera(
      -0.5 * aspect,
      0.5 * aspect,
      0.5,
      -0.5,
      1,
      3,
    );
    this.cameraRTT.position.set(0, 0, 1);
    this.sceneRTT.add(this.cameraRTT);

    this.outputTexture = new THREE.WebGLRenderTarget(width, height, {
      format: THREE.RGBAFormat,
    });

    this.shader = new THREE.ShaderMaterial(shaderParams);

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(aspect, 1, 1, 1),
      this.shader,
    );
    this.sceneRTT.add(this.plane);
  }

  render(renderer) {
    renderer.setRenderTarget(this.outputTexture);
    renderer.clear();
    renderer.render(this.sceneRTT, this.cameraRTT);
  }

  destroy() {
    this.outputTexture.dispose();
    this.plane.geometry.dispose();
    this.shader.dispose();
  }
}
