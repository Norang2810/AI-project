// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const ACCESS_SECRET   = process.env.JWT_SECRET;
const REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES  = process.env.JWT_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

// 환경변수 체크
if (!ACCESS_SECRET)  throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.');
if (!REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET 환경변수가 설정되지 않았습니다.');

// 발급 유틸
const generateAccessToken = (userId) =>
  jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES, algorithm: 'HS256' });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES, algorithm: 'HS256' });

// 검증 유틸 
const verifyAccessToken = (token) =>
  jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] });

const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET, { algorithms: ['HS256'] });

// 보호 라우트 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: '인증 토큰이 필요합니다.' });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    req.user = user;
    return next();
  } catch (e) {
    return res.status(403).json({ success: false, message: '유효하지 않은 토큰입니다.', reason: e.name });
  }
};

const generateToken = (userId) => generateAccessToken(userId);
const verifyToken = (token) => { try { return verifyAccessToken(token); } catch { return null; } };

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  authenticateToken,
  generateToken,
  verifyToken,
};
