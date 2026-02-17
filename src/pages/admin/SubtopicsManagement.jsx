import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Skeleton
} from '@mui/material';
import { Add, PlayArrow, Edit, ArrowBack } from '@mui/icons-material';
import api from '../../services/api/apiClient';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const SubtopicsManagement = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { darkMode } = useTheme();
  const [topic, setTopic] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingSubtopic, setEditingSubtopic] = useState(null);
  const [fetchingSubtopics, setFetchingSubtopics] = useState(true);
  const [subtopicForm, setSubtopicForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    order: 0
  });

  useEffect(() => {
    fetchTopic();
    fetchSubtopics();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const response = await api.get(`/admin/practice/topics/${topicId}`);
      setTopic(response.data);
    } catch (error) {
      console.error('Error fetching topic:', error);
    }
  };

  const fetchSubtopics = async () => {
    setFetchingSubtopics(true);
    try {
      const response = await api.get(`/admin/practice/topics/${topicId}/subtopics`);
      setSubtopics(response.data);
    } catch (error) {
      console.error('Error fetching subtopics:', error);
    } finally {
      setFetchingSubtopics(false);
    }
  };

  const handleCreateSubtopic = async () => {
    if (!subtopicForm.title.trim() || !subtopicForm.description.trim()) return;
    
    setLoading(true);
    try {
      if (editingSubtopic) {
        await api.put(`/admin/practice/subtopics/${editingSubtopic._id}`, subtopicForm);
      } else {
        await api.post('/admin/practice/subtopics', {
          ...subtopicForm,
          topicId
        });
      }
      fetchSubtopics();
      setOpenDialog(false);
      setSubtopicForm({ title: '', description: '', difficulty: 'Easy', order: 0 });
      setEditingSubtopic(null);
    } catch (error) {
      console.error('Error saving subtopic:', error);
      alert('Error saving subtopic: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubtopic = (subtopic) => {
    setEditingSubtopic(subtopic);
    setSubtopicForm({
      title: subtopic.title,
      description: subtopic.description,
      difficulty: subtopic.difficulty,
      order: subtopic.order
    });
    setOpenDialog(true);
  };

  const handleManageQuestions = (subtopic) => {
    navigate(`/admin/practice/subtopics/${subtopic._id}/questions`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin/practice')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {topic?.title} - Subtopics
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Subtopic
        </Button>
      </Box>

      <Grid container spacing={3}>
        {fetchingSubtopics ? (
          Array.from(new Array(8)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          subtopics.map((subtopic) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={subtopic._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {subtopic.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSubtopic(subtopic);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '3rem', lineHeight: 1.5 }}>
                    {subtopic.description}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={() => handleManageQuestions(subtopic)}
                    sx={{
                      mt: 'auto',
                      py: 1,
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    Manage Questions
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: '1.5rem',
          bgcolor: darkMode ? 'grey.800' : 'primary.50',
          color: darkMode ? 'grey.100' : 'primary.main',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'primary.200'}`,
          py: 3
        }}>{editingSubtopic ? 'Edit Subtopic' : 'Create New Subtopic'}</DialogTitle>
        <DialogContent sx={{ bgcolor: darkMode ? 'grey.900' : 'background.paper', py: 3 }}>
          <TextField
            fullWidth
            label="Subtopic Title"
            value={subtopicForm.title}
            onChange={(e) => setSubtopicForm({ ...subtopicForm, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={subtopicForm.description}
            onChange={(e) => setSubtopicForm({ ...subtopicForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={subtopicForm.difficulty}
              onChange={(e) => setSubtopicForm({ ...subtopicForm, difficulty: e.target.value })}
            >
              <MenuItem value="Easy">Easy</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Hard">Hard</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Order"
            type="number"
            value={subtopicForm.order}
            onChange={(e) => setSubtopicForm({ ...subtopicForm, order: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateSubtopic}
            disabled={loading || !subtopicForm.title.trim() || !subtopicForm.description.trim()}
          >
            {loading ? (editingSubtopic ? 'Updating...' : 'Creating...') : (editingSubtopic ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubtopicsManagement;
