import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import RobotCollector from "@/components/RobotCollector";
import AboutMe from "@/components/AboutMe";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex flex-col bg-transparent">
        <Hero />
        <AboutMe />
        <RobotCollector />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
