import { useState, useCallback, useRef, useEffect } from 'react';
import { Zap, Grid, Gamepad2, Link, Upload } from 'lucide-react';
import Header from './components/Header';
import LetterInput from './components/LetterInput';
import SettingsPanel from './components/SettingsPanel';
import ResultsPanel from './components/ResultsPanel';
import HistoryPanel from './components/HistoryPanel';
import SavedSets from './components/SavedSets';
import AdvancedFilters from './components/AdvancedFilters';
import StatsPanel from './components/StatsPanel';
import GamePanel from './components/GamePanel';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import Footer from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { generatePermutations, isFeasible, countPermutations } from './utils/permutations';
import { batchCheckWords } from './utils/dictionary';
import { encodeStateToUrl, decodeStateFromUrl } from './utils/shareUrl';

const MAX_HISTORY = 5;

const EMPTY_FILTERS = { startsWith: '', endsWith: '', mustInclude: '', mustExclude: '', regex: '' };

const UI_TEXT = {
  en: {
    title: 'Combination Calculator',
    subtitle: 'Enter letters · choose length · generate every possible arrangement',
    step1: 'Add Letters',
    step2: 'Configure',
    step3: 'Generate',
    generateBtn: 'Generate Combinations',
    generating: 'Generating...',
    emptyTitle: 'Results will appear here',
    emptyHint: 'Add letters and click Generate',
    tabResults: 'Results',
    tabGame: 'Game Mode',
    importPlaceholder: 'Paste text to extract letters...',
    importBtn: 'Import',
    shareBtn: 'Share',
    shareCopied: 'Link copied!',
  },
  ar: {
    title: 'حاسبة التوليفات',
    subtitle: 'أدخل الحروف · اختر الطول · ولّد كل ترتيب ممكن',
    step1: 'أضف الحروف',
    step2: 'الإعدادات',
    step3: 'توليد',
    generateBtn: 'توليد التوليفات',
    generating: 'جارٍ التوليد...',
    emptyTitle: 'النتائج ستظهر هنا',
    emptyHint: 'أضف حروفاً واضغط توليد',
    tabResults: 'النتائج',
    tabGame: 'وضع اللعبة',
    importPlaceholder: 'الصق نصاً لاستخراج الحروف...',
    importBtn: 'استيراد',
    shareBtn: 'مشاركة',
    shareCopied: 'تم النسخ!',
  },
};

