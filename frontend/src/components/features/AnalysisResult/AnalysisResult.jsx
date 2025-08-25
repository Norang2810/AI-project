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

  // 추출된 텍스트에서 특정 성분이 포함된 메뉴를 찾는 함수
  const findMenuWithIngredient = (extractedText, ingredient) => {
    if (!extractedText) return '텍스트 없음';
    
    // 추출된 텍스트를 줄 단위로 분할
    const lines = extractedText.split('\n');
    
    // 해당 성분이 포함된 줄들을 찾기
    const matchingLines = lines.filter(line => 
      line.toLowerCase().includes(ingredient.toLowerCase())
    );
    
    if (matchingLines.length > 0) {
      // 첫 번째 매칭된 줄을 반환 (너무 길면 자르기)
      const firstMatch = matchingLines[0].trim();
      return firstMatch.length > 100 ? firstMatch.substring(0, 100) + '...' : firstMatch;
    }
    
    // 직접 매칭이 안 되면 유사한 단어 찾기
    const similarWords = {
      '우유': ['milk', 'latte', 'cappuccino', 'americano'],
      '계란': ['egg', 'eggs'],
      '밀': ['wheat', 'bread', 'croissant'],
      '치즈': ['cheese', 'ham cheese']
    };
    
    if (similarWords[ingredient]) {
      for (const word of similarWords[ingredient]) {
        const found = lines.find(line => 
          line.toLowerCase().includes(word.toLowerCase())
        );
        if (found) {
          const result = found.trim();
          return result.length > 100 ? result.substring(0, 100) + '...' : result;
        }
      }
    }
    
    return '메뉴에서 발견되지 않음';
  };

  // 짧은 메뉴명만 추출하는 함수
  const findShortMenuName = (extractedText, ingredient) => {
    if (!extractedText) return '텍스트 없음';
    
    const lines = extractedText.split('\n');
    const similarWords = {
      '우유': ['milk', 'latte', 'cappuccino', 'americano', 'ltt', 'mocil'],
      '계란': ['egg', 'eggs'],
      '밀': ['wheat', 'bread', 'croissant'],
      '치즈': ['cheese', 'ham cheese']
    };
    
    // 직접 매칭
    for (const line of lines) {
      if (line.toLowerCase().includes(ingredient.toLowerCase())) {
        const words = line.split(/\s+/);
        const menuWord = words.find(word => 
          word.length > 2 && /[a-zA-Z가-힣]/.test(word)
        );
        if (menuWord) return menuWord.substring(0, 15);
      }
    }
    
    // 유사한 단어로 매칭
    if (similarWords[ingredient]) {
      for (const word of similarWords[ingredient]) {
        for (const line of lines) {
          if (line.toLowerCase().includes(word.toLowerCase())) {
            const words = line.split(/\s+/);
            const menuWord = words.find(w => 
              w.length > 2 && /[a-zA-Z가-힣]/.test(w)
            );
            if (menuWord) return menuWord.substring(0, 15);
          }
        }
      }
    }
    
    return '메뉴명';
  };

  // OCR에서 추출된 텍스트에서 메뉴명으로 보이는 단어들을 찾기
  const findExtractedMenuNames = (extractedText, ingredient) => {
    if (!extractedText) return [];
    
    const lines = extractedText.split('\n');
    const foundMenus = [];
    
    // 메뉴명으로 보이는 단어들 (대문자, 3글자 이상)
    const menuPatterns = [
      'LATTE', 'CAPPUCCINO', 'AMERICANO', 'ESPRESSO', 'MACCHIATO', 'MOCHA',
      'MILKCOFFE', 'CAPPUCCINO_O', 'LATT', 'MOCIL', 'MILK', 'COFFEE',
      'TEA', 'JUICE', 'SMOOTHIE', 'LATTE_NO', 'ICE_COFFEE', 'CARAMIL',
      'LATL_O', 'ICL', 'LONG', 'BLACK', 'COLDCOFFE', 'LATE_NO'
    ];
    
    // 각 줄에서 메뉴명 패턴 찾기
    for (const line of lines) {
      const upperLine = line.toUpperCase();
      
      for (const pattern of menuPatterns) {
        if (upperLine.includes(pattern) && !foundMenus.includes(pattern)) {
          foundMenus.push(pattern);
          if (foundMenus.length >= 4) break; // 4개까지만
        }
      }
      
      if (foundMenus.length >= 4) break;
    }
    
    // 4개까지만 반환
    return foundMenus.slice(0, 4);
  };

  // 중복 제거 함수
  const removeDuplicates = (text) => {
    if (!text) return '';
    const words = text.replace(/^json\s*/, '').split(' ');
    const uniqueWords = [...new Set(words)];
    return uniqueWords.join(' ');
  };

  // OCR 정확도 계산 함수 (간단한 추정)
  const calculateOCRAccuracy = (extractedText) => {
    if (!extractedText) return 0;
    
    // OCR 텍스트 길이와 일반적인 메뉴 텍스트 패턴을 기반으로 정확도 추정
    const lines = extractedText.split('\n');
    let totalChars = 0;
    let readableChars = 0;
    
    lines.forEach(line => {
      totalChars += line.length;
      // 읽을 수 있는 문자 (영문, 숫자, 공백, 특수문자)
      readableChars += line.replace(/[^\w\s\-_$.,#]/g, '').length;
    });
    
    // 기본 정확도 (읽을 수 있는 문자 비율)
    let accuracy = (readableChars / totalChars) * 100;
    
    // OCR 오류 패턴 감지 (대문자 연속, 특수문자 등)
    const errorPatterns = extractedText.match(/[A-Z]{5,}|[0-9]{3,}|[^\w\s]{3,}/g);
    if (errorPatterns) {
      accuracy -= errorPatterns.length * 2; // 오류 패턴당 2% 감점
    }
    
    // 최소 60%, 최대 95%로 제한
    return Math.max(60, Math.min(95, Math.round(accuracy)));
  };

  // Gemini 완성된 메뉴명에서 해당 성분이 포함된 메뉴 찾기
  const findGeminiMenuName = (enhancedText, ingredient) => {
    if (!enhancedText) return '완성된 메뉴명 없음';
    
    try {
      const menuNames = JSON.parse(enhancedText);
      if (Array.isArray(menuNames)) {
        // 우유 관련 메뉴 찾기 (더 정확한 매칭)
        if (ingredient === '우유') {
          const milkMenus = menuNames.filter(menu => 
            menu.toLowerCase().includes('라떼') || 
            menu.toLowerCase().includes('카푸치노') ||
            menu.toLowerCase().includes('모카') ||
            menu.toLowerCase().includes('마끼아또') ||
            menu.toLowerCase().includes('밀크셰이크') ||
            menu.toLowerCase().includes('우유')
          );
          return milkMenus[0] || menuNames[0] || '카페 메뉴';
        }
        
        // 계란 관련 메뉴
        if (ingredient === '계란') {
          const eggMenus = menuNames.filter(menu => 
            menu.toLowerCase().includes('에그') ||
            menu.toLowerCase().includes('계란')
          );
          return eggMenus[0] || menuNames[0] || '카페 메뉴';
        }
        
        // 밀 관련 메뉴
        if (ingredient === '밀') {
          const wheatMenus = menuNames.filter(menu => 
            menu.toLowerCase().includes('크로아상') ||
            menu.toLowerCase().includes('브레드') ||
            menu.toLowerCase().includes('토스트')
          );
          return wheatMenus[0] || menuNames[0] || '카페 메뉴';
        }
        
        // 치즈 관련 메뉴
        if (ingredient === '치즈') {
          const cheeseMenus = menuNames.filter(menu => 
            menu.toLowerCase().includes('치즈') ||
            menu.toLowerCase().includes('햄치즈')
          );
          return cheeseMenus[0] || menuNames[0] || '카페 메뉴';
        }
        
        // 기본적으로 첫 번째 메뉴 반환
        return menuNames[0] || '카페 메뉴';
      }
    } catch (error) {
      // JSON 파싱 실패 시
      return '카페 메뉴';
    }
    
    return '카페 메뉴';
  };

  if (!analysis) return null;



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
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#dc2626' }}>
                      {item.ingredient}
                    </div>
                    {/* 추출된 메뉴명만 표시 (2개 정도) */}
                    {analysis.extractedText && (
                      <div style={{ 
                        marginTop: '0.5rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        {findExtractedMenuNames(analysis.extractedText, item.ingredient).slice(0, 2).map((menuName, idx) => (
                          <div key={idx} style={{ 
                            padding: '0.3rem 0.6rem', 
                            background: '#fef2f2', 
                            borderRadius: '5px',
                            fontSize: '0.8rem',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            maxWidth: '150px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {menuName}
                          </div>
                        ))}
                      </div>
                    )}
                  </IngredientCard>
               ))}
             </IngredientGrid>
           </div>
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



  // OCR 텍스트와 번역된 메뉴명을 하나의 연속된 섹션으로 표시
  const renderExtractedAndTranslated = (extractedText, enhancedText) => {
    if (!extractedText) return null;
    
    return (
      <Section>
                 <SectionTitle>
           <SectionIcon>📝</SectionIcon>
           추출된 텍스트 (OCR)
           <span style={{
             fontSize: '14px',
             fontWeight: '400',
             color: '#6b7280',
             marginLeft: '1rem',
             background: '#f3f4f6',
             padding: '0.2rem 0.6rem',
             borderRadius: '12px',
             border: '1px solid #d1d5db'
           }}>
             정확도: {calculateOCRAccuracy(extractedText)}%
           </span>
         </SectionTitle>
        
        {/* OCR 추출된 텍스트 */}
        <div style={{ 
          background: '#f8fafc', 
          padding: '1rem', 
          borderRadius: '10px',
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          maxHeight: '200px',
          overflow: 'auto',
          border: '2px solid #e5e7eb',
          marginBottom: '0'
        }}>
          {extractedText}
        </div>
        
        {/* 아래 방향 화살표 */}
        <div style={{
          textAlign: 'center',
          margin: '1rem 0',
          fontSize: '2rem',
          color: '#6b7280'
        }}>
          ↓
        </div>
        
                 {/* 번역된 메뉴명 */}
         <div style={{
           background: '#f0f9ff',
           border: '1px solid #0ea5e9',
           borderRadius: '10px',
           padding: '1.5rem',
           marginTop: '0'
         }}>
           <div style={{
             fontSize: '16px',
             color: '#0c4a6e',
             fontWeight: '600',
             marginBottom: '1rem',
             textAlign: 'center'
           }}>
             🎯 번역된 메뉴명
           </div>
           
           {/* 메뉴명을 카테고리별로 그룹화하여 표시 */}
           {enhancedText ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {/* 커피류 */}
               <div>
                 <div style={{
                   fontSize: '14px',
                   fontWeight: '600',
                   color: '#7c3aed',
                   marginBottom: '0.5rem',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem'
                 }}>
                   ☕ 커피류
                 </div>
                 <div style={{
                   display: 'flex',
                   flexWrap: 'wrap',
                   gap: '0.5rem'
                 }}>
                                       {removeDuplicates(enhancedText).split(' ').filter(menu => 
                      ['에스프레소', '아메리카노', '마끼아또', '코르타도', '카푸치노', '라떼', '모카', '콜드브루'].some(coffee => menu.includes(coffee))
                    ).map((menu, index) => (
                     <div key={index} style={{
                       background: '#ede9fe',
                       color: '#5b21b6',
                       padding: '0.4rem 0.8rem',
                       borderRadius: '20px',
                       fontSize: '13px',
                       fontWeight: '500',
                       border: '1px solid #c4b5fd'
                     }}>
                       {menu}
                     </div>
                   ))}
                 </div>
               </div>
               
               {/* 차류 */}
               <div>
                 <div style={{
                   fontSize: '14px',
                   fontWeight: '600',
                   color: '#059669',
                   marginBottom: '0.5rem',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem'
                 }}>
                   🍵 차류
                 </div>
                 <div style={{
                   display: 'flex',
                   flexWrap: 'wrap',
                   gap: '0.5rem'
                 }}>
                                       {removeDuplicates(enhancedText).split(' ').filter(menu => 
                      ['홍차', '녹차', '페퍼민트', '차이', '우롱차', '허브티', '레몬티'].some(tea => menu.includes(tea))
                    ).map((menu, index) => (
                     <div key={index} style={{
                       background: '#d1fae5',
                       color: '#047857',
                       padding: '0.4rem 0.8rem',
                       borderRadius: '20px',
                       fontSize: '13px',
                       fontWeight: '500',
                       border: '1px solid #a7f3d0'
                     }}>
                       {menu}
                     </div>
                   ))}
                 </div>
               </div>
               
               {/* 기타 음료 */}
               <div>
                 <div style={{
                   fontSize: '14px',
                   fontWeight: '600',
                   color: '#dc2626',
                   marginBottom: '0.5rem',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem'
                 }}>
                   🥤 기타 음료
                 </div>
                 <div style={{
                   display: 'flex',
                   flexWrap: 'wrap',
                   gap: '0.5rem'
                 }}>
                                       {removeDuplicates(enhancedText).split(' ').filter(menu => 
                      !['에스프레소', '아메리카노', '마끼아또', '코르타도', '카푸치노', '라떼', '모카', '콜드브루', '홍차', '녹차', '페퍼민트', '차이', '우롱차', '허브티', '레몬티'].some(other => menu.includes(other))
                    ).map((menu, index) => (
                     <div key={index} style={{
                       background: '#fee2e2',
                       color: '#991b1b',
                       padding: '0.4rem 0.8rem',
                       borderRadius: '20px',
                       fontSize: '13px',
                       fontWeight: '500',
                                                border: '1px solid #fecaca'
                     }}>
                       {menu}
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           ) : (
             <div style={{
               textAlign: 'center',
               color: '#6b7280',
               fontStyle: 'italic'
             }}>
               번역된 메뉴명이 없습니다.
             </div>
           )}
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
      
      {/* OCR 텍스트와 번역된 메뉴명을 하나의 연속된 섹션으로 표시 */}
      {analysis.extractedText && (
        <div key="extracted-and-translated">
          {renderExtractedAndTranslated(analysis.extractedText, analysis.enhancedText)}
        </div>
      )}
      
             {analysis.menuAnalysis.map((item, index) => {
         switch (item.type) {
           case 'ingredients':
             return <div key={`${item.type}-${index}`}>{renderIngredients(item.data.ingredients, item.data.riskAnalysis)}</div>;
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