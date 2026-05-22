"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import ScatterText from "./ScatterText";

type TimelineItem = {
  type: "work" | "education";
  side: "left" | "right";
  title: string;
  subtitle: string;
  location?: string;
  date: string;
  duration?: string;
  bullets: string[][];
  iconType: "work" | "code" | "education";
};

const timelineItems: TimelineItem[] = [
  {
    type: "work",
    side: "left",
    title: "JR. SOFTWARE ENGINEER",
    subtitle: "ENFIN TECHNOLOGIES",
    location: "TRIVANDRUM - ON-SITE",
    date: "JAN 2025 - PRESENT",
    bullets: [
      [
        "BUILDING AND OPTIMIZING SCALABLE",
        "WEB APPLICATIONS ON NODE & REACT"
      ],
      [
        "DEVELOPING REAL-TIME WEBRTC VIDEO",
        "CONFERENCING AND CHAT SOLUTIONS"
      ],
      [
        "COLLABORATING WITH TEAMS TO DESIGN",
        "CLEAN ARCHITECTURES AND APIS"
      ]
    ],
    iconType: "work",
  },
  {
    type: "work",
    side: "left",
    title: "FREELANCE WEB DEVELOPER",
    subtitle: "FREELANCE WORK",
    location: "REMOTE WORK",
    date: "SEP 2023 - OCT 2024",
    bullets: [
      [
        "DEVELOPED AND DEPLOYED THREE",
        "PRODUCTION WEB APPLICATIONS"
      ],
      [
        "LOGGED OVER 2000+ HOURS GAINING",
        "HANDS-ON TOOL EXPERIENCE"
      ]
    ],
    iconType: "code",
  },
  {
    type: "education",
    side: "right",
    title: "B.SC. COMPUTER SCIENCE",
    subtitle: "UNIVERSITY OF CALICUT",
    location: "KERALA - INDIA",
    date: "2020 - 2023",
    bullets: [
      [
        "COMPLETED BILINGUAL SPEECH RECOGNITION",
        "PROJECT LINKING CODING & LINGUISTICS"
      ],
      [
        "GAINED HANDS-ON AR & VR EXPERIENCE",
        "THROUGH AN INDUSTRIAL VISIT"
      ]
    ],
    iconType: "education",
  }
];

function generateIconDots(type: "work" | "code" | "education"): { x: number; y: number }[] {
  const pts: { r: number; c: number }[] = [];
  
  if (type === "work") {
    // Handle
    pts.push({ r: 1, c: 4 }, { r: 1, c: 5 }, { r: 1, c: 6 }, { r: 1, c: 7 });
    pts.push({ r: 2, c: 4 }, { r: 2, c: 7 });
    // Body
    for (let r = 4; r <= 9; r++) {
      for (let c = 2; c <= 9; c++) {
        pts.push({ r, c });
      }
    }
  } else if (type === "code") {
    // Left bracket
    pts.push(
      { r: 3, c: 4 }, { r: 4, c: 3 }, { r: 5, c: 2 }, { r: 6, c: 1 },
      { r: 7, c: 2 }, { r: 8, c: 3 }, { r: 9, c: 4 }
    );
    // Right bracket
    pts.push(
      { r: 3, c: 7 }, { r: 4, c: 8 }, { r: 5, c: 9 }, { r: 6, c: 10 },
      { r: 7, c: 9 }, { r: 8, c: 8 }, { r: 9, c: 7 }
    );
    // Slash
    pts.push(
      { r: 3, c: 8 }, { r: 4, c: 7 }, { r: 5, c: 6 },
      { r: 6, c: 5 }, { r: 7, c: 4 }, { r: 8, c: 3 }
    );
  } else if (type === "education") {
    // Graduation Cap
    // Diamond top
    pts.push({ r: 2, c: 6 });
    for (let c = 5; c <= 7; c++) pts.push({ r: 3, c });
    for (let c = 4; c <= 8; c++) pts.push({ r: 4, c });
    for (let c = 3; c <= 9; c++) pts.push({ r: 5, c });
    for (let c = 2; c <= 10; c++) pts.push({ r: 6, c });
    for (let c = 3; c <= 9; c++) pts.push({ r: 7, c });
    pts.push({ r: 8, c: 6 });
    // Base
    for (let c = 4; c <= 8; c++) pts.push({ r: 9, c });
    pts.push({ r: 10, c: 4 }, { r: 10, c: 8 });
    // Tassel
    pts.push({ r: 7, c: 1 }, { r: 8, c: 1 });
  }

  // Calculate actual bounding box to center it
  const minR = Math.min(...pts.map(p => p.r));
  const maxR = Math.max(...pts.map(p => p.r));
  const minC = Math.min(...pts.map(p => p.c));
  const maxC = Math.max(...pts.map(p => p.c));

  const spacing = 2.2;
  const gridW = (maxC - minC) * spacing;
  const gridH = (maxR - minR) * spacing;
  
  const offsetX = (40 - gridW) / 2 - minC * spacing;
  const offsetY = (40 - gridH) / 2 - minR * spacing;

  return pts.map(p => ({
    x: p.c * spacing + offsetX,
    y: p.r * spacing + offsetY
  }));
}

