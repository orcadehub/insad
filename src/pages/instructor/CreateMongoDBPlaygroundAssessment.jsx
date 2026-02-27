import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  IconButton,
  MenuItem
} from '@mui/material';
import { ArrowBack, DataObject } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const CreateMongoDBPlaygroundAssessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          type: 'mongodb',
          batches: location.state?.selectedBatches === 'all' 
            ? [] 
            : location.state?.selectedBatches || [],
          mongodbPlaygroundQuestions: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Assessment created successfully');
        navigate(`/instructor/assessments/${data._id}/view`);
      } else {
        toast.error('Failed to create assessment');
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error('Error creating assessment');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton 
          onClick={() => navigate('/instructor/create-assessment')}
          sx={{ 
            color: darkMode ? '#94a3b8' : '#64748b',
            '&:hover': {
              color: darkMode ? '#cbd5e1' : '#475569'
            }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            bgcolor: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DataObject sx={{ fontSize: 28, color: '#10b981' }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Create MongoDB Playground Assessment
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Set up your MongoDB assessment details
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Form Card */}
      <Card sx={{ 
        maxWidth: 800, 
        mx: 'auto',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Assessment Information
          </Typography>

          <TextField
            fullWidth
            label="Assessment Title"
            placeholder="e.g., MongoDB CRUD Operations Assessment"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 3 }}
            required
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            placeholder="Describe what this assessment covers..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 3 }}
            required
          />

          <TextField
            fullWidth
            select
            label="Duration (minutes)"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            sx={{ mb: 3 }}
          >
            {[15, 30, 45, 60, 90, 120].map((duration) => (
              <MenuItem key={duration} value={duration}>
                {duration} minutes
              </MenuItem>
            ))}
          </TextField>

          {/* Selected Batches Info */}
          {location.state?.selectedBatches && (
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
              mb: 3
            }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Selected Batches:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {location.state.selectedBatches === 'all' 
                  ? 'All Batches' 
                  : `${location.state.selectedBatches.length} batches selected`
                }
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/instructor/create-assessment')}
              sx={{ px: 4 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ 
                px: 4,
                bgcolor: '#10b981',
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              Create Assessment
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateMongoDBPlaygroundAssessment;
