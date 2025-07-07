function isValid(s) {
  if (s.length % 2 !== 0) return false; // quick reject for odd lengths

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
