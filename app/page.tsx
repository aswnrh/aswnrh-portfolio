import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import RobotCollector from "@/components/RobotCollector";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <RobotCollector />
      </main>
    </>
  );
}
