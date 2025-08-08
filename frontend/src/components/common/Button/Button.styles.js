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
`;
