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
import { cn } from "@/lib/utils";

export default function CrowdfundingPage() {
  const goalAmount = 50000;
  const fundingAmount = 32500;
  const backersCount = 1240;
  const daysLeft = 14;
  const progressPercent = (fundingAmount / goalAmount) * 100;

  const { openTippingModal, setIsMuted, isMuted, isPlaying, playVideo } = useStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('story');

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

  const rewards = [
    {
      amount: 50,
      title: "BRONZE SUPPORTER",
      description: "Get early access to our platform and a digital badge.",
      delivery: "Oct 2024"
    },
    {
      amount: 150,
      title: "SILVER CRAFTSMAN",
      description: "All Bronze perks plus exclusive 'Behind the Scenes' content.",
      delivery: "Oct 2024"
    },
    {
      amount: 500,
      title: "GOLD FOUNDER",
      description: "Personalized 'Thank You' in credits and limited edition physical gift.",
      delivery: "Nov 2024"
    }
  ];

  const updates = [
    {
      date: "May 20, 2024",
      title: "UI Prototypes Completed",
      content: "We have finished the initial design phase and are moving to core infrastructure development."
    },
    {
      date: "May 10, 2024",
      title: "Campaign Launch!",
      content: "Secret Project is officially live. Thank you for the incredible initial support!"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">

      {/* TopBar - Strictly Black */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black text-white px-6 h-16 flex items-center shadow-md">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <h1 className="text-xl font-black italic uppercase tracking-tighter">
            SECRET PROJECT
          </h1>
          <div className="flex gap-6 items-center">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              Sign In.
            </button>
            <Button
              onClick={() => window.location.href = '/tingtong'}
              className="bg-white hover:bg-slate-100 text-black px-5 py-2 rounded-full font-bold text-xs tracking-widest uppercase transition-all"
            >
              APP.
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 text-center md:text-left">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight">
              Secret <span className="text-[#0070F3]">Project</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm mt-2">Next-Gen Vertical Video Platform</p>
          </header>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Media Block (Left) */}
            <div className="lg:col-span-8 bg-slate-100 rounded-[2.5rem] overflow-hidden aspect-video relative group shadow-2xl border border-slate-100">
               {featuredSlide ? (
                  <LocalVideoPlayer slide={featuredSlide} isActive={true} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">
                    Loading Vision...
                  </div>
                )}
                <div className="absolute bottom-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button
                     onClick={() => setIsMuted(!isMuted)}
                     className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all shadow-xl"
                   >
                     {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                   </button>
                </div>
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                       <button
                         onClick={() => playVideo()}
                         className="w-20 h-20 bg-[#0070F3] rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 active:scale-90 transition-transform"
                       >
                         <Play size={32} fill="currentColor" className="ml-1" />
                       </button>
                    </div>
                )}
            </div>

            {/* Summary Card (Right) */}
            <div className="lg:col-span-4 space-y-6">
               <div className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-10 bg-white space-y-8">
                    <div className="space-y-2">
                      <p className="text-sm font-black uppercase tracking-widest text-[#0070F3]">Campaign Status</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tighter">PLN {fundingAmount.toLocaleString()}</span>
                        <span className="text-slate-400 font-bold text-sm uppercase">Raised</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                       <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0070F3]"
                            style={{ width: `${progressPercent}%` }}
                          />
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter text-slate-500">
                          <span>{Math.round(progressPercent)}% FUNDED</span>
                          <span>GOAL: {goalAmount.toLocaleString()} PLN</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 transition-colors hover:bg-slate-100">
                          <p className="text-3xl font-black tracking-tight">{backersCount.toLocaleString()}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Users size={12} /> Backers
                          </p>
                       </div>
                       <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 transition-colors hover:bg-slate-100">
                          <p className="text-3xl font-black tracking-tight">{daysLeft}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Calendar size={12} /> Days Left
                          </p>
                       </div>
                    </div>

                    <Button
                      onClick={() => openTippingModal()}
                      className="w-full bg-[#0070F3] hover:bg-blue-600 text-white h-20 rounded-3xl text-xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all"
                    >
                      Back Campaign
                    </Button>
               </div>

               <div className="flex items-center gap-4 px-8 py-6 bg-slate-900 rounded-[2rem] text-white">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">Secure Payment</p>
                    <p className="text-sm font-bold">Encrypted via Stripe</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <main className="max-w-7xl mx-auto px-6 pb-32">
        <div className="border-b border-slate-100 mb-12">
          <div className="flex gap-12">
            {['story', 'rewards', 'updates', 'discussion'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "h-16 text-sm font-black uppercase tracking-widest relative transition-colors",
                  activeTab === tab ? "text-[#0070F3]" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#0070F3]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'story' && (
            <motion.div
              key="story"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-12 gap-16 mt-12"
            >
               <article className="md:col-span-8 space-y-12">
                  <div className="space-y-6">
                    <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.85] text-slate-900">
                      Our <br /><span className="text-[#0070F3]">Manifesto.</span>
                    </h3>
                    <p className="text-2xl md:text-3xl leading-snug text-slate-800 font-bold tracking-tight italic border-l-4 border-[#0070F3] pl-8">
                      &quot;Reclaiming the art of video in a world of algorithmic noise.&quot;
                    </p>
                  </div>

                  <div className="prose prose-slate prose-xl max-w-none text-slate-600 leading-relaxed">
                    <p className="first-letter:text-8xl first-letter:font-black first-letter:text-[#0070F3] first-letter:mr-4 first-letter:float-left first-letter:mt-2">
                      Secret Project is more than just another video app. It is a rebellion against platforms that prioritize shallow engagement over depth. We believe short-form video deserves a second chance — as a medium for genuine craftsmanship, passion, and authenticity.
                    </p>
                    <p>
                      Current platforms have become hostages to retention metrics. Content is designed to addict, not enrich. We are moving in the opposite direction. We are building a space where quality matters more than frequency. Where creators are treated as artisans, not just data providers for a machine.
                    </p>
                    <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 pt-8">The Vision.</h4>
                    <p>
                      Your support will allow us to fund independent streaming infrastructure. We want to be free from corporate censorship and the technical lag that kills immersion. We are funding servers that belong to us — the community.
                    </p>
                    <p className="font-bold text-slate-900">
                      By joining this campaign, you become a co-founder of a movement. You aren&apos;t just buying a subscription; you are funding the freedom of expression and the freedom to create.
                    </p>
                  </div>
               </article>
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-12 grid md:grid-cols-3 gap-8"
            >
                {rewards.map((reward, i) => (
                  <div key={i} className="rounded-[2.5rem] border-2 border-slate-50 hover:border-blue-100 transition-all hover:shadow-xl group bg-white p-10 space-y-6">
                       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0070F3] group-hover:bg-[#0070F3] group-hover:text-white transition-colors">
                          <Zap size={32} />
                       </div>
                       <div className="space-y-2">
                          <p className="text-sm font-black text-[#0070F3] uppercase tracking-widest">Pledge PLN {reward.amount} or more</p>
                          <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">{reward.title}</h4>
                       </div>
                       <p className="text-slate-500 font-medium leading-relaxed">{reward.description}</p>
                       <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated Delivery</span>
                          <span className="text-xs font-bold">{reward.delivery}</span>
                       </div>
                       <Button
                        onClick={() => openTippingModal()}
                        className="w-full bg-slate-900 text-white rounded-2xl h-14 font-black uppercase tracking-widest hover:bg-[#0070F3] transition-all"
                       >
                         Select Reward
                       </Button>
                  </div>
                ))}
            </motion.div>
          )}

          {activeTab === 'updates' && (
            <motion.div
              key="updates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-12 max-w-4xl space-y-12"
            >
                {updates.map((update, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="flex flex-col items-center">
                       <div className="w-4 h-4 rounded-full bg-[#0070F3] ring-8 ring-blue-50" />
                       <div className="w-0.5 flex-1 bg-slate-100 group-last:bg-transparent mt-4" />
                    </div>
                    <div className="pb-12 space-y-4">
                       <span className="text-xs font-black uppercase tracking-widest text-slate-400">{update.date}</span>
                       <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-tight text-slate-900">{update.title}</h4>
                       <p className="text-lg text-slate-600 leading-relaxed">{update.content}</p>
                    </div>
                  </div>
                ))}
            </motion.div>
          )}

          {activeTab === 'discussion' && (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-12"
            >
                <div className="flex items-center gap-6 mb-16">
                  <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-[#0070F3]">
                    <MessageSquare size={32} />
                  </div>
                  <div>
                    <h4 className="text-4xl font-black italic uppercase tracking-tighter">Community</h4>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-1">Join the Conversation</p>
                  </div>
                </div>
                <EmbeddedComments />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-24 px-6">
         <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-16">
            <div className="md:col-span-6 space-y-8 text-center md:text-left">
               <h2 className="text-3xl font-black italic uppercase tracking-tighter">SECRET PROJECT</h2>
               <p className="text-slate-500 text-lg font-medium max-w-md leading-relaxed">
                 Building the gold standard for next-generation social media. Authentic, independent, uncompromising.
               </p>
               <div className="flex gap-4 justify-center md:justify-start">
                  <a href="#" className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#0070F3] hover:border-blue-100 transition-all shadow-sm">
                    <Share2 size={20} />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-pink-500 hover:border-pink-100 transition-all shadow-sm">
                    <Heart size={20} />
                  </a>
               </div>
            </div>
            <div className="md:col-span-6 flex flex-col items-center md:items-end justify-between py-2">
               <div className="text-center md:text-right space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">All rights reserved</p>
                 <p className="text-sm font-bold text-slate-900">© 2024 Secret Project Studio</p>
               </div>
               <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                  <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                  <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
               </div>
            </div>
         </div>
      </footer>

      <TippingModal />
      <ToastContainer />

      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
             >
                <div className="flex items-center justify-between p-8 border-b border-slate-50 bg-slate-50/50">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Sign In</h2>
                    <button onClick={() => setIsLoginOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} />
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
