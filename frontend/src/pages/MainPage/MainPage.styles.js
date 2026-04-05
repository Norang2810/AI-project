import styled from 'styled-components';
import Section from '../../components/common/Section/Section';
import Button from '../../components/common/Button/Button';

export const MainContainer = styled.div`
  padding-top: 80px; // 헤더 높이만큼 패딩
  
  /* 모바일에서 헤더 패딩 조정 */
  @media (max-width: 768px) {
    padding-top: 60px;
  }
`;

export const StyledSection = styled(Section)`
  &:nth-child(even) {
    background-color: #ffe6c8ff;
  }
`;

export const HeroSection = styled(StyledSection)`

/*  배경 레이어가 깔릴 수 있도록 보강 */
  position: relative;
  overflow: hidden;

  background: #ffecd5ff; 
  color: #A2601E; /* Figma 색상으로 변경 */
  text-align: center;
  min-height: 100vh; /* 전체 화면 높이 */

    /* 가운데 정렬 (Section이 이미 해주지 않으면 대비용) */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* 태블릿 */
  @media (max-width: 1024px) {
    min-height: 90vh;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    min-height: 80vh;
    padding: 2rem 1rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    min-height: 70vh;
    padding: 1.5rem 0.5rem;
  }
`;

export const HeroTitle = styled.h1`
  font-size: 60px; 
  font-weight: 520; 
  line-height: 58px; 
  color: #FFF8E7; 
  margin-bottom: 2rem;

  /* 태블릿 */
  @media (max-width: 1024px) {
    font-size: 48px;
    line-height: 52px;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    font-size: 36px;
    line-height: 40px;
    margin-bottom: 1.5rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 28px;
    line-height: 32px;
    margin-bottom: 1rem;
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  color: #FFF8E7;
  font-weight: 550;
  font-family: 'Noto Sans KR', sans-serif; 
  font-weight: 700;

  /* 태블릿 */
  @media (max-width: 1024px) {
    font-size: 1.3rem;
    margin-bottom: 1.8rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    line-height: 1.4;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 1rem;
    line-height: 1.3;
  }
`;

export const CTAButton = styled(Button)`
  width: 400px;
  height: 80px;
  font-size: 35px;

  background-color: #B9855A; /* 진한 베이지 */
  color: #FFF8E7;
  opacity: 1;
  font-weight: bold;

  border: none;
  border-radius: 12px;
  cursor: pointer;

  &:hover {
    background-color:rgb(169, 114, 68); /* hover 시 진하게 */
  }

  /* 태블릿 */
  @media (max-width: 1024px) {
    width: 350px;
    height: 70px;
    font-size: 30px;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    width: 280px;
    height: 60px;
    font-size: 24px;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    width: 240px;
    height: 50px;
    font-size: 20px;
  }
`;

export const FeaturesSection = styled(StyledSection)`
  background: #fff;
  padding: 4rem 0;
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

export const FeatureCard = styled.div`
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

export const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #A2601E;
`;

export const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 700;
`;

export const FeatureDescription = styled.p`
  color: #A2601E;
  line-height: 1.6;
  opacity: 0.8;
`;

export const UploadSection = styled(StyledSection)`
  background: #ffecd5ff;
  padding: 4rem 0;
`;

export const StatusMessage = styled.div`
  text-align: center;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
  font-weight: 500;
  
  &.success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #059669;
  }
  
  &.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  }
  
  &.loading {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #A2601E;
  }
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #fed7aa;
  border-top: 3px solid #A2601E;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

/*  배경 슬라이드 레이어 */
export const BgWrap = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none; /* 배경이 버튼 클릭을 막지 않게 */
  overflow: hidden;
  z-index: 0;
`;

export const BgSlide = styled.div`
  position: absolute;
  inset: 0;
  background-image: ${({ src }) => `url(${src})`};
  background-size: cover;
  background-position: center;
  opacity: ${({ active }) => (active ? 1 : 0)};
  transition: opacity 900ms ease;
  /* 흐릿+살짝 확대로 깔끔하게 */
  filter: blur(2px) brightness(0.9);
  transform: scale(1.05);
`;

export const BgOverlay = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(transparent 40%, rgba(0,0,0,0.25)),
    linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.65) 100%);
  z-index: 0;
  pointer-events: none;
`;

/*  텍스트/버튼을 배경 위로 */
export const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
`;

