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

export default function CrowdfundingPage() {
  const goalAmount = 50000;
  const fundingAmount = 32500;
  const backersCount = 1240;
  const daysLeft = 14;
  const progressPercent = (fundingAmount / goalAmount) * 100;

  const { openTippingModal, setIsMuted, isMuted, isPlaying, playVideo } = useStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const handleOpenLogin = () => setIsLoginOpen(true);
    window.addEventListener('open-login', handleOpenLogin);
    playVideo();
    setIsMuted(true);

    // Force enable scrolling by overriding global styles
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';

    return () => {
      window.removeEventListener('open-login', handleOpenLogin);
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 relative">
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          overflow: auto !important;
          height: auto !important;
          scrollbar-width: thin !important;
        }
        *::-webkit-scrollbar {
          display: block !important;
          width: 8px !important;
        }
        *::-webkit-scrollbar-track {
          background: #f1f1f1 !important;
        }
        *::-webkit-scrollbar-thumb {
          background: #888 !important;
          border-radius: 10px !important;
        }
        *::-webkit-scrollbar-thumb:hover {
          background: #555 !important;
        }
      `}} />

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
      <section className="pt-32 pb-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 text-center md:text-left">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-tight"
            >
              Secret <span className="text-[#0070F3]">Project</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 font-bold uppercase tracking-[0.4em] text-sm mt-4"
            >
              Next-Gen Vertical Video Platform
            </motion.p>
          </header>

          <div className="grid lg:grid-cols-12 gap-16 items-start">
            {/* Media Block (Left) */}
            <div className="lg:col-span-8 bg-black rounded-[3rem] overflow-hidden aspect-video relative group shadow-2xl ring-1 ring-slate-200">
               {featuredSlide ? (
                  <LocalVideoPlayer slide={featuredSlide} isActive={true} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold uppercase tracking-widest bg-slate-900">
                    Loading Vision...
                  </div>
                )}
                <div className="absolute bottom-8 right-8 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button
                     onClick={() => setIsMuted(!isMuted)}
                     className="w-14 h-14 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all shadow-2xl"
                   >
                     {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                   </button>
                </div>
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                       <button
                         onClick={() => playVideo()}
                         className="w-24 h-24 bg-[#0070F3] rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 active:scale-95 transition-transform"
                       >
                         <Play size={40} fill="currentColor" className="ml-1" />
                       </button>
                    </div>
                )}
            </div>

            {/* Summary Card (Right) */}
            <div className="lg:col-span-4 space-y-8">
               <div className="border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] rounded-[3rem] p-12 bg-white space-y-10 ring-1 ring-slate-100">
                    <div className="space-y-3">
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0070F3]">Current Funding</p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-6xl font-black tracking-tighter">PLN {fundingAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                       <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[#0070F3] rounded-full shadow-[0_0_20px_rgba(0,112,243,0.4)]"
                          />
                       </div>
                       <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-500">
                          <span>{Math.round(progressPercent)}% FUNDED</span>
                          <span>GOAL: {goalAmount.toLocaleString()} PLN</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <p className="text-4xl font-black tracking-tighter">{backersCount.toLocaleString()}</p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1 flex items-center gap-2">
                            <Users size={14} /> Supporters
                          </p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <p className="text-4xl font-black tracking-tighter">{daysLeft}</p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1 flex items-center gap-2">
                            <Calendar size={14} /> Days Left
                          </p>
                       </div>
                    </div>

                    <Button
                      onClick={() => openTippingModal()}
                      className="w-full bg-[#0070F3] hover:bg-blue-600 text-white h-24 rounded-[2rem] text-2xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 active:scale-[0.97] transition-all"
                    >
                      Back Campaign
                    </Button>
               </div>

               <div className="flex items-center gap-6 px-10 py-8 bg-slate-900 rounded-[2.5rem] text-white">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Trusted Platform</p>
                    <p className="text-base font-bold">Secure payments via Stripe</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="mt-20 flex justify-center">
             <motion.div
               animate={{ y: [0, 10, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="flex flex-col items-center gap-2 text-slate-300"
             >
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Scroll to Explore</p>
                <ArrowDown size={20} />
             </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Long Page Scrolling */}
      <main className="max-w-7xl mx-auto px-6 space-y-40 py-40">

        {/* Story Section */}
        <section id="story" className="grid md:grid-cols-12 gap-20 items-center">
            <div className="md:col-span-5 relative">
               <div className="aspect-[3/4] bg-slate-100 rounded-[4rem] overflow-hidden shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-700">
                  <Image
                    src="/metal.png"
                    alt="Vision"
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
               </div>
               <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#0070F3]/10 blur-[100px] rounded-full" />
            </div>
            <article className="md:col-span-7 space-y-12">
                <div className="space-y-8">
                  <h3 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] text-slate-900">
                      Our <br /><span className="text-[#0070F3]">Manifesto.</span>
                  </h3>
                  <p className="text-3xl md:text-4xl leading-tight text-slate-800 font-bold tracking-tight italic border-l-8 border-[#0070F3] pl-10 py-2">
                      &quot;Reclaiming the art of video in a world of algorithmic noise.&quot;
                  </p>
                </div>

                <div className="prose prose-slate prose-2xl max-w-none text-slate-600 leading-relaxed space-y-8">
                  <p className="first-letter:text-9xl first-letter:font-black first-letter:text-[#0070F3] first-letter:mr-6 first-letter:float-left first-letter:mt-4">
                      Secret Project is more than just another video app. It is a rebellion against platforms that prioritize shallow engagement over depth. We believe short-form video deserves a second chance — as a medium for genuine craftsmanship, passion, and authenticity.
                  </p>
                  <p>
                      Current platforms have become hostages to retention metrics. Content is designed to addict, not enrich. We are moving in the opposite direction. We are building a space where quality matters more than frequency. Where creators are treated as artisans, not just data providers for a machine.
                  </p>
                  <h4 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 pt-10">The Vision.</h4>
                  <p>
                      Your support will allow us to fund independent streaming infrastructure. We want to be free from corporate censorship and the technical lag that kills immersion. We are funding servers that belong to us — the community.
                  </p>
                  <p className="font-bold text-slate-900 bg-blue-50 p-8 rounded-[2rem] border-l-4 border-[#0070F3]">
                      By joining this campaign, you become a co-founder of a movement. You aren&apos;t just buying a subscription; you are funding the freedom of expression and the freedom to create.
                  </p>
                </div>
            </article>
        </section>

        {/* Rewards Section */}
        <section id="rewards" className="space-y-20">
            <div className="text-center space-y-6">
                <h4 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-slate-900">Select <span className="text-[#0070F3]">Rewards.</span></h4>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.5em]">Support the future of digital craft</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
            {rewards.map((reward, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -20 }}
                  className="rounded-[3.5rem] border-2 border-slate-100 hover:border-blue-200 transition-all hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] group bg-white p-12 space-y-8"
                >
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-[#0070F3] group-hover:bg-[#0070F3] group-hover:text-white transition-all duration-500 shadow-sm">
                        <Zap size={40} />
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm font-black text-[#0070F3] uppercase tracking-[0.2em]">Pledge PLN {reward.amount} or more</p>
                        <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{reward.title}</h4>
                    </div>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">{reward.description}</p>
                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated Delivery</span>
                        <span className="text-xs font-bold bg-slate-50 px-3 py-1 rounded-full">{reward.delivery}</span>
                    </div>
                    <Button
                      onClick={() => openTippingModal()}
                      className="w-full bg-slate-900 text-white rounded-[1.5rem] h-16 font-black uppercase tracking-widest hover:bg-[#0070F3] transition-all text-sm"
                    >
                        Select Reward
                    </Button>
                </motion.div>
            ))}
            </div>
        </section>

        {/* Updates Section */}
        <section id="updates" className="grid md:grid-cols-12 gap-20">
            <div className="md:col-span-4 sticky top-32 h-fit">
                <h4 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-slate-900 leading-[0.9]">Campaign <br /><span className="text-[#0070F3]">Updates.</span></h4>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mt-8">Tracking our progress in real-time</p>
                <div className="mt-12 h-1 w-20 bg-[#0070F3]" />
            </div>
            <div className="md:col-span-8 space-y-16">
            {updates.map((update, i) => (
                <div key={i} className="flex gap-10 group">
                <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-white border-4 border-[#0070F3] shadow-[0_0_15px_rgba(0,112,243,0.3)]" />
                    <div className="w-1 flex-1 bg-slate-100 group-last:bg-transparent mt-6 rounded-full" />
                </div>
                <div className="pb-16 space-y-6">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-[#0070F3] bg-blue-50 px-4 py-1 rounded-full">{update.date}</span>
                    <h4 className="text-4xl font-black italic uppercase tracking-tighter leading-tight text-slate-900">{update.title}</h4>
                    <p className="text-xl text-slate-600 leading-relaxed font-medium">{update.content}</p>
                </div>
                </div>
            ))}
            </div>
        </section>

        {/* Discussion Section */}
        <section id="discussion" className="pt-24 border-t-2 border-slate-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-20">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-[#0070F3] shadow-inner">
                      <MessageSquare size={40} />
                    </div>
                    <div>
                      <h4 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">Community</h4>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.5em] mt-2">Join the founders conversation</p>
                    </div>
                </div>
                <Button className="bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl px-10 h-16 font-black uppercase tracking-widest text-xs border border-slate-200">
                   Follow Campaign
                </Button>
            </div>
            <div className="bg-slate-50/50 rounded-[4rem] p-12 border border-slate-100">
               <EmbeddedComments />
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-32 px-10 rounded-t-[5rem]">
         <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-20">
            <div className="md:col-span-6 space-y-10 text-center md:text-left">
               <h2 className="text-5xl font-black italic uppercase tracking-tighter">SECRET PROJECT</h2>
               <p className="text-slate-400 text-xl font-medium max-w-md leading-relaxed">
                 Building the gold standard for next-generation social media. Authentic, independent, uncompromising.
               </p>
               <div className="flex gap-6 justify-center md:justify-start">
                  <a href="#" className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-[#0070F3] hover:border-[#0070F3]/50 transition-all duration-500 shadow-2xl">
                    <Share2 size={24} />
                  </a>
                  <a href="#" className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-pink-500 hover:border-pink-500/50 transition-all duration-500 shadow-2xl">
                    <Heart size={24} />
                  </a>
               </div>
            </div>
            <div className="md:col-span-6 flex flex-col items-center md:items-end justify-between py-4">
               <div className="text-center md:text-right space-y-4">
                 <p className="text-xs font-black uppercase tracking-[0.6em] text-slate-600">All rights reserved</p>
                 <p className="text-lg font-bold">© 2024 Secret Project Studio</p>
               </div>
               <div className="flex gap-12 text-xs font-black uppercase tracking-[0.4em] text-slate-500">
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
               </div>
            </div>
         </div>
      </footer>

      <TippingModal />
      <ToastContainer />

      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col"
             >
                <div className="flex items-center justify-between p-12 border-b border-slate-50 bg-slate-50/50">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">Sign In</h2>
                    <button onClick={() => setIsLoginOpen(false)} className="p-4 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
                        <X size={32} />
                    </button>
                </div>
                <div className="p-12 pb-16">
                  <LoginForm onLoginSuccess={() => setIsLoginOpen(false)} />
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
