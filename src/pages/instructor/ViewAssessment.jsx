import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert,
  Paper,
  Grid,
  TextField,
  Tabs,
  Tab,
  Pagination,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  ArrowBack, 
  Delete, 
  Add,
  ExpandMore,
  Code,
  Quiz,
  AccessTime,
  People,
  Edit,
  Schedule,
  Language,
  Security,
  Assignment,
  Search
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import { submitCode } from '../../services/judge0Service.js';

import CreateFrontendQuestionForm from '../../components/CreateFrontendQuestionForm';

const ViewAssessment = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [editedQuestionData, setEditedQuestionData] = useState(null);
  const [jsonError, setJsonError] = useState('');
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [addFrontendQuestionOpen, setAddFrontendQuestionOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [availableQuizQuestions, setAvailableQuizQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [questionFormData, setQuestionFormData] = useState(null);
  const [createQuestionLoading, setCreateQuestionLoading] = useState(false);
  const [deleteQuestionLoading, setDeleteQuestionLoading] = useState(false);
  const [editQuizDialogOpen, setEditQuizDialogOpen] = useState(false);
  const [quizQuestionToEdit, setQuizQuestionToEdit] = useState(null);
  const [editedQuizData, setEditedQuizData] = useState(null);
  const [editQuestionLoading, setEditQuestionLoading] = useState(false);
  const [addToAssessmentLoading, setAddToAssessmentLoading] = useState(null);
  const [editAssessmentOpen, setEditAssessmentOpen] = useState(false);
  const [assessmentEditData, setAssessmentEditData] = useState({ title: '', description: '' });
  const questionsPerPage = 5;
  const [runCodeOpen, setRunCodeOpen] = useState(false);
  const [selectedQuestionForRun, setSelectedQuestionForRun] = useState(null);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [testResults, setTestResults] = useState([]);
  const [runningTests, setRunningTests] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [availableFrontendQuestions, setAvailableFrontendQuestions] = useState([]);

  useEffect(() => {
    fetchAssessment();
    fetchAvailableQuestions();
    fetchAvailableQuizQuestions();
    fetchAvailableFrontendQuestions();
  }, [assessmentId]);

  // Timer effect
  useEffect(() => {
    if (!assessment || !assessment.startTime || !assessment.duration) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const startTime = new Date(assessment.startTime).getTime();
      const endTime = startTime + (assessment.duration * 60 * 1000);
      const remaining = Math.max(0, endTime - now);
      return Math.floor(remaining / 1000);
    };
    
    const remaining = calculateTimeRemaining();
    setTimeRemaining(remaining);
    setIsTimerActive(remaining > 0 && assessment.status === 'active');
    
    if (remaining > 0 && assessment.status === 'active') {
      const interval = setInterval(() => {
        const newRemaining = calculateTimeRemaining();
        setTimeRemaining(newRemaining);
        
        if (newRemaining <= 0) {
          handleTimerExpiration();
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [assessment]);

  const handleTimerExpiration = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}/expire-timer`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`Timer expired! ${result.updatedCount} attempts marked as completed`);
        setIsTimerActive(false);
        // Refresh assessment data
        fetchAssessment();
      } else {
        toast.error('Failed to handle timer expiration');
      }
    } catch (error) {
      console.error('Error handling timer expiration:', error);
      toast.error('Error handling timer expiration');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sampleQuestionJson = {
    title: 'Two Sum Problem',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    difficulty: 'Easy',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists'
    ],
    testCases: [
      {
        input: '2 7 11 15\n9',
        output: '0 1',
        explanation: 'Basic case with solution at beginning',
        isPublic: true
      },
      {
        input: '3 2 4\n6',
        output: '1 2',
        explanation: 'Solution in middle of array',
        isPublic: true
      }
    ],
    tags: ['Array', 'Hash Table'],
    assessmentType: 'programming',
    example: {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
    },
    intuition: {
      approach: 'Hash Map',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      keyInsights: [
        'Use hash map to store complement values',
        'Single pass through array',
        'For each element, check if target-element exists in map'
      ],
      algorithmSteps: [
        'Create hash map to store value -> index',
        'For each number, calculate complement = target - current number',
        'If complement exists in map, return [map[complement], current_index]',
        'Otherwise, store current number and index in map'
      ]
    },
    isActive: true
  };

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('=== ASSESSMENT DATA ===' );
        console.log('Full assessment:', data);
        console.log('Assessment type:', data.type);
        console.log('Programming questions:', data.questions);
        console.log('Quiz questions:', data.quizQuestions);
        console.log('Quiz questions length:', data.quizQuestions?.length);
        console.log('Frontend questions:', data.frontendQuestions);
        console.log('======================');
        setAssessment(data);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
      toast.error('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/assessment-questions?type=programming`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchAvailableQuizQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/quiz-questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableQuizQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    }
  };

  const fetchAvailableFrontendQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/frontend-questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableFrontendQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching frontend questions:', error);
    }
  };

  const handleCreateQuestion = async () => {
    if (!questionFormData) {
      toast.error('Please provide question data');
      return;
    }
    
    setCreateQuestionLoading(true);
    try {
      console.log('Creating question with data:', questionFormData);
      
      const response = await fetch('http://localhost:4000/api/assessment-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...questionFormData,
          assessmentType: 'programming'
        })
      });
      
      const result = await response.json();
      console.log('Create response:', response.status, result);
      
      if (response.ok) {
        await addQuestionToAssessment(result);
        toast.success('Question created and added successfully');
        setAddQuestionOpen(false);
        setQuestionFormData(null);
        fetchAvailableQuestions();
      } else {
        toast.error(result.message || 'Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('Error creating question');
    } finally {
      setCreateQuestionLoading(false);
    }
  };

  const removeQuestionFromAssessment = async (question) => {
    setAddToAssessmentLoading(question._id);
    try {
      const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          questions: assessment.questions.filter(q => q._id !== question._id).map(q => q._id)
        })
      });
      
      if (response.ok) {
        fetchAssessment();
        toast.success('Question removed from assessment');
      } else {
        toast.error('Failed to remove question from assessment');
      }
    } catch (error) {
      toast.error('Error removing question from assessment');
    } finally {
      setAddToAssessmentLoading(null);
    }
  };

  const addQuestionToAssessment = async (question) => {
    setAddToAssessmentLoading(question._id);
    try {
      const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          questions: [...assessment.questions.map(q => q._id), question._id]
        })
      });
      
      if (response.ok) {
        fetchAssessment();
        toast.success('Question added to assessment');
      } else {
        toast.error('Failed to add question to assessment');
      }
    } catch (error) {
      toast.error('Error adding question to assessment');
    } finally {
      setAddToAssessmentLoading(null);
    }
  };

  const addQuizQuestionToAssessment = async (question) => {
    setAddToAssessmentLoading(question._id);
    try {
      const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}/quiz-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ questionId: question._id })
      });
      
      if (response.ok) {
        fetchAssessment();
        toast.success('Quiz question added to assessment');
      } else {
        toast.error('Failed to add quiz question to assessment');
      }
    } catch (error) {
      toast.error('Error adding quiz question to assessment');
    } finally {
      setAddToAssessmentLoading(null);
    }
  };

  const handleRemoveQuizQuestion = async (questionId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}/quiz-questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchAssessment();
        toast.success('Quiz question removed from assessment');
      } else {
        toast.error('Failed to remove quiz question from assessment');
      }
    } catch (error) {
      toast.error('Error removing quiz question from assessment');
    }
  };

  const handleEditQuizQuestion = (question) => {
    setQuizQuestionToEdit(question);
    setEditedQuizData({
      title: question.title,
      codeSnippet: question.codeSnippet || '',
      language: question.language,
      topic: question.topic,
      options: question.options || [],
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      tags: question.tags || []
    });
    setEditQuizDialogOpen(true);
  };

  const handleSaveQuizQuestion = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/quiz-questions/${quizQuestionToEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editedQuizData)
      });
      
      if (response.ok) {
        fetchAssessment();
        fetchAvailableQuizQuestions();
        toast.success('Quiz question updated successfully');
        setEditQuizDialogOpen(false);
      } else {
        toast.error('Failed to update quiz question');
      }
    } catch (error) {
      toast.error('Error updating quiz question');
    }
  };

  const handleRunCode = (question) => {
    setSelectedQuestionForRun(question);
    setCode('');
    setTestResults([]);
    setRunCodeOpen(true);
  };

  const executeCode = async () => {
    if (!code.trim()) return;
    
    setRunningTests(true);
    const results = [];
    
    const languageMap = {
      'python': 71,
      'cpp': 54,
      'java': 62,
      'c': 50
    };
    
    const languageId = languageMap[selectedLanguage];
    if (!languageId) {
      toast.error('Unsupported language');
      setRunningTests(false);
      return;
    }
    
    for (const testCase of selectedQuestionForRun.testCases) {
      try {
        const result = await submitCode(code, languageId, testCase.input);
        const isCorrect = result.status.id === 3 && result.stdout?.trim() === testCase.output.trim();
        
        results.push({
          ...testCase,
          actualOutput: result.stdout?.trim() || result.stderr || 'No output',
          isCorrect,
          error: result.stderr
        });
      } catch (error) {
        results.push({
          ...testCase,
          actualOutput: 'Execution Error',
          isCorrect: false,
          error: error.message
        });
      }
    }
    
    setTestResults(results);
    setRunningTests(false);
  };

  const handleQuestionFormChange = (data) => {
    if (!data.error) {
      setQuestionFormData(data.jsObject);
    }
  };

  const handleCreateJsonPaste = (event) => {
    const pastedText = event.clipboardData.getData('text');
    try {
      // Try to parse as JSON first
      let parsedJson;
      try {
        parsedJson = JSON.parse(pastedText);
      } catch {
        // If JSON parse fails, try to evaluate as JavaScript object
        parsedJson = eval('(' + pastedText + ')');
      }
      setQuestionFormData(parsedJson);
      // Prevent default paste behavior
      event.preventDefault();
    } catch (error) {
      // If both fail, let the editor handle it normally
      console.log('Could not parse pasted content:', error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    setDeleteQuestionLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          questions: assessment.questions.filter(q => q._id !== questionId).map(q => q._id)
        })
      });
      
      if (response.ok) {
        const updatedQuestions = assessment.questions.filter(q => q._id !== questionId);
        setAssessment({ ...assessment, questions: updatedQuestions });
        toast.success('Question removed from assessment');
      } else {
        toast.error('Failed to remove question from assessment');
      }
    } catch (error) {
      console.error('Error removing question from assessment:', error);
      toast.error('Error removing question from assessment');
    } finally {
      setDeleteQuestionLoading(false);
    }
    setDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const handleEditQuestion = (question) => {
    setQuestionToEdit(question);
    const editableQuestion = {
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      constraints: question.constraints,
      testCases: question.testCases,
      tags: question.tags,
      assessmentType: question.assessmentType,
      example: question.example,
      intuition: question.intuition,
      isActive: question.isActive
    };
    setEditedQuestionData(editableQuestion);
    setJsonError('');
    setEditDialogOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!questionToEdit?._id) {
      toast.error('Question ID is missing');
      return;
    }
    
    setEditQuestionLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/assessment-questions/${questionToEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...editedQuestionData,
          assessmentType: 'programming',
          isActive: true
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        const updatedQuestions = assessment.questions.map(q => 
          q._id === questionToEdit._id ? { ...q, ...editedQuestionData } : q
        );
        setAssessment({ ...assessment, questions: updatedQuestions });
        
        toast.success('Question saved successfully');
        setEditDialogOpen(false);
      } else {
        toast.error(result.message || 'Failed to save question');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Error saving question');
    } finally {
      setEditQuestionLoading(false);
    }
  };

  const handleJsonChange = (data) => {
    if (data.error) {
      setJsonError('Invalid JSON format');
    } else {
      setJsonError('');
      setEditedQuestionData(data.jsObject);
    }
  };

  const handleJsonPaste = (event) => {
    const pastedText = event.clipboardData.getData('text');
    try {
      // Try to parse as JSON first
      let parsedJson;
      try {
        parsedJson = JSON.parse(pastedText);
      } catch {
        // If JSON parse fails, try to evaluate as JavaScript object
        parsedJson = eval('(' + pastedText + ')');
      }
      setEditedQuestionData(parsedJson);
      setJsonError('');
      // Prevent default paste behavior
      event.preventDefault();
      // Force re-render of JSON editor with parsed object
      setTimeout(() => {
        const editor = document.getElementById('json-editor');
        if (editor) {
          editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, 100);
    } catch (error) {
      // If both fail, let the editor handle it normally
      console.log('Could not parse pasted content:', error);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#2196f3';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography variant="h6" color="text.secondary">Loading assessment...</Typography>
      </Box>
    );
  }

  if (!assessment) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>Assessment not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: darkMode ? '#0a0e1a' : '#f8fafc', p: 3 }}>
      {/* Header */}
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
                onClick={() => {
                  setAssessmentEditData({ title: assessment.title, description: assessment.description });
                  setEditAssessmentOpen(true);
                }}
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                <Edit />
              </IconButton>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {assessment.description}
            </Typography>
            {isTimerActive && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mt: 2,
                bgcolor: timeRemaining < 300 ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                px: 2,
                py: 1,
                borderRadius: 2,
                border: `2px solid ${timeRemaining < 300 ? '#f44336' : '#4caf50'}`
              }}>
                <AccessTime sx={{ color: timeRemaining < 300 ? '#f44336' : '#4caf50' }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  color: timeRemaining < 300 ? '#f44336' : '#4caf50'
                }}>
                  Time Remaining: {formatTime(timeRemaining)}
                </Typography>
              </Box>
            )}
          </Box>
          <Chip 
            label={assessment.status?.toUpperCase()} 
            color={getStatusColor(assessment.status)}
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

      {/* Stats Cards */}
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
                {assessment.questions?.length || 0}
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
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Languages</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {(assessment.allowedLanguages || ['python', 'cpp', 'java', 'c']).length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>supported</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assessment Details */}
      <Card sx={{ mb: 4, borderRadius: 4, border: 'none', boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, display: 'flex', alignItems: 'center' }}>
            <Schedule sx={{ mr: 2, color: 'primary.main' }} />
            Schedule & Configuration
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, borderRadius: 3, bgcolor: darkMode ? 'grey.900' : 'grey.50' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                  Start Time
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {formatDateTime(assessment.startTime)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, borderRadius: 3, bgcolor: darkMode ? 'grey.900' : 'grey.50' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                  End Time
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {assessment.startTime && assessment.duration 
                    ? formatDateTime(new Date(new Date(assessment.startTime).getTime() + assessment.duration * 60000))
                    : 'Not calculated'
                  }
                </Typography>
              </Box>
            </Grid>

            {assessment.type === 'programming' && (
              <Grid item xs={12}>
                <Box sx={{ p: 3, borderRadius: 3, bgcolor: darkMode ? 'grey.900' : 'grey.50' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
                    Allowed Programming Languages
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {(assessment.allowedLanguages || ['python', 'cpp', 'java', 'c']).map((lang) => (
                      <Chip 
                        key={lang} 
                        label={lang.toUpperCase()} 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          height: 36,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }} 
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Programming Questions */}
      <Card sx={{ mb: 4, borderRadius: 4, border: 'none', boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Code sx={{ mr: 2, color: 'primary.main' }} />
              {assessment.type === 'frontend' ? 'Frontend' : assessment.type === 'backend' ? 'Backend' : 'Programming'} Questions ({(assessment.type === 'frontend' ? assessment.frontendQuestions?.length : assessment.questions?.length) || 0})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setTabValue(0);
                if (assessment.type === 'frontend') {
                  setAddFrontendQuestionOpen(true);
                } else {
                  setAddQuestionOpen(true);
                }
              }}
              sx={{ 
                textTransform: 'none',
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                boxShadow: 3
              }}
            >
              Add Question
            </Button>
          </Box>

          {(assessment.type === 'frontend' ? assessment.frontendQuestions?.length : assessment.questions?.length) > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(assessment.type === 'frontend' ? assessment.frontendQuestions : assessment.questions).map((question, index) => (
                <Card 
                  key={question._id} 
                  sx={{ 
                    borderRadius: 3,
                    border: `2px solid ${darkMode ? 'grey.800' : 'grey.200'}`,
                    boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ 
                        minWidth: 60, 
                        height: 60, 
                        borderRadius: 3, 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {index + 1}
                        </Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {question.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                          <Chip 
                            label={question.difficulty} 
                            size="small" 
                            sx={{ 
                              bgcolor: getDifficultyColor(question.difficulty),
                              color: 'white',
                              fontWeight: 600
                            }} 
                          />
                          {assessment.type === 'frontend' ? (
                            <Chip 
                              label={`${question.requirements?.length || 0} requirements`} 
                              size="small" 
                              sx={{ bgcolor: darkMode ? 'grey.700' : 'grey.200', fontWeight: 600 }}
                            />
                          ) : (
                            <Chip 
                              label={`${question.testCases?.length || 0} test cases`} 
                              size="small" 
                              sx={{ bgcolor: darkMode ? 'grey.700' : 'grey.200', fontWeight: 600 }}
                            />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {assessment.type !== 'frontend' && (
                          <Button
                            size="medium"
                            variant="contained"
                            startIcon={<Code />}
                            onClick={() => handleRunCode(question)}
                            sx={{ 
                              bgcolor: 'success.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'success.dark' },
                              textTransform: 'none'
                            }}
                          >
                            Run
                          </Button>
                        )}
                        {assessment.type !== 'frontend' && (
                          <Button
                            size="medium"
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={() => handleEditQuestion(question)}
                            sx={{ 
                              bgcolor: 'primary.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'primary.dark' },
                              textTransform: 'none'
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          size="medium"
                          variant="contained"
                          startIcon={<Delete />}
                          onClick={async () => {
                            try {
                              const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}/frontend-questions/${question._id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                              });
                              if (response.ok) {
                                fetchAssessment();
                                toast.success('Question removed');
                              } else {
                                toast.error('Failed to remove question');
                              }
                            } catch (error) {
                              toast.error('Error removing question');
                            }
                          }}
                          sx={{ 
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                            textTransform: 'none'
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              borderRadius: 3,
              bgcolor: darkMode ? 'grey.900' : 'grey.50',
              border: `2px dashed ${darkMode ? 'grey.700' : 'grey.300'}`
            }}>
              <Code sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No questions added yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setTabValue(0);
                  if (assessment.type === 'frontend') {
                    setAddFrontendQuestionOpen(true);
                  } else {
                    setAddQuestionOpen(true);
                  }
                }}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                Add First Question
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Quiz Questions */}
      <Card sx={{ borderRadius: 4, border: 'none', boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Quiz sx={{ mr: 2, color: 'secondary.main' }} />
              Quiz Questions ({assessment.quizQuestions?.length || 0})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setAddQuestionOpen(true);
                setTabValue(1);
              }}
              sx={{ 
                textTransform: 'none',
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                boxShadow: 3
              }}
            >
              Add Quiz Question
            </Button>
          </Box>

          {assessment.quizQuestions?.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {assessment.quizQuestions.map((question, index) => (
                <Card 
                  key={question._id} 
                  sx={{ 
                    borderRadius: 3,
                    border: `2px solid ${darkMode ? 'grey.800' : 'grey.200'}`,
                    boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ 
                        minWidth: 60, 
                        height: 60, 
                        borderRadius: 3, 
                        bgcolor: 'secondary.main', 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Q{index + 1}
                        </Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {question.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {question.description || question.codeSnippet || 'No description available'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Topic: {question.topic || 'General'} | Language: {question.language || 'N/A'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                          <Chip 
                            label={question.difficulty} 
                            size="small" 
                            sx={{ 
                              bgcolor: getDifficultyColor(question.difficulty),
                              color: 'white',
                              fontWeight: 600
                            }} 
                          />
                          <Chip 
                            label={`${question.options?.length || 0} options`} 
                            size="small" 
                            sx={{ bgcolor: darkMode ? 'grey.700' : 'grey.200', fontWeight: 600 }}
                          />
                          <Chip 
                            label="Quiz Question" 
                            size="small" 
                            sx={{ bgcolor: 'info.main', color: 'white', fontWeight: 600 }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="medium"
                          variant="contained"
                          startIcon={<Edit />}
                          onClick={() => handleEditQuizQuestion(question)}
                          sx={{ 
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                            textTransform: 'none'
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="medium"
                          variant="contained"
                          startIcon={<Delete />}
                          onClick={() => handleRemoveQuizQuestion(question._id)}
                          sx={{ 
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                            textTransform: 'none'
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              borderRadius: 3,
              bgcolor: darkMode ? 'grey.900' : 'grey.50',
              border: `2px dashed ${darkMode ? 'grey.700' : 'grey.300'}`
            }}>
              <Quiz sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No quiz questions added yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setAddQuestionOpen(true);
                  setTabValue(1);
                }}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                Add Quiz Question
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Question Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4, p: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Remove Question
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to remove <strong>"{questionToDelete?.title}"</strong> from this assessment?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteQuestionLoading}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteQuestion(questionToDelete._id)} 
            color="error"
            variant="contained"
            disabled={deleteQuestionLoading}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            {deleteQuestionLoading ? 'Removing...' : 'Remove Question'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Question Form Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 1, height: '80vh' }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Edit Question - {questionToEdit?.title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 3, height: '60vh', overflow: 'auto' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={editedQuestionData?.title || ''}
                onChange={(e) => setEditedQuestionData({...editedQuestionData, title: e.target.value})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={editedQuestionData?.difficulty || ''}
                  onChange={(e) => setEditedQuestionData({...editedQuestionData, difficulty: e.target.value})}
                  label="Difficulty"
                >
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={editedQuestionData?.tags?.join(', ') || ''}
                onChange={(e) => setEditedQuestionData({...editedQuestionData, tags: e.target.value.split(',').map(t => t.trim())})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={editedQuestionData?.description || ''}
                onChange={(e) => setEditedQuestionData({...editedQuestionData, description: e.target.value})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Example Input"
                value={editedQuestionData?.example?.input || ''}
                onChange={(e) => setEditedQuestionData({...editedQuestionData, example: {...editedQuestionData?.example, input: e.target.value}})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Example Output"
                value={editedQuestionData?.example?.output || ''}
                onChange={(e) => setEditedQuestionData({...editedQuestionData, example: {...editedQuestionData?.example, output: e.target.value}})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Example Explanation"
                value={editedQuestionData?.example?.explanation || ''}
                onChange={(e) => setEditedQuestionData({...editedQuestionData, example: {...editedQuestionData?.example, explanation: e.target.value}})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Constraints (one per line)"
                value={editedQuestionData?.constraints?.join('\n') || ''}
                onChange={(e) => setEditedQuestionData({...editedQuestionData, constraints: e.target.value.split('\n').filter(c => c.trim())})}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Test Cases</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => {
                    const newTestCase = { input: '', output: '', explanation: '', isPublic: false };
                    setEditedQuestionData({
                      ...editedQuestionData,
                      testCases: [...(editedQuestionData?.testCases || []), newTestCase]
                    });
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Add Test Case
                </Button>
              </Box>
              {editedQuestionData?.testCases?.map((testCase, index) => (
                <Card key={index} sx={{ mb: 2, p: 2, position: 'relative' }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newTestCases = editedQuestionData.testCases.filter((_, i) => i !== index);
                      setEditedQuestionData({...editedQuestionData, testCases: newTestCases});
                    }}
                    sx={{ 
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Test Case {index + 1}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Input"
                        multiline
                        rows={2}
                        value={testCase.input || ''}
                        onChange={(e) => {
                          const newTestCases = [...editedQuestionData.testCases];
                          newTestCases[index].input = e.target.value;
                          setEditedQuestionData({...editedQuestionData, testCases: newTestCases});
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Output"
                        multiline
                        rows={2}
                        value={testCase.output || ''}
                        onChange={(e) => {
                          const newTestCases = [...editedQuestionData.testCases];
                          newTestCases[index].output = e.target.value;
                          setEditedQuestionData({...editedQuestionData, testCases: newTestCases});
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Explanation"
                        multiline
                        rows={2}
                        value={testCase.explanation || ''}
                        onChange={(e) => {
                          const newTestCases = [...editedQuestionData.testCases];
                          newTestCases[index].explanation = e.target.value;
                          setEditedQuestionData({...editedQuestionData, testCases: newTestCases});
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>Visibility</InputLabel>
                        <Select
                          value={testCase.isPublic ? 'public' : 'private'}
                          onChange={(e) => {
                            const newTestCases = [...editedQuestionData.testCases];
                            newTestCases[index].isPublic = e.target.value === 'public';
                            setEditedQuestionData({...editedQuestionData, testCases: newTestCases});
                          }}
                          label="Visibility"
                        >
                          <MenuItem value="public">Public</MenuItem>
                          <MenuItem value="private">Private</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            disabled={editQuestionLoading}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveQuestion}
            variant="contained"
            disabled={editQuestionLoading}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            {editQuestionLoading ? 'Saving...' : 'Save Question'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={addQuestionOpen} onClose={() => setAddQuestionOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Add Question to Assessment</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Available Questions" />
              <Tab label="Quiz Questions" />
              <Tab label="Create New Question" />
            </Tabs>
          </Box>
          
          {tabValue === 0 && (
            <Box>
              <TextField
                fullWidth
                placeholder="Search by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Grid container spacing={2}>
                {(() => {
                  const filteredQuestions = availableQuestions.filter(question =>
                    question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    question.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                  );
                  
                  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
                  const paginatedQuestions = filteredQuestions.slice(
                    (currentPage - 1) * questionsPerPage,
                    currentPage * questionsPerPage
                  );
                  
                  return (
                    <>
                      {paginatedQuestions.length === 0 ? (
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            <Code sx={{ fontSize: 48, mb: 2 }} />
                            <Typography>
                              {searchQuery ? 'No questions found matching your search.' : 'No available questions.'}
                            </Typography>
                          </Box>
                        </Grid>
                      ) : (
                        paginatedQuestions.map((question) => (
                          <Grid item xs={12} key={question._id}>
                            <Card sx={{ 
                              p: 2, 
                              border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: 'primary.main'
                              }
                            }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {question.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {question.description.substring(0, 100)}...
                                  </Typography>
                                  <Chip 
                                    label={question.difficulty} 
                                    size="small" 
                                    color={question.difficulty === 'Easy' ? 'success' : question.difficulty === 'Medium' ? 'warning' : 'error'} 
                                    sx={{ mt: 1 }} 
                                  />
                                </Box>
                                <Button 
                                  size="small" 
                                  variant={assessment?.questions?.some(aq => aq._id === question._id) ? "contained" : "outlined"}
                                  color={assessment?.questions?.some(aq => aq._id === question._id) ? "error" : "primary"}
                                  disabled={addToAssessmentLoading === question._id}
                                  onClick={() => assessment?.questions?.some(aq => aq._id === question._id) 
                                    ? removeQuestionFromAssessment(question) 
                                    : addQuestionToAssessment(question)
                                  }
                                >
                                  {addToAssessmentLoading === question._id 
                                    ? (assessment?.questions?.some(aq => aq._id === question._id) ? 'Removing...' : 'Adding...') 
                                    : (assessment?.questions?.some(aq => aq._id === question._id) ? 'Remove' : 'Add to Assessment')
                                  }
                                </Button>
                              </Box>
                            </Card>
                          </Grid>
                        ))
                      )}
                      
                      {totalPages > 1 && (
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination 
                              count={totalPages}
                              page={currentPage}
                              onChange={(e, page) => setCurrentPage(page)}
                              color="primary"
                            />
                          </Box>
                        </Grid>
                      )}
                    </>
                  );
                })()
                }
              </Grid>
            </Box>
              )}
          
              {tabValue === 1 && (
            <Box>
              <TextField
                fullWidth
                placeholder="Search quiz questions by title, topic, or tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Grid container spacing={2}>
                {(() => {
                  const filteredQuestions = availableQuizQuestions.filter(question =>
                    question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    question.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    question.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                  );
                  
                  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
                  const paginatedQuestions = filteredQuestions.slice(
                    (currentPage - 1) * questionsPerPage,
                    currentPage * questionsPerPage
                  );
                  
                  return (
                    <>
                      {paginatedQuestions.length === 0 ? (
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            <Quiz sx={{ fontSize: 48, mb: 2 }} />
                            <Typography>
                              {searchQuery ? 'No quiz questions found matching your search.' : 'No available quiz questions.'}
                            </Typography>
                          </Box>
                        </Grid>
                      ) : (
                        paginatedQuestions.map((question) => (
                          <Grid item xs={12} key={question._id}>
                            <Card sx={{ 
                              p: 2, 
                              border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: 'primary.main'
                              }
                            }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {question.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Topic: {question.topic || 'General'} | {question.options?.length || 0} options
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Chip 
                                      label={question.difficulty} 
                                      size="small" 
                                      color={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'error'} 
                                    />
                                    <Chip 
                                      label="Quiz Question" 
                                      size="small" 
                                      sx={{ bgcolor: 'info.main', color: 'white' }}
                                    />
                                  </Box>
                                </Box>
                                <Button 
                                  size="small" 
                                  variant={assessment?.quizQuestions?.some(aq => aq._id === question._id) ? "contained" : "outlined"}
                                  color={assessment?.quizQuestions?.some(aq => aq._id === question._id) ? "error" : "primary"}
                                  disabled={addToAssessmentLoading === question._id}
                                  onClick={() => assessment?.quizQuestions?.some(aq => aq._id === question._id) 
                                    ? handleRemoveQuizQuestion(question._id) 
                                    : addQuizQuestionToAssessment(question)
                                  }
                                >
                                  {addToAssessmentLoading === question._id 
                                    ? (assessment?.quizQuestions?.some(aq => aq._id === question._id) ? 'Removing...' : 'Adding...') 
                                    : (assessment?.quizQuestions?.some(aq => aq._id === question._id) ? 'Remove' : 'Add to Assessment')
                                  }
                                </Button>
                              </Box>
                            </Card>
                          </Grid>
                        ))
                      )}
                      
                      {totalPages > 1 && (
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination 
                              count={totalPages}
                              page={currentPage}
                              onChange={(e, page) => setCurrentPage(page)}
                              color="primary"
                            />
                          </Box>
                        </Grid>
                      )}
                    </>
                  );
                })()
                }
              </Grid>
            </Box>
              )}
          
              {tabValue === 2 && (
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
              
              <Box sx={{ height: '400px' }} onPaste={handleCreateJsonPaste}>
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
              )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddQuestionOpen(false)} disabled={createQuestionLoading}>Cancel</Button>
          {tabValue === 2 && (
            <Button 
              onClick={handleCreateQuestion} 
              variant="contained"
              disabled={!questionFormData || createQuestionLoading}
            >
              {createQuestionLoading ? 'Creating...' : 'Create & Add Question'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Add Frontend Question Dialog */}
      <Dialog open={addFrontendQuestionOpen} onClose={() => setAddFrontendQuestionOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Add Frontend Question to Assessment</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Available Frontend Questions" />
              <Tab label="Create Frontend Question" />
            </Tabs>
          </Box>
          
          {tabValue === 0 && (
            <Box>
              <TextField
                fullWidth
                placeholder="Search frontend questions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Grid container spacing={2}>
                {(() => {
                  const filteredQuestions = availableFrontendQuestions.filter(question =>
                    question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    question.problemStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    question.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                  );
                  
                  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
                  const paginatedQuestions = filteredQuestions.slice(
                    (currentPage - 1) * questionsPerPage,
                    currentPage * questionsPerPage
                  );
                  
                  return (
                    <>
                      {paginatedQuestions.length === 0 ? (
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            <Code sx={{ fontSize: 48, mb: 2 }} />
                            <Typography>
                              {searchQuery ? 'No frontend questions found matching your search.' : 'No available frontend questions.'}
                            </Typography>
                          </Box>
                        </Grid>
                      ) : (
                        paginatedQuestions.map((question) => (
                          <Grid item xs={12} key={question._id}>
                            <Card sx={{ 
                              p: 2, 
                              border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: 'primary.main'
                              }
                            }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {question.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {question.problemStatement.substring(0, 100)}...
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Chip 
                                      label={question.difficulty} 
                                      size="small" 
                                      color={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'error'} 
                                    />
                                    {question.tags?.slice(0, 2).map(tag => (
                                      <Chip key={tag} label={tag} size="small" sx={{ bgcolor: darkMode ? 'grey.700' : 'grey.200' }} />
                                    ))}
                                  </Box>
                                </Box>
                                <Button 
                                  size="small" 
                                  variant={assessment?.frontendQuestions?.some(aq => aq._id === question._id) ? "contained" : "outlined"}
                                  color={assessment?.frontendQuestions?.some(aq => aq._id === question._id) ? "error" : "primary"}
                                  disabled={addToAssessmentLoading === question._id}
                                  onClick={async () => {
                                    setAddToAssessmentLoading(question._id);
                                    try {
                                      const isAdded = assessment?.frontendQuestions?.some(aq => aq._id === question._id);
                                      const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}/frontend-questions${isAdded ? `/${question._id}` : ''}`, {
                                        method: isAdded ? 'DELETE' : 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                                        },
                                        body: isAdded ? undefined : JSON.stringify({ questionId: question._id })
                                      });
                                      if (response.ok) {
                                        fetchAssessment();
                                        toast.success(isAdded ? 'Frontend question removed' : 'Frontend question added');
                                      } else {
                                        toast.error('Failed to update assessment');
                                      }
                                    } catch (error) {
                                      toast.error('Error updating assessment');
                                    } finally {
                                      setAddToAssessmentLoading(null);
                                    }
                                  }}
                                >
                                  {addToAssessmentLoading === question._id 
                                    ? (assessment?.frontendQuestions?.some(aq => aq._id === question._id) ? 'Removing...' : 'Adding...') 
                                    : (assessment?.frontendQuestions?.some(aq => aq._id === question._id) ? 'Remove' : 'Add to Assessment')
                                  }
                                </Button>
                              </Box>
                            </Card>
                          </Grid>
                        ))
                      )}
                      
                      {totalPages > 1 && (
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination 
                              count={totalPages}
                              page={currentPage}
                              onChange={(e, page) => setCurrentPage(page)}
                              color="primary"
                            />
                          </Box>
                        </Grid>
                      )}
                    </>
                  );
                })()
                }
              </Grid>
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Paste your frontend question JSON data below:
                </Typography>
              </Box>
              
              <Box sx={{ height: '400px' }}>
                <JSONInput
                  id='frontend-json-editor'
                  placeholder={{
                    title: 'Build a Todo App',
                    problemStatement: 'Create a simple todo application',
                    requirements: ['Add new todos', 'Mark todos as complete'],
                    acceptanceCriteria: ['User can add todos', 'User can mark complete'],
                    jestTestFile: 'test code here',
                    difficulty: 'Easy',
                    tags: ['React', 'JavaScript']
                  }}
                  locale={locale}
                  height='100%'
                  width='100%'
                  onChange={(data) => {
                    if (!data.error) {
                      setQuestionFormData(data.jsObject);
                    }
                  }}
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFrontendQuestionOpen(false)} disabled={createQuestionLoading}>Cancel</Button>
          {tabValue === 1 && (
            <Button 
              onClick={async () => {
                if (!questionFormData) {
                  toast.error('Please provide question data');
                  return;
                }
                setCreateQuestionLoading(true);
                try {
                  const response = await fetch('http://localhost:4000/api/frontend-questions', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(questionFormData)
                  });
                  if (response.ok) {
                    toast.success('Frontend question created successfully');
                    setAddFrontendQuestionOpen(false);
                    setQuestionFormData(null);
                    fetchAssessment();
                  } else {
                    toast.error('Failed to create frontend question');
                  }
                } catch (error) {
                  toast.error('Error creating frontend question');
                } finally {
                  setCreateQuestionLoading(false);
                }
              }}
              variant="contained"
              disabled={!questionFormData || createQuestionLoading}
            >
              {createQuestionLoading ? 'Creating...' : 'Create & Add Question'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Run Code Dialog */}
      <Dialog open={runCodeOpen} onClose={() => setRunCodeOpen(false)} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: darkMode ? '#1e293b' : 'primary.main', 
          color: 'white', 
          py: 3,
          background: darkMode 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Code sx={{ fontSize: '2rem' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Test Code - {selectedQuestionForRun?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: darkMode ? '#0f172a' : '#ffffff' }}>
          <Grid container sx={{ height: '75vh' }}>
            <Grid item xs={12} md={6} sx={{ 
              borderRight: `1px solid ${darkMode ? '#334155' : '#e0e0e0'}`,
              bgcolor: darkMode ? '#1e293b' : '#ffffff'
            }}>
              <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>
                    Code Editor
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ color: darkMode ? '#94a3b8' : 'inherit' }}>Language</InputLabel>
                    <Select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      label="Language"
                      sx={{
                        color: darkMode ? '#ffffff' : '#000000',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? '#475569' : '#e0e0e0'
                        },
                        '& .MuiSvgIcon-root': {
                          color: darkMode ? '#94a3b8' : 'inherit'
                        }
                      }}
                    >
                      <MenuItem value="python">Python</MenuItem>
                      <MenuItem value="cpp">C++</MenuItem>
                      <MenuItem value="java">Java</MenuItem>
                      <MenuItem value="c">C</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={22}
                  placeholder="Write your code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  sx={{ 
                    flexGrow: 1,
                    '& .MuiInputBase-input': { 
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      color: darkMode ? '#ffffff' : '#000000',
                      bgcolor: darkMode ? '#0f172a' : '#ffffff'
                    },
                    '& .MuiOutlinedInput-root': {
                      height: '100%',
                      alignItems: 'flex-start',
                      bgcolor: darkMode ? '#0f172a' : '#ffffff',
                      '& fieldset': {
                        borderColor: darkMode ? '#475569' : '#e0e0e0'
                      },
                      '&:hover fieldset': {
                        borderColor: darkMode ? '#64748b' : '#b0b0b0'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: darkMode ? '#3b82f6' : '#1976d2'
                      }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  size="large"
                  startIcon={runningTests ? null : <Code />}
                  onClick={executeCode}
                  disabled={runningTests || !code.trim()}
                  sx={{ 
                    mt: 3, 
                    py: 2, 
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    bgcolor: darkMode ? '#3b82f6' : 'primary.main',
                    '&:hover': {
                      bgcolor: darkMode ? '#2563eb' : 'primary.dark'
                    },
                    '&:disabled': {
                      bgcolor: darkMode ? '#374151' : '#e0e0e0'
                    }
                  }}
                >
                  {runningTests ? 'Running Tests...' : 'Run All Tests'}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ bgcolor: darkMode ? '#1e293b' : '#f8fafc', height: '75vh', overflow: 'auto' }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>
                  Test Results
                </Typography>
                {testResults.length > 0 ? (
                  <Box>
                    {testResults.map((result, index) => (
                      <Card 
                        key={index} 
                        sx={{ 
                          mb: 2, 
                          border: `2px solid ${result.isCorrect ? '#22c55e' : '#ef4444'}`,
                          bgcolor: result.isCorrect 
                            ? (darkMode ? '#064e3b' : '#f0fdf4') 
                            : (darkMode ? '#7f1d1d' : '#fef2f2'),
                          borderRadius: 3,
                          boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 600,
                              color: darkMode ? '#ffffff' : '#000000'
                            }}>
                              Test Case {index + 1}
                            </Typography>
                            <Chip 
                              label={result.isCorrect ? 'PASS' : 'FAIL'}
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                bgcolor: result.isCorrect ? '#22c55e' : '#ef4444',
                                color: 'white',
                                px: 2
                              }}
                            />
                          </Box>
                          <Box sx={{ 
                            bgcolor: darkMode ? '#0f172a' : '#ffffff', 
                            p: 2.5, 
                            borderRadius: 2, 
                            border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
                            mb: 1 
                          }}>
                            <Typography variant="body2" sx={{ mb: 1.5, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                              <Box component="span" sx={{ 
                                fontWeight: 700, 
                                color: darkMode ? '#60a5fa' : '#1976d2',
                                display: 'inline-block',
                                minWidth: '70px'
                              }}>Input:</Box> 
                              <Box component="span" sx={{ color: darkMode ? '#e2e8f0' : '#374151', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                                {result.input}
                              </Box>
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1.5, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                              <Box component="span" sx={{ 
                                fontWeight: 700, 
                                color: darkMode ? '#34d399' : '#059669',
                                display: 'inline-block',
                                minWidth: '70px'
                              }}>Expected:</Box> 
                              <Box component="span" sx={{ color: darkMode ? '#e2e8f0' : '#374151', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                                {result.output}
                              </Box>
                            </Typography>
                            <Typography variant="body2" sx={{ mb: result.error ? 1.5 : 0, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                              <Box component="span" sx={{ 
                                fontWeight: 700, 
                                color: result.isCorrect 
                                  ? (darkMode ? '#34d399' : '#059669') 
                                  : (darkMode ? '#f87171' : '#dc2626'),
                                display: 'inline-block',
                                minWidth: '70px'
                              }}>Actual:</Box> 
                              <Box component="span" sx={{ color: darkMode ? '#e2e8f0' : '#374151', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                                {result.actualOutput}
                              </Box>
                            </Typography>
                            {result.error && (
                              <Typography variant="body2" sx={{ 
                                color: darkMode ? '#f87171' : '#dc2626', 
                                fontFamily: 'monospace',
                                fontSize: '0.9rem',
                                bgcolor: darkMode ? '#7f1d1d' : '#fef2f2',
                                p: 1.5,
                                borderRadius: 1,
                                border: `1px solid ${darkMode ? '#991b1b' : '#fecaca'}`
                              }}>
                                <Box component="span" sx={{ fontWeight: 700 }}>Error:</Box> {result.error}
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '60%',
                    color: darkMode ? '#64748b' : 'text.secondary',
                    textAlign: 'center'
                  }}>
                    <Code sx={{ fontSize: 80, mb: 3, opacity: 0.3 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      No test results yet
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                      Write your code and click "Run All Tests" to see results
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          bgcolor: darkMode ? '#334155' : '#f8fafc',
          borderTop: `1px solid ${darkMode ? '#475569' : '#e5e7eb'}`
        }}>
          <Button 
            onClick={() => setRunCodeOpen(false)} 
            size="large"
            sx={{ 
              px: 4,
              py: 1.5,
              fontWeight: 600,
              color: darkMode ? '#94a3b8' : 'text.secondary',
              '&:hover': {
                bgcolor: darkMode ? '#475569' : 'action.hover'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Assessment Dialog */}
      <Dialog open={editAssessmentOpen} onClose={() => setEditAssessmentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Assessment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={assessmentEditData.title}
              onChange={(e) => setAssessmentEditData({...assessmentEditData, title: e.target.value})}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={assessmentEditData.description}
              onChange={(e) => setAssessmentEditData({...assessmentEditData, description: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditAssessmentOpen(false)}>Cancel</Button>
          <Button 
            onClick={async () => {
              try {
                const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify(assessmentEditData)
                });
                if (response.ok) {
                  setAssessment({...assessment, ...assessmentEditData});
                  setEditAssessmentOpen(false);
                  toast.success('Assessment updated successfully');
                } else {
                  toast.error('Failed to update assessment');
                }
              } catch (error) {
                toast.error('Error updating assessment');
              }
            }} 
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Quiz Question Dialog */}
      <Dialog open={editQuizDialogOpen} onClose={() => setEditQuizDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Quiz Question</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={editedQuizData?.title || ''}
                onChange={(e) => setEditedQuizData({...editedQuizData, title: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Language"
                value={editedQuizData?.language || ''}
                onChange={(e) => setEditedQuizData({...editedQuizData, language: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Topic"
                value={editedQuizData?.topic || ''}
                onChange={(e) => setEditedQuizData({...editedQuizData, topic: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Code Snippet (optional)"
                value={editedQuizData?.codeSnippet || ''}
                onChange={(e) => setEditedQuizData({...editedQuizData, codeSnippet: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={editedQuizData?.difficulty || ''}
                  onChange={(e) => setEditedQuizData({...editedQuizData, difficulty: e.target.value})}
                  label="Difficulty"
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Correct Answer</InputLabel>
                <Select
                  value={editedQuizData?.correctAnswer || 0}
                  onChange={(e) => setEditedQuizData({...editedQuizData, correctAnswer: e.target.value})}
                  label="Correct Answer"
                >
                  <MenuItem value={0}>Option 1</MenuItem>
                  <MenuItem value={1}>Option 2</MenuItem>
                  <MenuItem value={2}>Option 3</MenuItem>
                  <MenuItem value={3}>Option 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {[0, 1, 2, 3].map((index) => (
              <Grid item xs={6} key={index}>
                <TextField
                  fullWidth
                  label={`Option ${index + 1}`}
                  value={editedQuizData?.options?.[index]?.text || ''}
                  onChange={(e) => {
                    const newOptions = [...(editedQuizData?.options || [])];
                    newOptions[index] = { text: e.target.value, image: '' };
                    setEditedQuizData({...editedQuizData, options: newOptions});
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditQuizDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveQuizQuestion} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewAssessment;