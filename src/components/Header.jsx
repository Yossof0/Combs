import { Sun, Moon, Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export default function Header({ theme, onToggleTheme, language, onLanguageChange }) {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-display font-black"
          style={{ background: 'linear-gradient(135deg, var(--brand), #7c3aed)', color: '#fff' }}>
          W
        </div>
        <div>
          <h1 className="font-display font-bold text-base leading-none" style={{ color: 'var(--text)' }}>
            WordComb
          </h1>
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            Combination Calculator
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Language Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-display cursor-pointer transition-all hover:opacity-80"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <Globe size={13} style={{ color: 'var(--brand)' }} />
            <select
              value={language}
              onChange={e => onLanguageChange(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-sm font-display pr-1"
              style={{ color: 'var(--text)' }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} style={{ background: 'var(--surface)' }}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          title="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun size={15} style={{ color: '#fbbf24' }} />
            : <Moon size={15} style={{ color: '#7c3aed' }} />
          }
        </button>
      </div>
    </header>
  );
}
