import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const AllergyContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const AllergyCard = styled.div`
  background: white;
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 3rem;
  font-size: 1.1rem;
`;

const AllergyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const AllergyCategory = styled.div`
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #007bff;
    transform: translateY(-2px);
  }
  
  &.selected {
    border-color: #007bff;
    background-color: #f8f9ff;
  }
`;

const CategoryTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
    background-color: #f8f9fa;
  }
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #007bff;
  }
  
  span {
    font-size: 0.9rem;
    color: #555;
  }
`;

const SeveritySection = styled.div`
  margin: 2rem 0;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 10px;
`;

const SeverityTitle = styled.h3`
  margin-bottom: 1rem;
  color: #333;
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
  border: 2px solid #e1e5e9;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #007bff;
  }
  
  &.selected {
    border-color: #007bff;
    background-color: #007bff;
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
    background-color: #007bff;
    color: white;
    
    &:hover {
      background-color: #0056b3;
    }
  }
  
  &.secondary {
    background-color: #6c757d;
    color: white;
    
    &:hover {
      background-color: #545b62;
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
    color: #007bff;
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

  const allergyCategories = {
    '곡물': ['밀', '보리', '호밀', '오트밀', '옥수수'],
    '견과류': ['땅콩', '아몬드', '호두', '캐슈넛', '피스타치오'],
    '유제품': ['우유', '치즈', '요거트', '버터', '크림'],
    '해산물': ['새우', '게', '조개', '오징어', '고등어'],
    '계란': ['계란 흰자', '계란 노른자'],
    '과일': ['딸기', '키위', '망고', '복숭아', '사과'],
    '기타': ['대두', 'MSG', '아황산염', '색소', '보존료']
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
          {Object.entries(allergyCategories).map(([category, items]) => (
            <AllergyCategory key={category}>
              <CategoryTitle>
                {category === '곡물' && '🌾'}
                {category === '견과류' && '🥜'}
                {category === '유제품' && '🥛'}
                {category === '해산물' && '🦐'}
                {category === '계란' && '🥚'}
                {category === '과일' && '🍎'}
                {category === '기타' && '⚠️'}
                {category}
              </CategoryTitle>
              <CheckboxList>
                {items.map(item => (
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