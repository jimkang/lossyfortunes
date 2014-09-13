function clockworkPair(upperLimit, seed) {
  var base = seed % upperLimit;
  var gap = ~~(seed/upperLimit) + 1;
  return [base, wraparound(base + gap, upperLimit)];
}

function wraparound(x, upperLimit) {
  return x < upperLimit ? x : x - upperLimit;
}

module.exports = clockworkPair;
