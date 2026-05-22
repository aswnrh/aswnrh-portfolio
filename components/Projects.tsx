"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import ScatterText from "./ScatterText";

interface Dot {
  x: number; y: number;
  originX: number; originY: number;
  vx: number; vy: number;
  color: string;
}

type Project = {
  title: string;
  descriptionLines: string[];
  dotsFile: string;
};

const projectsList: Project[] = [
  {
    title: "PLUS",
    descriptionLines: [
      "A CHAT AND VIDEO PLATFORM CRAFTED USING",
      "WEBRTC AND MEDIASOUP WITH MULTI-USER",
      "CONFERENCING AND CHAT FEATURES."
    ],
    dotsFile: "/project-dots-webrtc.json",
  },
  {
    title: "FEASTO",
    descriptionLines: [
      "A COMPREHENSIVE MERN STACK PROJECT FOCUSED",
      "ON DESIGN EXCELLENCE, CATEGORY-BASED FOOD",
      "ORDERING AND STREAMLINED ORDER MANAGEMENT."
    ],
    dotsFile: "/project-dots-delivery.json",
  },
  {
    title: "AUCTREGAL",
    descriptionLines: [
      "AN INNOVATIVE AUCTION PLATFORM CRAFTED WITH",
      "NEXT.JS, NODE.JS AND EXPRESS, DESIGNED WITH",
      "A SCALABLE REPOSITORY ARCHITECTURE."
    ],
    dotsFile: "/project-dots-auction.json",
  }
];

// ──────────────── Physics constants ────────────────
const RADIUS = 55;
const STRENGTH = 0.9;
const SPRING = 0.085;
const DAMPING = 0.86;
const MAX_VEL = 42;
const SCALE = 3.2;
const DOT_R = 1.35;

// ──────────────── Scatter Border (animated dot border) ────────────────
function ScatterBorder({ width, height, radius = 12 }: { width: number; height: number; radius?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const settledRef = useRef(0);
  const initRef = useRef(false);

  const pad = 8;
  const cw = width + pad * 2;
  const ch = height + pad * 2;

  useEffect(() => {
    if (width === 0 || height === 0) return;
    // Generate dots along the rounded rectangle border
    const spacing = 6;
    const pts: { x: number; y: number }[] = [];
    const r = radius;
    const w = width;
    const h = height;

    // Top edge
    for (let x = r; x <= w - r; x += spacing) pts.push({ x, y: 0 });
    // Top-right corner
    for (let a = -Math.PI / 2; a <= 0; a += 0.3) pts.push({ x: w - r + Math.cos(a) * r, y: r + Math.sin(a) * r });
    // Right edge
    for (let y = r; y <= h - r; y += spacing) pts.push({ x: w, y });
    // Bottom-right corner
    for (let a = 0; a <= Math.PI / 2; a += 0.3) pts.push({ x: w - r + Math.cos(a) * r, y: h - r + Math.sin(a) * r });
    // Bottom edge
    for (let x = w - r; x >= r; x -= spacing) pts.push({ x, y: h });
    // Bottom-left corner
    for (let a = Math.PI / 2; a <= Math.PI; a += 0.3) pts.push({ x: r + Math.cos(a) * r, y: h - r + Math.sin(a) * r });
    // Left edge
    for (let y = h - r; y >= r; y -= spacing) pts.push({ x: 0, y });
    // Top-left corner
    for (let a = Math.PI; a <= 1.5 * Math.PI; a += 0.3) pts.push({ x: r + Math.cos(a) * r, y: r + Math.sin(a) * r });

    dotsRef.current = pts.map(p => ({
      x: p.x + pad, y: p.y + pad,
      originX: p.x + pad, originY: p.y + pad,
      vx: 0, vy: 0,
      color: "#00ff88",
    }));
    initRef.current = true;
  }, [width, height, radius]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !initRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

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
      if (vel > MAX_VEL) { dot.vx = (dot.vx / vel) * MAX_VEL; dot.vy = (dot.vy / vel) * MAX_VEL; }
      if (Math.abs(dot.vx) > 0.01 || Math.abs(dot.vy) > 0.01 ||
          Math.abs(dot.x - dot.originX) > 0.1 || Math.abs(dot.y - dot.originY) > 0.1) allSettled = false;
      dot.x += dot.vx;
      dot.y += dot.vy;

      ctx.fillStyle = "#777777";
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (allSettled && mx === -9999) { settledRef.current++; if (settledRef.current >= 10) return; } else settledRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
  }, [cw, ch]);

  useEffect(() => {
    if (!initRef.current || cw === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;

    const start = () => { settledRef.current = 0; cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(animate); };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;
      if (lx > -RADIUS && lx < cw + RADIUS && ly > -RADIUS && ly < ch + RADIUS) {
        mouseRef.current = { x: lx, y: ly };
        start();
      } else {
        mouseRef.current = { x: -9999, y: -9999 };
        start();
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    rafRef.current = requestAnimationFrame(animate);
    return () => { window.removeEventListener("mousemove", onMouseMove); cancelAnimationFrame(rafRef.current); };
  }, [animate, cw, ch]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: cw, height: ch, position: "absolute", top: -pad, left: -pad, pointerEvents: "none", zIndex: 10 }}
    />
  );
}

