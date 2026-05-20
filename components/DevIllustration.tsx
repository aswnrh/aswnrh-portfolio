"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface Dot {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  color: string;
}

const RADIUS = 50;
const STRENGTH = 0.9;
const SPRING = 0.085;
const DAMPING = 0.86;
const MAX_VELOCITY = 42;
const SCALE = 3.8; // dot spacing in px
const DOT_R = 1.5; // dot render radius

// 4x5 lowercase pixel font
const FONT: Record<string, string[]> = {
  a: ["...", ".##", "#.#", "#.#", ".##"],
  b: ["#..", "#..", "##.", "#.#", "##."],
  c: ["...", ".##", "#..", "#..", ".##"],
  d: ["..#", "..#", ".##", "#.#", ".##"],
  e: ["...", ".#.", "#.#", "##.", ".##"],
  f: [".#.", "#..", "##.", "#..", "#.."],
  g: ["...", ".##", "#.#", ".##", "##."],
  h: ["#..", "#..", "##.", "#.#", "#.#"],
  i: [".#.", "...", ".#.", ".#.", ".#."],
  j: ["..#", "...", "..#", "..#", ".#."],
  k: ["#..", "#.#", "##.", "#.#", "#.#"],
  l: [".#.", ".#.", ".#.", ".#.", "..#"],
  m: ["....", "....", "####", "#.#.", "#.#."],
  n: ["...", "...", "##.", "#.#", "#.#"],
  o: ["...", ".#.", "#.#", "#.#", ".#."],
  p: ["...", "##.", "#.#", "##.", "#.."],
  r: ["...", ".##", "#..", "#..", "#.."],
  s: ["...", ".##", ".#.", "..#", "##."],
  t: [".#.", "##.", ".#.", ".#.", "..#"],
  u: ["...", "#.#", "#.#", "#.#", ".##"],
  v: ["...", "#.#", "#.#", ".#.", ".#."],
  w: ["....", "#..#", "#..#", "#.#.", ".##."],
  x: ["...", "#.#", ".#.", "#.#", "#.#"],
  y: ["...", "#.#", ".##", "..#", ".#."],
  " ": ["..", "..", "..", "..", ".."],
  ".": ["..", "..", "..", "..", "#."],
};

interface KW { text: string; x: number; y: number; color: string; }

const KEYWORDS: KW[] = [
  { text: "node.js", x: 390, y: 15, color: "#00ff88" },
  { text: "npm run dev", x: 370, y: 45, color: "#cb3837" },
  { text: "react", x: 395, y: 75, color: "#61dafb" },
  { text: "aws", x: 410, y: 105, color: "#ff9900" },
  { text: "javascript", x: 370, y: 135, color: "#f7df1e" },
  { text: "git push", x: 385, y: 168, color: "#f05033" },
  { text: "next.js", x: 390, y: 200, color: "#cccccc" },
  { text: "npm start", x: 378, y: 233, color: "#a855f7" },
  { text: "mongodb", x: 380, y: 265, color: "#00ed64" },
];

function buildKeywordDots(step: number): Dot[] {
  const dots: Dot[] = [];
  for (const kw of KEYWORDS) {
    let cx = 0;
    for (const char of kw.text) {
      const glyph = FONT[char];
      if (!glyph) { cx += 2; continue; }
      for (let r = 0; r < glyph.length; r++) {
        for (let c = 0; c < glyph[r].length; c++) {
          if (glyph[r][c] === "#") {
            const x = kw.x + (cx + c) * (step * 0.65);
            const y = kw.y + r * (step * 0.65);
            dots.push({ x, y, originX: x, originY: y, vx: 0, vy: 0, color: kw.color });
          }
        }
      }
      cx += (glyph[0]?.length || 2) + 1;
    }
  }
  return dots;
}

export default function DevIllustration({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const isHoveredRef = useRef(false);
  const rafRef = useRef<number>(0);
  const settledRef = useRef(0);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // Load scatter data from JSON
  useEffect(() => {
    fetch("/scatter-dots.json")
      .then((res) => res.json())
      .then((data) => {
        const artDots: Dot[] = data.dots.map((d: { x: number; y: number; color: string }) => {
          const x = d.x * SCALE;
          const y = d.y * SCALE;
          return { x, y, originX: x, originY: y, vx: 0, vy: 0, color: d.color };
        });

        // Add keyword dots
        const kwDots = buildKeywordDots(SCALE);
        const allDots = [...artDots, ...kwDots];
        dotsRef.current = allDots;

        const maxX = Math.max(...allDots.map((d) => d.originX));
        const maxY = Math.max(...allDots.map((d) => d.originY));
        setDims({ w: Math.max(maxX + 40, 480), h: maxY + 40 });
      });
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, dims.w, dims.h);

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    let allSettled = true;

    for (const dot of dotsRef.current) {
      const dx = dot.x - mx;
      const dy = dot.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < RADIUS && dist > 0) {
        const force = ((RADIUS - dist) / RADIUS) * STRENGTH;
        const angle = Math.atan2(dy, dx);
        dot.vx += Math.cos(angle) * force * 4;
        dot.vy += Math.sin(angle) * force * 4;
      }

      dot.vx += (dot.originX - dot.x) * SPRING;
      dot.vy += (dot.originY - dot.y) * SPRING;
      dot.vx *= DAMPING;
      dot.vy *= DAMPING;

      const vel = Math.sqrt(dot.vx * dot.vx + dot.vy * dot.vy);
      if (vel > MAX_VELOCITY) {
        dot.vx = (dot.vx / vel) * MAX_VELOCITY;
        dot.vy = (dot.vy / vel) * MAX_VELOCITY;
      }

      if (Math.abs(dot.vx) > 0.01 || Math.abs(dot.vy) > 0.01 ||
          Math.abs(dot.x - dot.originX) > 0.1 || Math.abs(dot.y - dot.originY) > 0.1) {
        allSettled = false;
      }

      dot.x += dot.vx;
      dot.y += dot.vy;

      ctx.fillStyle = dot.color;
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_R, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    if (allSettled && mouseRef.current.x === -9999) {
      settledRef.current++;
      if (settledRef.current >= 10) return;
    } else {
      settledRef.current = 0;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [dims]);

  useEffect(() => {
    if (dims.w === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;

    const start = () => {
      settledRef.current = 0;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;
      const inRange = lx > -RADIUS && lx < dims.w + RADIUS && ly > -RADIUS && ly < dims.h + RADIUS;
      if (inRange) {
        mouseRef.current = { x: lx, y: ly };
        isHoveredRef.current = true;
        start();
      } else if (isHoveredRef.current) {
        mouseRef.current = { x: -9999, y: -9999 };
        isHoveredRef.current = false;
        start();
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    rafRef.current = requestAnimationFrame(animate);
    return () => { window.removeEventListener("mousemove", onMouseMove); cancelAnimationFrame(rafRef.current); };
  }, [animate, dims]);

  if (dims.w === 0) return null;

  return (
    <div className={className} style={{ width: dims.w, height: dims.h }}>
      <canvas ref={canvasRef} style={{ width: dims.w, height: dims.h, display: "block" }} />
    </div>
  );
}