export const AboutSection = styled(Section)`
  background: #ffe6c8ff;
  padding-top: 2rem;
  padding-bottom: 4rem;
`;

export const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 60px 1fr;   /* 좌 | 축 | 우 */
  grid-template-rows: repeat(5, 220px);  /* 5줄 고정 (원하면 1fr로 변경) */
  gap: 1rem 1rem;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
  position: relative;

  /* 태블릿 */
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 40px 1fr;
    grid-template-rows: repeat(5, 180px);
    gap: 0.8rem 0.8rem;
    max-width: 900px;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(5, auto);
    gap: 1rem 0;
    max-width: 100%;
    padding: 0 1rem;
  }
`;

export const Axis = styled.div`
  grid-column: 2;
  grid-row: 1 / 6;
  position: relative;
  height: 100%;

  /* 모바일에서는 숨김 */
  @media (max-width: 768px) {
    display: none;
  }
`;

export const AxisLine = styled.div`
  position: absolute;
  top: 0;
  left: calc(50% - 2.5px);
  width: 5px;
  height: 100%;
  background: #bc7228ff;
  border-radius: 3px;
`;

export const AxisDot = styled.span`
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: #915316;
  border-radius: 50%;
  z-index: 1;
`;

const StepCard = styled.div`
  background: ${({ bg }) => bg || '#FFF'};
  border-radius: 20px;
  padding: 1.8rem 1.5rem;
  display: flex; /* 가로 배치 */
  align-items: center; /* 세로 중앙정렬 */
  gap: 1rem; /* 아이콘-글씨 간격 */

box-shadow: 0 6px 18px rgba(0,0,0,0.08);
transition: transform .22s ease, box-shadow .22s ease, background .22s ease;
will-change: transform, box-shadow;

/* 키보드 포커스 접근성 */
&:focus-within,
&:focus-visible {
outline: 3px solid rgba(162,96,30,.35);
outline-offset: 3px;
transform: translateY(-4px);
box-shadow: 0 14px 28px rgba(0,0,0,0.15);
}

/* 태블릿 */
@media (max-width: 1024px) {
  padding: 1.5rem 1.2rem;
  gap: 0.8rem;
}

/* 모바일 */
@media (max-width: 768px) {
  grid-column: 1 !important;
  grid-row: auto !important;
  margin-bottom: 1rem;
  padding: 1.2rem 1rem;
  gap: 0.8rem;
}
`;

export const StepIcon = styled.div`

font-size: 4rem;
flex-shrink: 0;           /* 아이콘 크기 고정 */
transition: transform .22s ease, filter .22s ease;

/* 태블릿 */
@media (max-width: 1024px) {
  font-size: 3.5rem;
}

/* 모바일 */
@media (max-width: 768px) {
  font-size: 3rem;
}

/* 작은 모바일 */
@media (max-width: 480px) {
  font-size: 2.5rem;
}
`;

export const Step = styled(StepCard)`
  grid-column: ${({ side }) => (side === 'right' ? '3' : '1')};
  grid-row: ${({ row }) => row};

cursor: default;

&:hover {
transform: translateY(-6px);
box-shadow: 0 18px 36px rgba(0,0,0,0.18);
/* 아주 은은하게 밝아지는 효과 (선택) */
background: linear-gradient(0deg, rgba(255,255,255,.12), rgba(255,255,255,.12)),
      ${({ bg }) => bg || '#FFF'};
}
/* 부모 호버 시 아이콘만 톡 반응 */
 &:hover ${StepIcon} {
transform: translateX(2px) scale(1.06);
filter: drop-shadow(0 3px 4px rgba(0,0,0,.12));
}

/* 모바일에서 호버 효과 제거 */
@media (max-width: 768px) {
  &:hover {
    transform: none;
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  }
  
  &:hover ${StepIcon} {
    transform: none;
    filter: none;
  }
}
`;

export const StepTitle = styled.h3`
  font-size: 2.3rem;
  font-weight: 520;
  color: #A2601E;
  margin-bottom: 0.6rem;

  /* 태블릿 */
  @media (max-width: 1024px) {
    font-size: 2rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

export const StepText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 글씨 왼쪽 정렬 */
`;

export const StepDesc = styled.p`
  font-size: 1.5rem;
  color: #A2601E;
  line-height: 1.5;
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 600;

  /* 태블릿 */
  @media (max-width: 1024px) {
    font-size: 1.3rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    font-size: 1.1rem;
    line-height: 1.4;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;