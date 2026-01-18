import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useGLTF } from '@react-three/drei';
import { AnimationMixer, MathUtils } from 'three';
import DuckMoves from '../utils/duckMoves';

// Inactivity timeout before switching to idle animation
const MOVE_TIMEOUT_MS = 50;

// Convert moves based on camera FOV
function convertMoves(moves, width, height) {
  return moves.map(move => ({
    ...move,
    position: {
      x: (move.position.x * width) / 10,
      y: (move.position.y * height) / 10,
      z: move.position.z,
    },
  }));
}

// Interpolate between start and end based on scroll
function getPath(start, end, scroll, frameStart, frameEnd) {
  const percentage = ((scroll * 100) - frameStart) / (frameEnd - frameStart);
  const result = (end - start) * percentage + start;
  return isFinite(result) ? result : start;
}

// Update object positions based on keyframes
function updatePositions(object, start, end, scrollY, reverse = false, justReversed = 0) {
  object.position.x = getPath(start.position.x, end.position.x, scrollY, start.frame, end.frame);
  object.position.y = getPath(start.position.y, end.position.y, scrollY, start.frame, end.frame);
  object.position.z = getPath(start.position.z, end.position.z, scrollY, start.frame, end.frame);
  object.rotation.x = getPath(start.rotation.x, end.rotation.x, scrollY, start.frame, end.frame);
  object.rotation.z = getPath(start.rotation.z, end.rotation.z, scrollY, start.frame, end.frame);

  if (reverse) {
    object.rotation.y = getPath(
      start.rotation.y + Math.PI,
      end.rotation.y + (Math.PI * !justReversed),
      scrollY,
      start.frame,
      end.frame
    );
  } else {
    object.rotation.y = getPath(start.rotation.y, end.rotation.y, scrollY, start.frame, end.frame);
  }
}

// Calculate distance between positions
function distance(pos1, pos2) {
  return Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) +
    Math.pow(pos1.y - pos2.y, 2) +
    Math.pow(pos1.z - pos2.z, 2)
  );
}

export default function Duck({ scrollPercent, isScrolling }) {
  const duckRef = useRef();
  const mixerRef = useRef(null);
  const lastScrollRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());
  const lastReverseRef = useRef(false);
  const stateRef = useRef(null);
  const ciscoVisibleRef = useRef(false);
  const [movements, setMovements] = useState(DuckMoves.duckKeyframes);

  // Load duck model
  const gltf = useLoader(GLTFLoader, '/models/duck_centered.glb');

  // Load cisco accessory
  const cisco = useGLTF('/models/cisco_centered.glb');

  // Create animation mixer
  useEffect(() => {
    if (gltf.scene && gltf.animations.length > 0) {
      mixerRef.current = new AnimationMixer(gltf.scene);
      console.log('Animations available:', gltf.animations.map(a => a.name));
    }
  }, [gltf]);

  // Attach cisco to duck bone
  useEffect(() => {
    if (gltf.nodes && cisco.nodes) {
      // Find a bone/node to attach cisco to
      Object.keys(cisco.nodes).forEach(k => {
        const node = cisco.nodes[k];
        node.scale.set(0.001, 0.001, 0.001);
        node.position.y = -15;
        node.position.x = 8.20;
        node.position.z = 3;
        node.rotation.y = -Math.PI / 6;
        node.rotation.x = Math.PI / 10;

        // Try to find the head bone (MarineHub002_00 or similar)
        const headBone = gltf.nodes.MarineHub002_00 || Object.values(gltf.nodes)[0];
        if (headBone) {
          headBone.add(node);
        }
      });
    }
  }, [gltf.nodes, cisco.nodes]);

  // Get camera and convert movements
  const { camera } = useThree();

  useEffect(() => {
    const vFOV = MathUtils.degToRad(camera.fov);
    const maxY = 2 * Math.tan(vFOV / 2) * 5;
    const maxX = maxY * camera.aspect;
    const converted = convertMoves(DuckMoves.duckKeyframes, maxX, maxY);
    setMovements(converted);

    // Set initial position
    if (duckRef.current && converted.length > 0) {
      updatePositions(duckRef.current, converted[0], converted[0], 0);
    }
  }, [camera]);

  // Toggle cisco visibility
  const toggleCisco = (visible) => {
    Object.keys(cisco.nodes).forEach(k => {
      const node = cisco.nodes[k];
      node.visible = visible;
      if (visible) {
        node.scale.set(0.5, 0.5, 0.5);
      } else {
        node.scale.set(0.001, 0.001, 0.001);
      }
    });
  };

  // Switch animation
  const switchAnimation = (index) => {
    if (!mixerRef.current || !gltf.animations[index]) return;
    if (stateRef.current === index) return;

    const action = mixerRef.current.clipAction(gltf.animations[index]);
    action.reset();
    action.play();
    stateRef.current = index;
  };

  // Animation frame
  useFrame((state, delta) => {
    if (!duckRef.current || !movements.length) return;

    const scrollY = scrollPercent / 100; // Convert to 0-1 range
    const moving = scrollY === lastScrollRef.current ? 0 : (scrollY > lastScrollRef.current ? 1 : -1);

    // Find current keyframes
    let start = movements[0];
    let end = movements[1] || movements[0];

    for (let i = 0; i < movements.length && movements[i].frame <= (scrollY * 100); i++) {
      start = movements[i];
      end = (i < movements.length - 1) ? movements[i + 1] : movements[i];
    }

    const reverse = moving === -1 && start.frame !== end.frame;

    if (moving) {
      // Walking animation (index 1)
      switchAnimation(1);

      // Toggle cisco accessory
      if (start.accessory !== ciscoVisibleRef.current) {
        toggleCisco(start.accessory);
        ciscoVisibleRef.current = start.accessory;
      }

      // Update position
      updatePositions(
        duckRef.current,
        start,
        end,
        scrollY,
        reverse,
        lastReverseRef.current === end.frame
      );

      // Update animation mixer
      if (mixerRef.current) {
        const dist = distance(start.position, end.position);
        mixerRef.current.update(dist * 0.3 * Math.abs(scrollY - lastScrollRef.current) / 0.15);
      }

      lastScrollTimeRef.current = Date.now();
    } else if (Date.now() - lastScrollTimeRef.current > MOVE_TIMEOUT_MS) {
      // Idle animation (index 0)
      if (scrollY === 0 && duckRef.current.rotation.y !== start.rotation.y) {
        // Slowly rotate back to initial position
        let begin = duckRef.current.rotation.y % (2 * Math.PI);
        let target = start.rotation.y % (2 * Math.PI);
        let rotation = Math.PI / 10;

        if (Math.abs(target - begin) < rotation) {
          duckRef.current.rotation.y = start.rotation.y;
        } else {
          duckRef.current.rotation.y = (duckRef.current.rotation.y - rotation) % (Math.PI * 2);
        }
      }

      switchAnimation(0);
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
    }

    lastScrollRef.current = scrollY;
    lastReverseRef.current = moving === 1 ? false : (lastReverseRef.current || end.frame);
  });

  return (
    <mesh ref={duckRef} scale={1}>
      <primitive object={gltf.scene} scale={0.75} />
    </mesh>
  );
}

// Preload models
useGLTF.preload('/models/duck_centered.glb');
useGLTF.preload('/models/cisco_centered.glb');
