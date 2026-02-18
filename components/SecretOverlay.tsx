import React from 'react';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/context/LanguageContext';

const SecretOverlay: React.FC = () => {
    const { setActiveModal } = useStore(state => ({ setActiveModal: state.setActiveModal }));
    const { t } = useTranslation();

    const openLoginModal = () => {
        setActiveModal('login');
    };

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 backdrop-blur-xl bg-black/50" style={{ paddingBottom: '20%' }}>
            <div className="w-20 h-20 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center mb-6 backdrop-blur-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white/90">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Top Secret</h2>
            <p className="text-base text-white/60">
                <button onClick={openLoginModal} className="underline decoration-pink-500/50 decoration-2 underline-offset-4 cursor-pointer font-semibold text-white hover:text-pink-300 transition-colors">Zaloguj się</button> <span className="text-white/60">aby odblokować</span>
            </p>
        </div>
    );
};

export default SecretOverlay;
