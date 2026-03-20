"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Heart,
  Share2,
  Play,
  Users,
  Target,
  ShieldCheck,
  Volume2,
  VolumeX,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  X
} from "lucide-react";
import Image from "next/image";
import EmbeddedComments from "@/components/EmbeddedComments";
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import LocalVideoPlayer from '@/components/LocalVideoPlayer';
import TippingModal from '@/components/TippingModal';
import LoginForm from '@/components/LoginForm';
import { ToastContainer } from '@/context/ToastContext';

export default function CrowdfundingPage() {
  const goalAmount = 50000;
  const fundingAmount = 32500;
  const progressPercent = (fundingAmount / goalAmount) * 100;

  const { openTippingModal, setIsMuted, isMuted, isPlaying, playVideo } = useStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const handleOpenLogin = () => setIsLoginOpen(true);
    window.addEventListener('open-login', handleOpenLogin);

    // Auto-play the featured video (muted)
    playVideo();
    setIsMuted(true);

    return () => window.removeEventListener('open-login', handleOpenLogin);
  }, [playVideo, setIsMuted]);

  const { data: slidesData } = useQuery({
    queryKey: ['slides', 'landing'],
    queryFn: async () => {
      const res = await fetch('/api/slides?limit=1');
      if (!res.ok) return { slides: [] };
      return res.json();
    },
  });

  const featuredSlide = slidesData?.slides?.[0];

  return (
      <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-serif selection:bg-primary/20 selection:text-primary">

        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-stone-900">
              Eliksir Wiedźmina
            </h1>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="font-sans font-bold text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors"
              >
                Zaloguj.
              </button>
              <Button
                onClick={() => window.location.href = '/tingtong'}
                className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-5 rounded-full font-sans font-bold text-xs tracking-widest uppercase shadow-lg group"
              >
                Aplikacja.
                <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section: The Video */}
        <section className="relative pt-20 h-[85vh] w-full bg-stone-900 overflow-hidden">
           <div className="absolute inset-0 z-0">
             {featuredSlide ? (
                <div className="w-full h-full relative group">
                  <LocalVideoPlayer
                    slide={featuredSlide}
                    isActive={true}
                  />
                  <div className="absolute bottom-10 right-10 z-30 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                       onClick={() => setIsMuted(!isMuted)}
                       className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all shadow-2xl"
                     >
                       {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                     </button>
                  </div>
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                       <button
                         onClick={() => playVideo()}
                         className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/40 pointer-events-auto active:scale-90 transition-transform"
                       >
                         <Play size={40} fill="currentColor" className="ml-2" />
                       </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10 font-sans font-bold uppercase tracking-widest">
                   Ładowanie wizji...
                </div>
              )}
           </div>

           {/* Cinematic Overlay */}
           <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#FDFBF7] via-transparent to-black/40 pointer-events-none" />

           <div className="absolute inset-x-0 bottom-0 z-20 p-8 md:p-20 text-center">
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1 }}
             >
                <p className="font-sans text-xs font-black uppercase tracking-[0.6em] text-white/60 mb-4">Kampania Crowdfundingowa</p>
                <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-2xl">
                   Finansujemy<br /><span className="text-primary italic">Przyszłość</span>.
                </h2>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="mt-12 text-stone-400"
                >
                  <ArrowDown size={32} className="mx-auto" />
                </motion.div>
             </motion.div>
           </div>
        </section>

        {/* Main Content Container */}
        <main className="max-w-6xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-12 gap-16 lg:gap-24">

           {/* Sidebar: Progress Card (Sticky on Desktop) */}
           <aside className="md:col-span-4 order-2 md:order-1">
              <div className="sticky top-32 space-y-8">
                 <div className="bg-white p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-stone-100">
                    <div className="space-y-6">
                       <div className="space-y-1">
                          <p className="text-sm font-sans font-black uppercase tracking-widest text-primary">Status Zbiórki</p>
                          <p className="text-5xl font-black tracking-tighter">PLN 32,500</p>
                       </div>

                       <div className="space-y-3">
                          <div className="h-4 w-full bg-stone-50 rounded-full overflow-hidden border border-stone-100 p-0.5">
                             <motion.div
                               initial={{ width: 0 }}
                               whileInView={{ width: `${progressPercent}%` }}
                               transition={{ duration: 1.5, ease: "easeOut" }}
                               className="h-full bg-primary rounded-full relative"
                             >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                             </motion.div>
                          </div>
                          <div className="flex justify-between text-[10px] font-sans font-black uppercase tracking-tighter text-stone-400">
                            <span>{Math.round(progressPercent)}% CELU</span>
                            <span>50,000 PLN</span>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                             <p className="text-2xl font-black">1.2k</p>
                             <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Wspierających</p>
                          </div>
                          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                             <p className="text-2xl font-black">14 dni</p>
                             <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Do końca</p>
                          </div>
                       </div>

                       <Button
                        onClick={() => openTippingModal()}
                        className="w-full bg-primary hover:bg-primary/90 text-white h-20 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all mt-4"
                       >
                         Wesprzyj Projekt
                       </Button>
                    </div>
                 </div>

                 <div className="p-8 bg-stone-900 rounded-[2.5rem] text-white space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                          <ShieldCheck size={20} />
                       </div>
                       <p className="text-sm font-bold tracking-tight">Bezpieczne płatności Stripe</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                          <Users size={20} />
                       </div>
                       <p className="text-sm font-bold tracking-tight">System Patronek 2.0</p>
                    </div>
                 </div>
              </div>
           </aside>

           {/* Main Content: Manifesto & Long Description */}
           <article className="md:col-span-8 order-1 md:order-2 space-y-16">
              <div className="space-y-8">
                 <h3 className="text-6xl md:text-8xl font-black uppercase tracking-tight leading-[0.85] text-stone-900 decoration-primary decoration-8 underline-offset-[16px]">
                   Nasza<br />Wizja.
                 </h3>
                 <p className="text-2xl md:text-3xl leading-snug text-stone-800 font-bold tracking-tight italic">
                   &quot;Tworzymy schronienie dla rzemiosła wideo w oceanie cyfrowego hałasu.&quot;
                 </p>
              </div>

              <div className="prose prose-stone prose-xl lg:prose-2xl max-w-none">
                 <p className="first-letter:text-8xl first-letter:font-black first-letter:text-primary first-letter:mr-4 first-letter:float-left first-letter:mt-2">
                   Eliksir Wiedźmina to nie tylko kolejna aplikacja z wideo. To manifest przeciwko algorytmom, które promują płytkość i toksyczną uwagę. Wierzymy, że format krótkiego wideo zasługuje na drugą szansę — jako medium dla prawdziwego rzemiosła, pasji i autentyczności.
                 </p>

                 <p>
                   Obecne platformy stały się zakładnikami wskaźników retencji. Treści są tworzone tak, aby uzależniać, a nie wzbogacać. My idziemy w przeciwnym kierunku. Budujemy przestrzeń, gdzie liczy się jakość, a nie częstotliwość. Gdzie twórca jest traktowany jak rzemieślnik, a nie dostawca treści dla maszyny.
                 </p>

                 <AnimatePresence>
                   {!isDescriptionExpanded ? (
                     <button
                       onClick={() => setIsDescriptionExpanded(true)}
                       className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm py-4 group"
                     >
                       Czytaj dalej Manifest
                       <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
                     </button>
                   ) : (
                     <motion.div
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       className="space-y-8"
                     >
                        <p>
                          Twoje wsparcie pozwoli nam sfinansować niezależną infrastrukturę streamingową. Chcemy być wolni od cenzury korporacyjnej i lagów, które zabijają immersję. Finansujemy serwery, które nie należą do gigantów Big Tech, lecz do nas — społeczności.
                        </p>
                        <p>
                          W Eliksirze Wiedźmina każdy slajd to historia. Nie znajdziesz tu przypadkowych filmików. Każdy element interfejsu, od TopBaru po system komentarzy, został zaprojektowany, aby celebrować treść. Jesteśmy rzemieślnikami kodu, wspierającymi rzemieślników obrazu.
                        </p>
                        <p className="font-bold text-stone-900">
                          Dołączając do zbiórki, stajesz się współzałożycielem ruchu. Nie kupujesz subskrypcji. Fundujesz wolność słowa i wolność tworzenia.
                        </p>
                        <button
                          onClick={() => setIsDescriptionExpanded(false)}
                          className="text-stone-400 font-bold uppercase tracking-widest text-xs py-4"
                        >
                          Zwiń opis
                        </button>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              {/* Discussion Section */}
              <section className="pt-20 border-t border-stone-200">
                 <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                       <MessageSquare size={24} />
                    </div>
                    <div>
                       <h4 className="text-3xl font-black tracking-tight">Dyskusja</h4>
                       <p className="text-stone-400 font-bold text-xs uppercase tracking-widest font-sans">Głos Społeczności</p>
                    </div>
                 </div>
                 <EmbeddedComments />
              </section>
           </article>
        </main>

        <footer className="bg-stone-900 text-white py-20 px-6">
           <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="text-center md:text-left space-y-4">
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter">Eliksir Wiedźmina</h2>
                 <p className="text-stone-500 text-sm font-sans max-w-xs leading-relaxed">
                   Budujemy standardy nowej generacji mediów społecznościowych. Autentycznie, niezależnie, bezkompromisowo.
                 </p>
              </div>
              <div className="flex gap-8 items-center">
                 <div className="flex gap-4">
                   <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"><Share2 size={20} /></a>
                   <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"><Heart size={20} /></a>
                 </div>
                 <div className="text-right hidden md:block">
                   <p className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-stone-500">Wszystkie prawa zastrzeżone</p>
                   <p className="text-xs font-bold text-stone-400">© 2024 Witcher&apos;s Elixir</p>
                 </div>
              </div>
           </div>
        </footer>

        {/* Modals & Utils */}
        <TippingModal />
        <ToastContainer />

        <AnimatePresence>
          {isLoginOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
               <motion.div
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="w-full max-w-md app-modal-glass rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col"
               >
                  <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
                      <h2 className="text-xl font-bold text-white tracking-tight">Logowanie</h2>
                      <button onClick={() => setIsLoginOpen(false)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 pb-8">
                    <LoginForm onLoginSuccess={() => setIsLoginOpen(false)} />
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
  );
}
