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
  background: #ffecd5ff; 
  color: #A2601E; /* Figma 색상으로 변경 */
  text-align: center;
  min-height: 100vh; /* 전체 화면 높이 */
`;

export const HeroTitle = styled.h1`
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 60px; 
  font-weight: 520; 
  line-height: 58px; 
  color: #A2601E; 
  margin-bottom: 2rem;
`;

export const HeroSubtitle = styled.p`
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

export const CTAButton = styled(Button)`
  width: 400px;
  height: 80px;
  font-size: 40px;
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
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-weight: 700;
`;

export const FeatureDescription = styled.p`
  color: #A2601E;
  line-height: 1.6;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
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
