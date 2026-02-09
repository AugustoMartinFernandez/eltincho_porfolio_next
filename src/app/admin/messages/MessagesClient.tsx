"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, MailOpen, Trash2, Calendar, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/Button";
import { ContactMessage } from "@/types/contact";
import { cn } from "@/lib/utils";

export default function MessagesClient({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Marcar como Leído / No Leído
  const toggleRead = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar estado");
    } else {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, is_read: !currentStatus } : msg))
      );
      toast.success(currentStatus ? "Marcado como no leído" : "Mensaje marcado como leído");
      router.refresh();
    }
    setLoadingId(null);
  };

  // Eliminar Mensaje
  const deleteMessage = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este mensaje permanentemente?")) return;
    
    setLoadingId(id);
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar mensaje");
      setLoadingId(null);
    } else {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      toast.success("Mensaje eliminado");
      router.refresh();
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card border border-border rounded-xl">
        <Mail className="h-12 w-12 mb-4 opacity-20" />
        <p>No hay mensajes en la bandeja de entrada.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={cn(
            "group relative flex flex-col md:flex-row gap-6 p-4 md:p-6 rounded-xl border transition-all duration-300",
            msg.is_read 
              ? "bg-card border-border/50 opacity-80 hover:opacity-100" 
              : "bg-primary/5 border-primary/20 shadow-sm"
          )}
        >
          {/* Indicador de Nuevo */}
          {!msg.is_read && (
            <span className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}

          {/* Info del Remitente */}
          <div className="w-full md:w-1/4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <User className="h-4 w-4 text-primary" />
              {msg.name}
            </div>
            <div className="text-sm text-muted-foreground break-words">
              {msg.email}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(msg.created_at), "d MMM yyyy, HH:mm", { locale: es })}
            </div>
          </div>

          {/* Contenido del Mensaje */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {msg.message}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-3 border-t pt-4 mt-2 md:mt-0 md:flex md:flex-col md:gap-2 md:border-t-0 md:border-l md:pt-0 md:pl-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleRead(msg.id, msg.is_read)}
              isLoading={loadingId === msg.id}
              className={cn("w-full justify-center md:justify-start", msg.is_read ? "text-muted-foreground" : "text-primary")}
            >
              {msg.is_read ? (
                <><Mail className="h-4 w-4 mr-2" /> Marcar No Leído</>
              ) : (
                <><MailOpen className="h-4 w-4 mr-2" /> Marcar Leído</>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteMessage(msg.id)}
              disabled={loadingId === msg.id}
              className="text-destructive hover:bg-destructive/10 w-full justify-center md:justify-start"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}