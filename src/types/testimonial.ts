export type TestimonialRelation = 'client' | 'colleague' | 'visitor';

export interface Testimonial {
  id: string;
  name: string;
  email?: string; 
  role_or_company?: string; 
  project_id?: string;      
  content: string;
  rating: number;
  avatar_url?: string;      
  relationship: TestimonialRelation;
  is_approved: boolean;
  created_at: string;
  featured: boolean; 
}