"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function TrafficChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  // Formateamos los datos para que Recharts los entienda bien
  const chartData = data.map(item => ({
    time: item.x, // Umami devuelve 'x' como fecha
    views: item.y, // Umami devuelve 'y' como valor
  }));

  return (
    <div className="w-full h-[300px] mt-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-6">Tráfico (Últimas 24hs)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            tickFormatter={(str) => format(new Date(str), "HH:mm", { locale: es })}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            labelFormatter={(label) => format(new Date(label), "d MMM, HH:mm", { locale: es })}
          />
          <Area 
            type="monotone" 
            dataKey="views" 
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#colorViews)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}