"use server";

import { supabase } from "@/lib/supabaseClient"; // Cliente público (para crear)
import { createServerClient } from "@supabase/ssr"; // Cliente privado (para administrar)
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";

// --- HELPER DE SEGURIDAD ---
// Esta función crea un cliente de Supabase que "sabe" quién está logueado
async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // El método `setAll` fue llamado desde un Server Component.
            // Esto se puede ignorar si tienes un middleware refrescando sesiones.
          }
        },
      },
    },
  );
}

function safeError(error: unknown) {
  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error as object), 2);
  } catch {
    return String(error);
  }
}

// --- LOGGING HELPERS ---

async function recordSecurityEvent(eventType: string, details: any = {}) {
  try {
    const headerStore = await headers();
    const ipAddress = headerStore.get("x-forwarded-for") || "unknown";
    const userAgent = headerStore.get("user-agent") || "unknown";
    const { browser, os, deviceType } = parseUserAgent(userAgent);
    const email = details.email || "N/A";

    // Usamos el cliente público asumiendo que la tabla permite inserts anónimos
    // o usamos un cliente con privilegios si estuviera disponible.
    await supabase.from("security_logs").insert({
      event_type: eventType,
      email: email,
      ip_address: ipAddress,
      device_type: deviceType,
      user_agent: userAgent,
      details: details,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to record security event:", error);
    // No lanzamos el error para no bloquear la acción principal
  }
}

async function recordAuditLog(
  action: string,
  table: string,
  recordId: string,
  oldData: any = null,
  newData: any = null,
) {
  try {
    const authSupabase = await createAuthClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (user) {
      await authSupabase.from("audit_logs").insert({
        user_id: user.id,
        action,
        table_name: table,
        record_id: recordId,
        old_data: oldData,
        new_data: newData,
      });
    }
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}

// --- RATE LIMITING ---
async function checkRateLimit(ip: string): Promise<boolean> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  try {
    const { count } = await supabase
      .from("security_logs")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "LOGIN_FAIL")
      .eq("ip_address", ip)
      .gt("created_at", fifteenMinutesAgo);

    return (count || 0) < 5;
  } catch (error) {
    console.error("Rate limit check error:", error);
    return true;
  }
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
export async function sendContactMessage(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
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
  if (!message || message.length < 10)
    errors.message = ["El mensaje es muy corto."];

  if (Object.keys(errors).length > 0) {
    return { message: "Error en el formulario", errors, success: false };
  }

  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, message });

  if (error) {
    console.error("Supabase error:", error);
    return {
      message: "Error al guardar el mensaje. Intenta de nuevo.",
      success: false,
    };
  }

  // Log de seguridad (Contacto recibido)
  recordSecurityEvent("CONTACT_MESSAGE_RECEIVED", { email });

  return { message: "¡Mensaje recibido! Te contactaré pronto.", success: true };
}

// --- LOGIN (Público - Maneja la validación y la auditoría) ---
export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 0. Rate Limiting (Protección contra fuerza bruta)
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "unknown";

  const isAllowed = await checkRateLimit(ip);
  if (!isAllowed) {
    await recordSecurityEvent("BRUTE_FORCE_BLOCKED", { email });
    return {
      success: false,
      error: "Demasiados intentos fallidos. Acceso bloqueado por 15 minutos.",
    };
  }

  // 1. Validación en servidor (ADMIN_EMAIL)
  const isValid = await validateAdminEmail(email);
  if (!isValid) {
    // Registro de intento fallido
    recordSecurityEvent("LOGIN_FAIL", { email });
    return { success: false, error: "Credenciales incorrectas." };
  }

  // 2. Autenticación con Supabase
  const authSupabase = await createAuthClient();
  const { error } = await authSupabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Registro de fallo técnico
    recordSecurityEvent("LOGIN_FAIL", { email, error: error.message });
    return {
      success: false,
      error: "Error de autenticación. Intenta nuevamente.",
    };
  }

  // Registro de éxito
  recordSecurityEvent("LOGIN_SUCCESS", { email });
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
    await supabase
      .from("project_likes")
      .insert({ project_id: projectId, anonymous_id: sessionId });
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
  let { error } = await supabase.rpc("increment_share_count", {
    row_id: projectId,
  });

  // Compatibilidad con firmas RPC que usan project_id en lugar de row_id
  if (
    error &&
    (error.code === "PGRST202" ||
      /increment_share_count/i.test(error.message || ""))
  ) {
    const retry = await supabase.rpc("increment_share_count", {
      project_id: projectId,
    });
    error = retry.error;
  }

  if (error) {
    console.error("Error incrementing shares:", safeError(error));
    return { success: false, error: safeError(error) };
  }

  const { data: updatedProject, error: fetchError } = await supabase
    .from("projects")
    .select("share_count")
    .eq("id", projectId)
    .single();

  if (fetchError) {
    console.error("Error fetching updated share count:", safeError(fetchError));
    return { success: true };
  }

  return { success: true, shareCount: updatedProject?.share_count ?? 0 };
}

