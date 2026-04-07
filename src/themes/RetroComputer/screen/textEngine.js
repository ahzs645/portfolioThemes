import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const TEXT_COLOR = '#f99021';
const SCREEN_WIDTH = 1.4;
const VIEWPORT_HEIGHT = 0.98;

const h1Font = {
  font: undefined,
  size: 0.05,
  height: 0.05,
  width: 0.05,
  leading: 0.1,
  tracking: 0.02,
};

const h2Font = {
  font: undefined,
  size: 0.04,
  height: 0.04,
  width: 0.032,
  leading: 0.08,
  tracking: 0.00704,
};

const h3Font = {
  font: undefined,
  size: 0.03,
  height: 0.03,
  width: 0.024,
  leading: 0.075,
  tracking: 0.00528,
};

const paragraphFont = {
  font: undefined,
  size: 0.0275,
  height: 0.0275,
  width: 0.022,
  leading: 0.06875,
  tracking: 0.00484,
};

const breakFont = {
  font: undefined,
  size: 0.025,
  height: 0.025,
  width: 0.02,
  leading: 0.04,
  tracking: 0.02,
};

export default function createTextEngine(assets, sceneRTT) {
  h1Font.font = assets.publicPixelFont;
  h2Font.font = assets.chillFont;
  h3Font.font = assets.chillFont;
  paragraphFont.font = assets.chillFont;
  breakFont.font = assets.chillFont;

  let rootGroup;
  let textColorMesh;
  let textBlackMesh;
  let textBgMesh;
  let caret;
  let textMaterial;

  let charUnderCaret;
  let caretTimeSinceUpdate = 1;
  let inputBuffer = [];
  let terminalPromptOffset = 0;
  let oldNumberOfInputLines = 0;
  let maxScroll = 0;
  let currentInput = '';
  let lastLinesRef = null;
  let lastPromptText = '';
  let lastScrollOffset = 0;
  let lastSelectionPos = 0;

  const charNextLoc = { x: 0, y: 0 };

  function disposeMaterial(material) {
    if (Array.isArray(material)) {
      material.forEach(disposeMaterial);
      return;
    }
    material?.dispose?.();
  }

  function disposeObject3D(object) {
    object.traverse((node) => {
      node.geometry?.dispose?.();
      disposeMaterial(node.material);
    });
  }

  function createBaseTextGeometry() {
    return new TextGeometry('', {
      font: h1Font.font,
      size: h1Font.size,
      height: 0.0001,
      curveSegments: 12,
      bevelEnabled: false,
    });
  }

  function initSceneGraph() {
    rootGroup = new THREE.Group();
    sceneRTT.add(rootGroup);

    textMaterial = new THREE.MeshBasicMaterial({ color: TEXT_COLOR });

    textColorMesh = new THREE.Mesh(createBaseTextGeometry(), textMaterial);
    rootGroup.add(textColorMesh);

    textBlackMesh = new THREE.Mesh(
      createBaseTextGeometry(),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    );
    rootGroup.add(textBlackMesh);

    textBgMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0, 0),
      new THREE.MeshBasicMaterial({ color: TEXT_COLOR }),
    );
    rootGroup.add(textBgMesh);

    caret = new THREE.Mesh(
      new THREE.PlaneGeometry(h2Font.size, h2Font.size * 1.6),
      new THREE.MeshBasicMaterial({ color: TEXT_COLOR }),
    );
    caret.position.z = -0.1;
    rootGroup.add(caret);

    charUnderCaret = undefined;
    caretTimeSinceUpdate = 1;
    inputBuffer = [];
    terminalPromptOffset = 0;
    oldNumberOfInputLines = 0;
    maxScroll = 0;
    currentInput = '';
    charNextLoc.x = 0;
    charNextLoc.y = 0;
  }

  function resetDocument() {
    if (rootGroup) {
      sceneRTT.remove(rootGroup);
      disposeObject3D(rootGroup);
    }
    initSceneGraph();
  }

  function mergeGeometriesWithMesh(baseMesh, geometries) {
    if (geometries.length === 0) return;

    const baseGeometry = baseMesh.geometry;
    geometries.push(baseGeometry);
    baseMesh.geometry = mergeGeometries(geometries);
    baseGeometry.dispose();
  }

  function placeLinebreak(font) {
    charNextLoc.x = 0;
    charNextLoc.y += font.leading;
  }

  function updateCharUnderCaret(isBlack) {
    if (charUnderCaret) {
      charUnderCaret.material.color = new THREE.Color(isBlack ? 'black' : TEXT_COLOR);
    }
  }

  function updateCaret(position = 0) {
    const charPos = {
      x: charNextLoc.x,
      y: -charNextLoc.y,
    };

    updateCharUnderCaret(false);
    charUnderCaret = undefined;

    const charWidth = h2Font.width + h2Font.tracking;
    const charsPerLine = Math.floor(SCREEN_WIDTH / charWidth);

    if (position !== undefined) {
      charPos.x = charNextLoc.x + charWidth * ((position + terminalPromptOffset) % charsPerLine);
      charPos.y = -(
        charNextLoc.y +
        h2Font.leading * Math.floor((position + terminalPromptOffset) / charsPerLine)
      );

      if (position < inputBuffer.length) {
        charPos.y = inputBuffer[position].position.y;
        charUnderCaret = inputBuffer[position];
      }
    }

    let x = charPos.x + h2Font.size / 2;
    let y = charPos.y - h2Font.size / 1.9;

    if (x > SCREEN_WIDTH) {
      y -= h2Font.leading;
      x = h2Font.size / 2;
    }

    caret.position.x = x;
    caret.position.y = y;
    caretTimeSinceUpdate = 0;
  }

  function generateGeometry({
    str,
    font,
    highlight = false,
    wrap = false,
    isWord = false,
    updateCharNextLoc = true,
  }) {
    const strLen = (font.width + font.tracking) * str.length;
    const strWrapLen = isWord
      ? (font.width + font.tracking) * Math.max(0, str.length - 1)
      : font.width * str.length;

    let x = charNextLoc.x;
    let y = charNextLoc.y;

    if (wrap && strWrapLen + x > SCREEN_WIDTH) {
      y += font.leading;
      x = 0;
    }

    const returnObj = {
      colorText: undefined,
      blackText: undefined,
      bg: undefined,
    };

    const textGeometry = new TextGeometry(str, {
      font: font.font,
      size: font.size,
      height: 0.0001,
      curveSegments: 12,
      bevelEnabled: false,
    });

    if (updateCharNextLoc) textGeometry.translate(x, -font.height - y, -0.001);
    else textGeometry.translate(0, -font.height, -0.001);

    if (highlight) {
      const background = new THREE.PlaneGeometry(
        strLen + font.tracking * 2,
        font.height + font.leading / 2,
        1,
        1,
      );

      background.translate(
        strLen / 2 - font.tracking / 2 + x,
        -font.height / 2 - y,
        -0.01,
      );

      returnObj.blackText = textGeometry;
      returnObj.bg = background;
    } else {
      returnObj.colorText = textGeometry;
    }

    if (updateCharNextLoc) {
      charNextLoc.x = strLen + x;
      charNextLoc.y = y;
    }

    return returnObj;
  }

  function placeImage(val) {
    const urlMatch = val.match(/\(.+\)/);
    if (!urlMatch || urlMatch.length === 0) return;

    const [url, rawParams] = urlMatch[0].slice(1, -1).split('?');
    const params = new URLSearchParams(rawParams);

    const aspectRatio = parseFloat(params.get('aspect') ?? '');
    if (Number.isNaN(aspectRatio)) return;

    const widthParam = parseFloat(params.get('width') ?? '');
    const width = Number.isNaN(widthParam) ? 1 : widthParam;
    const height = width / aspectRatio;

    const imageFrame = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    );

    imageFrame.position.set(SCREEN_WIDTH / 2, -height * 0.5 - charNextLoc.y, -0.02);
    if (!params.get('noflow')) charNextLoc.y += height;
    rootGroup.add(imageFrame);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, (texture) => {
      texture.magFilter = THREE.NearestFilter;
      imageFrame.material.dispose();
      imageFrame.material = new THREE.MeshBasicMaterial({ map: texture });
    });
  }

  function placeMarkdown(md) {
    const tokens = [];
    let currentToken;

    for (let i = 0; i < md.length; i += 1) {
      if (md[i] === '\r') continue;

      if (currentToken === undefined && md[i] === '#') {
        let type = 'h1';
        if (i + 1 < md.length && md[i + 1] === '#') {
          type = 'h2';
          i += 1;
          if (i + 1 < md.length && md[i + 1] === '#') {
            type = 'h3';
            i += 1;
          }
        }
        if (i + 1 < md.length && md[i + 1] === ' ') i += 1;
        currentToken = { type, emphasis: false, value: '' };
      } else if (md[i] === '\n') {
        if (currentToken !== undefined) {
          tokens.push(currentToken);
          currentToken = undefined;
        }
        tokens.push({ type: 'br', emphasis: false, value: '' });
      } else if (currentToken === undefined && md[i] === '!') {
        currentToken = { type: 'img', emphasis: false, value: '' };
      } else if (currentToken === undefined) {
        currentToken = { type: 'p', emphasis: false, value: md[i] };
      } else if (md[i] === '*') {
        tokens.push(currentToken);
        currentToken = {
          type: currentToken.type,
          emphasis: !currentToken.emphasis,
          value: '',
        };
      } else {
        currentToken.value += md[i];
      }
    }

    if (currentToken !== undefined) tokens.push(currentToken);

    const textColorGeometry = [];
    const textBlackGeometry = [];
    const textBgGeometry = [];

    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      const geometry = [];

      switch (token.type) {
        case 'h1':
          geometry.push(generateGeometry({ str: token.value, font: h1Font, highlight: token.emphasis }));
          break;
        case 'h2':
          geometry.push(generateGeometry({ str: token.value, font: h2Font, highlight: token.emphasis }));
          break;
        case 'h3':
          geometry.push(generateGeometry({ str: token.value, font: h3Font, highlight: token.emphasis }));
          break;
        case 'img':
          placeImage(token.value);
          break;
        case 'p': {
          const words = token.value.split(' ');
          words.forEach((word) => {
            geometry.push(
              generateGeometry({
                str: `${word} `,
                font: paragraphFont,
                highlight: token.emphasis,
                wrap: true,
                isWord: true,
              }),
            );
          });
          break;
        }
        case 'br': {
          let font = breakFont;
          if (i > 0) {
            const prevType = tokens[i - 1].type;
            if (prevType === 'h1') font = h1Font;
            else if (prevType === 'h2') font = h2Font;
            else if (prevType === 'h3') font = h3Font;
            else if (prevType === 'p') font = paragraphFont;
          }
          placeLinebreak(font);
          break;
        }
        default:
          break;
      }

      geometry.forEach((item) => {
        if (item.colorText) textColorGeometry.push(item.colorText);
        if (item.blackText) textBlackGeometry.push(item.blackText);
        if (item.bg) textBgGeometry.push(item.bg);
      });
    }

    mergeGeometriesWithMesh(textColorMesh, textColorGeometry);
    mergeGeometriesWithMesh(textBlackMesh, textBlackGeometry);
    mergeGeometriesWithMesh(textBgMesh, textBgGeometry);
  }

  function placeText(str) {
    const charWidth = h2Font.width + h2Font.tracking;
    const charsPerLine = Math.floor(SCREEN_WIDTH / charWidth);
    let numOfLines = 0;

    const strWithNewline = str.split('\n');

    for (let i = 0; i < strWithNewline.length; i += 1) {
      const textGeometry = [];

      for (const char of strWithNewline[i]) {
        const colorText = generateGeometry({
          str: char,
          font: h2Font,
          updateCharNextLoc: false,
        }).colorText;

        if (colorText) textGeometry.push(colorText);
      }

      terminalPromptOffset = 0;
      oldNumberOfInputLines = 0;
      updateCharPos(
        textGeometry,
        (obj, x, y) => {
          obj.translate(x, y, 0);
        },
        false,
      );

      mergeGeometriesWithMesh(textColorMesh, textGeometry);

      const overFlow = Math.floor(textGeometry.length / charsPerLine);
      for (let j = 0; j < overFlow; j += 1) {
        numOfLines += 1;
        placeLinebreak(h2Font);
      }

      if (i < strWithNewline.length - 1) {
        placeLinebreak(h2Font);
        numOfLines += 1;
      } else {
        terminalPromptOffset = strWithNewline[i].length + 1;
        updateCaret(0);
      }
    }

    return numOfLines;
  }

  function deleteChars(charsToDelete) {
    charsToDelete.forEach((char) => {
      rootGroup.remove(char);
      char.geometry.dispose();
      char.material.dispose();
    });
  }

  function updateCharPos(buffer, helper, shouldScroll) {
    const charWidth = h2Font.width + h2Font.tracking;
    const charsPerLine = Math.floor(SCREEN_WIDTH / charWidth);

    for (let i = 0; i < buffer.length; i += 1) {
      const x = charNextLoc.x + charWidth * ((i + terminalPromptOffset) % charsPerLine);
      const y = -(
        charNextLoc.y +
        h2Font.leading * Math.floor((i + terminalPromptOffset) / charsPerLine)
      );

      helper(buffer[i], x, y);
    }

    if (shouldScroll) {
      const newNumberOfInputLines = Math.floor((buffer.length + terminalPromptOffset) / charsPerLine);
      scroll(newNumberOfInputLines - oldNumberOfInputLines, 'lines');
      oldNumberOfInputLines = newNumberOfInputLines;
    }
  }

  function userInput(change, selectionPos) {
    if (change.type === 'add') {
      if (change.loc === 'end') {
        caret.visible = true;

        for (const char of change.str) {
          const textObj = new THREE.Mesh(
            generateGeometry({
              str: char,
              font: h2Font,
              updateCharNextLoc: false,
            }).colorText,
            textMaterial.clone(),
          );

          inputBuffer.push(textObj);
          updateCharPos(
            inputBuffer,
            (obj, x, y) => {
              obj.position.set(x, y, 0);
              rootGroup.add(obj);
            },
            true,
          );
        }
      } else if (typeof change.loc === 'number') {
        const newChars = [];

        for (const char of change.str) {
          newChars.push(
            new THREE.Mesh(
              generateGeometry({
                str: char,
                font: h2Font,
                updateCharNextLoc: false,
              }).colorText,
              textMaterial.clone(),
            ),
          );
        }

        inputBuffer = [
          ...inputBuffer.slice(0, change.loc),
          ...newChars,
          ...inputBuffer.slice(change.loc),
        ];

        updateCharPos(
          inputBuffer,
          (obj, x, y) => {
            obj.position.set(x, y, 0);
            rootGroup.add(obj);
          },
          true,
        );
      }
    } else if (change.type === 'del') {
      if (change.loc === 'end') {
        const charsToDelete = inputBuffer.slice(-change.str.length);
        inputBuffer = inputBuffer.slice(0, -change.str.length);

        updateCharPos(
          inputBuffer,
          (obj, x, y) => {
            obj.position.set(x, y, 0);
          },
          true,
        );

        deleteChars(charsToDelete);
      } else if (typeof change.loc === 'number') {
        const charsToDelete = inputBuffer.slice(change.loc, change.loc + change.str.length);
        deleteChars(charsToDelete);

        inputBuffer = [
          ...inputBuffer.slice(0, change.loc),
          ...inputBuffer.slice(change.loc + change.str.length),
        ];

        updateCharPos(
          inputBuffer,
          (obj, x, y) => {
            obj.position.set(x, y, 0);
          },
          true,
        );
      }
    }

    updateCaret(selectionPos);
  }

  function freezeInput() {
    const textGeometry = [];

    inputBuffer.forEach((char) => {
      char.geometry.translate(char.position.x, char.position.y, 0);
      textGeometry.push(char.geometry);
      char.material.dispose();
    });

    mergeGeometriesWithMesh(textColorMesh, textGeometry);

    const charWidth = h2Font.width + h2Font.tracking;
    const charsPerLine = Math.floor(SCREEN_WIDTH / charWidth);
    const newNumberOfInputLines = Math.floor((inputBuffer.length + terminalPromptOffset) / charsPerLine);
    charNextLoc.y += h2Font.leading * newNumberOfInputLines;
  }

  function scroll(value, units, options = { updateMaxScroll: true, moveView: true }) {
    let amount = value;
    if (units === 'lines') amount *= h2Font.leading;

    if (options.moveView) rootGroup.position.y += amount;
    if (options.updateMaxScroll) maxScroll += amount;

    if (rootGroup.position.y < 0) rootGroup.position.y = 0;
    if (rootGroup.position.y > maxScroll) rootGroup.position.y = maxScroll;
  }

  function scrollToEnd() {
    if (rootGroup.position.y !== maxScroll) rootGroup.position.y = maxScroll;
  }

  function applyScrollOffset(scrollOffset) {
    const amount = scrollOffset * h2Font.leading;
    rootGroup.position.y = Math.max(0, Math.min(maxScroll, maxScroll - amount));
  }

  function stringEditDistance(oldStr, newStr) {
    const lenDiff = oldStr.length - newStr.length;

    const change = {
      type: 'none',
      loc: 'none',
      str: '',
    };

    let oldPointer = 0;
    let newPointer = 0;

    if (lenDiff > 0) {
      change.type = 'del';

      while (oldPointer < oldStr.length || newPointer < newStr.length) {
        if (oldPointer >= oldStr.length) return change;

        if (oldStr.charAt(oldPointer) !== newStr.charAt(newPointer)) {
          if (change.loc === 'none') change.loc = newPointer === newStr.length ? 'end' : newPointer;
          change.str += oldStr.charAt(oldPointer);
          oldPointer += 1;
        } else {
          oldPointer += 1;
          newPointer += 1;
        }
      }
    } else if (lenDiff < 0) {
      change.type = 'add';

      while (oldPointer < oldStr.length || newPointer < newStr.length) {
        if (newPointer >= newStr.length) return change;

        if (oldStr.charAt(oldPointer) !== newStr.charAt(newPointer)) {
          if (change.loc === 'none') change.loc = oldPointer === oldStr.length ? 'end' : oldPointer;
          change.str += newStr.charAt(newPointer);
          newPointer += 1;
        } else {
          oldPointer += 1;
          newPointer += 1;
        }
      }
    }

    return change;
  }

  function recomputeMaxScroll() {
    maxScroll = Math.max(0, charNextLoc.y - VIEWPORT_HEIGHT);
  }

  function renderLine(line) {
    const text = line?.text ?? '';

    if (line?.type === 'h1') {
      placeMarkdown(`# ${text}\n`);
      return;
    }

    if (line?.type === 'h2') {
      placeMarkdown(`## ${text}\n`);
      return;
    }

    if (line?.type === 'h3') {
      placeMarkdown(`### ${text}\n`);
      return;
    }

    if (line?.type === 'p' || line?.type === 'li' || line?.type === 'md') {
      placeMarkdown(`${text}\n`);
      return;
    }

    if (text === '') {
      placeLinebreak(h2Font);
      return;
    }

    placeText(text);
    placeLinebreak(h2Font);
  }

  function setDocument(lines, promptText) {
    resetDocument();

    lines.forEach(renderLine);

    placeText(promptText);
    recomputeMaxScroll();
    currentInput = '';
  }

  function setInputValue(nextInput, selectionPos) {
    const safeSelection = selectionPos ?? nextInput.length;

    if (currentInput !== nextInput) {
      const change = stringEditDistance(currentInput, nextInput);
      if (change.type !== 'none') userInput(change, safeSelection);
      else updateCaret(safeSelection);
      currentInput = nextInput;
    } else {
      updateCaret(safeSelection);
    }
  }

  function setTerminalState({
    lines = [],
    promptText = '',
    input = '',
    selectionPos = input.length,
    scrollOffset = 0,
  }) {
    const documentChanged = lines !== lastLinesRef || promptText !== lastPromptText;

    if (documentChanged) {
      setDocument(lines, promptText);
      if (input) setInputValue(input, selectionPos);
      else updateCaret(selectionPos);

      lastLinesRef = lines;
      lastPromptText = promptText;
    } else {
      setInputValue(input, selectionPos);
    }

    if (documentChanged || scrollOffset !== lastScrollOffset || selectionPos !== lastSelectionPos) {
      applyScrollOffset(scrollOffset);
    }

    lastScrollOffset = scrollOffset;
    lastSelectionPos = selectionPos;
  }

  function tick(deltaTime, elapsedTime) {
    if (caretTimeSinceUpdate > 1 && Math.floor(elapsedTime * 2) % 2 === 0) {
      caret.visible = false;
      updateCharUnderCaret(false);
    } else {
      caret.visible = true;
      updateCharUnderCaret(true);
    }

    caretTimeSinceUpdate += deltaTime;
  }

  function destroy() {
    if (rootGroup) {
      sceneRTT.remove(rootGroup);
      disposeObject3D(rootGroup);
    }
  }

  initSceneGraph();

  return {
    tick,
    userInput,
    placeMarkdown,
    placeText,
    scroll,
    scrollToEnd,
    freezeInput,
    setTerminalState,
    destroy,
  };
}
