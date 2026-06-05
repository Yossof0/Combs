import { useState, useCallback, useRef } from 'react';
import { Zap } from 'lucide-react';
import Header from './components/Header';
import LetterInput from './components/LetterInput';
import SettingsPanel from './components/SettingsPanel';
import ResultsPanel from './components/ResultsPanel';
import HistoryPanel from './components/HistoryPanel';
import Footer from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { generatePermutations, isFeasible, countPermutations } from './utils/permutations';
import { batchCheckWords } from './utils/dictionary';

const MAX_HISTORY = 5;

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
  },
};

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [uiLang, setUiLang] = useState('en');
  const [comboLang, setComboLang] = useState('en');

  const [letters, setLetters] = useState([]);
  const [letterCount, setLetterCount] = useState(1);
  const [uniqueOnly, setUniqueOnly] = useState(true);
  const [checkWords, setCheckWords] = useState(false);
  const [realOnly, setRealOnly] = useState(false);

  const [results, setResults] = useState([]);
  const [realWords, setRealWords] = useState(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCheckProgress, setWordCheckProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const abortRef = useRef(false);

  const t = UI_TEXT[uiLang] || UI_TEXT.en;
  const isRTL = uiLang === 'ar';

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
    setResults([]);
    setRealWords(new Set());
    setError('');
  };

  // Turn off realOnly automatically if checkWords is disabled
  const handleCheckWordsChange = (val) => {
    setCheckWords(val);
    if (!val) setRealOnly(false);
  };

  const generate = useCallback(async () => {
    if (letters.length === 0) {
      setError(uiLang === 'ar' ? 'أضف حرفاً واحداً على الأقل.' : 'Add at least one letter.');
      return;
    }
    setError('');
    const r = Math.min(letterCount, letters.length) || 1;
    if (!isFeasible(letters.length, r)) {
      const count = countPermutations(letters.length, r).toLocaleString();
      setError(
        uiLang === 'ar'
          ? `عدد التوليفات كبير جداً (${count}). قلل الحروف أو الطول.`
          : `Too many combinations (${count}). Reduce letters or length.`
      );
      return;
    }

    setIsGenerating(true);
    setResults([]);
    setRealWords(new Set());
    setWordCheckProgress(null);
    abortRef.current = false;

    await new Promise(resolve => setTimeout(resolve, 10));

    try {
      const perms = generatePermutations(letters, r);
      setResults(perms);
      setIsGenerating(false);

      setHistory(prev => [
        { letters: [...letters], letterCount: r, resultCount: perms.length, comboLang },
        ...prev.slice(0, MAX_HISTORY - 1)
      ]);

      if (checkWords && perms.length > 0) {
        setWordCheckProgress({ done: 0, total: Math.min(perms.length, 200) });
        const found = await batchCheckWords(perms, comboLang, 200, (done, total) => {
          if (!abortRef.current) setWordCheckProgress({ done, total });
        });
        if (!abortRef.current) {
          setRealWords(found);
          setWordCheckProgress(null);
        }
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setIsGenerating(false);
    }
  }, [letters, letterCount, checkWords, comboLang, uiLang]);

  const restoreHistory = (entry) => {
    setLetters(entry.letters);
    setLetterCount(entry.letterCount);
    setComboLang(entry.comboLang || 'en');
    setResults([]);
    setRealWords(new Set());
  };

  const canGenerate = letters.length > 0 && !isGenerating
    && isFeasible(letters.length, Math.min(letterCount, letters.length));

  return (
    <div
      className="min-h-screen flex flex-col grid-noise"
      style={{ background: 'var(--bg)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        uiLang={uiLang}
        onUiLangChange={setUiLang}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Title */}
        <div className="pt-4 pb-2">
          <h2
            className="font-display font-bold text-2xl md:text-3xl tracking-tight"
            style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            {t.title}
          </h2>
          <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Step 1 */}
            <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <StepLabel num="1" label={t.step1} />
              <LetterInput
                letters={letters}
                onChange={handleLettersChange}
                language={comboLang}
                maxLetters={12}
              />
            </div>

            {/* Step 2 */}
            <div>
              <StepLabel num="2" label={t.step2} padded />
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
            </div>

            {/* Step 3 */}
            <div>
              <StepLabel num="3" label={t.step3} padded />
              {error && (
                <div className="mb-3 px-3 py-2 rounded-lg text-xs font-mono"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                  {error}
                </div>
              )}
              <button
                onClick={generate}
                disabled={!canGenerate}
                className="w-full py-3 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: canGenerate ? 'linear-gradient(135deg, #0ea5e9, #7c3aed)' : 'var(--surface2)',
                  color: canGenerate ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: canGenerate ? '0 4px 18px rgba(14,165,233,0.25)' : 'none',
                }}
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    {t.generateBtn}
                  </>
                )}
              </button>
            </div>

            <HistoryPanel
              history={history}
              onRestore={restoreHistory}
              onClear={() => setHistory([])}
              uiLang={uiLang}
            />
          </div>

          {/* Right column */}
          <div className="lg:col-span-2">
            {results.length === 0 && !isGenerating ? (
              <div
                className="rounded-xl flex flex-col items-center justify-center py-20 text-center"
                style={{ border: '1px dashed var(--border)', background: 'var(--surface)' }}
              >
                <div className="text-3xl mb-3 opacity-40">⌨</div>
                <p className="font-display font-medium text-sm" style={{ color: 'var(--text)' }}>
                  {t.emptyTitle}
                </p>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                  {t.emptyHint}
                </p>
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StepLabel({ num, label, padded }) {
  return (
    <div className={`flex items-center gap-2 mb-3 ${padded ? 'px-1' : ''}`}>
      <span
        className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-display font-bold flex-shrink-0"
        style={{ background: 'var(--brand)' }}
      >
        {num}
      </span>
      <span className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
        {label}
      </span>
    </div>
  );
}