// --- TESTIMONIOS (Creación Pública) ---
export type TestimonialState = {
  message: string;
  success?: boolean;
  errors?: {
    name?: string[];
    email?: string[]; // Nuevo campo de error
    relationship?: string[];
    content?: string[];
  };
};

// --- DEFINICIÓN DEL ESQUEMA ZOD (CORREGIDO) ---
const TestimonialSchema = z.object({
  name: z.string().min(2, { message: "El nombre es obligatorio." }),
  email: z.string().email({ message: "Por favor, ingresa un correo válido." }),

  // CORRECCIÓN: Usamos 'message' en lugar de 'errorMap' para compatibilidad con la firma de TS
  relationship: z.enum(["client", "colleague", "visitor"] as const, {
    message: "Debes seleccionar quién eres.",
  }),

  role_or_company: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  project_id: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  content: z.string().min(10, { message: "El testimonio es muy corto." }),
  rating: z.coerce.number().min(1).max(5).default(5),
});

// --- SERVER ACTION (CON VALIDACIÓN) ---
export async function createTestimonial(
  prevState: TestimonialState,
  formData: FormData,
): Promise<TestimonialState> {
  // 1. Anti-Bot (Honeypot)
  const website_url = formData.get("website_url") as string;
  if (website_url) {
    return { message: "Testimonio enviado con éxito", success: true };
  }

  // 2. Validación con Zod
  const validatedFields = TestimonialSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    relationship: formData.get("relationship"),
    role_or_company: formData.get("role_or_company"),
    project_id: formData.get("project_id"),
    content: formData.get("content"),
    rating: formData.get("rating"),
  });

  // 3. Manejo de Errores de Validación
  if (!validatedFields.success) {
    return {
      message: "Por favor corrige los errores.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  // 4. Extracción de datos validados
  const {
    name,
    email,
    relationship,
    role_or_company,
    project_id,
    content,
    rating,
  } = validatedFields.data;

  // 5. Lógica de Archivos (Avatar)
  const avatarFile = formData.get("avatar") as File | null;
  let avatar_url = null;
  let uploadedFilePath: string | null = null;

  if (avatarFile && avatarFile.size > 0) {
    try {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;
      uploadedFilePath = filePath;

      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(filePath, avatarFile);

      if (!uploadError) {
        const { data } = supabase.storage
          .from("portfolio")
          .getPublicUrl(filePath);
        avatar_url = data.publicUrl;
      }
    } catch (error) {
      console.error("Error subiendo avatar:", error);
    }
  }

  // 6. Inserción en Base de Datos
  try {
    const { error } = await supabase.from("testimonials").insert({
      name,
      email,
      relationship, // Ahora es seguro y tipado correctamente como "client" | "colleague" | "visitor"
      role_or_company,
      project_id,
      content,
      rating,
      avatar_url,
      is_approved: false,
    });

    if (error) throw error;

    revalidatePath("/admin/testimonials");
    recordSecurityEvent("TESTIMONIAL_SUBMITTED", { name, email });
    return {
      message: "¡Gracias! Tu testimonio está pendiente de aprobación.",
      success: true,
    };
  } catch (error) {
    console.error("Error creando testimonio:", error);
    // Cleanup de imagen si falla la DB
    if (uploadedFilePath)
      await supabase.storage.from("portfolio").remove([uploadedFilePath]);
    return { message: "Error al guardar. Intenta nuevamente.", success: false };
  }
}

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

  // Audit Log
  recordAuditLog(
    "APPROVE",
    "testimonials",
    id,
    { is_approved: false },
    { is_approved: true },
  );

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
    throw new Error(
      "No pudimos eliminar el testimonio. Verifica tus permisos.",
    );
  }

  // Audit Log
  recordAuditLog("DELETE", "testimonials", id);

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

