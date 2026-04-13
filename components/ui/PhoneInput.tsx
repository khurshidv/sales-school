'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  PHONE_COUNTRIES,
  DEFAULT_COUNTRY_ID,
  getCountryById,
  formatByMask,
  type PhoneCountry,
} from '@/lib/phone-countries'

interface PhoneInputProps {
  value: string
  countryId?: string
  onChange: (digits: string, countryId: string, fullPhone: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  dropdownClassName?: string
}

export default function PhoneInput({
  value,
  countryId = DEFAULT_COUNTRY_ID,
  onChange,
  placeholder,
  className = '',
  inputClassName = '',
  dropdownClassName = '',
}: PhoneInputProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const country = getCountryById(countryId)
  const formatted = formatByMask(value, country.mask)
  const placeholderText = placeholder ?? country.mask.replace(/X/g, '0')

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  const handleDigitChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '')
      const clamped = raw.slice(0, country.digits)
      onChange(clamped, countryId, `${country.code}${clamped}`)
    },
    [country, countryId, onChange],
  )

  function selectCountry(c: PhoneCountry) {
    setOpen(false)
    // Reset digits when switching country (different digit count)
    const clamped = value.slice(0, c.digits)
    onChange(clamped, c.id, `${c.code}${clamped}`)
    // Focus input after selection
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="flex items-center">
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-1 shrink-0 select-none cursor-pointer"
          aria-label="Select country code"
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="text-sm opacity-60">{country.code}</span>
          <svg
            className={`w-3 h-3 opacity-40 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 5l3 3 3-3" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-5 mx-2.5 opacity-20 bg-current shrink-0" />

        {/* Phone input */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          value={formatted}
          onChange={handleDigitChange}
          placeholder={placeholderText}
          className={`flex-1 bg-transparent outline-none min-w-0 ${inputClassName}`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className={`absolute left-0 right-0 z-50 mt-2 max-h-56 overflow-y-auto rounded-xl shadow-lg border ${
            dropdownClassName ||
            'bg-white border-gray-200'
          }`}
        >
          {PHONE_COUNTRIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selectCountry(c)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                c.id === countryId
                  ? 'font-semibold'
                  : ''
              } ${
                dropdownClassName
                  ? 'hover:bg-white/10'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span className="flex-1 truncate">{c.name}</span>
              <span className="opacity-50 text-xs">{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
