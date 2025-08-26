import styled from 'styled-components';
import { Button } from '../../common/Button';
import Card from '../../common/Card/Card';

export const UploadContainer = styled.div`
  max-width: 1200px; /* 메인페이지와 동일한 max-width */
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem; /* 메인페이지와 동일한 패딩 */

  /* 태블릿 */
  @media (max-width: 1024px) {
    max-width: 900px;
    padding: 0 1.5rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 1rem;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #333;

  /* 태블릿 */
  @media (max-width: 1024px) {
    font-size: 2.2rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

export const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  text-align: center;
  color: #A2601E; /* 메인페이지와 동일한 색상으로 변경 */
  margin-bottom: 3rem;
  line-height: 1.6;
  opacity: 0.8;
  font-family: 'Noto Sans KR', sans-serif; 
  font-weight: 600;

  /* 태블릿 */
  @media (max-width: 1024px) {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
    line-height: 1.5;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
`;

export const UploadArea = styled(Card)`
  border: 2px dashed #d1d5db;
  cursor: pointer;
  
  &:hover {
    border-color: #A2601E;
    background: #fef7ed;
    transform: translateY(-5px);
  }
  
  &.drag-over {
    border-color: #A2601E;
    background: #fff7ed;
    transform: translateY(-5px);
  }

  /* 모바일에서 호버 효과 제거 */
  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }
    
    &.drag-over {
      transform: none;
    }
  }
`;

export const UploadIcon = styled.div`
  font-size: 3rem; /* 메인페이지와 동일 */
  margin-bottom: 1rem; /* 메인페이지와 동일 */
  color: #A2601E; /* 메인페이지 컬러 */

  /* 태블릿 */
  @media (max-width: 1024px) {
    font-size: 2.8rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 0.8rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 2.2rem;
  }
`;

export const UploadTitle = styled.h3`
  font-size: 1.5rem; /* 메인페이지와 동일 */
  margin-bottom: 1rem; /* 메인페이지와 동일 */
  color: #333; /* 메인페이지와 동일 */
  font-weight: 700;

  /* 태블릿 */
  @media (max-width: 1024px) {
    font-size: 1.4rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

export const UploadDescription = styled.p`
  color: #A2601E; /* 메인페이지 컬러로 변경 */
  line-height: 1.6; /* 메인페이지와 동일 */
  margin-bottom: 2rem;
  opacity: 0.8;
  font-family: 'Noto Sans KR', sans-serif; 
  font-weight: 600;

  /* 태블릿 */
  @media (max-width: 1024px) {
    font-size: 0.95rem;
    margin-bottom: 1.8rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin-bottom: 1.2rem;
  }
`;

export const UploadButton = styled(Button)`
  width: 300px;
  height: 60px;
  font-size: 18px;
  
  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }

  /* 태블릿 */
  @media (max-width: 1024px) {
    width: 280px;
    height: 55px;
    font-size: 17px;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    width: 250px;
    height: 50px;
    font-size: 16px;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    width: 220px;
    height: 45px;
    font-size: 15px;
  }
`;

export const ImagePreview = styled(Card)`
  margin-top: 2rem;
  text-align: center;

  /* 모바일 */
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
`;

export const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 400px;
  border-radius: 10px; /* 메인페이지 스타일과 일치 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* 태블릿 */
  @media (max-width: 1024px) {
    max-height: 350px;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    max-height: 300px;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    max-height: 250px;
  }
`;

export const StatusMessage = styled.div`
  padding: 1rem 2rem;
  border-radius: 10px; /* 메인페이지와 일치 */
  margin-top: 2rem;
  text-align: center;
  font-weight: 500;
  
  &.success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #059669;
  }
  
  &.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  }
  
  &.loading {
    background: #fff7ed; /* 메인페이지 컬러와 조화 */
    border: 1px solid #fed7aa;
    color: #A2601E; /* 메인페이지 컬러 */
  }

  /* 태블릿 */
  @media (max-width: 1024px) {
    padding: 0.9rem 1.8rem;
    margin-top: 1.8rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
    margin-top: 1.5rem;
    font-size: 0.9rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    padding: 0.7rem 1.2rem;
    margin-top: 1.2rem;
    font-size: 0.85rem;
  }
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #fed7aa; /* 메인페이지 컬러와 조화 */
  border-top: 3px solid #A2601E; /* 메인페이지 컬러 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* 모바일 */
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    border-width: 2px;
  }
`;

export const CompletionCard = styled(Card)`
  text-align: center;
  margin-top: 2rem;
  border: 1px solid #fed7aa; /* 메인페이지 컬러와 조화 */

  /* 모바일 */
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
`;

export const CompletionText = styled.p`
  color: #A2601E; /* 메인페이지 컬러 */
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 1rem;

  /* 태블릿 */
  @media (max-width: 1024px) {
    font-size: 1.1rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.8rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

export const ResultButton = styled.button`
  width: 250px;
  height: 50px;
  background: rgba(255, 122, 0, 0.1); /* 메인페이지와 동일 */
  border: 1px solid #99632E; /* 메인페이지와 동일 */
  border-radius: 20px;
  color: #A47148; /* 메인페이지와 동일 */
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 122, 0, 0.2); /* 메인페이지와 동일 */
    transform: translateY(-2px);
  }

  /* 태블릿 */
  @media (max-width: 1024px) {
    width: 230px;
    height: 48px;
    font-size: 15px;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    width: 200px;
    height: 45px;
    font-size: 14px;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    width: 180px;
    height: 42px;
    font-size: 13px;
  }

  /* 모바일에서 호버 효과 제거 */
  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }
  }
`;
