"use client";

import { useRef, useEffect, useCallback, useState } from "react";

// Standard 4x5 pixel font for rendering labels inside clouds
const FONT: Record<string, string[]> = {
  a: [".##.", "#..#", "####", "#..#", "#..#"],
  b: ["###.", "#..#", "###.", "#..#", "###."],
  c: [".###", "#...", "#...", "#...", ".###"],
  d: ["##..", "#.#.", "#..#", "#.#.", "##.."],
  e: ["####", "#...", "###.", "#...", "####"],
  f: ["####", "#...", "###.", "#...", "#..."],
  g: [".###", "#...", "#.##", "#..#", ".###"],
  h: ["#..#", "#..#", "####", "#..#", "#..#"],
  i: [".#.", ".#.", ".#.", ".#.", ".#."],
  j: ["..#", "..#", "..#", "#.#", ".#."],
  k: ["#..#", "#.#.", "##..", "#.#.", "#..#"],
  l: ["#...", "#...", "#...", "#...", "####"],
  m: ["#..#", "####", "#.##", "#..#", "#..#"],
  n: ["#..#", "##.#", "#.##", "#..#", "#..#"],
  o: [".##.", "#..#", "#..#", "#..#", ".##."],
  p: ["###.", "#..#", "###.", "#...", "#..."],
  q: [".##.", "#..#", "#..#", ".##.", "..#."],
  r: ["###.", "#..#", "##..", "#.#.", "#..#"],
  s: [".###", "#...", ".##.", "....#", "###."],
  t: ["###", ".#.", ".#.", ".#.", ".#."],
  u: ["#..#", "#..#", "#..#", "#..#", ".##."],
  v: ["#..#", "#..#", "#..#", ".##.", "..#."],
  w: ["#..#", "#..#", "#..#", "####", "#..#"],
  x: ["#..#", ".##.", "..#.", ".##.", "#..#"],
  y: ["#..#", "#..#", ".##.", "..#.", "..#."],
  z: ["####", "..#.", ".#..", "#...", "####"],
  " ": ["..", "..", "..", "..", ".."],
  ".": ["..", "..", "..", "..", "#."],
  "-": ["...", "...", "###", "...", "..."],
};

const TECH_LIST = ["next.js", "react", "mongodb", "node.js", "typescript", "express", "postgres", "aws"];

// Particle dot types
interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  color: string;
  isRobot?: boolean;
  isCloud?: boolean;
  isGround?: boolean;
  isParticle?: boolean;
  opacity?: number;
}

interface Cloud {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  state: "scrolling" | "grabbing" | "collected";
  grabT: number; // interpolation timer [0, 1]
  dots: { localX: number; localY: number; color: string }[];
}

// Physics parameters
const RADIUS = 50;
const STRENGTH = 0.9;
const SPRING = 0.085;
const DAMPING = 0.86;
const MAX_VELOCITY = 42;

