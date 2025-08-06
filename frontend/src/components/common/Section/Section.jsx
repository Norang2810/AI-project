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
`;

const SectionTitle = styled.h2`
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 60px;
  font-weight: 520;
  line-height: 58px;
  color: #A2601E;
  margin-bottom: 2rem;
  text-align: center;
`;

const SectionContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
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