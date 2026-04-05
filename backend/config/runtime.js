const normalizeOrigin = (value = '') => value.trim().replace(/\/$/, '');

const parseCsvEnv = (value = '') =>
  value
    .split(',')
    .map((item) => normalizeOrigin(item))
    .filter(Boolean);

const allowedOrigins = [
  ...new Set(
    parseCsvEnv(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '')
  ),
];

const frontendOrigin = normalizeOrigin(process.env.FRONTEND_ORIGIN || '');
const uploadCorsOrigin = normalizeOrigin(
  process.env.UPLOAD_CORS_ORIGIN || frontendOrigin || allowedOrigins[0] || ''
);
const kakaoRedirectUri = (process.env.KAKAO_REDIRECT_URI || '').trim();
const defaultGeminiEnhanceUrl = `http://127.0.0.1:${
  process.env.PORT || '3001'
}/api/gemini/enhance`;
const geminiEnhanceUrl = (
  process.env.GEMINI_ENHANCE_URL || defaultGeminiEnhanceUrl
).trim();

const getRequestOrigin = (req) => {
  const protocol = (req.headers['x-forwarded-proto'] || req.protocol || 'http')
    .split(',')[0]
    .trim();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0]
    .trim();

  return host ? `${protocol}://${host}` : '';
};

const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.length === 0) {
    return true;
  }

  return allowedOrigins.includes(normalizeOrigin(origin));
};

module.exports = {
  allowedOrigins,
  frontendOrigin,
  uploadCorsOrigin,
  kakaoRedirectUri,
  geminiEnhanceUrl,
  getRequestOrigin,
  isOriginAllowed,
  normalizeOrigin,
};
