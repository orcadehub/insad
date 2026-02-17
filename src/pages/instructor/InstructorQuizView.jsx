import { Container, Typography, Button, Chip, Box, Card, CardContent, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { ArrowBack, AccessTime, QuestionAnswer, Schedule, Edit } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const InstructorQuizView = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState({ open: false, question: null, index: -1 });
  const [editForm, setEditForm] = useState({});

  const handleEditQuestion = (question, index) => {
    setEditForm({
      title: question.title,
      codeSnippet: question.codeSnippet || '',
      language: question.language || '',
      topic: question.topic || '',
      difficulty: question.difficulty || 'easy',
      options: question.options.map(opt => opt.text),
      correctAnswer: question.correctAnswer
    });
    setEditDialog({ open: true, question, index });
  };

  const formatText = (text) => {
    if (!text) return text;
    return text
      .replace(/\/n/g, '\n')
      .replace(/\/t/g, '    ');
  };

  const handleSaveQuestion = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/quiz-questions/${editDialog.question._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editForm.title,
          codeSnippet: editForm.codeSnippet,
          language: editForm.language,
          topic: editForm.topic,
          difficulty: editForm.difficulty,
          options: editForm.options.map(text => ({ text, image: '' })),
          correctAnswer: editForm.correctAnswer
        })
      });
      
      if (response.ok) {
        toast.success('Question updated successfully');
        fetchQuizDetails();
        setEditDialog({ open: false, question: null, index: -1 });
      } else {
        toast.error('Failed to update question');
      }
    } catch (error) {
      toast.error('Failed to update question');
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchQuizDetails();
    }
  }, [quizId]);

  const fetchQuizDetails = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading quiz...</Typography>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">Quiz not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, px: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/instructor/quiz/${quizId}`)}>
        <ArrowBack sx={{ 
          color: darkMode ? '#94a3b8' : '#64748b',
          '&:hover': {
            color: darkMode ? '#cbd5e1' : '#475569',
            transform: 'translateX(-2px)'
          },
          transition: 'all 0.2s ease'
        }} />
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: 'text.primary',
          background: darkMode 
            ? 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)'
            : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
          '&:hover': {
            background: darkMode 
              ? 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)'
              : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          },
          transition: 'all 0.3s ease'
        }}>
          Quiz Preview
        </Typography>
      </Box>

      {/* Quiz Header */}
      <Card sx={{ 
        mb: 4, 
        borderRadius: 3, 
        boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.12)',
        border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        '&:hover': {
          boxShadow: darkMode ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)'
        },
        transition: 'all 0.3s ease'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 800, 
            color: 'text.primary', 
            mb: 3,
            letterSpacing: '-0.02em',
            fontSize: '2rem'
          }}>
            {quiz.title || 'Untitled Quiz'}
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={1.5} mb={3}>
            <Chip 
              icon={<AccessTime />} 
              label={`${quiz.duration} minutes`} 
              sx={{ 
                fontWeight: 700,
                fontSize: '0.85rem',
                height: 32,
                px: 1,
                bgcolor: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                color: darkMode ? '#60a5fa' : '#2563eb',
                border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                borderRadius: 2,
                '& .MuiChip-icon': { color: 'inherit', fontSize: '1rem' },
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                  transform: 'scale(1.02)'
                },
                transition: 'all 0.2s ease'
              }}
            />
            <Chip 
              icon={<QuestionAnswer />} 
              label={`${quiz.questions?.length || 0} questions`} 
              sx={{ 
                fontWeight: 700,
                fontSize: '0.85rem',
                height: 32,
                px: 1,
                bgcolor: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                color: darkMode ? '#10b981' : '#059669',
                border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                borderRadius: 2,
                '& .MuiChip-icon': { color: 'inherit', fontSize: '1rem' },
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                  transform: 'scale(1.02)'
                },
                transition: 'all 0.2s ease'
              }}
            />
            {quiz.startTime && (
              <>
                <Chip 
                  icon={<Schedule />}
                  label={`Date: ${new Date(quiz.startTime).toLocaleDateString('en-GB')}`}
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    height: 32,
                    px: 1,
                    bgcolor: darkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                    color: darkMode ? '#818cf8' : '#6366f1',
                    border: `1px solid ${darkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
                    borderRadius: 2,
                    '& .MuiChip-icon': { color: 'inherit', fontSize: '1rem' },
                    '&:hover': {
                      bgcolor: darkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
                <Chip 
                  icon={<AccessTime />}
                  label={`Time: ${new Date(quiz.startTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}`}
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    height: 32,
                    px: 1,
                    bgcolor: darkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                    color: darkMode ? '#a855f7' : '#8b5cf6',
                    border: `1px solid ${darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                    borderRadius: 2,
                    '& .MuiChip-icon': { color: 'inherit', fontSize: '1rem' },
                    '&:hover': {
                      bgcolor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)',
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              </>
            )}
            <Chip 
              label={`Max Tab Switches: ${quiz.maxTabSwitches === -1 ? 'Unlimited' : quiz.maxTabSwitches || 3}`} 
              sx={{ 
                fontWeight: 700,
                fontSize: '0.85rem',
                height: 32,
                px: 1,
                bgcolor: quiz.maxTabSwitches === -1 
                  ? (darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
                  : (darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)'),
                color: quiz.maxTabSwitches === -1 
                  ? (darkMode ? '#10b981' : '#059669')
                  : (darkMode ? '#f59e0b' : '#d97706'),
                border: `1px solid ${quiz.maxTabSwitches === -1 
                  ? (darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)')
                  : (darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)')}`,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: quiz.maxTabSwitches === -1 
                    ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)')
                    : (darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)'),
                  transform: 'scale(1.02)'
                },
                transition: 'all 0.2s ease'
              }}
            />
          </Box>

          {quiz.description && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, fontSize: '0.95rem' }}>
                Description:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {formatText(quiz.description)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Questions */}
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 3, fontSize: '1.5rem' }}>
        Questions ({quiz.questions?.length || 0})
      </Typography>

      {quiz.questions?.map((question, index) => (
        <Card key={index} sx={{ 
          mb: 3, 
          borderRadius: 3, 
          boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.08)',
          border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          '&:hover': {
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
              <Chip 
                label={index + 1} 
                size="small" 
                sx={{ 
                  minWidth: 32,
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                  color: darkMode ? '#f9fafb' : '#374151',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}
              />
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', flex: 1 }}>
                {formatText(question.title)}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => handleEditQuestion(question, index)}
                sx={{ 
                  color: darkMode ? '#60a5fa' : '#2563eb',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ ml: 5 }}>
              {question.codeSnippet && (
                <Box sx={{ 
                  mb: 2, 
                  p: 2, 
                  backgroundColor: darkMode ? '#111827' : '#f8fafc',
                  borderRadius: 2,
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: darkMode ? '#60a5fa' : '#2563eb', mb: 1, fontSize: '0.9rem' }}>
                    {question.language} Code:
                  </Typography>
                  <pre style={{ 
                    margin: 0, 
                    fontFamily: 'monospace', 
                    fontSize: '0.875rem',
                    color: darkMode ? '#f9fafb' : '#111827',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5
                  }}>
                    {formatText(question.codeSnippet)}
                  </pre>
                </Box>
              )}
              
              {question.topic && (
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={`Topic: ${question.topic}`}
                    size="small"
                    sx={{ 
                      backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                      color: darkMode ? '#f9fafb' : '#374151',
                      fontWeight: 600,
                      mr: 1
                    }}
                  />
                  <Chip 
                    label={`Difficulty: ${question.difficulty}`}
                    size="small"
                    sx={{
                      backgroundColor: question.difficulty === 'easy' 
                        ? (darkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)')
                        : question.difficulty === 'medium' 
                        ? (darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)')
                        : (darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'),
                      color: question.difficulty === 'easy' 
                        ? (darkMode ? '#22c55e' : '#16a34a')
                        : question.difficulty === 'medium' 
                        ? (darkMode ? '#f59e0b' : '#d97706')
                        : (darkMode ? '#ef4444' : '#dc2626'),
                      border: `1px solid ${question.difficulty === 'easy' 
                        ? (darkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)')
                        : question.difficulty === 'medium' 
                        ? (darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)')
                        : (darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)')}`,
                      fontWeight: 600
                    }}
                  />
                </Box>
              )}
              
              {question.options?.map((option, optIndex) => (
                <Box key={optIndex} display="flex" alignItems="center" gap={2} mb={1}>
                  <Box sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: `2px solid ${question.correctAnswer === optIndex ? (darkMode ? '#10b981' : '#059669') : (darkMode ? '#6b7280' : '#d1d5db')}`,
                    backgroundColor: question.correctAnswer === optIndex ? (darkMode ? '#10b981' : '#059669') : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}>
                    {question.correctAnswer === optIndex && (
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#ffffff'
                      }} />
                    )}
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: question.correctAnswer === optIndex 
                        ? (darkMode ? '#10b981' : '#059669')
                        : 'text.secondary',
                      fontWeight: question.correctAnswer === optIndex ? 700 : 500,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {formatText(typeof option === 'object' ? option.text : option)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {question.explanation && (
              <>
                <Divider sx={{ my: 2, borderColor: darkMode ? '#374151' : '#e5e7eb' }} />
                <Box sx={{ ml: 5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: darkMode ? '#60a5fa' : '#2563eb', mb: 1, fontSize: '0.9rem' }}>
                    Explanation:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {formatText(question.explanation)}
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Edit Question Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, question: null, index: -1 })} maxWidth="md" fullWidth>
        <DialogTitle>Edit Question</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Question Title"
            value={editForm.title || ''}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Code Snippet"
            multiline
            rows={4}
            value={editForm.codeSnippet || ''}
            onChange={(e) => setEditForm({ ...editForm, codeSnippet: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="Language"
              value={editForm.language || ''}
              onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Topic"
              value={editForm.topic || ''}
              onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={editForm.difficulty || 'easy'}
                onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                label="Difficulty"
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Typography variant="h6" sx={{ mb: 2 }}>Options</Typography>
          {editForm.options?.map((option, idx) => (
            <TextField
              key={idx}
              fullWidth
              label={`Option ${idx + 1}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...editForm.options];
                newOptions[idx] = e.target.value;
                setEditForm({ ...editForm, options: newOptions });
              }}
              sx={{ mb: 1 }}
            />
          ))}
          
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Correct Answer</Typography>
          <RadioGroup
            value={editForm.correctAnswer}
            onChange={(e) => setEditForm({ ...editForm, correctAnswer: parseInt(e.target.value) })}
          >
            {editForm.options?.map((option, idx) => (
              <FormControlLabel key={idx} value={idx} control={<Radio />} label={`Option ${idx + 1}: ${option}`} />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, question: null, index: -1 })}>Cancel</Button>
          <Button onClick={handleSaveQuestion} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InstructorQuizView;