// Acción de Admin: Destacar/No destacar
export async function toggleFeaturedTestimonial(
  id: string,
  currentState: boolean,
) {
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
  // Audit Log
  recordAuditLog(
    "TOGGLE_FEATURED",
    "testimonials",
    id,
    { featured: currentState },
    { featured: !currentState },
  );
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
// --- ANALYTICS (Admin - Polling) ---
export async function getRealtimeUmamiStats() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const apiKey = process.env.UMAMI_API_KEY;
  if (!websiteId || !apiKey)
    return { pageviews: { value: 0 }, visitors: { value: 0 } };
  const endAt = Date.now();
  // Usamos las últimas 24 horas para un polling ligero y rápido
  const startAt = endAt - 24 * 60 * 60 * 1000;
  try {
    const res = await fetch(
      `https://api.umami.is/v1/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`,
      {
        headers: { "x-umami-api-key": apiKey },
        cache: "no-store", // Crítico: Evita que Next.js cachee la respuesta
      },
    );

    if (!res.ok) throw new Error("Error fetching Umami");
    return res.json();
  } catch (error) {
    return { pageviews: { value: 0 }, visitors: { value: 0 } };
  }
}
export async function validateAdminEmail(email: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error(
      "Security Error: ADMIN_EMAIL environment variable is not configured.",
    );
    return false;
  }
  return email.toLowerCase() === adminEmail.toLowerCase();
}
export async function logSecurityBreach(email: string) {
  // Reutilizamos el helper centralizado
  await recordSecurityEvent("INTRUSION_ATTEMPT", { email });
}
// Agrega esto a tu archivo src/lib/actions.ts
// 1. Solicitar el reseteo (Envía el email)
export async function resetPasswordForEmail(email: string) {
  const supabase = await createAuthClient();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const inputEmail = email.toLowerCase().trim();
  // 🛡️ Normalización y validación robusta para evitar falsos positivos
  if (!adminEmail || inputEmail !== adminEmail) {
    return { success: false, error: "invalid_email" };
  }
  recordSecurityEvent("PASSWORD_RESET_REQUEST", { email: inputEmail });
  const { error } = await supabase.auth.resetPasswordForEmail(inputEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/update-password`,
  });
  if (error) {
    console.error("Supabase Auth Error (Reset Password):", error);
    return { success: false, error: "auth_error" };
  }
  return { success: true };
}
export async function updatePassword(password: string) {
  const supabase = await createAuthClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });
  if (error) {
    return { success: false, error: error.message };
  }
  recordSecurityEvent("PASSWORD_UPDATE_SUCCESS", {
    timestamp: new Date().toISOString(),
  });
  return { success: true };
}
export async function resetUmamiMetrics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const apiKey = process.env.UMAMI_API_KEY;
  if (!websiteId || !apiKey)
    return { success: false, error: "Configuración incompleta" };
  try {
    const res = await fetch(
      `https://api.umami.is/v1/websites/${websiteId}/reset`,
      {
        method: "POST",
        headers: {
          "x-umami-api-key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );
    if (!res.ok) throw new Error("Error al resetear métricas en Umami");
    recordAuditLog("RESET_METRICS", "umami", "global");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Reset Umami Error:", error);
    return { success: false, error: error.message };
  }
}
function parseUserAgent(ua: string) {
  const browser = /chrome|crios|crmo/i.test(ua)
    ? "Chrome"
    : /firefox|fxios/i.test(ua)
      ? "Firefox"
      : /safari/i.test(ua)
        ? "Safari"
        : /msie|trident/i.test(ua)
          ? "IE"
          : /edge/i.test(ua)
            ? "Edge"
            : "Unknown";
  const os = /windows/i.test(ua)
    ? "Windows"
    : /macintosh|mac os x/i.test(ua)
      ? "macOS"
      : /linux/i.test(ua)
        ? "Linux"
        : /android/i.test(ua)
          ? "Android"
          : /ios|iphone|ipad|ipod/i.test(ua)
            ? "iOS"
            : "Unknown";
  const deviceType = /mobile/i.test(ua)
    ? "Mobile"
    : /tablet/i.test(ua)
      ? "Tablet"
      : "Desktop";
  return { browser, os, deviceType };
}
export async function getSecurityLogs() {
  const supabase = await createAuthClient();
  const { data, error } = await supabase
    .from("security_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("Error fetching security logs:", error);
    return [];
  }
  return data.map((log: any) => ({
    ...log,
    ua_parsed: parseUserAgent(log.user_agent || ""),
  }));
}
export async function getAuditLogs() {
  const supabase = await createAuthClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return data;
}
// Helper privado para borrar imágenes del Storage
async function deleteProjectImage(imageUrl: string) {
  if (!imageUrl) return;
  try {
    const url = new URL(imageUrl);
    // Asumimos estructura: .../storage/v1/object/public/projects/filename.ext
    const pathParts = url.pathname.split("/");
    const bucketIndex = pathParts.indexOf("projects"); // Bucket 'projects'
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      const filePath = pathParts.slice(bucketIndex + 1).join("/");
      const authSupabase = await createAuthClient();
      await authSupabase.storage.from("projects").remove([filePath]);
    }
  } catch (error) {
    console.error("Error deleting image from storage:", error);
    // No lanzamos error para permitir que el borrado del registro continúe
  }
}
export async function deleteProject(id: string, imageUrl?: string) {
  const authSupabase = await createAuthClient();
  // 1. Borrar imagen si existe
  if (imageUrl) {
    await deleteProjectImage(imageUrl);
  }
  // 2. Eliminar registro
  const { error } = await authSupabase.from("projects").delete().eq("id", id);
  if (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: error.message };
  }
  // 3. Registrar auditoría y revalidar rutas
  await recordAuditLog("DELETE", "projects", id);
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  return { success: true };
}
export async function createTechnology(formData: FormData) {
  const authSupabase = await createAuthClient();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const rank = formData.get("rank") as string;
  const icon_url = formData.get("icon_url") as string;
  const visible = formData.get("visible") === "true";
  const { data, error } = await authSupabase
    .from("technologies")
    .insert({ name, category, rank, icon_url, visible })
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  await recordAuditLog("CREATE", "technologies", data.id, null, data);
  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true };
}

