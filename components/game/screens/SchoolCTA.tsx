'use client';

import { motion } from 'framer-motion';

interface SchoolCTAProps {
  ending: 'grandmaster' | 'success' | 'partial' | 'failure';
  lang: 'uz' | 'ru';
  playerPhone?: string;
  onConsultation: () => void;
  onDismiss: () => void;
}

const headlines: Record<SchoolCTAProps['ending'], { uz: string; ru: string }> = {
  grandmaster: {
    uz: 'Siz tayyor. Keyingi qadam — professional bo\'lish.',
    ru: 'Вы готовы. Следующий шаг — стать профессионалом.',
  },
  success: {
    uz: 'Sizda asos bor. Professional dastur uni ko\'paytiradi.',
    ru: 'У вас есть база. Профессиональная программа её умножит.',
  },
  partial: {
    uz: 'O\'rganish istagi — bu allaqachon birinchi qadam.',
    ru: 'Желание учиться — это уже первый шаг.',
  },
  failure: {
    uz: 'Har bir mutaxassis bir paytlar yangi boshlovchi bo\'lgan.',
    ru: 'Каждый эксперт когда-то был новичком.',
  },
};

const ctaText: Record<SchoolCTAProps['ending'], { uz: string; ru: string }> = {
  grandmaster: {
    uz: 'Karyeramni boshlash uchun konsultatsiya olishga tayyorman',
    ru: 'Я готов получить консультацию, чтобы начать карьеру',
  },
  success: {
    uz: 'Dastur haqida ko\'proq bilmoqchiman',
    ru: 'Расскажите подробнее о программе',
  },
  partial: {
    uz: 'Ko\'nikmalarimni rivojlantirmoqchiman',
    ru: 'Хочу развить свои навыки',
  },
  failure: {
    uz: 'O\'rganishga tayyorman',
    ru: 'Я готов начать обучение',
  },
};

const schoolInfo = {
  tagline: {
    uz: 'Sales School — 3 oyda professional sotuvchi tayyorlaydi',
    ru: 'Sales School — готовит профессиональных продавцов за 3 месяца',
  },
  features: {
    uz: 'Shaxsiy mentor + amaliy mashg\'ulotlar + real mijozlar bilan simulyatsiya',
    ru: 'Личный ментор + практические занятия + симуляции с реальными клиентами',
  },
  results: {
    uz: 'Bitiruvchilar 6 oy ichida 2-3 baravar ko\'p ishlaydi',
    ru: 'Выпускники зарабатывают в 2-3 раза больше за 6 месяцев',
  },
};

const dismissText = { uz: 'Balki keyinroq', ru: 'Может позже' };

export default function SchoolCTA({
  ending,
  lang,
  playerPhone,
  onConsultation,
  onDismiss,
}: SchoolCTAProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1225 50%, #0f172a 100%)',
      }}
    >
      <motion.div
        className="flex flex-col items-center max-w-lg w-full px-6 py-8 gap-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Headline */}
        <motion.h1
          className="text-2xl md:text-3xl font-bold leading-tight"
          style={{ color: '#f9fafb' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {headlines[ending][lang]}
        </motion.h1>

        {/* School info */}
        <motion.div
          className="flex flex-col gap-3 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div
            className="rounded-xl px-5 py-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: '#e5e7eb' }}>
              {schoolInfo.tagline[lang]}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
              {schoolInfo.features[lang]}
            </p>
          </div>

          <div
            className="rounded-xl px-5 py-3"
            style={{
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.15)',
            }}
          >
            <p className="text-sm" style={{ color: '#86efac' }}>
              {schoolInfo.results[lang]}
            </p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          onClick={onConsultation}
          className="w-full rounded-xl px-6 py-4 text-sm font-semibold transition-all relative overflow-hidden"
          style={{
            color: '#0a0a0a',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            boxShadow: [
              '0 0 15px rgba(251,191,36,0.2)',
              '0 0 30px rgba(251,191,36,0.35)',
              '0 0 15px rgba(251,191,36,0.2)',
            ],
          }}
          transition={{
            opacity: { delay: 0.8, duration: 0.4 },
            scale: { delay: 0.8, duration: 0.4 },
            boxShadow: { delay: 1.2, duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {ctaText[ending][lang]}
        </motion.button>

        {/* Dismiss */}
        <motion.button
          onClick={onDismiss}
          className="text-xs py-2 transition-colors"
          style={{ color: '#6b7280' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ color: '#9ca3af' }}
        >
          {dismissText[lang]}
        </motion.button>
      </motion.div>
    </div>
  );
}
