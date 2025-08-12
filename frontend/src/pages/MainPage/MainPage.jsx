import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, ImageUpload, AnalysisResult } from '../../components';
import Section, { SectionTitle, SectionContent } from '../../components/common/Section/Section';
// import Button from '../../components/common/Button/Button';
import NotificationToastComponent from '../../components/common/NotificationToast/NotificationToast';
import {
  MainContainer,
  HeroSection,
  HeroTitle,
  HeroSubtitle,
  CTAButton,
  BgWrap,
  BgSlide, 
  BgOverlay,
  HeroContent,
  AboutSection, AboutGrid,
  Axis, AxisLine, AxisDot,
  Step, StepIcon, StepTitle, StepDesc, StepText
} from './MainPage.styles';


// ...컴포넌트 함수 시작 바로 아래에 추가
const STEPS = [
  { side: 'left',  bg: '#FFF4E6', icon: '⚠️', title: '알레르기 정보 등록',   desc: '나의 알레르기 성분 등록' },
  { side: 'right', bg: '#FFEDD5', icon: '📸', title: '메뉴판 사진 업로드',   desc: '카페 메뉴판 촬영 및 업로드' },
  { side: 'left',  bg: '#FFE6C8', icon: '🔍', title: 'OCR 분석 & 번역',      desc: 'AI가 메뉴판 텍스트를 추출하고 번역' },
  { side: 'right', bg: '#FFDFBB', icon: '🧪', title: '알레르기 성분 분석',   desc: '메뉴 성분과 내 알레르기 비교' },
  { side: 'left',  bg: '#FFD8AE', icon: '✅', title: '메뉴 추천 결과 확인',  desc: '안전/위험 메뉴를 구분해 추천' },
];

const DOTS = ['5%', '25%', '45%', '65%', '85%'];

const HERO_IMAGES = [
  '/images/hero/cafe_1.png',
  '/images/hero/cafe_3.png',
];

const MainPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const [heroIdx, setHeroIdx] = useState(0); //  현재 배경 인덱스
  const [apiStatus, setApiStatus] = useState('Loading...');
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // API 서버 상태 확인 (상대경로)
    fetch('/api/health')
      .then(response => response.json())  
      .then(data => {
        setApiStatus('API 서버 연결 성공!');
        if (process.env.NODE_ENV === 'development') {
          console.log('API Response:', data);
        }
      })
      .catch(err => {
        setError('API 서버 연결 실패: ' + err.message);
        if (process.env.NODE_ENV === 'development') {
          console.error('API Error:', err);
        }
      });
  }, []);

    //  5초마다 자동 전환
  useEffect(() => {
    const id = setInterval(() => {
      setHeroIdx((p) => (p + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  //  이미지 프리로드(깜빡임 줄이기)
  useEffect(() => {
    HERO_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const handleNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // 5초 후 자동 제거
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };


  return (
    <>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <MainContainer>
        {/* Hero Section */}
        <HeroSection id="home">
  {/*  배경 슬라이드 레이어 */}
  <BgWrap>
    {HERO_IMAGES.map((src, i) => (
      <BgSlide key={src} src={src} active={i === heroIdx} />
    ))}
  </BgWrap>
  <BgOverlay />

  {/*  텍스트/버튼 레이어 */}
  <HeroContent>
    {/* 대비 확보용 컬러 오버라이드 */}
    <HeroTitle>
      카페 메뉴, 안심하고 고르세요
    </HeroTitle>
    <HeroSubtitle>
      사진 한 장으로 알레르기 걱정 끝! <br/>
      AI가 메뉴 속 성분을 분석해 <br/>
      당신에게 맞는 메뉴를 추천해드려요.<br/><br/>
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
  </HeroContent>
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
              <AnalysisResult 
                analysis={analysisResult} 
                onNotification={handleNotification}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem'}}>
                <p style={{
                  fontSize: '1.5rem',
                  color: '#A2601E',
              marginBottom: '1rem'
              }}>메뉴판을 업로드하면 여기에 분석 결과가 표시됩니다.</p>
                {/* <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', display: 'inline-block' }}>
                  <h3>서버 상태:</h3>
                  <p>{apiStatus}</p>
                  {error && (
                    <p style={{ color: 'red' }}>{error}</p>
                  )}
                </div> */}

              </div>
            )}
          </SectionContent>
        </Section>

        {/* About Section - Figma 디자인 적용 */}
        {/* About Section */}
<AboutSection id="about">
  <SectionContent>
    <SectionTitle>서비스 소개</SectionTitle>

    <AboutGrid>
      {/* 중앙 축 + 점 */}
      <Axis>
        <AxisLine />
        {DOTS.map((top) => (
          <AxisDot key={top} style={{ top }} />
        ))}
      </Axis>

      {/* 카드들 */}
      {STEPS.map((s, i) => (
        <Step key={s.title} side={s.side} row={i + 1} bg={s.bg}>
          <StepIcon>{s.icon}</StepIcon>
<StepText>
  <StepTitle>{s.title}</StepTitle>
  <StepDesc>{s.desc}</StepDesc>
</StepText>
        </Step>
      ))}
    </AboutGrid>
  </SectionContent>
</AboutSection>
      </MainContainer>

      {/* 우측 상단 알림 컨테이너 */}
      <NotificationToastComponent 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </>
  );
};

export default MainPage;