import ShaderToScreen from './shaderToScreen';
import { copyFragmentShader, lagFragmentShader, vertexShader } from './shaders';

export default class Lag {
  constructor(buffer, width, height) {
    this.shaderToScreen1 = new ShaderToScreen(
      {
        uniforms: {
          uDiffuse: { value: buffer.texture },
          uLagTex: { value: null },
        },
        vertexShader,
        fragmentShader: lagFragmentShader,
      },
      width,
      height,
    );

    this.outputTexture = this.shaderToScreen1.outputTexture;

    this.outputCopy = new ShaderToScreen(
      {
        uniforms: {
          uDiffuse: { value: this.outputTexture.texture },
        },
        vertexShader,
        fragmentShader: copyFragmentShader,
      },
      width,
      height,
    );

    this.shaderToScreen1.shader.uniforms.uLagTex.value = this.outputCopy.outputTexture.texture;
  }

  render(renderer) {
    this.shaderToScreen1.render(renderer);
    this.outputCopy.render(renderer);
  }

  destroy() {
    this.shaderToScreen1.destroy();
    this.outputCopy.destroy();
  }
}
