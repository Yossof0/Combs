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

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [language, setLanguage] = useState('en');
  const [letters, setLetters] = useState([]);
  const [letterCount, setLetterCount] = useState(1);
  const [uniqueOnly, setUniqueOnly] = useState(true);
  const [checkWords, setCheckWords] = useState(false);
  const [results, setResults] = useState([]);
  const [realWords, setRealWords] = useState(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCheckProgress, setWordCheckProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const abortRef = useRef(false);

  const handleLetterCountChange = (val) => {
    setLetterCount(Math.min(val, Math.max(1, letters.length)));
  };

  const handleLettersChange = (newLetters) => {
    setLetters(newLetters);
    setLetterCount(prev => Math.min(prev, Math.max(1, newLetters.length)));
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setLetters([]);
    setResults([]);
    setRealWords(new Set());
    setError('');
  };

  const generate = useCallback(async () => {
    if (letters.length === 0) {
      setError('Add at least one letter to generate combinations.');
      return;
    }
    setError('');
    const r = Math.min(letterCount, letters.length) || 1;
    if (!isFeasible(letters.length, r)) {
      setError('Too many combinations (' + countPermutations(letters.length, r).toLocaleString() + '). Reduce letters or letter count.');
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
        { letters: [...letters], letterCount: r, resultCount: perms.length, language },
        ...prev.slice(0, MAX_HISTORY - 1)
      ]);

      if (checkWords && perms.length > 0) {
        setWordCheckProgress({ done: 0, total: Math.min(perms.length, 200) });
        const found = await batchCheckWords(
          perms,
          language,
          200,
          (done, total) => {
            if (!abortRef.current) setWordCheckProgress({ done, total });
          }
        );
        if (!abortRef.current) {
          setRealWords(found);
          setWordCheckProgress(null);
        }
      }
    } catch (e) {
      setError('Something went wrong generating combinations.');
      setIsGenerating(false);
    }
  }, [letters, letterCount, checkWords, language]);

  const restoreHistory = (entry) => {
    setLetters(entry.letters);
    setLetterCount(entry.letterCount);
    setLanguage(entry.language || 'en');
    setResults([]);
    setRealWords(new Set());
  };

  const clearHistory = () => setHistory([]);

  const isArabic = language === 'ar';
  const canGenerate = letters.length > 0 && !isGenerating && isFeasible(letters.length, Math.min(letterCount, letters.length));

  return (
    <div
      className="min-h-screen flex flex-col grid-noise"
      style={{ background: 'var(--bg)' }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="text-center py-4">
          <h2 className="font-display font-black text-3xl md:text-4xl mb-2" style={{ color: 'var(--text)' }}>
            {isArabic ? 'حاسبة التوليفات' : 'Word Combination'}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--brand), #7c3aed)' }}>
              {' '}Calculator
            </span>
          </h2>
          <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
            {isArabic
              ? 'أدخل الحروف وشاهد كل التوليفات الممكنة'
              : 'Enter letters · choose length · generate every possible arrangement'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs"
                  style={{ background: 'var(--brand)' }}>1</span>
                {isArabic ? 'أضف الحروف' : 'Add Letters'}
              </h3>
              <LetterInput
                letters={letters}
                onChange={handleLettersChange}
                language={language}
                maxLetters={12}
              />
            </div>

            <div>
              <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2 px-1" style={{ color: 'var(--text)' }}>
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs"
                  style={{ background: 'var(--brand)' }}>2</span>
                {isArabic ? 'الإعدادات' : 'Configure'}
              </h3>
              <SettingsPanel
                letters={letters}
                letterCount={Math.min(letterCount, Math.max(1, letters.length))}
                onLetterCountChange={handleLetterCountChange}
                uniqueOnly={uniqueOnly}
                onUniqueOnlyChange={setUniqueOnly}
                checkWords={checkWords}
                onCheckWordsChange={setCheckWords}
                language={language}
              />
            </div>

            <div>
              <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2 px-1" style={{ color: 'var(--text)' }}>
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs"
                  style={{ background: 'var(--brand)' }}>3</span>
                {isArabic ? 'توليد' : 'Generate'}
              </h3>
              {error && (
                <div className="mb-3 px-3 py-2 rounded-lg text-xs font-mono"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                  {error}
                </div>
              )}
              <button
                onClick={generate}
                disabled={!canGenerate}
                className="w-full py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: canGenerate
                    ? 'linear-gradient(135deg, var(--brand), #7c3aed)'
                    : 'var(--surface2)',
                  color: canGenerate ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: canGenerate ? '0 4px 20px rgba(14,165,233,0.3)' : 'none',
                }}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap size={15} />
                    {isArabic ? 'توليد التوليفات' : 'Generate Combinations'}
                  </>
                )}
              </button>
            </div>

            <HistoryPanel
              history={history}
              onRestore={restoreHistory}
              onClear={clearHistory}
            />
          </div>

          <div className="lg:col-span-2">
            {results.length === 0 && !isGenerating ? (
              <div className="rounded-xl flex flex-col items-center justify-center py-20 text-center"
                style={{ border: '1px dashed var(--border)', background: 'var(--surface)' }}>
                <div className="text-4xl mb-3">🔡</div>
                <p className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
                  {isArabic ? 'النتائج ستظهر هنا' : 'Results will appear here'}
                </p>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                  {isArabic ? 'أضف حروفاً واضغط توليد' : 'Add letters and click Generate'}
                </p>
              </div>
            ) : (
              <ResultsPanel
                results={results}
                realWords={realWords}
                isLoading={isGenerating}
                wordCheckProgress={wordCheckProgress}
                language={language}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
