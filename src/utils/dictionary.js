const cache = new Map();
export async function checkEnglishWord(word) {
  if (word.length < 2) return false;
  const key = `en:${word.toLowerCase()}`;
  if (cache.has(key)) return cache.get(key);
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`);
    const isReal = res.ok; cache.set(key, isReal); return isReal;
  } catch { return false; }
}
export async function checkArabicWord(word) {
  if (!word || word.length < 3) return false;
  if (!/^[\u0600-\u06FF\u0750-\u077F]+$/.test(word)) return false;
  const key = `ar:${word}`;
  if (cache.has(key)) return cache.get(key);
  try {
    const url = `https://ar.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(word)}&prop=categories&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data?.query?.pages;
    const page = pages && Object.values(pages)[0];
    const isReal = !!(page && !page.missing && page.categories?.length > 0);
    cache.set(key, isReal); return isReal;
  } catch { return false; }
}
export async function batchCheckWords(words, language, limit = 200, onProgress) {
  const realWords = new Set();
  const toCheck = words.slice(0, limit);
  const checkFn = language === 'ar' ? checkArabicWord : checkEnglishWord;
  for (let i = 0; i < toCheck.length; i += 5) {
    const batch = toCheck.slice(i, i + 5);
    const results = await Promise.all(batch.map(w => checkFn(w)));
    batch.forEach((w, idx) => { if (results[idx]) realWords.add(w); });
    if (onProgress) onProgress(Math.min(i + 5, toCheck.length), toCheck.length);
    await new Promise(r => setTimeout(r, 120));
  }
  return realWords;
}
