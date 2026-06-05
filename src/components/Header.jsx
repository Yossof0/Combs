import { Sun, Moon, Globe } from 'lucide-react';

const UI_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export default function Header({ theme, onToggleTheme, uiLang, onUiLangChange }) {
  return (
    <header
      className="relative z-10 flex items-center justify-between px-5 py-3 border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display font-black"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)', color: '#fff' }}
        >
          W
        </div>
        <span className="font-display font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>
          WordComb
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Site language */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm cursor-pointer transition-all hover:opacity-80"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          title="Site language"
        >
          <Globe size={12} style={{ color: 'var(--brand)', flexShrink: 0 }} />
          <select
            value={uiLang}
            onChange={e => onUiLangChange(e.target.value)}
            className="bg-transparent border-none outline-none cursor-pointer text-xs font-mono"
            style={{ color: 'var(--text)' }}
          >
            {UI_LANGUAGES.map(o => (
              <option key={o.code} value={o.code} style={{ background: 'var(--surface)' }}>
                {o.flag} {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
          title="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun size={13} style={{ color: '#fbbf24' }} />
            : <Moon size={13} style={{ color: '#7c3aed' }} />
          }
        </button>
      </div>
    </header>
  );
}
