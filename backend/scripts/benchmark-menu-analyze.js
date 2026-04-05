const fs = require('fs');
const os = require('os');
const path = require('path');
const { performance } = require('perf_hooks');
const axios = require('axios');
const FormData = require('form-data');

const RESULTS_DIR = path.resolve(__dirname, '../perf/results');
const DEFAULT_IMAGE_PATH = path.resolve(
  __dirname,
  '../../ai-server/sample_ocr_dataset/Sample/01.원천데이터/OCR/KC/CT/OCR_KC_C2_000109.jpeg'
);

const args = process.argv.slice(2);
const readArg = (name, fallback = '') => {
  const flagIndex = args.findIndex((arg) => arg === `--${name}`);
  if (flagIndex === -1) {
    return fallback;
  }

  return args[flagIndex + 1] ?? fallback;
};

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');

const config = {
  baseUrl: process.env.BENCH_BASE_URL || readArg('base-url', 'http://localhost:3001'),
  label: process.env.BENCH_LABEL || readArg('label', 'baseline'),
  email:
    process.env.BENCH_EMAIL || readArg('email', `perf-bot+${Date.now()}@aljualju.local`),
  password: process.env.BENCH_PASSWORD || readArg('password', 'PerfBot!1234'),
  name: process.env.BENCH_NAME || readArg('name', 'Perf Bot'),
  imagePath: process.env.BENCH_IMAGE_PATH || readArg('image', DEFAULT_IMAGE_PATH),
  iterations: Number(process.env.BENCH_ITERATIONS || readArg('iterations', '6')),
  concurrency: Number(process.env.BENCH_CONCURRENCY || readArg('concurrency', '2')),
  warmupIterations: Number(process.env.BENCH_WARMUP || readArg('warmup', '1')),
  timeoutMs: Number(process.env.BENCH_TIMEOUT_MS || readArg('timeout', '600000')),
};

const percentile = (values, ratio) => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1);
  return Number(sorted[index].toFixed(2));
};

const average = (values) => {
  if (values.length === 0) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
};

const formatMs = (value) => `${Number(value).toFixed(2)}ms`;

const ensureResultsDir = () => {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
};

const registerOrLogin = async () => {
  const registerPayload = {
    name: config.name,
    email: config.email,
    password: config.password,
  };

  try {
    const registerResponse = await axios.post(
      `${config.baseUrl}/api/auth/register`,
      registerPayload,
      {
        timeout: 30000,
      }
    );

    return registerResponse.data?.data?.accessToken;
  } catch (error) {
    if (error.response?.status !== 409) {
      throw error;
    }
  }

  const loginResponse = await axios.post(
    `${config.baseUrl}/api/auth/login`,
    {
      email: config.email,
      password: config.password,
    },
    {
      timeout: 30000,
    }
  );

  return loginResponse.data?.data?.accessToken;
};

const createAnalyzeRequest = async (accessToken, requestIndex) => {
  const form = new FormData();
  form.append('image', fs.createReadStream(config.imagePath));

  const startedAt = performance.now();

  try {
    const response = await axios.post(`${config.baseUrl}/api/menu/analyze`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: config.timeoutMs,
      validateStatus: () => true,
    });

    const durationMs = Number((performance.now() - startedAt).toFixed(2));
    const success = response.status >= 200 && response.status < 300 && response.data?.success !== false;

    return {
      requestIndex,
      success,
      status: response.status,
      durationMs,
      timestamp: new Date().toISOString(),
      message: response.data?.message || response.data?.error || null,
    };
  } catch (error) {
    return {
      requestIndex,
      success: false,
      status: 0,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      timestamp: new Date().toISOString(),
      message: error.message,
    };
  }
};

const runBatch = async ({ accessToken, iterations, concurrency, phase }) => {
  const results = [];
  let nextIndex = 0;
  const startedAt = performance.now();

  const worker = async () => {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= iterations) {
        return;
      }

      const result = await createAnalyzeRequest(accessToken, currentIndex + 1);
      results.push(result);

      const state = result.success ? 'ok' : 'fail';
      console.log(
        `[${phase}] #${result.requestIndex}/${iterations} ${state} ${result.status} ${formatMs(
          result.durationMs
        )}`
      );
    }
  };

  const workerCount = Math.min(Math.max(concurrency, 1), Math.max(iterations, 1));
  await Promise.all(Array.from({ length: workerCount }, worker));

  return {
    results,
    totalElapsedMs: Number((performance.now() - startedAt).toFixed(2)),
  };
};

