"use client";

import { useRef, useEffect, useCallback, useState } from "react";

// ── Constants ───────────────────────────────────────────────
const W = 600;
const H = 80;
const GROUND_Y = 60;
const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const OBSTACLE_SPEED = 3.5;
const SPAWN_INTERVAL = 90;
const DOT = 2;
const GAP = 1;
const STEP = DOT + GAP;

// Scatter physics
const RADIUS = 50;
const STRENGTH = 0.9;
const SPRING = 0.085;
const DAMPING = 0.86;
const MAX_VEL = 42;

// ── Shapes ──────────────────────────────────────────────────
const DINO: string[] = [
  "....####",
  "....####",
  "....#.##",
  "....####",
  "..#.###.",
  "..#####.",
  ".######.",
  ".#.###..",
  "...###..",
  "...#.#..",
  "...#..#.",
];

const DINO_JUMP: string[] = [
  "....####",
  "....####",
  "....#.##",
  "....####",
  "#.#.###.",
  "..#####.",
  ".######.",
  ".#.###..",
  "...##...",
  "........",
  "........",
];

const CACTUS_SMALL: string[] = [
  ".#.",
  ".#.",
  "###",
  ".#.",
  ".#.",
  ".#.",
];

const CACTUS_TALL: string[] = [
  ".#.",
  "##.",
  ".#.",
  ".##",
  "###",
  ".#.",
  ".#.",
  ".#.",
];

// 3x5 tiny font for text rendering to dots
const TINY: Record<string, string[]> = {
  p: ["##.", "#.#", "##.", "#..", "#.."],
  r: [".##", "#..", "#..", "#..", "#.."],
  e: ["###", "#..", "##.", "#..", "###"],
  s: [".##", "#..", ".#.", "..#", "##."],
  " ": ["..", "..", "..", "..", ".."],
  a: [".#.", "#.#", "###", "#.#", "#.#"],
  c: [".##", "#..", "#..", "#..", ".##"],
  t: ["###", ".#.", ".#.", ".#.", ".#."],
  o: [".#.", "#.#", "#.#", "#.#", ".#."],
  l: ["#..", "#..", "#..", "#..", "###"],
  y: ["#.#", "#.#", ".#.", ".#.", ".#."],
  g: [".##", "#..", "#.#", "#.#", ".#."],
  m: ["#.#", "###", "#.#", "#.#", "#.#"],
  v: ["#.#", "#.#", "#.#", ".#.", ".#."],
  n: ["##.", "#.#", "#.#", "#.#", "#.#"],
  w: ["#.#", "#.#", "###", "###", "#.#"],
  u: ["#.#", "#.#", "#.#", "#.#", "###"],
  d: ["##.", "#.#", "#.#", "#.#", "##."],
  x: ["#.#", "#.#", ".#.", "#.#", "#.#"],
  z: ["###", "..#", ".#.", "#..", "###"],
  "0": ["###", "#.#", "#.#", "#.#", "###"],
  "1": [".#.", ".#.", ".#.", ".#.", ".#."],
  "2": ["###", "..#", "###", "#..", "###"],
  "3": ["###", "..#", "###", "..#", "###"],
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "5": ["###", "#..", "###", "..#", "###"],
  "6": ["###", "#..", "###", "#.#", "###"],
  "7": ["###", "..#", "..#", "..#", "..#"],
  "8": ["###", "#.#", "###", "#.#", "###"],
  "9": ["###", "#.#", "###", "..#", "###"],
};

interface Dot {
  x: number; y: number;
  originX: number; originY: number;
  vx: number; vy: number;
  color: string;
}

interface Obstacle {
  x: number;
  shape: string[];
  passed: boolean;
}

function buildTextDots(text: string, startX: number, startY: number, color: string): Dot[] {
  const dots: Dot[] = [];
  let cx = 0;
  for (const char of text.toLowerCase()) {
    const glyph = TINY[char];
    if (!glyph) { cx += 3; continue; }
    for (let r = 0; r < glyph.length; r++) {
      for (let c = 0; c < glyph[r].length; c++) {
        if (glyph[r][c] === "#") {
          const x = startX + (cx + c) * (STEP * 0.7);
          const y = startY + r * (STEP * 0.7);
          dots.push({ x, y, originX: x, originY: y, vx: 0, vy: 0, color });
        }
      }
    }
    cx += (glyph[0]?.length || 2) + 1;
  }
  return dots;
}