export default function RobotCollector() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Animation states
  const timeRef = useRef(0);
  const robotXRef = useRef(-60); // Starts offscreen left
  const isGrabbingRef = useRef(false);
  const activeGrabCloudIdRef = useRef<string | null>(null);
  
  // Active dynamic entities
  const cloudsRef = useRef<Cloud[]>([]);
  const dotsRef = useRef<Dot[]>([]);
  const nextSpawnTimeRef = useRef(0);
  const scrollXRef = useRef(0);

  // Mouse interactions
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const isHoveredRef = useRef(false);
  const rafRef = useRef<number>(0);
  
  const [canvasDims, setCanvasDims] = useState({ w: 0, h: 220 });

  // Procedural text dot builder
  const buildCloudDots = useCallback((text: string, dotSpacing: number) => {
    const dots: { localX: number; localY: number; color: string }[] = [];
    const textLower = text.toLowerCase();
    
    let cursorX = 0;
    const charGap = 1;
    const textDots: { x: number; y: number }[] = [];
    
    for (const char of textLower) {
      const glyph = FONT[char] || FONT[" "];
      for (let r = 0; r < 5; r++) {
        const line = glyph[r] || "";
        for (let c = 0; c < line.length; c++) {
          if (line[c] === "#") {
            const x = (cursorX + c) * dotSpacing;
            const y = r * dotSpacing;
            textDots.push({ x, y });
          }
        }
      }
      cursorX += (glyph[0]?.length || 2) + charGap;
    }
    
    const textW = cursorX * dotSpacing;
    const textH = 5 * dotSpacing;
    const centerX = textW / 2;
    const centerY = textH / 2;
    
    // Text dots (glowing accent color)
    for (const td of textDots) {
      dots.push({
        localX: td.x - centerX,
        localY: td.y - centerY,
        color: "#00ff88",
      });
    }
    
    // Cloud border (softer gray)
    const cloudRadius = Math.max(textW * 0.65, 20);
    const numCloudDots = 32;
    for (let i = 0; i < numCloudDots; i++) {
      const angle = (i / numCloudDots) * Math.PI * 2;
      const r = cloudRadius + Math.sin(angle * 5) * 3;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r * 0.55;
      dots.push({
        localX: x,
        localY: y,
        color: "#666666",
      });
    }
    
    return { dots, width: cloudRadius * 2 };
  }, []);

  // Set up sizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasDims({
          w: containerRef.current.clientWidth,
          h: 220,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasDims.w === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasDims.w, canvasDims.h);

    const time = timeRef.current;
    timeRef.current += 1;

    const groundY = 175;
    const robotY = groundY;
    const centerX = canvasDims.w / 2;

    // 1. Move Robot
    if (robotXRef.current < centerX) {
      robotXRef.current += 1.2; // Walk to center
    }
    const robotX = robotXRef.current;
    const isScrolling = robotX >= centerX;

    // Scroll ground and environment
    if (isScrolling) {
      scrollXRef.current = (scrollXRef.current + 1.2) % canvasDims.w;
    }

    // 2. Spawn Clouds
    if (time > nextSpawnTimeRef.current) {
      const text = TECH_LIST[Math.floor(Math.random() * TECH_LIST.length)];
      const { dots: cloudDots, width: cloudW } = buildCloudDots(text, 3.2);
      
      cloudsRef.current.push({
        id: Math.random().toString(),
        text,
        x: canvasDims.w + cloudW + 10,
        y: 40 + Math.random() * 50,
        width: cloudW,
        state: "scrolling",
        grabT: 0,
        dots: cloudDots,
      });

      // Spawn next cloud in 3-5 seconds
      nextSpawnTimeRef.current = time + 180 + Math.random() * 120;
    }

    // 3. Update Cloud States
    const activeGrabCloud = cloudsRef.current.find(c => c.id === activeGrabCloudIdRef.current);
    if (!activeGrabCloud) {
      isGrabbingRef.current = false;
      activeGrabCloudIdRef.current = null;
    }

    cloudsRef.current.forEach(cloud => {
      if (cloud.state === "scrolling") {
        cloud.x -= isScrolling ? 2.0 : 0.8; // Move left
        
        // Trigger grab if close to robot grab zone and robot is ready
        if (Math.abs(cloud.x - robotX) < 15 && !isGrabbingRef.current && robotX > 50) {
          cloud.state = "grabbing";
          isGrabbingRef.current = true;
          activeGrabCloudIdRef.current = cloud.id;
        }
      } else if (cloud.state === "grabbing") {
        // Interpolate cloud to robot backpack
        cloud.grabT += 0.04;
        if (cloud.grabT >= 1) {
          cloud.grabT = 1;
          cloud.state = "collected";
          isGrabbingRef.current = false;
          activeGrabCloudIdRef.current = null;
          
          // Particle burst at backpack
          const backpackX = robotX - 18;
          const backpackY = robotY - 28 + Math.cos(time * 0.15) * 1.5;
          for (let p = 0; p < 25; p++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            dotsRef.current.push({
              x: backpackX,
              y: backpackY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 1, // slight upward float
              originX: backpackX,
              originY: backpackY,
              color: p % 2 === 0 ? "#00ff88" : "#a855f7",
              isParticle: true,
              opacity: 1,
            });
          }
        } else {
          // Grabbing: animate hand and cloud coordinates
          const targetX = robotX - 18;
          const targetY = robotY - 22;
          // Ease in-out
          const t = cloud.grabT;
          cloud.x = cloud.x * (1 - t) + targetX * t;
          cloud.y = cloud.y * (1 - t) + targetY * t;
        }
      }
    });

    // Remove collected clouds
    cloudsRef.current = cloudsRef.current.filter(c => c.state !== "collected" && c.x > -100);

    // 4. Gather Target Dot Map
    const targets: { tx: number; ty: number; color: string; isRobot?: boolean; isCloud?: boolean }[] = [];

    // Ground dots
    const groundSpacing = 8;
    const numGroundDots = Math.floor(canvasDims.w / groundSpacing) + 2;
    const scrollOffset = scrollXRef.current % groundSpacing;
    for (let i = -1; i < numGroundDots; i++) {
      targets.push({
        tx: i * groundSpacing - scrollOffset,
        ty: groundY,
        color: "#22c55e", // Green colored track dots!
        isRobot: false,
      });

      // Small details/grass on ground
      if ((i + 3) % 18 === 0) {
        targets.push({ tx: i * groundSpacing - scrollOffset, ty: groundY - 3, color: "#22c55e" });
        targets.push({ tx: i * groundSpacing - scrollOffset + 2, ty: groundY - 6, color: "#22c55e" });
      }
    }

    // Robot dots
    const bob = Math.cos(time * 0.15) * 1.5;
    const legSwing = Math.sin(time * 0.15) * 5;
    const armSwing = Math.sin(time * 0.15) * 4;
    const spacing = 3.5;

    // Head dots
    const headX = robotX - 9;
    const headY = robotY - 48 + bob;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        targets.push({
          tx: headX + c * spacing,
          ty: headY + r * spacing,
          color: "#d1d5db",
          isRobot: true,
        });
      }
    }
    // Eyes
    targets.push({ tx: headX + 3 * spacing, ty: headY + 1 * spacing, color: "#22c55e", isRobot: true }); // Green eye matching tracks!
    targets.push({ tx: headX + 4 * spacing, ty: headY + 1 * spacing, color: "#22c55e", isRobot: true });
    // Antenna
    targets.push({ tx: headX + 2.5 * spacing, ty: headY - 1 * spacing, color: "#6b7280", isRobot: true });
    targets.push({ tx: headX + 2.5 * spacing, ty: headY - 2 * spacing, color: "#6b7280", isRobot: true });
    targets.push({ tx: headX + 2.5 * spacing, ty: headY - 3 * spacing, color: "#22c55e", isRobot: true }); // Flashing green tip!

    // Torso dots
    const bodyX = robotX - 11;
    const bodyY = robotY - 34 + bob;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const isScreen = (r === 1 || r === 2) && (c === 2 || c === 3 || c === 4);
        targets.push({
          tx: bodyX + c * spacing,
          ty: bodyY + r * spacing,
          color: isScreen ? "#22c55e" : "#4b5563", // Green chest screen!
          isRobot: true,
        });
      }
    }

    // Backpack
    const bagX = robotX - 18;
    const bagY = robotY - 28 + bob;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 2; c++) {
        targets.push({
          tx: bagX + c * spacing,
          ty: bagY + r * spacing,
          color: "#a855f7", // Purple backpack
          isRobot: true,
        });
      }
    }

    // Legs
    const footLX = robotX - 6 + legSwing;
    const footLY = groundY;
    for (let i = 0; i <= 3; i++) {
      const t = i / 3;
      targets.push({
        tx: (robotX - 6) * (1 - t) + footLX * t,
        ty: (bodyY + 6 * spacing) * (1 - t) + footLY * t,
        color: "#374151",
        isRobot: true,
      });
    }

    const footRX = robotX + 4 - legSwing;
    const footRY = groundY;
    for (let i = 0; i <= 3; i++) {
      const t = i / 3;
      targets.push({
        tx: (robotX + 2) * (1 - t) + footRX * t,
        ty: (bodyY + 6 * spacing) * (1 - t) + footRY * t,
        color: "#4b5563",
        isRobot: true,
      });
    }

    // Left arm
    const armLY = robotY - 30 + bob;
    const handLX = robotX - 14 - armSwing;
    const handLY = robotY - 18 + bob;
    for (let i = 0; i <= 3; i++) {
      const t = i / 3;
      targets.push({
        tx: (robotX - 11) * (1 - t) + handLX * t,
        ty: armLY * (1 - t) + handLY * t,
        color: "#374151",
        isRobot: true,
      });
    }

    // Right arm (reaching if grabbing, otherwise swinging)
    const shoulderX = robotX + 11;
    const shoulderY = robotY - 30 + bob;
    let handRX = robotX + 16 + armSwing;
    let handRY = robotY - 18 + bob;

    if (isGrabbingRef.current && activeGrabCloud) {
      // Direct reach to the grabbing cloud center
      handRX = activeGrabCloud.x;
      handRY = activeGrabCloud.y;
    }

    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      targets.push({
        tx: shoulderX * (1 - t) + handRX * t,
        ty: shoulderY * (1 - t) + handRY * t,
        color: "#9ca3af",
        isRobot: true,
      });
    }

    // Cloud dots
    cloudsRef.current.forEach(cloud => {
      cloud.dots.forEach(cd => {
        targets.push({
          tx: cloud.x + cd.localX,
          ty: cloud.y + cd.localY,
          color: cd.color,
          isCloud: true,
        });
      });
    });

    // 5. Match target dots to existing dot pools
    // Reallocate or grow dots array if needed
    const prevDots = dotsRef.current.filter(d => !d.isParticle);
    const particles = dotsRef.current.filter(d => d.isParticle);
    
    const diff = targets.length - prevDots.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        prevDots.push({
          x: Math.random() * canvasDims.w,
          y: Math.random() * canvasDims.h,
          vx: 0,
          vy: 0,
          originX: 0,
          originY: 0,
          color: "#777777",
        });
      }
    } else if (diff < 0) {
      prevDots.splice(targets.length);
    }

    // Assign properties from target layout
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const d = prevDots[i];
      d.originX = t.tx;
      d.originY = t.ty;
      d.color = t.color;
      d.isRobot = t.isRobot;
      d.isCloud = t.isCloud;
    }

    // Merge active particles back
    dotsRef.current = [...prevDots, ...particles];

    // 6. Physics and Rendering Loop
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const dotSpacing = 3.5;
    const dotRadius = dotSpacing * 0.38;

    dotsRef.current.forEach((dot, index) => {
      // Repulsion force
      const dx = dot.x - mx;
      const dy = dot.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < RADIUS && dist > 0) {
        const force = ((RADIUS - dist) / RADIUS) * STRENGTH;
        const angle = Math.atan2(dy, dx);
        dot.vx += Math.cos(angle) * force * 4;
        dot.vy += Math.sin(angle) * force * 4;
      }

      if (dot.isParticle) {
        // Particles fade and drift
        dot.x += dot.vx;
        dot.y += dot.vy;
        dot.vx *= 0.95;
        dot.vy *= 0.95;
        dot.opacity = (dot.opacity || 1) - 0.012;
      } else {
        // Spring back to target positions
        dot.vx += (dot.originX - dot.x) * SPRING;
        dot.vy += (dot.originY - dot.y) * SPRING;
        
        // Damping
        dot.vx *= DAMPING;
        dot.vy *= DAMPING;

        // Velocity clamp
        const vel = Math.sqrt(dot.vx * dot.vx + dot.vy * dot.vy);
        if (vel > MAX_VELOCITY) {
          dot.vx = (dot.vx / vel) * MAX_VELOCITY;
          dot.vy = (dot.vy / vel) * MAX_VELOCITY;
        }

        dot.x += dot.vx;
        dot.y += dot.vy;
      }

      // Draw dot
      const isHovered = dist < RADIUS;
      if (isHovered && !dot.isParticle) {
        ctx.fillStyle = (dot.color === "#00ff88" || dot.color === "#22c55e") ? "#ffffff" : "#00ff88";
      } else {
        ctx.fillStyle = dot.color;
      }
      ctx.globalAlpha = dot.isParticle ? Math.max(0, dot.opacity || 0) : 0.9;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.isParticle ? 1.0 : dotRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    // Filter out dead particles
    dotsRef.current = dotsRef.current.filter(d => !d.isParticle || (d.opacity && d.opacity > 0));

    rafRef.current = requestAnimationFrame(animate);
  }, [canvasDims, buildCloudDots]);

  // Start Animation
  useEffect(() => {
    if (canvasDims.w === 0) return;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, canvasDims]);

  // Mouse Listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;
      
      const inRange = 
        lx > -RADIUS && lx < canvasDims.w + RADIUS &&
        ly > -RADIUS && ly < canvasDims.h + RADIUS;

      if (inRange) {
        mouseRef.current = { x: lx, y: ly };
        isHoveredRef.current = true;
      } else {
        mouseRef.current = { x: -9999, y: -9999 };
        isHoveredRef.current = false;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [canvasDims]);

  return (
    <section className="py-8 px-6 md:px-12 overflow-hidden bg-transparent w-full flex justify-center">
      <div 
        ref={containerRef}
        className="relative z-10 max-w-[1400px] w-full mx-auto px-8 md:px-16 flex flex-col items-center"
      >
        <div 
          className="w-full relative overflow-hidden bg-transparent"
          style={{ height: canvasDims.h }}
        >
          {canvasDims.w > 0 && (
            <canvas 
              ref={canvasRef} 
              width={canvasDims.w * (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1)}
              height={canvasDims.h * (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1)}
              style={{ width: canvasDims.w, height: canvasDims.h, display: "block" }} 
            />
          )}
        </div>
      </div>
    </section>
  );
}
