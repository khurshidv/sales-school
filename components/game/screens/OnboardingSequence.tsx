'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import SceneRenderer from '@/components/game/engine/SceneRenderer';
import OnboardingDialogue from './onboarding/OnboardingDialogue';
import OnboardingLangSelect from './onboarding/OnboardingLangSelect';
import OnboardingCharacterSelect from './onboarding/OnboardingCharacterSelect';
import {
  ONBOARDING_STEPS,
  getStepText,
} from '@/game/data/onboarding/onboardingScript';
import type { Language, CharacterOnScreen } from '@/game/engine/types';

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (
    'standalone' in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  ) return true;
  return window.matchMedia?.('(display-mode: standalone)').matches ?? false;
}

const IOS_HINT_COPY = {
  title: { uz: "To'liq ekran uchun", ru: 'Для полноэкранного режима' },
  body: {
    uz: "iPhone'da to'liq ekran rejimi faqat sahifa Bosh ekranga qo'shilgandan keyin ishlaydi.",
    ru: 'На iPhone полноэкранный режим работает только после добавления страницы на экран «Домой».',
  },
  steps: {
    uz: [
      "Safari'da pastdagi «Ulashish» tugmasini bosing",
      "«Bosh ekranga qo'shish»ni tanlang",
      "Bosh ekrandagi yangi ikonkadan o'yinni oching",
    ],
    ru: [
      'В Safari нажмите кнопку «Поделиться» внизу',
      'Выберите «На экран "Домой"»',
      'Запустите игру с новой иконки на рабочем столе',
    ],
  },
  close: { uz: 'Tushundim', ru: 'Понятно' },
} as const;

interface OnboardingSequenceProps {
  onSubmit: (
    name: string,
    phone: string,
    lang: Language,
    avatarId: 'male' | 'female',
  ) => void;
}

export default function OnboardingSequence({
  onSubmit,
}: OnboardingSequenceProps) {
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Language>('uz');
  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenApiSupported, setFullscreenApiSupported] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    setFullscreenApiSupported(typeof document !== 'undefined' && Boolean(document.fullscreenEnabled));
    setIsIOS(detectIOS());
    setIsStandalone(detectStandalone());
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    onChange();
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  async function handleToggleFullscreen(e: React.MouseEvent) {
    e.stopPropagation();
    if (!fullscreenApiSupported) {
      if (isIOS) setShowIOSHint(true);
      return;
    }
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch { /* ignore */ }
  }

  const showFullscreenButton = !isStandalone && (fullscreenApiSupported || isIOS);

  const currentStep = ONBOARDING_STEPS[step];
  const stepText = getStepText(currentStep, lang, name);
  const speakerName = currentStep.speakerName[lang];

  // Characters on screen — Rustam when showRustam is true
  const characters: CharacterOnScreen[] = currentStep.showRustam
    ? [{ id: 'rustam', emotion: currentStep.rustamEmotion, position: 'right' }]
    : [];

  function advance() {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  function handleLangSelect(selectedLang: Language) {
    setLang(selectedLang);
    advance();
  }

  function handleNameConfirm() {
    if (name.trim().length > 0) advance();
  }

  function handlePhoneConfirm() {
    if (phoneDigits.length === 9) advance();
  }

  function handleAvatarSelect(avatarId: 'male' | 'female') {
    onSubmit(name.trim(), `+998${phoneDigits}`, lang, avatarId);
  }

  // Render the correct overlay based on step type
  function renderStepContent() {
    switch (currentStep.type) {
      case 'dialogue':
        return (
          <OnboardingDialogue
            key={`dialogue-${step}`}
            text={stepText}
            speakerName={speakerName}
            onAdvance={advance}
            onGoBack={goBack}
            canGoBack={step > 0}
            lang={lang}
          />
        );

      case 'lang_select':
        return (
          <OnboardingLangSelect
            key={`lang-${step}`}
            text={stepText}
            speakerName={speakerName}
            onSelect={handleLangSelect}
          />
        );

      case 'name_input':
        return (
          <OnboardingDialogue
            key={`name-${step}`}
            text={stepText}
            speakerName={speakerName}
            onAdvance={handleNameConfirm}
            onGoBack={goBack}
            canGoBack={step > 0}
            lang={lang}
            inputConfig={{
              type: 'text',
              value: name,
              onChange: setName,
              placeholder: currentStep.inputPlaceholder?.[lang] ?? '',
              isValid: name.trim().length > 0,
            }}
          />
        );

      case 'phone_input':
        return (
          <OnboardingDialogue
            key={`phone-${step}`}
            text={stepText}
            speakerName={speakerName}
            onAdvance={handlePhoneConfirm}
            onGoBack={goBack}
            canGoBack={step > 0}
            lang={lang}
            inputConfig={{
              type: 'tel',
              value: phoneDigits,
              onChange: setPhoneDigits,
              placeholder: currentStep.inputPlaceholder?.[lang] ?? '',
              prefix: '+998',
              isValid: phoneDigits.length === 9,
            }}
          />
        );

      case 'character_select':
        return (
          <OnboardingCharacterSelect
            key={`avatar-${step}`}
            promptText={stepText}
            lang={lang}
            onSelect={handleAvatarSelect}
          />
        );

      default:
        return null;
    }
  }

  return (
    <>
      <SceneRenderer
        backgroundId={currentStep.background}
        characters={characters}
        activeSpeaker="rustam"
      >
        {/* Onboarding HUD — step progress dots + fullscreen button */}
        <div
          className="absolute top-0 left-0 right-0 z-20 h-7 sm:h-10 flex justify-between items-center px-2 sm:px-3"
          style={{ background: 'rgba(0, 0, 0, 0.4)' }}
          onClick={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Step progress dots */}
          <div className="flex items-center gap-1">
            {ONBOARDING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i === step
                    ? 'w-3 h-1.5 bg-white'
                    : i < step
                      ? 'w-1.5 h-1.5 bg-white/50'
                      : 'w-1.5 h-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Fullscreen button */}
          {showFullscreenButton && (
            <button
              onClick={handleToggleFullscreen}
              className="text-white/60 hover:text-white cursor-pointer flex items-center justify-center"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <m.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          >
            {renderStepContent()}
          </m.div>
        </AnimatePresence>
      </SceneRenderer>

      {/* iOS fullscreen hint modal */}
      {showIOSHint && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center px-4"
          onClick={() => setShowIOSHint(false)}
        >
          <div
            className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">{IOS_HINT_COPY.title[lang]}</h3>
            <p className="text-sm text-neutral-300 mb-4 leading-relaxed">
              {IOS_HINT_COPY.body[lang]}
            </p>
            <ol className="text-sm text-neutral-200 space-y-2 mb-5 list-decimal pl-5">
              {IOS_HINT_COPY.steps[lang].map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <button
              onClick={() => setShowIOSHint(false)}
              className="bg-blue-600 hover:bg-blue-700 w-full py-2.5 rounded-xl text-white font-semibold transition-colors"
            >
              {IOS_HINT_COPY.close[lang]}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
