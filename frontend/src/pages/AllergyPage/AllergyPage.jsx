import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const AllergyContainer = styled.div`
  min-height: 100vh;
  background: #ffecd5ff;
  padding: 2rem;
`;

const AllergyCard = styled.div`
  background: white;
  max-width: none;  // 기존 900px에서 변경
  width: 100%;      // 추가
  margin: 0;
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  text-align: center;
  color: #A2601E;  
  margin-bottom: 2rem;
  font-size: 4rem;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;  
  font-weight: 520;  
`;

const Subtitle = styled.p`
  text-align: center;
  color: #A2601E;  
  margin-bottom: 3rem;
  font-size: 1.1rem;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;  
`;

const AllergyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const AllergyCategory = styled.div`
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  height: 300px;
  display: flex; 
  flex-direction: column; 
  
  &:hover {
  border-color: #A2601E; 
  transform: translateY(-2px);
}

&.selected {
  border-color: #A2601E; 
  background-color: #fff8f0;  
}
`;

const CategoryTitle = styled.h3`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #A2601E;  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;  
  font-weight: 500;
`;

const SeverityBadge = styled.span`
  font-size: 0.9rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-weight: 500;
  
  &.high {
    background-color: #dc3545;
    color: white;
  }
  
  &.medium {
    background-color: #ffc107;
    color: #212529;
  }
  
  &.low {
    background-color: #28a745;
    color: white;
  }
`;

const CheckboxList = styled.div`
  display: grid;  // flex에서 grid로 변경
  grid-template-columns: 1fr 1fr;  // 2열 그리드
  
  gap: 0.5rem;
  overflow-y: auto; 
  flex: 1;         
  max-height: 200px;
  
  /* 스크롤바 스타일링 (선택사항) */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  text-align: center;
  
  &:hover {
    background-color: #fff8f0;
  }
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #A2601E;
  }
  
  span {
  font-size: 0.9rem;
  color: #A2601E; 
  font-family: 'Ownglyph_meetme-Rg', sans-serif; 
  }
`;

const SeveritySection = styled.div`
  margin: 2rem 0;
  padding: 2rem;
  background-color: #fdfdfdff;
  border-radius: 10px;
`;

const SeverityTitle = styled.h3`
  margin-bottom: 1rem;
  color: #A2601E; 
  font-family: 'Ownglyph_meetme-Rg', sans-serif;  
  font-weight: 500;
  font-size: 1.6rem;
`;

const SeverityOptions = styled.div`
  display: flex;
  gap: 2rem;       
  flex-wrap: nowrap;  
  justify-content: center;  
`;

const SeverityOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
  border-color: #A2601E;  
}

&.selected {
  border-color: #A2601E;  
  background-color: #A2601E;  
  color: white;
}
  
  input[type="radio"] {
    display: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
  background-color: #A2601E;
  color: white;
  
  &:hover {
    background-color: #8B4513;
  }
}

&.secondary {
  background-color: #D2B48C; 
  color: white;
  
  &:hover {
    background-color: #BC9A6A;  
  }
}
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  
  a {
  color: #A2601E; 
  text-decoration: none;
  font-weight: bold;
  font-family: 'Ownglyph_meetme-Rg', sans-serif; 
  
  &:hover {
    text-decoration: underline;
  }
}
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  margin-bottom: 1rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  margin-bottom: 1rem;
  text-align: center;
`;

const AllergyPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const [selectedAllergies, setSelectedAllergies] = useState({});
  const [severity, setSeverity] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
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
        localStorage.removeItem('token');
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/user/allergies', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.allergies) {
          const existingAllergies = {};
          data.data.allergies.forEach(allergy => {
            existingAllergies[allergy.name] = true;
          });
          setSelectedAllergies(existingAllergies);
          setSeverity(data.data.allergies[0]?.severity || 'medium');
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


  const severityLevels = [
    { value: 'low', label: '경미', description: '가벼운 증상' },
    { value: 'medium', label: '보통', description: '일반적인 증상' },
    { value: 'high', label: '심각', description: '심각한 증상' }
  ];

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

      const token = localStorage.getItem('token');
      if (!token) {
        setError('로그인이 필요합니다.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      const response = await fetch('http://localhost:3001/api/user/allergies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          allergies: selectedItems,
          severity: severity
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

        <SeveritySection>
          <SeverityTitle>알레르기 반응 심각도</SeverityTitle>
          <SeverityOptions>
            {severityLevels.map(level => (
              <SeverityOption
                key={level.value}
                className={severity === level.value ? 'selected' : ''}
              >
                <input
                  type="radio"
                  name="severity"
                  value={level.value}
                  checked={severity === level.value}
                  onChange={(e) => setSeverity(e.target.value)}
                />
                <span>{level.label} - {level.description}</span>
              </SeverityOption>
            ))}
          </SeverityOptions>
        </SeveritySection>

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