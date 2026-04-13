export interface PhoneCountry {
  id: string
  flag: string
  name: string
  code: string
  mask: string
  digits: number
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { id: 'UZ', flag: '🇺🇿', name: 'Uzbekistan',    code: '+998', mask: 'XX XXX-XX-XX',   digits: 9 },
  { id: 'RU', flag: '🇷🇺', name: 'Russia',         code: '+7',   mask: 'XXX XXX-XX-XX',  digits: 10 },
  { id: 'KZ', flag: '🇰🇿', name: 'Kazakhstan',     code: '+7',   mask: 'XXX XXX-XX-XX',  digits: 10 },
  { id: 'KG', flag: '🇰🇬', name: 'Kyrgyzstan',     code: '+996', mask: 'XXX XXX-XXX',    digits: 9 },
  { id: 'TJ', flag: '🇹🇯', name: 'Tajikistan',     code: '+992', mask: 'XX XXX-XXXX',    digits: 9 },
  { id: 'TM', flag: '🇹🇲', name: 'Turkmenistan',   code: '+993', mask: 'XX XXXXXX',      digits: 8 },
  { id: 'UA', flag: '🇺🇦', name: 'Ukraine',        code: '+380', mask: 'XX XXX-XX-XX',   digits: 9 },
  { id: 'AZ', flag: '🇦🇿', name: 'Azerbaijan',     code: '+994', mask: 'XX XXX-XX-XX',   digits: 9 },
  { id: 'GE', flag: '🇬🇪', name: 'Georgia',        code: '+995', mask: 'XXX XX-XX-XX',   digits: 9 },
  { id: 'TR', flag: '🇹🇷', name: 'Türkiye',        code: '+90',  mask: 'XXX XXX-XX-XX',  digits: 10 },
  { id: 'AE', flag: '🇦🇪', name: 'UAE',            code: '+971', mask: 'XX XXX-XXXX',    digits: 9 },
  { id: 'US', flag: '🇺🇸', name: 'USA',            code: '+1',   mask: 'XXX-XXX-XXXX',   digits: 10 },
  { id: 'DE', flag: '🇩🇪', name: 'Germany',        code: '+49',  mask: 'XXX XXXXXXXX',   digits: 11 },
  { id: 'KR', flag: '🇰🇷', name: 'South Korea',    code: '+82',  mask: 'XX-XXXX-XXXX',   digits: 10 },
  { id: 'GB', flag: '🇬🇧', name: 'United Kingdom', code: '+44',  mask: 'XXXX XXX-XXX',   digits: 10 },
]

export const DEFAULT_COUNTRY_ID = 'UZ'

export function getCountryById(id: string): PhoneCountry {
  return PHONE_COUNTRIES.find((c) => c.id === id) ?? PHONE_COUNTRIES[0]
}

export function formatByMask(digits: string, mask: string): string {
  let i = 0
  let result = ''
  for (const ch of mask) {
    if (i >= digits.length) break
    if (ch === 'X') {
      result += digits[i++]
    } else {
      result += ch
    }
  }
  return result
}
