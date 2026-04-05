const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const readArg = (name, fallback = '') => {
  const index = args.findIndex((arg) => arg === `--${name}`);
  if (index === -1) {
    return fallback;
  }

  return args[index + 1] ?? fallback;
};

const beforePath = readArg('before', process.env.BENCH_BEFORE_RESULT || '');
const afterPath = readArg('after', process.env.BENCH_AFTER_RESULT || '');

if (!beforePath || !afterPath) {
  console.error(
    'Usage: node scripts/compare-benchmark-results.js --before <baseline.json> --after <optimized.json>'
  );
  process.exit(1);
}

const loadJson = (filePath) => {
  const absolutePath = path.resolve(filePath);
  return {
    filePath: absolutePath,
    data: JSON.parse(fs.readFileSync(absolutePath, 'utf8')),
  };
};

const changePercent = (before, after, inverse = false) => {
  if (!before) {
    return 0;
  }

  const raw = inverse ? ((before - after) / before) * 100 : ((after - before) / before) * 100;
  return Number(raw.toFixed(2));
};

const before = loadJson(beforePath);
const after = loadJson(afterPath);

const beforeSummary = before.data.summary;
const afterSummary = after.data.summary;

const comparison = {
  responseTimeAvgImprovementPct: changePercent(beforeSummary.avgMs, afterSummary.avgMs, true),
  responseTimeP95ImprovementPct: changePercent(beforeSummary.p95Ms, afterSummary.p95Ms, true),
  throughputImprovementPct: changePercent(
    beforeSummary.successThroughputRps,
    afterSummary.successThroughputRps
  ),
  successRateChangePct: Number((afterSummary.successRate - beforeSummary.successRate).toFixed(2)),
};

console.log('Benchmark comparison');
console.log(`- before: ${before.filePath}`);
console.log(`- after: ${after.filePath}`);
console.log(`- avgMs: ${beforeSummary.avgMs} -> ${afterSummary.avgMs}`);
console.log(`- p95Ms: ${beforeSummary.p95Ms} -> ${afterSummary.p95Ms}`);
console.log(
  `- successThroughputRps: ${beforeSummary.successThroughputRps} -> ${afterSummary.successThroughputRps}`
);
console.log(`- successRate: ${beforeSummary.successRate}% -> ${afterSummary.successRate}%`);
console.log('');
console.log('Portfolio-ready deltas');
console.log(`- 평균 응답시간 개선율: ${comparison.responseTimeAvgImprovementPct}%`);
console.log(`- p95 응답시간 개선율: ${comparison.responseTimeP95ImprovementPct}%`);
console.log(`- 성공 TPS 증가율: ${comparison.throughputImprovementPct}%`);
console.log(`- 성공률 변화: ${comparison.successRateChangePct}%p`);
