'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import SceneRenderer from '@/components/game/engine/SceneRenderer';
import OnboardingDialogue from './onboarding/OnboardingDialogue';
import OnboardingLangSelect from './onboarding/OnboardingLangSelect';
import OnboardingCharacterSelect from './onboarding/OnboardingCharacterSelect';
import {
  ONBOARDING_STEPS,
  getStepText,
} from '@/game/data/onboarding/onboardingScript';
import type { Language, CharacterOnScreen } from '@/game/engine/types';

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
    <SceneRenderer
      backgroundId={currentStep.background}
      characters={characters}
      activeSpeaker="rustam"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
    </SceneRenderer>
  );
}
