import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';
import AnalysisResult from '../components/AnalysisResult';

const MainContainer = styled.div`
  padding-top: 80px; // 헤더 높이만큼 패딩
`;

const Section = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  
  &:nth-child(even) {
    background-color: #ffe6c8ff;
  }
`;

const HeroSection = styled(Section)`
  background: #ffecd5ff; 
  color: #A2601E; /* Figma 색상으로 변경 */
  text-align: center;
  min-height: 100vh; /* 전체 화면 높이 */
`;

const HeroTitle = styled.h1`
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 60px; 
  font-weight: 520; 
  line-height: 58px; 
  color: #A2601E; 
  margin-bottom: 2rem;
`;

const HeroSubtitle = styled.p`
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const CTAButton = styled.button`
  width: 400px; /* Figma 너비 */
  height: 80px; /* Figma 높이 */
  background: rgba(255, 122, 0, 0.1); /* Figma 배경색 */
  border: 1px solid #99632E; /* Figma 테두리 */
  border-radius: 30px; /* Figma 모서리 */
  color: #A47148; /* Figma 텍스트 색상 */
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 40px; /* Figma 크기 */
  font-weight: 700; /* Figma 굵기 */
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  
  &:hover {
    background: rgba(255, 122, 0, 0.2); /* 호버 효과 */
  }
`;

const SectionTitle = styled.h2`
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 60px; 
  font-weight: 520; 
  line-height: 58px; 
  color: #A2601E; 
  margin-bottom: 2rem;
`;

const SectionContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const MainPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const [apiStatus, setApiStatus] = useState('Loading...');
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // API 서버 상태 확인
    fetch('http://localhost:3001/api/health')
      .then(response => response.json())  
      .then(data => {
        setApiStatus('API 서버 연결 성공!');
        console.log('API Response:', data);
      })
      .catch(err => {
        setError('API 서버 연결 실패: ' + err.message);
        console.error('API Error:', err);
      });
  }, []);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <MainContainer>
        {/* Hero Section */}
        <HeroSection id="home">
          <HeroTitle>☕ 알레르기 안전 메뉴 분석</HeroTitle>
          <HeroSubtitle>
            메뉴판을 업로드하면 알레르기 정보를 분석해드립니다!
          </HeroSubtitle>
          <CTAButton 
            onClick={() => {
              const token = localStorage.getItem('token');
              if (!token) {
                alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
                navigate('/login');
              } else {
                navigate('/allergy');
              }
            }}
          >
            알레르기 설정하기
          </CTAButton>
        </HeroSection>

        {/* Upload Section */}
        <Section id="upload">
          <SectionContent>
            <SectionTitle>메뉴판 업로드</SectionTitle>
            <ImageUpload onAnalysisComplete={setAnalysisResult} />
          </SectionContent>
        </Section>

        {/* Analysis Results Section */}
        <Section id="analysis" style={{background: '#ffecd5ff'}}>
          <SectionContent>
            <SectionTitle>분석 결과</SectionTitle>
            {analysisResult ? (
              <AnalysisResult analysis={analysisResult} />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem'}}>
                <p style={{
                  fontFamily: 'Ownglyph_meetme-Rg, sans-serif',
                  fontSize: '1.5rem',
                  color: '#A2601E',
              marginBottom: '1rem'
              }}>메뉴판을 업로드하면 여기에 분석 결과가 표시됩니다.</p>
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', display: 'inline-block' }}>
                  <h3>서버 상태:</h3>
                  <p>{apiStatus}</p>
                  {error && (
                    <p style={{ color: 'red' }}>{error}</p>
                  )}
                </div>

              </div>
            )}
          </SectionContent>
        </Section>

        {/* About Section - Figma 디자인 적용 */}
        <Section id="about" style={{background: '#ffe6c8ff', paddingTop: '4rem', paddingBottom: '8rem'}}>
          <SectionContent>
            <SectionTitle>서비스 소개</SectionTitle>
    
            {/* Figma 디자인에 맞춘 새로운 그리드 레이아웃 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 1fr',
              gridTemplateRows: 'repeat(4, 250px)',
              gap: '3rem 2rem',
              alignItems: 'center',
              maxWidth: '1400px',
              margin: '0 auto',
              position: 'relative'
              }}>
      
              {/* 중앙 세로선과 원들 */}
              <div style={{
                gridColumn: '2',
                gridRow: '1 / 5',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                position: 'relative',
                justifyContent: 'space-around'
              }}>
                <div style={{
                  width: '5px',
                  height: '100%',
                  background: '#D9CBBF',
                  position: 'absolute',
                  top: 0
                }}></div>
                <div style={{
                  width: '50px', 
                  height: '50px', 
                  background: '#915316', 
                  borderRadius: '50%',
                  zIndex: 1,
                  position: 'relative'
                }}></div>
                <div style={{
                  width: '50px', 
                  height: '50px', 
                  background: '#915316', 
                  borderRadius: '50%',
                  zIndex: 1,
                  position: 'relative'
                }}></div>
                <div style={{
                  width: '50px', 
                  height: '50px', 
                  background: '#915316', 
                  borderRadius: '50%',
                  zIndex: 1,
                  position: 'relative'
                }}></div>
                <div style={{
                  width: '50px', 
                  height: '50px', 
                  background: '#915316', 
                  borderRadius: '50%',
                  zIndex: 1,
                  position: 'relative'
                }}></div>
              </div>

              {/* 카드 1 - 왼쪽 */}
              <div style={{
                gridColumn: '1',
                gridRow: '1',
                background: '#FFF2E0',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{fontSize: '5rem', marginBottom: '0.5rem'}}>📸</div>
                <h3 style={{
                  fontFamily: 'Ownglyph_meetme-Rg, sans-serif',
                  fontSize: '3rem',
                  fontWeight: 520,
                  color: '#A2601E',
                  marginBottom: '0.5rem'
                }}>메뉴판 촬영</h3>
                <p style={{
                  fontFamily: 'Ownglyph_meetme-Rg, sans-serif',
                  fontSize: '1.5rem',
                  color: '#A2601E',
                  lineHeight: 1.4,
                  margin: 0
                }}>카페 메뉴판을 사진으로 촬영하여 업로드</p>
              </div>

              {/* 카드 2 - 오른쪽 */}
              <div style={{
                gridColumn: '3',
                gridRow: '2',
                background: '#FFE9D1',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{fontSize: '5rem', marginBottom: '0.5rem'}}>⚠️</div>
                <h3 style={{
                  fontFamily: 'Ownglyph_meetme-Rg, sans-serif',
                  fontSize: '3rem',
                  fontWeight: 520,
                  color: '#A2601E',
                  marginBottom: '0.5rem'
                }}>알레르기 검사</h3>
                <p style={{
                  fontFamily: 'Ownglyph_meetme-Rg, sans-serif',
                  fontSize: '1.5rem',
                  color: '#A2601E',
                  lineHeight: 1.4,
                  margin: 0
                }}>등록된 알레르기 정보와 메뉴 성분을 비교 분석</p>
              </div>

              {/* 카드 3 - 왼쪽 */}
              <div style={{
                gridColumn: '1',
                gridRow: '3',
                background: '#FFE0C0',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{fontSize: '5rem', marginBottom: '0.5rem'}}>✅</div>
                <h3 style={{
                  fontFamily: 'Ownglyph_meetme-Rg, sans-serif',
                  fontSize: '3rem',
                  fontWeight: 520,
                  color: '#A2601E',
                  marginBottom: '0.5rem'
                }}>안전 메뉴 추천</h3>
                <p style={{
                  fontFamily: 'Ownglyph_meetme-Rg, sans-serif',
                  fontSize: '1.5rem',
                  color: '#A2601E',
                  lineHeight: 1.4,
                  margin: 0
                }}>개인별로 안전한 메뉴와 위험한 메뉴를 구분하여 표시</p>
              </div>

              {/* 카드 4 - 오른쪽 */}
              <div style={{
                gridColumn: '3',
                gridRow: '4',
                background: '#FFD6AA',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{fontSize: '5rem', marginBottom: '0.5rem'}}>🔍</div>
                <h3 style={{
                  fontFamily: 'Ownglyph_meetme-Rg, sans-serif',
                  fontSize: '3rem',
                  fontWeight: 520,
                  color: '#A2601E',
                  marginBottom: '0.5rem'
                }}>OCR 분석</h3>
                <p style={{
                  fontFamily: 'Ownglyph_meetme-Rg, sans-serif',
                  fontSize: '1.5rem',
                  color: '#A2601E',
                  lineHeight: 1.4,
                  margin: 0
                }}>AI가 메뉴판의 텍스트를 자동으로 추출하고 번역</p>
              </div>

            </div>
          </SectionContent>
        </Section>
      </MainContainer>
    </>
  );
};

export default MainPage;