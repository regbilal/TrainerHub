import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', key: 'lang.en' },
  { code: 'ar', key: 'lang.ar' },
  { code: 'fr', key: 'lang.fr' },
  { code: 'es', key: 'lang.es' },
];

export default function LanguagePicker({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const textColor = variant === 'dark' ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900';
  const dropdownBg = 'bg-white border border-gray-200 shadow-lg';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`p-1 transition-colors ${textColor}`}
        aria-label="Language"
      >
        <Globe className="h-5 w-5" />
      </button>
      {open && (
        <div className={`absolute end-0 top-full mt-1 rounded-lg ${dropdownBg} py-1 z-50 min-w-[130px]`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
              className={`w-full text-start px-3 py-2 text-sm transition-colors ${
                i18n.language === lang.code
                  ? 'bg-teal-50 text-teal-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t(lang.key)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
