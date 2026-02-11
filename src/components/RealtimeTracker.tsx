"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function RealtimeTracker() {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase.channel('online-users');

    channel
      .on('presence', { event: 'sync' }, () => {
        // El cliente solo reporta, no necesita leer el estado global
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            device: window.innerWidth < 768 ? 'mobile' : 'desktop'
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}