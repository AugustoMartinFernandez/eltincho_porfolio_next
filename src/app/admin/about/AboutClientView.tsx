"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Cpu, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { AboutMe, Technology, Experience, Education } from "@/types/about";
import AboutForm from "./AboutForm";
import TechnologiesList from "./TechnologiesList";
import ExperienceList from "./ExperienceList";
import EducationList from "./EducationList";

interface AboutClientViewProps {
  profile: AboutMe | null;
  technologies: Technology[];
  experiences: Experience[];
  education: Education[];
}

type TabId = 'general' | 'stack' | 'career';

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'general', label: 'Perfil General', icon: User },
  { id: 'stack', label: 'Stack Tecnológico', icon: Cpu },
  { id: 'career', label: 'Trayectoria & Experiencia', icon: Briefcase },
];

export default function AboutClientView({ profile, technologies, experiences, education }: AboutClientViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  return (
    <div className="space-y-8">
      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-xl border border-border w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative",
              activeTab === tab.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'general' && (
              <AboutForm initialData={profile || undefined} />
            )}

            {activeTab === 'stack' && (
              <TechnologiesList items={technologies} />
            )}

            {activeTab === 'career' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ExperienceList items={experiences} />
                <EducationList items={education} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
