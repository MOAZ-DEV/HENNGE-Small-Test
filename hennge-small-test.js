const isValid = (s) => {
    let prevBracket;
    do {
        prevBracket = s;
        s = s
            .replace('()', '')
            .replace('[]', '')
            .replace('{}', '');
    } while (s !== prevBracket);
    return s.length === 0;
};

// Test cases
let s = '()';
console.log(isValid(s)); // true

s = '([]){}';
console.log(isValid(s)); // true

s = '({)}';
console.log(isValid(s)); // false
