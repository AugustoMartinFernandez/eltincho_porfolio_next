export interface SocialLinks {
  github?: string;
  linkedin?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  twitter?: string;
}
export type WorkStatus = "closed" | "open_to_work" | "hiring";
export interface AboutMe {
  id: string;
  full_name: string;
  title: string;
  short_bio_md: string;
  location: string;
  profile_image_url: string;
  cv_url: string;
  available_for_work: boolean;
  work_status: WorkStatus;
  show_experience: boolean;
  social_links: SocialLinks;
}
export interface Experience {
  id: string;
  company_name: string;
  role_title: string;
  start_date: string;
  end_date?: string | null;
  description_md: string;
  visible: boolean;
  current: boolean;
}
export interface Education {
  id: string;
  institution_name: string;
  degree_title: string;
  start_date: string;
  end_date?: string | null;
  visible: boolean;
  current: boolean;
  certificate_url?: string;
}
export type TechCategory =
  | "frontend"
  | "backend"
  | "database"
  | "tool"
  | "infrastructure";
export type TechRank = "primary" | "secondary" | "experimental";

export interface Technology {
  id: string;
  name: string;
  icon_url: string;
  category: TechCategory;
  rank: TechRank;
  visible: boolean;
}
