'use client';
import useSWR from 'swr';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Lock, Terminal, Shield, Globe, Cpu, Search, Hash } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Функция для иконок и цветов категорий
const getCategoryStyle = (cat: string) => {
  switch (cat?.toUpperCase()) {
    case 'WEB': return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: Globe };
    case 'PWN': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: Cpu };
    case 'CRYPTO': return { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', icon: Lock };
    case 'FORENSICS': return { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', icon: Search };
    default: return { color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', icon: Terminal };
  }
};

export default function ChallengesPage() {
  const { data: challenges, error } = useSWR('/api/challenges/list', fetcher);
  const [filter, setFilter] = useState('ALL');

  if (!challenges) return <div className="p-12 text-center text-accent animate-pulse font-mono">LOADING CHALLENGES...</div>;

  // Фильтрация
  const categories = ['ALL', ...Array.from(new Set(challenges.map((c: any) => c.category)))];
  const filtered = filter === 'ALL' ? challenges : challenges.filter((c: any) => c.category === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Operations</h1>
          <p className="text-xs font-mono text-text-muted">Select a target to engage</p>
        </div>
        
        {/* CATEGORY TABS */}
        <div className="flex gap-2 mt-4 md:mt-0 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {categories.map((cat: any) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-accent text-black border-accent' 
                  : 'bg-transparent text-text-muted border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((challenge: any) => {
          const style = getCategoryStyle(challenge.category);
          const Icon = style.icon;

          return (
            <Link 
              key={challenge.id} 
              href={`/dashboard/challenges/${challenge.id}`}
              className={`relative bg-panel border p-6 hover:-translate-y-1 transition-all group overflow-hidden flex flex-col justify-between h-48 ${
                challenge.solved ? 'border-green-500/30 opacity-75' : `hover:shadow-lg ${style.border} border-white/5`
              }`}
            >
              {/* Background Noise */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded flex items-center gap-2 ${style.color} ${style.bg}`}>
                    <Icon className="w-3 h-3" />
                    {challenge.category || 'MISC'}
                  </span>
                  {challenge.solved && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>

                <h3 className={`text-xl font-bold uppercase tracking-tight mb-2 group-hover:text-accent transition-colors ${challenge.solved ? 'text-green-500 line-through decoration-2' : 'text-white'}`}>
                  {challenge.title}
                </h3>
              </div>

              <div className="flex items-end justify-between border-t border-white/5 pt-4">
                <div className="text-xs font-mono text-text-muted">
                   AUTHOR: <span className="text-white">UNKNOWN</span>
                </div>
                <div className={`text-2xl font-mono font-bold ${challenge.solved ? 'text-green-500' : 'text-white group-hover:text-accent'}`}>
                  {challenge.points}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}