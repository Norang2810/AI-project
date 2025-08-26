import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/apiFetch';
import {
  AllergyContainer,
  AllergyCard,
  Title,
  Subtitle,
  AllergyGrid,
  AllergyCategory,
  CategoryTitle,
  SeverityBadge,
  CheckboxList,
  CheckboxItem,
  SuccessMessage,
  ErrorMessage,
  ButtonGroup,
  Button,
  LinkText
} from './AllergyPage.styles';

const AllergyPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const [selectedAllergies, setSelectedAllergies] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        setError('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      // 토큰 유효성 검증 (선택사항)
      try {
        const userData = JSON.parse(user);
        if (!userData.id) {
          throw new Error('Invalid user data');
        }
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setError('로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, [navigate]);

  // 기존 알레르기 정보 로드
  useEffect(() => {
    if (!isCheckingAuth) {
      loadExistingAllergies();
    }
  }, [isCheckingAuth]);

  const loadExistingAllergies = async () => {
    try {
      const response = await apiFetch('/api/user/allergies');

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.allergies) {
          const existingAllergies = {};
          data.data.allergies.forEach(allergy => {
            existingAllergies[allergy.name] = true;
          });
          setSelectedAllergies(existingAllergies);
        }
      }
    } catch (err) {
      console.error('기존 알레르기 정보 로드 실패:', err);
    }
  };

  // 확장된 알레르기 카테고리 (8개)
const allergyCategories = {
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




  const handleAllergyChange = (category, item) => {
    setSelectedAllergies(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSuccess('');
    setError('');

    try {
      const selectedItems = Object.keys(selectedAllergies).filter(
        item => selectedAllergies[item]
      );

      const response = await apiFetch('/api/user/allergies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allergies: selectedItems
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('알레르기 정보가 저장되었습니다!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.message || '알레르기 정보 저장에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCount = Object.values(selectedAllergies).filter(Boolean).length;

  // 로그인 상태 확인 중일 때 로딩 표시
  if (isCheckingAuth) {
    return (
      <AllergyContainer>
        <AllergyCard>
          <Title>🔐 로그인 확인 중...</Title>
          <Subtitle>잠시만 기다려주세요.</Subtitle>
        </AllergyCard>
      </AllergyContainer>
    );
  }

  return (
    <AllergyContainer>
      <AllergyCard>
        <Title>⚠️ 알레르기 정보 설정</Title>
        <Subtitle>
          본인에게 해당하는 알레르기 항목을 선택해주세요.
          선택된 정보는 메뉴 분석 시 안전성을 판단하는 데 사용됩니다.
        </Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <AllergyGrid>
          {Object.entries(allergyCategories).map(([category, info]) => (
            <AllergyCategory key={category}>
              <CategoryTitle>
                {info.icon} {category}
                <SeverityBadge className={info.severity}>
                  {info.severity === 'high' ? '높음' : 
                   info.severity === 'medium' ? '보통' : '낮음'}
                </SeverityBadge>
              </CategoryTitle>
              <CheckboxList>
                {info.items.map(item => (
                  <CheckboxItem key={item}>
                    <input
                      type="checkbox"
                      checked={selectedAllergies[item] || false}
                      onChange={() => handleAllergyChange(category, item)}
                    />
                    <span>{item}</span>
                  </CheckboxItem>
                ))}
              </CheckboxList>
            </AllergyCategory>
          ))}
        </AllergyGrid>



        <div style={{ textAlign: 'center', margin: '1rem 0', color: '#666' }}>
          선택된 항목: <strong>{selectedCount}개</strong>
        </div>

        <ButtonGroup>
          <Button 
            className="secondary" 
            onClick={() => navigate('/')}
          >
            취소
          </Button>
          <Button 
            className="primary" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '알레르기 정보 저장'}
          </Button>
        </ButtonGroup>

        <LinkText>
          <Link to="/">← 메인 페이지로 돌아가기</Link>
        </LinkText>
      </AllergyCard>
    </AllergyContainer>
  );
};

export default AllergyPage; 