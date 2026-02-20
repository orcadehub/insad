import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions, Chip, Container, Grid, Paper, Skeleton } from '@mui/material';
import { Add, Edit, Delete, MenuBook, AccessTime, Layers } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StudyMaterials = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('instructorToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/study-materials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setMaterials([]);
      toast.error('Error fetching materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleEdit = (id) => {
    navigate(`/instructor/study-materials/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      const token = localStorage.getItem('instructorToken');
      await fetch(`${import.meta.env.VITE_API_URL}/api/study-materials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Material deleted!');
      fetchMaterials();
    } catch (error) {
      toast.error('Error deleting material');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, background: darkMode ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
              Study Materials
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Create and manage comprehensive learning content for your students
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<Add />} 
            onClick={() => navigate('/instructor/study-materials/new')}
            sx={{ 
              bgcolor: 'white', 
              color: darkMode ? '#1e3a8a' : '#667eea',
              fontWeight: 600,
              px: 3,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
            }}
          >
            Create Material
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : materials.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <MenuBook sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>No materials yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Start creating your first study material</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/instructor/study-materials/new')}>
            Create First Material
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {materials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-8px)', 
                    boxShadow: darkMode ? '0 12px 24px rgba(0,0,0,0.4)' : '0 12px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      bgcolor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                      display: 'flex'
                    }}>
                      <MenuBook sx={{ color: darkMode ? '#3b82f6' : '#667eea', fontSize: 28 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
                      {material.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 48, lineHeight: 1.6 }}>
                    {material.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={material.category} 
                      size="small" 
                      sx={{ 
                        fontWeight: 600,
                        bgcolor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(102, 126, 234, 0.1)',
                        color: darkMode ? '#60a5fa' : '#667eea'
                      }}
                    />
                    {material.estimatedDuration && (
                      <Chip 
                        icon={<AccessTime sx={{ fontSize: 16 }} />}
                        label={material.estimatedDuration} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Layers sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {material.chapters?.length || 0} chapters • {material.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0} lessons
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                  <Button 
                    fullWidth
                    variant="contained" 
                    startIcon={<Edit />} 
                    onClick={() => handleEdit(material._id)}
                    sx={{ fontWeight: 600 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    fullWidth
                    variant="outlined" 
                    color="error"
                    startIcon={<Delete />} 
                    onClick={() => handleDelete(material._id)}
                    sx={{ fontWeight: 600 }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default StudyMaterials;
