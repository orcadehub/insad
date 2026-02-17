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
  Chip,
  IconButton,
  Skeleton
} from '@mui/material';
import { Add, Edit, ContentCopy, ArrowBack, PlayArrow } from '@mui/icons-material';
import api from '../../services/api/apiClient';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const QuestionsManagement = () => {
  const navigate = useNavigate();
  const { subtopicId } = useParams();
  const { darkMode } = useTheme();
  const [subtopic, setSubtopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [fetchingQuestions, setFetchingQuestions] = useState(true);
  const [questionJson, setQuestionJson] = useState('');

  const sampleJson = {
    title: 'Sample Game',
    description: 'Sample game description',
    difficulty: 'Easy',
    points: 100,
    gameType: 'LogicPuzzle',
    isMultiLevel: true,
    totalLevels: 3,
    hasTimer: true,
    totalTimeLimit: 300,
    levels: [
      {
        levelNumber: 1,
        levelTitle: 'Level 1',
        levelDescription: 'First challenge',
        questionType: 'MCQ',
        question: 'Sample question?',
        options: [
          { id: 'A', text: 'Option A', isCorrect: true },
          { id: 'B', text: 'Option B', isCorrect: false }
        ],
        correctAnswer: 'A',
        timeLimit: 60,
        pointsForLevel: 10,
        shuffleOptions: true
      }
    ],
    aiShuffle: {
      enabled: true,
      shuffleType: 'adaptive'
    },
    speedBonus: {
      enabled: true,
      maxBonus: 20,
      timeThreshold: 120
    },
    tags: ['Logic'],
    order: 1
  };

  useEffect(() => {
    fetchSubtopic();
    fetchQuestions();
  }, [subtopicId]);

  const fetchSubtopic = async () => {
    try {
      const response = await api.get(`/admin/practice/subtopics/${subtopicId}`);
      setSubtopic(response.data);
    } catch (error) {
      console.error('Error fetching subtopic:', error);
    }
  };

  const fetchQuestions = async () => {
    setFetchingQuestions(true);
    try {
      const response = await api.get(`/admin/practice/subtopics/${subtopicId}/questions`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setFetchingQuestions(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!questionJson.trim()) return;
    
    setLoading(true);
    try {
      const questionData = JSON.parse(questionJson);
      questionData.subTopicId = subtopicId;
      
      if (editingQuestion) {
        await api.put(`/admin/practice/questions/${editingQuestion._id}`, questionData);
      } else {
        await api.post('/admin/practice/questions', questionData);
      }
      
      fetchQuestions();
      setOpenDialog(false);
      setQuestionJson('');
      setEditingQuestion(null);
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error: ' + (error.message.includes('JSON') ? 'Invalid JSON format' : error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {subtopic?.title} - Questions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Question
        </Button>
      </Box>

      <Grid container spacing={3}>
        {fetchingQuestions ? (
          Array.from(new Array(8)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          questions.map((question) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={question._id}>
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
                      {question.title}
                    </Typography>
                    <Chip 
                      label={question.difficulty} 
                      color={question.difficulty === 'Easy' ? 'success' : question.difficulty === 'Medium' ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '3rem', lineHeight: 1.5 }}>
                    {question.description.substring(0, 100)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {question.points} points • {question.totalLevels || 1} levels
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/admin/practice/play/${question._id}`)}
                        title="Start Game"
                      >
                        <PlayArrow />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingQuestion(question);
                          const { subTopicId, _id, createdAt, updatedAt, __v, ...questionData } = question;
                          setQuestionJson(JSON.stringify(questionData, null, 2));
                          setOpenDialog(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="lg" 
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
        }}>{editingQuestion ? 'Edit Question' : 'Create New Question'}</DialogTitle>
        <DialogContent sx={{ bgcolor: darkMode ? 'grey.900' : 'background.paper', py: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Paste your question JSON data below
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setQuestionJson(JSON.stringify(sampleJson, null, 2))}
            >
              Load Sample JSON
            </Button>
          </Box>
          
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              label="Question JSON Data"
              multiline
              rows={20}
              value={questionJson}
              onChange={(e) => setQuestionJson(e.target.value)}
              placeholder={JSON.stringify(sampleJson, null, 2)}
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }
              }}
            />
            <IconButton
              sx={{ 
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
              onClick={() => navigator.clipboard.writeText(questionJson)}
              title="Copy JSON"
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateQuestion}
            disabled={loading || !questionJson.trim()}
          >
            {loading ? (editingQuestion ? 'Updating...' : 'Creating...') : (editingQuestion ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionsManagement;
