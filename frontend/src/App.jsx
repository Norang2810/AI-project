import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme, GlobalStyles } from './styles';
import './App.css';

// 페이지 컴포넌트들
import { MainPage, LoginPage, RegisterPage, AllergyPage } from './pages';
import MyPage from './pages/MyPage';
import KakaoLoginRedirect from './components/common/Button/KakaoLoginRedirect';
import { apiFetch, clearTokens } from './lib/apiFetch';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 컴포넌트 마운트 시 로그인 상태 확인 및 토큰 유효성 검증
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // 토큰 유효성 검증
          const response = await apiFetch('/api/auth/me');
          if (response.ok) {
            setIsLoggedIn(true);
          } else {
            // 토큰이 유효하지 않으면 제거
            clearTokens();
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error('토큰 검증 실패:', error);
          clearTokens();
          setIsLoggedIn(false);
        }
      }
    };

    checkAuthStatus();

    // 주기적으로 토큰 유효성 확인 (5분마다)
    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<MainPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<RegisterPage setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/allergy" element={<AllergyPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/mypage" element={<MyPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
            {/* ✅ 카카오 로그인 리다이렉트용 경로 추가 */}
            <Route path="/kakao-login" element={<KakaoLoginRedirect setIsLoggedIn={setIsLoggedIn} />} />

          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 