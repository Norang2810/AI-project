import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  AnalysisContainer,
  AnalysisHeader,
  AnalysisTitle,
  AnalysisSubtitle,
  RiskLevelBadge,
  Section,
  SectionTitle,
  SectionIcon,
  IngredientGrid,
  IngredientCard,
  WarningMessage,
  SafeMessage,
  RecommendationCard,
  MenuList,
  MenuTag,
  ChartContainer,
  ChartTitle,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  InfoCard,
  InfoTitle,
  InfoText,
  PreviewCard,
  PreviewTitle,
  PreviewList,
  PreviewItem,
  PreviewMore
} from './AnalysisResult.styles';

const AnalysisResult = ({ analysis, onNotification }) => {
  const [hasNotified, setHasNotified] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null); // 통계 카드 호버 상태 관리

  useEffect(() => {
    // 새로운 분석 결과가 들어오면 알림 상태 리셋
    setHasNotified(false);
  }, [analysis]);

  useEffect(() => {
    if (analysis && !hasNotified) {
      checkForDangerousIngredients(analysis);
    }
  }, [analysis, hasNotified]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkForDangerousIngredients = (analysis) => {
    const dangerousIngredients = analysis.menuAnalysis
      ?.find(item => item.type === 'ingredients')
      ?.data?.riskAnalysis?.danger || [];

    if (dangerousIngredients.length > 0 && onNotification && !hasNotified) {
      // 우측 상단 알림 표시
      onNotification({
        id: Date.now(),
        type: 'danger',
        icon: '⚠️',
        title: '알레르기 위험 성분 발견!',
        message: `${dangerousIngredients.length}개의 위험 성분이 발견되었습니다.`,
        timestamp: new Date()
      });
      setHasNotified(true);
    }
  };

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
    // 차트 데이터 준비
    const pieChartData = [
      { name: '위험', value: riskAnalysis.danger.length, color: '#ef4444' },
      { name: '주의', value: riskAnalysis.warning?.length || 0, color: '#f59e0b' },
      { name: '안전', value: riskAnalysis.safe.length, color: '#10b981' }
    ].filter(item => item.value > 0); // 값이 0인 항목 제거

    const barChartData = [
      { name: '총 성분', value: riskAnalysis.totalIngredients, color: '#6b7280' },
      { name: '위험 성분', value: riskAnalysis.danger.length, color: '#ef4444' },
      { name: '주의 성분', value: riskAnalysis.warning?.length || 0, color: '#f59e0b' },
      { name: '안전 성분', value: riskAnalysis.safe.length, color: '#10b981' }
    ];

    return (
      <Section>
        <SectionTitle>
          <SectionIcon>🔍</SectionIcon>
          성분 분석
        </SectionTitle>
        
        {/* 통계 카드 */}
        <StatsGrid>
          <StatCard>
            <StatValue>{riskAnalysis.totalIngredients}</StatValue>
            <StatLabel>총 성분 수</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue style={{ color: '#ef4444' }}>{riskAnalysis.danger.length}</StatValue>
            <StatLabel>위험 성분</StatLabel>
          </StatCard>
          <StatCard 
            onMouseEnter={() => setHoveredCard('warning')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ position: 'relative' }}
          >
            <StatValue style={{ color: '#f59e0b' }}>{riskAnalysis.warning?.length || 0}</StatValue>
            <StatLabel>주의 성분</StatLabel>
            {hoveredCard === 'warning' && riskAnalysis.warning && riskAnalysis.warning.length > 0 && (
              <PreviewCard>
                <PreviewTitle>⚠️ 주의가 필요한 성분</PreviewTitle>
                <PreviewList>
                  {riskAnalysis.warning.slice(0, 3).map((ingredient, index) => (
                    <PreviewItem key={`preview-warning-${index}`} type="warning">
                      {ingredient}
                    </PreviewItem>
                  ))}
                  {riskAnalysis.warning.length > 3 && (
                    <PreviewMore>+{riskAnalysis.warning.length - 3}개 더</PreviewMore>
                  )}
                </PreviewList>
              </PreviewCard>
            )}
          </StatCard>
          <StatCard 
            onMouseEnter={() => setHoveredCard('safe')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ position: 'relative' }}
          >
            <StatValue style={{ color: '#10b981' }}>{riskAnalysis.safe.length}</StatValue>
            <StatLabel>안전 성분</StatLabel>
            {hoveredCard === 'safe' && riskAnalysis.safe.length > 0 && (
              <PreviewCard>
                <PreviewTitle>✅ 안전한 성분</PreviewTitle>
                <PreviewList>
                  {riskAnalysis.safe.slice(0, 3).map((ingredient, index) => (
                    <PreviewItem key={`preview-safe-${index}`} type="safe">
                      {ingredient}
                    </PreviewItem>
                  ))}
                  {riskAnalysis.safe.length > 3 && (
                    <PreviewMore>+{riskAnalysis.safe.length - 3}개 더</PreviewMore>
                  )}
                </PreviewList>
              </PreviewCard>
            )}
          </StatCard>
        </StatsGrid>

        {/* 위험한 성분 정보 - 고정 표시 */}
        {riskAnalysis.danger.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              color: '#dc2626', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⚠️ 위험한 성분 발견
            </div>
            <IngredientGrid>
              {riskAnalysis.danger.map((item, index) => (
                <IngredientCard key={`danger-${item.ingredient}-${index}`} risk="danger">
                  {item.ingredient}
                  <small>매칭된 알레르기: {item.matchedAllergies.join(', ')}</small>
                </IngredientCard>
              ))}
            </IngredientGrid>
          </div>
        )}
      </Section>
    );
  };

  const renderRiskAssessment = (riskData) => {
    const { riskInfo, mlPrediction, ruleBasedAnalysis } = riskData;
    
    // 위험도 점수 차트 데이터
    const riskScoreData = [
      { name: 'AI 예측', value: mlPrediction?.confidence * 100 || 0, color: '#3b82f6' },
      { name: '규칙 기반', value: ruleBasedAnalysis?.risky_count / ruleBasedAnalysis?.total_ingredients * 100 || 0, color: '#ef4444' }
    ].filter(item => item.value > 0); // 값이 0인 항목 제거
    
    return (
      <Section>
        <SectionTitle>
          <SectionIcon>⚠️</SectionIcon>
          알레르기 위험도 평가
        </SectionTitle>
        
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {renderRiskLevel(riskInfo)}
        </div>
        
        {/* 위험도 점수 차트 - 데이터가 있을 때만 표시 */}
        {riskScoreData.length > 0 && (
          <ChartContainer>
            <ChartTitle>위험도 점수 비교</ChartTitle>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Bar dataKey="value" fill="#A2601E" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </Section>
    );
  };

  const renderRecommendations = (recommendations) => {
    return (
      <Section>
        <SectionTitle>
          <SectionIcon>💡</SectionIcon>
          추천 사항
        </SectionTitle>
        
        {recommendations.safe_alternatives && recommendations.safe_alternatives.length > 0 && (
          <RecommendationCard>
            <strong>✅ 안전한 대안 메뉴:</strong>
            <MenuList>
              {recommendations.safe_alternatives.slice(0, 5).map((menu, index) => (
                <MenuTag key={`safe-menu-${menu.menu.name}-${index}`}>{menu.menu.name}</MenuTag>
              ))}
            </MenuList>
          </RecommendationCard>
        )}
        
        {recommendations.warning_messages && recommendations.warning_messages.length > 0 && (
          <WarningMessage>
            <strong>⚠️ 주의사항:</strong>
            {recommendations.warning_messages.map((warning, index) => (
              <div key={`warning-${warning.message}-${index}`}>{warning.message}</div>
            ))}
          </WarningMessage>
        )}
        
        {recommendations.safety_tips && recommendations.safety_tips.length > 0 && (
          <RecommendationCard>
            <strong>💡 안전 팁:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
              {recommendations.safety_tips.map((tip, index) => (
                <li key={`tip-${tip}-${index}`} style={{ marginBottom: '0.5rem' }}>{tip}</li>
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
        <SectionTitle>
          <SectionIcon>📝</SectionIcon>
          추출된 텍스트
        </SectionTitle>
        <div style={{ 
          background: '#f8fafc', 
          padding: '1rem', 
          borderRadius: '10px',
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          maxHeight: '200px',
          overflow: 'auto',
          border: '2px solid #e5e7eb'
        }}>
          {text}
        </div>
      </Section>
    );
  };

  return (
    <AnalysisContainer>
      <AnalysisHeader>
        <AnalysisSubtitle>
          AI가 분석한 메뉴판의 알레르기 성분 정보를 확인하세요
        </AnalysisSubtitle>
      </AnalysisHeader>
      
      {analysis.menuAnalysis.map((item, index) => {
        switch (item.type) {
          case 'ingredients':
            return <div key={`${item.type}-${index}`}>{renderIngredients(item.data.ingredients, item.data.riskAnalysis)}</div>;
          case 'risk_assessment':
            return <div key={`${item.type}-${index}`}>{renderRiskAssessment(item.data)}</div>;
          case 'recommendations':
            return <div key={`${item.type}-${index}`}>{renderRecommendations(item.data)}</div>;
          default:
            return null;
        }
      })}
      
      <InfoCard>
        <InfoTitle>📅 분석 정보</InfoTitle>
        <InfoText>
          <strong>분석 시간:</strong> {new Date(analysis.timestamp).toLocaleString()}
          {analysis.userAllergies && analysis.userAllergies.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <strong>사용자 알레르기:</strong> {analysis.userAllergies.join(', ')}
            </div>
          )}
        </InfoText>
      </InfoCard>
    </AnalysisContainer>
  );
};

export default AnalysisResult; 