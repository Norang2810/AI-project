import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// 페이지 컴포넌트들
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AllergyPage from './pages/AllergyPage';
import OcrResultPage from './pages/OcrResultPage';

function App() {
  return (


    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/allergy" element={<AllergyPage />} />
          <Route path="/ocr-result" element={<OcrResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 