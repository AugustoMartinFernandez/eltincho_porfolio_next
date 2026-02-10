export interface Project {
  id: string;
  title: string;
  share_count: number; // <--- AGREGAR ESTO
  slug: string;
  summary: string;
  description_md: string; // <-- Faltaba esto
  cover_url: string;
  tech_stack: Array<{
    name: string;
    icon_url?: string;
  }>;
  status: 'in_production' | 'launched' | 'maintenance' | 'finished';
  tags: string[];
  demo_url?: string;
  repo_url?: string;
  published_at?: string; // <-- Faltaba esto (Supabase devuelve string ISO)
  
  // Agregamos estos también para evitar errores futuros con SEO y Media
  media_type?: 'image' | 'video';
  media_poster_url?: string;
  gallery_urls?: string[];
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  visible?: boolean;
}