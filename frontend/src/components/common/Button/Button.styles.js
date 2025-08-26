import styled from 'styled-components';
import { buttonBase } from '../../../styles/mixins/components';

export const StyledButton = styled.button`
  ${buttonBase}
  
  /* 기본 스타일 */
  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
        return 'rgba(255, 122, 0, 0.1)';
      case 'secondary':
        return 'transparent';
      default:
        return 'rgba(255, 122, 0, 0.1)';
    }
  }};
  
  border: ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
        return '1px solid #99632E';
      case 'secondary':
        return '1px solid #d1d5db';
      default:
        return '1px solid #99632E';
    }
  }};
  
  color: ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
        return '#A47148';
      case 'secondary':
        return '#666';
      default:
        return '#A47148';
    }
  }};
  
  padding: ${({ size }) => {
    switch (size) {
      case 'sm':
        return '8px 16px';
      case 'lg':
        return '16px 32px';
      default:
        return '12px 24px';
    }
  }};
  
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm':
        return '14px';
      case 'lg':
        return '18px';
      default:
        return '16px';
    }
  }};
  
  border-radius: ${({ size }) => {
    switch (size) {
      case 'sm':
        return '4px';
      case 'lg':
        return '8px';
      default:
        return '6px';
    }
  }};
  
  &:hover {
    background: ${({ variant, theme }) => {
      switch (variant) {
        case 'primary':
          return 'rgba(255, 122, 0, 0.2)';
        case 'secondary':
          return '#f3f4f6';
        default:
          return 'rgba(255, 122, 0, 0.2)';
      }
    }};
  }
  
  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }

  /* 태블릿 */
  @media (max-width: 1024px) {
    padding: ${({ size }) => {
      switch (size) {
        case 'sm':
          return '7px 14px';
        case 'lg':
          return '14px 28px';
        default:
          return '11px 22px';
      }
    }};
    
    font-size: ${({ size }) => {
      switch (size) {
        case 'sm':
          return '13px';
        case 'lg':
          return '17px';
        default:
          return '15px';
      }
    }};
  }

  /* 모바일 */
  @media (max-width: 768px) {
    padding: ${({ size }) => {
      switch (size) {
        case 'sm':
          return '6px 12px';
        case 'lg':
          return '12px 24px';
        default:
          return '10px 20px';
      }
    }};
    
    font-size: ${({ size }) => {
      switch (size) {
        case 'sm':
          return '12px';
        case 'lg':
          return '16px';
        default:
          return '14px';
      }
    }};
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    padding: ${({ size }) => {
      switch (size) {
        case 'sm':
          return '5px 10px';
        case 'lg':
          return '10px 20px';
        default:
          return '8px 16px';
      }
    }};
    
    font-size: ${({ size }) => {
      switch (size) {
        case 'sm':
          return '11px';
        case 'lg':
          return '15px';
        default:
          return '13px';
      }
    }};
  }

  /* 모바일에서 호버 효과 제거 */
  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }
  }
`;
