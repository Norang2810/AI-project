import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/apiFetch';
import {
  MyPageContainer,
  NavigationPanel,
  NavItem,
  NavButton,
  ContentPanel,
  ContentArea,
  SectionContainer,
  MyInfoContentWrapper,
  InfoCard,
  CardTitle,
  InfoRow,
  InfoLabel,
  InfoValue,
  PasswordInput,
  ChangePasswordButton,
  AllergyGridContainer,
  AllergyCategoryCard,
  AllergyCategoryTitle,
  AllergySeverityBadge,
  AllergyItemsContainer,
  AllergyItemTag,
  AllergyButtonContainer,
  EmptyAllergyText
} from './MyPage.styles';

import styled from 'styled-components';

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  margin-bottom: 1rem;
`;

const MyPage = () => {
  const [activeSection, setActiveSection] = useState('myInfo');
  const [userInfo, setUserInfo] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState([]);
  const [analysesLoading, setAnalysesLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({type: '', text: ''})

  const navigate = useNavigate();

  const navItems = [
    { id: 'myInfo', label: '내 정보' },
    { id: 'allergyInfo', label: '내 알레르기 정보' },
    { id: 'analysisHistory', label: '분석 내역' },
    { id: 'imageView', label: '이미지 보기' }
  ];

  const fetchUserInfo = async () => {
    try {
      const response = await apiFetch('/api/user/profile');

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data.data.user);
      }
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
    }
  };

  const fetchAllergies = async () => {
    try {
      const response = await apiFetch('/api/user/allergies');

      if (response.ok) {
        const data = await response.json();
        setAllergies(data.data.allergies);
      }
    } catch (error) {
      console.error('알레르기 정보 조회 오류:', error);
    }
  };

  const fetchAnalyses = async () => {
    try {
      setAnalysesLoading(true);
      const response = await apiFetch('/api/menu/user-analyses?limit=5');

      if (response.ok) {
        const data = await response.json();
        // 이미지 URL을 백엔드 서버 경로로 변환
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
        const processedAnalyses = data.data.analyses.map(analysis => {
          let imageUrl = null;
          if (analysis.imageUrl) {
            // imageUrl이 이미 /uploads/로 시작하는지 확인
            if (analysis.imageUrl.startsWith('/uploads/')) {
              imageUrl = `${backendUrl}${analysis.imageUrl}`;
            } else if (analysis.imageUrl.startsWith('uploads/')) {
              imageUrl = `${backendUrl}/${analysis.imageUrl}`;
            } else {
              imageUrl = `${backendUrl}/uploads/${analysis.imageUrl}`;
            }
            
            // 디버깅을 위한 로그
            console.log('이미지 URL 처리:', {
              original: analysis.imageUrl,
              processed: imageUrl,
              backendUrl: backendUrl
            });
          }
          
          return {
            ...analysis,
            imageUrl: imageUrl
          };
        });
        setAnalyses(processedAnalyses);
      }
    } catch (error) {
      console.error('분석 내역 조회 오류:', error);
    } finally {
      setAnalysesLoading(false);
    }
  };

  const cleanupOldAnalyses = async () => {
    try {
      const response = await apiFetch('/api/menu/cleanup-old-analyses?keep=5', {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('오래된 분석 내역 정리 완료:', data.message);
        // 정리 후 최신 데이터 다시 가져오기
        await fetchAnalyses();
      }
    } catch (error) {
      console.error('오래된 분석 내역 정리 오류:', error);
    }
  };

  const handleChangePassword = async () => {
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmNewPassword) {
      return setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
    }

    if (newPassword.length < 6) {
      return setMessage({ type: 'error', text: '비밀번호는 6자 이상이어야 합니다.' });
    }
    try{
      const response = await apiFetch('/api/user/password', {
        method : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword
        })
      });

      const data = await response.json();
      if(response.ok  && data.success){
        setMessage({ type: 'success', text:'비밀번호가 변경되었습니다.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
      else {
        if (data.message === '현재 비밀번호가 올바르지 않습니다.') {
          setMessage({ type: 'error', text: '현재 비밀번호가 올바르지 않습니다.' });
        } else {
          setMessage({ type: 'error', text: data.message || '비밀번호 변경에 실패했습니다.' });
        }
      }
    }
    catch(error){
      console.error('비밀번호 변경 오류', error);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUserInfo(), fetchAllergies(), fetchAnalyses()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // 분석 내역이 5개를 초과하면 자동으로 오래된 내역 정리
  useEffect(() => {
    if (analyses.length > 5) {
      cleanupOldAnalyses();
    }
  }, [analyses.length]);

  const renderContent = () => {
    switch (activeSection) {
      case 'myInfo':
        return (
          <SectionContainer>
            <h2>내 정보</h2>
            <MyInfoContentWrapper>
              <InfoCard>
                <CardTitle>📋 현재 등록된 정보</CardTitle>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <InfoRow>
                    <InfoLabel>이름:</InfoLabel>
                    <InfoValue>
                      {userInfo?.name || '등록된 이름이 없습니다'}
                    </InfoValue>
                  </InfoRow>

                  <InfoRow>
                    <InfoLabel>이메일:</InfoLabel>
                    <InfoValue>
                      {userInfo?.email || '등록된 이메일이 없습니다'}
                    </InfoValue>
                  </InfoRow>

                  <InfoRow>
                    <InfoLabel>전화번호:</InfoLabel>
                    <InfoValue>
                      {userInfo?.phone || '등록된 전화번호가 없습니다'}
                    </InfoValue>
                  </InfoRow>
                </div>
              </InfoCard>

              <InfoCard>
                <CardTitle>🔐 비밀번호 변경</CardTitle>

                {message.text && (
                  message.type === 'error' ? (
                    <ErrorMessage>{message.text}</ErrorMessage>
                  ) : (
                    <SuccessMessage>{message.text}</SuccessMessage>
                  )
                )}

                <InfoRow style={{ marginBottom: '1.5rem' }}>
                  <InfoLabel>현재 비밀번호:</InfoLabel>
                  <PasswordInput
                    type="password"
                    placeholder="현재 비밀번호를 입력하세요"
                    value={currentPassword}
                    onChange={(e)=>setCurrentPassword(e.target.value)}
                  />
                </InfoRow>
                <InfoRow style={{ marginBottom: '1.5rem' }}>
                  <InfoLabel>새 비밀번호:</InfoLabel>
                  <div style={{ flex: '1' }}>
                    <PasswordInput
                      type="password"
                      placeholder="새 비밀번호를 입력하세요 * 6자리 이상 *"
                      value={newPassword}
                      onChange={(e)=>setNewPassword(e.target.value)}
                    />
                  </div>
                </InfoRow>
                <InfoRow style={{ marginBottom: '2rem' }}>
                  <InfoLabel>새 비밀번호 확인:</InfoLabel>
                  <PasswordInput
                    type="password"
                    placeholder="새 비밀번호를 다시 입력하세요"
                    value={confirmNewPassword}
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                  />
                </InfoRow>
                <ChangePasswordButton onClick={handleChangePassword}>
                  비밀번호변경
                </ChangePasswordButton>
              </InfoCard>
            </MyInfoContentWrapper>
          </SectionContainer>
        );
      case 'allergyInfo':
        const ALLERGY_CATEGORIES = {
          '곡물': {
            icon: '🌾',
            severity: 'medium',
            items: ['밀', '보리', '호밀', '오트밀', '옥수수']
          },
          '견과류': {
            icon: '🥜',
            severity: 'high',
            items: ['땅콩', '아몬드', '호두', '캐슈넛', '피스타치오']
          },
          '유제품': {
            icon: '🥛',
            severity: 'high',
            items: ['우유', '치즈', '요거트', '버터', '크림', '연유']
          },
          '계란': {
            icon: '🥚',
            severity: 'high',
            items: ['계란']
          },
          '과일': {
            icon: '🍎',
            severity: 'medium',
            items: ['딸기', '키위', '망고', '복숭아', '사과', '파인애플', '바나나', '포도']
          },
          '기타': {
            icon: '⚠️',
            severity: 'low',
            items: ['대두', 'MSG', '아황산염', '색소', '보존료', '코코넛', '시나몬', '꿀', '젤라틴', '콩', '바닐라', '초콜릿', '코코아', '카카오']
          }
        };

        const selectedAllergyNames = new Set(allergies.map(a => a.name));

        const getSeverityBadgeColor = (severity) => {
          switch (severity) {
            case 'high':
              return '#EF4444';
            case 'medium':
              return '#F59E0B';
            case 'low':
              return '#10B981';
            default:
              return '#6B7280';
          }
        };

        return (
          <SectionContainer>
            <h2>내 알레르기 정보</h2>
            <MyInfoContentWrapper style={{ flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <AllergyGridContainer>
                {Object.entries(ALLERGY_CATEGORIES).map(([category, info]) => {
                  const selectedItems = info.items.filter(item => selectedAllergyNames.has(item));
                  const badgeColor = getSeverityBadgeColor(info.severity);
                  const isCategorySelected = selectedItems.length > 0;

                  return (
                    <AllergyCategoryCard 
                      key={category} 
                      $isCategorySelected={isCategorySelected} 
                      $badgeColor={badgeColor}
                    >
                      <div>
                        <AllergyCategoryTitle>
                          <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{info.icon}</span>
                          {category}
                        </AllergyCategoryTitle>
                        <AllergySeverityBadge $badgeColor={badgeColor}>
                          {info.severity === 'high' ? '높음' : info.severity === 'medium' ? '보통' : '낮음'}
                        </AllergySeverityBadge>
                      </div>
                      {isCategorySelected ? (
                        <AllergyItemsContainer $isEtcCategory={category === '기타'}>
                          {selectedItems.map(item => (
                            <AllergyItemTag key={item}>
                              {item}
                            </AllergyItemTag>
                          ))}
                        </AllergyItemsContainer>
                      ) : (
                        <EmptyAllergyText>
                          선택된 알레르기 항목이 없습니다.
                        </EmptyAllergyText>
                      )}
                    </AllergyCategoryCard>
                  );
                })}
              </AllergyGridContainer>
              <AllergyButtonContainer>
                <ChangePasswordButton onClick={() => navigate('/allergy')}>
                  알레르기 정보 수정
                </ChangePasswordButton>
              </AllergyButtonContainer>
            </MyInfoContentWrapper>
          </SectionContainer>
        );
      case 'analysisHistory':
        return (
          <div>
            <h2>분석 내역</h2>
            <div style={{ marginTop: '2rem' }}>
              {analysesLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>분석 내역을 불러오는 중...</p>
                </div>
              ) : analyses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>아직 분석한 메뉴가 없습니다.</p>
                  <p>메뉴 이미지를 업로드하여 분석을 시작해보세요!</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  {analyses.map((analysis, index) => {
                    const riskLevel = analysis.riskLevel;
                    const riskInfo = {
                      'safe': { text: '안전', color: '#10B981', bgColor: '#d1fae5' },
                      'low_risk': { text: '보통', color: '#F59E0B', bgColor: '#fef3c7' },
                      'high_risk': { text: '높음', color: '#EF4444', bgColor: '#fee2e2' },
                      'dangerous': { text: '매우 위험', color: '#DC2626', bgColor: '#fecaca' },
                      'unknown': { text: '알 수 없음', color: '#6B7280', bgColor: '#f3f4f6' }
                    };

                    const risk = riskInfo[riskLevel] || riskInfo.unknown;
                    const analysisDate = new Date(analysis.createdAt).toLocaleDateString('ko-KR');
                    
                    // 메뉴명을 "최근 분석한 이미지 1, 2, 3..." 형태로 표시
                    const displayMenuName = `최근 분석한 이미지 ${index + 1}`;

                    return (
                      <div key={analysis.id} style={{
                        padding: '1.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, color: '#333' }}>{displayMenuName}</h4>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            backgroundColor: risk.bgColor,
                            color: risk.color
                          }}>
                            {risk.text} 위험도
                          </span>
                        </div>
                        <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.875rem' }}>
                          분석일: {analysisDate}
                        </p>
                        <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.875rem' }}>
                          알레르기 성분: {analysis.allergens.length > 0 ? analysis.allergens.join(', ') : '알레르기 성분 없음'}
                        </p>
                        {analysis.extractedText && (
                          <details style={{ marginTop: '1rem' }}>
                            <summary style={{ cursor: 'pointer', color: '#666', fontSize: '0.875rem' }}>
                              추출된 텍스트 보기
                            </summary>
                            <p style={{ 
                              margin: '0.5rem 0', 
                              padding: '0.5rem', 
                              backgroundColor: '#f9f9f9', 
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                              color: '#333'
                            }}>
                              {analysis.extractedText}
                            </p>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      case 'imageView':
        return (
          <div>
            <h2>이미지 보기</h2>
            <div style={{ marginTop: '2rem' }}>
              {analysesLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>이미지를 불러오는 중...</p>
                </div>
              ) : analyses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>아직 업로드된 이미지가 없습니다.</p>
                  <p>메뉴 이미지를 업로드하여 분석을 시작해보세요!</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  {analyses.map((analysis, index) => {
                    const analysisDate = new Date(analysis.createdAt).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    
                    // 파일 크기를 읽기 쉬운 형태로 변환
                    const formatFileSize = (bytes) => {
                      if (!bytes) return '알 수 없음';
                      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                      if (bytes === 0) return '0 Bytes';
                      const i = Math.floor(Math.log(bytes) / Math.log(1024));
                      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
                    };

                    // 메뉴명을 "최근 분석한 이미지 1, 2, 3..." 형태로 표시
                    const displayMenuName = `최근 분석한 이미지 ${index + 1}`;

                    return (
                      <div key={analysis.id} style={{
                        padding: '1.25rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minHeight: '320px',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }}
                      >
                        <div style={{
                          width: '100%',
                          height: '180px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '1rem',
                          border: '2px dashed #d1d5db',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          {analysis.imageUrl ? (
                            <img 
                              src={analysis.imageUrl} 
                              alt="메뉴 이미지"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '6px'
                              }}
                              onLoad={(e) => {
                                console.log('✅ 이미지 로드 성공:', analysis.imageUrl);
                                console.log('이미지 요소:', e.target);
                              }}
                              onError={(e) => {
                                console.error('❌ 이미지 로드 실패:', analysis.imageUrl);
                                console.error('에러 상세:', e.target.error || '알 수 없는 에러');
                                console.error('이미지 요소:', e.target);
                                console.error('이미지 src:', e.target.src);
                                
                                // 이미지 요소 숨기기
                                e.target.style.display = 'none';
                                
                                // 플레이스홀더 표시
                                const placeholder = e.target.nextSibling;
                                if (placeholder) {
                                  placeholder.style.display = 'flex';
                                  placeholder.innerHTML = `
                                    <div style="text-align: center; color: #6b7280;">
                                      <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
                                      <div style="font-size: 0.875rem;">이미지 로드 실패</div>
                                      <div style="font-size: 0.75rem; margin-top: 0.25rem; color: #9ca3af;">
                                        ${analysis.imageUrl}
                                      </div>
                                      <div style="font-size: 0.75rem; margin-top: 0.25rem; color: #ef4444;">
                                        CORS 또는 파일 접근 오류
                                      </div>
                                      <div style="font-size: 0.75rem; margin-top: 0.5rem; color: #f59e0b;">
                                        <button 
                                          onclick="window.open('${analysis.imageUrl}', '_blank')"
                                          style="
                                            background: #f59e0b; 
                                            color: white; 
                                            border: none; 
                                            padding: 0.25rem 0.5rem; 
                                            border-radius: 4px; 
                                            cursor: pointer;
                                            font-size: 0.75rem;
                                          "
                                        >
                                          새 탭에서 열기
                                        </button>
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : null}
                          <div style={{ 
                            color: '#6b7280', 
                            fontSize: '0.875rem',
                            display: analysis.imageUrl ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: '0.5rem'
                          }}>                      
                            <span>이미지 없음</span>
                          </div>
                        </div>
                        
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <h4 style={{ 
                            margin: 0, 
                            color: '#1f2937', 
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            lineHeight: '1.4',
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {displayMenuName}
                          </h4>
                          
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#6b7280'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>                          
                              <span style={{ flex: 1 }}>{analysisDate}</span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>                            
                              <span style={{ flex: 1 }}>{formatFileSize(analysis.fileSize)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div>
            <h2>내 정보</h2>
            <p>사용자 정보를 확인하고 수정할 수 있습니다.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <MyPageContainer>
        <ContentPanel>
          <ContentArea>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>로딩 중...</p>
            </div>
          </ContentArea>
        </ContentPanel>
      </MyPageContainer>
    );
  }

  return (
    <MyPageContainer>
      <NavigationPanel>
        {navItems.map((item) => (
          <NavItem key={item.id}>
            <NavButton
              active={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </NavButton>
          </NavItem>
        ))}
      </NavigationPanel>
      <ContentPanel>
        <ContentArea>
          {renderContent()}
        </ContentArea>
      </ContentPanel>
    </MyPageContainer>
  );
};

export default MyPage;
