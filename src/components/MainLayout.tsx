"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Detectar si estamos en el panel de admin o en el login
  // (El login también queremos que se vea limpio, sin navbar)
  const isAdminPage = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/login";

  const shouldHideInterface = isAdminPage || isLoginPage;

  if (shouldHideInterface) {
    // Si es admin o login, devolvemos el contenido puro sin "adornos"
    // El padding y layouts lo manejará el layout interno de admin
    return <main className="flex-1">{children}</main>;
  }

  // Si es la web pública, mostramos todo
  return (
    <>
      <Navbar />
      {/* pt-20 compensa la altura del navbar fijo solo en la web pública */}
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}