import { useState, useRef } from 'react';
import { X, RotateCcw, Shuffle } from 'lucide-react';

const CHIP_COLORS = [
  { bg: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.4)', text: '#0ea5e9' },
  { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)', text: '#f97316' },
  { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', text: '#a855f7' },
  { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#22c55e' },
  { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)', text: '#ec4899' },
  { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', text: '#ca8a04' },
];

const ARABIC_LETTERS = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split(' ');
const ENGLISH_LETTERS = 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(' ');
const DIGITS = '0 1 2 3 4 5 6 7 8 9'.split(' ');

// Valid chars: Arabic letters, Latin letters A-Z, digits 0-9
function isValidChar(char, language) {
  if (/^[0-9]$/.test(char)) return true;
  if (language === 'ar') return /^[\u0600-\u06FF]$/.test(char);
  return /^[A-Za-z]$/.test(char);
}

function normalizeChar(char, language) {
  if (/^[0-9]$/.test(char)) return char;
  if (language === 'ar') return char;
  return char.toUpperCase();
}

export default function LetterInput({ letters, onChange, language, maxLetters = 12 }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const isArabic = language === 'ar';
  const quickLetters = isArabic ? ARABIC_LETTERS : ENGLISH_LETTERS;

  const addChar = (char) => {
    if (letters.length >= maxLetters) return;
    if (!isValidChar(char, language)) return;
    onChange([...letters, normalizeChar(char, language)]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const val = input.trim();
      if (val) {
        const chars = [...val]
          .filter(c => isValidChar(c, language))
          .map(c => normalizeChar(c, language))
          .slice(0, maxLetters - letters.length);
        onChange([...letters, ...chars]);
        setInput('');
      }
    }
    if (e.key === 'Backspace' && input === '' && letters.length > 0) {
      onChange(letters.slice(0, -1));
    }
  };

  const removeLetter = (index) => onChange(letters.filter((_, i) => i !== index));
  const clearAll = () => onChange([]);
  const shuffle = () => onChange([...letters].sort(() => Math.random() - 0.5));

  return (
    <div className="space-y-4">
      {/* Chip input box */}
      <div
        className="min-h-[60px] rounded-xl p-3 flex flex-wrap gap-2 items-center cursor-text transition-all"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        onClick={() => inputRef.current?.focus()}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {letters.map((letter, i) => {
          const color = CHIP_COLORS[i % CHIP_COLORS.length];
          return (
            <span key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-mono font-semibold animate-pop select-none"
              style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }}>
              {letter}
              <button onClick={(e) => { e.stopPropagation(); removeLetter(i); }}
                className="opacity-60 hover:opacity-100 transition-opacity ml-0.5">
                <X size={10} />
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={letters.length === 0
            ? (isArabic ? 'اكتب حرفاً أو رقماً واضغط Enter...' : 'Type a letter or number and press Enter...')
            : ''}
          className="flex-1 min-w-[140px] bg-transparent outline-none text-sm font-mono"
          style={{ color: 'var(--text)', direction: isArabic ? 'rtl' : 'ltr' }}
          disabled={letters.length >= maxLetters}
        />
      </div>

      {/* Counter + actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {letters.length}/{maxLetters}
        </span>
        {letters.length > 0 && (
          <div className="flex gap-2">
            <button onClick={shuffle}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-display transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <Shuffle size={11} /> Shuffle
            </button>
            <button onClick={clearAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-display transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
              <RotateCcw size={11} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Quick add — letters */}
      <div>
        <p className="text-xs font-display mb-2" style={{ color: 'var(--text-muted)' }}>
          {isArabic ? 'حروف:' : 'Letters:'}
        </p>
        <div className="flex flex-wrap gap-1.5" dir={isArabic ? 'rtl' : 'ltr'}>
          {quickLetters.map(l => (
            <button key={l} onClick={() => addChar(l)} disabled={letters.length >= maxLetters}
              className="w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Quick add — digits */}
      <div>
        <p className="text-xs font-display mb-2" style={{ color: 'var(--text-muted)' }}>
          {isArabic ? 'أرقام:' : 'Numbers:'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DIGITS.map(d => (
            <button key={d} onClick={() => addChar(d)} disabled={letters.length >= maxLetters}
              className="w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7' }}>
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
