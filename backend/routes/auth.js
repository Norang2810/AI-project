const express = require('express');
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');
const axios = require('axios');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../middleware/auth');

const router = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // 필수 필드 검증
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '이름, 이메일, 비밀번호는 필수입니다.'
      });
    }

    // 이메일 중복 확인
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '이미 등록된 이메일입니다.'
      });
    }

    // 사용자 생성
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || null
    });

    // 토큰 생성
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        accessToken
      }
    });

  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 필수 필드 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호는 필수입니다.'
      });
    }

    // 사용자 찾기
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // 비밀번호 확인
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // 토큰 생성
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: '로그인이 완료되었습니다.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        accessToken
      }
    });

  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 카카오톡 로그인
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

router.get('/kakao/callback', async (req, res) => {
  const { code, error } = req.query;

  const scheme = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseOrigin = `${scheme}://${host}`;

  // 카카오에서 오류를 반환한 경우
  if (error) {
    console.error('카카오 인증 오류:', error);
    return res.redirect(`${baseOrigin}/login?error=kakao_auth_failed`);
  }

  if (!code) {
    console.error('카카오 인가 코드가 없습니다');
    return res.redirect(`${baseOrigin}/login?error=no_auth_code`);
  }

  try {
    // 프록시(Nginx) 뒤에서도 올바른 오리진 계산
    // const scheme = req.headers['x-forwarded-proto'] || req.protocol;
    // const host = req.headers['x-forwarded-host'] || req.headers.host;
    // const baseOrigin = `${scheme}://${host}`;
    // const redirectUri = `${baseOrigin}/api/auth/kakao/callback`;
    const redirectUri = `http://localhost:3000/api/auth/kakao/callback`;

    console.log('카카오 인가 코드 수신:', code);
    
    const tokenRes = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      null,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        params: {
          grant_type: 'authorization_code',
          client_id: KAKAO_REST_API_KEY,
          redirect_uri: redirectUri,
          code: code
        }
      }
    );

    console.log('카카오 토큰 응답:', tokenRes.data);

    const { access_token } = tokenRes.data;

    if (!access_token) {
      console.error('카카오 토큰 발급 실패');
      // const scheme = req.headers['x-forwarded-proto'] || req.protocol;
      // const host = req.headers['x-forwarded-host'] || req.headers.host;
      // const baseOrigin = `${scheme}://${host}`;
      const baseOrigin = `http://localhost:3000`;
      return res.redirect(`${baseOrigin}/login?error=token_failed`);
    }

    const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    console.log('카카오 사용자 정보:', userRes.data);

    const kakaoData = userRes.data;
    const kakaoId = kakaoData.id.toString(); // 고유 ID
    const email = kakaoData.kakao_account?.email || `${kakaoId}@kakao.fake`;
    const name = kakaoData.kakao_account?.profile?.nickname || '카카오유저';

    console.log('카카오 ID:', kakaoId, '이메일:', email, '이름:', name);

    let user = await User.findOne({ where: { kakaoId } });

    if (!user) {
      console.log('새 카카오 사용자 생성');
      user = await User.create({
        name,
        email,
        kakaoId,
        password: null,
        phone: null
      });
    } else {
      console.log('기존 카카오 사용자 찾음:', user.id);
    }

    const accessToken  = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 프론트 경로도 동일 오리진 기준으로 리다이렉트
    const baseOrigin = `http://localhost:3000`;
    return res.redirect(`${baseOrigin}/kakao-login?token=${accessToken}`);

  } catch (error) {
    console.error('카카오 로그인 실패:', error.response?.data || error.message);
    // const scheme = req.headers['x-forwarded-proto'] || req.protocol;
    // const host = req.headers['x-forwarded-host'] || req.headers.host;
    // const baseOrigin = `${scheme}://${host}`;
    const baseOrigin = `http://localhost:3000`;
    return res.redirect(`${baseOrigin}/login?error=server_error`);
  }
});

// access token 재발급급
router.post('/refresh', async (req, res) => {
  try {
    const rt = req.cookies?.refreshToken;
    if (!rt) return res.status(401).json({ success:false, message:'No refresh token' });

    const user = await User.findOne({ where: { refreshToken: rt } });
    if (!user) return res.status(403).json({ success:false, message:'Forbidden' });

    verifyRefreshToken(rt); // 토큰 자체 유효성 검증

    const newAccess  = generateAccessToken(user.id);
    const newRefresh = generateRefreshToken(user.id);

    user.refreshToken = newRefresh;
    await user.save();

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success:true, accessToken: newAccess });
  } catch (e) {
    // 만료/위조 => 세션 종료
    try {
      const rt = req.cookies?.refreshToken;
      if (rt) {
        const u = await User.findOne({ where: { refreshToken: rt } });
        if (u) { u.refreshToken = null; await u.save(); }
      }
    } catch(_) {}
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return res.status(403).json({ success:false, message:'Invalid refresh token', reason:e.name });
  }
});


router.post('/logout', async(req, res) => {
  try {
    const rt = req.cookies?.refreshToken;
    if (rt) {
      const user = await User.findOne({ where: { refreshToken: rt } });
      if (user) { user.refreshToken = null; await user.save(); }
    }
  } catch(_) {}
  res.clearCookie('refreshToken', { path: '/api/auth' });
  return res.status(200).json({ success: true, message: '로그아웃 되었습니다.' });
});

// 사용자 정보 가져오기
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }

    const { verifyToken } = require('../middleware/auth');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      }
    });

  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 