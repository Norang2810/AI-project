import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'BMJUA', sans-serif;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.primary};
    overflow-x: hidden; /* 가로 스크롤 방지 */
  }

  html {
    scroll-behavior: smooth;
  }

  button {
    font-family: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* 반응형 유틸리티 클래스 */
  .mobile-only {
    display: none;
  }

  .desktop-only {
    display: block;
  }

  /* 태블릿 */
  @media (max-width: 1024px) {
    .desktop-only {
      display: none;
    }
  }

  /* 모바일 */
  @media (max-width: 768px) {
    .mobile-only {
      display: block;
    }
    
    .desktop-only {
      display: none;
    }
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    body {
      font-size: 14px;
    }
  }
`; 