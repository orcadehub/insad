import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Card, TextField, IconButton, Paper } from '@mui/material';
import { ArrowBack, Web } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useTenant } from '../../contexts/TenantContext';
import toast from 'react-hot-toast';
import api from '../../services/api/apiClient';

const CreateFrontendAssessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const { selectedTenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const assessmentData = {
        title: formData.title,
        description: formData.description,
        type: 'frontend',
        duration: formData.duration,
        batches: location.state?.selectedBatches === 'all' ? 'all' : location.state?.selectedBatches || [],
        isActive: true,
        tenantId: selectedTenant._id
      };

      await api.post('/assessments', assessmentData);
      toast.success('Frontend assessment created successfully!');
      navigate('/instructor/assessments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: darkMode ? '#0a0e1a' : '#f8fafc', p: 3 }}>
      <Paper elevation={0} sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 4,
        background: darkMode 
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton 
            onClick={() => navigate('/instructor/create-assessment', { state: location.state })}
            sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <Web sx={{ fontSize: 32 }} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              Create Frontend Assessment
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              HTML, CSS, JavaScript, React assessment
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Card sx={{ p: 4, borderRadius: 4 }}>
        <TextField
          fullWidth
          label="Assessment Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          sx={{ mb: 3 }}
        />
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          sx={{ mb: 3 }}
        />
        
        <TextField
          fullWidth
          type="number"
          label="Duration (minutes)"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          inputProps={{ min: 30, max: 300 }}
          sx={{ mb: 3 }}
        />

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/instructor/create-assessment', { state: location.state })}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.description}
          >
            {loading ? 'Creating...' : 'Create Assessment'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default CreateFrontendAssessment;
