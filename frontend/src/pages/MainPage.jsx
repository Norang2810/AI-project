import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';
import { isLoggedIn, showLoginAlert } from '../utils/auth';


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
    background-color: #fffaf4;
  }
`;

const HeroSection = styled(Section)`
  background: linear-gradient(135deg, #f6f1eb 0%, #d8c3a5 100%);
  color: #3e2f1c;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background-color: #8b5e3c;
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #6e4b2a;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(139, 94, 60, 0.3);
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #3e2f1c;
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
  background: #fffaf4;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(139, 94, 60, 0.15);
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
  color: #5a4332;
`;

const FeatureDescription = styled.p`
  color: #6f4f3c;
  line-height: 1.6;
`;

const MainPage = () => {
  const [apiStatus, setApiStatus] = useState('Loading...');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAllergyClick = (e) => {
    if (!isLoggedIn()) {
      e.preventDefault();
      showLoginAlert();
      navigate('/login');
    }
  };

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
      <Header />
      <MainContainer>
        {/* Hero Section */}
        <HeroSection id="home">
          <HeroTitle>☕ 알레르기 안전 메뉴 분석</HeroTitle>
          <HeroSubtitle>
            메뉴판을 업로드하면 알레르기 정보를 분석해드립니다!
          </HeroSubtitle>
          <CTAButton to="/allergy" onClick={handleAllergyClick}>알레르기 설정하기</CTAButton>
        </HeroSection>

        {/* Upload Section */}
        <Section id="upload">
          <SectionContent>
            <SectionTitle>메뉴판 업로드</SectionTitle>
            <ImageUpload />
          </SectionContent>
        </Section>

        {/* Analysis Section */}
        <Section id="analysis" style={{ backgroundColor: '#fffaf9' }}>
          <SectionContent>
            <SectionTitle>분석 결과</SectionTitle>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>메뉴판을 업로드하면 여기에 분석 결과가 표시됩니다.</p>
              <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', display: 'inline-block' }}>
                <h3>서버 상태:</h3>
                <p>{apiStatus}</p>
                {error && (
                  <p style={{ color: 'red' }}>{error}</p>
                )}
              </div>
            </div>
          </SectionContent>
        </Section>

        {/* About Section */}
        <Section id="about">
          <SectionContent>
            <SectionTitle>서비스 소개</SectionTitle>

            {/* Timeline Header */}
    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.2rem', color: '#5a4332' }}>
      Your Guide to Allergenic Ingredients <br/><br/>
      </h3>
    </div>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon>📸</FeatureIcon>
                <FeatureTitle>메뉴판 촬영</FeatureTitle>
                <FeatureDescription>
                  카페 메뉴판을 사진으로 촬영하여 업로드하세요.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>🔍</FeatureIcon>
                <FeatureTitle>OCR 분석</FeatureTitle>
                <FeatureDescription>
                  AI가 메뉴판의 텍스트를 자동으로 추출하고 번역합니다.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>⚠️</FeatureIcon>
                <FeatureTitle>알레르기 검사</FeatureTitle>
                <FeatureDescription>
                  등록된 알레르기 정보와 메뉴 성분을 비교 분석합니다.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>✅</FeatureIcon>
                <FeatureTitle>안전 메뉴 추천</FeatureTitle>
                <FeatureDescription>
                  개인별로 안전한 메뉴와 위험한 메뉴를 구분하여 표시합니다.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>
          </SectionContent>
        </Section>
      </MainContainer>
    </>
  );
};

export default MainPage; 