function applyFilters(results, filters) {
  let r = results;
  const sw = filters.startsWith?.trim().toUpperCase();
  const ew = filters.endsWith?.trim().toUpperCase();
  const mi = filters.mustInclude?.trim().toUpperCase();
  const me = filters.mustExclude?.trim().toUpperCase();
  const rx = filters.regex?.trim();

  if (sw) r = r.filter(w => w.startsWith(sw));
  if (ew) r = r.filter(w => w.endsWith(ew));
  if (mi) r = r.filter(w => w.includes(mi));
  if (me) r = r.filter(w => !w.includes(me));
  if (rx) {
    try { const re = new RegExp(rx, 'i'); r = r.filter(w => re.test(w)); } catch {}
  }
  return r;
}

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [uiLang, setUiLang] = useState('en');
  const [comboLang, setComboLang] = useState('en');

  const [letters, setLetters] = useState([]);
  const [letterCount, setLetterCount] = useState(1);
  const [uniqueOnly, setUniqueOnly] = useState(true);
  const [checkWords, setCheckWords] = useState(false);
  const [realOnly, setRealOnly] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [rawResults, setRawResults] = useState([]);
  const [results, setResults] = useState([]);
  const [realWords, setRealWords] = useState(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCheckProgress, setWordCheckProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('results');

  // Import from text
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  // Share URL
  const [shareCopied, setShareCopied] = useState(false);

  const abortRef = useRef(false);
  const t = UI_TEXT[uiLang] || UI_TEXT.en;
  const isRTL = uiLang === 'ar';

  // Load from URL on mount
  useEffect(() => {
    const state = decodeStateFromUrl();
    if (state) {
      if (state.letters) setLetters(state.letters);
      if (state.letterCount) setLetterCount(state.letterCount);
      if (state.comboLang) setComboLang(state.comboLang);
      if (state.uniqueOnly !== null) setUniqueOnly(state.uniqueOnly);
      // Clear URL params without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Re-apply filters whenever rawResults or filters change
  useEffect(() => {
    setResults(applyFilters(rawResults, filters));
  }, [rawResults, filters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setLetters([]);
        setRawResults([]);
        setError('');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('generate-btn')?.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLetterCountChange = (val) => {
    setLetterCount(Math.min(val, Math.max(1, letters.length)));
  };

  const handleLettersChange = (newLetters) => {
    setLetters(newLetters);
    setLetterCount(prev => Math.min(prev, Math.max(1, newLetters.length)));
  };

  const handleComboLangChange = (lang) => {
    setComboLang(lang);
    setLetters([]);
    setRawResults([]);
    setError('');
  };

  const handleCheckWordsChange = (val) => {
    setCheckWords(val);
    if (!val) setRealOnly(false);
  };

  const runGenerate = useCallback(async (overrideLetters, overrideCount, overrideLang) => {
    const useLetters = overrideLetters || letters;
    const useCount = overrideCount || Math.min(letterCount, useLetters.length) || 1;
    const useLang = overrideLang || comboLang;

    if (!useLetters.length) {
      setError(uiLang === 'ar' ? 'أضف حرفاً واحداً على الأقل.' : 'Add at least one letter.');
      return;
    }
    setError('');
    const r = Math.min(useCount, useLetters.length) || 1;
    if (!isFeasible(useLetters.length, r)) {
      const count = countPermutations(useLetters.length, r).toLocaleString();
      setError(uiLang === 'ar'
        ? `عدد التوليفات كبير جداً (${count}). قلل الحروف أو الطول.`
        : `Too many combinations (${count}). Reduce letters or length.`);
      return;
    }

    setIsGenerating(true);
    setRawResults([]);
    setRealWords(new Set());
    setWordCheckProgress(null);
    abortRef.current = false;

    await new Promise(resolve => setTimeout(resolve, 10));

    try {
      const perms = generatePermutations(useLetters, r);
      setRawResults(perms);
      setIsGenerating(false);

      setHistory(prev => [
        { letters: [...useLetters], letterCount: r, resultCount: perms.length, comboLang: useLang },
        ...prev.slice(0, MAX_HISTORY - 1)
      ]);

      if (checkWords && perms.length > 0) {
        setWordCheckProgress({ done: 0, total: Math.min(perms.length, 200) });
        const found = await batchCheckWords(perms, useLang, 200, (done, total) => {
          if (!abortRef.current) setWordCheckProgress({ done, total });
        });
        if (!abortRef.current) {
          setRealWords(found);
          setWordCheckProgress(null);
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setIsGenerating(false);
    }
  }, [letters, letterCount, checkWords, comboLang, uiLang]);

  const restoreHistory = useCallback((entry) => {
    const l = entry.letters;
    const r = entry.letterCount;
    const lang = entry.comboLang || 'en';
    setLetters(l);
    setLetterCount(r);
    setComboLang(lang);
    setRawResults([]);
    setRealWords(new Set());
    setError('');
    runGenerate(l, r, lang);
  }, [runGenerate]);

  const restoreSavedSet = (entry) => {
    setLetters(entry.letters);
    setLetterCount(entry.letterCount);
    setComboLang(entry.comboLang || 'en');
    setRawResults([]);
    setRealWords(new Set());
  };

  const importFromText = () => {
    if (!importText.trim()) return;
    const arabicChars = [...importText].filter(c => /[\u0600-\u06FF]/.test(c));
    const latinChars = [...importText.toUpperCase()].filter(c => /[A-Z]/.test(c));
    const chars = comboLang === 'ar' ? arabicChars : latinChars;
    const unique = [...new Set(chars)].slice(0, 12);
    if (unique.length) {
      handleLettersChange(unique);
      setImportText('');
      setShowImport(false);
    }
  };

  const shareUrl = () => {
    const url = encodeStateToUrl({ letters, letterCount, comboLang, uniqueOnly });
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const canGenerate = letters.length > 0 && !isGenerating
    && isFeasible(letters.length, Math.min(letterCount, letters.length));

  const TABS = [
    { id: 'results', label: t.tabResults, icon: <Grid size={13} /> },
    { id: 'game', label: t.tabGame, icon: <Gamepad2 size={13} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col grid-noise" style={{ background: 'var(--bg)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header theme={theme} onToggleTheme={toggleTheme} uiLang={uiLang} onUiLangChange={setUiLang} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Title */}
        <div className="pt-3 pb-1">
          <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight"
            style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {t.title}
          </h2>
          <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── Left column ── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Step 1 — Letters */}
            <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <StepLabel num="1" label={t.step1} />
                <div className="flex gap-1.5">
                  {/* Import from text */}
                  <button onClick={() => setShowImport(o => !o)} title="Import from text"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: showImport ? 'rgba(14,165,233,0.1)' : 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <Upload size={11} />
                  </button>
                  {/* Share URL */}
                  <button onClick={shareUrl} title="Copy share link"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: shareCopied ? 'rgba(34,197,94,0.1)' : 'var(--surface2)', border: `1px solid ${shareCopied ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`, color: shareCopied ? '#22c55e' : 'var(--text-muted)' }}>
                    <Link size={11} />
                  </button>
                </div>
              </div>

              {showImport && (
                <div className="flex gap-2 mb-3">
                  <input
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && importFromText()}
                    placeholder={t.importPlaceholder}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono outline-none"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--brand)', color: 'var(--text)' }}
                    dir={comboLang === 'ar' ? 'rtl' : 'ltr'}
                  />
                  <button onClick={importFromText}
                    className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all hover:opacity-80"
                    style={{ background: 'var(--brand)', color: '#fff' }}>
                    {t.importBtn}
                  </button>
                </div>
              )}

              <LetterInput letters={letters} onChange={handleLettersChange} language={comboLang} maxLetters={12} />
            </div>

            {/* Step 2 — Settings */}
            <div>
              <StepLabel num="2" label={t.step2} padded />
              <div className="space-y-3">
                <SettingsPanel
                  letters={letters}
                  letterCount={Math.min(letterCount, Math.max(1, letters.length))}
                  onLetterCountChange={handleLetterCountChange}
                  uniqueOnly={uniqueOnly}
                  onUniqueOnlyChange={setUniqueOnly}
                  checkWords={checkWords}
                  onCheckWordsChange={handleCheckWordsChange}
                  realOnly={realOnly}
                  onRealOnlyChange={setRealOnly}
                  comboLang={comboLang}
                  onComboLangChange={handleComboLangChange}
                  uiLang={uiLang}
                />
                <AdvancedFilters filters={filters} onChange={setFilters} uiLang={uiLang} />
              </div>
            </div>

            {/* Step 3 — Generate */}
            <div>
              <StepLabel num="3" label={t.step3} padded />
              {error && (
                <div className="mb-3 px-3 py-2 rounded-lg text-xs font-mono"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                  {error}
                </div>
              )}
              <button
                id="generate-btn"
                onClick={() => runGenerate()}
                disabled={!canGenerate}
                className="w-full py-3 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: canGenerate ? 'linear-gradient(135deg, #0ea5e9, #7c3aed)' : 'var(--surface2)',
                  color: canGenerate ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: canGenerate ? '0 4px 18px rgba(14,165,233,0.25)' : 'none',
                }}>
                {isGenerating ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t.generating}</>
                ) : (
                  <><Zap size={14} />{t.generateBtn}</>
                )}
              </button>
              <p className="text-center text-xs font-mono mt-2" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                Ctrl + Enter
              </p>
            </div>

            {/* Saved Sets */}
            <SavedSets
              letters={letters}
              comboLang={comboLang}
              letterCount={Math.min(letterCount, Math.max(1, letters.length))}
              onRestore={restoreSavedSet}
              uiLang={uiLang}
            />

            {/* History */}
            <HistoryPanel history={history} onRestore={restoreHistory} onClear={() => setHistory([])} uiLang={uiLang} />

            {/* Keyboard shortcuts */}
            <KeyboardShortcuts uiLang={uiLang} />
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tab bar */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              {TABS.map(tb => (
                <button key={tb.id} onClick={() => setTab(tb.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-display font-semibold transition-all"
                  style={{
                    color: tab === tb.id ? 'var(--brand)' : 'var(--text-muted)',
                    borderBottom: tab === tb.id ? '2px solid var(--brand)' : '2px solid transparent',
                    background: 'transparent',
                  }}>
                  {tb.icon} {tb.label}
                </button>
              ))}
            </div>

            {tab === 'results' ? (
              <>
                {/* Stats */}
                {rawResults.length > 0 && (
                  <StatsPanel results={rawResults} realWords={realWords} language={comboLang} uiLang={uiLang} />
                )}

                {results.length === 0 && !isGenerating ? (
                  <div className="rounded-xl flex flex-col items-center justify-center py-20 text-center"
                    style={{ border: '1px dashed var(--border)', background: 'var(--surface)' }}>
                    <div className="text-3xl mb-3 opacity-40">⌨</div>
                    <p className="font-display font-medium text-sm" style={{ color: 'var(--text)' }}>{t.emptyTitle}</p>
                    <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>{t.emptyHint}</p>
                  </div>
                ) : (
                  <ResultsPanel
                    results={results}
                    realWords={realWords}
                    realOnly={realOnly}
                    isLoading={isGenerating}
                    wordCheckProgress={wordCheckProgress}
                    language={comboLang}
                    uiLang={uiLang}
                  />
                )}
              </>
            ) : (
              <GamePanel results={rawResults} realWords={realWords} language={comboLang} uiLang={uiLang} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StepLabel({ num, label, padded }) {
  return (
    <div className={`flex items-center gap-2 ${padded ? 'px-1 mb-3' : 'mb-0'}`}>
      <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-display font-bold flex-shrink-0"
        style={{ background: 'var(--brand)' }}>{num}</span>
      <span className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>{label}</span>
    </div>
  );
}
