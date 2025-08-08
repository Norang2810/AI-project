import styled from 'styled-components';

export const AnalysisContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const RiskLevelBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border: 2px solid ${props => props.color}30;
`;

export const Section = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 8px;
  background: #f8fafc;
  border-left: 4px solid #3b82f6;
`;

export const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

export const IngredientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

export const IngredientCard = styled.div`
  padding: 12px;
  border-radius: 6px;
  background: white;
  border: 1px solid ${props => {
    if (props.risk === 'danger') return '#ef4444';
    if (props.risk === 'warning') return '#f59e0b';
    return '#10b981';
  }};
  color: ${props => {
    if (props.risk === 'danger') return '#dc2626';
    if (props.risk === 'warning') return '#d97706';
    return '#059669';
  }};
  font-weight: 500;
`;

export const WarningMessage = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  margin-top: 12px;
`;

export const SafeMessage = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #059669;
  margin-top: 12px;
`;

export const RecommendationCard = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  margin-bottom: 12px;
`;

export const MenuList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

export const MenuTag = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
`;

export const TextContainer = styled.div`
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-style: italic;
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const ErrorMessage = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  text-align: center;
`;
