'use client';

import { useEffect } from 'react';
import { registerGameSW } from '@/lib/game/sw-register';

export default function SWRegistration() {
  useEffect(() => {
    registerGameSW();
  }, []);

  return null;
}
