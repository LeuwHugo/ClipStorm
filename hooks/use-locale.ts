'use client';

import { useState, useEffect } from 'react';
import { Locale, defaultLocale } from '@/lib/i18n';

export const useLocale = () => {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get locale from localStorage or use default
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && ['en', 'fr', 'es'].includes(savedLocale)) {
      setLocale(savedLocale);
    }
    setLoading(false);
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  return { locale, changeLocale, loading };
};