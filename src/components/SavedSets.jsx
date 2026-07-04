import { useState, useEffect } from 'react';
import { Bookmark, Trash2, Plus, FolderOpen } from 'lucide-react';
const STORAGE_KEY = 'wc-saved-sets';
function loadSets() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]; } catch { return []; } }
export default function SavedSets({ letters, comboLang, letterCount, onRestore, uiLang='en' }) {
  const [sets, setSets] = useState(loadSets);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const isAr = uiLang === 'ar';
  useEffect(()=>{ localStorage.setItem(STORAGE_KEY, JSON.stringify(sets)); }, [sets]);
  const save = () => {
    if (!letters.length) return;
    const label = name.trim() || letters.join('')+` (${letterCount})`;
    setSets(prev=>[{ id:Date.now(), name:label, letters, comboLang, letterCount }, ...prev.slice(0,9)]);
    setNaming(false); setName('');
  };
  return (
    <div className="rounded-xl p-4" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bookmark size={13} style={{ color:'var(--brand)' }}/>
          <h3 className="font-display font-semibold text-sm" style={{ color:'var(--text)' }}>{isAr?'المجموعات المحفوظة':'Saved Sets'}</h3>
        </div>
        <button onClick={()=>{setNaming(n=>!n);setName('');}} disabled={!letters.length}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-display transition-all hover:opacity-80 disabled:opacity-30"
          style={{ background:'rgba(14,165,233,0.1)', border:'1px solid rgba(14,165,233,0.25)', color:'var(--brand)' }}>
          <Plus size={10}/> {isAr?'حفظ':'Save current'}
        </button>
      </div>
      {naming && (
        <div className="flex gap-2 mb-3">
          <input autoFocus value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')save();if(e.key==='Escape')setNaming(false);}}
            placeholder={isAr?'اسم المجموعة...':'Set name (optional)...'}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono outline-none"
            style={{ background:'var(--surface2)', border:'1px solid var(--brand)', color:'var(--text)' }}/>
          <button onClick={save} className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold hover:opacity-80"
            style={{ background:'var(--brand)', color:'#fff' }}>{isAr?'حفظ':'Save'}</button>
        </div>
      )}
      {sets.length===0 ? (
        <div className="text-center py-4">
          <FolderOpen size={20} className="mx-auto mb-1 opacity-20" style={{ color:'var(--text)' }}/>
          <p className="text-xs font-mono" style={{ color:'var(--text-muted)' }}>{isAr?'لا توجد مجموعات محفوظة':'No saved sets yet'}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sets.map(s=>(
            <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg group transition-all hover:opacity-90"
              style={{ background:'var(--surface2)', border:'1px solid var(--border)' }}>
              <button onClick={()=>onRestore(s)} className="flex-1 min-w-0 text-left">
                <p className="text-xs font-display font-medium truncate" style={{ color:'var(--text)' }}>{s.name}</p>
                <p className="text-xs font-mono" style={{ color:'var(--text-muted)' }}>{s.letters.join(' ')} · r={s.letterCount}</p>
              </button>
              <button onClick={()=>setSets(prev=>prev.filter(x=>x.id!==s.id))}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded" style={{ color:'#ef4444' }}>
                <Trash2 size={11}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
