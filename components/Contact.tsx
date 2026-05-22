"use client";

import React, { useRef, useEffect, useCallback } from "react";
import ScatterText from "./ScatterText";

// ──────────────── Scatter Social Icon ────────────────
function generateIconDots(type: "linkedin" | "email"): { x: number; y: number }[] {
  const pts: { r: number; c: number }[] = [];

  if (type === "linkedin") {
    // "in" letters
    pts.push({ r: 2, c: 2 }, { r: 2, c: 3 });
    for (let r = 4; r <= 9; r++) { pts.push({ r, c: 2 }); pts.push({ r, c: 3 }); }
    pts.push({ r: 4, c: 5 }, { r: 4, c: 6 }, { r: 4, c: 7 }, { r: 4, c: 8 });
    for (let r = 5; r <= 9; r++) { pts.push({ r, c: 5 }); pts.push({ r, c: 8 }); }
    pts.push({ r: 5, c: 6 });
  } else if (type === "email") {
    // Envelope
    for (let c = 1; c <= 9; c++) { pts.push({ r: 2, c }); pts.push({ r: 9, c }); }
    for (let r = 3; r <= 8; r++) { pts.push({ r, c: 1 }); pts.push({ r, c: 9 }); }
    // V flap
    pts.push({ r: 3, c: 2 }, { r: 3, c: 8 });
    pts.push({ r: 4, c: 3 }, { r: 4, c: 7 });
    pts.push({ r: 5, c: 4 }, { r: 5, c: 6 });
    pts.push({ r: 6, c: 5 });
  }

  const minR = Math.min(...pts.map(p => p.r));
  const maxR = Math.max(...pts.map(p => p.r));
  const minC = Math.min(...pts.map(p => p.c));
  const maxC = Math.max(...pts.map(p => p.c));
  const spacing = 3.2;
  const gridW = (maxC - minC) * spacing;
  const gridH = (maxR - minR) * spacing;
  const size = 44;
  const offX = (size - gridW) / 2 - minC * spacing;
  const offY = (size - gridH) / 2 - minR * spacing;

  return pts.map(p => ({ x: p.c * spacing + offX, y: p.r * spacing + offY }));
}

function ScatterIcon({ type, color = "#777777", hoverColor = "#00ff88" }: { type: "linkedin" | "email"; color?: string; hoverColor?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<{ x: number; y: number; originX: number; originY: number; vx: number; vy: number }[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const isHoveredRef = useRef(false);
  const rafRef = useRef<number>(0);
  const settledRef = useRef(0);
  const size = 44;

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const activeColor = isHoveredRef.current ? hoverColor : color;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    let allSettled = true;

    ctx.fillStyle = activeColor;
    ctx.globalAlpha = 0.94;
    for (const dot of dotsRef.current) {
      const dx = dot.x - mx, dy = dot.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 40 && dist > 0) {
        const force = ((40 - dist) / 40) * 1.1;
        const angle = Math.atan2(dy, dx);
        dot.vx += Math.cos(angle) * force * 5;
        dot.vy += Math.sin(angle) * force * 5;
      }
      dot.vx += (dot.originX - dot.x) * 0.085;
      dot.vy += (dot.originY - dot.y) * 0.085;
      dot.vx *= 0.86; dot.vy *= 0.86;
      if (Math.abs(dot.vx) > 0.01 || Math.abs(dot.vy) > 0.01 || Math.abs(dot.x - dot.originX) > 0.1 || Math.abs(dot.y - dot.originY) > 0.1) allSettled = false;
      dot.x += dot.vx; dot.y += dot.vy;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (allSettled && mx === -9999) { settledRef.current++; if (settledRef.current >= 10) return; } else settledRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
  }, [color, hoverColor]);

  useEffect(() => {
    const raw = generateIconDots(type);
    dotsRef.current = raw.map(d => ({ x: d.x, y: d.y, originX: d.x, originY: d.y, vx: 0, vy: 0 }));
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const start = () => { settledRef.current = 0; cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(animate); };
    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const lx = e.clientX - rect.left, ly = e.clientY - rect.top;
      if (lx > -40 && lx < size + 40 && ly > -40 && ly < size + 40) {
        mouseRef.current = { x: lx, y: ly }; isHoveredRef.current = true; start();
      } else if (isHoveredRef.current) {
        mouseRef.current = { x: -9999, y: -9999 }; isHoveredRef.current = false; start();
      }
    };
    window.addEventListener("mousemove", onMouse);
    rafRef.current = requestAnimationFrame(animate);
    return () => { window.removeEventListener("mousemove", onMouse); cancelAnimationFrame(rafRef.current); };
  }, [type, animate]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, display: "block", cursor: "pointer" }} />;
}

// ──────────────── Main Section ────────────────
export default function Contact() {
  return (
    <section 
      id="contact" 
      className="px-6 md:px-12 w-full flex flex-col items-center justify-center bg-transparent" 
      style={{ paddingTop: 'clamp(20px, 3vw, 50px)', paddingBottom: 'clamp(30px, 4vw, 60px)' }}
    >
      <div className="max-w-[800px] w-full mx-auto flex flex-col items-center text-center">
        {/* Title */}
        <div className="flex justify-center" style={{ marginBottom: "12px" }}>
          <ScatterText text="LETS CONNECT" fontSize={14} color="#00ff88" hoverColor="#ffffff" center />
        </div>

        {/* Description */}
        <div 
          className="flex flex-col items-center gap-1.5"
          style={{ marginBottom: '16px' }}
        >
          <ScatterText text="I AM ALWAYS OPEN TO DISCUSSING NEW PROJECTS," fontSize={9} color="#777777" hoverColor="#aaaaaa" center />
          <ScatterText text="CREATIVE IDEAS, OR OPPORTUNITIES TO BE PART OF" fontSize={9} color="#777777" hoverColor="#aaaaaa" center />
          <ScatterText text="YOUR VISION. WHETHER YOU HAVE A QUESTION OR JUST" fontSize={9} color="#777777" hoverColor="#aaaaaa" center />
          <ScatterText text="WANT TO SAY HELLO, FEEL FREE TO REACH OUT." fontSize={9} color="#777777" hoverColor="#aaaaaa" center />
        </div>

        <div 
          className="flex flex-col items-center gap-1.5"
          style={{ marginBottom: 'clamp(24px, 4vw, 40px)' }}
        >
          <ScatterText text="LETS BUILD SOMETHING AMAZING TOGETHER." fontSize={9} color="#999999" hoverColor="#00ff88" center />
          <ScatterText text="STAY IN TOUCH THROUGH LINKEDIN AND EMAIL." fontSize={9} color="#999999" hoverColor="#00ff88" center />
        </div>

        {/* Download Resume Button */}
        <div 
          className="flex justify-center"
          style={{ marginBottom: 'clamp(24px, 4vw, 40px)' }}
        >
          <a
            href="/resume.pdf"
            download
            className="flex items-center justify-center transition-opacity hover:opacity-80 group"
          >
            <ScatterText
              text="DOWNLOAD RESUME"
              fontSize={9}
              color="#00ff88"
              hoverColor="#ffffff"
              center
            />
          </a>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-10">
          <a href="https://linkedin.com/in/aswnrhdev" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
            <ScatterIcon type="linkedin" />
          </a>
          <a href="mailto:aswnrh@gmail.com" className="transition-opacity hover:opacity-80">
            <ScatterIcon type="email" />
          </a>
        </div>
      </div>
    </section>
  );
}
