import React from 'react';
import { Box, Avatar, Typography, Paper } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import type { Message } from '../../../types';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  streamContent?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message,
  isStreaming = false,
  streamContent = ''
}) => {
  const isBot = message.sender === 'bot';
  
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        gap: 2,
        p: 2,
        bgcolor: isBot ? 'grey.50' : 'background.paper'
      }}
    >
      <Avatar
        sx={{
          bgcolor: isBot ? 'primary.main' : 'grey.300',
          width: 40,
          height: 40
        }}
      >
        {isBot ? <SmartToyIcon /> : <PersonIcon />}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {isBot ? 'CEDD Bot' : 'You'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {message.timestamp.toLocaleTimeString()}
          </Typography>
        </Box>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            '& pre': {
              my: 1,
              p: 1,
              bgcolor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto'
            }
          }}
        >
          <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {isStreaming ? streamContent : message.content}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}; 