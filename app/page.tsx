"use client";

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageSquare, Heart, Share2, Play, Users, Target, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import EmbeddedComments from "@/components/EmbeddedComments";
import { useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function CrowdfundingPage() {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fundingAmount, setFundingAmount] = useState(32500);
  const goalAmount = 50000;
  const progressPercent = (fundingAmount / goalAmount) * 100;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-950 font-sans pb-20">
        {/* Navigation / Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-primary">
              Eliksir Wiedźmina
            </h1>
            <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/5 px-6 font-bold">
              Zaloguj
            </Button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 pt-12">
          {/* Hero Section */}
          <section className="grid lg:grid-cols-2 gap-12 items-start mb-20">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                  Kampania Aktywna
                </span>
                <h2 className="text-5xl font-black tracking-tight leading-tight mb-6">
                  Wspólnie Tworzymy <span className="text-primary italic">Nową Jakość</span> Treści.
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  Eliksir Wiedźmina to nie tylko aplikacja. To ruch mający na celu przywrócenie wartości i autentyczności w świecie krótkich form wideo. Twoje wsparcie pozwoli nam na rozwój infrastruktury, lepszą jakość streamingu i wsparcie dla niezależnych twórców.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                    Wesprzyj Projekt
                  </Button>
                  <Button variant="ghost" className="px-8 py-6 rounded-2xl text-lg font-bold">
                    Dowiedz się więcej
                  </Button>
                </div>
              </motion.div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-black text-slate-900">1.2k</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Wspierających</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-black text-slate-900">14 dni</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Do końca</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-black text-slate-900">PLN 32.5k</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Zebrano</p>
                </div>
              </div>
            </div>

            {/* Video Player Section */}
            <div className="relative group">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-white group"
              >
                {!isPlaying && (
                  <>
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsPlaying(true)}
                        className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/40 cursor-pointer"
                      >
                        <Play size={32} fill="currentColor" className="ml-1" />
                      </motion.button>
                    </div>
                  </>
                )}

                <video
                  src="https://cdn.pixabay.com/vimeo/328940142/landscape-22580.mp4?width=1280&hash=8b5d1976a26315268617d12f1a637d7a59868e83"
                  className="w-full h-full object-cover"
                  loop
                  muted={isMuted}
                  autoPlay={false}
                  playsInline
                  ref={(el) => {
                    if (el) {
                      if (isPlaying) el.play();
                      else el.pause();
                    }
                  }}
                />

                <div className="absolute bottom-6 right-6 z-20 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button
                     onClick={() => setIsMuted(!isMuted)}
                     className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10"
                   >
                     {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                   </button>
                </div>
              </motion.div>

              {/* Progress Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -bottom-10 left-6 right-6 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 z-30"
              >
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Status Zbiórki</p>
                    <p className="text-3xl font-black text-slate-900">{Math.round(progressPercent)}% Celu</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Pozostało</p>
                    <p className="text-xl font-bold text-slate-900">PLN 17,500</p>
                  </div>
                </div>
                <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                   <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: `${progressPercent}%` }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="absolute inset-y-0 left-0 bg-primary"
                   />
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-slate-400">
                  <span>0 PLN</span>
                  <span>50,000 PLN CEL</span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features / Why Support */}
          <section className="py-20 grid md:grid-cols-3 gap-8">
             {[
               { icon: <Target className="text-primary" />, title: "Jasny Cel", desc: "Każda złotówka idzie bezpośrednio na rozwój technologii i wsparcie twórców." },
               { icon: <ShieldCheck className="text-emerald-500" />, title: "Transparentność", desc: "Regularne raporty z postępów i wydatków dostępne dla każdego wspierającego." },
               { icon: <Users className="text-blue-500" />, title: "Społeczność", desc: "Wspierając nas, zyskujesz realny wpływ na kierunek rozwoju aplikacji." }
             ].map((feature, i) => (
               <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                   {feature.icon}
                 </div>
                 <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                 <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
               </div>
             ))}
          </section>

          {/* Comments Section */}
          <section className="py-20 border-t border-slate-200">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Dyskusja</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Podziel się swoją opinią</p>
                </div>
              </div>

              <EmbeddedComments />
            </div>
          </section>
        </main>

        <footer className="bg-slate-900 text-white py-12 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="text-center md:text-left">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Eliksir Wiedźmina</h2>
                <p className="text-slate-400 text-sm">© 2024 Witcher&apos;s Elixir. Wszelkie prawa zastrzeżone.</p>
             </div>
             <div className="flex gap-6">
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Share2 size={24} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Heart size={24} /></a>
             </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
