"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Share2,
  Heart,
  X
} from "lucide-react";
import EmbeddedComments from "@/components/EmbeddedComments";
import { useQuery } from '@tanstack/react-query';
import TippingModal from '@/components/TippingModal';
import LoginForm from '@/components/LoginForm';
import { ToastContainer } from '@/context/ToastContext';

// Import New Crowdfunding Components
import { CrowdfundingNavbar } from "@/components/crowdfunding/CrowdfundingNavbar";
import { CampaignHero } from "@/components/crowdfunding/CampaignHero";
import { CampaignStats } from "@/components/crowdfunding/CampaignStats";
import { CampaignStory } from "@/components/crowdfunding/CampaignStory";
import { RewardTierCard } from "@/components/crowdfunding/RewardTierCard";

export default function CrowdfundingPage() {
  const goalAmount = 150000;
  const fundingAmount = 89420;
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

  const rewardTiers = [
    {
      pledgeAmount: 100,
      description: "<strong>Księga Receptur.</strong> Otrzymasz ekskluzywny cyfrowy podręcznik tworzenia treści 'Eliksir'. Ponadto, Twój profil zyska unikalną obwódkę Czeladnika.",
      endMonth: "Październik",
      endYear: "2024",
      itemLimit: 500,
      backersCount: 215
    },
    {
      pledgeAmount: 500,
      description: "<strong>Amulet Cechu.</strong> Limitowana edycja fizycznego medalionu Polutek, dostęp do wersji beta nowych narzędzi AI oraz zestawu filtrów 'Cinematic Ritual'.",
      endMonth: "Listopad",
      endYear: "2024",
      itemLimit: 100,
      backersCount: 88
    },
    {
      pledgeAmount: 2500,
      description: "<strong>Zbroja Mistrza.</strong> Dożywotni status 'Master Patron', zaproszenie na zamknięte spotkanie z twórcami w Warszawie oraz wpływ na kierunki rozwoju algorytmu.",
      endMonth: "Grudzień",
      endYear: "2024",
      itemLimit: 25,
      backersCount: 14
    }
  ];

  return (
    <div className="min-h-screen bg-white text-stone-900 font-serif selection:bg-primary/10 selection:text-primary overflow-x-hidden">

      <CrowdfundingNavbar
        onLoginClick={() => setIsLoginOpen(true)}
        title="Eliksir Wiedźmina"
      />

      <CampaignHero
        slide={featuredSlide}
        title="Rytuał Finansowania"
      />

      <main className="max-w-6xl mx-auto px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative z-30">

        {/* Left Column: Story & Discussions (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-24 order-2 lg:order-1">

          <CampaignStory
            title="Rytuał Przemiany."
            quote="To, co zaczęło się jako wizja rzemiosła, musi przejść przez próbę ognia."
            firstParagraph="Eliksir Wiedźmina to nie tylko kolejna aplikacja z wideo. To manifest przeciwko algorytmom, które promują płytkość i toksyczną uwagę. Wierzymy, że format krótkiego wideo zasługuje na drugą szansę — jako medium dla prawdziwego rzemiosła, pasji i autentyczności. W świecie zdominowanym przez gigantów, my wybieramy ścieżkę samotnego łowcy jakości."
            hiddenContent={
              <div className="space-y-8 text-stone-700">
                <p>
                  Fundatorzy CD PROJEKT RED wiedzieli, że wielkość wymaga poświęcenia. Nasz Rytuał jest podobny — odcinamy się od bezpiecznych, korporacyjnych wzorców. Budujemy przestrzeń, gdzie liczy się jakość, a nie częstotliwość. Gdzie twórca jest traktowany jak rzemieślnik, a nie dostawca treści dla maszyny, która nie zna litości.
                </p>
                <p>
                  Twoje wsparcie pozwoli nam sfinansować niezależną infrastrukturę streamingową. Chcemy być wolni od cenzury korporacyjnej i lagów, które zabijają immersję. To nasza Próba Traw — tylko najsilniejsze i najbardziej autentyczne treści przetrwają w naszym ekosystemie. Finansujemy serwery, które nie należą do gigantów Big Tech, lecz do nas — społeczności rzemieślników.
                </p>
                <p>
                  W Eliksirze Wiedźmina każdy slajd to historia. Nie znajdziesz tu przypadkowych filmików. Każdy element interfejsu, od TopBaru po system komentarzy, został zaprojektowany, aby celebrować treść. Jesteśmy rzemieślnikami kodu, wspierającymi rzemieślników obrazu w ich najbardziej mrocznych i genialnych wizjach.
                </p>
                <p className="font-bold text-stone-900 border-l-4 border-primary pl-6">
                  Dołączając do zbiórki, stajesz się współzałożycielem ruchu. Nie kupujesz subskrypcji. Fundujesz wolność słowa, wolność tworzenia i przetrwanie rzemiosła w cyfrowym lesie pełnym potworów.
                </p>
              </div>
            }
          />

          {/* Reward Tiers - Mobile Only (Visible when lg:hidden) */}
          <div className="lg:hidden space-y-8">
            <h4 className="text-3xl font-black uppercase tracking-tight text-stone-900">Wybierz Nagrodę</h4>
            <div className="space-y-6">
              {rewardTiers.map((tier, idx) => (
                <RewardTierCard key={idx} {...tier} />
              ))}
            </div>
          </div>

          <section className="pt-20 border-t border-stone-100">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                <MessageSquare size={24} />
              </div>
              <div>
                <h4 className="text-3xl font-black tracking-tight text-stone-900">Dyskusja</h4>
                <p className="text-stone-400 font-bold text-xs uppercase tracking-widest font-sans">Głos Społeczności</p>
              </div>
            </div>
            <EmbeddedComments />
          </section>
        </div>

        {/* Right Column: Stats & Rewards (lg:col-span-4) - Hidden on Mobile (Sticky on Desktop) */}
        <aside className="lg:col-span-4 space-y-12 order-1 lg:order-2">
          <CampaignStats
            fundingAmount={fundingAmount}
            goalAmount={goalAmount}
            backersCount={2415}
            daysRemaining={12}
          />

          {/* Reward Tiers - Desktop Only */}
          <div className="hidden lg:block space-y-8 pt-8">
            <h4 className="text-sm font-sans font-black uppercase tracking-[0.2em] text-stone-400 px-4">Nagrody za wsparcie</h4>
            <div className="space-y-8">
              {rewardTiers.map((tier, idx) => (
                <RewardTierCard key={idx} {...tier} />
              ))}
            </div>
          </div>
        </aside>

      </main>

      <footer className="bg-black text-white py-24 px-6 relative z-30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="text-center md:text-left space-y-6">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Eliksir Wiedźmina</h2>
            <p className="text-stone-500 text-sm font-sans max-w-xs leading-relaxed font-bold">
              Budujemy standardy nowej generacji mediów społecznościowych. Autentycznie, niezależnie, bezkompromisowo.
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-8">
            <div className="flex gap-4">
              <a href="#" className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all hover:scale-110"><Share2 size={24} /></a>
              <a href="#" className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all hover:scale-110"><Heart size={24} /></a>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-stone-600">Wszystkie prawa zastrzeżone</p>
              <p className="text-xs font-bold text-stone-400 mt-1">© 2024 Witcher&apos;s Elixir</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Utils */}
      <TippingModal />
      <ToastContainer />

      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-stone-100"
            >
              <div className="flex items-center justify-between p-8 border-b border-stone-50 bg-stone-50/50">
                <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase italic">Logowanie</h2>
                <button
                  onClick={() => setIsLoginOpen(false)}
                  className="p-3 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>
              <div className="p-8 pb-10">
                <LoginForm onLoginSuccess={() => setIsLoginOpen(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
