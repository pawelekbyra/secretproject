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
  ShieldCheck,
  Volume2,
  VolumeX,
  ChevronRight,
  X,
  Calendar,
  Zap,
  BookOpen,
  Trophy,
  History
} from "lucide-react";
import EmbeddedComments from "@/components/EmbeddedComments";
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import LocalVideoPlayer from '@/components/LocalVideoPlayer';
import TippingModal from '@/components/TippingModal';
import LoginForm from '@/components/LoginForm';
import { ToastContainer } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

const REWARDS = [
  {
    id: 1,
    amount: 50,
    title: "Early Bird",
    description: "Cyfrowe podziękowania, dostęp do zamkniętej bety oraz ekskluzywna odznaka profilowa.",
    delivery: "Wrzesień 2024",
    items: ["Dostęp do Bety", "Odznaka Profilowa", "Podziękowania"]
  },
  {
    id: 2,
    amount: 150,
    title: "Kolekcjoner",
    description: "Wszystko z poprzedniego progu + fizyczny artbook w twardej oprawie i cyfrowy soundtrack.",
    delivery: "Październik 2024",
    items: ["Wszystko z Early Bird", "Fizyczny Artbook", "Digital Soundtrack"]
  },
  {
    id: 3,
    amount: 500,
    title: "Współtwórca",
    description: "Twoje imię w napisach końcowych, ekskluzywny t-shirt oraz zaproszenie na zamknięty event online z twórcami.",
    delivery: "Grudzień 2024",
    items: ["Wszystko z Kolekcjonera", "T-shirt Crowdfundera", "Imię w napisach", "Spotkanie z twórcami"]
  }
];

const UPDATES = [
  {
    id: 1,
    date: "2 dni temu",
    title: "Projekt wystartował!",
    content: "Z ogromną radością ogłaszamy start kampanii Secret Project. Dziękujemy za pierwsze wpłaty i zaufanie! Nasz zespół pracuje teraz nad optymalizacją silnika renderującego, aby zapewnić Wam najlepsze doświadczenia.",
    author: "Robert Lewandowski"
  },
  {
    id: 2,
    date: "5 dni temu",
    title: "Pierwszy kamień milowy",
    content: "Osiągnęliśmy 25% celu w rekordowym czasie. To pokazuje, jak silna jest nasza społeczność. Planujemy wkrótce udostępnić pierwsze materiały zza kulis produkcji dla wspierających.",
    author: "Zespół Projektowy"
  }
];

