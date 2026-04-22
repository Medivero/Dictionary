function normalize(input: string) {
  return input
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  const aLen = a.length;
  const bLen = b.length;
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  const prev = new Array<number>(bLen + 1);
  const cur = new Array<number>(bLen + 1);

  for (let j = 0; j <= bLen; j++) prev[j] = j;

  for (let i = 1; i <= aLen; i++) {
    cur[0] = i;
    const aCh = a.charCodeAt(i - 1);
    for (let j = 1; j <= bLen; j++) {
      const cost = aCh === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + cost,
      );
    }
    for (let j = 0; j <= bLen; j++) prev[j] = cur[j];
  }

  return prev[bLen];
}

export function similarityPercent(userInput: string, expected: string) {
  const a = normalize(userInput);
  const b = normalize(expected);

  if (a.length === 0) return 0;
  if (a === b) return 100;

  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;

  const dist = levenshtein(a, b);
  const ratio = 1 - dist / maxLen;
  const percent = Math.round(ratio * 100);
  return Math.max(0, Math.min(100, percent));
}

