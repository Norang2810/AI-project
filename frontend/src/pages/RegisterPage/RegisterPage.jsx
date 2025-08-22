import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KakaoLogin } from '../../components/common/Button';
import styled from 'styled-components';

// 폰트 로드 (페이지별로)
const FontStyle = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600&display=swap');
`;

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #FFECD5;
  padding: 2rem;
`;

const RegisterCard = styled.div`
  background: white;
  padding: 1.7rem;
  border-radius: 15px;
  width: 100%;
  max-width: 500px;
  border: 2px solid #FFD6AA;
`;

const Title = styled.h1`
  text-align: center;
  color: #A2601E;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  font-weight: normal;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: row;  /* column → row로 변경 */
  align-items: center;   /* 세로 중앙 정렬 */
  gap: 1rem;            /* 라벨-입력칸 간격 */
`;

const Label = styled.label`
  color: #A2601E;
  text-align: left;
  width: 120px;         /* 라벨 너비 고정 */
  flex-shrink: 0;       /* 라벨 크기 고정 */
  font-family: 'Noto Sans KR', sans-serif;
    font-weight: 500;
`;

const Input = styled.input`
  background-color: #FFFFFF;
  padding: 1rem;
  border: 2px solid #E1C8A8;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  transition: border-color 0.3s ease;
  flex: 1;        /* 남은 공간을 모두 차지 */
  width: 100%;    /* 너비를 100%로 설정 */

  &::placeholder {
    font-size: 0.8rem;     /* placeholder도 조금 더 작게 */
  }
  
  &:focus {
    outline: none;
    border-color: #915316;
  }
`;

const Button = styled.button`
  background-color: #B9855A;
  color: white;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color:rgb(169, 114, 68);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #915316;
    font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  
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

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  margin-bottom: 1rem;
`;

const RegisterPage = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
     const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Title>회원가입</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <Form onSubmit={handleSubmit}>
          
            <FormGroup>
              <Label htmlFor="name">이름</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="이름을 입력하세요"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="phone">전화번호</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="전화번호를 입력하세요"
              />
            </FormGroup>
          
          
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
            
            <FormGroup>
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="비밀번호를 다시 입력하세요"
              />
            </FormGroup>
          
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '회원가입 중...' : '회원가입'}
          </Button>
          <KakaoLogin mode="signup"/>
        </Form>
        
        <LinkText>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </LinkText>
        
        <LinkText>
          <Link to="/">← 메인 페이지로 돌아가기</Link>
        </LinkText>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage; 