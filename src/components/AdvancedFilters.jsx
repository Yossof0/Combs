import { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

export default function AdvancedFilters({ filters, onChange, uiLang = 'en' }) {
  const [open, setOpen] = useState(false);
  const isAr = uiLang === 'ar';

  const set = (key, val) => onChange({ ...filters, [key]: val });

  const activeCount = Object.values(filters).filter(v => v && v.trim()).length;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 transition-all hover:opacity-80"
        style={{ background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={13} style={{ color: activeCount ? 'var(--brand)' : 'var(--text-muted)' }} />
          <span className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
            {isAr ? 'فلاتر متقدمة' : 'Advanced Filters'}
          </span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-xs font-mono font-bold"
              style={{ background: 'rgba(14,165,233,0.15)', color: 'var(--brand)' }}>
              {activeCount}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-mono pt-3" style={{ color: 'var(--text-muted)' }}>
            {isAr ? 'تُطبَّق على النتائج بعد التوليد' : 'Applied to results after generation'}
          </p>

          <FilterInput
            label={isAr ? 'يبدأ بـ' : 'Starts with'}
            value={filters.startsWith}
            onChange={v => set('startsWith', v)}
            placeholder={isAr ? 'مثال: أ' : 'e.g. A'}
          />
          <FilterInput
            label={isAr ? 'ينتهي بـ' : 'Ends with'}
            value={filters.endsWith}
            onChange={v => set('endsWith', v)}
            placeholder={isAr ? 'مثال: ب' : 'e.g. T'}
          />
          <FilterInput
            label={isAr ? 'يحتوي على' : 'Must include'}
            value={filters.mustInclude}
            onChange={v => set('mustInclude', v)}
            placeholder={isAr ? 'مثال: ر' : 'e.g. E'}
          />
          <FilterInput
            label={isAr ? 'يستثني' : 'Must exclude'}
            value={filters.mustExclude}
            onChange={v => set('mustExclude', v)}
            placeholder={isAr ? 'مثال: س' : 'e.g. X'}
          />
          <FilterInput
            label={isAr ? 'تعبير نمطي (Regex)' : 'Regex pattern'}
            value={filters.regex}
            onChange={v => set('regex', v)}
            placeholder={isAr ? 'مثال: ^[اوي]' : 'e.g. ^[AEIOU]'}
            mono
          />

          {activeCount > 0 && (
            <button
              onClick={() => onChange({ startsWith: '', endsWith: '', mustInclude: '', mustExclude: '', regex: '' })}
              className="text-xs font-display px-2 py-1 rounded transition-all hover:opacity-80"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {isAr ? 'مسح الكل' : 'Clear all filters'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FilterInput({ label, value, onChange, placeholder, mono }) {
  return (
    <div>
      <label className="block text-xs font-display mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none transition-all ${mono ? 'font-mono' : 'font-display'}`}
        style={{
          background: 'var(--surface2)',
          border: `1px solid ${value ? 'rgba(14,165,233,0.4)' : 'var(--border)'}`,
          color: 'var(--text)',
        }}
      />
    </div>
  );
}
