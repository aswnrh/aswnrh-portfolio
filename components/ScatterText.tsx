"use client";

import { useRef, useEffect, useCallback, useState } from "react";

// 5x7 dot-matrix font map — each character defined as rows of '#' (dot) and '.' (empty)
const FONT_MAP: Record<string, string[]> = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".####", "#....", "#....", "#.###", "#...#", "#...#", ".####"],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "...#.", "...#.", "...#.", "#..#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#...#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", ".#.#.", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#...#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "..##.", ".#...", "#....", "#####"],
  "3": [".###.", "#...#", "....#", "..##.", "....#", "#...#", ".###."],
  "4": ["#...#", "#...#", "#...#", "#####", "....#", "....#", "....#"],
  "5": ["#####", "#....", "#....", "####.", "....#", "....#", "####."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  ".": [".....", ".....", ".....", ".....", ".....", "..#..", "..#.."],
  ",": [".....", ".....", ".....", ".....", ".....", "..#..", ".#..."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  "?": [".###.", "#...#", "....#", "..##.", "..#..", ".....", "..#.."],
  "-": [".....", ".....", ".....", ".###.", ".....", ".....", "....."],
  "_": [".....", ".....", ".....", ".....", ".....", ".....", "#####"],
  "/": ["....#", "...#.", "...#.", "..#..", ".#...", ".#...", "#...."],
  ":": [".....", "..#..", "..#..", ".....", "..#..", "..#..", "....."],
  "'": ["..#..", "..#..", ".#...", ".....", ".....", ".....", "....."],
  "(": ["...#.", "..#..", ".#...", ".#...", ".#...", "..#..", "...#."],
  ")": [".#...", "..#..", "...#.", "...#.", "...#.", "..#..", ".#..."],
  "&": [".##..", "#..#.", "#..#.", ".##..", "#.#.#", "#..#.", ".##.#"],
  "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
};

interface Dot {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

interface ScatterTextProps {
  text: string;
  className?: string;
  fontSize?: number;
  color?: string;
  hoverColor?: string;
  center?: boolean;
}

// Physics — matched to mannan.io
const RADIUS = 60;
const STRENGTH = 0.9;
const SPRING = 0.085;
const DAMPING = 0.86;
const MAX_VELOCITY = 42;

function generateDots(text: string, fontSize: number): { dots: Dot[]; width: number; height: number } {
  // Scale dot grid to desired font size
  // 5 cols wide, 7 rows tall per character, with 1 col gap between chars
  const dotSpacing = fontSize / 7; // Each row = 1/7 of fontSize
  const dotRadius = dotSpacing * 0.35;
  const charWidth = 5; // 5 dots wide per char
  const charHeight = 7; // 7 dots tall
  const charGap = 1; // 1 dot gap between characters

  const dots: Dot[] = [];
  let cursorX = 0;

  for (const char of text.toUpperCase()) {
    const glyph = FONT_MAP[char] || FONT_MAP[" "];
    for (let row = 0; row < charHeight; row++) {
      const line = glyph[row] || "";
      for (let col = 0; col < line.length; col++) {
        if (line[col] === "#") {
          const x = (cursorX + col) * dotSpacing + dotSpacing / 2;
          const y = row * dotSpacing + dotSpacing / 2;
          dots.push({
            x,
            y,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
          });
        }
      }
    }
    cursorX += charWidth + charGap;
  }

  const totalWidth = cursorX * dotSpacing;
  const totalHeight = charHeight * dotSpacing;

  return { dots, width: totalWidth, height: totalHeight, };
}

export default function ScatterText({
  text,
  className = "",
  fontSize = 14,
  color = "#777777",
  hoverColor = "#00ff88",
  center = false,
}: ScatterTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const isHoveredRef = useRef(false);
  const rafRef = useRef<number>(0);
  const settledRef = useRef(0);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // Generate dot-matrix particles
  useEffect(() => {
    const { dots, width, height } = generateDots(text, fontSize);
    dotsRef.current = dots;
    // Add padding for scatter overflow
    const padX = fontSize * 1.5;
    const padY = fontSize * 0.8;
    setDims({ w: width + padX * 2, h: height + padY * 2 });
  }, [text, fontSize]);

  // Offset to account for padding
  const padX = fontSize * 1.5;
  const padY = fontSize * 0.8;

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, dims.w, dims.h);

    const activeColor = isHoveredRef.current ? hoverColor : color;
    const dotSpacing = fontSize / 7;
    const dotRadius = dotSpacing * 0.35;

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    let allSettled = true;

    ctx.fillStyle = activeColor;
    ctx.globalAlpha = 0.94;

    for (const dot of dotsRef.current) {
      // Draw position offset by padding
      const drawX = dot.x + padX;
      const drawY = dot.y + padY;

      // Mouse repulsion — use draw coordinates for distance calc
      const dx = drawX - mx;
      const dy = drawY - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < RADIUS && dist > 0) {
        const force = ((RADIUS - dist) / RADIUS) * STRENGTH;
        const angle = Math.atan2(dy, dx);
        dot.vx += Math.cos(angle) * force * 4;
        dot.vy += Math.sin(angle) * force * 4;
      }

      // Spring back to origin
      dot.vx += (dot.originX - dot.x) * SPRING;
      dot.vy += (dot.originY - dot.y) * SPRING;

      // Damping
      dot.vx *= DAMPING;
      dot.vy *= DAMPING;

      // Clamp velocity
      const vel = Math.sqrt(dot.vx * dot.vx + dot.vy * dot.vy);
      if (vel > MAX_VELOCITY) {
        dot.vx = (dot.vx / vel) * MAX_VELOCITY;
        dot.vy = (dot.vy / vel) * MAX_VELOCITY;
      }

      // Check if settled
      if (Math.abs(dot.vx) > 0.01 || Math.abs(dot.vy) > 0.01 ||
          Math.abs(dot.x - dot.originX) > 0.1 || Math.abs(dot.y - dot.originY) > 0.1) {
        allSettled = false;
      }

      dot.x += dot.vx;
      dot.y += dot.vy;

      // Draw dot
      ctx.beginPath();
      ctx.arc(dot.x + padX, dot.y + padY, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Auto-pause when settled (performance optimization)
    if (allSettled && mouseRef.current.x === -9999) {
      settledRef.current++;
      if (settledRef.current >= 10) {
        // Stop animation, will restart on mouse enter
        return;
      }
    } else {
      settledRef.current = 0;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [color, hoverColor, fontSize, dims, padX, padY]);

  // Setup canvas and global mouse tracking
  useEffect(() => {
    if (dims.w === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;

    const startAnimation = () => {
      settledRef.current = 0;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    // Global mouse tracking — scatter reacts when cursor is NEAR the text
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      // Check if within interaction range (RADIUS beyond canvas edges)
      const inRange =
        localX > -RADIUS && localX < dims.w + RADIUS &&
        localY > -RADIUS && localY < dims.h + RADIUS;

      if (inRange) {
        mouseRef.current = { x: localX, y: localY };
        isHoveredRef.current = true;
        startAnimation();
      } else if (isHoveredRef.current) {
        mouseRef.current = { x: -9999, y: -9999 };
        isHoveredRef.current = false;
        startAnimation();
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate, dims]);

  if (dims.w === 0) {
    return (
      <span
        className={`inline-block font-bold tracking-tight ${className}`}
        style={{ fontSize, lineHeight: `${fontSize}px`, opacity: 0 }}
      >
        {text}
      </span>
    );
  }

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        width: dims.w,
        height: dims.h,
        marginLeft: center ? undefined : -padX,
        marginTop: -padY,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: dims.w,
          height: dims.h,
          display: "block",
        }}
      />
      <span className="sr-only">{text}</span>
    </div>
  );
}
