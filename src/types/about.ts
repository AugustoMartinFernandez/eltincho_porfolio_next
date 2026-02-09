export interface AboutMe {
  id: string;
  full_name: string;
  title: string;
  short_bio_md: string;
  profile_image_url: string;
  cv_url: string;
  available_for_work: boolean;
  social_links: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

export interface Education {
  id: string;
  institution_name: string;
  degree_title: string;
  start_date: string;
  end_date?: string | null;
  visible: boolean;
}

export interface Experience {
  id: string;
  company_name: string;
  role_title: string;
  start_date: string;
  end_date?: string | null;
  description_md?: string;
  visible: boolean;
}