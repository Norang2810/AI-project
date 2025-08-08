import React from 'react';
import { StyledCard } from './Card.styles';

const Card = ({ children, variant = 'default', ...props }) => {
  return (
    <StyledCard variant={variant} {...props}>
      {children}
    </StyledCard>
  );
};

export default Card; 