"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ToggleSwitch from './ui/ToggleSwitch';
import { Crown, Pencil, Camera } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { updateUserProfile } from '@/lib/actions';
import { DEFAULT_AVATAR_URL } from '@/lib/constants';
import CropModal from './CropModal';
import UserBadge from './UserBadge';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import StatusMessage from '@/components/ui/StatusMessage';

interface ProfileTabProps {
    onClose: () => void;
}

const initialState = {
  success: false,
  message: '',
  avatarUrl: undefined,
};

const ProfileTab: React.FC<ProfileTabProps> = ({ onClose }) => {
  const { user: profile, checkUserStatus, setUser } = useUser();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { update } = useSession();

  // State for fields
  const [emailConsent, setEmailConsent] = useState(false);
  const [emailLanguage, setEmailLanguage] = useState('pl');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isCropOpen, setIsCropOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);

  // Status message states
  const [avatarMessage, setAvatarMessage] = useState<{ type: 'success' | 'error', message: string, isVisible: boolean }>({ type: 'success', message: '', isVisible: false });
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', message: string, isVisible: boolean }>({ type: 'success', message: '', isVisible: false });

  // Initialize state from profile when available
  useEffect(() => {
    if (profile) {
      if (profile.emailConsent !== undefined) setEmailConsent(profile.emailConsent);
      if (profile.emailLanguage) setEmailLanguage(profile.emailLanguage);
    }
  }, [profile]);

  // useFormState hook for server action
  const [state, formAction] = useFormState(updateUserProfile, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<string>('');

  // Handle avatar message auto-hide
  useEffect(() => {
    if (avatarMessage.isVisible) {
      const timer = setTimeout(() => {
        setAvatarMessage(prev => ({ ...prev, isVisible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [avatarMessage.isVisible]);

  // Handle form message auto-hide
  useEffect(() => {
    if (formMessage.isVisible) {
      const timer = setTimeout(() => {
        setFormMessage(prev => ({ ...prev, isVisible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [formMessage.isVisible]);

  // Handle state updates from server action
  useEffect(() => {
    if (state.message && state.message !== lastMessageRef.current) {
      lastMessageRef.current = state.message;

      // Update form message state instead of toast
      setFormMessage({
        type: state.success ? 'success' : 'error',
        message: state.message,
        isVisible: true
      });

      if (state.success) {
        if (state.avatarUrl) {
           setPreviewUrl(state.avatarUrl);
           if (profile) {
               setUser({ ...profile, avatar: state.avatarUrl });
           }
        }

        Promise.all([
          checkUserStatus(),
          update({ image: state.avatarUrl }),
        ]).catch(console.error);

        if (profile?.id) {
            queryClient.invalidateQueries({ queryKey: ['author', profile.id] });
        }
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['comments'] });
        queryClient.invalidateQueries({ queryKey: ['slides'] });
        if (profile?.id) {
            queryClient.invalidateQueries({ queryKey: ['patron', profile.id] });
        }
      }
    }
  }, [state, checkUserStatus, profile, queryClient, update, setUser]);

  const handleAvatarEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setSelectedImage(e.target.result as string);
          setIsCropOpen(true);
        }
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }
  };

  const handleCropSave = (croppedBlob: Blob | null) => {
    if (croppedBlob) {
      const file = new File([croppedBlob], 'avatar.png', { type: 'image/png' });
      setCroppedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Trigger avatar success message
      setAvatarMessage({
        type: 'success',
        message: 'Avatar zaktualizowany',
        isVisible: true
      });
    }
    setIsCropOpen(false);
  };

  const handleSubmit = (formData: FormData) => {
    if (croppedFile) {
      formData.set('avatar', croppedFile);
    }
    lastMessageRef.current = '';
    formAction(formData);
  };

  if (!profile) {
    return <div className="p-5 text-center text-white/60">{t('loadingProfile')}</div>;
  }

  const currentAvatar = previewUrl || profile.avatar || DEFAULT_AVATAR_URL;

  return (
    <div className="tab-pane active p-4" id="profile-tab">
      <form action={handleSubmit} id="profileForm" className="space-y-4">

        {/* Avatar Section */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center">
            <div className="relative w-28 h-28 mb-6 group cursor-pointer" onClick={handleAvatarEditClick}>
                <div className="absolute inset-0 bg-white/10 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="w-full h-full rounded-full overflow-hidden shadow-2xl bg-gray-800 flex items-center justify-center relative z-10">
                    <Image
                      src={currentAvatar}
                      alt={t('avatarAlt')}
                      width={112}
                      height={112}
                      className={`w-full h-full object-cover rounded-full border-2 ${profile.role === 'patron' ? 'border-yellow-500' : 'border-white'}`}
                      id="userAvatar"
                      unoptimized={!!previewUrl}
                    />

                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Camera className="text-white w-8 h-8" />
                    </div>
                </div>
                <button
                  type="button"
                  className="absolute bottom-1 right-1 w-9 h-9 bg-[#FE2C55] border-2 border-white rounded-full text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl z-20"
                  title={t('changeAvatarTitle')}
                >
                   <Camera size={18} />
                </button>

                <input
                    type="file"
                    name="avatar"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                />
            </div>

            <div className="flex flex-col items-center gap-1">
                <h3 className="text-xl font-bold text-white" id="displayName">{profile.displayName}</h3>
                <UserBadge role={profile.role} className="mb-1" />
                {(profile as any).bio && <p className="text-xs text-white/70 max-w-[240px] text-center">{(profile as any).bio}</p>}
                <p className="text-sm text-white/50" id="userEmail">{profile.email}</p>
            </div>

            {/* Avatar Section Feedback */}
            <StatusMessage
                type={avatarMessage.type}
                message={avatarMessage.message}
                isVisible={avatarMessage.isVisible}
                className="mt-3"
            />
        </div>

        {/* Combined Form Fields */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-black italic tracking-tighter mb-6 flex items-center gap-3 text-white uppercase">
            <span className="w-1.5 h-6 bg-[#FE2C55] rounded-full shadow-[0_0_8px_rgba(254,44,85,0.5)]"></span>
            {t('accountSettings')}
          </h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">{t('displayName') || 'Display Name'}</label>
              <Input
                type="text"
                name="displayName"
                defaultValue={profile.displayName || ''}
                placeholder={t('displayNamePlaceholder') || 'Your Name'}
                className="bg-black/40 border-white/10 h-12 rounded-xl text-white focus:border-[#FE2C55]/50 focus:bg-black/60 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">{t('bio') || 'Coś o sobie'}</label>
              <textarea
                name="bio"
                defaultValue={(profile as any).bio || ''}
                placeholder={t('bioPlaceholder') || 'Napisz coś o sobie...'}
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#FE2C55]/50 focus:bg-black/60 focus:outline-none transition-all resize-none placeholder:text-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">{t('email')}</label>
              <Input
                type="email"
                name="email"
                defaultValue={profile.email}
                placeholder={t('emailPlaceholder')}
                className="bg-black/40 border-white/10 h-12 rounded-xl text-white focus:border-[#FE2C55]/50 focus:bg-black/60 transition-all"
              />
            </div>

            <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-white/90">{t('emailConsent')}</label>
                        <span className="text-xs text-white/50">{t('emailConsentDesc') || 'Receive updates and notifications via email'}</span>
                    </div>
                    <ToggleSwitch isActive={emailConsent} onToggle={() => setEmailConsent(p => !p)} />
                    <input type="hidden" name="emailConsent" value={emailConsent.toString()} />
                </div>

                {emailConsent && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                         <label className="text-sm font-medium text-white/80 ml-1">{t('emailLanguage')}</label>
                         <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setEmailLanguage('pl')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all border ${
                                    emailLanguage === 'pl'
                                    ? 'bg-pink-600/20 border-pink-500 text-pink-400'
                                    : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
                                }`}
                            >
                                {t('polish')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setEmailLanguage('en')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all border ${
                                    emailLanguage === 'en'
                                    ? 'bg-pink-600/20 border-pink-500 text-pink-400'
                                    : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
                                }`}
                            >
                                {t('english')}
                            </button>
                            <input type="hidden" name="emailLanguage" value={emailLanguage} />
                         </div>
                    </div>
                )}
            </div>
          </div>

          <div className="mt-6">
            <SaveButton t={t} />
          </div>

          {/* General Settings Feedback */}
          <div className="mt-4">
             <StatusMessage
                 type={formMessage.type}
                 message={formMessage.message}
                 isVisible={formMessage.isVisible}
             />
          </div>
        </div>
      </form>

      {isCropOpen && (
        <CropModal
          isOpen={isCropOpen}
          onClose={() => setIsCropOpen(false)}
          imageSrc={selectedImage}
          onCropComplete={handleCropSave}
        />
      )}
    </div>
  );
};

function SaveButton({ t }: { t: any }) {
  const { pending } = useFormStatus();
  return (
    <Button
        type="submit"
        className="w-full bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white font-black uppercase tracking-widest py-7 rounded-2xl shadow-xl shadow-[#FE2C55]/10 active:scale-[0.98] transition-all"
        disabled={pending}
    >
      {pending ? (
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{t('saving')}</span>
        </div>
      ) : t('saveChanges')}
    </Button>
  );
}

export default ProfileTab;
