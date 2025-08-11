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
  HeroContent
} from './MainPage.styles';

const HERO_IMAGES = [
  '/images/hero/cafe_1.png',
  '/images/hero/cafe_2.png',
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
    // API 서버 상태 확인
    fetch('http://localhost:3001/api/health')
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
        <Section id="about" style={{background: '#ffe6c8ff', paddingTop: '2rem', paddingBottom: '4rem'}}>
          <SectionContent>
            <SectionTitle>서비스 소개</SectionTitle>
    
            {/* Figma 디자인에 맞춘 새로운 그리드 레이아웃 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 60px 1fr',         // 가로폭 줄이기
              gridTemplateRows: 'repeat(5, 320px)',        // 세로폭 늘리기
              gap: '1rem 1rem',                             // 카드 간격 줄이기
              alignItems: 'center',
              maxWidth: '1100px',                           // 전체 너비도 줄이기
              margin: '0 auto',
              position: 'relative'
              }}>
      
              {/* 중앙 세로선과 원들 */}
              <div style={{
                gridColumn: '2',
                gridRow: '1 / 6',
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
                  background: '#bc7228ff',
                  position: 'absolute',
                  top: 0
                }}></div>
                <div style={{ width: '50px', height: '50px', background: '#915316', borderRadius: '50%', zIndex: 1, position: 'relative' }}></div>
                <div style={{ width: '50px', height: '50px', background: '#915316', borderRadius: '50%', zIndex: 1, position: 'relative' }}></div>
                <div style={{ width: '50px', height: '50px', background: '#915316', borderRadius: '50%', zIndex: 1, position: 'relative' }}></div>
                <div style={{ width: '50px', height: '50px', background: '#915316', borderRadius: '50%', zIndex: 1, position: 'relative' }}></div>
                <div style={{ width: '50px', height: '50px', background: '#915316', borderRadius: '50%', zIndex: 1, position: 'relative' }}></div>
              </div>

              {/* 카드 1 - 왼쪽: 알레르기 정보 등록 */}
              <div style={{
                gridColumn: '1',
                gridRow: '1',
                background: '#FFF4E6',
                borderRadius: '20px',
                padding: '1.8rem 1.5rem',  
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>

                <div style={{fontSize: '4rem', marginBottom: '0.8rem'}}>⚠️</div>  {/* 이모지 변경 */}
                <h3 style={{
                  fontSize: '2.2rem',  
                  fontWeight: 520,
                  color: '#A2601E',
                  marginBottom: '0.8rem'
                }}>알레르기 정보 등록</h3>
                <p style={{
                  fontSize: '1.2rem',  
                  color: '#A2601E',
                  lineHeight: 1.4,
                  margin: 0
                }}>나의 알레르기 성분 등록</p>
              </div>

              {/* 카드 2 - 오른쪽: 메뉴판 사진 업로드 */}
              <div style={{
                gridColumn: '3',
                gridRow: '2',
                background: '#FFEDD5',
                borderRadius: '20px',
                padding: '1.8rem 1.5rem',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{fontSize: '4rem', marginBottom: '0.8rem'}}>📸</div>
                <h3 style={{
                  fontSize: '2.2rem',
                  fontWeight: 520,
                  color: '#A2601E',
                  marginBottom: '0.8rem'
                }}>메뉴판 사진 업로드</h3>
                <p style={{
                  fontSize: '1.2rem',
                  color: '#A2601E',
                  lineHeight: 1.4,
                  margin: 0
                }}>카페 메뉴판 촬영 및 업로드</p>
              </div>

              {/* 카드 3 - 왼쪽: OCR 분석 & 번역 */}
              <div style={{
                gridColumn: '1',
                gridRow: '3',
                background: '#FFE6C8',
                borderRadius: '20px',
                padding: '1.8rem 1.5rem',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{fontSize: '4rem', marginBottom: '0.8rem'}}>🔍</div>
                <h3 style={{
                  fontSize: '2.2rem',
                  fontWeight: 520,
                  color: '#A2601E',
                  marginBottom: '0.8rem'
                }}>OCR 분석 & 번역</h3>
                <p style={{
                  fontSize: '1.2rem',
                  color: '#A2601E',
                  lineHeight: 1.4,
                  margin: 0
                }}>AI가 메뉴판 텍스트를 추출하고 번역</p>
              </div>
              {/* 카드 4 - 오른쪽: 알레르기 성분 분석 */}
              <div style={{
                gridColumn: '3',
                gridRow: '4',
                background: '#FFDFBB',
                borderRadius: '20px',
                padding: '1.8rem 1.5rem',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{fontSize: '4rem', marginBottom: '0.8rem'}}>🧪</div>  {/* 새로운 이모지 */}
                <h3 style={{
                  fontSize: '2.2rem',
                  fontWeight: 520,
                  color: '#A2601E',
                  marginBottom: '0.8rem'
                }}>알레르기 성분 분석</h3>
                <p style={{
                  fontSize: '1.2rem',
                  color: '#A2601E',
                  lineHeight: 1.4,
                  margin: 0
                }}>메뉴 성분과 내 알레르기 비교</p>
              </div>
              {/* 카드 5 - 왼쪽: 메뉴 추천 결과 확인 */}
              <div style={{
                gridColumn: '1',
                gridRow: '5',
                background: '#FFD8AE',  // 새로운 배경색
                borderRadius: '20px',
                padding: '1.8rem 1.5rem',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{fontSize: '4rem', marginBottom: '0.8rem'}}>✅</div>
                <h3 style={{
                  fontSize: '2.2rem',
                  fontWeight: 520,
                  color: '#A2601E',
                  marginBottom: '0.8rem'
                }}>메뉴 추천 결과 확인</h3>
                <p style={{
                  fontSize: '1.2rem',
                  color: '#A2601E',
                  lineHeight: 1.4,
                  margin: 0
                }}>안전/위험 메뉴를 구분해 추천</p>
              </div>

            </div>
          </SectionContent>
        </Section>
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