// ──────────────── Project Dot Image (loaded from JSON like hero) ────────────────
function ProjectDotImage({ dotsFile }: { dotsFile: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const isHoveredRef = useRef(false);
  const rafRef = useRef<number>(0);
  const settledRef = useRef(0);
  const [dims, setDims] = useState({ w: 0, h: 240 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => setDims({ w: container.clientWidth, h: 240 });
    update();
    const obs = new ResizeObserver(update);
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // Load dots from JSON
  useEffect(() => {
    if (dims.w === 0) return;
    fetch(dotsFile)
      .then(r => r.json())
      .then(data => {
        const srcW = data.columns * SCALE;
        const srcH = data.rows * SCALE;
        const scaleX = dims.w / srcW;
        const scaleY = dims.h / srcH;
        const s = Math.min(scaleX, scaleY);
        const offX = (dims.w - srcW * s) / 2;
        const offY = (dims.h - srcH * s) / 2;

        dotsRef.current = data.dots.map((d: { x: number; y: number; color: string }) => {
          const x = d.x * SCALE * s + offX;
          const y = d.y * SCALE * s + offY;
          return { x, y, originX: x, originY: y, vx: 0, vy: 0, color: d.color };
        });

        // Start animation after loading
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = dims.w * dpr;
        canvas.height = dims.h * dpr;
        startAnim();
      });
  }, [dotsFile, dims.w]);

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
      if (vel > MAX_VEL) { dot.vx = (dot.vx / vel) * MAX_VEL; dot.vy = (dot.vy / vel) * MAX_VEL; }
      if (Math.abs(dot.vx) > 0.01 || Math.abs(dot.vy) > 0.01 ||
          Math.abs(dot.x - dot.originX) > 0.1 || Math.abs(dot.y - dot.originY) > 0.1) allSettled = false;
      dot.x += dot.vx;
      dot.y += dot.vy;

      ctx.fillStyle = dot.color;
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_R, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (allSettled && mx === -9999) { settledRef.current++; if (settledRef.current >= 10) return; } else settledRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
  }, [dims]);

  const startAnim = () => {
    settledRef.current = 0;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (dims.w === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;
      if (lx > -RADIUS && lx < dims.w + RADIUS && ly > -RADIUS && ly < dims.h + RADIUS) {
        mouseRef.current = { x: lx, y: ly };
        isHoveredRef.current = true;
        startAnim();
      } else if (isHoveredRef.current) {
        mouseRef.current = { x: -9999, y: -9999 };
        isHoveredRef.current = false;
        startAnim();
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => { window.removeEventListener("mousemove", onMouseMove); cancelAnimationFrame(rafRef.current); };
  }, [dims, animate]);

  return (
    <div ref={containerRef} className="w-full h-[240px] overflow-hidden flex items-center justify-center">
      {dims.w > 0 && (
        <canvas ref={canvasRef} style={{ width: dims.w, height: dims.h, display: "block" }} />
      )}
    </div>
  );
}

// ──────────────── Project Card ────────────────
function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardDims, setCardDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const update = () => setCardDims({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={cardRef} className="relative w-full rounded-xl flex flex-col bg-transparent overflow-visible">
      {/* Animated dot border */}
      {cardDims.w > 0 && cardDims.h > 0 && (
        <ScatterBorder width={cardDims.w} height={cardDims.h} radius={12} />
      )}

      {/* Image area */}
      <ProjectDotImage dotsFile={project.dotsFile} />

      {/* Content */}
      <div 
        className="px-8 flex flex-col flex-grow items-center text-center"
        style={{ paddingTop: '28px', paddingBottom: '24px', gap: '14px' }}
      >
        <div>
          <ScatterText text={project.title} fontSize={12} color="#ffffff" hoverColor="#00ff88" center />
        </div>
        <div className="flex flex-col gap-0.5 items-center">
          {project.descriptionLines.map((line, i) => (
            <ScatterText key={i} text={line} fontSize={7.5} color="#777777" hoverColor="#aaaaaa" center />
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────── Main Section ────────────────
export default function Projects() {
  return (
    <section 
      id="work" 
      className="px-6 md:px-12 w-full flex flex-col items-center justify-center bg-transparent" 
      style={{ paddingTop: 'clamp(20px, 3vw, 50px)', paddingBottom: 'clamp(20px, 3vw, 50px)' }}
    >
      <div className="max-w-[1300px] w-full mx-auto flex flex-col items-center justify-center">
        <div className="flex justify-center" style={{ marginBottom: 'clamp(10px, 2vw, 28px)' }}>
          <ScatterText text="FEATURED CREATIONS" fontSize={14} color="#00ff88" hoverColor="#ffffff" center />
        </div>
        <div 
          className="flex flex-col items-center gap-1.5 text-center"
          style={{ marginBottom: 'clamp(16px, 3vw, 40px)' }}
        >
          <ScatterText text="A SELECTION OF HIGH-IMPACT DIGITAL SOLUTIONS, BUILT WITH FOCUS ON" fontSize={8.5} color="#666666" hoverColor="#aaaaaa" center />
          <ScatterText text="SCALABILITY, PERFORMANCE, AND EXCEPTIONAL USER EXPERIENCE." fontSize={8.5} color="#666666" hoverColor="#aaaaaa" center />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
          {projectsList.map((project, idx) => (
            <ProjectCard key={idx} project={project} />
          ))}
        </div>

      </div>
    </section>
  );
}
