"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useUser } from '@/context/UserContext';
import { useTranslation } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { useStore } from '@/store/useStore';
import { X, ChevronDown, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import StatusMessage from '@/components/ui/StatusMessage';
import { Button, Input, Progress, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

const STRIPE_APPEARANCE = {
    theme: 'flat' as const,
    variables: {
        colorPrimary: '#0070F3',
        colorBackground: '#ffffff',
        colorText: '#18181b',
        colorDanger: '#ef4444',
        fontFamily: 'inherit',
        borderRadius: '16px',
    }
};

const StripeLogo = ({ color = "#18181b" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="26" viewBox="0 0 120 60" fillRule="evenodd" fill={color}>
        <path d="M101.547 30.94c0-5.885-2.85-10.53-8.3-10.53-5.47 0-8.782 4.644-8.782 10.483 0 6.92 3.908 10.414 9.517 10.414 2.736 0 4.805-.62 6.368-1.494v-4.598c-1.563.782-3.356 1.264-5.632 1.264-2.23 0-4.207-.782-4.46-3.494h11.24c0-.3.046-1.494.046-2.046zM90.2 28.757c0-2.598 1.586-3.678 3.035-3.678 1.402 0 2.897 1.08 2.897 3.678zm-14.597-8.345c-2.253 0-3.7 1.057-4.506 1.793l-.3-1.425H65.73v26.805l5.747-1.218.023-6.506c.828.598 2.046 1.448 4.07 1.448 4.115 0 7.862-3.3 7.862-10.598-.023-6.667-3.816-10.3-7.84-10.3zm-1.38 15.84c-1.356 0-2.16-.483-2.713-1.08l-.023-8.53c.598-.667 1.425-1.126 2.736-1.126 2.092 0 3.54 2.345 3.54 5.356 0 3.08-1.425 5.38-3.54 5.38zm-16.4-17.196l5.77-1.24V13.15l-5.77 1.218zm0 1.747h5.77v20.115h-5.77zm-6.185 1.7l-.368-1.7h-4.966V40.92h5.747V27.286c1.356-1.77 3.655-1.448 4.368-1.195v-5.287c-.736-.276-3.425-.782-4.782 1.7zm-11.494-6.7L34.535 17l-.023 18.414c0 3.402 2.552 5.908 5.954 5.908 1.885 0 3.264-.345 4.023-.76v-4.667c-.736.3-4.368 1.356-4.368-2.046V25.7h4.368v-4.897h-4.37zm-15.54 10.828c0-.897.736-1.24 1.954-1.24a12.85 12.85 0 0 1 5.7 1.47V21.47c-1.908-.76-3.793-1.057-5.7-1.057-4.667 0-7.77 2.437-7.77 6.506 0 6.345 8.736 5.333 8.736 8.07 0 1.057-.92 1.402-2.207 1.402-1.908 0-4.345-.782-6.276-1.84v5.47c2.138.92 4.3 1.3 6.276 1.3 4.782 0 8.07-2.368 8.07-6.483-.023-6.85-8.782-5.632-8.782-8.207z"/>
    </svg>
);

const CheckoutForm = ({ clientSecret, email, onClose, onBack }: { clientSecret: string, email: string, onClose: () => void, onBack: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { addToast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const paymentElementOptions = useMemo(() => ({
        layout: 'tabs' as const,
        readOnly: isProcessing,
        loader: 'auto' as const,
        fields: { billingDetails: { email: 'never' as const } }
    }), [isProcessing]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;
        setIsProcessing(true);
        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.protocol}//${window.location.host}${window.location.pathname}`,
                    payment_method_data: { billing_details: { email } },
                },
                redirect: 'if_required',
            });
            if (error) {
                addToast(error.message || 'Błąd płatności', 'error');
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                addToast('Płatność udana!', 'success');
                onClose();
            }
        } catch (e) {
            addToast('Błąd krytyczny.', 'error');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4 min-h-[260px] w-full">
                <PaymentElement
                    id="payment-element"
                    options={paymentElementOptions}
                    onReady={() => setIsReady(true)}
                />
            </div>
            <div className="flex gap-3 w-full mt-4">
                <Button variant="flat" onClick={onBack} disabled={isProcessing} className="flex-1 font-bold">
                    Wstecz
                </Button>
                <Button
                    type="submit"
                    color="primary"
                    isLoading={isProcessing}
                    disabled={!stripe || !elements || !isReady}
                    className="flex-1 font-bold"
                >
                    Napiwkuj
                </Button>
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
  const [lastIntentConfig, setLastIntentConfig] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStepKey, setPaymentStepKey] = useState(0);
  const [showTerms, setShowTerms] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) setFormData(prev => ({ ...prev, email: user?.email || '' }));
    if (!isTippingModalOpen) {
        setTimeout(() => {
            setCurrentStep(0);
            setFormData(prev => ({ ...prev, create_account: false, terms_accepted: false, recipient: '' }));
            setShowTerms(false);
            setClientSecret(null);
            setLastIntentConfig(null);
            setValidationError(null);
            setPaymentStepKey(0);
        }, 500);
    }
  }, [isLoggedIn, user, isTippingModalOpen]);

  const handleNext = async () => {
    setValidationError(null);
    if (currentStep === 0) {
        if (!formData.recipient) { addToast('Wybierz odbiorcę.', 'error'); return; }
        if (formData.recipient === 'Nikt') { closeTippingModal(); return; }
        setCurrentStep(isLoggedIn ? 2 : 1);
    } else if (currentStep === 1) {
        if (formData.create_account) {
            if (!formData.email) { addToast('Podaj email', 'error'); return; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { addToast('Błędny email', 'error'); return; }
        }
        setCurrentStep(2);
    } else if (currentStep === 2) {
        if (!formData.terms_accepted) { setValidationError('Zaakceptuj regulamin.'); return; }
        if (formData.currency === 'PLN' && formData.amount < 5) { setValidationError('Min 5 PLN.'); return; }

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
                    email: formData.email,
                    createAccount: formData.create_account
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setClientSecret(data.clientSecret);
                setLastIntentConfig({ amount: formData.amount, currency: formData.currency, email: formData.email });
                setPaymentStepKey(prev => prev + 1);
                setCurrentStep(3);
            } else addToast(data.error, 'error');
        } catch (e) {
            addToast('Błąd.', 'error');
        } finally { setIsProcessing(false); }
    }
  };

  const handleBack = () => {
      setValidationError(null);
      if (currentStep === 2 && isLoggedIn) setCurrentStep(0);
      else if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const stripeOptions = useMemo(() => {
    if (!clientSecret) return undefined;
    return {
      clientSecret,
      appearance: STRIPE_APPEARANCE,
      defaultValues: { billingDetails: { email: formData.email || undefined } }
    };
  }, [clientSecret, formData.email]);

  return (
    <AnimatePresence>
      {isTippingModalOpen && (
        <div className="absolute inset-0 z-[10200] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeTippingModal}
          />
          <motion.div
            initial={{ x: tippingModalOptions.fromLeft ? '-100%' : '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: tippingModalOptions.fromLeft ? '-100%' : '100%' }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="relative w-[95%] max-w-[420px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="app-handle" />
            <div className="relative h-14 flex items-center justify-center px-6 border-b border-zinc-100">
                <h2 className="text-lg font-bold italic uppercase tracking-tighter text-zinc-900">
                    {showTerms ? "Regulamin" : "Napiwek"}
                </h2>
                <Button isIconOnly variant="light" onClick={closeTippingModal} className="absolute right-2">
                    <X size={22} />
                </Button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {currentStep === 0 && (
                    <div className="space-y-4">
                        <p className="font-bold italic uppercase tracking-tighter text-zinc-500 text-sm">Odbiorca</p>
                        <div className="grid grid-cols-1 gap-3">
                            {['Paweł', 'Nikt'].map(r => (
                                <Button
                                    key={r}
                                    variant={formData.recipient === r ? "solid" : "flat"}
                                    color={formData.recipient === r ? "primary" : "default"}
                                    onClick={() => setFormData(p => ({ ...p, recipient: r }))}
                                    className="h-14 font-bold italic uppercase tracking-tighter justify-start px-6"
                                >
                                    {r === 'Paweł' ? 'Paweł Polutek' : 'Nikomu'}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-4">
                        <p className="font-bold italic uppercase tracking-tighter text-zinc-500 text-sm">Zostań Patronem?</p>
                        <Button
                            variant={formData.create_account ? "solid" : "flat"}
                            color={formData.create_account ? "primary" : "default"}
                            onClick={() => setFormData(p => ({ ...p, create_account: !p.create_account }))}
                            className="w-full h-14 font-bold italic uppercase tracking-tighter"
                        >
                            Chcę założyć konto!
                        </Button>
                        {formData.create_account && (
                            <Input
                                label="Email"
                                placeholder="twój@email.pl"
                                value={formData.email}
                                onValueChange={(val) => setFormData(p => ({ ...p, email: val }))}
                                variant="flat"
                                classNames={{ inputWrapper: "bg-zinc-100 h-12" }}
                            />
                        )}
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        {showTerms ? (
                            <div className="bg-zinc-50 p-4 rounded-2xl text-xs text-zinc-600 space-y-3 max-h-[300px] overflow-y-auto font-medium">
                                <p className="font-bold text-zinc-900">Dobrowolna Darowizna</p>
                                <p>Napiwki są formą wsparcia twórcy i mają charakter bezzwrotny.</p>
                                <Button size="sm" onClick={() => setShowTerms(false)}>Wróć</Button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-2">
                                    {[10, 20, 50].map(a => (
                                        <Button
                                            key={a}
                                            variant={formData.amount === a ? "solid" : "flat"}
                                            color={formData.amount === a ? "primary" : "default"}
                                            onClick={() => setFormData(p => ({ ...p, amount: a }))}
                                            className="font-bold h-11"
                                        >
                                            {a} PLN
                                        </Button>
                                    ))}
                                </div>
                                <Input
                                    type="number"
                                    label="Inna kwota"
                                    value={formData.amount.toString()}
                                    onValueChange={(val) => setFormData(p => ({ ...p, amount: Number(val) }))}
                                    endContent={<span className="font-bold text-zinc-400">PLN</span>}
                                    variant="flat"
                                    classNames={{ inputWrapper: "bg-zinc-100" }}
                                />
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFormData(p => ({ ...p, terms_accepted: !p.terms_accepted }))}>
                                    <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", formData.terms_accepted ? "bg-primary border-primary" : "border-zinc-300")}>
                                        {formData.terms_accepted && <Check size={14} className="text-white" />}
                                    </div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase italic tracking-tighter">
                                        Akceptuję <span className="underline" onClick={(e) => { e.stopPropagation(); setShowTerms(true); }}>Regulamin</span>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="text-center font-black text-2xl italic tracking-tighter text-zinc-900">
                            {formData.amount.toFixed(2)} PLN
                        </div>
                        {clientSecret && stripeOptions ? (
                            <Elements key={paymentStepKey} stripe={stripePromise} options={stripeOptions}>
                                <CheckoutForm clientSecret={clientSecret} email={formData.email} onClose={closeTippingModal} onBack={handleBack} />
                            </Elements>
                        ) : <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
                    </div>
                )}
            </div>

            {!showTerms && currentStep !== 3 && (
                <div className="p-6 pt-0 flex flex-col gap-3">
                    <div className="flex gap-3">
                        {currentStep > 0 && <Button variant="flat" onClick={handleBack} className="flex-1 font-bold">Wstecz</Button>}
                        <Button color="primary" onClick={handleNext} isLoading={isProcessing} className="flex-1 font-bold">DALEJ</Button>
                    </div>
                    {validationError && <p className="text-red-500 text-center text-xs font-bold">{validationError}</p>}
                </div>
            )}

            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-center items-center gap-2 grayscale opacity-40">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Secure by</span>
                <StripeLogo color="#555" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TippingModal;
