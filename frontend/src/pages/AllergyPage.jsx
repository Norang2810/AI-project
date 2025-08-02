import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const AllergyContainer = styled.div`
  min-height: 100vh;
  background: #f6f1eb;
  padding: 2rem;
`;

const AllergyCard = styled.div`
  background: white;
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #3a2e2e;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #a3795e;
  margin-bottom: 3rem;
  font-size: 1.1rem;
`;

const AllergyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const AllergyCategory = styled.div`
  border: 2px solid #d7bba6;
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #274472;
    transform: translateY(-2px);
  }
  
  &.selected {
    border-color: #274472;
    background-color: #f8f9ff;
  }
`;

const CategoryTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #3a2e2e;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SeverityBadge = styled.span`
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-weight: bold;
  
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #e8ecf5;
  }
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #274472;
  }
  
  span {
    font-size: 0.9rem;
    color: #3a2e2e;
  }
`;

const SeveritySection = styled.div`
  margin: 2rem 0;
  padding: 2rem;
  background-color: #fdfaf6;
  border-radius: 10px;
`;

const SeverityTitle = styled.h3`
  margin-bottom: 1rem;
  color: #3a2e2e;
`;

const SeverityOptions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SeverityOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid #d7bba6;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #274472;
  }
  
  &.selected {
    border-color: #274472;
    background-color: #274472;
    color: white;
  }
  
  input[type="radio"] {
    display: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background-color: #274472;
    color: white;
    
    &:hover {
      background-color: #1d3557;
    }
  }
  
  &.secondary {
    background-color: #a3795e;
    color: white;
    
    &:hover {
      background-color: #3a2e2e;
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
  color: #a3795e;
  
  a {
    color: #274472;
    text-decoration: none;
    font-weight: bold;
    
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

const AllergyPage = () => {
  const [selectedAllergies, setSelectedAllergies] = useState({});
  const [severity, setSeverity] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 확장된 알레르기 카테고리 (8개)
  const allergyCategories = {
    '유제품': {
      icon: '🥛',
      severity: 'high',
      items: ['우유', '크림', '버터', '치즈', '요거트', '연유', '우유 거품']
    },
    '견과류': {
      icon: '🥜',
      severity: 'high',
      items: ['헤이즐넛', '아몬드', '땅콩', '호두', '캐슈넛', '피스타치오']
    },
    '글루텐': {
      icon: '🌾',
      severity: 'high',
      items: ['밀', '밀가루', '보리', '호밀', '오트밀']
    },
    '초콜릿': {
      icon: '🍫',
      severity: 'medium',
      items: ['초콜릿', '코코아', '카카오', '다크 초콜릿', '화이트 초콜릿', '초콜릿 가루']
    },
    '계란': {
      icon: '🥚',
      severity: 'high',
      items: ['계란', '계란 흰자', '계란 노른자']
    },
    '해산물': {
      icon: '🦐',
      severity: 'high',
      items: ['새우', '게', '조개', '오징어', '고등어']
    },
    '과일': {
      icon: '🍎',
      severity: 'medium',
      items: ['딸기', '키위', '망고', '복숭아', '사과', '오렌지', '레몬', '라임', '블루베리', '바나나']
    },
    '식품첨가물': {
      icon: '⚠️',
      severity: 'low',
      items: ['MSG', '아황산염', '색소', '보존료', '인공감미료']
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

    try {
      const selectedItems = Object.keys(selectedAllergies).filter(
        item => selectedAllergies[item]
      );

      const token = localStorage.getItem('token');
      if (!token) {
        setError('로그인이 필요합니다.');
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

  return (
    <AllergyContainer>
      <AllergyCard>
        <Title>⚠️ 알레르기 정보 설정</Title>
        <Subtitle>
          본인에게 해당하는 알레르기 항목을 선택해주세요.
          선택된 정보는 메뉴 분석 시 안전성을 판단하는 데 사용됩니다.
        </Subtitle>

        {success && <SuccessMessage>{success}</SuccessMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}

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