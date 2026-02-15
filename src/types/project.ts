export interface Project {
  id: string;
  title: string;
  share_count: number;
  slug: string;
  summary: string;
  description_md: string;
  cover_url: string;
  tech_stack: Array<{
    name: string;
    icon_url?: string;
  }>;
  status: "in_production" | "launched" | "maintenance" | "finished";
  tags: string[];
  demo_url?: string;
  repo_url?: string;
  published_at?: string;
  media_type?: "image" | "video";
  media_poster_url?: string;
  gallery_urls?: string[];
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  visible?: boolean;
}
