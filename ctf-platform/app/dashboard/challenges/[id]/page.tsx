'use client';

import { useState, useEffect, useActionState } from 'react'; // FIX: useActionState from 'react'
import { useRouter, useParams } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { useFormStatus } from 'react-dom'; // useFormStatus stays in 'react-dom'
import { 
  Terminal, Flag, CheckCircle, Lock, Unlock, ChevronLeft, 
  Cpu, Download, FileCode, AlertOctagon, Activity 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { submitFlagAction } from '@/app/actions/challenges'; 

// Fetcher для SWR
const fetcher = (url: string) => fetch(url).then((r) => r.json());

// --- КОМПОНЕНТ КНОПКИ (Чтобы знать статус загрузки) ---
function SubmitButton() {
  const { pending } = useFormStatus(); // Автоматически знает, идет ли отправка формы
  
  return (
    <Button 
      disabled={pending} 
      className={`w-full py-6 font-bold uppercase tracking-[0.2em] relative overflow-hidden group transition-all duration-300 ${
        pending 
          ? 'bg-accent/20 border-accent/50 text-accent cursor-wait' 
          : 'bg-white text-black hover:bg-accent border-white hover:border-accent'
      }`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {pending ? (
          <>
            <Activity className="w-4 h-4 animate-spin" /> CHECKING...
          </>
        ) : (
          <>
            SUBMIT FLAG <Terminal className="w-4 h-4" />
          </>
        )}
      </span>
      {/* Glitch Effect on Hover */}
      {!pending && <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out -z-0" />}
    </Button>
  );
}

// --- ОСНОВНАЯ СТРАНИЦА ---
export default function ChallengeDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  // 1. Получаем данные задачи (SWR для "живых" обновлений)
  const { data: challenge, error, isLoading } = useSWR(id ? `/api/challenges/${id}` : null, fetcher);

  // 2. Подключаем Server Action (FIX: useActionState вместо useFormState)
  // state будет содержать результат: { success: true, points: 100 } или { error: "..." }
  const [state, formAction] = useActionState(submitFlagAction, null);

  // 3. Эффект при успешной сдаче
  useEffect(() => {
    if (state?.success) {
      // Обновляем данные на клиенте без перезагрузки
      mutate(`/api/challenges/${id}`);
      mutate('/api/auth/me'); // Обновляем очки в шапке
    }
  }, [state, id]);

  // Эффект "печатания" описания
  const [desc, setDesc] = useState('');
  useEffect(() => {
    if (challenge?.description) setDesc(challenge.description);
  }, [challenge]);

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      <div className="font-mono text-accent animate-pulse tracking-widest text-xs">LOADING CHALLENGE DATA...</div>
    </div>
  );

  if (error || !challenge) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-red-500">
      <AlertOctagon className="w-16 h-16 opacity-50" />
      <div className="font-mono tracking-widest text-xs">CHALLENGE NOT FOUND</div>
      <button onClick={() => router.back()} className="text-white hover:text-accent underline text-xs font-mono">
        RETURN TO CHALLENGES
      </button>
    </div>
  );

  // Парсинг имени файла
  const fileName = challenge.fileUrl 
    ? challenge.fileUrl.split('/').pop().split('-').slice(1).join('-') 
    : 'data_packet.bin';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* === BREADCRUMBS === */}
      <div className="flex items-center gap-4 text-[10px] font-mono text-text-muted uppercase tracking-widest border-b border-white/5 pb-4">
        <button onClick={() => router.back()} className="hover:text-white flex items-center gap-2 transition-colors group">
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
            Back to Challenges
        </button>
        <span className="text-accent">/</span>
        <span className="text-white hover:text-accent transition-colors cursor-default">{challenge.category}</span>
        <span className="text-accent">/</span>
        <span className="text-text-muted">{challenge.id.split('-')[0]}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === LEFT COLUMN: INTEL CARD (Span 8) === */}
        <div className="lg:col-span-8 space-y-6">
           <div className={`relative bg-panel border p-8 overflow-hidden group transition-all duration-500 ${
             challenge.solved ? 'border-green-500/30 shadow-[0_0_30px_rgba(0,255,127,0.1)]' : 'border-white/10 hover:border-white/20'
           }`}>
              
              {/* Decorative Backgrounds */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none" />
              <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500 ${challenge.solved ? 'bg-green-500' : 'bg-accent'}`} />
              <div className="absolute top-0 right-0 p-4 opacity-20">
                 {challenge.solved ? <Unlock className="w-24 h-24 text-green-500" /> : <Lock className="w-24 h-24 text-white" />}
              </div>

              <div className="relative z-10">
                 {/* Header Info */}
                 <div className="flex justify-between items-start mb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider border ${
                                challenge.solved 
                                ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                                : 'bg-accent/10 text-accent border-accent/30'
                            }`}>
                                {challenge.category}
                            </span>
                            {challenge.solved && (
                                <span className="flex items-center gap-1 text-[9px] text-green-500 font-bold uppercase animate-pulse">
                                    <CheckCircle className="w-3 h-3" /> 
                                    Solved
                                </span>
                            )}
                        </div>
                        <h1 className={`text-4xl md:text-5xl font-black uppercase tracking-tighter ${
                            challenge.solved ? 'text-green-500' : 'text-white'
                        }`}>
                            {challenge.title}
                        </h1>
                    </div>
                    
                    <div className="text-right bg-black/50 p-4 border border-white/10 backdrop-blur-sm">
                        <div className={`text-3xl font-mono font-bold tabular-nums ${challenge.solved ? 'text-green-500' : 'text-white'}`}>
                            {challenge.points}
                        </div>
                        <div className="text-[9px] text-text-muted uppercase tracking-[0.2em]">Points</div>
                    </div>
                 </div>

                 {/* Description Box */}
                 <div className="bg-black/40 border border-white/5 p-6 font-mono text-sm leading-relaxed text-text-main relative min-h-[150px]">
                    {/* Scanline Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
                    <p className="whitespace-pre-wrap relative z-10">{desc}</p>
                 </div>

                 {/* === FILE DOWNLOAD SECTION === */}
                 {challenge.fileUrl && (
                    <div className="mt-6 border border-dashed border-accent/30 bg-accent/5 p-1 group/file hover:border-accent hover:bg-accent/10 transition-all duration-300">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-black border border-accent/30 text-accent group-hover/file:scale-110 transition-transform">
                                    <FileCode className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1 flex items-center gap-2">
                                        Attachment
                                    </div>
                                    <div className="text-xs font-mono text-white break-all">{fileName}</div>
                                </div>
                            </div>

                            <a 
                                href={challenge.fileUrl} 
                                download 
                                target="_blank"
                                className="flex items-center gap-2 px-6 py-3 bg-accent text-black font-black uppercase text-[10px] tracking-wider hover:bg-white hover:scale-105 transition-all"
                            >
                                <Download className="w-3 h-3" /> Download
                            </a>
                        </div>
                    </div>
                 )}
                 
                 {/* Footer Metadata */}
                 <div className="mt-8 flex items-center justify-between text-[10px] font-mono text-text-muted border-t border-white/5 pt-4">
                    <div className="flex gap-4">
                        <span>AUTHOR: <span className="text-white">{challenge.author || 'UNKNOWN'}</span></span>
                        <span>HASH: <span className="text-white">{challenge.id.slice(0,8)}</span></span>
                    </div>
                    {challenge.solvedBy && (
                        <span className="text-green-500">
                            First Solved By: {challenge.solvedBy}
                        </span>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* === RIGHT COLUMN: ACTION PANEL (Span 4) === */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* SUBMISSION CARD */}
            <div className={`bg-panel border p-6 relative overflow-hidden ${
                challenge.solved 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : state?.error 
                        ? 'border-red-500/50 bg-red-500/5' 
                        : 'border-white/10'
            }`}>
               <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white border-b border-white/5 pb-2">
                  <Terminal className={`w-4 h-4 ${challenge.solved ? 'text-green-500' : 'text-accent'}`} />
                  Submission
               </div>

               {challenge.solved ? (
                  <div className="text-center py-8 space-y-4 animate-in zoom-in duration-300">
                     <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,255,127,0.4)]">
                        <Unlock className="w-10 h-10" />
                     </div>
                     <div>
                        <h3 className="text-green-400 font-bold uppercase tracking-widest text-lg">Completed</h3>
                        <p className="text-[10px] text-green-500/70 font-mono mt-1">POINTS AWARDED</p>
                     </div>
                     <div className="bg-black/40 border border-green-500/30 p-2 text-xs font-mono text-white">
                        Solved by <span className="font-bold text-green-400">{challenge.solvedBy || 'YOU'}</span>
                     </div>
                  </div>
               ) : (
                   /* === ФОРМА С SERVER ACTION === */
                   <form action={formAction} className="space-y-4 relative z-10">
                      
                      {/* Скрытое поле для ID */}
                      <input type="hidden" name="challengeId" value={challenge.id} />

                      <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest">Flag</label>
                          <div className="relative group">
                             <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-blue-600 rounded opacity-20 group-hover:opacity-50 transition duration-500 blur" />
                             <div className="relative flex items-center">
                                <Flag className="absolute left-3 w-4 h-4 text-text-muted z-10 group-focus-within:text-accent transition-colors" />
                                <Input 
                                    name="flag" // Обязательно для Server Actions
                                    placeholder="flag{...}" 
                                    className="pl-10 bg-black border-white/20 focus:border-accent font-mono py-6 text-sm placeholder:text-white/20"
                                    required
                                    autoComplete="off"
                                />
                             </div>
                          </div>
                      </div>

                      {/* Кнопка с состоянием загрузки */}
                      <SubmitButton />

                      {/* Сообщения об ошибках/успехе */}
                      {state?.error && (
                          <div className="flex items-center gap-2 text-[10px] font-mono p-3 border border-red-500/30 text-red-400 bg-red-950/30 animate-in shake">
                              <AlertOctagon className="w-3 h-3 flex-shrink-0" />
                              <span>ERROR: {state.error}</span>
                          </div>
                      )}
                      {state?.success && (
                          <div className="flex items-center gap-2 text-[10px] font-mono p-3 border border-green-500/30 text-green-400 bg-green-950/30 animate-in slide-in-from-bottom-2">
                              <CheckCircle className="w-3 h-3 flex-shrink-0" />
                              <span>CORRECT FLAG. +{state.points} POINTS.</span>
                          </div>
                      )}
                   </form>
               )}
            </div>
        </div>
      </div>
    </div>
  );
}