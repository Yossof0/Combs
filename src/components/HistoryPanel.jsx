import { Clock, ChevronRight, Trash2 } from 'lucide-react';

export default function HistoryPanel({ history, onRestore, onClear, uiLang = 'en' }) {
  if (!history.length) return null;

  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={13} style={{ color: 'var(--brand)' }} />
          <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
            {uiLang === 'ar' ? 'السجل' : 'History'}
          </h3>
        </div>
        <button
          onClick={onClear}
          className="text-xs font-display flex items-center gap-1 px-2 py-1 rounded-lg transition-all hover:opacity-80"
          style={{ color: 'var(--text-muted)', background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <Trash2 size={10} /> Clear
        </button>
      </div>

      <div className="space-y-1.5">
        {history.map((entry, i) => (
          <button
            key={i}
            onClick={() => onRestore(entry)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all hover:scale-[1.01] hover:opacity-90 group"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
          >
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {entry.letters.map((l, j) => (
                <span key={j} className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--brand)' }}>
                  {l}
                </span>
              ))}
              <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(249,115,22,0.1)', color: 'var(--accent)' }}>
                r={entry.letterCount}
              </span>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-mono font-bold" style={{ color: 'var(--brand)' }}>
                {entry.resultCount.toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>combos</div>
            </div>
            <ChevronRight size={12} style={{ color: 'var(--text-muted)' }}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}
