export type TestimonialRelation = 'client' | 'colleague' | 'visitor';

export interface Testimonial {
  id: string;
  name: string;
  email?: string; // <--- Nuevo campo (privado)
  role_or_company?: string; // Opcional
  project_id?: string;      // Opcional
  content: string;
  rating: number;
  avatar_url?: string;      // Opcional
  relationship: TestimonialRelation;
  is_approved: boolean;
  created_at: string;
}