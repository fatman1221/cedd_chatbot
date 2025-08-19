import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export interface InputProps extends TextFieldProps {
  error?: boolean;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  error,
  helperText,
  ...props
}) => {
  return (
    <TextField
      error={error}
      helperText={helperText}
      {...props}
    />
  );
}; 