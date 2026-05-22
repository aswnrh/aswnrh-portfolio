"use client";

import ScatterText from "./ScatterText";

export default function Footer() {
  return (
    <footer className="w-full py-12 px-6 md:px-12 flex flex-col items-center gap-4 bg-transparent" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
      <ScatterText text="DESIGNED & BUILT BY ASWIN RAMESH" fontSize={8} color="#666666" hoverColor="#00ff88" center />
      <ScatterText text="(C) 2025 ALL RIGHTS RESERVED." fontSize={7.5} color="#555555" hoverColor="#888888" center />
    </footer>
  );
}
