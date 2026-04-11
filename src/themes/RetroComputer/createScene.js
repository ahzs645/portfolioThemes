import * as THREE from 'three';
import loadAssets from './loader';
import createRenderEngine from './screen/renderEngine';
import createTextEngine from './screen/textEngine';
import { withBase } from '../../utils/assetPath';

const BASE = withBase('retro-computer').replace(/\/$/, '');

function valMap(x, from, to) {
  const y = ((x - from[0]) / (from[1] - from[0])) * (to[1] - to[0]) + to[0];

  if (to[0] < to[1]) {
    if (y < to[0]) return to[0];
    if (y > to[1]) return to[1];
  } else {
    if (y > to[0]) return to[0];
    if (y < to[1]) return to[1];
  }

  return y;
}

function isScrollableElement(element) {
  if (!element) return false;

  const styles = window.getComputedStyle(element);
  const overflowY = styles.overflowY;

  if (overflowY !== 'auto' && overflowY !== 'scroll') return false;

  return element.scrollHeight > element.clientHeight + 1;
}

function findScrollableAncestor(node) {
  let current = node?.parentElement ?? null;

  while (current) {
    if (isScrollableElement(current)) return current;
    current = current.parentElement;
  }

  return null;
}

export default function createScene(canvas, { onLoaded, onProgress, scrollContainer }) {
  let destroyed = false;
  let animId = null;
  let renderEngine = null;
  let textEngine = null;
  let computerGroup = null;
  let computerMaterial = null;
  let floorMaterial = null;

  const terminalState = {
    lines: [],
    promptText: '',
    input: '',
    selectionPos: 0,
    scrollOffset: 0,
  };

  const scroller =
    (isScrollableElement(scrollContainer) ? scrollContainer : null) ||
    findScrollableAncestor(canvas) ||
    window;
  const measureTarget = scroller === window ? document.documentElement : scroller;
  let viewHeight = scroller === window ? document.documentElement.clientHeight : scroller.clientHeight;

  function getScroll() {
    const top = scroller === window ? window.scrollY : scroller.scrollTop;
    const vh = scroller === window ? document.documentElement.clientHeight : scroller.clientHeight;
    return top / vh;
  }

  let scroll = getScroll();
  const onScroll = () => {
    scroll = getScroll();
  };

  scroller.addEventListener('scroll', onScroll, { passive: true });

  let mouseDown = null;
  const computerParallax = { x: 0, y: 0 };

  function checkIfTouch(event) {
    if (event.pointerType !== 'mouse') {
      mouseDown = null;
      computerParallax.x = 0;
      computerParallax.y = 0;
    }
  }

  const onPointerMove = (event) => {
    checkIfTouch(event);
    if (!mouseDown) return;

    computerParallax.x += (event.clientX - mouseDown.x) / (window.innerWidth * 0.5);
    computerParallax.x = valMap(computerParallax.x, [-1, 1], [-1, 1]);

    computerParallax.y += (event.clientY - mouseDown.y) / (window.innerHeight * 0.5);
    computerParallax.y = valMap(computerParallax.y, [-1, 1], [-1, 1]);

    mouseDown = { x: event.clientX, y: event.clientY };
  };

  const onPointerDown = (event) => {
    checkIfTouch(event);
    if (event.pointerType !== 'mouse') return;
    mouseDown = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event) => {
    checkIfTouch(event);
    mouseDown = null;
  };

  canvas.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.addEventListener('pointerup', onPointerUp, { passive: true });

  // Forward wheel events from the canvas to the scroll container.
  // The sticky canvas can intercept wheel events before they reach ThemeContainer.
  const onWheel = (e) => {
    if (scroller !== window) {
      scroller.scrollTop += e.deltaY;
    }
  };
  canvas.addEventListener('wheel', onWheel, { passive: true });

  const sizes = {
    width: measureTarget.clientWidth,
    height: scroller === window ? window.innerHeight : scroller.clientHeight,
    portraitOffset: valMap(
      (scroller === window ? window.innerHeight : scroller.clientHeight) / measureTarget.clientWidth,
      [0.75, 1.75],
      [0, 2],
    ),
  };

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  scene.background = new THREE.Color(0xf6d4b1);

  const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100);
  camera.position.set(0, 0, -2.5);
  camera.rotation.set(-Math.PI, 0, Math.PI);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const onResize = () => {
    viewHeight = scroller === window ? document.documentElement.clientHeight : scroller.clientHeight;
    sizes.width = measureTarget.clientWidth;
    sizes.height = scroller === window ? window.innerHeight : scroller.clientHeight;
    sizes.portraitOffset = valMap(sizes.height / sizes.width, [0.8, 1.8], [0, 2.5]);

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
  };

  window.addEventListener('resize', onResize, { passive: true });

  function applyTerminalState() {
    if (!textEngine) return;

    textEngine.setTerminalState({
      lines: terminalState.lines,
      promptText: terminalState.promptText,
      input: terminalState.input,
      selectionPos: terminalState.selectionPos,
      scrollOffset: terminalState.scrollOffset,
    });
  }

  function startScene(assets) {
    const sceneRTT = new THREE.Scene();
    textEngine = createTextEngine(assets, sceneRTT);
    renderEngine = createRenderEngine(assets, renderer, sceneRTT);

    applyTerminalState();

    computerMaterial = new THREE.MeshBasicMaterial({ map: assets.bakeTexture });
    floorMaterial = new THREE.MeshBasicMaterial({ map: assets.bakeFloorTexture });

    computerGroup = new THREE.Group();

    if (assets.screenMesh) {
      assets.screenMesh.material = renderEngine.material;
      computerGroup.add(assets.screenMesh);
    }

    if (assets.computerMesh) {
      assets.computerMesh.material = computerMaterial;
      computerGroup.add(assets.computerMesh);
    }

    if (assets.crtMesh) {
      assets.crtMesh.material = computerMaterial;
      computerGroup.add(assets.crtMesh);
    }

    if (assets.keyboardMesh) {
      assets.keyboardMesh.material = computerMaterial;
      computerGroup.add(assets.keyboardMesh);
    }

    if (assets.shadowPlaneMesh) {
      assets.shadowPlaneMesh.material = floorMaterial;
      computerGroup.add(assets.shadowPlaneMesh);
    }

    const controlProps = {
      computerHeight: 1.5,
      computerAngle: Math.PI * 0.2,
      computerHorizontal: 0.5,
    };

    computerGroup.position.x = controlProps.computerHorizontal;
    computerGroup.position.y = controlProps.computerHeight;
    computerGroup.rotation.y = controlProps.computerAngle;
    scene.add(computerGroup);

    const clock = new THREE.Clock();

    function tick() {
      if (destroyed) return;
      animId = requestAnimationFrame(tick);

      const deltaTime = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const zoomFac = valMap(scroll, [0, 1], [0, 1]);

      camera.position.z = valMap(
        scroll,
        [0, 1],
        [-2.5 - sizes.portraitOffset, -10 - sizes.portraitOffset],
      );

      computerGroup.position.x = controlProps.computerHorizontal * zoomFac;
      computerGroup.position.y = valMap(scroll, [0, 1], [0, controlProps.computerHeight]);
      computerGroup.rotation.y = controlProps.computerAngle * zoomFac;

      camera.position.x =
        computerParallax.x * valMap(scroll, [0, 1], [0.2, 5]) * 0.1 +
        camera.position.x * 0.9;
      camera.position.y =
        computerParallax.y * valMap(scroll, [0, 1], [0.2, 1.5]) * 0.1 +
        camera.position.y * 0.9;

      camera.lookAt(new THREE.Vector3(0, 0, 0));

      const opacity = valMap(scroll, [1.25, 1.75], [1, 0]);
      canvas.style.opacity = `${opacity}`;
      if (canvas.parentElement) canvas.parentElement.style.opacity = `${opacity}`;

      if (sizes.portraitOffset > 0.5) {
        computerGroup.rotation.z = valMap(scroll, [0, 1], [-Math.PI / 2, 0]);
      } else {
        computerGroup.rotation.z = 0;
      }

      if (assets.crtMesh?.morphTargetInfluences) {
        assets.crtMesh.morphTargetInfluences[0] = valMap(zoomFac, [0, 0.1], [0.5, 0]);
      }

      textEngine.tick(deltaTime, elapsedTime);
      renderEngine.tick(deltaTime, elapsedTime);

      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    }

    tick();
    onLoaded?.();
  }

  loadAssets(BASE, { onProgress })
    .then((assets) => {
      if (destroyed) return;
      startScene(assets);
    })
    .catch((error) => {
      console.error('RetroComputer asset load failed:', error);
      onLoaded?.();
    });

  return {
    updateTerminal(lines, promptText, input, scrollOffset, selectionPos = input.length) {
      terminalState.lines = lines;
      terminalState.promptText = promptText;
      terminalState.input = input;
      terminalState.scrollOffset = scrollOffset;
      terminalState.selectionPos = selectionPos;

      applyTerminalState();
    },

    destroy() {
      destroyed = true;

      if (animId) cancelAnimationFrame(animId);

      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('wheel', onWheel);
      document.removeEventListener('pointerup', onPointerUp);

      if (computerGroup) scene.remove(computerGroup);

      textEngine?.destroy();
      renderEngine?.destroy();
      computerMaterial?.dispose();
      floorMaterial?.dispose();
      renderer.dispose();
    },
  };
}
