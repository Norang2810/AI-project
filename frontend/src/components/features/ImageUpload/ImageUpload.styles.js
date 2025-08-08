import styled from 'styled-components';
import { Button } from '../../common/Button';
import Card from '../../common/Card/Card';

export const UploadContainer = styled.div`
  max-width: 1200px; /* 메인페이지와 동일한 max-width */
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem; /* 메인페이지와 동일한 패딩 */
`;

export const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
  font-family: 'Ownglyph_meetme-Rg', sans-serif; /* 메인페이지와 동일한 폰트 */
`;

export const SectionSubtitle = styled.p`
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 1.2rem;
  text-align: center;
  color: #A2601E; /* 메인페이지와 동일한 색상으로 변경 */
  margin-bottom: 3rem;
  line-height: 1.6;
  opacity: 0.8;
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
`;

export const UploadIcon = styled.div`
  font-size: 3rem; /* 메인페이지와 동일 */
  margin-bottom: 1rem; /* 메인페이지와 동일 */
  color: #A2601E; /* 메인페이지 컬러 */
`;

export const UploadTitle = styled.h3`
  font-size: 1.5rem; /* 메인페이지와 동일 */
  margin-bottom: 1rem; /* 메인페이지와 동일 */
  color: #333; /* 메인페이지와 동일 */
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-weight: 700;
`;

export const UploadDescription = styled.p`
  color: #A2601E; /* 메인페이지 컬러로 변경 */
  line-height: 1.6; /* 메인페이지와 동일 */
  margin-bottom: 2rem;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  opacity: 0.8;
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
`;

export const ImagePreview = styled(Card)`
  margin-top: 2rem;
  text-align: center;
`;

export const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 400px;
  border-radius: 10px; /* 메인페이지 스타일과 일치 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const StatusMessage = styled.div`
  padding: 1rem 2rem;
  border-radius: 10px; /* 메인페이지와 일치 */
  margin-top: 2rem;
  text-align: center;
  font-weight: 500;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  
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
`;

export const CompletionCard = styled(Card)`
  text-align: center;
  margin-top: 2rem;
  border: 1px solid #fed7aa; /* 메인페이지 컬러와 조화 */
`;

export const CompletionText = styled.p`
  color: #A2601E; /* 메인페이지 컬러 */
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
`;

export const ResultButton = styled.button`
  width: 250px;
  height: 50px;
  background: rgba(255, 122, 0, 0.1); /* 메인페이지와 동일 */
  border: 1px solid #99632E; /* 메인페이지와 동일 */
  border-radius: 20px;
  color: #A47148; /* 메인페이지와 동일 */
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 122, 0, 0.2); /* 메인페이지와 동일 */
    transform: translateY(-2px);
  }
`;
