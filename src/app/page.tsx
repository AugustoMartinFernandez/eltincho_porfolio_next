import Hero from "@/domains/home/Hero";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Sección Hero */}
      <Hero />
      
      {/* Aquí irán las siguientes secciones: TechStack, FeaturedProjects, etc. */}
      {/* <TechStack /> */}
      {/* <FeaturedProjects /> */}
    </div>
  );
}