import { Sliders, CheckSquare, BookOpen, AlertTriangle } from 'lucide-react';
import { countPermutations } from '../utils/permutations';

const LABELS = {
  en: {
    title: 'Settings',
    perCombo: 'Letters per combination',
    uniqueLabel: 'Unique combinations only',
    uniqueDesc: 'Remove duplicate letter-set results',
    dictLabel: 'Highlight real words',
    tooLarge: 'Too large to generate',
    maySlow: 'May be slow',
    checking: (lang) => `Check ${lang === 'ar' ? 'Arabic' : 'English'} dictionary (first 200)`,
  },
  ar: {
    title: 'الإعدادات',
    perCombo: 'عدد الحروف في كل توليفة',
    uniqueLabel: 'توليفات فريدة فقط',
    uniqueDesc: 'إزالة التكرارات',
    dictLabel: 'تمييز الكلمات الحقيقية',
    tooLarge: 'عدد كبير جداً',
    maySlow: 'قد يكون بطيئاً',
    checking: (lang) => `فحص قاموس ${lang === 'ar' ? 'العربية' : 'الإنجليزية'} (أول 200)`,
  },
};

export default function SettingsPanel({
  letters, letterCount, onLetterCountChange,
  uniqueOnly, onUniqueOnlyChange,
  checkWords, onCheckWordsChange,
  language, uiLang = 'en',
}) {
  const n = letters.length;
  const r = letterCount;
  const total = countPermutations(n, r);
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

      {/* Slider */}
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
          desc={T.checking(language)}
          icon={<BookOpen size={12} />}
          checked={checkWords}
          onChange={onCheckWordsChange}
        />
      </div>
    </div>
  );
}

function Toggle({ label, desc, icon, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:opacity-80 text-left"
      style={{
        background: checked ? 'rgba(14,165,233,0.07)' : 'var(--surface2)',
        border: `1px solid ${checked ? 'rgba(14,165,233,0.25)' : 'var(--border)'}`,
      }}
    >
      <div style={{ color: checked ? 'var(--brand)' : 'var(--text-muted)', flexShrink: 0 }}>{icon}</div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs font-display font-medium truncate" style={{ color: 'var(--text)' }}>{label}</p>
        <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <div
        className="w-8 h-4 rounded-full relative flex-shrink-0 transition-all"
        style={{ background: checked ? 'var(--brand)' : 'var(--border)' }}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all"
          style={{ left: checked ? '17px' : '2px' }}
        />
      </div>
    </button>
  );
}
