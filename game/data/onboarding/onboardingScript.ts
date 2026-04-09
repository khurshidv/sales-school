// ============================================================
// Onboarding Script — Pure TS, no React
// RPG-style registration dialogue with Rustam as guide
// ============================================================

import type { Language, LocalizedText } from '@/game/engine/types';

export type OnboardingStepType =
  | 'dialogue'
  | 'lang_select'
  | 'name_input'
  | 'phone_input'
  | 'character_select';

export interface OnboardingStep {
  id: string;
  type: OnboardingStepType;
  background: string;
  rustamEmotion: string;
  showRustam: boolean;
  speakerName: LocalizedText;
  text: LocalizedText;
  inputPlaceholder?: LocalizedText;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  // Step 0 — Welcome
  {
    id: 'welcome',
    type: 'dialogue',
    background: 'bg_showroom_entrance',
    rustamEmotion: 'friendly',
    showRustam: true,
    speakerName: { uz: 'Rustam', ru: 'Рустам' },
    text: {
      uz: "Salom! SalesUp'ga xush kelibsiz! Men Rustam — bu avtosalonning menejeri. Sizni yangi xodim sifatida ko'rib turganimdan xursandman!",
      ru: 'Привет! Добро пожаловать в SalesUp! Я Рустам — менеджер этого автосалона. Рад видеть тебя в качестве нового сотрудника!',
    },
  },

  // Step 1 — Language select
  {
    id: 'lang_select',
    type: 'lang_select',
    background: 'bg_showroom_entrance',
    rustamEmotion: 'friendly',
    showRustam: true,
    speakerName: { uz: 'Rustam', ru: 'Рустам' },
    text: {
      uz: 'Avval tilni tanlang — qaysi tilda gaplashamiz?',
      ru: 'Сначала выберите язык — на каком языке будем общаться?',
    },
  },

  // Step 2 — Ask name (dialogue)
  {
    id: 'ask_name',
    type: 'dialogue',
    background: 'bg_showroom',
    rustamEmotion: 'friendly',
    showRustam: true,
    speakerName: { uz: 'Rustam', ru: 'Рустам' },
    text: {
      uz: "Ajoyib! Endi tanishaylik — ismingiz nima?",
      ru: 'Отлично! Давайте познакомимся — как вас зовут?',
    },
  },

  // Step 3 — Name input
  {
    id: 'name_input',
    type: 'name_input',
    background: 'bg_showroom',
    rustamEmotion: 'friendly',
    showRustam: true,
    speakerName: { uz: 'Rustam', ru: 'Рустам' },
    text: {
      uz: 'Ismingizni kiriting:',
      ru: 'Введите ваше имя:',
    },
    inputPlaceholder: {
      uz: 'Ismingiz',
      ru: 'Ваше имя',
    },
  },

  // Step 4 — Phone input
  {
    id: 'phone_input',
    type: 'phone_input',
    background: 'bg_showroom',
    rustamEmotion: 'friendly',
    showRustam: true,
    speakerName: { uz: 'Rustam', ru: 'Рустам' },
    text: {
      uz: '{name}, telefon raqamingizni qoldiring — shunda biz siz bilan bog\'lana olamiz.',
      ru: '{name}, оставьте ваш номер телефона — так мы сможем с вами связаться.',
    },
    inputPlaceholder: {
      uz: 'XX XXX-XX-XX',
      ru: 'XX XXX-XX-XX',
    },
  },

  // Step 5 — Transition to character select
  {
    id: 'pre_avatar',
    type: 'dialogue',
    background: 'bg_showroom',
    rustamEmotion: 'proud',
    showRustam: true,
    speakerName: { uz: 'Rustam', ru: 'Рустам' },
    text: {
      uz: "Zo'r, {name}! Endi o'z avataringizni tanlang — saloningizda qanday ko'rinishda bo'lasiz?",
      ru: 'Отлично, {name}! Теперь выберите свой аватар — как вы будете выглядеть в салоне?',
    },
  },

  // Step 6 — Character/avatar select
  {
    id: 'character_select',
    type: 'character_select',
    background: 'bg_showroom',
    rustamEmotion: 'proud',
    showRustam: false,
    speakerName: { uz: '', ru: '' },
    text: {
      uz: "O'z avataringizni tanlang",
      ru: 'Выберите свой аватар',
    },
  },
];

/** Resolve {name} placeholders in step text */
export function resolveText(text: string, playerName: string): string {
  return text.replace(/\{name\}/g, playerName);
}

/** Get localized text for current language with name resolution */
export function getStepText(
  step: OnboardingStep,
  lang: Language,
  playerName: string,
): string {
  return resolveText(step.text[lang], playerName);
}
