import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const KakaoLoginRedirect = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // 토큰을 localStorage에 저장
      localStorage.setItem('token', token);
      
      // 사용자 정보를 가져오기 위해 서버에 요청
      fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
          setIsLoggedIn(true);
          navigate('/');
        } else {
          console.error('사용자 정보 가져오기 실패:', data.message);
          navigate('/login');
        }
      })
      .catch(error => {
        console.error('서버 연결 오류:', error);
        navigate('/login');
      });
    } else {
      console.error('토큰이 없습니다.');
      navigate('/login');
    }
  }, [navigate, searchParams, setIsLoggedIn]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Ownglyph_meetme-Rg, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2>카카오 로그인 처리 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default KakaoLoginRedirect;
