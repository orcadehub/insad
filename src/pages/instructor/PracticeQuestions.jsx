import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Add, ArrowBack, Edit, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

const PracticeQuestions = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { darkMode } = useTheme();
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [questionFormData, setQuestionFormData] = useState(null);
  const [createQuestionLoading, setCreateQuestionLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [editedQuestionData, setEditedQuestionData] = useState(null);
  const [editQuestionLoading, setEditQuestionLoading] = useState(false);

  const sampleQuestionJson = {
    title: 'Two Sum Problem',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'Easy',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9'
    ],
    testCases: {
      public: [
        {
          input: '2 7 11 15\\n9',
          output: '0 1',
          explanation: 'Basic case'
        }
      ],
      private: [
        {
          input: '3 2 4\\n6',
          output: '1 2'
        }
      ]
    },
    tags: ['Array', 'Hash Table'],
    example: {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]'
    },
    explanation: 'Because nums[0] + nums[1] == 9',
    solution: {
      approach: 'Hash Map',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    order: 1,
    points: 10
  };

  useEffect(() => {
    fetchQuestions();
  }, [topicId]);

  const fetchQuestions = async () => {
    try {
      const topicResponse = await fetch(`http://localhost:4000/api/admin/practice/topics/${topicId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (topicResponse.ok) {
        const topicData = await topicResponse.json();
        setTopic(topicData);
      }

      const response = await fetch(`http://localhost:4000/api/admin/practice/topics/${topicId}/questions`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Error fetching questions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!questionFormData) {
      toast.error('Please provide question data');
      return;
    }
    
    setCreateQuestionLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/admin/practice/topics/${topicId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(questionFormData)
      });
      if (response.ok) {
        toast.success('Question created successfully');
        setAddQuestionOpen(false);
        setQuestionFormData(null);
        fetchQuestions();
      } else {
        toast.error('Error creating question');
      }
    } catch (error) {
      toast.error('Error creating question');
    } finally {
      setCreateQuestionLoading(false);
    }
  };

  const handleQuestionFormChange = (data) => {
    if (!data.error) {
      setQuestionFormData(data.jsObject);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await fetch(`http://localhost:4000/api/admin/practice/questions/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          toast.success('Question deleted successfully');
          fetchQuestions();
        } else {
          toast.error('Error deleting question');
        }
      } catch (error) {
        toast.error('Error deleting question');
      }
    }
  };

  const handleEdit = (question) => {
    setQuestionToEdit(question);
    setEditedQuestionData({
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      constraints: question.constraints,
      testCases: question.testCases,
      tags: question.tags,
      example: question.example,
      explanation: question.explanation,
      solution: question.solution,
      order: question.order,
      points: question.points
    });
    setEditDialogOpen(true);
  };

  const handleSaveQuestion = async () => {
    setEditQuestionLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/admin/practice/questions/${questionToEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editedQuestionData)
      });
      if (response.ok) {
        toast.success('Question updated successfully');
        setEditDialogOpen(false);
        fetchQuestions();
      } else {
        toast.error('Error updating question');
      }
    } catch (error) {
      toast.error('Error updating question');
    } finally {
      setEditQuestionLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/instructor/practice')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {topic?.name || 'Topic'} Questions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddQuestionOpen(true)}
        >
          Add Question
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : questions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No questions added yet. Click "Add Question" to create one.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {questions.map((question) => (
            <Grid item xs={12} sm={6} md={4} key={question._id}>
              <Card
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {question.title}
                    </Typography>
                    <Chip 
                      label={question.difficulty} 
                      size="small" 
                      color={getDifficultyColor(question.difficulty)}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {question.tags?.map((tag, i) => (
                      <Chip key={i} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEdit(question)}
                      sx={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(question._id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Question Dialog */}
      <Dialog open={addQuestionOpen} onClose={() => setAddQuestionOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Create New Question</DialogTitle>
        <DialogContent>
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Paste your question JSON data below. Use this sample format:
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setQuestionFormData(sampleQuestionJson)}
              >
                Load Sample JSON
              </Button>
            </Box>
            
            <Box sx={{ height: '400px' }}>
              <JSONInput
                id='create-json-editor'
                placeholder={sampleQuestionJson}
                locale={locale}
                height='100%'
                width='100%'
                onChange={handleQuestionFormChange}
                theme={darkMode ? 'dark_vscode_tribute' : 'light_mitsuketa_tribute'}
                viewOnly={false}
                confirmGood={false}
                style={{
                  body: {
                    fontSize: '14px',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                  }
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddQuestionOpen(false)} disabled={createQuestionLoading}>Cancel</Button>
          <Button 
            onClick={handleCreateQuestion} 
            variant="contained"
            disabled={!questionFormData || createQuestionLoading}
          >
            {createQuestionLoading ? 'Creating...' : 'Create Question'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Question</DialogTitle>
        <DialogContent sx={{ height: '70vh', overflow: 'auto' }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Title" value={editedQuestionData?.title || ''} onChange={(e) => setEditedQuestionData({...editedQuestionData, title: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select value={editedQuestionData?.difficulty || ''} onChange={(e) => setEditedQuestionData({...editedQuestionData, difficulty: e.target.value})} label="Difficulty">
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="Description" value={editedQuestionData?.description || ''} onChange={(e) => setEditedQuestionData({...editedQuestionData, description: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Tags (comma separated)" value={editedQuestionData?.tags?.join(', ') || ''} onChange={(e) => setEditedQuestionData({...editedQuestionData, tags: e.target.value.split(',').map(t => t.trim())})} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Order" type="number" value={editedQuestionData?.order || ''} onChange={(e) => setEditedQuestionData({...editedQuestionData, order: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Points" type="number" value={editedQuestionData?.points || ''} onChange={(e) => setEditedQuestionData({...editedQuestionData, points: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={editQuestionLoading}>Cancel</Button>
          <Button onClick={handleSaveQuestion} variant="contained" disabled={editQuestionLoading}>
            {editQuestionLoading ? 'Saving...' : 'Save Question'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PracticeQuestions;
