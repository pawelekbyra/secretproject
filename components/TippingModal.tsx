"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useUser } from '@/context/UserContext';
import { useTranslation } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { useStore } from '@/store/useStore';
import { X, ChevronDown, Check, Loader2, Shield, Crown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import StatusMessage from '@/components/ui/StatusMessage';
import { Button } from './ui/button';
import { Input } from './ui/input';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

const STRIPE_APPEARANCE = {
    theme: 'night' as const,
    variables: {
        colorPrimary: '#C9A96E',
        colorBackground: '#1A1A1A',
        colorText: '#F5F0E8',
        colorDanger: '#D4534B',
        fontFamily: 'inherit',
        borderRadius: '14px',
        spacingUnit: '4px',
    },
    rules: {
        '.Input': {
            border: '1px solid rgba(201, 169, 110, 0.15)',
            backgroundColor: 'rgba(0,0,0,0.4)',
            color: '#F5F0E8',
        },
        '.Input:focus': {
            border: '1px solid rgba(201, 169, 110, 0.5)',
            boxShadow: '0 0 0 1px rgba(201, 169, 110, 0.2)',
        },
        '.Label': {
            color: 'rgba(245, 240, 232, 0.6)',
            fontWeight: '500',
            letterSpacing: '0.02em',
        },
        '.Tab': {
            border: '1px solid rgba(201, 169, 110, 0.15)',
            backgroundColor: 'rgba(0,0,0,0.3)',
            color: 'rgba(245, 240, 232, 0.7)',
        },
        '.Tab--selected': {
            border: '1px solid rgba(201, 169, 110, 0.4)',
            backgroundColor: 'rgba(201, 169, 110, 0.08)',
            color: '#C9A96E',
        },
        '.Tab:hover': {
            border: '1px solid rgba(201, 169, 110, 0.3)',
            color: '#F5F0E8',
        },
    }
};

const StripeLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="26" viewBox="0 0 120 60" fillRule="evenodd" fill="#C9A96E">
        <path d="M101.547 30.94c0-5.885-2.85-10.53-8.3-10.53-5.47 0-8.782 4.644-8.782 10.483 0 6.92 3.908 10.414 9.517 10.414 2.736 0 4.805-.62 6.368-1.494v-4.598c-1.563.782-3.356 1.264-5.632 1.264-2.23 0-4.207-.782-4.46-3.494h11.24c0-.3.046-1.494.046-2.046zM90.2 28.757c0-2.598 1.586-3.678 3.035-3.678 1.402 0 2.897 1.08 2.897 3.678zm-14.597-8.345c-2.253 0-3.7 1.057-4.506 1.793l-.3-1.425H65.73v26.805l5.747-1.218.023-6.506c.828.598 2.046 1.448 4.07 1.448 4.115 0 7.862-3.3 7.862-10.598-.023-6.667-3.816-10.3-7.84-10.3zm-1.38 15.84c-1.356 0-2.16-.483-2.713-1.08l-.023-8.53c.598-.667 1.425-1.126 2.736-1.126 2.092 0 3.54 2.345 3.54 5.356 0 3.08-1.425 5.38-3.54 5.38zm-16.4-17.196l5.77-1.24V13.15l-5.77 1.218zm0 1.747h5.77v20.115h-5.77zm-6.185 1.7l-.368-1.7h-4.966V40.92h5.747V27.286c1.356-1.77 3.655-1.448 4.368-1.195v-5.287c-.736-.276-3.425-.782-4.782 1.7zm-11.494-6.7L34.535 17l-.023 18.414c0 3.402 2.552 5.908 5.954 5.908 1.885 0 3.264-.345 4.023-.76v-4.667c-.736.3-4.368 1.356-4.368-2.046V25.7h4.368v-4.897h-4.37zm-15.54 10.828c0-.897.736-1.24 1.954-1.24a12.85 12.85 0 0 1 5.7 1.47V21.47c-1.908-.76-3.793-1.057-5.7-1.057-4.667 0-7.77 2.437-7.77 6.506 0 6.345 8.736 5.333 8.736 8.07 0 1.057-.92 1.402-2.207 1.402-1.908 0-4.345-.782-6.276-1.84v5.47c2.138.92 4.3 1.3 6.276 1.3 4.782 0 8.07-2.368 8.07-6.483-.023-6.85-8.782-5.632-8.782-8.207z"/>
    </svg>
);

