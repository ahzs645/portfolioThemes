import {
  Group,
  Vector2,
  MeshBasicMaterial,
  PlaneGeometry,
  Mesh,
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
} from "three";
import Experience from "./Experience.js";
import { withBase } from "../../../utils/assetPath";
import whiteboardSvg from "./whiteboard.svg?raw";

export default class Whiteboard {
  constructor() {
    this.experience = new Experience();
    this.webglElement = this.experience.webglElement;
    this.resources = this.experience.resources;
    this.scene = this.experience.scene;
    this.renderer = this.experience.renderer.instance;
    this.camera = this.experience.camera;
    this.audioManager = this.experience.world.audioManager;
    this.mouse = this.experience.mouse;
    this.baked = this.experience.world.baked;
    this.whiteboardGroup = new Group();
    this.drawStartPos = new Vector2(-1, -1);
    this.raycaster = this.experience.raycaster;
    this.drawColor = "black";
    this.isActive = false;
    this.positionsToDraw = [];
    this.model = {};
    this.materialWhiteboard = this.experience.world.baked.model.material;

    this.setModel();
    this.setWhiteboard();
  }

  setModel() {
    this.whiteboardButtons = this.experience.queryAll(
      ".circular-button-whiteboard"
    );
    this.whiteboardButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.changeWhiteboardColor(button.id);
        this.whiteboardButtons.forEach((btn) => {
          btn.classList.remove("whiteboard-selected");
        });

        if (button.id != "eraser") {
          this.audioManager.playSingleAudio("markerOpen", 0.8);
        } else {
          this.audioManager.playSingleAudio("eraser", 0.3);
        }
        button.classList.add("whiteboard-selected");
      });
    });
    this.model.mesh = this.resources.items.whiteboard.scene;
    this.model.mesh.traverse((child) => {
      if (child.isMesh) {
        child.material = this.materialWhiteboard;
      }
    });
    this.whiteboardGroup.add(this.model.mesh);
    this.model.mesh.name = "whiteboard";
    this.scene.add(this.model.mesh);
  }

  setWhiteboard() {
    this.whiteboardMaterial = new MeshBasicMaterial();
    const whiteboardGeom = new PlaneGeometry(2.6, 1.82);
    whiteboardGeom.computeBoundingBox();
    whiteboardGeom.computeVertexNormals();
    const planeMesh = new Mesh(whiteboardGeom, this.whiteboardMaterial);
    planeMesh.position.set(-3.3927, 3.18774, -4.61366);
    planeMesh.name = "whiteboardCanvas";
    this.model.mesh.add(planeMesh);

    this.drawingCanvas = this.experience.query("#drawing-canvas");
    this.drawingContext = this.drawingCanvas.getContext("2d");

    // Marker tool drawing defaults.
    this.drawingContext.lineWidth = 8;
    this.drawingContext.lineJoin = "round";
    this.drawingContext.lineCap = "round";
    this.drawingContext.fontSmoothingEnabled = true;

    // White base so the board is never transparent before the art loads in.
    this.drawingContext.fillStyle = "white";
    this.drawingContext.fillRect(0, 0, 2048, 1024);

    this.canvasTexture = new CanvasTexture(this.drawingCanvas);
    this.canvasTexture.anisotropy =
      this.renderer.capabilities.getMaxAnisotropy();
    this.canvasTexture.generateMipmaps = true;
    this.canvasTexture.magFilter = LinearFilter;
    this.canvasTexture.minFilter = LinearMipmapLinearFilter;
    this.whiteboardMaterial.map = this.canvasTexture;
    this.whiteboardMaterial.needsUpdate = true;

    this.renderWhiteboardArt();
  }

  // Rasterize the vector whiteboard art and stamp the visitor's first name
  // onto it in the Cube Lab display font, then push it to the canvas texture.
  // Degrades gracefully to the plain white board if anything fails.
  async renderWhiteboardArt() {
    const firstName =
      String(this.experience.cv?.name || "").trim().split(/\s+/)[0] || "";

    // Best-effort: the name still draws (in a fallback face) if this rejects.
    try {
      await Whiteboard.loadHandwritingFont();
    } catch {
      /* optional font */
    }

    const svgUrl = URL.createObjectURL(
      new Blob([whiteboardSvg], { type: "image/svg+xml" })
    );
    const image = new Image();

    image.onload = () => {
      // Vector ink art: welcome text, room sketch, prop labels, cube solution.
      this.drawingContext.drawImage(image, 0, 0, 2048, 1024);
      URL.revokeObjectURL(svgUrl);

      // Name signature — mirrors the original <text id="Name"> transform from
      // whiteboard.svg: translate(1721.8041, 983.817) rotate(-8.5498deg),
      // 72px red, -0.1em letter spacing.
      if (firstName) {
        const ctx = this.drawingContext;
        ctx.save();
        ctx.translate(1721.8041, 983.817);
        ctx.rotate((-8.5498 * Math.PI) / 180);
        ctx.font = "72px 'Cube Lab', sans-serif";
        ctx.fillStyle = "red";
        ctx.textBaseline = "alphabetic";
        if ("letterSpacing" in ctx) ctx.letterSpacing = "-7.2px";
        ctx.fillText(firstName, 0, 0);
        ctx.restore();
      }

      this.whiteboardMaterial.map.needsUpdate = true;
    };

    image.onerror = () => URL.revokeObjectURL(svgUrl);
    image.src = svgUrl;
  }

  // Register the Cube Lab font once at the document level so the canvas can
  // render the name with it. Cached across instances.
  static loadHandwritingFont() {
    if (Whiteboard.fontPromise) return Whiteboard.fontPromise;
    if (typeof FontFace === "undefined" || typeof document === "undefined") {
      Whiteboard.fontPromise = Promise.resolve();
      return Whiteboard.fontPromise;
    }
    const src = [
      `url(${withBase("comp/assets/fonts/CubeLab-Regular.woff2")}) format('woff2')`,
      `url(${withBase("comp/assets/fonts/CubeLab-Regular.woff")}) format('woff')`,
      `url(${withBase("comp/assets/fonts/CubeLab-Regular.ttf")}) format('truetype')`,
    ].join(", ");
    const face = new FontFace("Cube Lab", src);
    Whiteboard.fontPromise = face.load().then((loaded) => {
      document.fonts.add(loaded);
      return loaded;
    });
    return Whiteboard.fontPromise;
  }

  throttle(func, delay) {
    let timeoutId;
    return (...args) => {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          timeoutId = null;
        }, delay);
      }
    };
  }

  update() {
    if (!this.isActive) {
      return;
    }
    this.raycaster.setFromCamera(this.mouse, this.camera.instance);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );
    this.objectRaycasted = intersects.length > 0 ? intersects[0] : null;
  }

  draw(x, y) {
    this.drawingContext.strokeStyle = this.drawColor;

    this.drawingContext.moveTo(this.drawStartPos.x, this.drawStartPos.y);
    this.drawingContext.lineTo(x, y);
    this.drawingContext.stroke();
    // reset drawing start position to current position.
    this.drawStartPos.set(x, y);
    // need to flag the map as needing updating.
    this.whiteboardMaterial.map.needsUpdate = true;
  }

  onMouseDown = () => {
    if (
      this.objectRaycasted &&
      this.objectRaycasted.uv &&
      this.objectRaycasted.object.name == "whiteboardCanvas"
    ) {
      this.drawing = true;
      this.drawStartPos.set(
        this.objectRaycasted.uv.x * 2048,
        1024 - this.objectRaycasted.uv.y * 1024
      );
      this.drawingContext.beginPath();
    }
  };

  onMouseMove = () => {
    if (
      this.objectRaycasted &&
      this.objectRaycasted.object &&
      this.objectRaycasted.object.name == "whiteboardCanvas"
    ) {
      this.experience.navigation.orbitControls.enableDamping = false;
      this.experience.navigation.orbitControls.enabled = false;
      this.webglElement.style.pointerEvents = "none";
    } else {
      this.experience.navigation.orbitControls.enableDamping = true;
      this.experience.navigation.orbitControls.enabled = true;
      this.webglElement.style.pointerEvents = "auto";
    }

    if (
      this.drawing &&
      this.objectRaycasted &&
      this.objectRaycasted.uv &&
      this.objectRaycasted.object.name == "whiteboardCanvas"
    ) {
      this.draw(
        this.objectRaycasted.uv.x * 2048,
        1024 - this.objectRaycasted.uv.y * 1024
      );
    } else {
      this.drawing = false;
    }
  };

  onMouseUp = () => {
    this.drawing = false;
    this.drawingContext.closePath();
  };

  activateControls() {
    window.addEventListener("pointerdown", this.onMouseDown, false);
    window.addEventListener("pointermove", this.throttledMouseMove, false);
    window.addEventListener("pointerup", this.onMouseUp, false);
    this.onMouseMove();
    this.isActive = true;
  }

  deactivateControls() {
    window.removeEventListener("pointerdown", this.onMouseDown, false);
    window.removeEventListener("pointermove", this.throttledMouseMove, false);
    window.removeEventListener("pointerup", this.onMouseUp, false);
    this.isActive = false;
  }

  throttledMouseMove = this.throttle(this.onMouseMove, 15);

  changeWhiteboardColor = (key) => {
    const config = {
      "black-marker": { color: "black", lineWidth: 8 },
      "red-marker": { color: "red", lineWidth: 8 },
      "green-marker": { color: "darkgreen", lineWidth: 8 },
      "blue-marker": { color: "blue", lineWidth: 8 },
      eraser: { color: "white", lineWidth: 50 },
    };

    const { color, lineWidth } = config[key] || config["black-marker"];

    this.drawColor = color;
    this.drawingContext.lineWidth = lineWidth;
  };
}
