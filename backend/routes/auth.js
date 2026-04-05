const express = require('express');
const axios = require('axios');
const { User } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyToken,
} = require('../middleware/auth');
const {
  frontendOrigin,
  kakaoRedirectUri,
  getRequestOrigin,
} = require('../config/runtime');

const router = express.Router();

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, REFRESH_COOKIE_OPTIONS);
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', { path: '/' });
};

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '이름, 이메일, 비밀번호는 필수입니다.',
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '이미 등록된 이메일입니다.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || null,
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user: serializeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호는 필수입니다.',
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.json({
      success: true,
      message: '로그인이 완료되었습니다.',
      data: {
        user: serializeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

router.get('/kakao/callback', async (req, res) => {
  const { code, error } = req.query;
  const requestOrigin = getRequestOrigin(req);
  const resolvedFrontendOrigin = frontendOrigin || requestOrigin;
  const redirectUri =
    kakaoRedirectUri || `${requestOrigin}/api/auth/kakao/callback`;

  if (error) {
    console.error('카카오 인증 오류:', error);
    return res.redirect(`${resolvedFrontendOrigin}/login?error=kakao_auth_failed`);
  }

  if (!code) {
    console.error('카카오 인증 코드가 없습니다.');
    return res.redirect(`${resolvedFrontendOrigin}/login?error=no_auth_code`);
  }

  if (!process.env.KAKAO_REST_API_KEY) {
    return res.redirect(`${resolvedFrontendOrigin}/login?error=kakao_key_missing`);
  }

  try {
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      null,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_REST_API_KEY,
          redirect_uri: redirectUri,
          code,
        },
      }
    );

    const { access_token: kakaoAccessToken } = tokenResponse.data;
    if (!kakaoAccessToken) {
      return res.redirect(`${resolvedFrontendOrigin}/login?error=token_failed`);
    }

    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${kakaoAccessToken}` },
    });

    const kakaoData = userResponse.data;
    const kakaoId = String(kakaoData.id);
    const email =
      kakaoData.kakao_account?.email || `${kakaoId}@kakao.local`;
    const name =
      kakaoData.kakao_account?.profile?.nickname || '카카오 사용자';

    let user = await User.findOne({ where: { kakaoId } });
    if (!user) {
      user = await User.create({
        name,
        email,
        kakaoId,
        password: null,
        phone: null,
      });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.redirect(
      `${resolvedFrontendOrigin}/kakao-login?token=${accessToken}`
    );
  } catch (requestError) {
    console.error(
      '카카오 로그인 실패:',
      requestError.response?.data || requestError.message
    );
    return res.redirect(`${resolvedFrontendOrigin}/login?error=server_error`);
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token',
      });
    }

    const user = await User.findOne({ where: { refreshToken } });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    verifyRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    user.refreshToken = newRefreshToken;
    await user.save();

    setRefreshCookie(res, newRefreshToken);

    return res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        const user = await User.findOne({ where: { refreshToken } });
        if (user) {
          user.refreshToken = null;
          await user.save();
        }
      }
    } catch (cleanupError) {
      console.error('리프레시 토큰 정리 실패:', cleanupError);
    }

    clearRefreshCookie(res);

    return res.status(403).json({
      success: false,
      message: 'Invalid refresh token',
      reason: error.name,
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const user = await User.findOne({ where: { refreshToken } });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
  } catch (error) {
    console.error('로그아웃 정리 실패:', error);
  }

  clearRefreshCookie(res);

  return res.status(200).json({
    success: true,
    message: '로그아웃 되었습니다.',
  });
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: '유효하지 않은 토큰입니다.',
      });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    return res.json({
      success: true,
      data: {
        user: serializeUser(user),
      },
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

module.exports = router;
