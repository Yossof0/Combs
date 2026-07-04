import { Keyboard } from 'lucide-react';
const SHORTCUTS = [
  { keys:['Ctrl','Enter'], action:'Generate combinations' },
  { keys:['Escape'], action:'Clear all letters' },
  { keys:['Enter'], action:'Add char (in input)' },
  { keys:['Backspace'], action:'Remove last char' },
];
export default function KeyboardShortcuts({ uiLang='en' }) {
  const isAr = uiLang==='ar';
  return (
    <div className="rounded-xl p-4" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Keyboard size={13} style={{ color:'var(--brand)' }}/>
        <h3 className="font-display font-semibold text-sm" style={{ color:'var(--text)' }}>{isAr?'اختصارات لوحة المفاتيح':'Keyboard Shortcuts'}</h3>
      </div>
      <div className="space-y-2">
        {SHORTCUTS.map((s,i)=>(
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="text-xs font-mono" style={{ color:'var(--text-muted)' }}>{s.action}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {s.keys.map((k,j)=>(
                <span key={j} className="px-1.5 py-0.5 rounded text-xs font-mono font-semibold"
                  style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)' }}>{k}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
