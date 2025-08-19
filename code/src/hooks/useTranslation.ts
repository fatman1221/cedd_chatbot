import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations';
import type { Language } from '../types';

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = (key: string): string => {
    return getTranslation(key as any, language as Language);
  };

  return { t };
}