import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KakaoLogin } from '../../components/common/Button';
import styled from 'styled-components';
import { apiFetch, setTokens } from '../../lib/apiFetch';

// 맨 위에 추가
const FontStyle = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600&display=swap');
`;

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #FFECD5; /* 부드러운 배경색 */
  padding: 2rem;

  /* 태블릿 */
  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    padding: 1rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const LoginCard = styled.div`
  background: white;
  padding: 1.7rem;
  border-radius: 15px;
  width: 100%;
  max-width: 500px;
  border: 2px solid #FFD6AA; /* 카드 경계 강조 */

  /* 태블릿 */
  @media (max-width: 1024px) {
    padding: 1.5rem;
    max-width: 450px;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    padding: 1.3rem;
    max-width: 400px;
    border-radius: 12px;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    padding: 1rem;
    max-width: 100%;
    border-radius: 10px;
  }
`;

const Title = styled.h1`
  text-align: center;
  color: #A2601E; /* 대표 텍스트 색상 */
  margin-bottom: 1.5rem;
  font-size: 2rem;
  font-weight: normal;

  /* 태블릿 */
  @media (max-width: 1024px) {
    font-size: 1.8rem;
    margin-bottom: 1.3rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: 1.2rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;

  /* 모바일 */
  @media (max-width: 768px) {
    gap: 0.7rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: row;  // column → row로 변경
  align-items: center;  // 추가
  gap: 1rem;

  /* 태블릿 */
  @media (max-width: 1024px) {
    gap: 0.8rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const Label = styled.label`
  color: #A2601E;
  text-align: left;  // 추가
  width: 120px;      // 추가
  flex-shrink: 0;    // 추가
  font-family: 'Noto Sans KR', sans-serif;  // 추가
  font-weight: 500;  // bold → 500

  /* 태블릿 */
  @media (max-width: 1024px) {
    width: 100px;
    font-size: 0.95rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    width: auto;
    text-align: center;
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const Input = styled.input`
  background-color: #FFFFFF;  // 추가
  padding: 1rem;
  border: 2px solid #E1C8A8;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;  // 추가
  transition: border-color 0.3s ease;
  flex: 1;        // 추가
  width: 100%;    // 추가

  &::placeholder {
    font-size: 0.8rem;  // 추가
  }
  
  &:focus {
    outline: none;
    border-color: #915316;
  }

  /* 태블릿 */
  @media (max-width: 1024px) {
    padding: 0.9rem;
    font-size: 0.95rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    padding: 0.7rem;
    font-size: 0.85rem;
  }
`;

const Button = styled.button`
  background-color: #B9855A;  // #8b5e3c → #B9855A
  color: white;
  padding: 0.8rem;  // 1rem → 0.8rem
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;  // 1rem → 1.2rem
  // font-weight: bold; 삭제
  cursor: pointer;
  transition: background-color 0.3s ease;
  // margin-top: 1rem; 삭제
  
  &:hover {
    background-color: rgb(169, 114, 68);  // #6e4b2a → rgb(169, 114, 68)
  }  // 닫는 중괄호 추가
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  /* 태블릿 */
  @media (max-width: 1024px) {
    padding: 0.7rem;
    font-size: 1.1rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    padding: 0.6rem;
    font-size: 1rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  /* 모바일에서 호버 효과 제거 */
  @media (max-width: 768px) {
    &:hover {
      background-color: #B9855A;
    }
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #915316;
  font-family: 'Noto Sans KR', sans-serif;  // 추가
  font-weight: 500;
  
  a {
    color: #A2601E;
    text-decoration: none;
    font-weight: bold;
    
    &:hover {
      text-decoration: underline;
    }
  }

  /* 태블릿 */
  @media (max-width: 1024px) {
    margin-top: 1.3rem;
    font-size: 0.95rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    margin-top: 1.2rem;
    font-size: 0.9rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    margin-top: 1rem;
    font-size: 0.85rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  margin-bottom: 1rem;

  /* 태블릿 */
  @media (max-width: 1024px) {
    padding: 0.9rem;
    font-size: 0.95rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    padding: 0.8rem;
    font-size: 0.9rem;
    margin-bottom: 0.8rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    padding: 0.7rem;
    font-size: 0.85rem;
  }
`;

const LoginPage = ({setIsLoggedIn}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 토큰을 localStorage에 저장
        setTokens(data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        setIsLoggedIn(true); 
        // 로그인 성공 시 메인 페이지로 이동
        navigate('/');
      } else {
        setError(data.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>로그인</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">이메일</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="이메일을 입력하세요"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="비밀번호를 입력하세요"
            />
          </FormGroup>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
          <KakaoLogin mode="login" />
        </Form>
        
        <LinkText>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </LinkText>
        
        <LinkText>
          <Link to="/">← 메인 페이지로 돌아가기</Link>
        </LinkText>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage; 