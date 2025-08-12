import React from 'react';

const KakaoLogin = ({ mode = 'login' }) => {
  const REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
  // 동일 오리진을 위한 상대 경로 기반 콜백 (Nginx가 /api 프록시)
  const REDIRECT_URI = `${window.location.origin}/api/auth/kakao/callback`;

  const handleLogin = () => {
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoAuthURL;
  };

  const buttonStyle = {
    backgroundColor: '#FEE500',    
    color: '#3C1E1E',               
    fontWeight: 'bold',
    width: '100%',
    height: '50px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '4px',
  };

  return (
    <button onClick={handleLogin} style={buttonStyle}>
      {mode === 'login' ? '카카오 로그인' : '카카오로 시작하기'}
    </button>
  );
};

export default KakaoLogin;
