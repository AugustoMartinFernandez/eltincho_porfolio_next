"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Users, ExternalLink } from "lucide-react";

export default function RealtimeMetricsCard() {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase.channel('online-users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        // Contamos cuántos clientes únicos (presencias) hay conectados
        setOnlineCount(Object.keys(newState).length);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Usuarios Online</h3>
        <div className="relative">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
        </div>
      </div>
      <div className="pt-2">
        <div className="text-2xl font-bold">{onlineCount}</div>
        <p className="text-xs text-muted-foreground mt-1">En este momento</p>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <a 
            href="https://cloud.umami.is/websites/86e54cb8-ec95-4a27-b256-a8a19324d9c2" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-primary flex items-center gap-1 hover:underline"
        >
            Ver Métricas Completas <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}