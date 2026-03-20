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
  X,
  MapPin,
  Award,
  Calendar,
  Zap
} from "lucide-react";
import Image from "next/image";
import EmbeddedComments from "@/components/EmbeddedComments";
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import LocalVideoPlayer from '@/components/LocalVideoPlayer';
import TippingModal from '@/components/TippingModal';
import LoginForm from '@/components/LoginForm';
import { ToastContainer } from '@/context/ToastContext';

const REWARDS = [
  {
    id: 1,
    title: "Uczeń",
    amount: 50,
    description: "Wsparcie bazowe, które daje Ci dostęp do zamkniętej bety aplikacji oraz specjalną odznakę na profilu.",
    items: ["Dostęp do Bety", "Odznaka Ucznia", "Newsletter dla fundatorów"],
    backers: 421
  },
  {
    id: 2,
    title: "Wiedźmin",
    amount: 150,
    description: "Dla tych, którzy chcą zanurzyć się głębiej. Otrzymasz unikalny zestaw filtrów wideo oraz dostęp do ekskluzywnych treści.",
    items: ["Wszystko z progu Uczeń", "Zestaw filtrów 'Eliksir'", "Dostęp do kanału Discord", "Early access do nowych funkcji"],
    backers: 189,
    popular: true
  },
  {
    id: 3,
    title: "Mistrz Eliksirów",
    amount: 500,
    description: "Najwyższy wyraz zaufania. Twoje imię zostanie uwiecznione w sekcji 'Fundatorzy' wewnątrz aplikacji na zawsze.",
    items: ["Wszystko z progu Wiedźmin", "Imię w napisach/sekcji Hall of Fame", "Limitowany T-shirt (fizyczny)", "Dożywotnia subskrypcja Premium"],
    backers: 45
  }
];

const UPDATES = [
  {
    id: 1,
    date: "12 Marca 2024",
    title: "Przekroczyliśmy 50% celu!",
    content: "Dzięki Waszemu niesamowitemu wsparciu, w zaledwie tydzień udało nam się zebrać połowę kwoty. To dowód na to, że rynek potrzebuje jakościowych treści.",
    author: "Robert"
  },
  {
    id: 2,
    date: "5 Marca 2024",
    title: "Pierwsze testy infrastruktury wideo",
    content: "Nasze serwery pomyślnie przeszły testy obciążeniowe. Jesteśmy gotowi na obsługę wysokiej jakości streamingu bez opóźnień.",
    author: "Zespół Techniczny"
  }
];

