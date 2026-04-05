import styled from 'styled-components';
import { cardBase } from '../../../styles/mixins/components';

export const StyledCard = styled.div`
  ${cardBase}
  
  /* 추가 스타일 커스터마이징 */
  ${({ variant }) => {
    switch (variant) {
      case 'elevated':
        return `
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          &:hover {
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          }
        `;
      case 'outlined':
        return `
          box-shadow: none;
          border: 2px solid #d1d5db;
          &:hover {
            border-color: #A2601E;
          }
        `;
      default:
        return '';
    }
  }}

  /* 태블릿 */
  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    padding: 1.2rem;
    border-radius: 8px;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 6px;
  }

  /* 모바일에서 호버 효과 제거 */
  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }
  }
`;
