import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import CustomCursor from "@/components/CustomCursor";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aswin Ramesh — Full Stack Developer",
  description:
    "Full Stack Developer proficient in MERN & Next.js. Building fast, scalable web applications with modern technologies.",
  keywords: [
    "Full Stack Developer",
    "MERN",
    "Next.js",
    "React",
    "Node.js",
    "Portfolio",
  ],
  openGraph: {
    title: "Aswin Ramesh — Full Stack Developer",
    description:
      "Full Stack Developer proficient in MERN & Next.js. Building fast, scalable web applications.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="noise-bg">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