function buildIdleDots(): Dot[] {
  const dots: Dot[] = [];
  const dinoX = 30;
  const dinoY = GROUND_Y - DINO.length * STEP;

  // Dino dots
  for (let r = 0; r < DINO.length; r++) {
    for (let c = 0; c < DINO[r].length; c++) {
      if (DINO[r][c] === "#") {
        const x = dinoX + c * STEP;
        const y = dinoY + r * STEP;
        dots.push({ x, y, originX: x, originY: y, vx: 0, vy: 0, color: "#f0883e" });
      }
    }
  }

  // Ground dots
  for (let x = 0; x < W; x += STEP * 2) {
    const px = x;
    const py = GROUND_Y + 4;
    dots.push({ x: px, y: py, originX: px, originY: py, vx: 0, vy: 0, color: "#00ff88" });
  }

  // Idle text "press space to play"
  const text = "press space to play";
  const textLenEstimate = text.length * 3 * (STEP * 0.7);
  const textStartX = W / 2 - textLenEstimate / 2;
  dots.push(...buildTextDots(text, textStartX, 28, "#555555"));

  // Static cacti
  const decoPositions = [200, 350, 480];
  for (const px of decoPositions) {
    const shape = px === 350 ? CACTUS_TALL : CACTUS_SMALL;
    const baseY = GROUND_Y - shape.length * STEP;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === "#") {
          const x = px + c * STEP;
          const y = baseY + r * STEP;
          dots.push({ x, y, originX: x, originY: y, vx: 0, vy: 0, color: "#00ff88" });
        }
      }
    }
  }

  return dots;
}