export async function updateTechnology(id: string, formData: FormData) {
  const authSupabase = await createAuthClient();
  const { data: oldData } = await authSupabase
    .from("technologies")
    .select("*")
    .eq("id", id)
    .single();
  const updates = {
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    rank: formData.get("rank") as string,
    icon_url: formData.get("icon_url") as string,
    visible: formData.get("visible") === "true",
  };
  const { data, error } = await authSupabase
    .from("technologies")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  await recordAuditLog("UPDATE", "technologies", id, oldData, data);
  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true };
}
export async function deleteTechnology(id: string) {
  const authSupabase = await createAuthClient();
  const { data: oldData } = await authSupabase
    .from("technologies")
    .select("*")
    .eq("id", id)
    .single();
  const { error } = await authSupabase
    .from("technologies")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  await recordAuditLog("DELETE", "technologies", id, oldData, null);
  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true };
}
export async function createExperience(formData: FormData) {
  const authSupabase = await createAuthClient();
  const current = formData.get("current") === "true";
  const payload = {
    role_title: formData.get("role_title") as string,
    company_name: formData.get("company_name") as string,
    start_date: formData.get("start_date") as string,
    end_date: current
      ? null
      : formData.get("end_date")
        ? (formData.get("end_date") as string)
        : null,
    description_md: formData.get("description_md") as string,
    visible: formData.get("visible") === "true",
    current: current,
  };
  const { data, error } = await authSupabase
    .from("experience")
    .insert(payload)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  await recordAuditLog("CREATE", "experience", data.id, null, data);
  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true };
}
export async function updateExperience(id: string, formData: FormData) {
  const authSupabase = await createAuthClient();
  const { data: oldData } = await authSupabase
    .from("experience")
    .select("*")
    .eq("id", id)
    .single();
  const current = formData.get("current") === "true";
  const updates = {
    role_title: formData.get("role_title") as string,
    company_name: formData.get("company_name") as string,
    start_date: formData.get("start_date") as string,
    end_date: current
      ? null
      : formData.get("end_date")
        ? (formData.get("end_date") as string)
        : null,
    description_md: formData.get("description_md") as string,
    visible: formData.get("visible") === "true",
    current: current,
  };
  const { data, error } = await authSupabase
    .from("experience")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  await recordAuditLog("UPDATE", "experience", id, oldData, data);
  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true };
}

