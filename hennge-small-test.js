function isValid(s) {
  if (s.length % 2 !== 0) return false;

  const PAIRS = ['()', '{}', '[]'];
  let changed = true;

  while (changed) {
    changed = false;
    for (const pair of PAIRS) {
      if (s.includes(pair)) {
        s = s.replaceAll(pair, '');
        changed = true;
      }
    }
  }

  return s.length === 0;
}
