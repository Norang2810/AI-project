import React from 'react';
import styled from 'styled-components';

const AnalysisContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const RiskLevelBadge = styled.div`
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

const Section = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 8px;
  background: #f8fafc;
  border-left: 4px solid #3b82f6;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const IngredientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const IngredientCard = styled.div`
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

const WarningMessage = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  margin-top: 12px;
`;

const SafeMessage = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #059669;
  margin-top: 12px;
`;

const RecommendationCard = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  margin-bottom: 12px;
`;

const MenuList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const MenuTag = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  background: #3b82f6;
  color: white;
  font-size: 12px;
  font-weight: 500;
`;

const AnalysisResult = ({ analysis }) => {
  if (!analysis) return null;

  const renderRiskLevel = (riskInfo) => {
    return (
      <RiskLevelBadge color={riskInfo.color}>
        <span>{riskInfo.icon}</span>
        <span>{riskInfo.title}</span>
      </RiskLevelBadge>
    );
  };

  const renderIngredients = (ingredients, riskAnalysis) => {
    return (
      <Section>
        <SectionTitle>성분 분석</SectionTitle>
        <p>총 {riskAnalysis.totalIngredients}개의 성분이 발견되었습니다.</p>
        
        {riskAnalysis.danger.length > 0 && (
          <WarningMessage>
            <strong>⚠️ 위험한 성분 발견:</strong>
            <IngredientGrid>
              {riskAnalysis.danger.map((item, index) => (
                <IngredientCard key={index} risk="danger">
                  {item.ingredient}
                  <br />
                  <small>매칭된 알레르기: {item.matchedAllergies.join(', ')}</small>
                </IngredientCard>
              ))}
            </IngredientGrid>
          </WarningMessage>
        )}
        
        {riskAnalysis.safe.length > 0 && (
          <SafeMessage>
            <strong>✅ 안전한 성분:</strong>
            <IngredientGrid>
              {riskAnalysis.safe.map((ingredient, index) => (
                <IngredientCard key={index} risk="safe">
                  {ingredient}
                </IngredientCard>
              ))}
            </IngredientGrid>
          </SafeMessage>
        )}
      </Section>
    );
  };

  const renderRiskAssessment = (riskData) => {
    const { riskLevel, riskInfo, mlPrediction, ruleBasedAnalysis } = riskData;
    
    return (
      <Section>
        <SectionTitle>알레르기 위험도 평가</SectionTitle>
        <div style={{ marginBottom: '16px' }}>
          {renderRiskLevel(riskInfo)}
        </div>
        <p>{riskInfo.description}</p>
        
        {mlPrediction && (
          <div style={{ marginTop: '12px' }}>
            <strong>AI 예측:</strong> {mlPrediction.final_risk} 
            (신뢰도: {(mlPrediction.confidence * 100).toFixed(1)}%)
          </div>
        )}
        
        {ruleBasedAnalysis && (
          <div style={{ marginTop: '8px' }}>
            <strong>규칙 기반 분석:</strong> {ruleBasedAnalysis.risk_level}
            <br />
            <small>위험 성분: {ruleBasedAnalysis.risky_count}개 / 총 {ruleBasedAnalysis.total_ingredients}개</small>
          </div>
        )}
      </Section>
    );
  };

  const renderRecommendations = (recommendations) => {
    return (
      <Section>
        <SectionTitle>추천 사항</SectionTitle>
        
        {recommendations.safe_alternatives && recommendations.safe_alternatives.length > 0 && (
          <RecommendationCard>
            <strong>✅ 안전한 대안 메뉴:</strong>
            <MenuList>
              {recommendations.safe_alternatives.slice(0, 5).map((menu, index) => (
                <MenuTag key={index}>{menu.menu.name}</MenuTag>
              ))}
            </MenuList>
          </RecommendationCard>
        )}
        
        {recommendations.warning_messages && recommendations.warning_messages.length > 0 && (
          <WarningMessage>
            <strong>⚠️ 주의사항:</strong>
            {recommendations.warning_messages.map((warning, index) => (
              <div key={index}>{warning.message}</div>
            ))}
          </WarningMessage>
        )}
        
        {recommendations.safety_tips && recommendations.safety_tips.length > 0 && (
          <RecommendationCard>
            <strong>💡 안전 팁:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              {recommendations.safety_tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </RecommendationCard>
        )}
      </Section>
    );
  };

  const renderExtractedText = (text) => {
    if (!text) return null;
    
    return (
      <Section>
        <SectionTitle>추출된 텍스트</SectionTitle>
        <div style={{ 
          background: '#f8fafc', 
          padding: '12px', 
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {text}
        </div>
      </Section>
    );
  };

  return (
    <AnalysisContainer>
      <h2 style={{ marginBottom: '24px', color: '#1f2937' }}>
        📊 분석 결과
      </h2>
      
      {analysis.extractedText && renderExtractedText(analysis.extractedText)}
      
      {analysis.menuAnalysis.map((item, index) => {
        switch (item.type) {
          case 'ingredients':
            return renderIngredients(item.data.ingredients, item.data.riskAnalysis);
          case 'risk_assessment':
            return renderRiskAssessment(item.data);
          case 'recommendations':
            return renderRecommendations(item.data);
          default:
            return null;
        }
      })}
      
      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        background: '#f0f9ff', 
        borderRadius: '8px',
        border: '1px solid #bae6fd'
      }}>
        <strong>분석 시간:</strong> {new Date(analysis.timestamp).toLocaleString()}
        {analysis.userAllergies && analysis.userAllergies.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <strong>사용자 알레르기:</strong> {analysis.userAllergies.join(', ')}
          </div>
        )}
      </div>
    </AnalysisContainer>
  );
};

export default AnalysisResult; 