const summarizeBatch = ({ results, totalElapsedMs }) => {
  const successfulResults = results.filter((result) => result.success);
  const failedResults = results.filter((result) => !result.success);
  const durations = successfulResults.map((result) => result.durationMs);
  const totalSeconds = totalElapsedMs / 1000;

  return {
    requestCount: results.length,
    successCount: successfulResults.length,
    failureCount: failedResults.length,
    successRate: results.length === 0 ? 0 : Number(((successfulResults.length / results.length) * 100).toFixed(2)),
    totalElapsedMs,
    throughputRps: totalSeconds === 0 ? 0 : Number((results.length / totalSeconds).toFixed(2)),
    successThroughputRps:
      totalSeconds === 0 ? 0 : Number((successfulResults.length / totalSeconds).toFixed(2)),
    minMs: durations.length ? Number(Math.min(...durations).toFixed(2)) : 0,
    maxMs: durations.length ? Number(Math.max(...durations).toFixed(2)) : 0,
    avgMs: average(durations),
    p50Ms: percentile(durations, 0.5),
    p95Ms: percentile(durations, 0.95),
    p99Ms: percentile(durations, 0.99),
    failedRequests: failedResults,
  };
};

const persistResults = (payload) => {
  ensureResultsDir();

  const safeLabel = config.label.replace(/[^a-zA-Z0-9-_]/g, '-');
  const filePath = path.join(RESULTS_DIR, `${timestamp}-${safeLabel}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}${os.EOL}`, 'utf8');
  return filePath;
};

const main = async () => {
  if (!fs.existsSync(config.imagePath)) {
    throw new Error(`Benchmark image not found: ${config.imagePath}`);
  }

  if (!Number.isFinite(config.iterations) || config.iterations <= 0) {
    throw new Error('iterations must be a positive number');
  }

  if (!Number.isFinite(config.concurrency) || config.concurrency <= 0) {
    throw new Error('concurrency must be a positive number');
  }

  console.log('Benchmark configuration');
  console.log(`- label: ${config.label}`);
  console.log(`- baseUrl: ${config.baseUrl}`);
  console.log(`- imagePath: ${config.imagePath}`);
  console.log(`- iterations: ${config.iterations}`);
  console.log(`- warmupIterations: ${config.warmupIterations}`);
  console.log(`- concurrency: ${config.concurrency}`);
  console.log(`- timeoutMs: ${config.timeoutMs}`);

  const accessToken = await registerOrLogin();
  if (!accessToken) {
    throw new Error('Failed to obtain access token for benchmark user');
  }

  if (config.warmupIterations > 0) {
    console.log(`Running warmup with ${config.warmupIterations} request(s)...`);
    await runBatch({
      accessToken,
      iterations: config.warmupIterations,
      concurrency: 1,
      phase: 'warmup',
    });
  }

  console.log('Running measured benchmark...');
  const measuredBatch = await runBatch({
    accessToken,
    iterations: config.iterations,
    concurrency: config.concurrency,
    phase: 'measure',
  });

  const summary = summarizeBatch(measuredBatch);
  const resultPayload = {
    benchmark: 'menu-analyze',
    label: config.label,
    measuredAt: now.toISOString(),
    environment: {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      cpuModel: os.cpus()[0]?.model || 'unknown',
      cpuCount: os.cpus().length,
      totalMemoryGb: Number((os.totalmem() / 1024 / 1024 / 1024).toFixed(2)),
      nodeVersion: process.version,
    },
    config: {
      baseUrl: config.baseUrl,
      imagePath: config.imagePath,
      iterations: config.iterations,
      warmupIterations: config.warmupIterations,
      concurrency: config.concurrency,
      timeoutMs: config.timeoutMs,
    },
    summary,
    requests: measuredBatch.results,
  };

  const resultFilePath = persistResults(resultPayload);

  console.log('');
  console.log('Benchmark summary');
  console.log(`- successRate: ${summary.successRate}%`);
  console.log(`- throughputRps: ${summary.throughputRps}`);
  console.log(`- successThroughputRps: ${summary.successThroughputRps}`);
  console.log(`- avgMs: ${summary.avgMs}`);
  console.log(`- p95Ms: ${summary.p95Ms}`);
  console.log(`- p99Ms: ${summary.p99Ms}`);
  console.log(`- resultFile: ${resultFilePath}`);
}

main().catch((error) => {
  console.error('Benchmark failed:', error.message);
  process.exitCode = 1;
});
