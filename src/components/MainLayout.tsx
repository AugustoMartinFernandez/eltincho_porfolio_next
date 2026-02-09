"use client";

import { usePathname } from "next/navigation";

interface MainLayoutProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
}

export default function MainLayout({ children, navbar, footer }: MainLayoutProps) {
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
      {navbar}
      {/* pt-20 compensa la altura del navbar fijo solo en la web pública */}
      <main className="flex-1 pt-20">
        {children}
      </main>
      {footer}
    </>
  );
}