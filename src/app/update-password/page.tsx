"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/actions";
import Button from "@/components/Button";
import { Lock, CheckCircle, AlertTriangle, Eye, EyeOff, Loader2, X, Wand2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Lógica de fuerza de contraseña
  const strength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (password.length >= 10) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  }, [password]);

  // Validación de coincidencia en tiempo real
  const passwordsMatch = useMemo(() => {
    return confirmPassword.length > 0 && password === confirmPassword;
  }, [password, confirmPassword]);

  const strengthConfig = [
    { label: "Muy débil", color: "bg-destructive" },
    { label: "Débil", color: "bg-orange-500" },
    { label: "Media", color: "bg-yellow-500" },
    { label: "Fuerte", color: "bg-emerald-500" },
  ];

  // Lógica del Generador de Contraseñas Seguras
  const generatePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
    let generated = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      generated += charset[array[i] % charset.length];
    }
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    toast.success("Contraseña segura generada");
  };

  // Verificación de sesión al montar
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login?error=link_expired");
      } else {
        setVerifying(false);
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validación Anti-Error Humano
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const res = await updatePassword(password);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      toast.success("Contraseña actualizada con éxito");
      setTimeout(() => router.push("/admin"), 2000);
    } else {
      setError(res.error || "Error al actualizar.");
      toast.error("No se pudo actualizar la contraseña");
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Verificando autorización...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border p-8 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Contraseña</h1>
          <p className="text-sm text-muted-foreground">Establece una clave segura para recuperar el acceso.</p>
        </div>
        
        {success ? (
          <div className="text-center text-emerald-500 space-y-4 py-4 animate-in zoom-in">
            <CheckCircle className="h-12 w-12 mx-auto" />
            <p className="font-medium">¡Contraseña actualizada! Redirigiendo al panel...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Nueva Clave</label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="w-full p-3 rounded-xl bg-background/50 border border-input focus:border-primary focus:ring-2 ring-primary/20 outline-none transition-all" 
                  placeholder="Mínimo 6 caracteres"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={generatePassword}
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                    title="Generar contraseña segura"
                  >
                    <Wand2 className="h-4 w-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Medidor de Fuerza con Framer Motion */}
              <div className="space-y-2 pt-1">
                <div className="flex gap-1.5 h-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-1 bg-muted rounded-full overflow-hidden">
                      {i < strength && (
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: 0 }}
                          className={cn("h-full", strengthConfig[strength - 1].color)}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                {password && (
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider", 
                    strength > 0 ? strengthConfig[strength - 1].color.replace('bg-', 'text-') : "text-muted-foreground")}>
                    Fuerza: {strengthConfig[strength - 1]?.label}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Confirmar Clave</label>
              <div className="relative">
                <input 
                  name="confirm" 
                  type={showPassword ? "text" : "password"} 
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  className="w-full p-3 rounded-xl bg-background/50 border border-input focus:border-primary focus:ring-2 ring-primary/20 outline-none transition-all" 
                  placeholder="Repite tu nueva clave"
                />
                {confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-[10px] font-bold text-destructive uppercase tracking-wider ml-1">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>
            
            {error && (
              <div className="text-destructive text-xs font-medium flex items-center gap-2 bg-destructive/10 p-3 rounded-lg border border-destructive/20 animate-in slide-in-from-top-1">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            
            <Button type="submit" isLoading={loading} className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
              Actualizar y Entrar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}