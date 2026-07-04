const cache = new Map<string, boolean>();

export async function checkEnglishWord(word: string): Promise<boolean> {
  if (word.length < 2) return false;

  const key = `en:${word.toLowerCase()}`;
  if (cache.has(key)) return cache.get(key)!;

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

export async function checkArabicWord(word: string): Promise<boolean> {
  if (!word || word.length < 3) return false;
  if (!/^[\u0600-\u06FF\u0750-\u077F]+$/.test(word)) return false;

  const key = `ar:${word}`;
  if (cache.has(key)) return cache.get(key)!;

  try {
    const url = `https://ar.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(word)}&prop=categories&format=json&origin=*`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { missing?: boolean; categories?: unknown[] }> };
    };

    const pages = data?.query?.pages;
    const page = pages && Object.values(pages)[0];
    const isReal = !!(page && !page.missing && page.categories && page.categories.length > 0);

    cache.set(key, isReal);
    return isReal;
  } catch {
    return false;
  }
}

export async function checkWord(
  word: string,
  language: "en" | "ar"
): Promise<boolean> {
  return language === "ar" ? checkArabicWord(word) : checkEnglishWord(word);
}
