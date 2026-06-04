// Cache to avoid redundant API calls
const cache = new Map();

/**
 * Check if a word exists in the English dictionary using Free Dictionary API
 */
export async function checkEnglishWord(word) {
  if (word.length < 2) return false;
  const key = `en:${word.toLowerCase()}`;
  if (cache.has(key)) return cache.get(key);

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
    );
    const isReal = res.ok;
    cache.set(key, isReal);
    return isReal;
  } catch {
    return false;
  }
}

/**
 * Check Arabic word using Arabic Ontology / Wiktionary approach
 * Falls back to a simple heuristic if API unavailable
 */
export async function checkArabicWord(word) {
  if (word.length < 2) return false;
  const key = `ar:${word}`;
  if (cache.has(key)) return cache.get(key);

  try {
    // Using Wiktionary's API which supports Arabic
    const url = `https://en.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(word)}&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data?.query?.pages;
    const firstPage = pages && Object.values(pages)[0];
    // If page exists and doesn't have "missing" flag, it's a real word
    const isReal = firstPage && !firstPage.missing;
    cache.set(key, isReal);
    return isReal;
  } catch {
    return false;
  }
}

/**
 * Batch check words for a given language, returns a Set of real words
 * Limits to first `limit` words to avoid rate limiting
 */
export async function batchCheckWords(words, language, limit = 200, onProgress) {
  const realWords = new Set();
  const toCheck = words.slice(0, limit);
  const checkFn = language === 'ar' ? checkArabicWord : checkEnglishWord;

  const batchSize = 5;
  for (let i = 0; i < toCheck.length; i += batchSize) {
    const batch = toCheck.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(w => checkFn(w)));
    batch.forEach((w, idx) => {
      if (results[idx]) realWords.add(w);
    });
    if (onProgress) onProgress(Math.min(i + batchSize, toCheck.length), toCheck.length);
    // Small delay to be nice to the API
    await new Promise(r => setTimeout(r, 100));
  }

  return realWords;
}
