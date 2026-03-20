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
  X
} from "lucide-react";
import Image from "next/image";
import EmbeddedComments from "@/components/EmbeddedComments";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Pagination, Keyboard } from 'swiper/modules';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import LocalVideoPlayer from '@/components/LocalVideoPlayer';
import TippingModal from '@/components/TippingModal';
import LoginForm from '@/components/LoginForm';
import { ToastContainer } from '@/context/ToastContext';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/mousewheel';

export default function CrowdfundingPage() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const goalAmount = 50000;
  const fundingAmount = 32500;
  const progressPercent = (fundingAmount / goalAmount) * 100;

  const { openTippingModal, setActiveModal } = useStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const handleOpenLogin = () => setIsLoginOpen(true);
    window.addEventListener('open-login', handleOpenLogin);
    return () => window.removeEventListener('open-login', handleOpenLogin);
  }, []);

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
      <div className="h-screen w-screen bg-[#FDFBF7] text-stone-900 font-serif overflow-hidden select-none">

        {/* Floating CTA to the App */}
        <div className="fixed top-6 right-6 z-[100] flex gap-3">
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            <Button
              onClick={() => setIsLoginOpen(true)}
              variant="outline"
              className="bg-white/80 backdrop-blur-md border-stone-200 text-stone-900 px-6 py-6 rounded-full font-sans font-bold text-sm tracking-widest uppercase shadow-xl hover:bg-white"
            >
              Zaloguj.
            </Button>
          </motion.div>
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, type: "spring" }}
          >
            <Button
              onClick={() => window.location.href = '/tingtong'}
              className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-6 rounded-full font-sans font-bold text-sm tracking-widest uppercase shadow-2xl group border border-white/10"
            >
              Aplikacja.
              <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>

        <Swiper
          direction={'vertical'}
          slidesPerView={1}
          spaceBetween={0}
          mousewheel={true}
          keyboard={true}
          onSlideChange={(swiper) => setActiveSlideIndex(swiper.activeIndex)}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          modules={[Mousewheel, Pagination, Keyboard]}
          className="h-full w-full"
        >
          {/* SLIDE 1: MASTHEAD */}
          <SwiperSlide>
            <section className="h-full w-full flex flex-col items-center justify-center p-6 text-center relative">
              <div className="max-w-4xl mx-auto space-y-8">
                <motion.div
                   initial={{ opacity: 0, scale: 0.9 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.8 }}
                >
                  <p className="font-sans text-xs font-black uppercase tracking-[0.4em] text-primary mb-4">Kampania Crowdfundingowa</p>
                  <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none border-b-8 border-primary pb-4 mb-8">
                    Eliksir<br />Wiedźmina
                  </h1>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed text-stone-600 italic"
                >
                  &quot;Budujemy schronienie dla autentyczności w oceanie cyfrowego hałasu. Dołącz do nas i stań się częścią rewolucji, która przywróci sens krótkim formom wideo.&quot;
                </motion.p>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="pt-12 flex flex-col items-center gap-2 text-stone-400"
                >
                  <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Przesuń, aby poznać wizję</span>
                  <ArrowDown size={20} />
                </motion.div>
              </div>

              {/* Decorative Newspaper Elements */}
              <div className="absolute top-12 left-12 font-sans text-[10px] font-black uppercase tracking-widest text-stone-300 hidden md:block">
                Wydanie Specjalne • No. 001
              </div>
              <div className="absolute bottom-12 right-12 font-sans text-[10px] font-black uppercase tracking-widest text-stone-300 hidden md:block">
                Warszawa, 2024
              </div>
            </section>
          </SwiperSlide>

          {/* SLIDE 2: MANIFESTO */}
          <SwiperSlide>
            <section className="h-full w-full bg-[#FDFBF7] flex items-center justify-center p-6 md:p-24 relative overflow-hidden">
               <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

               <div className="max-w-6xl w-full grid md:grid-cols-12 gap-12 md:gap-24 items-center">
                  <div className="md:col-span-7 space-y-8">
                    <div className="space-y-4">
                      <p className="font-sans text-xs font-black uppercase tracking-[0.3em] text-primary">Fundamenty</p>
                      <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tight leading-[0.9] text-stone-900">
                        Nasz<br />Manifest.
                      </h2>
                    </div>
                    <div className="prose prose-stone prose-2xl">
                      <p className="text-2xl md:text-3xl leading-snug text-stone-800 font-bold tracking-tight">
                        Wierzymy, że technologia powinna służyć człowiekowi, a nie na odwrót.
                      </p>
                      <p className="text-lg md:text-xl leading-relaxed text-stone-600">
                        Eliksir Wiedźmina powstał z buntu przeciwko algorytmom promującym bylejakość. Chcemy stworzyć cyfrową agorę, gdzie rzemiosło wideo odzyskuje swój blask, a uwaga widza jest walutą o najwyższej wartości.
                      </p>
                    </div>
                    <div className="flex gap-12 pt-8">
                       <div className="space-y-1">
                          <p className="text-4xl font-black text-primary italic tracking-tighter">100%</p>
                          <p className="text-[10px] font-sans font-black uppercase tracking-widest text-stone-400">Niezależności</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-4xl font-black text-stone-900 italic tracking-tighter">∞</p>
                          <p className="text-[10px] font-sans font-black uppercase tracking-widest text-stone-400">Potencjału</p>
                       </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 relative hidden md:block">
                     <div className="aspect-[4/5] bg-stone-200 rounded-[3rem] overflow-hidden shadow-3xl transform rotate-3 border-[12px] border-white relative group">
                        <Image
                          src="/samagitara.jpg"
                          alt="Manifest Visual"
                          fill
                          className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
                     </div>
                     <div className="absolute -top-12 -right-12 w-48 h-48 bg-stone-900 rounded-full flex items-center justify-center text-white shadow-2xl animate-spin-slow">
                        <div className="text-center">
                           <p className="text-[10px] font-sans font-black uppercase tracking-[0.2em] mb-1">Dołącz do</p>
                           <p className="text-2xl font-black italic tracking-tighter">Ruchu</p>
                        </div>
                     </div>
                  </div>
               </div>
            </section>
          </SwiperSlide>

          {/* SLIDE 3: THE VIDEO */}
          <SwiperSlide>
            <section className="h-full w-full flex flex-col items-center justify-center p-6 md:p-12 space-y-8">
              <div className="max-w-5xl w-full text-center mb-8">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">Zobacz <span className="text-primary italic">Czym</span> Jesteśmy.</h2>
              </div>

              <div className="max-w-5xl w-full relative group">
                <motion.div
                  className="aspect-video bg-stone-900 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative border-4 md:border-8 border-white group"
                >
                  {featuredSlide ? (
                    <LocalVideoPlayer
                      slide={featuredSlide}
                      isActive={activeSlideIndex === 2}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 font-sans font-bold uppercase tracking-widest">
                       Ładowanie podglądu...
                    </div>
                  )}

                  {/* Overlay for Tingtong feel but on landing */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </motion.div>

                {/* Video Caption */}
                <div className="absolute -bottom-16 left-12 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
                  {featuredSlide?.data?.title || 'Nasza najnowsza produkcja'} • {featuredSlide?.username}
                </div>
              </div>
            </section>
          </SwiperSlide>

          {/* SLIDE 4: PROGRESS & IMPACT */}
          <SwiperSlide>
            <section className="h-full w-full bg-stone-900 text-white flex items-center justify-center p-12 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />

              <div className="max-w-4xl w-full grid md:grid-cols-2 gap-16 relative z-10">
                <div className="space-y-8">
                   <h2 className="text-6xl font-black uppercase tracking-tighter leading-none">
                     Finansujemy<br /><span className="text-primary italic">Przyszłość</span>.
                   </h2>
                   <p className="text-xl text-stone-400 leading-relaxed italic">
                     Cel: 50 000 PLN na infrastrukturę streamingową bez lagów i cenzury.
                   </p>

                   <div className="space-y-4 pt-12">
                      <div className="flex justify-between items-end">
                        <p className="text-sm font-sans font-black uppercase tracking-widest text-primary">Zebrano</p>
                        <p className="text-5xl font-black">PLN 32,500</p>
                      </div>
                      <div className="h-6 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                         <motion.div
                           initial={{ width: 0 }}
                           whileInView={{ width: `${progressPercent}%` }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                           className="h-full bg-primary rounded-full relative"
                         >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                         </motion.div>
                      </div>
                      <div className="flex justify-between text-[10px] font-sans font-bold uppercase tracking-widest text-stone-500">
                        <span>0 PLN</span>
                        <span>{Math.round(progressPercent)}% celu</span>
                        <span>50,000 PLN</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 space-y-12">
                   <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0">
                         <ShieldCheck size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Bezpieczeństwo</h3>
                        <p className="text-stone-400 text-sm leading-relaxed">Twoje dane są u nas bezpieczne. Używamy standardów bankowych.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
                         <Users size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Prawa Autorskie</h3>
                        <p className="text-stone-400 text-sm leading-relaxed">Wspierasz system, w którym twórca zachowuje 100% praw do treści.</p>
                      </div>
                   </div>

                   <Button
                    onClick={() => openTippingModal()}
                    className="w-full bg-primary hover:bg-primary/90 text-white h-20 rounded-2xl text-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all"
                   >
                     Wesprzyj Teraz
                   </Button>
                </div>
              </div>
            </section>
          </SwiperSlide>

          {/* SLIDE 5: DISCUSSION */}
          <SwiperSlide>
            <section className="h-full w-full flex flex-col items-center pt-24 p-6 md:p-12 overflow-y-auto bg-[#FDFBF7] custom-scrollbar">
              <div className="max-w-3xl w-full mb-16 text-center">
                 <p className="font-sans text-xs font-black uppercase tracking-widest text-primary mb-4">Głos Społeczności</p>
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-8">Wspólnie <span className="text-stone-400">Decydujemy</span>.</h2>
                 <p className="text-xl text-stone-600 leading-relaxed italic">Zostaw po sobie ślad. Twoja opinia kształtuje fundamenty Eliksiru Wiedźmina.</p>
              </div>

              <div className="max-w-3xl w-full pb-32">
                <EmbeddedComments />
              </div>

              {/* Footer inside the last slide */}
              <footer className="w-full max-w-5xl mx-auto border-t border-stone-200 py-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-50">
                 <p className="font-black italic uppercase tracking-tighter text-stone-900">Eliksir Wiedźmina</p>
                 <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-stone-400">© 2024 Witcher&apos;s Elixir. Wszystkie prawa zastrzeżone.</p>
                 <div className="flex gap-6 text-stone-400">
                    <Share2 size={20} className="hover:text-primary transition-colors cursor-pointer" />
                    <Heart size={20} className="hover:text-primary transition-colors cursor-pointer" />
                 </div>
              </footer>
            </section>
          </SwiperSlide>

        </Swiper>

        {/* Modals & Utils */}
        <TippingModal />
        <ToastContainer />

        <AnimatePresence>
          {isLoginOpen && (
            <div className="fixed inset-0 z-[10300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
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

        {/* Custom Global Scrollbar Styles */}
        <style jsx global>{`
          .swiper-pagination-bullet {
            background: #1c1917;
            width: 6px;
            height: 6px;
            transition: all 0.3s ease;
          }
          .swiper-pagination-bullet-active {
            background: hsl(345, 80%, 40%) !important;
            height: 24px;
            border-radius: 4px;
          }
          .prose p {
            margin-bottom: 1.5rem;
          }
        `}</style>
      </div>
  );
}
