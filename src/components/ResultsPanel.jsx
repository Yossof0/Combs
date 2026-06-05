import { useState, useMemo } from 'react';
import { Search, Copy, Download, ChevronLeft, ChevronRight, BookOpen, Filter } from 'lucide-react';

const PAGE_SIZE = 60;

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
  { value: 'len-asc', label: 'Length ↑' },
  { value: 'len-desc', label: 'Length ↓' },
  { value: 'real-first', label: 'Real words first' },
];

export default function ResultsPanel({ results, realWords, realOnly = false, isLoading, wordCheckProgress, language, uiLang = 'en' }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const isArabic = language === 'ar';

  const filtered = useMemo(() => {
    let r = results;
    if (realOnly) r = r.filter(w => realWords.has(w));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(w => w.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'az': return [...r].sort((a, b) => a.localeCompare(b));
      case 'za': return [...r].sort((a, b) => b.localeCompare(a));
      case 'len-asc': return [...r].sort((a, b) => a.length - b.length);
      case 'len-desc': return [...r].sort((a, b) => b.length - a.length);
      case 'real-first': return [...r].sort((a, b) => {
        if (realWords.has(a) && !realWords.has(b)) return -1;
        if (!realWords.has(a) && realWords.has(b)) return 1;
        return 0;
      });
      default: return r;
    }
  }, [results, search, sort, realOnly, realWords]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleSort = (e) => { setSort(e.target.value); setPage(1); };

  const copyAll = () => {
    navigator.clipboard.writeText(filtered.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportTxt = () => {
    const blob = new Blob([filtered.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `combinations-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  if (!results.length && !isLoading) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
      {/* Toolbar */}
      <div className="p-3 border-b flex flex-wrap gap-2 items-center" style={{ borderColor: 'var(--border)' }}>
        {/* Stats */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-xs font-mono flex-shrink-0">
            <span className="font-bold" style={{ color: 'var(--brand)' }}>{filtered.length.toLocaleString()}</span>
            <span style={{ color: 'var(--text-muted)' }}>/{results.length.toLocaleString()} results</span>
          </div>
          {realWords.size > 0 && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-display"
              style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#22c55e'
              }}
            >
              <BookOpen size={10} />
              {realWords.size} real words
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Filter results..."
            className="pl-7 pr-3 py-1.5 rounded-lg text-xs font-mono outline-none transition-all"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              width: '140px'
            }}
            dir={isArabic ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={handleSort}
          className="px-2 py-1.5 rounded-lg text-xs font-display outline-none"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value} style={{ background: 'var(--surface)' }}>{o.label}</option>
          ))}
        </select>

        {/* Actions */}
        <div className="flex gap-1.5">
          <button
            onClick={copyAll}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-display transition-all hover:scale-105 active:scale-95"
            style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--surface2)', border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`, color: copied ? '#22c55e' : 'var(--text)' }}
          >
            <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={exportTxt}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-display transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <Download size={11} /> Export
          </button>
        </div>
      </div>

      {/* Word check progress */}
      {wordCheckProgress && wordCheckProgress.total > 0 && wordCheckProgress.done < wordCheckProgress.total && (
        <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-between text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Checking dictionary...</span>
            <span>{wordCheckProgress.done}/{wordCheckProgress.total}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(wordCheckProgress.done / wordCheckProgress.total) * 100}%`, background: 'var(--brand)' }}
            />
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: 'var(--brand)', animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : (
          <div
            className="grid gap-1.5 scrollbar-thin"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))' }}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            {paginated.map((word, i) => {
              const isReal = realWords.has(word);
              return (
                <div
                  key={`${word}-${i}`}
                  className={`px-2 py-1.5 rounded-lg text-center text-xs font-mono font-medium transition-all hover:scale-105 cursor-default select-all animate-fade-in ${isReal ? 'real-word' : 'word-chip'}`}
                  title={isReal ? '✓ Real word' : word}
                >
                  {word}
                  {isReal && <span className="block text-green-400 text-[8px] leading-none mt-0.5">✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-3 pb-3 flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-display disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <ChevronLeft size={12} /> Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className="w-7 h-7 rounded-lg text-xs font-mono transition-all hover:scale-110"
                  style={{
                    background: page === pageNum ? 'var(--brand)' : 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: page === pageNum ? '#fff' : 'var(--text)',
                    fontWeight: page === pageNum ? 700 : 400,
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-display disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
