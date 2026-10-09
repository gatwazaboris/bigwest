import type { Currency } from '@/types/site';

/** Approximate display rates relative to USD (base price currency). */
const rates: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  RWF: 1400,
};

const labels: Record<Currency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  RWF: 'Rwandan Franc',
};

export function convertFromUsd(priceUsd: number, currency: Currency) {
  return priceUsd * rates[currency];
}

export function formatPrice(priceUsd: number, currency: Currency) {
  const amount = convertFromUsd(priceUsd, currency);

  if (currency === 'RWF') {
    return `RWF ${Math.round(amount).toLocaleString('en-US')}`;
  }

  if (currency === 'EUR') {
    const value = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `€${value} EUR`;
  }

  const value = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `$${value} USD`;
}

export function currencyButtonLabel(currency: Currency) {
  if (currency === 'USD') return '$ USD';
  if (currency === 'EUR') return '€ EUR';
  return 'RWF';
}

export function currencyFullLabel(currency: Currency) {
  return labels[currency];
}
