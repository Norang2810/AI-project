import styled from 'styled-components';
import Section from '../../components/common/Section/Section';
import Button from '../../components/common/Button/Button';

export const MainContainer = styled.div`
  padding-top: 80px; // 헤더 높이만큼 패딩
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

`;

export const HeroTitle = styled.h1`
  font-size: 60px; 
  font-weight: 520; 
  line-height: 58px; 
  color:rgb(255, 255, 255); 
  margin-bottom: 2rem;
`;

export const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  color:rgb(255, 216, 126)
`;

export const CTAButton = styled(Button)`
  width: 400px;
  height: 80px;
  font-size: 40px;

  background-color: #B9855A; /* 진한 베이지 */
  color: white;
  opacity: 1;
  font-weight: bold;

  border: none;
  border-radius: 12px;
  cursor: pointer;

  &:hover {
    background-color:rgb(169, 114, 68); /* hover 시 진하게 */
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
    linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.45) 100%);
  z-index: 0;
  pointer-events: none;
`;

/*  텍스트/버튼을 배경 위로 */
export const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
`;