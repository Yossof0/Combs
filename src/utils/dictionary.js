const cache = new Map();

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
 * Stricter Arabic word check:
 * 1. Minimum 3 letters
 * 2. Uses Arabic Wiktionary directly (ar.wiktionary.org) — more accurate than en.wiktionary for Arabic
 * 3. Checks that the page is actually an Arabic language entry
 */
export async function checkArabicWord(word) {
  if (!word || word.length < 3) return false;
  // Must consist entirely of Arabic script characters (no latin, no numbers)
  if (!/^[\u0600-\u06FF\u0750-\u077F]+$/.test(word)) return false;

  const key = `ar:${word}`;
  if (cache.has(key)) return cache.get(key);

  try {
    // Arabic Wiktionary API — much stricter and Arabic-native
    const url = `https://ar.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(word)}&prop=categories&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data?.query?.pages;
    const page = pages && Object.values(pages)[0];

    // Page must exist (no "missing" flag) AND have categories (stub pages with no content have no cats)
    const exists = page && !page.missing;
    const hasCategories = exists && page.categories && page.categories.length > 0;

    const isReal = hasCategories;
    cache.set(key, isReal);
    return isReal;
  } catch {
    return false;
  }
}

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
    await new Promise(r => setTimeout(r, 120));
  }

  return realWords;
}
