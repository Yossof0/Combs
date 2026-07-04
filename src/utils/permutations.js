export function generatePermutations(arr, r) {
  const results = new Set();
  function permute(current, remaining) {
    if (current.length === r) { results.add(current.join('')); return; }
    for (let i = 0; i < remaining.length; i++) {
      permute([...current, remaining[i]], [...remaining.slice(0, i), ...remaining.slice(i + 1)]);
    }
  }
  permute([], arr);
  return Array.from(results);
}
export function countPermutations(n, r) {
  if (r > n) return 0;
  let result = 1;
  for (let i = n; i > n - r; i--) result *= i;
  return result;
}
export function isFeasible(n, r) { return countPermutations(n, r) <= 500000; }
