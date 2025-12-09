'use client';
import { Zap, Clock } from 'lucide-react';

// === 1. REAL SKILL RADAR (RESPONSIVE SVG) ===
export function SkillRadar({ data }: { data: any[] }) {
  if (!data || data.length === 0) return (
    <div className="flex items-center justify-center h-full text-xs text-text-muted font-mono uppercase tracking-widest">
      No Data Analysis
    </div>
  );

  // Используем фиксированную систему координат для SVG, но растягиваем его через CSS
  const viewBoxSize = 300;
  const center = viewBoxSize / 2;
  const radius = 100; // Радиус внутри viewBox
  const angleSlice = (Math.PI * 2) / data.length;

  const points = data.map((d, i) => {
    const value = d.A || 0; 
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
    const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
    return `${x},${y}`;
  }).join(' ');

  const bgPoints = [1, 0.66, 0.33].map(scale => 
    data.map((_, i) => {
      const r = radius * scale;
      const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
      const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
      return `${x},${y}`;
    }).join(' ')
  );

  const labels = data.map((d, i) => {
    const r = radius + 25; 
    const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
    const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
    return { x, y, text: d.subject, count: d.count };
  });

  return (
    <div className="w-full h-full min-h-[250px] flex items-center justify-center relative">
      <svg 
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} 
        className="w-full h-full max-w-[400px] overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Сетка */}
        {bgPoints.map((pts, i) => (
          <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        
        {/* Оси */}
        {data.map((_, i) => {
          const x = center + radius * Math.cos(i * angleSlice - Math.PI / 2);
          const y = center + radius * Math.sin(i * angleSlice - Math.PI / 2);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
        })}

        {/* Область значений */}
        <polygon points={points} fill="rgba(0, 255, 127, 0.15)" stroke="#00FF7F" strokeWidth="2" className="drop-shadow-[0_0_15px_rgba(0,255,127,0.3)] transition-all duration-1000 ease-out" />
        
        {/* Точки */}
        {data.map((d, i) => {
           const value = d.A || 0;
           const r = (value / 100) * radius;
           const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
           const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
           return <circle key={i} cx={x} cy={y} r="3" fill="#00FF7F" className="animate-pulse" />;
        })}

        {/* Подписи */}
        {labels.map((l, i) => (
          <g key={i}>
            <text 
              x={l.x} 
              y={l.y} 
              textAnchor="middle" 
              dy="0.35em" 
              className="fill-text-muted text-[10px] font-mono font-bold uppercase tracking-wider"
            >
              {l.text}
            </text>
            <text 
              x={l.x} 
              y={l.y + 12} 
              textAnchor="middle" 
              className="fill-accent text-[9px] font-mono"
            >
              [{l.count}]
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// === 2. TEAM ACTIVITY LOG (OPTIMIZED) ===
export function TeamActivityLog({ activities }: { activities: any[] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-text-muted text-xs font-mono space-y-2 opacity-50 border border-dashed border-white/10 rounded-lg">
         <Clock className="w-6 h-6 mb-2" />
         <p>NO RECENT ACTIVITY</p>
         <p className="text-[9px] tracking-widest">SYSTEM STANDBY</p>
      </div>
    );
  }

  const timeAgo = (date: Date) => {
     const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
     if (seconds < 60) return 'Just now';
     const minutes = Math.floor(seconds / 60);
     if (minutes < 60) return `${minutes}m`;
     const hours = Math.floor(minutes / 60);
     if (hours < 24) return `${hours}h`;
     return `${Math.floor(hours/24)}d`;
  };

  return (
    <div className="space-y-4 relative pl-2">
       {/* Timeline line */}
       <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10" />

       {activities.map((act) => (
         <div key={act.id} className="relative pl-8 flex items-start justify-between group">
            {/* Timeline dot */}
            <div className={`absolute left-[7px] top-1.5 w-2 h-2 rounded-full border-2 border-[#0a0a0a] transition-all duration-300 ${act.isMe ? 'bg-accent scale-110 shadow-[0_0_10px_rgba(0,255,127,0.5)]' : 'bg-gray-600'}`} />
            
            <div className="flex-1 min-w-0 mr-3"> {/* min-w-0 нужен для truncate в flex */}
               <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-0.5">
                  <span className={`text-xs font-bold font-mono truncate max-w-[120px] ${act.isMe ? 'text-accent' : 'text-white'}`}>
                     {act.username}
                  </span>
                  <span className="text-[8px] px-1.5 py-px border border-white/10 rounded bg-white/5 text-text-muted uppercase tracking-wider">
                     {act.category || 'MISC'}
                  </span>
               </div>
               <div className="text-[11px] text-text-muted truncate">
                  Solved: <span className="text-white font-medium">{act.challenge}</span>
               </div>
            </div>

            <div className="text-right flex-shrink-0">
               <div className="flex items-center justify-end gap-1 text-accent text-xs font-bold font-mono">
                  +{act.points} <Zap className="w-3 h-3" />
               </div>
               <div className="text-[9px] text-text-muted/60 font-mono mt-0.5 uppercase">{timeAgo(act.time)}</div>
            </div>
         </div>
       ))}
    </div>
  );
}