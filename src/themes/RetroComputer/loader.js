import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

export default function loadAssets(base, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const assets = {};
    const manager = new THREE.LoadingManager();

    manager.onLoad = () => resolve(assets);
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      onProgress?.({ url, itemsLoaded, itemsTotal });
    };
    manager.onError = (url) => reject(new Error(`Failed to load ${url}`));

    const fontLoader = new FontLoader(manager);
    const textureLoader = new THREE.TextureLoader(manager);
    const cubeTextureLoader = new THREE.CubeTextureLoader(manager);
    const gltfLoader = new GLTFLoader(manager);

    fontLoader.load(`${base}/fonts/public-pixel.json`, (font) => {
      assets.publicPixelFont = font;
    });

    fontLoader.load(`${base}/fonts/chill.json`, (font) => {
      assets.chillFont = font;
    });

    textureLoader.load(`${base}/textures/bake-quality-5.jpg`, (tex) => {
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      assets.bakeTexture = tex;
    });

    textureLoader.load(`${base}/textures/bake_floor-quality-3.jpg`, (tex) => {
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      assets.bakeFloorTexture = tex;
    });

    cubeTextureLoader.load(
      [
        `${base}/textures/environmentMap/px.jpg`,
        `${base}/textures/environmentMap/nx.jpg`,
        `${base}/textures/environmentMap/py.jpg`,
        `${base}/textures/environmentMap/ny.jpg`,
        `${base}/textures/environmentMap/pz.jpg`,
        `${base}/textures/environmentMap/nz.jpg`,
      ],
      (tex) => {
        assets.environmentMapTexture = tex;
      },
    );

    gltfLoader.load(`${base}/models/Commodore710_33.5.glb`, (gltf) => {
      assets.screenMesh = gltf.scene.children.find((m) => m.name === 'Screen');
      assets.computerMesh = gltf.scene.children.find((m) => m.name === 'Computer');
      assets.crtMesh = gltf.scene.children.find((m) => m.name === 'CRT');
      assets.keyboardMesh = gltf.scene.children.find((m) => m.name === 'Keyboard');
      assets.shadowPlaneMesh = gltf.scene.children.find((m) => m.name === 'ShadowPlane');
    });
  });
}
