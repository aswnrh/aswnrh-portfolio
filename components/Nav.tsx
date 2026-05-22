"use client";

import { useState } from "react";
import ScatterText from "./ScatterText";

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="relative z-50 bg-transparent">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 flex items-center justify-between h-16 md:h-20">
        {/* Spacer */}
        <div />

        {/* Right side — social links with scatter effect */}
        <div className="hidden md:flex items-center gap-10">
          <a href="https://github.com/aswnrh" target="_blank" rel="noopener noreferrer" className="block">
            <ScatterText text="GITHUB" fontSize={12} color="#777777" hoverColor="#00ff88" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="block">
            <ScatterText text="LINKEDIN" fontSize={12} color="#777777" hoverColor="#00ff88" />
          </a>
          <a href="mailto:hello@aswnrh.dev" className="block">
            <ScatterText text="EMAIL" fontSize={12} color="#777777" hoverColor="#00ff88" />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-px bg-text-primary transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
          <span className={`block w-6 h-px bg-text-primary transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-px bg-text-primary transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-8 py-6 bg-bg/95 backdrop-blur-xl border-t border-border flex flex-col gap-5">
          <a 
            href="#work" 
            onClick={(e) => {
              e.preventDefault();
              setMobileOpen(false);
              document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="text-text-muted text-sm tracking-[0.2em] uppercase hover:text-text-primary transition-colors"
          >
            WORK
          </a>
          <a 
            href="#about" 
            onClick={(e) => {
              e.preventDefault();
              setMobileOpen(false);
              document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="text-text-muted text-sm tracking-[0.2em] uppercase hover:text-text-primary transition-colors"
          >
            ABOUT
          </a>
          <a 
            href="#contact" 
            onClick={(e) => {
              e.preventDefault();
              setMobileOpen(false);
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="text-text-muted text-sm tracking-[0.2em] uppercase hover:text-text-primary transition-colors"
          >
            CONTACT
          </a>
          <a href="https://github.com/aswnrh" target="_blank" rel="noopener noreferrer" className="text-text-muted text-sm tracking-[0.2em] uppercase hover:text-accent transition-colors">GITHUB</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-text-muted text-sm tracking-[0.2em] uppercase hover:text-accent transition-colors">LINKEDIN</a>
        </div>
      </div>
    </nav>
  );
}
