import React from 'react';
import { StyledButton } from './Button.styles';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  return (
    <StyledButton variant={variant} size={size} {...props}>
      {children}
    </StyledButton>
  );
};

export default Button; 