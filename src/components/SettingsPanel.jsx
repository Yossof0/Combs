import { Sliders, CheckSquare, BookOpen, AlertTriangle, Languages, Star } from 'lucide-react';
import { countPermutations } from '../utils/permutations';

const COMBO_LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'ar', label: '🇸🇦 Arabic / عربي' },
];

const LABELS = {
  en: {
    title: 'Settings',
    comboLang: 'Combination language',
    perCombo: 'Letters per combination',
    uniqueLabel: 'Unique combinations only',
    uniqueDesc: 'Remove duplicate results',
    dictLabel: 'Highlight real words',
    realOnlyLabel: 'Show real words only',
    realOnlyDesc: 'Filter out non-dictionary results',
    tooLarge: 'Too large to generate',
    maySlow: 'May be slow',
    dictDesc: (lang) => `Check ${lang === 'ar' ? 'Arabic' : 'English'} dictionary (first 200)`,
  },
  ar: {
    title: 'الإعدادات',
    comboLang: 'لغة التوليفات',
    perCombo: 'عدد الحروف في كل توليفة',
    uniqueLabel: 'توليفات فريدة فقط',
    uniqueDesc: 'إزالة التكرارات',
    dictLabel: 'تمييز الكلمات الحقيقية',
    realOnlyLabel: 'الكلمات الحقيقية فقط',
    realOnlyDesc: 'إخفاء غير الموجودة في القاموس',
    tooLarge: 'عدد كبير جداً',
    maySlow: 'قد يكون بطيئاً',
    dictDesc: (lang) => `فحص قاموس ${lang === 'ar' ? 'العربية' : 'الإنجليزية'} (أول 200)`,
  },
};

export default function SettingsPanel({
  letters, letterCount, onLetterCountChange,
  uniqueOnly, onUniqueOnlyChange,
  checkWords, onCheckWordsChange,
  realOnly, onRealOnlyChange,
  comboLang, onComboLangChange,
  uiLang = 'en',
}) {
  const n = letters.length;
  const total = countPermutations(n, letterCount);
  const isBig = total > 100000;
  const isHuge = total > 500000;
  const T = LABELS[uiLang] || LABELS.en;

  const formatCount = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  return (
    <div className="rounded-xl p-4 space-y-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

      <div className="flex items-center gap-2">
        <Sliders size={13} style={{ color: 'var(--brand)' }} />
        <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
          {T.title}
        </h3>
      </div>

      {/* Combination language dropdown */}
      <div>
        <label className="block text-xs font-display mb-1.5" style={{ color: 'var(--text-muted)' }}>
          {T.comboLang}
        </label>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <Languages size={12} style={{ color: 'var(--brand)', flexShrink: 0 }} />
          <select
            value={comboLang}
            onChange={e => onComboLangChange(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs font-mono cursor-pointer"
            style={{ color: 'var(--text)' }}
          >
            {COMBO_LANGUAGES.map(o => (
              <option key={o.code} value={o.code} style={{ background: 'var(--surface)' }}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* Letter count slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-display" style={{ color: 'var(--text-muted)' }}>
            {T.perCombo}
          </label>
          <span className="text-sm font-mono font-bold" style={{ color: 'var(--brand)' }}>
            {letterCount}
          </span>
        </div>
        <input
          type="range" min={1} max={Math.max(1, n)}
          value={Math.min(letterCount, Math.max(1, n))}
          onChange={e => onLetterCountChange(Number(e.target.value))}
          disabled={n === 0}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-30"
          style={{ accentColor: 'var(--brand)' }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>1</span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{Math.max(1, n)}</span>
        </div>
      </div>

      {/* Estimate badge */}
      {n > 0 && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono ${
          isHuge ? 'bg-red-500/10 border border-red-500/30' :
          isBig  ? 'bg-yellow-500/10 border border-yellow-500/30' :
                   'bg-green-500/10 border border-green-500/30'
        }`}>
          {(isBig || isHuge) && <AlertTriangle size={11} className={isHuge ? 'text-red-400' : 'text-yellow-400'} />}
          <span style={{ color: isHuge ? '#f87171' : isBig ? '#facc15' : '#4ade80' }}>
            ~{formatCount(total)} combinations
            {isHuge && ` — ${T.tooLarge}`}
            {isBig && !isHuge && ` — ${T.maySlow}`}
          </span>
        </div>
      )}

      {/* Toggles */}
      <div className="space-y-2 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
        <Toggle
          label={T.uniqueLabel}
          desc={T.uniqueDesc}
          icon={<CheckSquare size={12} />}
          checked={uniqueOnly}
          onChange={onUniqueOnlyChange}
        />
        <Toggle
          label={T.dictLabel}
          desc={T.dictDesc(comboLang)}
          icon={<BookOpen size={12} />}
          checked={checkWords}
          onChange={onCheckWordsChange}
        />
        {/* Real only — only relevant when word checking is on */}
        <Toggle
          label={T.realOnlyLabel}
          desc={T.realOnlyDesc}
          icon={<Star size={12} />}
          checked={realOnly}
          onChange={onRealOnlyChange}
          disabled={!checkWords}
        />
      </div>
    </div>
  );
}

function Toggle({ label, desc, icon, checked, onChange, disabled = false }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${disabled ? 'opacity-35 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
      style={{
        background: checked && !disabled ? 'rgba(14,165,233,0.07)' : 'var(--surface2)',
        border: `1px solid ${checked && !disabled ? 'rgba(14,165,233,0.25)' : 'var(--border)'}`,
      }}
    >
      <div style={{ color: checked && !disabled ? 'var(--brand)' : 'var(--text-muted)', flexShrink: 0 }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-display font-medium truncate" style={{ color: 'var(--text)' }}>{label}</p>
        <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <div
        className="w-8 h-4 rounded-full relative flex-shrink-0 transition-all"
        style={{ background: checked && !disabled ? 'var(--brand)' : 'var(--border)' }}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all"
          style={{ left: checked && !disabled ? '17px' : '2px' }}
        />
      </div>
    </button>
  );
}