function ScatterIcon({ type }: { type: "work" | "code" | "education" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<{ x: number; y: number; originX: number; originY: number; vx: number; vy: number }[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const isHoveredRef = useRef(false);
  const rafRef = useRef<number>(0);
  const settledRef = useRef(0);
  const size = 40;
  const RADIUS_ICON = 40;

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const activeColor = isHoveredRef.current ? "#ffffff" : "#00ff88";
    const dotSpacing = 2.2;
    const dotRadius = dotSpacing * 0.45;

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    let allSettled = true;

    ctx.fillStyle = activeColor;
    ctx.globalAlpha = 0.96;

    for (const dot of dotsRef.current) {
      const dx = dot.x - mx;
      const dy = dot.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < RADIUS_ICON && dist > 0) {
        const force = ((RADIUS_ICON - dist) / RADIUS_ICON) * 1.2;
        const angle = Math.atan2(dy, dx);
        dot.vx += Math.cos(angle) * force * 5.5;
        dot.vy += Math.sin(angle) * force * 5.5;
      }

      dot.vx += (dot.originX - dot.x) * 0.085;
      dot.vy += (dot.originY - dot.y) * 0.085;

      dot.vx *= 0.86;
      dot.vy *= 0.86;

      if (Math.abs(dot.vx) > 0.01 || Math.abs(dot.vy) > 0.01 ||
          Math.abs(dot.x - dot.originX) > 0.1 || Math.abs(dot.y - dot.originY) > 0.1) {
        allSettled = false;
      }

      dot.x += dot.vx;
      dot.y += dot.vy;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    if (allSettled && mouseRef.current.x === -9999) {
      settledRef.current++;
      if (settledRef.current >= 10) {
        return;
      }
    } else {
      settledRef.current = 0;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const startAnimation = () => {
    settledRef.current = 0;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const rawDots = generateIconDots(type);
    dotsRef.current = rawDots.map(d => ({
      x: d.x,
      y: d.y,
      originX: d.x,
      originY: d.y,
      vx: 0,
      vy: 0,
    }));

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    startAnimation();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;

      const inRange =
        lx > -RADIUS_ICON && lx < size + RADIUS_ICON &&
        ly > -RADIUS_ICON && ly < size + RADIUS_ICON;

      if (inRange) {
        mouseRef.current = { x: lx, y: ly };
        isHoveredRef.current = true;
        startAnimation();
      } else if (isHoveredRef.current) {
        mouseRef.current = { x: -9999, y: -9999 };
        isHoveredRef.current = false;
        startAnimation();
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [type, animate]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        display: "block",
        cursor: "pointer",
      }}
    />
  );
}

function TimelineDottedLine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<{ x: number; y: number; originX: number; originY: number; vx: number; vy: number }[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const settledRef = useRef(0);
  const [dims, setDims] = useState({ w: 80, h: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setDims({ w: 80, h: container.clientHeight });
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const RADIUS_LINE = 60;
  const STRENGTH_LINE = 1.0;
  const SPRING_LINE = 0.085;
  const DAMPING_LINE = 0.86;

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.h === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, dims.w, dims.h);

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    
    const dotSpacing = 10;
    const numDots = Math.ceil(dims.h / dotSpacing);

    if (dotsRef.current.length !== numDots) {
      dotsRef.current = Array.from({ length: numDots }, (_, i) => {
        const originX = dims.w / 2;
        const originY = i * dotSpacing;
        return {
          x: originX,
          y: originY,
          originX,
          originY,
          vx: 0,
          vy: 0,
        };
      });
    }

    const flowSpeed = 0.35;
    let allSettled = true;

    ctx.fillStyle = "#00ff88";

    dotsRef.current.forEach((dot, i) => {
      // Flow downwards
      dot.originY = (i * dotSpacing + performance.now() * flowSpeed) % dims.h;

      const dx = dot.x - mx;
      const dy = dot.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < RADIUS_LINE && dist > 0) {
        const force = ((RADIUS_LINE - dist) / RADIUS_LINE) * STRENGTH_LINE;
        const angle = Math.atan2(dy, dx);
        dot.vx += Math.cos(angle) * force * 5.5;
        dot.vy += Math.sin(angle) * force * 5.5;
      }

      dot.vx += (dot.originX - dot.x) * SPRING_LINE;
      dot.vy += (dot.originY - dot.y) * SPRING_LINE;

      dot.vx *= DAMPING_LINE;
      dot.vy *= DAMPING_LINE;

      if (Math.abs(dot.vx) > 0.01 || Math.abs(dot.vy) > 0.01 ||
          Math.abs(dot.x - dot.originX) > 0.1 || Math.abs(dot.y - dot.originY) > 0.1) {
        allSettled = false;
      }

      dot.x += dot.vx;
      dot.y += dot.vy;

      // Soft fading opacity
      const opacity = Math.max(0, 1 - dot.y / dims.h) * 0.45;
      ctx.globalAlpha = opacity;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    if (allSettled && mouseRef.current.x === -9999) {
      settledRef.current++;
      if (settledRef.current >= 10) return;
    } else {
      settledRef.current = 0;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [dims]);

  const startAnimation = () => {
    settledRef.current = 0;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (dims.h === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;

    startAnimation();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;

      const inRange =
        lx > -RADIUS_LINE && lx < dims.w + RADIUS_LINE &&
        ly > -RADIUS_LINE && ly < dims.h + RADIUS_LINE;

      if (inRange) {
        mouseRef.current = { x: lx, y: ly };
        startAnimation();
      } else {
        mouseRef.current = { x: -9999, y: -9999 };
        startAnimation();
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [dims, animate]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        style={{
          width: dims.w,
          height: dims.h,
          display: "block",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
}

function DateBubble({ date, duration, alignRight = false }: { date: string; duration?: string; alignRight?: boolean }) {
  const text = duration ? `${date} - ${duration}` : date;
  return (
    <div className={`py-2.5 flex items-center bg-transparent ${
      alignRight ? "justify-end text-right pr-3 md:pr-4" : "justify-start text-left pl-3 md:pl-4"
    }`}>
      <ScatterText
        text={text}
        fontSize={8}
        color="#777777"
        hoverColor="#00ff88"
        right={alignRight}
      />
    </div>
  );
}

function TimelineCard({ item, showMobileDate = false }: { item: TimelineItem; showMobileDate?: boolean }) {
  const isLeft = item.side === "left";
  
  return (
    <div className={`w-full max-w-[480px] p-2 flex flex-col transition-all duration-300 group ${
      isLeft ? "items-end text-right" : "items-start text-left"
    }`}>
      {showMobileDate && (
        <div className="mb-3 py-1 flex items-center bg-transparent">
          <ScatterText
            text={item.duration ? `${item.date} - ${item.duration}` : item.date}
            fontSize={7.5}
            color="#777777"
            hoverColor="#00ff88"
          />
        </div>
      )}
      
      <div className="mb-1">
        <ScatterText
          text={item.title}
          fontSize={10.5}
          color="#ffffff"
          hoverColor="#00ff88"
          right={isLeft}
        />
      </div>
      
      <div className="mb-1.5">
        <ScatterText
          text={item.subtitle}
          fontSize={8.5}
          color="#00ff88"
          hoverColor="#ffffff"
          right={isLeft}
        />
      </div>
      
      {item.location && (
        <div className="mb-3">
          <ScatterText
            text={item.location}
            fontSize={7.5}
            color="#555555"
            hoverColor="#aaaaaa"
            right={isLeft}
          />
        </div>
      )}

      <ul className={`mt-3 space-y-3.5 w-full flex flex-col ${isLeft ? "items-end" : "items-start"}`}>
        {item.bullets.map((bulletLines, idx) => (
          <li key={idx} className={`flex items-start gap-2.5 ${isLeft ? "flex-row-reverse text-right" : ""}`}>
            <div className="mt-0.5 shrink-0">
              <ScatterText
                text="+"
                fontSize={8}
                color="#00ff88"
                hoverColor="#ffffff"
              />
            </div>
            <div className={`flex flex-col gap-0.5 ${isLeft ? "items-end" : "items-start"}`}>
              {bulletLines.map((line, lIdx) => (
                <ScatterText
                  key={lIdx}
                  text={line}
                  fontSize={8}
                  color="#777777"
                  hoverColor="#aaaaaa"
                  right={isLeft}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Experience() {
  return (
    <section 
      id="experience"
      className="px-6 md:px-12 w-full flex flex-col items-center justify-center bg-transparent"
      style={{ paddingTop: 'clamp(20px, 3vw, 50px)', paddingBottom: 'clamp(20px, 3vw, 50px)' }}
    >
      <div className="max-w-[1400px] w-full mx-auto flex flex-col items-center justify-center">
        {/* Title */}
        <div className="flex justify-center" style={{ marginBottom: 'clamp(20px, 3.5vw, 48px)' }}>
          <ScatterText
            text="PROFESSIONAL JOURNEY"
            fontSize={13}
            color="#00ff88"
            hoverColor="#ffffff"
            center
          />
        </div>

        {/* Timeline Layout */}
        <div className="relative w-full max-w-[1100px] mt-4">
          {/* Dotted Animated Vertical Line (Canvas-based with mouse interaction) */}
          <div className="absolute left-[4px] md:left-1/2 md:-translate-x-1/2 top-4 bottom-4 w-[80px] -translate-x-1/2 h-[calc(100%-32px)] pointer-events-none">
            <TimelineDottedLine />
          </div>
          
          {/* Timeline Items */}
          <div className="flex flex-col gap-12 md:gap-20">
            {timelineItems.map((item, idx) => {
              const isLeft = item.side === "left";
              return (
                <div 
                  key={idx} 
                  className="relative grid grid-cols-1 md:grid-cols-[1fr_80px_1fr] items-start"
                >
                  {/* Left Column (Desktop) */}
                  <div className="hidden md:flex justify-end pr-8">
                    {isLeft ? (
                      <TimelineCard item={item} />
                    ) : (
                      <DateBubble date={item.date} duration={item.duration} alignRight={true} />
                    )}
                  </div>

                  {/* Center Column (Icon) */}
                  <div className="absolute left-6 md:relative md:left-0 top-0 bottom-0 md:top-auto md:bottom-auto flex items-center justify-center z-20">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-accent relative">
                      {/* Interactive ScatterIcon */}
                      <ScatterIcon type={item.iconType} />
                    </div>
                  </div>

                  {/* Right Column (Desktop: opposite, Mobile: card) */}
                  <div className="pl-16 pr-4 md:pl-8 md:pr-0 flex justify-start">
                    {/* Mobile View */}
                    <div className="w-full md:hidden">
                      <TimelineCard item={item} showMobileDate />
                    </div>
                    {/* Desktop View */}
                    <div className="hidden md:block">
                      {isLeft ? (
                        <DateBubble date={item.date} duration={item.duration} alignRight={false} />
                      ) : (
                        <TimelineCard item={item} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
