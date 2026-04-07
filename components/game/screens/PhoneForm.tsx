'use client'

import { useState } from 'react'

interface PhoneFormProps {
  onSubmit: (name: string, phone: string, lang: 'uz' | 'ru', avatarId: 'male' | 'female') => void
}

function formatPhone(digits: string): string {
  const d = digits.slice(0, 9)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`
  if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)}-${d.slice(5)}`
  return `${d.slice(0, 2)} ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`
}

export default function PhoneForm({ onSubmit }: PhoneFormProps) {
  const [name, setName] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [lang, setLang] = useState<'uz' | 'ru'>('uz')
  const [avatarId, setAvatarId] = useState<'male' | 'female'>('male')

  const isValid = name.trim().length > 0 && phoneDigits.length === 9

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw.length <= 9) {
      setPhoneDigits(raw)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    onSubmit(name.trim(), `+998${phoneDigits}`, lang, avatarId)
  }

  const inputClass =
    'w-full max-w-sm bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#4a90d9]'

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center h-dvh bg-neutral-950 text-white p-6"
    >
      <h1 className="text-3xl font-bold mb-1">Sales School</h1>
      <p className="text-white/60 mb-8">RPG тренажёр продаж</p>

      {/* Name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ваше имя"
        required
        className={`${inputClass} mb-4`}
      />

      {/* Phone */}
      <div className={`${inputClass} mb-4 flex items-center gap-1`}>
        <span className="text-white/60 select-none">+998</span>
        <input
          type="tel"
          value={formatPhone(phoneDigits)}
          onChange={handlePhoneChange}
          placeholder="XX XXX-XX-XX"
          className="bg-transparent flex-1 outline-none text-white placeholder:text-white/40"
        />
      </div>

      {/* Language toggle */}
      <div className="flex gap-2 mb-6 w-full max-w-sm">
        {(['uz', 'ru'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm uppercase tracking-wide transition-colors ${
              lang === l
                ? 'bg-[#4a90d9] text-white'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Avatar */}
      <div className="flex gap-3 mb-8 w-full max-w-sm">
        {([
          { id: 'male' as const, emoji: '👨', uz: 'Erkak', ru: 'Мужской' },
          { id: 'female' as const, emoji: '👩', uz: 'Ayol', ru: 'Женский' },
        ]).map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAvatarId(a.id)}
            className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-colors ${
              avatarId === a.id
                ? 'border-[#4a90d9] bg-[#4a90d9]/10'
                : 'border-white/20 bg-white/5'
            }`}
          >
            <span className="text-4xl">{a.emoji}</span>
            <span className="text-sm text-white/80">
              {lang === 'uz' ? a.uz : a.ru}
            </span>
          </button>
        ))}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid}
        className={`w-full max-w-sm py-3 rounded-xl font-semibold bg-blue-600 text-white transition-opacity ${
          !isValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
        }`}
      >
        {lang === 'uz' ? "O'ynash" : 'Играть'}
      </button>
    </form>
  )
}
