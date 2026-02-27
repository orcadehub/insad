import { Box, Typography, Chip, IconButton, Paper } from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function AssessmentHeader({ assessment, darkMode, onEdit }) {
  const navigate = useNavigate();

  return (
    <Paper elevation={0} sx={{ 
      p: 4, 
      mb: 4, 
      borderRadius: 4,
      background: darkMode 
        ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
        <IconButton 
          onClick={() => navigate('/instructor/assessments')} 
          sx={{ mr: 2, color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
        >
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              {assessment.title}
            </Typography>
            <IconButton
              onClick={onEdit}
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
            >
              <Edit />
            </IconButton>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {assessment.description}
          </Typography>
        </Box>
        <Chip 
          label={assessment.status?.toUpperCase()} 
          color={assessment.status === 'active' ? 'success' : 'warning'}
          sx={{ 
            fontWeight: 700, 
            fontSize: '0.9rem',
            height: 40,
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)'
          }}
        />
      </Box>
    </Paper>
  );
}
