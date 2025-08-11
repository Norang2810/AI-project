import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
     const response = await fetch('/api/user/profile', {
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
     const response = await fetch('/api/user/allergies', {
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
                <InfoRow style={{ marginBottom: '1.5rem' }}>
                  <InfoLabel>현재 비밀번호:</InfoLabel>
                  <PasswordInput
                    type="password"
                    placeholder="현재 비밀번호를 입력하세요"
                  />
                </InfoRow>
                <InfoRow style={{ marginBottom: '1.5rem' }}>
                  <InfoLabel>새 비밀번호:</InfoLabel>
                  <div style={{ flex: '1' }}>
                    <PasswordInput
                      type="password"
                      placeholder="새 비밀번호를 입력하세요 * 8자리 이상, 영문/숫자/특수문자 포함 *"
                    />
                  </div>
                </InfoRow>
                <InfoRow style={{ marginBottom: '2rem' }}>
                  <InfoLabel>새 비밀번호 확인:</InfoLabel>
                  <PasswordInput
                    type="password"
                    placeholder="새 비밀번호를 다시 입력하세요"
                  />
                </InfoRow>
                <ChangePasswordButton>
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
                gap: '1rem',
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
