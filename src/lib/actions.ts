"use server";

import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";

// Definimos el estado inicial del formulario para el hook useFormState
export type FormState = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
  success?: boolean;
};

export async function sendContactMessage(prevState: FormState, formData: FormData): Promise<FormState> {
  // 1. Extraer datos
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;
  const honeypot = formData.get("phone"); // Campo oculto anti-spam

  // 2. Validación Anti-Spam (Honeypot)
  // Si el bot llenó el campo "phone" (que estará oculto), rechazamos silenciosamente
  if (honeypot) {
    return { message: "Mensaje enviado", success: true }; // Mentimos al bot
  }

  // 3. Validación básica de datos
  const errors: FormState["errors"] = {};
  if (!name || name.length < 2) errors.name = ["El nombre es muy corto."];
  if (!email || !email.includes("@")) errors.email = ["Email inválido."];
  if (!message || message.length < 10) errors.message = ["El mensaje es muy corto."];

  if (Object.keys(errors).length > 0) {
    return { message: "Error en el formulario", errors, success: false };
  }

  // 4. Guardar en Supabase
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, message });

  if (error) {
    console.error("Supabase error:", error);
    return { message: "Error al guardar el mensaje. Intenta de nuevo.", success: false };
  }

  // 5. Retornar éxito
  return { message: "¡Mensaje recibido! Te contactaré pronto.", success: true };
}