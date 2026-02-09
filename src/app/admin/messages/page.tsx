import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Mail } from "lucide-react";
import MessagesClient from "./MessagesClient";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // Fetch ordenado por fecha (más recientes primero)
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Mail className="h-8 w-8 text-primary" /> Bandeja de Entrada
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los mensajes de contacto recibidos desde tu portfolio.
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-mono text-sm font-bold">
          {messages?.filter(m => !m.is_read).length || 0} Nuevos
        </div>
      </div>

      <MessagesClient initialMessages={messages || []} />
    </div>
  );
}