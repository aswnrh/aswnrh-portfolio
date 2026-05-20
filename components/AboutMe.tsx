"use client";

import { useEffect, useRef } from "react";
import ScatterText from "./ScatterText";

export default function AboutMe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const lines = el.querySelectorAll(".about-line");
    lines.forEach((line, i) => {
      (line as HTMLElement).style.animationDelay = `${0.1 + i * 0.04}s`;
    });
  }, []);

  return (
    <section 
      ref={containerRef}
      className="py-16 px-6 md:px-12 w-full flex flex-col items-center justify-center bg-transparent"
    >
      <div className="max-w-[1400px] w-full mx-auto flex flex-col items-center justify-center text-center">
        {/* Title */}
        <div className="about-line animate-fade-in-up opacity-0 mb-10 flex justify-center">
          <ScatterText
            text="ABOUT ME"
            fontSize={16}
            color="#00ff88"
            hoverColor="#ffffff"
          />
        </div>

        {/* Paragraph 1 */}
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="I’m Aswin Ramesh, a full-stack developer focused" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="on building scalable, high-performance web" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="applications and digital experiences. I work" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="primarily with Node.js, React.js, Next.js," fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="TypeScript, Express.js, MongoDB, PostgreSQL," fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="and Socket.io, with hands-on experience" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-8 flex justify-center">
          <ScatterText text="across AWS, GCP, and Azure cloud platforms." fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>

        {/* Paragraph 2 */}
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="With industry experience in developing production-grade" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="applications, I enjoy designing clean architectures," fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="solving complex backend challenges, and creating" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="seamless user experiences. I’m experienced with" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="real-time systems, cloud integrations, authentication" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="workflows, payment gateways, and modern" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-8 flex justify-center">
          <ScatterText text="development practices." fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>

        {/* Paragraph 3 */}
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="Outside of coding, I love documenting life through" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="photography and creative storytelling, exploring" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="new ideas, and connecting with people from" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="different communities. I’m always open to" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="networking, collaborations, and meaningful" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 mb-2.5 flex justify-center">
          <ScatterText text="conversations — feel free to connect and" fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
        <div className="about-line animate-fade-in-up opacity-0 flex justify-center">
          <ScatterText text="stay in touch." fontSize={10.5} color="#777777" hoverColor="#aaaaaa" />
        </div>
      </div>
    </section>
  );
}