export default function CrowdfundingPage() {
  useEffect(() => {
    // Override global overflow for this page
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'visible';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  const goalAmount = 50000;
  const raisedAmount = 32500;
  const progressPercent = (raisedAmount / goalAmount) * 100;
  const daysLeft = 14;

  const { openTippingModal, setIsMuted, isMuted, isPlaying, playVideo } = useStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'rewards' | 'updates' | 'comments'>('story');

  useEffect(() => {
    const handleOpenLogin = () => setIsLoginOpen(true);
    window.addEventListener('open-login', handleOpenLogin);
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

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-stone-900">
            Secret Project
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

      {/* Campaign Header */}
      <header className="relative pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none text-stone-900">
              Secret<br /><span className="text-primary">Project</span>.
            </h1>
            <p className="font-sans text-sm font-black uppercase tracking-[0.4em] text-stone-400">
              By Robert Lewandowski • Secret Project Team
            </p>
          </motion.div>

          <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl bg-stone-900">
            {featuredSlide ? (
              <>
                <LocalVideoPlayer slide={featuredSlide} isActive={true} />
                <div className="absolute bottom-6 right-6 z-30 flex gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <button
                      onClick={() => playVideo()}
                      className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl active:scale-90 transition-transform"
                    >
                      <Play size={32} fill="currentColor" className="ml-1" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/10 font-sans font-bold uppercase tracking-widest">
                Przygotowywanie wizji...
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-[3rem]" />
          </div>
        </div>
      </header>

      {/* Main Campaign Body */}
      <main className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-12 gap-12 lg:gap-20">

        {/* Left Column */}
        <div className="md:col-span-8 space-y-12">
          {/* Main Story Brief */}
          <section className="prose prose-stone prose-xl lg:prose-2xl max-w-none">
            <h2 className="text-4xl font-black uppercase tracking-tight mb-8">Nasza Opowieść</h2>
            <p className="first-letter:text-8xl first-letter:font-black first-letter:text-primary first-letter:mr-4 first-letter:float-left first-letter:mt-2">
              Secret Project to przełomowa inicjatywa, która ma na celu przedefiniowanie interakcji cyfrowej. W świecie zdominowanym przez algorytmy, stawiamy na ludzkie rzemiosło i autentyczną ekspresję. To nie jest tylko produkt; to manifest wolności tworzenia.
            </p>
          </section>

          {/* Tabs Navigation */}
          <div id="tabs-section" className="sticky top-20 z-40 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-stone-200 -mx-6 px-6">
            <div className="flex gap-8 overflow-x-auto pb-px no-scrollbar">
              {['story', 'rewards', 'updates', 'comments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "relative py-6 text-xs font-sans font-black uppercase tracking-[0.2em] transition-all",
                    activeTab === tab ? "text-primary scale-110" : "text-stone-400 hover:text-stone-600"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {tab === 'story' && <BookOpen size={14} />}
                    {tab === 'rewards' && <Trophy size={14} />}
                    {tab === 'updates' && <History size={14} />}
                    {tab === 'comments' && <MessageSquare size={14} />}
                    {tab === 'story' ? "Story" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                  {activeTab === tab && (
                    <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="min-h-[600px] py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {activeTab === 'story' && (
                  <div className="prose prose-stone prose-lg max-w-none">
                    <h3 className="text-3xl font-black uppercase tracking-tight">Dlaczego teraz?</h3>
                    <p>
                      Obecne platformy stały się zakładnikami wskaźników retencji. Treści są tworzone tak, aby uzależniać, a nie wzbogacać. My idziemy w przeciwnym kierunku. Budujemy przestrzeń, gdzie liczy się jakość, a nie częstotliwość. Gdzie twórca jest traktowany jak rzemieślnik, a nie dostawca treści dla maszyny.
                    </p>
                    <p>
                      Twoje wsparcie pozwoli nam sfinansować niezależną infrastrukturę streamingową. Chcemy być wolni od cenzury korporacyjnej i lagów, które zabijają immersję. Finansujemy serwery, które nie należą do gigantów Big Tech, lecz do nas — społeczności.
                    </p>
                    <div className="p-8 bg-stone-900 rounded-[2.5rem] my-12 text-white">
                       <p className="text-2xl font-bold italic mb-6">&quot;Tworzymy schronienie dla rzemiosła wideo w oceanie cyfrowego hałasu.&quot;</p>
                       <p className="text-primary font-black uppercase tracking-widest text-xs">— MANIFEST SECRET PROJECT</p>
                    </div>
                    <p>
                      Dołączając do zbiórki, stajesz się współzałożycielem ruchu. Nie kupujesz subskrypcji. Fundujesz wolność słowa i wolność tworzenia. Każda złotówka przybliża nas do świata, w którym technologia służy człowiekowi, a nie na odwrót.
                    </p>
                  </div>
                )}

                {activeTab === 'rewards' && (
                  <div className="grid gap-8">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-3xl font-black uppercase tracking-tight">Wybierz swój udział</h3>
                       <p className="text-stone-400 font-sans text-[10px] font-black uppercase tracking-widest">{REWARDS.length} DOSTĘPNE OPCJE</p>
                    </div>
                    {REWARDS.map((reward) => (
                      <div key={reward.id} className="group p-10 bg-white rounded-[3rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                          <div>
                            <p className="text-primary font-black text-3xl mb-1">PLN {reward.amount}</p>
                            <h4 className="text-2xl font-black text-stone-900 uppercase tracking-tight">{reward.title}</h4>
                          </div>
                          <Button
                            onClick={() => openTippingModal()}
                            className="rounded-full px-10 py-7 uppercase tracking-[0.2em] text-xs font-black bg-stone-900 hover:bg-primary transition-colors h-auto"
                          >
                            Wybierz ten próg
                          </Button>
                        </div>
                        <p className="text-stone-600 text-lg leading-relaxed mb-8">{reward.description}</p>
                        <div className="space-y-3 mb-8">
                           <p className="text-[10px] font-sans font-black uppercase tracking-widest text-stone-400">CO OTRZYMASZ:</p>
                           <ul className="grid md:grid-cols-2 gap-3">
                              {reward.items.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-stone-700 font-bold text-sm">
                                   <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                   {item}
                                </li>
                              ))}
                           </ul>
                        </div>
                        <div className="pt-6 border-t border-stone-50 flex items-center gap-2 text-stone-400 font-sans text-[10px] font-black uppercase tracking-widest">
                          <Calendar size={14} className="text-primary" />
                          PRZEWIDYWANA DOSTAWA: {reward.delivery}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'updates' && (
                  <div className="max-w-3xl mx-auto py-4">
                    <h3 className="text-3xl font-black uppercase tracking-tight mb-12">Dziennik Projektu</h3>
                    <div className="space-y-16">
                      {UPDATES.map((update) => (
                        <div key={update.id} className="relative pl-12">
                          <div className="absolute left-0 top-0 bottom-0 w-px bg-stone-200" />
                          <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20 shadow-lg shadow-primary/20" />
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                               <p className="text-[10px] font-sans font-black uppercase tracking-widest text-primary">{update.date}</p>
                               <span className="text-stone-200">•</span>
                               <p className="text-[10px] font-sans font-black uppercase tracking-widest text-stone-400">BY {update.author}</p>
                            </div>
                            <h4 className="text-3xl font-black text-stone-900 uppercase tracking-tight leading-tight">{update.title}</h4>
                            <p className="text-stone-600 text-lg leading-relaxed">{update.content}</p>
                            <button className="text-stone-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors">Czytaj więcej &rarr;</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-12">
                       <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                          <MessageSquare size={24} />
                       </div>
                       <div>
                          <h4 className="text-3xl font-black tracking-tight uppercase">Dyskusja</h4>
                          <p className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em] font-sans">Głos Społeczności</p>
                       </div>
                    </div>
                    <EmbeddedComments />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Sticky Sidebar */}
        <aside className="md:col-span-4 space-y-8">
          <div className="sticky top-32 space-y-6">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-stone-100">
              <div className="space-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-primary">ZEBRANO</p>
                  <p className="text-6xl font-black tracking-tighter">PLN {raisedAmount.toLocaleString()}</p>
                  <p className="text-stone-400 font-sans text-xs font-bold uppercase tracking-widest">CEL: PLN {goalAmount.toLocaleString()}</p>
                </div>

                <div className="space-y-4">
                  <div className="h-4 w-full bg-stone-50 rounded-full overflow-hidden border border-stone-100 p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                    </motion.div>
                  </div>
                  <div className="flex justify-between text-[10px] font-sans font-black uppercase tracking-tighter text-stone-400">
                    <span>{Math.round(progressPercent)}% SFINANSOWANE</span>
                    <span>{daysLeft} DNI DO KOŃCA</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-stone-50 rounded-3xl border border-stone-100 text-center group hover:bg-white hover:border-primary/20 transition-all">
                    <p className="text-3xl font-black">1.2k</p>
                    <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-stone-400">Wspierających</p>
                  </div>
                  <div className="p-5 bg-stone-50 rounded-3xl border border-stone-100 text-center group hover:bg-white hover:border-primary/20 transition-all">
                    <p className="text-3xl font-black">{daysLeft}</p>
                    <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-stone-400">Dni left</p>
                  </div>
                </div>

                <Button
                  onClick={() => openTippingModal()}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-24 rounded-[2.5rem] text-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all"
                >
                  Wesprzyj projekt.
                </Button>
              </div>
            </div>

            {/* Quick Rewards list in Sidebar */}
            <div className="space-y-4 pt-4">
               <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-stone-400 mb-4 ml-4">POLECANE NAGRODY</p>
               {REWARDS.slice(0, 2).map((reward) => (
                  <button
                    key={reward.id}
                    onClick={() => {
                        setActiveTab('rewards');
                        document.getElementById('tabs-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full text-left p-8 bg-white rounded-[2.5rem] border border-stone-100 hover:border-primary/40 hover:shadow-2xl transition-all group"
                  >
                     <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-black uppercase tracking-tight text-stone-900 group-hover:text-primary transition-colors">PLN {reward.amount}</h3>
                        <Zap size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <p className="text-[10px] font-sans font-black uppercase tracking-widest text-stone-400 mb-2">{reward.title}</p>
                     <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">{reward.description}</p>
                  </button>
               ))}
            </div>

            <div className="p-10 bg-stone-900 rounded-[3rem] text-white space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary">
                  <ShieldCheck size={24} />
                </div>
                <div>
                   <p className="text-sm font-bold tracking-tight">Bezpieczne płatności</p>
                   <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-500">Szyfrowanie SSL</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                  <Users size={24} />
                </div>
                <div>
                   <p className="text-sm font-bold tracking-tight">Aktywna społeczność</p>
                   <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-500">5,432 Wspierających</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-32 px-6 mt-32">
        <div className="max-w-6xl mx-auto">
           <div className="grid md:grid-cols-2 gap-20 items-center mb-20">
              <div className="space-y-6">
                 <h2 className="text-5xl font-black italic uppercase tracking-tighter">Secret Project.</h2>
                 <p className="text-stone-500 text-xl font-medium max-w-md leading-relaxed">
                   Budujemy standardy nowej generacji mediów społecznościowych. Autentycznie i bezkompromisowo.
                 </p>
              </div>
              <div className="flex flex-col md:items-end gap-8">
                 <p className="text-primary font-black uppercase tracking-widest text-sm italic">&quot;The future of video is human.&quot;</p>
                 <div className="flex gap-6">
                   <a href="#" className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all hover:scale-110"><Share2 size={24} /></a>
                   <a href="#" className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all hover:scale-110"><Heart size={24} /></a>
                 </div>
              </div>
           </div>
           <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-stone-600">Wszystkie prawa zastrzeżone © 2024 Secret Project</p>
              <div className="flex gap-10">
                 <a href="#" className="text-[10px] font-sans font-black uppercase tracking-widest text-stone-500 hover:text-white transition-colors">Prywatność</a>
                 <a href="#" className="text-[10px] font-sans font-black uppercase tracking-widest text-stone-500 hover:text-white transition-colors">Regulamin</a>
                 <a href="#" className="text-[10px] font-sans font-black uppercase tracking-widest text-stone-500 hover:text-white transition-colors">Kontakt</a>
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
              className="w-full max-w-md app-modal-glass rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
                <h2 className="text-xl font-bold text-white tracking-tight">Logowanie</h2>
                <button onClick={() => setIsLoginOpen(false)} className="p-2 text-white/60 hover:text-white rounded-full transition-colors">
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
