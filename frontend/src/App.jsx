import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// 페이지 컴포넌트들
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AllergyPage from './pages/AllergyPage';

function App() {
  useEffect(() => {
    // 세션 스토리지에서 첫 방문 여부 확인
    const isFirstVisit = !sessionStorage.getItem('hasVisited');
    
    if (isFirstVisit) {
      // 첫 방문인 경우 로그아웃 처리
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 방문 표시 저장
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/allergy" element={<AllergyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 