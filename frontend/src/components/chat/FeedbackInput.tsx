import React, { useState } from 'react';
import { Box, Slider, TextField, IconButton, Collapse, Tooltip } from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SendIcon from '@mui/icons-material/Send';
import toast from 'react-hot-toast';

interface FeedbackInputProps {
  runId: string;
  onFeedbackSubmit: (score: number, comment: string) => Promise<void>;
}

const FeedbackInput: React.FC<FeedbackInputProps> = ({ runId, onFeedbackSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(3);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    const normalizedScore = rating / 5;
    console.log('Submitting feedback:', {
      runId,
      normalizedScore,
      comment,
    });
    try {
      const result = await onFeedbackSubmit(normalizedScore, comment);
      console.log('Feedback submission result:', result);
      toast.success('Thank you for your feedback!');
      setIsOpen(false);
      setRating(3);
      setComment('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  if (!runId) return null;

  return (
    <Box sx={{ mt: 0.5 }}>
      <Tooltip title="Provide feedback" placement="left">
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            color: '#00fffc',
            opacity: 0.7,
            transform: 'scale(0.85)',
            '&:hover': {
              opacity: 1,
              backgroundColor: 'rgba(0, 255, 252, 0.1)',
            },
          }}
        >
          <FeedbackIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Collapse in={isOpen}>
        <Box
          sx={{
            mt: 1,
            py: 1.5,
            px: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(17, 27, 39, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0, 255, 252, 0.2)',
            width: '100%',
            maxWidth: '320px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box sx={{ width: '100%', mb: 1.5 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 0.5,
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}>
              <span>Poor</span>
              <span>Excellent</span>
            </Box>
            <Slider
              value={rating}
              onChange={(_, value) => setRating(value as number)}
              min={1}
              max={5}
              step={1}
              marks
              sx={{
                color: '#00fffc',
                height: 2,
                padding: '15px 0',
                '& .MuiSlider-rail': {
                  opacity: 0.15,
                  backgroundColor: '#00fffc',
                  height: 2,
                },
                '& .MuiSlider-track': {
                  border: 'none',
                  height: 2,
                  background: 'linear-gradient(90deg, rgba(0, 255, 252, 0.7) 0%, #00fffc 100%)',
                },
                '& .MuiSlider-mark': {
                  backgroundColor: 'transparent',
                  height: 8,
                  width: 1,
                  marginTop: -3,
                  '&.MuiSlider-markActive': {
                    backgroundColor: 'transparent',
                  },
                },
                '& .MuiSlider-thumb': {
                  height: 14,
                  width: 14,
                  backgroundColor: '#111B27',
                  border: '2px solid #00fffc',
                  boxShadow: '0 0 10px rgba(0, 255, 252, 0.5)',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 4px rgba(0, 255, 252, 0.15)',
                  },
                  '&:before': {
                    display: 'none',
                  },
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    height: '60%',
                    width: '60%',
                    backgroundColor: '#00fffc',
                    borderRadius: '50%',
                  },
                },
                '&:hover': {
                  '& .MuiSlider-track': {
                    background: 'linear-gradient(90deg, rgba(0, 255, 252, 0.8) 0%, #00fffc 100%)',
                  },
                },
              }}
            />
          </Box>
          <Box sx={{ 
            display: 'flex',
            gap: 1,
            alignItems: 'flex-start'
          }}>
            <TextField
              size="small"
              placeholder="Add a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: '32px',
                  fontSize: '0.875rem',
                  color: '#E0E0E0',
                  backgroundColor: 'rgba(0, 255, 252, 0.03)',
                  '& fieldset': {
                    borderColor: 'rgba(0, 255, 252, 0.2)',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 255, 252, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(0, 255, 252, 0.5)',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '6px 10px',
                },
              }}
            />
            <IconButton
              onClick={handleSubmit}
              size="small"
              sx={{
                color: '#00fffc',
                backgroundColor: 'rgba(0, 255, 252, 0.1)',
                width: '32px',
                height: '32px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 255, 252, 0.2)',
                },
              }}
            >
              <SendIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default FeedbackInput; 