export default function CrowdfundingPage() {
  const goalAmount = 50000;
  const fundingAmount = 32500;
  const progressPercent = (fundingAmount / goalAmount) * 100;

  const { openTippingModal, setIsMuted, isMuted, isPlaying, playVideo } = useStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  useEffect(() => {
    const handleOpenLogin = () => setIsLoginOpen(true);
    window.addEventListener('open-login', handleOpenLogin);

    // Enable document-level scrolling for this page
    document.documentElement.classList.add('allow-document-scroll');
    document.body.classList.add('allow-document-scroll');

    playVideo();
    setIsMuted(true);

    return () => {
      window.removeEventListener('open-login', handleOpenLogin);
      document.documentElement.classList.remove('allow-document-scroll');
      document.body.classList.remove('allow-document-scroll');
    };
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
      <ToastContainer />
      <TippingModal />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-stone-900">
              Eliksir Wiedźmina
            </h1>
            <div className="hidden md:flex gap-6 font-sans text-[11px] font-bold uppercase tracking-widest text-stone-400">
              <a href="#opis" className="hover:text-primary transition-colors">Opis</a>
              <a href="#nagrody" className="hover:text-primary transition-colors">Nagrody</a>
              <a href="#aktualizacje" className="hover:text-primary transition-colors">Aktualizacje</a>
              <a href="#dyskusja" className="hover:text-primary transition-colors">Dyskusja</a>
            </div>
          </div>
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

      {/* Hero Section */}
      <header className="relative pt-20 bg-stone-900 min-h-[90vh] flex flex-col">
        <div className="absolute inset-0 z-0 opacity-60">
           {featuredSlide && (
              <LocalVideoPlayer slide={featuredSlide} isActive={true} />
           )}
           <div className="absolute inset-0 bg-gradient-to-b from-stone-900/20 via-stone-900/40 to-stone-900" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end max-w-7xl mx-auto w-full px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-4xl"
          >
            <div className="flex flex-wrap gap-4 items-center font-sans">
              <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                Wideo & Sztuka
              </span>
              <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
                <MapPin size={14} /> Warszawa, PL
              </div>
            </div>

            <h2 className="text-6xl md:text-[7rem] font-black italic uppercase tracking-tighter leading-[0.85] text-white">
              Budujemy<br /><span className="text-primary italic">Nowy Standard</span>.
            </h2>

            <div className="flex items-center gap-4 pt-4 border-t border-white/10 mt-8">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
                <Image src="https://i.pravatar.cc/150?u=robert" alt="Robert" width={48} height={48} />
              </div>
              <div className="font-sans">
                <p className="text-white font-bold text-sm">Robert Pawłowski</p>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Założyciel & Twórca</p>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Campaign Dashboard (Sticky Stats) */}
      <section className="sticky top-[72px] z-[50] bg-white border-b border-stone-200 py-6 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-8">
          <div className="flex-1 min-w-[300px] space-y-2">
            <div className="flex justify-between items-end font-sans">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tighter">PLN 32,500</span>
                <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">zabrane z 50,000 PLN</span>
              </div>
              <span className="text-primary font-black text-sm">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: `${progressPercent}%` }}
                 className="h-full bg-primary"
               />
            </div>
          </div>

          <div className="flex gap-12 font-sans">
            <div className="text-center md:text-left">
              <p className="text-xl font-black">1,240</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Wspierających</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xl font-black">14</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Dni do końca</p>
            </div>
          </div>

          <Button
            onClick={() => openTippingModal()}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-2xl font-sans font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
          >
            Wesprzyj Projekt.
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-12 gap-16">

        {/* Left Column: Details Staked Vertically */}
        <div className="lg:col-span-8 space-y-32">

           {/* Section: Story */}
           <section id="opis" className="scroll-mt-48">
              <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Target size={24} />
                  </div>
                  <div>
                      <h3 className="text-3xl font-black tracking-tight uppercase italic">Opis Projektu</h3>
                      <p className="text-stone-400 font-bold text-xs uppercase tracking-widest font-sans">Nasza Wizja i Cel</p>
                  </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="prose prose-stone prose-xl lg:prose-2xl max-w-none"
              >
                  <p className="first-letter:text-8xl first-letter:font-black first-letter:text-primary first-letter:mr-4 first-letter:float-left first-letter:mt-2">
                    Eliksir Wiedźmina to nie tylko kolejna aplikacja z wideo. To manifest przeciwko algorytmom, które promują płytkość i toksyczną uwagę. Wierzymy, że format krótkiego wideo zasługuje na drugą szansę — jako medium dla prawdziwego rzemiosła, pasji i autentyczności.
                  </p>
                  <p>
                    Obecne platformy stały się zakładnikami wskaźników retencji. Treści są tworzone tak, aby uzależniać, a nie wzbogacać. My idziemy w przeciwnym kierunku. Budujemy przestrzeń, gdzie liczy się jakość, a nie częstotliwość.
                  </p>
                  <Image
                    src="/metal.png"
                    alt="Wizja"
                    width={800}
                    height={400}
                    className="rounded-[2rem] my-12 grayscale hover:grayscale-0 transition-all duration-700"
                  />
                  <h3>Schronienie dla rzemiosła.</h3>
                  <p>
                    Twoje wsparcie pozwoli nam sfinansować niezależną infrastrukturę streamingową. Chcemy być wolni od cenzury korporacyjnej i lagów, które zabijają immersję. Finansujemy serwery, które nie należą do gigantów Big Tech, lecz do nas — społeczności.
                  </p>
                  <div className="bg-stone-50 border border-stone-100 p-10 rounded-[3rem] my-12 italic text-stone-600">
                    &quot;W Eliksirze Wiedźmina każdy slajd to historia. Nie znajdziesz tu przypadkowych filmików. Jesteśmy rzemieślnikami kodu, wspierającymi rzemieślników obrazu.&quot;
                  </div>
              </motion.div>
           </section>

           {/* Section: Rewards */}
           <section id="nagrody" className="scroll-mt-48">
              <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Award size={24} />
                  </div>
                  <div>
                      <h3 className="text-3xl font-black tracking-tight uppercase italic">Nagrody</h3>
                      <p className="text-stone-400 font-bold text-xs uppercase tracking-widest font-sans">Wybierz swój udział w projekcie</p>
                  </div>
              </div>
              <div className="grid gap-8">
                  {REWARDS.map((reward) => (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className={`group relative p-8 md:p-12 rounded-[3rem] border transition-all duration-500 ${
                        reward.popular ? 'bg-stone-900 text-white border-stone-800 shadow-2xl scale-[1.02]' : 'bg-white border-stone-100 hover:border-primary/20 shadow-sm'
                      }`}
                    >
                        {reward.popular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                            Najczęściej Wybierane
                          </div>
                        )}
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="space-y-6 flex-1">
                              <div className="space-y-2">
                                <p className={`font-sans text-[10px] font-black uppercase tracking-widest ${reward.popular ? 'text-primary' : 'text-stone-400'}`}>
                                  Próg wsparcia
                                </p>
                                <h4 className="text-4xl font-black italic tracking-tighter uppercase">{reward.title}</h4>
                              </div>
                              <p className={reward.popular ? 'text-stone-400' : 'text-stone-600'}>{reward.description}</p>
                              <ul className="space-y-3 font-sans text-xs font-bold">
                                {reward.items.map((item, i) => (
                                  <li key={i} className="flex items-center gap-3">
                                    <Award size={14} className="text-primary" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                          </div>
                          <div className="md:w-64 flex flex-col justify-between items-center md:items-end text-right gap-6">
                              <div className="space-y-1">
                                <p className="text-5xl font-black tracking-tighter">
                                  <span className="text-xl">PLN</span> {reward.amount}
                                </p>
                                <p className={`font-sans text-[10px] font-bold uppercase tracking-widest ${reward.popular ? 'text-white/20' : 'text-stone-300'}`}>
                                  {reward.backers} Wspierających
                                </p>
                              </div>
                              <Button
                                onClick={() => openTippingModal()}
                                className={`w-full md:w-auto px-8 py-6 rounded-2xl font-sans font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 ${
                                  reward.popular ? 'bg-primary text-white' : 'bg-stone-900 text-white'
                                }`}
                              >
                                Wybierz ten próg
                              </Button>
                          </div>
                        </div>
                    </motion.div>
                  ))}
              </div>
           </section>

           {/* Section: Updates */}
           <section id="aktualizacje" className="scroll-mt-48">
              <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Zap size={24} />
                  </div>
                  <div>
                      <h3 className="text-3xl font-black tracking-tight uppercase italic">Aktualizacje</h3>
                      <p className="text-stone-400 font-bold text-xs uppercase tracking-widest font-sans">Najnowsze wieści z frontu</p>
                  </div>
              </div>
              <div className="space-y-12">
                  {UPDATES.map((update) => (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="relative pl-12 border-l-2 border-stone-100 pb-12 last:pb-0"
                    >
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-primary" />
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 font-sans text-[10px] font-black uppercase tracking-widest text-stone-400">
                              <Calendar size={12} />
                              {update.date}
                              <span className="text-primary">— {update.author}</span>
                          </div>
                          <h4 className="text-3xl font-black tracking-tighter uppercase italic">{update.title}</h4>
                          <p className="text-lg text-stone-600 leading-relaxed">{update.content}</p>
                          <button className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline">
                              Czytaj więcej
                          </button>
                        </div>
                    </motion.div>
                  ))}
              </div>
           </section>

           {/* Section: Discussion */}
           <section id="dyskusja" className="scroll-mt-48">
              <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <MessageSquare size={24} />
                  </div>
                  <div>
                      <h3 className="text-3xl font-black tracking-tight uppercase italic">Głos Społeczności</h3>
                      <p className="text-stone-400 font-bold text-xs uppercase tracking-widest font-sans">Publiczna Dyskusja</p>
                  </div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <EmbeddedComments />
              </motion.div>
           </section>

        </div>

        {/* Right Column: Sidebar */}
        <aside className="lg:col-span-4">
           <div className="sticky top-48 space-y-8">
              {/* Creator Info */}
              <div className="bg-white border border-stone-100 rounded-[2.5rem] p-8 shadow-sm">
                 <h5 className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6">O Twórcy</h5>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-stone-50">
                       <Image src="https://i.pravatar.cc/150?u=robert" alt="Robert" width={64} height={64} />
                    </div>
                    <div>
                       <p className="text-xl font-black tracking-tight">Robert Pawłowski</p>
                       <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary">Ostatnio widziany: Teraz</p>
                    </div>
                 </div>
                 <p className="text-sm text-stone-500 mb-6 font-sans leading-relaxed">
                    Niezależny programista i artysta wideo. Przez ostatnie 5 lat budowałem systemy dla największych domów produkcyjnych w Europie. Teraz buduję własną wizję.
                 </p>
                 <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl font-sans text-[10px] font-black uppercase tracking-widest h-12">Kontakt</Button>
                    <Button variant="outline" className="flex-1 rounded-xl font-sans text-[10px] font-black uppercase tracking-widest h-12">Portfolio</Button>
                 </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white space-y-6">
                 <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl text-primary">
                       <ShieldCheck size={24} />
                    </div>
                    <div>
                       <p className="font-bold text-sm tracking-tight">Gwarancja Bezpieczeństwa</p>
                       <p className="text-[10px] text-white/40 font-sans font-medium mt-1">Środki są zabezpieczone przez system Stripe i zostaną wypłacone dopiero po osiągnięciu progu.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl text-blue-400">
                       <Zap size={24} />
                    </div>
                    <div>
                       <p className="font-bold text-sm tracking-tight">Szybki Start</p>
                       <p className="text-[10px] text-white/40 font-sans font-medium mt-1">Infrastruktura jest już w 70% gotowa. Twoje wsparcie przyspieszy premierę o 3 miesiące.</p>
                    </div>
                 </div>
              </div>

              {/* Share */}
              <div className="text-center space-y-4">
                 <p className="font-sans text-[10px] font-black uppercase tracking-widest text-stone-400">Podziel się wizją</p>
                 <div className="flex justify-center gap-4">
                    <a href="#" className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-primary hover:border-primary transition-all"><Share2 size={18} /></a>
                    <a href="#" className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-primary hover:border-primary transition-all"><Heart size={18} /></a>
                 </div>
              </div>
           </div>
        </aside>

      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="col-span-2 space-y-8">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Eliksir Wiedźmina</h2>
            <p className="text-stone-500 font-sans max-w-sm text-lg leading-relaxed">
              Tworzymy nową erę konsumpcji mediów. Skupioną, estetyczną i przede wszystkim — ludzką. Dołącz do rewolucji rzemiosła.
            </p>
          </div>
          <div className="space-y-6">
             <p className="font-sans text-[10px] font-black uppercase tracking-widest text-primary">Nawigacja</p>
             <ul className="space-y-4 font-sans text-sm font-bold text-stone-400">
                <li><a href="#" className="hover:text-white transition-colors">Strona Główna</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kampania</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Zasady</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
             </ul>
          </div>
          <div className="space-y-6">
             <p className="font-sans text-[10px] font-black uppercase tracking-widest text-primary">Kontakt</p>
             <ul className="space-y-4 font-sans text-sm font-bold text-stone-400">
                <li>kontakt@eliksir-wiedzmina.pl</li>
                <li>Press Kit</li>
                <li>Social Media</li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 font-sans text-[10px] font-black uppercase tracking-widest text-stone-600">
           <p>© 2024 Eliksir Wiedźmina. Wszelkie prawa zastrzeżone.</p>
           <div className="flex gap-8">
              <a href="#">Polityka Prywatności</a>
              <a href="#">Regulamin</a>
           </div>
        </div>
      </footer>

      {/* Login Modal */}
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