const GoldDivider = () => (
    <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-[linear-gradient(90deg,transparent,rgba(201,169,110,0.3),transparent)]" />
        <Sparkles size={10} className="text-[#C9A96E]/40" />
        <div className="flex-1 h-px bg-[linear-gradient(90deg,transparent,rgba(201,169,110,0.3),transparent)]" />
    </div>
);

const CheckoutForm = ({ clientSecret, email, onClose, onBack }: { clientSecret: string, email: string, onClose: () => void, onBack: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { addToast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const { t } = useTranslation();

    const paymentElementOptions = useMemo(() => ({
        layout: 'tabs' as const,
        readOnly: isProcessing,
        loader: 'auto' as const,
        fields: {
            billingDetails: {
                email: 'never' as const,
            }
        }
    }), [isProcessing]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.protocol}//${window.location.host}${window.location.pathname}`,
                    payment_method_data: {
                        billing_details: {
                            email: email,
                        }
                    },
                },
                redirect: 'if_required',
            });

            if (error) {
                console.error("Stripe Error Details:", error);

                if (error.type === "card_error" || error.type === "validation_error") {
                    addToast(error.message || 'Wystapil blad walidacji platnosci', 'error');
                } else {
                    addToast('Wystapil nieoczekiwany blad platnosci.', 'error');
                }
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                addToast('Platnosc udana!', 'success');
                onClose();
            }
        } catch (e) {
            console.error("Unexpected Error in handleSubmit:", e);
            addToast('Wystapil krytyczny blad aplikacji.', 'error');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-5 min-h-[260px] w-full relative z-10">
                <PaymentElement
                    id="payment-element"
                    options={paymentElementOptions}
                    onReady={() => setIsReady(true)}
                    onLoadError={(e) => {
                        console.error("Load Error:", e);
                        addToast("Blad ladowania formularza platnosci", "error");
                    }}
                />
            </div>
            <div className="flex gap-3 w-full mt-4">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isProcessing}
                    className="flex-1 h-12 rounded-2xl border border-[#C9A96E]/20 text-[#C9A96E]/70 hover:text-[#C9A96E] hover:border-[#C9A96E]/40 bg-transparent font-semibold text-sm tracking-wide transition-all duration-300 disabled:opacity-40"
                >
                    Wstecz
                </button>
                <button
                    type="submit"
                    disabled={isProcessing || !stripe || !elements || !isReady}
                    className="flex-1 h-12 rounded-2xl bg-[linear-gradient(135deg,#C9A96E,#B8944D)] text-[#1A1A1A] font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(201,169,110,0.3)] hover:shadow-[0_4px_30px_rgba(201,169,110,0.45)] transition-all duration-300 disabled:opacity-40 disabled:shadow-none"
                >
                    {isProcessing ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin h-5 w-5" />
                        </div>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <Crown size={16} />
                            Napiwkuj
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
};

