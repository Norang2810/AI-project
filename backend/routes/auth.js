const express = require('express');
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

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
    const token = generateToken(user.id);

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
        token
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
    const token = generateToken(user.id);

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
        token
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
const KAKAO_REDIRECT_URI = 'http://localhost:3000/auth/kakao/callback';

router.get('/kakao/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: '카카오 인가 코드가 없습니다'
    });
  }

  try {
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
          redirect_uri: KAKAO_REDIRECT_URI,
          code: code
        }
      }
    );

    const { access_token } = tokenRes.data;

    if (!access_token) {
      return res.status(401).json({
        success: false,
        message: '카카오 토큰 발급 실패'
      });
    }


    const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const kakaoData = userRes.data;
    const kakaoId = kakaoData.id.toString(); // 고유 ID
    const email = kakaoData.kakao_account?.email || `${kakaoId}@kakao.fake`;
    const name = kakaoData.kakao_account?.profile?.nickname || '카카오유저';

    let user = await User.findOne({ where: { kakaoId } });

    if (!user) {
      user = await User.create({
        name,
        email,
        kakaoId,
        password: null,
        phone: null
      });
    }

    const token = generateToken(user.id);

    return res.redirect(`http://localhost:3000/kakao-login?token=${token}`);    

  } catch (error) {
    console.error(' 카카오 로그인 실패:', error);
    return res.status(500).json({
      success: false,
      message: '카카오 로그인 중 오류 발생'
    });
  }
});

module.exports = router; 