import styled from 'styled-components';
import { Link } from 'react-router-dom'; // Link 컴포넌트를 사용하기 위해 추가

export const AllergyContainer = styled.div`
  min-height: 100vh;
  background: #ffecd5ff;
  padding: 2rem;
`;

export const AllergyCard = styled.div`
  background: white;
  max-width: none;  // 기존 900px에서 변경
  width: 100%;      // 추가
  margin: 0;
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

export const Title = styled.h1`
  text-align: center;
  color: #A2601E;  
  margin-bottom: 2rem;
  font-size: 4rem;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;  
  font-weight: 520;  
`;

export const Subtitle = styled.p`
  text-align: center;
  color: #A2601E;  
  margin-bottom: 3rem;
  font-size: 1.1rem;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;  
`;

export const AllergyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const AllergyCategory = styled.div`
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

export const CategoryTitle = styled.h3`
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

export const SeverityBadge = styled.span`
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

export const CheckboxList = styled.div`
  display: grid;  // flex에서 grid로 변경
  grid-template-columns: repeat(2, 1fr);  // 2열로 변경
  gap: 0.5rem;
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #A2601E;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #8B4513;
  }
`;

export const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #fff8f0;
  }
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #A2601E;
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  background: rgba(255, 122, 0, 0.1);
  border: 1px solid #99632E;
  border-radius: 20px;
  color: #A47148;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2rem;

  &:hover {
    background: rgba(255, 122, 0, 0.2);
    transform: translateY(-2px);
  }

  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }
`;

export const BackButton = styled(Link)`
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background: rgba(255, 122, 0, 0.1);
  border: 1px solid #99632E;
  border-radius: 15px;
  color: #A47148;
  text-decoration: none;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-bottom: 2rem;

  &:hover {
    background: rgba(255, 122, 0, 0.2);
    transform: translateY(-2px);
  }
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #fed7aa;
  border-top: 3px solid #A2601E;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const SuccessMessage = styled.div`
  padding: 1rem 2rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #059669;
  border-radius: 10px;
  text-align: center;
  margin-top: 1rem;
  font-weight: 600;
`;

export const ErrorMessage = styled.div`
  padding: 1rem 2rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 10px;
  text-align: center;
  margin-top: 1rem;
  font-weight: 600;
`;

export const SeveritySection = styled.div`
  margin: 2rem 0;
  padding: 2rem;
  background-color: #fdfdfdff;
  border-radius: 10px;
`;

export const SeverityTitle = styled.h3`
  margin-bottom: 1rem;
  color: #A2601E; 
  font-family: 'Ownglyph_meetme-Rg', sans-serif;  
  font-weight: 500;
  font-size: 1.6rem;
`;

export const SeverityOptions = styled.div`
  display: flex;
  gap: 2rem;       
  flex-wrap: nowrap;  
  justify-content: center;  
`;

export const SeverityOption = styled.label`
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

export const ButtonGroup = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
`;

export const Button = styled.button`
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

export const LinkText = styled.p`
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