const TippingModal = () => {
  const { isLoggedIn, user } = useUser();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const { isTippingModalOpen, closeTippingModal, tippingModalOptions } = useStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    amount: 10,
    currency: 'PLN',
    create_account: false,
    terms_accepted: false,
    recipient: '',
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [lastIntentConfig, setLastIntentConfig] = useState<{ amount: number, currency: string, email: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentStepKey, setPaymentStepKey] = useState(0);

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoggedIn) {
        setFormData(prev => ({ ...prev, email: user?.email || '' }));
    }

    if (!isTippingModalOpen) {
        const timeout = setTimeout(() => {
            setCurrentStep(0);
            setFormData(prev => ({ ...prev, create_account: false, terms_accepted: false, recipient: '' }));
            setIsCurrencyDropdownOpen(false);
            setShowTerms(false);
            setClientSecret(null);
            setLastIntentConfig(null);
            setValidationError(null);
            setPaymentStepKey(0);
        }, 500);
        return () => clearTimeout(timeout);
    }
  }, [isLoggedIn, user, isTippingModalOpen]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setIsCurrencyDropdownOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNext = async () => {
    setValidationError(null);

    if (currentStep === 0) {
        if (!formData.recipient) {
            addToast('Wybierz odbiorce, aby kontynuowac.', 'error');
            return;
        }
        if (formData.recipient === 'Nikt') {
            closeTippingModal();
            return;
        }
        if (isLoggedIn) {
            setCurrentStep(2);
        } else {
            setCurrentStep(1);
        }
    }
    else if (currentStep === 1) {
        if (formData.create_account) {
            if (!formData.email) {
                addToast(t('errorEmailRequired') || 'Podaj adres email', 'error');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                addToast(t('errorInvalidEmail') || 'Nieprawidlowy email', 'error');
                return;
            }
        }
        setCurrentStep(2);
    }
    else if (currentStep === 2) {
        if (!formData.terms_accepted) {
            setValidationError('Musisz zaakceptowac Regulamin i Polityke Prywatnosci.');
            return;
        }

        if (formData.currency === 'PLN' && formData.amount < 5) {
            setValidationError('Kwota mniejsza niz 5 PLN.');
            return;
        }
        if (formData.currency !== 'PLN' && formData.amount < 1) {
            setValidationError(`Minimalna kwota napiwku to 1 ${formData.currency}.`);
            return;
        }

        if (clientSecret && lastIntentConfig &&
            lastIntentConfig.amount === formData.amount &&
            lastIntentConfig.currency === formData.currency &&
            lastIntentConfig.email === formData.email) {
            setCurrentStep(3);
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: formData.amount,
                    currency: formData.currency,
                    countryCodeHint: 'PL',
                    email: formData.email,
                    createAccount: formData.create_account,
                    language: 'pl'
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setClientSecret(data.clientSecret);
                setLastIntentConfig({
                    amount: formData.amount,
                    currency: formData.currency,
                    email: formData.email
                });
                setPaymentStepKey(prev => prev + 1);
                setCurrentStep(3);
            } else {
                addToast(data.error || t('errorCreatingPayment') || 'Blad tworzenia platnosci', 'error');
            }
        } catch (error) {
            addToast(t('errorUnexpected') || 'Wystapil niespodziewany blad', 'error');
        } finally {
            setIsProcessing(false);
        }
    }
  };

  const handleBack = () => {
      setValidationError(null);
      if (currentStep === 2 && isLoggedIn) {
          setCurrentStep(0);
      } else if (currentStep > 0) {
          setCurrentStep(currentStep - 1);
      }
  };

  const totalSteps = isLoggedIn ? 3 : 4;
  const currentVisualStep = isLoggedIn && currentStep >= 1 ? currentStep - 1 : currentStep;
  const progress = ((currentVisualStep + 1) / totalSteps) * 100;

  const suggestedAmounts = [10, 20, 50];
  const currencies = ['PLN', 'EUR', 'USD', 'GBP'];
  const modalTitle = showTerms ? "Regulamin i Polityka" : "Bramka Napiwkowa";

  const stripeOptions = useMemo(() => {
    if (!clientSecret) return undefined;

    return {
      clientSecret,
      appearance: STRIPE_APPEARANCE,
      loader: 'auto' as const,
      defaultValues: {
        billingDetails: {
            email: formData.email || undefined,
        }
      }
    };
  }, [clientSecret, formData.email]);

  const stepVariants = {
      initial: { x: 20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -20, opacity: 0 }
  };

  const stepLabels = isLoggedIn
    ? ['Odbiorca', 'Kwota', 'Platnosc']
    : ['Odbiorca', 'Konto', 'Kwota', 'Platnosc'];

  return (
    <AnimatePresence mode="wait">
      {isTippingModalOpen && (
        <div className="absolute inset-0 z-[10200] flex items-center justify-center pointer-events-none font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-[-1] pointer-events-auto bg-black/80 backdrop-blur-sm"
            onClick={closeTippingModal}
          />
          <motion.div
            initial={{ x: tippingModalOptions.fromLeft ? '-100%' : '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: tippingModalOptions.fromLeft ? '-100%' : '100%' }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="relative w-[95%] max-w-[420px] max-h-[85vh] flex flex-col rounded-[2rem] pointer-events-auto overflow-visible"
            style={{
              background: 'linear-gradient(180deg, #1E1E1E 0%, #141414 100%)',
              border: '1px solid rgba(201, 169, 110, 0.15)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 40px rgba(201,169,110,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >

        {/* Premium handle */}
        <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#C9A96E]/25" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-center px-6 py-2 text-center shrink-0 z-10">
            <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-2">
                    <Crown size={16} className="text-[#C9A96E]" />
                    <h2 className="text-lg font-bold text-[#F5F0E8] tracking-tight">
                        {modalTitle}
                    </h2>
                </div>
                {!showTerms && (
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#C9A96E]/50 font-semibold">
                        Premium Patron Experience
                    </p>
                )}
            </div>
            <button
                onClick={closeTippingModal}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#F5F0E8]/30 hover:text-[#C9A96E] hover:bg-[#C9A96E]/10 rounded-xl transition-all duration-300 z-50"
                aria-label="Zamknij"
            >
                <X size={20} strokeWidth={2.5} />
            </button>
        </div>

        {/* Step indicators */}
        {!showTerms && (
            <div className="flex items-center justify-center gap-2 px-6 pb-3">
                {stepLabels.map((label, i) => {
                    const isActive = i === currentVisualStep;
                    const isDone = i < currentVisualStep;
                    return (
                        <div key={label} className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 shrink-0",
                                    isActive
                                        ? "bg-[#C9A96E] text-[#1A1A1A] shadow-[0_0_12px_rgba(201,169,110,0.4)]"
                                        : isDone
                                            ? "bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/30"
                                            : "bg-[#F5F0E8]/5 text-[#F5F0E8]/30 border border-[#F5F0E8]/10"
                                )}>
                                    {isDone ? <Check size={10} strokeWidth={3} /> : i + 1}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-semibold tracking-wide transition-colors duration-300 hidden min-[360px]:block",
                                    isActive ? "text-[#C9A96E]" : isDone ? "text-[#C9A96E]/50" : "text-[#F5F0E8]/20"
                                )}>
                                    {label}
                                </span>
                            </div>
                            {i < stepLabels.length - 1 && (
                                <div className={cn(
                                    "w-4 h-px transition-colors duration-500",
                                    isDone ? "bg-[#C9A96E]/30" : "bg-[#F5F0E8]/8"
                                )} />
                            )}
                        </div>
                    );
                })}
            </div>
        )}

        {/* Subtle gold divider */}
        <div className="px-6">
            <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(201,169,110,0.2),transparent)]" />
        </div>

        {/* Content area */}
        <div className={cn(
            "flex-1 overflow-y-auto px-6 pt-5 pb-0 flex flex-col relative z-10 text-[#F5F0E8] rounded-b-[2rem] custom-scrollbar",
            isCurrencyDropdownOpen && "z-30"
        )}>
            <AnimatePresence mode="wait" initial={false}>
                {/* Step 0: Recipient */}
                {currentStep === 0 && (
                    <motion.div
                        key="step0"
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                    >
                        <div className="text-left">
                            <p className="text-sm font-semibold text-[#F5F0E8]/80 tracking-wide">Komu chcesz wyslac napiwek?</p>
                        </div>
                        <div className="space-y-3 pt-1">
                            <div
                                className={cn(
                                    "flex items-center justify-start h-14 px-5 gap-4 rounded-2xl cursor-pointer transition-all duration-400 group border relative overflow-hidden",
                                    formData.recipient === 'Paweł'
                                        ? "border-[#C9A96E]/40 shadow-[0_0_20px_rgba(201,169,110,0.12)]"
                                        : "border-[#F5F0E8]/8 hover:border-[#C9A96E]/20"
                                )}
                                style={formData.recipient === 'Paweł' ? {
                                    background: 'linear-gradient(135deg, rgba(201,169,110,0.08) 0%, rgba(201,169,110,0.02) 100%)'
                                } : {
                                    background: 'rgba(255,255,255,0.02)'
                                }}
                                onClick={() => setFormData(prev => ({ ...prev, recipient: 'Paweł' }))}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0",
                                    formData.recipient === 'Paweł'
                                        ? "border-[#C9A96E]"
                                        : "border-[#F5F0E8]/20 group-hover:border-[#C9A96E]/40"
                                )}>
                                    {formData.recipient === 'Paweł' && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-2.5 h-2.5 bg-[#C9A96E] rounded-full shadow-[0_0_6px_rgba(201,169,110,0.5)]"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "text-sm font-bold transition-colors leading-tight",
                                        formData.recipient === 'Paweł' ? "text-[#F5F0E8]" : "text-[#F5F0E8]/60 group-hover:text-[#F5F0E8]/90"
                                    )}>
                                        Pawlowi Polutkowi
                                    </span>
                                    {formData.recipient === 'Paweł' && (
                                        <motion.span
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-[10px] text-[#C9A96E]/60 font-medium tracking-wide"
                                        >
                                            Tworca i autor
                                        </motion.span>
                                    )}
                                </div>
                                {formData.recipient === 'Paweł' && (
                                    <Crown size={14} className="ml-auto text-[#C9A96E]/50" />
                                )}
                            </div>
                            <div
                                className={cn(
                                    "flex items-center justify-start h-14 px-5 gap-4 rounded-2xl cursor-pointer transition-all duration-400 group border",
                                    formData.recipient === 'Nikt'
                                        ? "border-[#F5F0E8]/20 bg-[#F5F0E8]/5"
                                        : "border-[#F5F0E8]/8 hover:border-[#F5F0E8]/15 bg-[#F5F0E8]/[0.02]"
                                )}
                                onClick={() => setFormData(prev => ({ ...prev, recipient: 'Nikt' }))}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0",
                                    formData.recipient === 'Nikt'
                                        ? "border-[#F5F0E8]/50"
                                        : "border-[#F5F0E8]/20 group-hover:border-[#F5F0E8]/40"
                                )}>
                                    {formData.recipient === 'Nikt' && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-2.5 h-2.5 bg-[#F5F0E8]/60 rounded-full"
                                        />
                                    )}
                                </div>
                                <span className={cn("text-sm font-bold transition-colors", formData.recipient === 'Nikt' ? "text-[#F5F0E8]/80" : "text-[#F5F0E8]/40 group-hover:text-[#F5F0E8]/60")}>
                                    Nikomu
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 1: Account */}
                {currentStep === 1 && (
                    <motion.div
                        key="step1"
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                    >
                        <div className="text-left">
                            <p className="text-sm font-semibold text-[#F5F0E8]/80 tracking-wide">Czy chcesz utworzyc konto Patrona?</p>
                        </div>
                        <div className="space-y-3">
                            {!isLoggedIn && (
                                <div
                                    className={cn(
                                        "flex items-center justify-start h-14 px-5 gap-4 rounded-2xl cursor-pointer transition-all duration-400 group border relative overflow-hidden",
                                        formData.create_account
                                            ? "border-[#C9A96E]/40 shadow-[0_0_20px_rgba(201,169,110,0.12)]"
                                            : "border-[#F5F0E8]/8 hover:border-[#C9A96E]/20"
                                    )}
                                    style={formData.create_account ? {
                                        background: 'linear-gradient(135deg, rgba(201,169,110,0.08) 0%, rgba(201,169,110,0.02) 100%)'
                                    } : {
                                        background: 'rgba(255,255,255,0.02)'
                                    }}
                                    onClick={() => setFormData(prev => ({ ...prev, create_account: !prev.create_account }))}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0",
                                        formData.create_account
                                            ? "border-[#C9A96E]"
                                            : "border-[#F5F0E8]/20 group-hover:border-[#C9A96E]/40"
                                    )}>
                                        {formData.create_account && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2.5 h-2.5 bg-[#C9A96E] rounded-full shadow-[0_0_6px_rgba(201,169,110,0.5)]"
                                            />
                                        )}
                                    </div>
                                    <span className={cn("text-sm font-bold transition-colors", formData.create_account ? "text-[#F5F0E8]" : "text-[#F5F0E8]/60 group-hover:text-[#F5F0E8]/90")}>
                                        No jacha!
                                    </span>
                                </div>
                            )}
                            <div className={cn(
                                "space-y-3 overflow-hidden transition-all duration-500",
                                formData.create_account ? "max-h-[200px] opacity-100 translate-y-0 pt-2" : "max-h-0 opacity-0 -translate-y-2"
                            )}>
                                <div className="group relative">
                                    <input
                                        type="email"
                                        placeholder="Twoj adres email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full h-12 text-center text-base font-medium bg-black/40 border border-[#C9A96E]/15 text-[#F5F0E8] rounded-2xl focus:outline-none focus:border-[#C9A96E]/40 focus:shadow-[0_0_15px_rgba(201,169,110,0.1)] transition-all duration-300 placeholder:text-[#F5F0E8]/25"
                                    />
                                </div>
                                <p className="text-[11px] text-[#C9A96E]/40 text-left px-2 font-medium leading-relaxed">
                                    Na podany adres e-mail otrzymasz dane do logowania.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Amount */}
                {currentStep === 2 && (
                    <motion.div
                        key={showTerms ? "terms" : "step2"}
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="space-y-5 flex-1 relative z-10 h-full flex flex-col"
                    >
                        {showTerms ? (
                             <div className="flex flex-col h-full overflow-hidden">
                                <div className="flex-1 overflow-y-auto bg-black/40 border border-[#C9A96E]/10 rounded-2xl p-5 text-sm text-[#F5F0E8]/60 space-y-4 custom-scrollbar h-[50vh] max-h-[400px] leading-relaxed">
                                    <p className="font-bold text-[#F5F0E8] text-base">1. Postanowienia ogolne</p>
                                    <p>Korzystajac z Bramki Napiwkowej, uzytkownik (&quot;Darczynca&quot;) oswiadcza, ze zapoznal sie z niniejszym regulaminem i w pelni go akceptuje. Wplaty sa dobrowolne i maja charakter darowizny na rzecz tworcy (&quot;Beneficjent&quot;).</p>

                                    <p className="font-bold text-[#F5F0E8] text-base">2. Platnosci i Zwroty</p>
                                    <p>Wszystkie transakcje sa przetwarzane przez zewnetrznego operatora platnosci Stripe. Serwis nie przechowywuje pelnych danych kart platniczych. Z uwagi na charakter uslugi (darowizna cyfrowa), wplaty sa bezzwrotne, chyba ze przepisy prawa stanowia inaczej. Reklamacje dotyczace bledow technicznych nalezy zglaszac w ciagu 14 dni.</p>

                                    <p className="font-bold text-[#F5F0E8] text-base">3. Prywatnosc i Dane Osobowe</p>
                                    <p>Administratorem danych jest wlasciciel serwisu. Podany adres e-mail przetwarzany jest wylacznie w celu:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>Przeslania potwierdzenia transakcji.</li>
                                        <li>Utworzenia konta Patrona (jesli zaznaczono opcje).</li>
                                        <li>Kontaktu w sprawach technicznych.</li>
                                    </ul>
                                    <p>Dane nie sa udostepniane podmiotom trzecim w celach marketingowych.</p>

                                    <p className="font-bold text-[#F5F0E8] text-base">4. Postanowienia koncowe</p>
                                    <p>Regulamin moze ulec zmianie. W sprawach nieuregulowanych decyduja przepisy prawa polskiego.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-sm font-semibold text-[#F5F0E8]/80 tracking-wide">Wybierz lub wpisz kwote napiwku</h3>
                                </div>

                                {/* Suggested amounts */}
                                <div className="grid grid-cols-3 gap-3">
                                    {suggestedAmounts.map(amount => (
                                        <button
                                            key={amount}
                                            onClick={() => {
                                                setFormData({ ...formData, amount });
                                                setValidationError(null);
                                            }}
                                            className={cn(
                                                "h-12 flex items-center justify-center rounded-2xl font-bold transition-all duration-300 border relative overflow-hidden text-base",
                                                formData.amount === amount
                                                    ? "border-[#C9A96E]/50 text-[#C9A96E] shadow-[0_0_15px_rgba(201,169,110,0.15)]"
                                                    : "border-[#F5F0E8]/8 text-[#F5F0E8]/50 hover:border-[#C9A96E]/25 hover:text-[#F5F0E8]/80"
                                            )}
                                            style={formData.amount === amount ? {
                                                background: 'linear-gradient(135deg, rgba(201,169,110,0.1) 0%, rgba(201,169,110,0.03) 100%)'
                                            } : {
                                                background: 'rgba(255,255,255,0.02)'
                                            }}
                                        >
                                            {amount} {formData.currency}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom amount input */}
                                <div
                                    className={cn("flex items-stretch h-14 relative transition-all", isCurrencyDropdownOpen ? "z-50" : "z-30")}
                                    ref={dropdownRef}
                                >
                                    <div className="relative flex-1 h-full">
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => {
                                                setFormData({ ...formData, amount: Number(e.target.value) });
                                                setValidationError(null);
                                            }}
                                            className="w-full h-full bg-black/40 border border-[#C9A96E]/15 text-center text-xl font-black text-[#F5F0E8] rounded-l-2xl focus:outline-none focus:border-[#C9A96E]/40 focus:shadow-[0_0_15px_rgba(201,169,110,0.1)] transition-all z-10 relative placeholder:text-[#F5F0E8]/20"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="relative h-full w-[100px]">
                                        <div
                                            className="h-full border border-l-0 border-[#C9A96E]/15 bg-[#C9A96E]/[0.05] hover:bg-[#C9A96E]/[0.1] transition-all duration-300 relative shrink-0 cursor-pointer px-4 rounded-r-2xl flex items-center justify-between"
                                            onClick={() => setIsCurrencyDropdownOpen(true)}
                                        >
                                            <span className="font-bold text-sm text-[#C9A96E] select-none">{formData.currency}</span>
                                            <ChevronDown className={cn(
                                                "w-4 h-4 text-[#C9A96E]/50 transition-transform duration-300",
                                                isCurrencyDropdownOpen && "rotate-180"
                                            )} />
                                        </div>
                                        <AnimatePresence>
                                            {isCurrencyDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute top-full right-0 w-full mt-2 rounded-xl shadow-2xl overflow-hidden z-[9999]"
                                                    style={{
                                                        background: 'linear-gradient(180deg, #242424 0%, #1A1A1A 100%)',
                                                        border: '1px solid rgba(201,169,110,0.2)',
                                                        boxShadow: '0 15px 40px rgba(0,0,0,0.6), 0 0 20px rgba(201,169,110,0.05)',
                                                    }}
                                                >
                                                    <div className="flex flex-col">
                                                        {currencies.map((currency) => (
                                                            <button
                                                                key={currency}
                                                                onClick={() => {
                                                                    setFormData({ ...formData, currency: currency as any });
                                                                    setIsCurrencyDropdownOpen(false);
                                                                }}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between px-4 py-3 text-left font-bold transition-all duration-200 relative group text-[#F5F0E8] border-b border-[#F5F0E8]/5 last:border-0 text-sm",
                                                                    formData.currency === currency
                                                                        ? "bg-[#C9A96E]/10 text-[#C9A96E]"
                                                                        : "hover:bg-[#C9A96E]/5"
                                                                )}
                                                            >
                                                                <span>{currency}</span>
                                                                {formData.currency === currency && (
                                                                    <Check size={14} className="text-[#C9A96E]" strokeWidth={3} />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Terms checkbox */}
                                <div
                                    className="flex items-center justify-start gap-3 cursor-pointer group relative z-10 mt-1"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, terms_accepted: !prev.terms_accepted }));
                                        setValidationError(null);
                                    }}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 shrink-0",
                                        formData.terms_accepted
                                            ? "bg-[#C9A96E] border-[#C9A96E] shadow-[0_0_10px_rgba(201,169,110,0.3)]"
                                            : "border-[#F5F0E8]/15 bg-transparent group-hover:border-[#C9A96E]/30"
                                    )}>
                                        {formData.terms_accepted && <Check size={12} className="text-[#1A1A1A]" strokeWidth={4} />}
                                    </div>
                                    <p className="text-[11px] font-medium text-[#F5F0E8]/35 group-hover:text-[#F5F0E8]/55 transition-colors select-none text-left leading-relaxed">
                                        Akceptuje <span className="underline decoration-[#C9A96E]/20 underline-offset-4 hover:text-[#C9A96E] cursor-pointer transition-colors" onClick={(e) => { e.stopPropagation(); setShowTerms(true); }}>Regulamin i Polityke Prywatnosci</span>
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                    <motion.div
                        key="step3"
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="space-y-5 flex-1 relative z-10 w-full"
                    >
                        {/* Amount badge */}
                        <div className="text-center">
                            <div
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(201,169,110,0.15) 0%, rgba(201,169,110,0.05) 100%)',
                                    border: '1px solid rgba(201,169,110,0.25)',
                                    boxShadow: '0 4px 15px rgba(201,169,110,0.1)',
                                }}
                            >
                                <Sparkles size={14} className="text-[#C9A96E]/60" />
                                <span className="text-lg font-black text-[#C9A96E]">{formData.amount.toFixed(2)} {formData.currency}</span>
                            </div>
                        </div>

                        {clientSecret && stripeOptions ? (
                            <Elements
                                key={`${clientSecret}-${paymentStepKey}`}
                                stripe={stripePromise}
                                options={stripeOptions}
                            >
                                <CheckoutForm
                                    clientSecret={clientSecret}
                                    email={formData.email}
                                    onClose={closeTippingModal}
                                    onBack={handleBack}
                                />
                            </Elements>
                        ) : (
                             <div className="flex items-center justify-center h-[260px]">
                                <Loader2 className="animate-spin h-8 w-8 text-[#C9A96E]" />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Footer buttons */}
        {!showTerms && currentStep !== 3 && (
             <div className={cn("px-6 pb-5 pt-4 flex flex-col gap-4 bg-transparent z-20 relative rounded-b-[2rem]", isCurrencyDropdownOpen && "z-10")}>
                <div className="flex gap-3 w-full">
                    {currentStep > 0 && (
                        <button
                            onClick={handleBack}
                            className="flex-1 h-12 rounded-2xl border border-[#C9A96E]/20 text-[#C9A96E]/70 hover:text-[#C9A96E] hover:border-[#C9A96E]/40 bg-transparent font-semibold text-sm tracking-wide transition-all duration-300"
                        >
                            Wstecz
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={isProcessing}
                        className="flex-1 h-12 rounded-2xl bg-[linear-gradient(135deg,#C9A96E,#B8944D)] text-[#1A1A1A] font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(201,169,110,0.3)] hover:shadow-[0_4px_30px_rgba(201,169,110,0.45)] transition-all duration-300 disabled:opacity-40 disabled:shadow-none"
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-2 justify-center">
                                <Loader2 className="animate-spin h-5 w-5" />
                            </div>
                        ) : (
                            "DALEJ"
                        )}
                    </button>
                </div>
                <StatusMessage
                    type="error"
                    message={validationError}
                    isVisible={!!validationError}
                    className="w-full"
                />
            </div>
        )}

        {/* Premium footer */}
        <div className="pb-5 pt-3 flex flex-col items-center justify-center z-10 rounded-b-[2rem] min-h-[56px] gap-2">
             <div className="px-6 w-full">
                <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(201,169,110,0.15),transparent)]" />
             </div>
             {showTerms ? (
                  <button
                    onClick={() => setShowTerms(false)}
                    className="h-9 px-6 rounded-xl border border-[#C9A96E]/20 text-[#C9A96E]/60 hover:text-[#C9A96E] hover:border-[#C9A96E]/40 bg-transparent font-semibold text-[10px] uppercase tracking-[0.2em] transition-all duration-300"
                  >
                    Wroc
                  </button>
             ) : (
                 <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1.5 opacity-30 hover:opacity-60 transition-opacity duration-500">
                        <Shield size={10} className="text-[#C9A96E]" />
                        <span className="text-[9px] text-[#C9A96E] font-bold uppercase tracking-[0.2em]">Bezpieczna platnosc</span>
                    </div>
                    <div className="w-px h-3 bg-[#C9A96E]/15" />
                    <div className="flex items-center gap-1 opacity-30 hover:opacity-60 transition-opacity duration-500">
                        <span className="text-[9px] text-[#F5F0E8]/60 font-semibold uppercase tracking-[0.15em]">via</span>
                        <StripeLogo />
                    </div>
                 </div>
             )}
        </div>
      </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TippingModal;
