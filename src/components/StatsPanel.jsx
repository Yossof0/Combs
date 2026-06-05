import { BarChart2 } from 'lucide-react';

const EN_VOWELS = new Set(['A','E','I','O','U']);
const AR_VOWELS = new Set(['ا','و','ي','ى','ئ','ؤ']);

export default function StatsPanel({ results, realWords, language, uiLang = 'en' }) {
  if (!results.length) return null;

  const isAr = uiLang === 'ar';
  const vowelSet = language === 'ar' ? AR_VOWELS : EN_VOWELS;

  // Letter frequency across all results
  const freq = {};
  results.forEach(w => [...w].forEach(c => { freq[c] = (freq[c] || 0) + 1; }));
  const sortedFreq = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxFreq = sortedFreq[0]?.[1] || 1;

  // Starting letter distribution
  const startFreq = {};
  results.forEach(w => { startFreq[w[0]] = (startFreq[w[0]] || 0) + 1; });
  const topStart = Object.entries(startFreq).sort((a, b) => b[1] - a[1])[0];

  // Vowel/consonant split (across first result as sample)
  const sample = results[0] || '';
  const vowelCount = [...sample].filter(c => vowelSet.has(c)).length;
  const consonantCount = sample.length - vowelCount;

  const realPct = realWords.size > 0
    ? Math.round((realWords.size / Math.min(results.length, 200)) * 100)
    : null;

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <BarChart2 size={13} style={{ color: 'var(--brand)' }} />
        <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
          {isAr ? 'إحصاءات' : 'Insights'}
        </h3>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 gap-2">
        <StatPill
          label={isAr ? 'أكثر بداية' : 'Top start'}
          value={topStart ? `${topStart[0]} (${topStart[1]})` : '—'}
          color="var(--brand)"
        />
        <StatPill
          label={isAr ? 'طول النتيجة' : 'Result length'}
          value={`${sample.length} ${isAr ? 'حروف' : 'letters'}`}
          color="#a855f7"
        />
        <StatPill
          label={isAr ? 'حروف العلة' : 'Vowels/Cons'}
          value={`${vowelCount}/${consonantCount}`}
          color="#f97316"
        />
        {realPct !== null && (
          <StatPill
            label={isAr ? 'كلمات حقيقية' : 'Real words'}
            value={`${realPct}%`}
            color="#22c55e"
          />
        )}
      </div>

      {/* Letter frequency chart */}
      {sortedFreq.length > 0 && (
        <div>
          <p className="text-xs font-display mb-2" style={{ color: 'var(--text-muted)' }}>
            {isAr ? 'تكرار الحروف' : 'Letter frequency'}
          </p>
          <div className="space-y-1.5">
            {sortedFreq.map(([letter, count]) => (
              <div key={letter} className="flex items-center gap-2">
                <span className="w-5 text-center text-xs font-mono font-bold flex-shrink-0" style={{ color: 'var(--brand)' }}>
                  {letter}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(count / maxFreq) * 100}%`, background: 'linear-gradient(90deg, var(--brand), #7c3aed)' }}
                  />
                </div>
                <span className="text-xs font-mono w-8 text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-display font-bold mt-0.5" style={{ color }}>{value}</p>
    </div>
  );
}
