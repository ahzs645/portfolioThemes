/**
 * Duck AI & Simulation — from baothiento.com source
 * Handles flocking, paddling states, food seeking, spawning, ripple generation
 */

const DUCK_COLORS = ['#FAF7F2', '#F5F0E8', '#EDE8DE', '#F0EBE0'];

export function lerpAngle(from, to, t) {
  let diff = ((to - from + 540) % 360) - 180;
  return from + diff * t;
}

function clampToEdge(entity) {
  const margin = 0.03;
  const max = 0.97;
  let clamped = false;
  if (entity.nx < margin) { entity.nx = margin; clamped = true; }
  if (entity.nx > max) { entity.nx = max; clamped = true; }
  if (entity.ny < margin) { entity.ny = margin; clamped = true; }
  if (entity.ny > max) { entity.ny = max; clamped = true; }
  if (clamped) {
    // Redirect toward center with jitter
    const cx = 0.5, cy = 0.5;
    entity.heading = Math.atan2(cy - entity.ny, cx - entity.nx) * 180 / Math.PI + (Math.random() - 0.5) * 60;
  }
}

export function createDuck(nx, ny, time) {
  return {
    kind: 'duck',
    id: Date.now() + Math.random(),
    nx, ny,
    heading: Math.random() * 360,
    speed: 0,
    targetSpeed: 0,
    speedBoost: 1,
    scale: 0, // Spawns at 0, grows to 1
    targetScale: 1,
    opacity: 1,
    rotation: 0,
    phase: Math.random() * Math.PI * 2,
    color: DUCK_COLORS[Math.floor(Math.random() * DUCK_COLORS.length)],
    mallard: Math.random() < 0.06,
    action: 'float',
    actionTimer: 2 + Math.random() * 4,
    spawnTime: time,
    lastRipple: time,
    leaving: false,
    leaveTarget: null,
  };
}

