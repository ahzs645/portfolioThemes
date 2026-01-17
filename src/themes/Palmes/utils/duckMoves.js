// Duck animation keyframes synced to scroll percentage (0-100%)
// Each keyframe defines position, rotation, and accessory visibility at a specific scroll %

export const duckKeyframes = [
  {
    frame: 1,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0.8, z: 0 },
    accessory: false
  },
  {
    frame: 46,
    position: { x: 4, y: 0, z: 4 },
    rotation: { x: 0, y: 0.8, z: 0 },
    accessory: true
  },
  {
    frame: 47,
    position: { x: 6, y: 0, z: 2 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    accessory: true
  },
  {
    frame: 65,
    position: { x: 1, y: 0, z: 2 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    accessory: true
  },
  {
    frame: 95,
    position: { x: -2, y: 0, z: 2 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    accessory: true
  },
  {
    frame: 99,
    position: { x: -5, y: 0, z: 2 },
    rotation: { x: 0, y: -Math.PI / 3, z: 0 },
    accessory: true
  },
];

// Default export for compatibility
export default { duckKeyframes };

// Interpolate between two keyframes based on progress (0-1)
function lerp(start, end, t) {
  return start + (end - start) * t;
}

// Get duck state at a given scroll percentage
export function getDuckState(scrollPercent) {
  const keyframes = duckKeyframes;

  // Find the surrounding keyframes
  let startFrame = keyframes[0];
  let endFrame = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (scrollPercent >= keyframes[i].frame && scrollPercent <= keyframes[i + 1].frame) {
      startFrame = keyframes[i];
      endFrame = keyframes[i + 1];
      break;
    }
  }

  // Handle edge cases
  if (scrollPercent <= keyframes[0].frame) {
    return {
      position: { ...keyframes[0].position },
      rotation: { ...keyframes[0].rotation },
      accessory: keyframes[0].accessory,
    };
  }

  if (scrollPercent >= keyframes[keyframes.length - 1].frame) {
    const last = keyframes[keyframes.length - 1];
    return {
      position: { ...last.position },
      rotation: { ...last.rotation },
      accessory: last.accessory,
    };
  }

  // Calculate interpolation progress
  const frameRange = endFrame.frame - startFrame.frame;
  const progress = (scrollPercent - startFrame.frame) / frameRange;

  return {
    position: {
      x: lerp(startFrame.position.x, endFrame.position.x, progress),
      y: lerp(startFrame.position.y, endFrame.position.y, progress),
      z: lerp(startFrame.position.z, endFrame.position.z, progress),
    },
    rotation: {
      x: lerp(startFrame.rotation.x, endFrame.rotation.x, progress),
      y: lerp(startFrame.rotation.y, endFrame.rotation.y, progress),
      z: lerp(startFrame.rotation.z, endFrame.rotation.z, progress),
    },
    accessory: scrollPercent >= 46,
  };
}
