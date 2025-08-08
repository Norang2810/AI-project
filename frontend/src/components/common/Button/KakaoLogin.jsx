import React from 'react';

const KakaoLogin = () => {
  const REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
  console.log(process.env.REACT_APP_KAKAO_REST_API_KEY)
  const REDIRECT_URI = 'http://localhost:3001/api/auth/kakao/callback';

  const handleLogin = () => {
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoAuthURL;
  };

  return (
    <img
    src="https://developers.kakao.com/tool/resource/static/img/button/login/full/ko/kakao_login_medium_wide.png"
    alt="카카오 로그인"
    style={{ cursor: 'pointer' }}
    onClick={handleLogin}
  />
  );
};

export default KakaoLogin;
