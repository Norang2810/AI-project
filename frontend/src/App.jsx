import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme, GlobalStyles } from './styles';
import './App.css';

// 페이지 컴포넌트들
import { MainPage, LoginPage, RegisterPage, AllergyPage } from './pages';
import MyPage from './pages/MyPage';
import KakaoLoginRedirect from './components/common/Button/KakaoLoginRedirect';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
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