function buildGameOverDots(score: number, dinoY: number, obstacles: Obstacle[]): Dot[] {
  const dots: Dot[] = [];

  // Dino
  const dinoX = 30;
  for (let r = 0; r < DINO.length; r++) {
    for (let c = 0; c < DINO[r].length; c++) {
      if (DINO[r][c] === "#") {
        const x = dinoX + c * STEP;
        const y = dinoY - DINO.length * STEP + r * STEP;
        dots.push({ x, y, originX: x, originY: y, vx: 0, vy: 0, color: "#f0883e" });
      }
    }
  }

  // Ground
  for (let x = 0; x < W; x += STEP * 2) {
    const px = x;
    const py = GROUND_Y + 4;
    dots.push({ x: px, y: py, originX: px, originY: py, vx: 0, vy: 0, color: "#00ff88" });
  }

  // Obstacles
  for (const obs of obstacles) {
    const baseY = GROUND_Y - obs.shape.length * STEP;
    for (let r = 0; r < obs.shape.length; r++) {
      for (let c = 0; c < obs.shape[r].length; c++) {
        if (obs.shape[r][c] === "#") {
          const x = obs.x + c * STEP;
          const y = baseY + r * STEP;
          dots.push({ x, y, originX: x, originY: y, vx: 0, vy: 0, color: "#00ff88" });
        }
      }
    }
  }

  // "game over"
  const goText = "game over";
  const goTextLen = goText.length * 3 * (STEP * 0.7);
  dots.push(...buildTextDots(goText, W / 2 - goTextLen / 2 + 5, 24, "#ff6b6b"));

  // "press space to restart"
  const restartText = "press space to restart";
  const restartTextLen = restartText.length * 3 * (STEP * 0.7);
  dots.push(...buildTextDots(restartText, W / 2 - restartTextLen / 2 + 10, 42, "#555555"));

  // Score
  const scoreText = `${score}`;
  const scoreTextLen = scoreText.length * 3 * (STEP * 0.7);
  dots.push(...buildTextDots(scoreText, W - 40 - scoreTextLen, 10, "#555555"));

  return dots;
}

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeDotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    running: false,
    gameOver: false,
    dinoY: GROUND_Y,
    velY: 0,
    jumping: false,
    obstacles: [] as Obstacle[],
    frameCount: 0,
    score: 0,
    highScore: 0,
    groundOffset: 0,
  });
  const [mode, setMode] = useState<"idle" | "playing" | "over">("idle");
  const modeRef = useRef<"idle" | "playing" | "over">("idle");

  useEffect(() => {
    activeDotsRef.current = buildIdleDots();
  }, []);

  const drawDotShape = useCallback((ctx: CanvasRenderingContext2D, shape: string[], x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === "#") {
          ctx.beginPath();
          ctx.arc(x + c * STEP, y + r * STEP, DOT * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, []);

  const checkCollision = useCallback((dinoY: number, obs: Obstacle): boolean => {
    const dinoLeft = 30;
    const dinoRight = dinoLeft + 8 * STEP;
    const dinoTop = dinoY - DINO.length * STEP;
    const obsLeft = obs.x;
    const obsRight = obs.x + obs.shape[0].length * STEP;
    const obsTop = GROUND_Y - obs.shape.length * STEP;
    return dinoRight > obsLeft + 2 && dinoLeft < obsRight - 2 && dinoY > obsTop + 2 && dinoTop < GROUND_Y - 2;
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const currentMode = modeRef.current;
    const s = stateRef.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    // ── IDLE / GAME OVER MODE: scatter physics ──
    if (currentMode === "idle" || currentMode === "over") {
      for (const dot of activeDotsRef.current) {
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
        dot.x += dot.vx;
        dot.y += dot.vy;

        ctx.fillStyle = dot.color;
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // ── PLAYING MODE ──
    // Ground
    s.groundOffset = (s.groundOffset + (s.running ? OBSTACLE_SPEED : 0)) % (STEP * 2);
    ctx.fillStyle = "#00ff88";
    for (let x = -s.groundOffset; x < W; x += STEP * 2) {
      ctx.beginPath();
      ctx.arc(x, GROUND_Y + 4, DOT * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (s.running && !s.gameOver) {
      s.velY += GRAVITY;
      s.dinoY += s.velY;
      if (s.dinoY >= GROUND_Y) { s.dinoY = GROUND_Y; s.velY = 0; s.jumping = false; }

      s.frameCount++;
      if (s.frameCount % SPAWN_INTERVAL === 0) {
        s.obstacles.push({ x: W + 10, shape: Math.random() > 0.5 ? CACTUS_TALL : CACTUS_SMALL, passed: false });
      }

      for (const obs of s.obstacles) {
        obs.x -= OBSTACLE_SPEED;
        if (!obs.passed && obs.x + obs.shape[0].length * STEP < 30) { obs.passed = true; s.score++; }
      }
      s.obstacles = s.obstacles.filter((o) => o.x > -30);

      for (const obs of s.obstacles) {
        if (checkCollision(s.dinoY, obs)) {
          s.gameOver = true; s.running = false;
          if (s.score > s.highScore) s.highScore = s.score;
          
          // Build game over dots instantly to enable physics immediately
          activeDotsRef.current = buildGameOverDots(s.score, s.dinoY, s.obstacles);
          
          modeRef.current = "over";
          setMode("over");
          break;
        }
      }
    }

    // Dino
    const dinoShape = s.jumping ? DINO_JUMP : DINO;
    drawDotShape(ctx, dinoShape, 30, s.dinoY - dinoShape.length * STEP, "#f0883e");

    // Obstacles (green)
    for (const obs of s.obstacles) {
      drawDotShape(ctx, obs.shape, obs.x, GROUND_Y - obs.shape.length * STEP, "#00ff88");
    }

    // Score
    ctx.fillStyle = "#555555";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${s.score}`, W - 10, 14);
    ctx.textAlign = "start";

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [drawDotShape, checkCollision]);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.running = true; s.gameOver = false;
    s.dinoY = GROUND_Y; s.velY = 0; s.jumping = false;
    s.obstacles = []; s.frameCount = 0; s.score = 0; s.groundOffset = 0;
    modeRef.current = "playing";
    setMode("playing");
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (modeRef.current === "idle" || s.gameOver) { startGame(); return; }
    if (!s.jumping) { s.velY = JUMP_FORCE; s.jumping = true; }
  }, [startGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); jump(); }
    };
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    window.addEventListener("keydown", onKey);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    rafRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [gameLoop, jump]);

  return (
    <div className="w-full flex justify-center">
      <canvas
        ref={canvasRef}
        onClick={jump}
        style={{ width: W, height: H, display: "block", cursor: "pointer" }}
      />
    </div>
  );
}
