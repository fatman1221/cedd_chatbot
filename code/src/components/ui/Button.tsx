import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  loading, 
  disabled,
  ...props 
}) => {
  return (
    <MuiButton
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </MuiButton>
  );
}; 