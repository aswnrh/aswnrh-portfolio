"use client";

import { useEffect, useRef } from "react";
import ScatterText from "./ScatterText";
import DevIllustration from "./DevIllustration";
// import DinoGame from "./DinoGame";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const lines = el.querySelectorAll(".hero-line");
    lines.forEach((line, i) => {
      (line as HTMLElement).style.animationDelay = `${0.3 + i * 0.15}s`;
    });
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center justify-center pt-32 overflow-hidden"
      style={{ paddingBottom: 'clamp(30px, 4vw, 80px)' }}
    >
      {/* Subtle gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent/8 rounded-full blur-[100px] animate-float" style={{ animationDelay: "1.5s" }} />

      {/* Dino game Easter egg in the gap */}
      {/* <div className="absolute top-28 left-0 right-0 z-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          <DinoGame />
        </div>
      </div> */}

      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-8 md:px-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">

          {/* Left column — All text as ScatterText */}
          <div className="flex-1 text-center lg:text-left max-w-2xl flex flex-col items-center lg:items-start gap-5 lg:gap-7">
            {/* Status badge */}
            <div className="hero-line animate-fade-in-up opacity-0 flex justify-center lg:justify-start" style={{ marginBottom: '-9.6px' }}>
              <ScatterText
                text="AVAILABLE FOR OPPORTUNITIES"
                fontSize={12}
                color="#00ff88"
                hoverColor="#33ffaa"
              />
            </div>

            {/* Name — single line */}
            <div className="hero-line animate-fade-in-up opacity-0 flex justify-center lg:justify-start items-baseline gap-0" style={{ marginBottom: '-40px' }}>
              <ScatterText
                text="ASWIN"
                fontSize={50}
                color="#e0e0e0"
                hoverColor="#ffffff"
              />
              <ScatterText
                text="RAMESH"
                fontSize={50}
                color="#666666"
                hoverColor="#aaaaaa"
              />
            </div>

            {/* Role */}
            <div className="hero-line animate-fade-in-up opacity-0 flex justify-center lg:justify-start items-center gap-2" style={{ marginBottom: '-14.4px' }}>
              <ScatterText
                text="FULL STACK"
                fontSize={18}
                color="#888888"
                hoverColor="#bbbbbb"
              />
              <ScatterText
                text="DEVELOPER"
                fontSize={18}
                color="#00ff88"
                hoverColor="#33ffaa"
              />
            </div>

            {/* Description */}
            <div className="hero-line animate-fade-in-up opacity-0 flex flex-col items-center lg:items-start gap-1.5" style={{ marginBottom: '-8.4px' }}>
              <div className="flex justify-center lg:justify-start">
                <ScatterText
                  text="Passionate about building modern, scalable, and"
                  fontSize={10.5}
                  color="#777777"
                  hoverColor="#aaaaaa"
                />
              </div>
              <div className="flex justify-center lg:justify-start">
                <ScatterText
                  text="high-performance web applications with experience"
                  fontSize={10.5}
                  color="#777777"
                  hoverColor="#aaaaaa"
                />
              </div>
              <div className="flex justify-center lg:justify-start">
                <ScatterText
                  text="across both frontend and backend technologies."
                  fontSize={10.5}
                  color="#777777"
                  hoverColor="#aaaaaa"
                />
              </div>
              <div className="flex justify-center lg:justify-start">
                <ScatterText
                  text="Skilled in creating seamless user experiences,"
                  fontSize={10.5}
                  color="#777777"
                  hoverColor="#aaaaaa"
                />
              </div>
              <div className="flex justify-center lg:justify-start">
                <ScatterText
                  text="efficient server-side systems, and cloud solutions."
                  fontSize={10.5}
                  color="#777777"
                  hoverColor="#aaaaaa"
                />
              </div>
              <div className="flex justify-center lg:justify-start">
                <ScatterText
                  text="Experienced in developing real-time applications"
                  fontSize={10.5}
                  color="#777777"
                  hoverColor="#aaaaaa"
                />
              </div>
              <div className="flex justify-center lg:justify-start">
                <ScatterText
                  text="and delivering secure, production-ready products."
                  fontSize={10.5}
                  color="#777777"
                  hoverColor="#aaaaaa"
                />
              </div>
              <div className="flex justify-center lg:justify-start">
                <ScatterText
                  text="Always focused on learning new technologies and"
                  fontSize={10.5}
                  color="#777777"
                  hoverColor="#aaaaaa"
                />
              </div>
              <div className="flex justify-center lg:justify-start">
                <ScatterText
                  text="solving complex problems with impactful solutions."
                  fontSize={10.5}
                  color="#777777"
                  hoverColor="#aaaaaa"
                />
              </div>
            </div>

            {/* CTA buttons */}
            <div className="hero-line animate-fade-in-up opacity-0 flex flex-wrap items-center justify-center lg:justify-start gap-8">
              <a 
                href="#work" 
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-block transition-all duration-300 hover:opacity-80"
              >
                <ScatterText
                  text="VIEW WORK"
                  fontSize={14}
                  color="#00ff88"
                  hoverColor="#33ffaa"
                />
              </a>
              <a 
                href="#contact" 
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-block transition-all duration-300 hover:opacity-80"
              >
                <ScatterText
                  text="GET IN TOUCH"
                  fontSize={14}
                  color="#777777"
                  hoverColor="#f0f0f0"
                />
              </a>
            </div>
          </div>

          {/* Right column — Dev illustration */}
          <div className="hero-line animate-fade-in-up opacity-0 flex-shrink-0 w-full max-w-[380px] lg:max-w-[450px]">
            <DevIllustration className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-line animate-fade-in-up opacity-0 absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => {
            document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="cursor-pointer transition-opacity hover:opacity-80"
        >
          <ScatterText text="SCROLL" fontSize={10} color="#555555" hoverColor="#00ff88" />
        </button>
      </div>
    </section>
  );
}
