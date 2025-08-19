import React from 'react';
import { Box, BoxProps } from '@mui/material';

export interface ContainerProps extends BoxProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'lg',
  children,
  ...props
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: {
          xs: '100%',
          sm: maxWidth === 'xs' ? '600px' : '100%',
          md: maxWidth === 'sm' ? '900px' : maxWidth === 'xs' ? '600px' : '100%',
          lg: maxWidth === 'md' ? '1200px' : maxWidth === 'sm' ? '900px' : maxWidth === 'xs' ? '600px' : '100%',
          xl: maxWidth === 'lg' ? '1536px' : maxWidth === 'md' ? '1200px' : maxWidth === 'sm' ? '900px' : maxWidth === 'xs' ? '600px' : '100%',
        },
        mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
      }}
      {...props}
    >
      {children}
    </Box>
  );
}; 