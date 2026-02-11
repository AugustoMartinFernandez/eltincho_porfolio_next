"use server";

import { supabase } from "@/lib/supabaseClient"; // Cliente público (para crear)
import { createServerClient } from "@supabase/ssr"; // Cliente privado (para administrar)
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// --- HELPER DE SEGURIDAD ---
// Esta función crea un cliente de Supabase que "sabe" quién está logueado
async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// Definimos el estado inicial del formulario de contacto
export type FormState = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
  success?: boolean;
};

// --- CONTACTO (Público - Usa cliente estático) ---
export async function sendContactMessage(prevState: FormState, formData: FormData): Promise<FormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;
  const honeypot = formData.get("phone");

  if (honeypot) {
    return { message: "Mensaje enviado", success: true };
  }

  const errors: FormState["errors"] = {};
  if (!name || name.length < 2) errors.name = ["El nombre es muy corto."];
  if (!email || !email.includes("@")) errors.email = ["Email inválido."];
  if (!message || message.length < 10) errors.message = ["El mensaje es muy corto."];

  if (Object.keys(errors).length > 0) {
    return { message: "Error en el formulario", errors, success: false };
  }

  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, message });

  if (error) {
    console.error("Supabase error:", error);
    return { message: "Error al guardar el mensaje. Intenta de nuevo.", success: false };
  }

  return { message: "¡Mensaje recibido! Te contactaré pronto.", success: true };
}

// --- LIKES (Público - Usa cliente estático) ---
export async function toggleProjectLike(projectId: string) {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("portfolio_session")?.value;

  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set("portfolio_session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const { data: existingLike } = await supabase
    .from("project_likes")
    .select("id")
    .eq("project_id", projectId)
    .eq("anonymous_id", sessionId)
    .single();

  let isLiked = false;

  if (existingLike) {
    await supabase.from("project_likes").delete().eq("id", existingLike.id);
    isLiked = false;
  } else {
    await supabase.from("project_likes").insert({ project_id: projectId, anonymous_id: sessionId });
    isLiked = true;
  }

  const { count } = await supabase
    .from("project_likes")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  revalidatePath("/projects/[slug]", "page");
  return { success: true, isLiked, likesCount: count || 0 };
}

// --- SHARES (Público) ---
export async function incrementProjectShares(projectId: string) {
  const { error } = await supabase.rpc('increment_share_count', { 
    row_id: projectId 
  });

  if (error) {
    console.error("Error incrementing shares:", error);
    return { success: false };
  }
  return { success: true };
}

// --- TESTIMONIOS (Creación Pública) ---
export type TestimonialState = {
  message: string;
  success?: boolean;
  errors?: {
    name?: string[];
    email?: string[]; // Nuevo campo de error
    content?: string[];
  };
};

export async function createTestimonial(prevState: TestimonialState, formData: FormData): Promise<TestimonialState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string; // Capturamos email
  const relationship = formData.get("relationship") as string;
  const role_or_company = formData.get("role_or_company") as string;
  const project_id = formData.get("project_id") as string;
  const content = formData.get("content") as string;
  const rating = Number(formData.get("rating"));
  const avatarFile = formData.get("avatar") as File | null;

  // 1. Validaciones
  const errors: TestimonialState['errors'] = {};
  
  if (!name || name.length < 2) errors.name = ["El nombre es obligatorio."];
  
  // Validación estricta de Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = ["Por favor, ingresa un correo válido."];
  }

  if (!content || content.length < 10) errors.content = ["El testimonio es muy corto."];
  
  if (Object.keys(errors).length > 0) {
    return { message: "Por favor corrige los errores.", errors, success: false };
  }

  if (!relationship) return { message: "Debes seleccionar quién eres.", success: false };

  let avatar_url = null;

  // 2. Subir Avatar
  if (avatarFile && avatarFile.size > 0) {
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, avatarFile);

      if (!uploadError) {
        const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
        avatar_url = data.publicUrl;
      }
    } catch (error) {
      console.error("Error subiendo avatar:", error);
    }
  }

  // 3. Insertar en DB con email
  const { error } = await supabase.from("testimonials").insert({
    name,
    email, // Guardamos el email
    relationship,
    role_or_company: role_or_company || null,
    project_id: project_id || null,
    content,
    rating: rating || 5,
    avatar_url,
    is_approved: false
  });

  if (error) {
    console.error("Error creando testimonio:", error);
    return { message: "Error al guardar. Intenta nuevamente.", success: false };
  }

  revalidatePath("/admin/testimonials"); 
  return { message: "¡Gracias! Tu testimonio está pendiente de aprobación.", success: true };
}

// --- TESTIMONIOS (Gestión Admin - REQUIERE AUTH) ---

// Acción de Admin: Aprobar
export async function approveTestimonial(id: string) {
  // 1. Usamos el cliente autenticado (NO el público)
  const authSupabase = await createAuthClient();
  
  const { error } = await authSupabase
    .from("testimonials")
    .update({ is_approved: true })
    .eq("id", id);

  if (error) {
    console.error("Error aprobando:", error);
    throw new Error("No pudimos aprobar el testimonio. Verifica tus permisos.");
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/"); 
}

// Acción de Admin: Eliminar
export async function deleteTestimonial(id: string) {
  // 1. Usamos el cliente autenticado (NO el público)
  const authSupabase = await createAuthClient();

  const { error } = await authSupabase
    .from("testimonials")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error eliminando:", error);
    throw new Error("No pudimos eliminar el testimonio. Verifica tus permisos.");
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

// Acción de Admin: Destacar/No destacar
export async function toggleFeaturedTestimonial(id: string, currentState: boolean) {
  // 1. Usamos el cliente autenticado
  const authSupabase = await createAuthClient();

  const { error } = await authSupabase
    .from("testimonials")
    .update({ featured: !currentState })
    .eq("id", id);

  if (error) {
    console.error("Error destacando:", error);
    throw new Error("No pudimos actualizar el estado destacado.");
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

// --- ANALYTICS (Admin - Polling) ---
export async function getRealtimeUmamiStats() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const apiKey = process.env.UMAMI_API_KEY;

  if (!websiteId || !apiKey) return { pageviews: { value: 0 }, visitors: { value: 0 } };

  const endAt = Date.now();
  // Usamos 1 año atrás para consistencia con la carga inicial
  const startAt = endAt - (365 * 24 * 60 * 60 * 1000); 

  try {
    const res = await fetch(
      `https://api.umami.is/v1/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`,
      {
        headers: { "x-umami-api-key": apiKey },
        cache: 'no-store' // Crítico: Evita que Next.js cachee la respuesta
      }
    );

    if (!res.ok) throw new Error("Error fetching Umami");
    return res.json();
  } catch (error) {
    return { pageviews: { value: 0 }, visitors: { value: 0 } };
  }
}