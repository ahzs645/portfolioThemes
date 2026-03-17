import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const SHADES_OF_GREEN = [
  ['#ec275f', '#f25477', '#ffa7a6', '#ffdcdc', '#d4e0ee'],
  ['#3CB371', '#8A9A5B', '#3EB489', '#00AD83', '#01796F', '#1DB954', '#00674b'],
  ['#d4e09b', '#f6f4d2', '#cbdfbd', '#f19c79'],
];
const SHADES_OF_BROWN = ['sienna', 'brown', 'saddlebrown'];

const SCALE_FACTOR = 2.5;
const MAX_LEAF_RADIUS = 8 * SCALE_FACTOR;
const MAX_LEAF_DISTANCE = 25 * SCALE_FACTOR;

function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

const diff = (a, b) => (a > b ? a - b : b - a);
const shuffle = (arr) =>
  arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
const randSign = () => (Math.random() < 0.5 ? -1 : 1);
const randArr = (arr) => arr[Math.floor(Math.random() * arr.length)];

function atAngle(x, y, length, angle) {
  const rad = angle * (Math.PI / 180);
  return [x + length * Math.cos(rad), y + length * Math.sin(rad)];
}

function amendBoundingBox(x, y, sizes) {
  if (x < sizes.min.x && x > 0) sizes.min.x = x;
  if (y < sizes.min.y) sizes.min.y = y;
  if (x > sizes.max.x) sizes.max.x = x;
  if (y > sizes.max.y) sizes.max.y = y;
}

class Leaf {
  constructor(x, y, color, sizes) {
    this.x = x + Math.random() * MAX_LEAF_DISTANCE - 25 * SCALE_FACTOR;
    this.y = y + (Math.random() - 0.5) * 50 * SCALE_FACTOR;
    this.color = color;
    this.rotation = Math.random() * 360;
    this.radius = MAX_LEAF_RADIUS + Math.random() * MAX_LEAF_RADIUS;
    amendBoundingBox(this.x, this.y, sizes);
  }

  grow(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    const radiusY = this.radius >> 1;
    ctx.ellipse(radiusY, radiusY >> 1, this.radius, radiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

class Branch {
  constructor(x, y, angle, maxWidth, depth = 0, colors = null, leafs = [], sizes = null) {
    this.startingPoint = { x, y };
    this.colors = colors || {
      green: shuffle(randArr(SHADES_OF_GREEN)).slice(0, 3),
      brown: randArr(SHADES_OF_BROWN),
    };
    this.sizes = sizes || {
      min: { x: Infinity, y: Infinity },
      max: { x: -Infinity, y: -Infinity },
    };
    this.lineWidth = 20 - 10 * depth;
    this.children = [];
    this.leaves = leafs;
    this.path = [];

    let currX = x;
    let currY = y;
    this.path.push({ type: 'move', x, y });

    let i = 0;
    while (true) {
      if ((maxWidth * 0.0065) / (depth + 1) < i) break;
      const branchLength = 50 + Math.random() * (100 / (depth + 2));
      const branchAngle = gaussianRandom(depth > 0 ? angle - 30 : angle, 30);
      const [toX, toY] = atAngle(currX, currY, branchLength, branchAngle);
      if (toX > maxWidth || toX < 0) break;
      amendBoundingBox(toX, toY, this.sizes);

      if (Math.random() > 0.75 && depth < 1) {
        const [bx, by] = atAngle(currX, currY, branchLength / 2, branchAngle);
        this.children.push(
          new Branch(
            bx,
            by,
            branchAngle + randSign() * 90,
            maxWidth,
            depth + 1,
            this.colors,
            this.leaves,
            this.sizes
          )
        );
      }

      currX = toX;
      currY = toY;
      this.path.push({ type: 'line', x: currX, y: currY });
      i++;
    }

    i = 0;
    while (i < 10 || Math.random() > 0.1) {
      this.leaves.push(new Leaf(currX, currY, randArr(this.colors.green), this.sizes));
      i++;
    }
  }

  grow(ctx) {
    ctx.beginPath();
    for (const seg of this.path) {
      if (seg.type === 'move') ctx.moveTo(seg.x, seg.y);
      else ctx.lineTo(seg.x, seg.y);
    }
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.colors.brown;
    ctx.stroke();
    this.leaves.forEach((leaf) => leaf.grow(ctx));
    this.children.forEach((branch) => branch.grow(ctx));
  }

  render(canvas) {
    canvas.width =
      diff(this.sizes.max.x, this.sizes.min.x) + MAX_LEAF_RADIUS + MAX_LEAF_DISTANCE;
    canvas.height =
      diff(this.sizes.max.y, this.sizes.min.y) + MAX_LEAF_RADIUS * 2 + MAX_LEAF_DISTANCE * 2;

    const ctx = canvas.getContext('2d');
    const offsetX =
      this.startingPoint.x > 0
        ? this.sizes.min.x - MAX_LEAF_DISTANCE - MAX_LEAF_RADIUS
        : this.sizes.min.x;
    ctx.translate(-offsetX, -(this.sizes.min.y - MAX_LEAF_DISTANCE - MAX_LEAF_RADIUS));
    this.grow(ctx);

    return {
      cssWidth: canvas.width / SCALE_FACTOR,
      cssHeight: canvas.height / SCALE_FACTOR,
      side: this.startingPoint.x > 0 ? 'right' : 'left',
    };
  }
}

export function ProceduralTrees() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.innerWidth < 900) return;

    const MAX = (window.innerWidth / 2) * SCALE_FACTOR;

    const branches = [new Branch(MAX, 0, 200, MAX), new Branch(0, 0, 20, MAX)];

    branches.forEach((branch) => {
      const canvas = document.createElement('canvas');
      const { cssWidth, cssHeight, side } = branch.render(canvas);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.opacity = '0.7';
      canvas.style[side] = '0px';
      container.appendChild(canvas);
    });

    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return <TreeContainer ref={containerRef} />;
}

const TreeContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  height: 100%;
`;
