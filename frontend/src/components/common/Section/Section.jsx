import React from 'react';
import styled from 'styled-components';
import { sectionBase } from '../../../styles/mixins/layout';

const StyledSection = styled.section`
  ${sectionBase}
  
  /* 추가 스타일 커스터마이징 */
  ${({ variant }) => {
    switch (variant) {
      case 'hero':
        return `
          background: #ffecd5ff;
          color: #A2601E;
          text-align: center;
        `;
      case 'alternate':
        return `
          background-color: #ffe6c8ff;
        `;
      default:
        return '';
    }
  }}

  /* 태블릿 */
  @media (max-width: 1024px) {
    min-height: 90vh;
    padding: 1.5rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    min-height: 80vh;
    padding: 1rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    min-height: 70vh;
    padding: 0.8rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 60px;
  font-weight: 520;
  line-height: 58px;
  color: #A2601E;
  margin-bottom: 2rem;
  text-align: center;

  /* 태블릿 */
  @media (max-width: 1024px) {
    font-size: 48px;
    line-height: 52px;
    margin-bottom: 1.8rem;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    font-size: 36px;
    line-height: 40px;
    margin-bottom: 1.5rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    font-size: 28px;
    line-height: 32px;
    margin-bottom: 1.2rem;
  }
`;

const SectionContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  /* 태블릿 */
  @media (max-width: 1024px) {
    max-width: 900px;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 1rem;
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    padding: 0 0.5rem;
  }
`;

const Section = ({ children, variant = 'default', ...props }) => {
  return (
    <StyledSection variant={variant} {...props}>
      {children}
    </StyledSection>
  );
};

export { Section, SectionTitle, SectionContent };
export default Section; 