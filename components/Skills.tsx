"use client";

import ScatterText from "./ScatterText";

type Skill = {
  name: string;
  group: string;
};

const frontendSkills: Skill[] = [
  { name: "JavaScript", group: "Frontend" },
  { name: "React.js", group: "Frontend" },
  { name: "Next.js", group: "Framework" },
  { name: "Tailwind CSS", group: "Styling" },
  { name: "Redux Toolkit", group: "State" },
  { name: "shadcn", group: "UI" },
  { name: "Bootstrap", group: "Styling" },
  { name: "CSS", group: "Styling" },
  { name: "HTML", group: "Markup" },
  { name: "TypeScript", group: "Language" },
  { name: "Canva", group: "Design" },
  { name: "Figma", group: "Design" },
  { name: "Framer Motion", group: "Motion" },
  { name: "Postman", group: "API" },
  { name: "Thunder Client", group: "API" },
  { name: "Git", group: "Versioning" },
];

const backendSkills: Skill[] = [
  { name: "Node.js", group: "Backend" },
  { name: "Express.js", group: "Backend" },
  { name: "MVC Architecture", group: "Architecture" },
  { name: "Repository Architecture", group: "Architecture" },
  { name: "RESTful APIs", group: "Backend" },
  { name: "OAuth", group: "Auth" },
  { name: "JWT", group: "Auth" },
  { name: "MongoDB", group: "Database" },
  { name: "PostgreSQL", group: "Database" },
  { name: "Socket.IO", group: "Realtime" },
  { name: "WS", group: "Realtime" },
  { name: "WEBRTC", group: "Realtime" },
  { name: "Firebase", group: "Cloud" },
  { name: "GCP", group: "Cloud" },
  { name: "EC2", group: "AWS" },
  { name: "Route53", group: "AWS" },
  { name: "S3", group: "AWS" },
  { name: "Cloudinary", group: "Media" },
  { name: "Vercel", group: "Deploy" },
  { name: "Render", group: "Deploy" },
  { name: "Razorpay", group: "Payments" },
  { name: "Stripe", group: "Payments" },
  { name: "NGINX", group: "Server" },
  { name: "DSA", group: "Problem Solving" },
];

function SkillItem({ skill }: { skill: Skill }) {
  return (
    <div className="flex w-[210px] shrink-0 flex-col items-center justify-center text-center">
      <ScatterText
        text={skill.name}
        fontSize={10}
        color="#777777"
        hoverColor="#00ff88"
        center
      />
      <ScatterText
        text={skill.group}
        fontSize={7}
        color="#555555"
        hoverColor="#aaaaaa"
        center
      />
    </div>
  );
}

function SkillRow({ skills, reverse = false }: { skills: Skill[]; reverse?: boolean }) {
  return (
    <div className="skills-row">
      <div className={`skills-track ${reverse ? "skills-track-reverse" : ""}`}>
        {[...skills, ...skills].map((skill, index) => (
          <SkillItem key={`${skill.name}-${index}`} skill={skill} />
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section 
      id="skills"
      className="px-6 md:px-12 w-full flex flex-col items-center justify-center bg-transparent"
      style={{ paddingTop: 'clamp(20px, 3vw, 50px)', paddingBottom: 'clamp(20px, 3vw, 50px)' }}
    >
      <div className="max-w-[1400px] w-full mx-auto flex flex-col items-center justify-center text-center">
        {/* Title */}
        <div className="flex justify-center" style={{ marginBottom: 'clamp(20px, 3.5vw, 48px)' }}>
          <ScatterText
            text="SKILL STACK"
            fontSize={16}
            color="#00ff88"
            hoverColor="#ffffff"
            center
          />
        </div>

        {/* Floating Skills Tracks */}
        <div className="mx-auto flex w-full max-w-[980px] flex-col items-center gap-12 overflow-hidden">
          <SkillRow skills={frontendSkills} />
          <SkillRow skills={backendSkills} reverse />
        </div>
      </div>
    </section>
  );
}
