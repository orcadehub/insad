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
import { Add, PlayArrow, Edit } from '@mui/icons-material';
import api from '../../services/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const TopicsManagement = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [topics, setTopics] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [fetchingTopics, setFetchingTopics] = useState(true);
  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    order: 0
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setFetchingTopics(true);
    try {
      const response = await api.get('/admin/practice/topics');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setFetchingTopics(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!topicForm.title.trim() || !topicForm.description.trim()) return;
    
    setLoading(true);
    try {
      if (editingTopic) {
        await api.put(`/admin/practice/topics/${editingTopic._id}`, topicForm);
      } else {
        await api.post('/admin/practice/topics', topicForm);
      }
      fetchTopics();
      setOpenDialog(false);
      setTopicForm({ title: '', description: '', difficulty: 'Easy', order: 0 });
      setEditingTopic(null);
    } catch (error) {
      console.error('Error saving topic:', error.response?.data || error.message);
      alert('Error saving topic: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title,
      description: topic.description,
      difficulty: topic.difficulty,
      order: topic.order
    });
    setOpenDialog(true);
  };

  const handleManageTopic = (topic) => {
    navigate(`/admin/practice/topics/${topic._id}/subtopics`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Topics Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Create Topic
        </Button>
      </Box>

      <Grid container spacing={3}>
        {fetchingTopics ? (
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
          topics.map((topic) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={topic._id}>
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
                      {topic.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTopic(topic);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '3rem', lineHeight: 1.5 }}>
                    {topic.description}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={() => handleManageTopic(topic)}
                    sx={{
                      mt: 'auto',
                      py: 1,
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    Manage Subtopics
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
        }}>{editingTopic ? 'Edit Topic' : 'Create New Topic'}</DialogTitle>
        <DialogContent sx={{ bgcolor: darkMode ? 'grey.900' : 'background.paper', py: 3 }}>
          <TextField
            fullWidth
            label="Topic Title"
            value={topicForm.title}
            onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={topicForm.description}
            onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={topicForm.difficulty}
              onChange={(e) => setTopicForm({ ...topicForm, difficulty: e.target.value })}
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
            value={topicForm.order}
            onChange={(e) => setTopicForm({ ...topicForm, order: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateTopic}
            disabled={loading || !topicForm.title.trim() || !topicForm.description.trim()}
          >
            {loading ? (editingTopic ? 'Updating...' : 'Creating...') : (editingTopic ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TopicsManagement;
