import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KakaoLogin } from '../../components/common/Button';
import styled from 'styled-components';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #FFECD5; /* 부드러운 배경색 */
  padding: 2rem;
  font-family: 'Ownglyph_meetme-Rg', sans-serif; /* 폰트 적용 */
`;

const LoginCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  border: 2px solid #FFD6AA; /* 카드 경계 강조 */
`;

const Title = styled.h1`
  text-align: center;
  color: #A2601E; /* 대표 텍스트 색상 */
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: bold;
  color: #A2601E;
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid #E1C8A8;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #915316;
  }
`;

const Button = styled.button`
  background-color: #8b5e3c;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 1rem; /* 비밀번호와 간격 늘림 */
  
  &:hover {
    background-color: #6e4b2a;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;


const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #915316;
  
  a {
    color: #A2601E;
    text-decoration: none;
    font-weight: bold;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  margin-bottom: 1rem;
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
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 토큰을 localStorage에 저장
        localStorage.setItem('token', data.data.token);
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
        <Title>☕ 로그인</Title>
        
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
          <KakaoLogin />
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