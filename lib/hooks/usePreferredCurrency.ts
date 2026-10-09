'use client';

import { useEffect, useState } from 'react';
import type { Currency } from '@/types/site';
import { currencies } from '@/lib/constants/site';

const STORAGE_KEY = 'visit_kibuye_currency';

function isCurrency(value: string): value is Currency {
  return (currencies as string[]).includes(value);
}

export function readStoredCurrency(): Currency {
  if (typeof window === 'undefined') return 'USD';
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value && isCurrency(value)) return value;
  } catch {
    // ignore
  }
  return 'USD';
}

export function writeStoredCurrency(currency: Currency) {
  try {
    window.localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    // ignore
  }
}

export function usePreferredCurrency(defaultCurrency: Currency = 'USD') {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    setCurrencyState(readStoredCurrency());

    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue && isCurrency(event.newValue)) {
        setCurrencyState(event.newValue);
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function setCurrency(next: Currency) {
    setCurrencyState(next);
    writeStoredCurrency(next);
  }

  return { currency, setCurrency };
}
