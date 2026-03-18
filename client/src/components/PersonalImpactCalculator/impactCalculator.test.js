/*
  Lightweight specification tests for personal impact math.
  Keep this file as reference for expected calculator behavior.
*/

function calculateMonthlyDelta(baseline, current) {
  const deltaCo2 = baseline.co2 - current.co2;
  const percentChange = baseline.co2 > 0 ? (deltaCo2 / baseline.co2) * 100 : 0;
  const equivalentTrees = deltaCo2 / 20;
  return { deltaCo2, percentChange, equivalentTrees };
}

function assertAlmostEqual(a, b, epsilon = 0.0001) {
  if (Math.abs(a - b) > epsilon) {
    throw new Error(`Expected ${a} to be close to ${b}`);
  }
}

(function run() {
  const result = calculateMonthlyDelta({ co2: 150 }, { co2: 120 });
  assertAlmostEqual(result.deltaCo2, 30);
  assertAlmostEqual(result.percentChange, 20);
  assertAlmostEqual(result.equivalentTrees, 1.5);
})();
