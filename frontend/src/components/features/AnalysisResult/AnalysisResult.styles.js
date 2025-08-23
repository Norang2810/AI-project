import styled from 'styled-components';
import Card from '../../common/Card/Card';

export const AnalysisContainer = styled.div`
  max-width: 1200px; /* 메인페이지와 동일한 max-width */
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem; /* 메인페이지와 동일한 패딩 */
`;

export const AnalysisHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

export const AnalysisTitle = styled.h2`
  font-size: 2.5rem; /* 메인페이지와 동일 */
  margin-bottom: 1rem;
  color: #333; /* 메인페이지와 동일 */
  font-weight: 700;
`;

export const AnalysisSubtitle = styled.p`
  font-size: 1.2rem;
  color: #A2601E; /* 메인페이지와 동일한 색상 */
  opacity: 0.8;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 600;
  line-height: 1.6;
`;

export const RiskLevelBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 700;
  font-size: 16px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border: 2px solid ${props => props.color}30;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const Section = styled(Card)`
  margin-bottom: 2rem;
  border-left: 4px solid #A2601E; /* 메인페이지 컬러 */
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

export const SectionTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem; /* 메인페이지와 동일 */
  font-weight: 700;
  color: #333; /* 메인페이지와 동일 */
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const SectionIcon = styled.span`
  font-size: 1.5rem;
  color: #A2601E; /* 메인페이지 컬러 */
`;

export const IngredientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

export const IngredientCard = styled.div`
  padding: 1rem;
  border-radius: 10px; /* 메인페이지와 일치 */
  background: white;
  border: 2px solid ${props => {
    if (props.risk === 'danger') return '#ef4444';
    if (props.risk === 'warning') return '#f59e0b';
    return '#10b981';
  }};
  color: ${props => {
    if (props.risk === 'danger') return '#dc2626';
    if (props.risk === 'warning') return '#d97706';
    return '#059669';
  }};
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  small {
    display: block;
    margin-top: 0.5rem;
    opacity: 0.8;
    font-size: 12px;
  }
`;

export const WarningMessage = styled.div`
  padding: 1.5rem;
  border-radius: 10px; /* 메인페이지와 일치 */
  background: #fef2f2;
  border: 2px solid #fecaca;
  color: #dc2626;
  margin-top: 1rem;
  font-weight: 600;
`;

export const SafeMessage = styled.div`
  padding: 1.5rem;
  border-radius: 10px; /* 메인페이지와 일치 */
  background: #f0fdf4;
  border: 2px solid #bbf7d0;
  color: #059669;
  margin-top: 1rem;
  font-weight: 600;
`;

export const RecommendationCard = styled.div`
  padding: 1.5rem;
  border-radius: 10px; /* 메인페이지와 일치 */
  background: white;
  border: 2px solid #e5e7eb;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const MenuList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const MenuTag = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(162, 96, 30, 0.1); /* 메인페이지 컬러와 조화 */
  color: #A2601E; /* 메인페이지 컬러 */
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(162, 96, 30, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(162, 96, 30, 0.2);
    transform: translateY(-1px);
  }
`;

export const ChartContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 10px; /* 메인페이지와 일치 */
  border: 2px solid #e5e7eb;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const ChartTitle = styled.h4`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  text-align: center;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

export const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 10px; /* 메인페이지와 일치 */
  border: 2px solid #e5e7eb;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #A2601E; /* 메인페이지 컬러 */
  margin-bottom: 0.5rem;
`;

export const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
`;

export const TextContainer = styled.div`
  background: #f9fafb;
  padding: 1rem;
  border-radius: 10px; /* 메인페이지와 일치 */
  border: 2px solid #e5e7eb;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-style: italic;
  font-size: 1.1rem;
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #fed7aa; /* 메인페이지 컬러와 조화 */
  border-top: 3px solid #A2601E; /* 메인페이지 컬러 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const ErrorMessage = styled.div`
  padding: 1.5rem;
  border-radius: 10px; /* 메인페이지와 일치 */
  background: #fef2f2;
  border: 2px solid #fecaca;
  color: #dc2626;
  text-align: center;
  font-weight: 600;
`;

export const InfoCard = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 122, 0, 0.05); /* 메인페이지와 동일 */
  border: 1px solid #fed7aa; /* 메인페이지 컬러와 조화 */
  border-radius: 10px; /* 메인페이지와 일치 */
  text-align: center;
`;

export const InfoTitle = styled.div`
  font-weight: 700;
  color: #A2601E; /* 메인페이지 컬러 */
  margin-bottom: 0.5rem;
`;

export const InfoText = styled.div`
  color: #A47148; /* 메인페이지와 동일 */
  font-size: 0.9rem;
`;

export const PreviewCard = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem;
  min-width: 200px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 0.5rem;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid white;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #e5e7eb;
    z-index: -1;
  }
`;

export const PreviewTitle = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-align: center;
  color: #333;
`;

export const PreviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const PreviewItem = styled.div`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  background: ${props => {
    if (props.type === 'danger') return '#fef2f2';
    if (props.type === 'warning') return '#fef3c7';
    return '#f0fdf4';
  }};
  color: ${props => {
    if (props.type === 'danger') return '#dc2626';
    if (props.type === 'warning') return '#d97706';
    return '#059669';
  }};
  border: 1px solid ${props => {
    if (props.type === 'danger') return '#fecaca';
    if (props.type === 'warning') return '#fcd34d';
    return '#bbf7d0';
  }};
`;

export const PreviewMore = styled.div`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  font-style: italic;
`;
