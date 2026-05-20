import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import RobotCollector from "@/components/RobotCollector";
import AboutMe from "@/components/AboutMe";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <RobotCollector />
        <AboutMe />
      </main>
    </>
  );
}