export function updateDucks(ducks, time, dt, foodItems) {
  const maxDucks = 15;
  const ripples = [];

  for (const duck of ducks) {
    if (duck.leaving) {
      // Move toward leave target
      if (duck.leaveTarget) {
        const dx = duck.leaveTarget.x - duck.nx;
        const dy = duck.leaveTarget.y - duck.ny;
        duck.heading = Math.atan2(dy, dx) * 180 / Math.PI;
        duck.speed = 1.2;
        duck.nx += Math.cos(duck.heading * Math.PI / 180) * 0.06 * duck.speed * dt;
        duck.ny += Math.sin(duck.heading * Math.PI / 180) * 0.05 * duck.speed * dt;
        duck.opacity = Math.max(0, duck.opacity - dt * 0.8);
      }
      continue;
    }

    // Scale in
    duck.scale += (duck.targetScale - duck.scale) * Math.min(1, dt * 3);

    // Flocking behavior
    let sepX = 0, sepY = 0, cohX = 0, cohY = 0;
    let alignSin = 0, alignCos = 0, neighbors = 0;

    for (const other of ducks) {
      if (other === duck || other.leaving) continue;
      const dx = other.nx - duck.nx;
      const dy = other.ny - duck.ny;
      const d2 = dx * dx + dy * dy;
      if (d2 < 0.04 * 0.04) {
        neighbors++;
        cohX += other.nx;
        cohY += other.ny;
        const hr = other.heading * Math.PI / 180;
        alignSin += Math.sin(hr);
        alignCos += Math.cos(hr);
        // Separation
        if (d2 < 0.036 * 0.036 && d2 > 0.0001) {
          const dist = Math.sqrt(d2);
          sepX -= dx / dist;
          sepY -= dy / dist;
        }
      }
    }

    let targetHeading = duck.heading;

    // Food seeking
    let nearestFood = null;
    let nearestFoodDist = Infinity;
    for (const food of foodItems) {
      if (food.eaten) continue;
      const dx = food.nx - duck.nx;
      const dy = food.ny - duck.ny;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < nearestFoodDist) {
        nearestFoodDist = d;
        nearestFood = food;
      }
    }

    if (nearestFood && nearestFoodDist < 0.2) {
      const foodAngle = Math.atan2(nearestFood.ny - duck.ny, nearestFood.nx - duck.nx) * 180 / Math.PI;
      targetHeading = foodAngle;
      duck.action = 'paddle';
      duck.targetSpeed = nearestFoodDist < 0.045 ? 0.3 : 0.9;
      if (nearestFoodDist < 0.02) {
        nearestFood.eaten = true;
      }
    } else {
      // Action state machine
      duck.actionTimer -= dt;
      if (duck.actionTimer <= 0) {
        if (duck.action === 'float') {
          duck.action = 'paddle';
          duck.actionTimer = 2 + Math.random() * 5;
          duck.targetSpeed = 0.8 + Math.random() * 0.35;
          targetHeading = duck.heading + (Math.random() - 0.5) * 90;
        } else {
          duck.action = 'float';
          duck.actionTimer = 2 + Math.random() * 10;
          duck.targetSpeed = 0;
        }
      }
    }

    // Apply flocking
    if (neighbors > 0) {
      cohX /= neighbors;
      cohY /= neighbors;
      const cohAngle = Math.atan2(cohY - duck.ny, cohX - duck.nx) * 180 / Math.PI;
      targetHeading = lerpAngle(targetHeading, cohAngle, 0.1);

      const alignHeading = Math.atan2(alignSin / neighbors, alignCos / neighbors) * 180 / Math.PI;
      targetHeading = lerpAngle(targetHeading, alignHeading, 0.15);
    }

    // Separation
    if (sepX !== 0 || sepY !== 0) {
      const sepAngle = Math.atan2(sepY, sepX) * 180 / Math.PI;
      targetHeading = lerpAngle(targetHeading, sepAngle, 0.3);
    }

    // Edge avoidance
    const edgeDist = 0.15;
    if (duck.nx < edgeDist) targetHeading = lerpAngle(targetHeading, 0, 0.2);
    if (duck.nx > 1 - edgeDist) targetHeading = lerpAngle(targetHeading, 180, 0.2);
    if (duck.ny < edgeDist) targetHeading = lerpAngle(targetHeading, 90, 0.2);
    if (duck.ny > 1 - edgeDist) targetHeading = lerpAngle(targetHeading, 270, 0.2);

    // Contagious paddling (5% chance per frame near fast paddlers)
    if (duck.action === 'float' && neighbors > 0) {
      for (const other of ducks) {
        if (other === duck || other.leaving || other.action !== 'paddle') continue;
        const dx = other.nx - duck.nx;
        const dy = other.ny - duck.ny;
        if (dx * dx + dy * dy < 0.05 * 0.05 && other.speed > 0.4 && Math.random() < 0.05) {
          duck.action = 'paddle';
          duck.actionTimer = 1.5 + Math.random() * 3;
          duck.targetSpeed = 0.6 + Math.random() * 0.3;
        }
      }
    }

    // Speed
    if (duck.action === 'paddle') {
      duck.speed += (duck.targetSpeed - duck.speed) * Math.min(1, dt * 3);
    } else {
      duck.speed *= Math.pow(0.15, dt);
    }
    duck.speedBoost += (1 - duck.speedBoost) * Math.min(1, dt * 2);

    // Turning
    const turnRate = 90 + duck.speed * 60; // degrees/sec
    duck.heading = lerpAngle(duck.heading, targetHeading, Math.min(1, turnRate * dt / 180));

    // Movement
    const headRad = duck.heading * Math.PI / 180;
    duck.nx += Math.cos(headRad) * 0.05 * duck.speed * duck.speedBoost * dt;
    duck.ny += Math.sin(headRad) * 0.06 * duck.speed * duck.speedBoost * dt;

    clampToEdge(duck);

    // Waddle rotation
    const waddle = duck.action === 'paddle' ? Math.sin(time * 6 + duck.phase) * 4 * duck.speed : 0;
    duck.rotation = lerpAngle(duck.rotation, duck.heading + waddle, Math.min(1, dt * 5));

    // Ripple spawning
    if (duck.speed > 0.15 && time - duck.lastRipple > 0.4) {
      duck.lastRipple = time;
      const behindX = duck.nx - Math.cos(headRad) * 0.02;
      const behindY = duck.ny - Math.sin(headRad) * 0.02;
      ripples.push({ nx: behindX, ny: behindY });
    }
  }

  // Remove fully faded ducks
  const activeDucks = ducks.filter(d => d.opacity > 0.01);

  // Cap at max, mark oldest for leaving
  if (activeDucks.length > maxDucks) {
    const nonLeaving = activeDucks.filter(d => !d.leaving);
    if (nonLeaving.length > 0) {
      const oldest = nonLeaving.reduce((a, b) => a.spawnTime < b.spawnTime ? a : b);
      oldest.leaving = true;
      // Find nearest edge
      const edges = [
        { x: -0.1, y: oldest.ny },
        { x: 1.1, y: oldest.ny },
        { x: oldest.nx, y: -0.1 },
        { x: oldest.nx, y: 1.1 },
      ];
      oldest.leaveTarget = edges.reduce((a, b) => {
        const da = (a.x - oldest.nx) ** 2 + (a.y - oldest.ny) ** 2;
        const db = (b.x - oldest.nx) ** 2 + (b.y - oldest.ny) ** 2;
        return da < db ? a : b;
      });
    }
  }

  return { ducks: activeDucks, ripples };
}

export function createFoodPellets(nx, ny) {
  const count = 5 + Math.floor(Math.random() * 5);
  return Array.from({ length: count }, (_, i) => ({
    id: Date.now() + i,
    nx: nx + (Math.random() - 0.5) * 0.08,
    ny: ny + (Math.random() - 0.5) * 0.06,
    hue: 28 + Math.random() * 12,
    size: 3 + Math.random() * 4,
    blur: 0.6 + Math.random() * 0.6,
    eaten: false,
    time: Date.now(),
  }));
}

export const DUCK_QUOTES = [
  'quack', 'quack quack', '*splash*', '*waddle*', 'nice pond',
  ':)', '*float*', '*paddle paddle*', '*glub*', 'hi!',
  '*preens feathers*', '*dips head*', '*shakes tail*', '*stretches wings*',
];
