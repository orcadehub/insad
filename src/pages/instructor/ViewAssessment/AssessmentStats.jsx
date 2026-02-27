import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
import { AccessTime, Assignment, Security, Language } from '@mui/icons-material';

export default function AssessmentStats({ assessment, darkMode }) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          borderRadius: 4, 
          border: 'none',
          background: darkMode ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
          color: 'white',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'translateY(-8px)' }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTime sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Duration</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {assessment.duration}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>minutes</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          borderRadius: 4,
          background: darkMode ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
          color: 'white',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'translateY(-8px)' }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Assignment sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Questions</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {(assessment.questions?.length || 0) + (assessment.quizQuestions?.length || 0) + (assessment.mongodbPlaygroundQuestions?.length || 0)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>total</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          borderRadius: 4,
          background: darkMode ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
          color: 'white',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'translateY(-8px)' }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Security sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Tab Limit</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {assessment.maxTabSwitches || 3}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>switches</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          borderRadius: 4,
          background: darkMode ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
          color: 'white',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'translateY(-8px)' }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Language sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Type</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, textTransform: 'capitalize', fontSize: '1.8rem' }}>
              {assessment.type}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>assessment</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
