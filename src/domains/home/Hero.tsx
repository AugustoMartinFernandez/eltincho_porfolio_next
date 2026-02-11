"use client";

import dynamic from 'next/dynamic';
import HeroText from '@/domains/home/HeroText';
import { AboutMe } from "@/types/about";

// Importación dinámica para optimizar el LCP
const HeroVisual = dynamic(() => import('@/domains/home/HeroVisual'), { 
  ssr: false, 
  loading: () => <div className="h-[300px] md:h-[500px] w-full" /> 
});

export default function Hero({ profile }: { profile: AboutMe | null }) {
  return (
    <section className="relative min-h-[calc(100dvh-5rem)] flex items-center justify-center overflow-hidden pt-10 pb-16 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
        
        {/* El texto es crítico para el SEO y LCP, carga primero */}
        <div className="flex-1 z-10">
          <HeroText profile={profile} />
        </div>

        {/* La visual es decorativa y pesada, carga diferida */}
        <div className="flex-1 w-full relative h-[400px] md:h-[500px] flex items-center justify-center">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}