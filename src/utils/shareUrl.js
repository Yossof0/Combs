export function encodeStateToUrl({ letters, letterCount, comboLang, uniqueOnly }) {
  const params = new URLSearchParams();
  if (letters.length) params.set('l', letters.join(','));
  if (letterCount) params.set('r', letterCount);
  if (comboLang) params.set('lang', comboLang);
  if (uniqueOnly !== undefined) params.set('u', uniqueOnly ? '1' : '0');
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
export function decodeStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const lettersRaw = params.get('l');
  const letters = lettersRaw ? lettersRaw.split(',').filter(Boolean) : null;
  const letterCount = params.get('r') ? Number(params.get('r')) : null;
  const comboLang = params.get('lang') || null;
  const uniqueOnly = params.get('u') !== null ? params.get('u') === '1' : null;
  if (!letters) return null;
  return { letters, letterCount, comboLang, uniqueOnly };
}
