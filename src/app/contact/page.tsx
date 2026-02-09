"use client";

import { useActionState } from "react"; // <--- CAMBIO 1: Importamos desde 'react' con el nombre nuevo
import { sendContactMessage } from "@/lib/actions";
import Button from "@/components/Button";
import { Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useFormStatus } from "react-dom"; // useFormStatus se mantiene en react-dom por ahora

const initialState = {
  message: "",
  errors: {},
  success: false,
};

export default function ContactPage() {
  // CAMBIO 2: Usamos useActionState en lugar de useFormState
  const [state, formAction] = useActionState(sendContactMessage, initialState);

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-5xl">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        
        {/* Columna Izquierda: Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Hablemos.
            </h1>
            <p className="text-xl text-muted-foreground">
              ¿Tenés un proyecto en mente o querés consultar sobre mis servicios? 
              Completá el formulario y me pondré en contacto lo antes posible.
            </p>
          </div>

          <div className="space-y-6 pt-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Email</h3>
                <a href="mailto:hola@tinchodev.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  hola@tinchodev.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ubicación</h3>
                <p className="text-muted-foreground">
                  Buenos Aires, Argentina<br/>
                  (Disponible Remoto)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          {state.success ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 animate-in fade-in zoom-in">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">¡Mensaje Enviado!</h3>
              <p className="text-muted-foreground">
                Gracias por escribirme. Voy a leer tu mensaje y responderte a la brevedad.
              </p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                Enviar otro mensaje
              </Button>
            </div>
          ) : (
            <form action={formAction} className="space-y-6">
              
              {/* Campo Anti-Spam (Honeypot) - Oculto visualmente */}
              <input type="text" name="phone" className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nombre</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Tu nombre"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Mensaje</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Contame sobre tu proyecto..."
                  required
                  rows={5}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
                {state.errors?.message && <p className="text-sm text-destructive">{state.errors.message}</p>}
              </div>

              <SubmitButton />
              
              {state.message && !state.success && (
                <p className="text-sm text-destructive text-center">{state.message}</p>
              )}
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full gap-2" size="lg" disabled={pending} isLoading={pending}>
      {!pending && <Send className="h-4 w-4" />}
      {pending ? "Enviando..." : "Enviar Mensaje"}
    </Button>
  );
}