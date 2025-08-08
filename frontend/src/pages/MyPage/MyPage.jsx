import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MyPageContainer,
  NavigationPanel,
  NavItem,
  NavButton,
  ContentPanel,
  ContentArea
} from './MyPage.styles';

const MyPage = () => {
  const [activeSection, setActiveSection] = useState('myInfo');
  const [userInfo, setUserInfo] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const navItems = [
    { id: 'myInfo', label: '내 정보' },
    { id: 'allergyInfo', label: '내 알레르기 정보' },
    { id: 'analysisHistory', label: '분석 내역' },
    { id: 'imageView', label: '이미지 보기' }
  ];

  // API 호출 함수들
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/user/allergies', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllergies(data.data.allergies);
      }
    } catch (error) {
      console.error('알레르기 정보 조회 오류:', error);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUserInfo(), fetchAllergies()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'myInfo':
        return (
          <div>
            <h2>내 정보</h2>
            <div style={{ marginTop: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>이름</label>
                <input 
                  type="text" 
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  placeholder="이름을 입력하세요"
                  defaultValue={userInfo?.name || ''}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>이메일</label>
                <input 
                  type="email" 
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  placeholder="이메일을 입력하세요"
                  defaultValue={userInfo?.email || ''}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>전화번호</label>
                <input 
                  type="tel" 
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  placeholder="전화번호를 입력하세요"
                  defaultValue={userInfo?.phone || ''}
                />
              </div>
              <button style={{
                backgroundColor: '#ff6b35',
                color: 'white',
                padding: '0.75rem 2rem',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}>
                정보 수정
              </button>
            </div>
          </div>
        );
      case 'allergyInfo':
        return (
          <div>
            <h2>내 알레르기 정보</h2>
            <div style={{ marginTop: '2rem' }}>
              {allergies.length > 0 ? (
                <>
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#333' }}>등록된 알레르기 성분</h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                      gap: '1rem',
                      marginBottom: '2rem'
                    }}>
                      {allergies.map((allergy) => (
                        <div key={allergy.name} style={{
                          padding: '1rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          backgroundColor: '#ffe8e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          <div>
                            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{allergy.name}</span>
                            <div style={{ 
                              marginTop: '0.5rem',
                              fontSize: '0.875rem',
                              color: '#666'
                            }}>
                              심각도: {
                                allergy.severity === 'high' ? '심각' :
                                allergy.severity === 'medium' ? '보통' : '경미'
                              }
                            </div>
                          </div>
                          <div style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            backgroundColor: 
                              allergy.severity === 'high' ? '#ffebee' :
                              allergy.severity === 'medium' ? '#fff3e0' : '#e8f5e8',
                            color: 
                              allergy.severity === 'high' ? '#d32f2f' :
                              allergy.severity === 'medium' ? '#f57c00' : '#388e3c'
                          }}>
                            {allergy.severity === 'high' ? '높음' :
                             allergy.severity === 'medium' ? '보통' : '낮음'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '1.5rem', 
                    borderRadius: '8px',
                    marginBottom: '2rem'
                  }}>
                    <h4 style={{ marginBottom: '1rem', color: '#333' }}>알레르기 정보 요약</h4>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      총 등록된 알레르기: <strong>{allergies.length}개</strong>
                    </p>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      심각도별 분포: {
                        allergies.filter(a => a.severity === 'high').length > 0 ? 
                        `심각 ${allergies.filter(a => a.severity === 'high').length}개, ` : ''
                      }{
                        allergies.filter(a => a.severity === 'medium').length > 0 ? 
                        `보통 ${allergies.filter(a => a.severity === 'medium').length}개, ` : ''
                      }{
                        allergies.filter(a => a.severity === 'low').length > 0 ? 
                        `경미 ${allergies.filter(a => a.severity === 'low').length}개` : ''
                      }
                                         </p>
                   </div>
                   
                   <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                     <button 
                       style={{
                         backgroundColor: '#ff6b35',
                         color: 'white',
                         padding: '0.75rem 2rem',
                         border: 'none',
                         borderRadius: '4px',
                         fontSize: '1rem',
                         cursor: 'pointer',
                         marginRight: '1rem'
                       }}
                       onClick={() => navigate('/allergy')}
                     >
                       알레르기 정보 수정
                     </button>
                   </div>
                 </>
               ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <h3 style={{ color: '#666', marginBottom: '1rem' }}>등록된 알레르기 정보가 없습니다</h3>
                  <p style={{ color: '#999', marginBottom: '2rem' }}>
                    알레르기 정보를 등록하면 메뉴 분석 시 더 정확한 결과를 제공받을 수 있습니다.
                  </p>
                  <button 
                    style={{
                      backgroundColor: '#ff6b35',
                      color: 'white',
                      padding: '0.75rem 2rem',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate('/allergy')}
                  >
                    알레르기 정보 등록하기
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 'analysisHistory':
        return (
          <div>
            <h2>분석 내역</h2>
            <div style={{ marginTop: '2rem' }}>
              <div style={{ 
                display: 'grid', 
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {[
                  { date: '2024-01-15', menu: '김치찌개', risk: '높음', allergens: ['대두', '밀'] },
                  { date: '2024-01-10', menu: '된장찌개', risk: '보통', allergens: ['대두'] },
                  { date: '2024-01-05', menu: '순두부찌개', risk: '낮음', allergens: ['대두'] }
                ].map((analysis, index) => (
                  <div key={index} style={{
                    padding: '1.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, color: '#333' }}>{analysis.menu}</h4>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        backgroundColor: analysis.risk === '높음' ? '#ffebee' : analysis.risk === '보통' ? '#fff3e0' : '#e8f5e8',
                        color: analysis.risk === '높음' ? '#d32f2f' : analysis.risk === '보통' ? '#f57c00' : '#388e3c'
                      }}>
                        {analysis.risk} 위험도
                      </span>
                    </div>
                    <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.875rem' }}>
                      분석일: {analysis.date}
                    </p>
                    <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.875rem' }}>
                      알레르기 성분: {analysis.allergens.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'imageView':
        return (
          <div>
            <h2>이미지 보기</h2>
            <div style={{ marginTop: '2rem' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {[
                  { name: '메뉴 이미지 1', date: '2024-01-15', size: '2.3MB' },
                  { name: '메뉴 이미지 2', date: '2024-01-10', size: '1.8MB' },
                  { name: '메뉴 이미지 3', date: '2024-01-05', size: '3.1MB' },
                  { name: '메뉴 이미지 4', date: '2024-01-01', size: '2.7MB' }
                ].map((image, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    ':hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <div style={{
                      width: '100%',
                      height: '150px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                      border: '1px solid #eee'
                    }}>
                      <span style={{ color: '#999', fontSize: '0.875rem' }}>이미지 미리보기</span>
                    </div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1rem' }}>
                      {image.name}
                    </h4>
                    <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.875rem' }}>
                      업로드일: {image.date}
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.875rem' }}>
                      파일 크기: {image.size}
                    </p>
                  </div>
                ))}
              </div>
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
