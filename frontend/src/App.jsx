import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// 페이지 컴포넌트들
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AllergyPage from './pages/AllergyPage';

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
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<RegisterPage setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/allergy" element={<AllergyPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 