export async function deleteExperience(id: string) {
  const authSupabase = await createAuthClient();
  const { data: oldData } = await authSupabase
    .from("experience")
    .select("*")
    .eq("id", id)
    .single();
  const { error } = await authSupabase.from("experience").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  await recordAuditLog("DELETE", "experience", id, oldData, null);
  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true };
}

export async function createEducation(formData: FormData) {
  const authSupabase = await createAuthClient();
  const current = formData.get("current") === "true";
  const payload = {
    degree_title: formData.get("degree_title") as string,
    institution_name: formData.get("institution_name") as string,
    start_date: formData.get("start_date") as string,
    end_date: current
      ? null
      : formData.get("end_date")
        ? (formData.get("end_date") as string)
        : null,
    certificate_url: (formData.get("certificate_url") as string) || null,
    visible: formData.get("visible") === "true",
    current: current,
  };
  const { data, error } = await authSupabase
    .from("education")
    .insert(payload)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  await recordAuditLog("CREATE", "education", data.id, null, data);
  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true };
}

export async function updateEducation(id: string, formData: FormData) {
  const authSupabase = await createAuthClient();
  const { data: oldData } = await authSupabase
    .from("education")
    .select("*")
    .eq("id", id)
    .single();
  const current = formData.get("current") === "true";
  const updates = {
    degree_title: formData.get("degree_title") as string,
    institution_name: formData.get("institution_name") as string,
    start_date: formData.get("start_date") as string,
    end_date: current
      ? null
      : formData.get("end_date")
        ? (formData.get("end_date") as string)
        : null,
    certificate_url: (formData.get("certificate_url") as string) || null,
    visible: formData.get("visible") === "true",
    current: current,
  };

  const { data, error } = await authSupabase
    .from("education")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  await recordAuditLog("UPDATE", "education", id, oldData, data);
  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true };
}

export async function deleteEducation(id: string) {
  const authSupabase = await createAuthClient();
  const { data: oldData } = await authSupabase
    .from("education")
    .select("*")
    .eq("id", id)
    .single();
  const { error } = await authSupabase.from("education").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  await recordAuditLog("DELETE", "education", id, oldData, null);
  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true };
}

export async function bulkDeleteProjects(
  projects: { id: string; image_url?: string }[],
) {
  const authSupabase = await createAuthClient();
  const ids = projects.map((p) => p.id);
  // 1. Borrar imágenes en paralelo
  await Promise.all(
    projects.map((p) =>
      p.image_url ? deleteProjectImage(p.image_url) : Promise.resolve(),
    ),
  );
  // 2. Borrar registros
  const { error } = await authSupabase.from("projects").delete().in("id", ids);
  if (error) return { success: false, error: error.message };
  // 3. Log y Revalidación
  await recordAuditLog("BULK_DELETE", "projects", "multiple", {
    count: projects.length,
  });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  return { success: true };
}
