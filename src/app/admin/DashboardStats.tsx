"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Users, Eye } from "lucide-react";
import { getRealtimeUmamiStats } from "@/lib/actions";

export default function DashboardStats({ 
  totalViews, 
  totalVisitors 
}: { 
  totalViews: number; 
  totalVisitors: number;
}) {
  const [onlineUsers, setOnlineUsers] = useState(0);
  
  // 🛡️ Inicialización segura: Evita que el componente explote si las props fallan
  const [metrics, setMetrics] = useState({ 
    views: totalViews || 0, 
    visitors: totalVisitors || 0 
  });

  // Polling de Umami (Cada 30s) con validación defensiva
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getRealtimeUmamiStats();
        // 🛡️ Solo actualizamos si la respuesta es completa y válida
        if (data && data.pageviews && data.visitors) {
          setMetrics({
            views: Number(data.pageviews.value) || 0,
            visitors: Number(data.visitors.value) || 0
          });
        }
      } catch (err) {
        console.error("Error polling Umami stats:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Lógica de Supabase Realtime (Usuarios Online)
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase.channel('online-users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(Object.keys(state).length);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {/* Tarjeta Usuarios Online */}
      <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Usuarios Online</h3>
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
        </div>
        <div className="text-2xl font-bold flex items-center gap-2">
          {onlineUsers}
          <span className="text-xs font-normal text-muted-foreground self-end mb-1">activos ahora</span>
        </div>
      </div>

      {/* Tarjeta Vistas Totales */}
      <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Vistas Totales</h3>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </div>
        {/* 🛡️ Renderizado blindado contra undefined */}
        <div className="text-2xl font-bold">
          {(metrics.views || 0).toLocaleString()}
        </div>
      </div>

      {/* Tarjeta Visitantes Únicos */}
      <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Visitantes Únicos</h3>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        {/* 🛡️ Renderizado blindado contra undefined */}
        <div className="text-2xl font-bold">
          {(metrics.visitors || 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}