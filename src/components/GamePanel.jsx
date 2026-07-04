import { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, RotateCcw, Zap } from 'lucide-react';
import { checkEnglishWord, checkArabicWord } from '../utils/dictionary';
import { fireConfetti, fireSmallConfetti } from '../utils/confetti';

function WordChallenge({ results, realWords, language, uiLang }) {
  const [input, setInput] = useState(''); const [found, setFound] = useState([]); const [wrong, setWrong] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60); const [running, setRunning] = useState(false); const [done, setDone] = useState(false);
  const inputRef = useRef(null); const isAr = uiLang==='ar';
  const resultSet = new Set(results.map(r=>r.toUpperCase()));
  useEffect(()=>{
    if (!running) return;
    if (timeLeft<=0){setRunning(false);setDone(true);return;}
    const t=setTimeout(()=>setTimeLeft(n=>n-1),1000); return ()=>clearTimeout(t);
  },[running,timeLeft]);
  const start=()=>{setFound([]);setWrong([]);setTimeLeft(60);setRunning(true);setDone(false);setTimeout(()=>inputRef.current?.focus(),50);};
  const submit=async()=>{
    const word=input.trim().toUpperCase(); setInput('');
    if(!word||found.includes(word)||wrong.includes(word)) return;
    const inResults=resultSet.has(word);
    const checkFn=language==='ar'?checkArabicWord:checkEnglishWord;
    const isReal=realWords.has(word)||(inResults&&await checkFn(word.toLowerCase()));
    if(inResults&&isReal){setFound(prev=>[...prev,word]);fireSmallConfetti();}
    else setWrong(prev=>[...prev,word]);
  };
  const pct=timeLeft/60; const tc=pct>0.5?'#22c55e':pct>0.25?'#facc15':'#f87171';
  if(!running&&!done) return (
    <div className="text-center py-8 space-y-3">
      <div className="text-4xl">🎮</div>
      <p className="font-display font-semibold" style={{ color:'var(--text)' }}>{isAr?'تحدي الكلمات':'Word Challenge'}</p>
      <p className="text-xs font-mono max-w-xs mx-auto" style={{ color:'var(--text-muted)' }}>{isAr?'لديك 60 ثانية لإيجاد أكبر عدد من الكلمات الحقيقية':'60 seconds to find as many real words as you can'}</p>
      <button onClick={start} className="px-6 py-2.5 rounded-xl font-display font-semibold text-sm transition-all hover:scale-105"
        style={{ background:'linear-gradient(135deg, #0ea5e9, #7c3aed)', color:'#fff' }}>{isAr?'ابدأ!':'Start!'}</button>
    </div>
  );
  if(done) return (
    <div className="text-center space-y-4 py-4">
      <Trophy size={32} className="mx-auto" style={{ color:'#fbbf24' }}/>
      <div><p className="font-display font-bold text-2xl" style={{ color:'var(--text)' }}>{found.length}</p>
        <p className="text-xs font-mono" style={{ color:'var(--text-muted)' }}>{isAr?`كلمة صحيحة وجدتها!`:`real word${found.length!==1?'s':''} found!`}</p></div>
      {found.length>0&&<div className="flex flex-wrap gap-1.5 justify-center">{found.map(w=><span key={w} className="px-2 py-1 rounded text-xs font-mono font-semibold" style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#22c55e' }}>{w}</span>)}</div>}
      <button onClick={start} className="flex items-center gap-1.5 mx-auto px-4 py-2 rounded-lg font-display font-semibold text-sm hover:opacity-80"
        style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)' }}><RotateCcw size={13}/>{isAr?'مرة أخرى':'Play again'}</button>
    </div>
  );
  return (
    <div className="space-y-3">
      <div><div className="flex justify-between text-xs font-mono mb-1.5"><span style={{ color:'var(--text-muted)' }}>{isAr?'الوقت المتبقي':'Time left'}</span><span style={{ color:tc, fontWeight:700 }}>{timeLeft}s</span></div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background:'var(--surface2)' }}><div className="h-full rounded-full transition-all" style={{ width:`${(timeLeft/60)*100}%`, background:tc }}/></div></div>
      <div className="flex gap-2">
        <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}
          placeholder={isAr?'اكتب كلمة...':'Type a word...'} dir={language==='ar'?'rtl':'ltr'}
          className="flex-1 px-3 py-2 rounded-lg text-sm font-mono outline-none"
          style={{ background:'var(--surface2)', border:'1px solid var(--brand)', color:'var(--text)' }}/>
        <button onClick={submit} className="px-4 py-2 rounded-lg font-display font-semibold text-sm hover:opacity-80"
          style={{ background:'var(--brand)', color:'#fff' }}>{isAr?'أدخل':'Enter'}</button>
      </div>
      <div className="flex gap-4 text-sm font-mono"><span style={{ color:'#22c55e' }}>✓ {found.length}</span><span style={{ color:'#f87171' }}>✗ {wrong.length}</span></div>
      {found.length>0&&<div className="flex flex-wrap gap-1.5">{found.map(w=><span key={w} className="px-2 py-1 rounded text-xs font-mono font-semibold" style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#22c55e' }}>{w}</span>)}</div>}
    </div>
  );
}

function QuizMode({ results, language, uiLang }) {
  const [queue, setQueue]=useState([]); const [current, setCurrent]=useState(null);
  const [score, setScore]=useState({correct:0,wrong:0}); const [feedback, setFeedback]=useState(null);
  const [checking, setChecking]=useState(false); const [done, setDone]=useState(false);
  const isAr=uiLang==='ar';
  const buildQueue=useCallback(()=>{
    const s=[...results].sort(()=>Math.random()-0.5).slice(0,20);
    setQueue(s.slice(1)); setCurrent(s[0]||null); setScore({correct:0,wrong:0}); setFeedback(null); setDone(false);
  },[results]);
  const answer=useCallback(async(guessReal)=>{
    if(!current||checking||feedback) return; setChecking(true);
    const checkFn=language==='ar'?checkArabicWord:checkEnglishWord;
    const isReal=await checkFn(current.toLowerCase());
    const correct=guessReal===isReal;
    setFeedback({correct,isReal});
    setScore(s=>({...s,[correct?'correct':'wrong']:s[correct?'correct':'wrong']+1}));
    if(correct&&isReal) fireSmallConfetti();
    setChecking(false);
  },[current,checking,feedback,language]);
  const next=()=>{ if(queue.length===0){setDone(true);return;} setCurrent(queue[0]); setQueue(q=>q.slice(1)); setFeedback(null); };
  const total=score.correct+score.wrong; const pct=total?Math.round((score.correct/total)*100):0;
  if(!results.length) return <div className="text-center py-10"><p className="text-sm font-mono" style={{ color:'var(--text-muted)' }}>{isAr?'ولّد توليفات أولاً':'Generate combinations first'}</p></div>;
  if(!current&&!done) return (
    <div className="text-center py-8 space-y-3">
      <div className="text-4xl">🧠</div>
      <p className="font-display font-semibold" style={{ color:'var(--text)' }}>{isAr?'وضع الاختبار':'Quiz Mode'}</p>
      <p className="text-xs font-mono max-w-xs mx-auto" style={{ color:'var(--text-muted)' }}>{isAr?'هل هذه كلمة حقيقية؟ خمّن! (20 جولة)':'Is this a real word? 20 rounds'}</p>
      <button onClick={buildQueue} className="px-6 py-2.5 rounded-xl font-display font-semibold text-sm hover:scale-105 transition-all"
        style={{ background:'linear-gradient(135deg, #f97316, #ec4899)', color:'#fff' }}>{isAr?'ابدأ الاختبار':'Start Quiz'}</button>
    </div>
  );
  if(done) return (
    <div className="text-center space-y-4 py-6">
      <div className="text-4xl">{pct>=80?'🏆':pct>=50?'🎯':'💪'}</div>
      <div><p className="font-display font-black text-3xl" style={{ color:'var(--text)' }}>{pct}%</p>
        <p className="text-xs font-mono" style={{ color:'var(--text-muted)' }}>{score.correct}/{total} {isAr?'صحيح':'correct'}</p></div>
      <button onClick={buildQueue} className="flex items-center gap-1.5 mx-auto px-4 py-2 rounded-lg font-display font-semibold text-sm hover:opacity-80"
        style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)' }}><RotateCcw size={13}/>{isAr?'مرة أخرى':'Try again'}</button>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-mono"><span style={{ color:'#22c55e' }}>✓ {score.correct}</span><span style={{ color:'var(--text-muted)' }}>{total+1}/20</span><span style={{ color:'#f87171' }}>✗ {score.wrong}</span></div>
      <div className="text-center py-8 rounded-xl" style={{ background:'var(--surface2)', border:'1px solid var(--border)' }}>
        {checking?<div className="flex justify-center gap-1">{[0,1,2].map(i=><div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background:'var(--brand)', animationDelay:`${i*0.15}s` }}/>)}</div>
        :feedback?(
          <div className="space-y-2">
            <p className="text-2xl">{feedback.correct?'✅':'❌'}</p>
            <p className="font-display font-bold text-xl" style={{ color:'var(--text)' }}>{current}</p>
            <p className="text-xs font-mono" style={{ color:feedback.isReal?'#22c55e':'#f87171' }}>{feedback.isReal?(isAr?'✓ كلمة حقيقية!':'✓ Real word!'):(isAr?'✗ ليست كلمة حقيقية':'✗ Not a real word')}</p>
            <button onClick={next} className="mt-2 px-4 py-2 rounded-lg font-display font-semibold text-sm hover:opacity-80" style={{ background:'var(--brand)', color:'#fff' }}>{isAr?'التالي':'Next →'}</button>
          </div>
        ):<p className="font-display font-black text-3xl tracking-wider" style={{ color:'var(--text)' }}>{current}</p>}
      </div>
      {!feedback&&!checking&&(
        <div className="grid grid-cols-2 gap-3">
          <button onClick={()=>answer(true)} className="py-3 rounded-xl font-display font-semibold text-sm transition-all hover:scale-[1.03] active:scale-95"
            style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.4)', color:'#22c55e' }}>✓ {isAr?'كلمة حقيقية':'Real word'}</button>
          <button onClick={()=>answer(false)} className="py-3 rounded-xl font-display font-semibold text-sm transition-all hover:scale-[1.03] active:scale-95"
            style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', color:'#f87171' }}>✗ {isAr?'ليست كلمة':'Not a word'}</button>
        </div>
      )}
    </div>
  );
}

export default function GamePanel({ results, realWords, language, uiLang='en' }) {
  const [tab, setTab]=useState('challenge'); const isAr=uiLang==='ar';
  const tabs=[{id:'challenge',label:isAr?'تحدي الكلمات':'Word Challenge',icon:<Zap size={12}/>},{id:'quiz',label:isAr?'اختبار':'Quiz Mode',icon:<Trophy size={12}/>}];
  return (
    <div className="rounded-xl overflow-hidden" style={{ border:'1px solid var(--border)', background:'var(--surface)' }}>
      <div className="flex border-b" style={{ borderColor:'var(--border)' }}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-display font-semibold transition-all"
          style={{ color:tab===t.id?'var(--brand)':'var(--text-muted)', borderBottom:tab===t.id?'2px solid var(--brand)':'2px solid transparent', background:'transparent' }}>
          {t.icon}{t.label}
        </button>)}
      </div>
      <div className="p-4">{tab==='challenge'?<WordChallenge results={results} realWords={realWords} language={language} uiLang={uiLang}/>:<QuizMode results={results} language={language} uiLang={uiLang}/>}</div>
    </div>
  );
}
