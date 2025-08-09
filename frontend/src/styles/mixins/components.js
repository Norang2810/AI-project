import { css } from 'styled-components';

export const buttonBase = css`
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
  font-family: 'BMJUA', sans-serif;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

export const cardBase = css`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

export const textBase = css`
  font-family: 'BMJUA', sans-serif;
  line-height: 1.6;
`; 