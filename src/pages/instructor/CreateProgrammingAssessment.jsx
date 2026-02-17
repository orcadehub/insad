import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  TextField,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Pagination,
  InputAdornment,
  Paper
} from '@mui/material';
import { ArrowBack, Code, Add, Search, People } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useTenant } from '../../contexts/TenantContext';
import toast from 'react-hot-toast';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

const CreateProgrammingAssessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const { selectedTenant } = useTenant();
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  const [createQuestionOpen, setCreateQuestionOpen] = useState(false);
  const [createQuestionLoading, setCreateQuestionLoading] = useState(false);
  const [createAssessmentLoading, setCreateAssessmentLoading] = useState(false);
  const [viewQuestionOpen, setViewQuestionOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    difficulty: 'medium',
    programmingLanguages: [],
    problems: []
  });
  const [questionForm, setQuestionForm] = useState(null);
  const sampleQuestionJson = {
    "title": "Two Sum Problem",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    "difficulty": "Easy",
    "constraints": [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists"
    ],
    "testCases": [
      {
        "input": "2 7 11 15\n9",
        "output": "0 1",
        "explanation": "Basic case with solution at beginning",
        "isPublic": true
      },
      {
        "input": "3 2 4\n6",
        "output": "1 2",
        "explanation": "Solution in middle of array",
        "isPublic": true
      }
    ],
    "tags": ["Array", "Hash Table"],
    "assessmentType": "programming",
    "example": {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    "intuition": {
      "approach": "Hash Map",
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "keyInsights": [
        "Use hash map to store complement values",
        "Single pass through array",
        "For each element, check if target-element exists in map"
      ],
      "algorithmSteps": [
        "Create hash map to store value -> index",
        "For each number, calculate complement = target - current number",
        "If complement exists in map, return [map[complement], current_index]",
        "Otherwise, store current number and index in map"
      ]
    },
    "isActive": true
  };

  const steps = ['Basic Info', 'Programming Problems', 'Review & Create'];
  const assessmentType = location.state?.assessmentType;

  useEffect(() => {
    if (selectedTenant) {
      fetchAvailableQuestions();
    }
  }, [selectedTenant]);

  const fetchAvailableQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/assessment-questions?type=programming&tenantId=${selectedTenant._id}`, {
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

  const handleCreateQuestion = async () => {
    if (!questionForm) return;
    
    setCreateQuestionLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/assessment-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...questionForm,
          assessmentType: 'programming'
        })
      });
      
      if (response.ok) {
        toast.success('Question created successfully');
        setCreateQuestionOpen(false);
        setQuestionForm(null);
        fetchAvailableQuestions();
      } else {
        toast.error('Failed to create question');
      }
    } catch (error) {
      toast.error('Error creating question');
    } finally {
      setCreateQuestionLoading(false);
    }
  };

  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setViewQuestionOpen(true);
  };

  const addQuestionToAssessment = (question) => {
    if (!formData.problems.find(p => p._id === question._id)) {
      setFormData(prev => ({
        ...prev,
        problems: [...prev.problems, question]
      }));
      toast.success('Question added to assessment');
    }
  };

  // Filter and paginate questions
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

  const removeQuestionFromAssessment = (questionId) => {
    setFormData(prev => ({
      ...prev,
      problems: prev.problems.filter(p => p._id !== questionId)
    }));
    toast.success('Question removed from assessment');
  };

  const handleCreateAssessment = async () => {
    setCreateAssessmentLoading(true);
    try {
      const assessmentData = {
        title: formData.title,
        description: formData.description,
        type: 'programming',
        duration: formData.duration,
        difficulty: formData.difficulty,
        questions: formData.problems.map(p => p._id),
        batches: location.state?.selectedBatches === 'all' ? 'all' : location.state?.selectedBatches || [],
        isActive: true,
        tenantId: selectedTenant._id
      };

      const response = await fetch('http://localhost:4000/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(assessmentData)
      });

      if (response.ok) {
        toast.success('Assessment created successfully!');
        navigate('/instructor/assessments');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create assessment');
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error('Error creating assessment');
    } finally {
      setCreateAssessmentLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assessment Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                sx={{ mb: 3 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                sx={{ mb: 3 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Duration (minutes)"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                inputProps={{ min: 30, max: 300 }}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>
                Programming Problems
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setCreateQuestionOpen(true)}
                sx={{ px: 3 }}
              >
                Create Question
              </Button>
            </Box>
            
            <Card sx={{ p: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label={`Available Questions (${availableQuestions.length})`} />
                <Tab label={`Selected Questions (${formData.problems.length})`} />
              </Tabs>
              
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
                    {paginatedQuestions.length === 0 ? (
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                          <Code sx={{ fontSize: 48, mb: 2 }} />
                          <Typography>
                            {searchQuery ? 'No questions found matching your search.' : 'No questions available. Create your first question!'}
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
                              <Box display="flex" gap={1}>
                                <Button 
                                  size="small" 
                                  variant="text"
                                  onClick={() => handleViewQuestion(question)}
                                >
                                  View
                                </Button>
                                <Button 
                                  size="small" 
                                  variant="outlined"
                                  onClick={() => addQuestionToAssessment(question)}
                                  disabled={formData.problems.find(p => p._id === question._id)}
                                >
                                  {formData.problems.find(p => p._id === question._id) ? 'Added' : 'Add to Assessment'}
                                </Button>
                              </Box>
                            </Box>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                  
                  {totalPages > 1 && (
                    <Box display="flex" justifyContent="center" mt={3}>
                      <Pagination 
                        count={totalPages}
                        page={currentPage}
                        onChange={(e, page) => setCurrentPage(page)}
                        color="primary"
                      />
                    </Box>
                  )}
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box>
                  {formData.problems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <Code sx={{ fontSize: 48, mb: 2 }} />
                      <Typography>No questions selected yet</Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {formData.problems.map((problem) => (
                        <Grid item xs={12} key={problem._id}>
                          <Card sx={{ p: 2, bgcolor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {problem.title}
                                </Typography>
                                <Chip 
                                  label={problem.difficulty} 
                                  size="small" 
                                  color={problem.difficulty === 'Easy' ? 'success' : problem.difficulty === 'Medium' ? 'warning' : 'error'}
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                              <Button 
                                size="small" 
                                color="error"
                                onClick={() => removeQuestionFromAssessment(problem._id)}
                              >
                                Remove
                              </Button>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}
            </Card>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
              Review Assessment
            </Typography>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Assessment Details
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Title:</strong> {formData.title || 'Untitled Assessment'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Duration:</strong> {formData.duration} minutes
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Type:</strong> Programming Assessment
              </Typography>
              <Typography variant="body2">
                <strong>Problems:</strong> {formData.problems.length} problems added
              </Typography>
            </Card>
          </Box>
        );
      default:
        return null;
    }
  };

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
        
        <Box display="flex" alignItems="center" gap={2} mb={3} sx={{ position: 'relative', zIndex: 1 }}>
          <IconButton 
            onClick={() => navigate('/instructor/create-assessment', { state: location.state })}
            sx={{ 
              mr: 2, 
              color: 'white', 
              bgcolor: 'rgba(255,255,255,0.2)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ 
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <Code sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 800, 
              mb: 1
            }}>
              Create Programming Assessment
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Design coding challenges and algorithm problems
            </Typography>
          </Box>
          <Chip 
            label="PROGRAMMING" 
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

      {/* Selected Batches Info */}
      {location.state?.selectedBatches && (
        <Card sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 4,
          border: 'none',
          boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center' }}>
            <People sx={{ mr: 2, color: 'primary.main' }} />
            Target Batches
          </Typography>
          <Chip 
            label={location.state.selectedBatches === 'all' 
              ? 'All Batches' 
              : `${location.state.selectedBatches.length} batches selected`
            }
            sx={{ 
              fontWeight: 600,
              fontSize: '0.9rem',
              height: 36,
              bgcolor: 'primary.main',
              color: 'white'
            }}
          />
        </Card>
      )}

      {/* Stepper */}
      <Card sx={{ 
        mb: 4, 
        p: 4, 
        borderRadius: 4,
        border: 'none',
        boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{
                '& .MuiStepLabel-label': {
                  fontWeight: 600,
                  fontSize: '1rem'
                }
              }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      {/* Step Content */}
      <Card sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 4,
        border: 'none',
        boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        {renderStepContent()}
      </Card>

      {/* Navigation Buttons */}
      <Card sx={{ 
        p: 4, 
        borderRadius: 4,
        border: 'none',
        boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <Box display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleCreateAssessment : handleNext}
            disabled={activeStep === 0 && (!formData.title || !formData.description) || 
                     activeStep === 1 && formData.problems.length === 0 ||
                     createAssessmentLoading}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 3
            }}
          >
            {activeStep === steps.length - 1 ? (createAssessmentLoading ? 'Creating...' : 'Create Assessment') : 'Next'}
          </Button>
        </Box>
      </Card>

      {/* View Question Dialog */}
      <Dialog open={viewQuestionOpen} onClose={() => setViewQuestionOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa',
          borderBottom: '1px solid',
          borderColor: darkMode ? '#444' : '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Code sx={{ color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {selectedQuestion?.title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedQuestion && (
            <Box sx={{ 
              p: 4, 
              pb: 12, 
              bgcolor: 'transparent', 
              color: darkMode ? '#ffffff' : '#000000', 
              maxWidth: '100%', 
              mx: 'auto'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: darkMode ? '#ffffff' : '#000000' }}>
                  {selectedQuestion.title}
                </Typography>
                <Chip 
                  label={selectedQuestion.difficulty}
                  sx={{
                    bgcolor: selectedQuestion.difficulty === 'Easy' ? '#4caf50' : 
                             selectedQuestion.difficulty === 'Medium' ? '#ff9800' : '#f44336',
                    color: 'white',
                    fontWeight: 600
                  }}
                  size="medium"
                />
              </Box>
            
              {/* Description */}
              <Box sx={{ mb: 5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: darkMode ? '#90caf9' : 'primary.main' }}>
                  Problem Statement
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.2rem', whiteSpace: 'pre-line' }}>
                  {selectedQuestion.description}
                </Typography>
              </Box>

              {/* Constraints */}
              {selectedQuestion.constraints && selectedQuestion.constraints.length > 0 && (
                <Box sx={{ mb: 5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: darkMode ? '#90caf9' : 'primary.main' }}>
                    Constraints
                  </Typography>
                  <Box component="ul" sx={{ pl: 3, m: 0 }}>
                    {selectedQuestion.constraints.map((constraint, index) => (
                      <Typography component="li" key={index} variant="body1" sx={{ mb: 1, fontSize: '1.1rem', lineHeight: 1.6 }}>
                        {constraint}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Example */}
              {selectedQuestion.example && (
                <Box sx={{ mb: 5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: darkMode ? '#90caf9' : 'primary.main' }}>
                    Example
                  </Typography>
                  <Box sx={{ bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa', border: '1px solid', borderColor: darkMode ? '#444' : 'divider', p: 3, borderRadius: 2, mb: 3, color: darkMode ? '#ffffff' : '#000000' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Input:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: 1.5 }}>
                      {selectedQuestion.example.input}
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa', border: '1px solid', borderColor: darkMode ? '#444' : 'divider', p: 3, borderRadius: 2, mb: 3, color: darkMode ? '#ffffff' : '#000000' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Output:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: 1.5 }}>
                      {selectedQuestion.example.output}
                    </Typography>
                  </Box>
                  {selectedQuestion.example.explanation && (
                    <Box sx={{ bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa', border: '1px solid', borderColor: darkMode ? '#444' : 'divider', p: 3, borderRadius: 2, color: darkMode ? '#ffffff' : '#000000' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Explanation:
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                        {selectedQuestion.example.explanation}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Tags */}
              {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                <Box sx={{ mb: 5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: darkMode ? '#90caf9' : 'primary.main' }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedQuestion.tags.map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        size="small" 
                        sx={{ 
                          bgcolor: darkMode ? '#444' : '#e0e0e0',
                          color: darkMode ? '#ffffff' : '#000000'
                        }} 
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Test Cases */}
              {selectedQuestion.testCases && selectedQuestion.testCases.length > 0 && (
                <Box sx={{ mb: 5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: darkMode ? '#90caf9' : 'primary.main' }}>
                    Test Cases
                  </Typography>
                  {selectedQuestion.testCases.map((testCase, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Test Case {index + 1}
                        </Typography>
                        <Chip 
                          label={testCase.isPublic ? 'Public' : 'Private'} 
                          size="small" 
                          color={testCase.isPublic ? 'success' : 'default'}
                        />
                      </Box>
                      
                      <Box sx={{ bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa', border: '1px solid', borderColor: darkMode ? '#444' : 'divider', p: 3, borderRadius: 2, mb: 2, color: darkMode ? '#ffffff' : '#000000' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: darkMode ? '#b0b0b0' : 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '1rem' }}>
                          Input
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: 1.5 }}>
                          {testCase.input}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa', border: '1px solid', borderColor: darkMode ? '#444' : 'divider', p: 3, borderRadius: 2, mb: 2, color: darkMode ? '#ffffff' : '#000000' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: darkMode ? '#b0b0b0' : 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '1rem' }}>
                          Expected Output
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: 1.5 }}>
                          {testCase.output}
                        </Typography>
                      </Box>
                      
                      {testCase.explanation && (
                        <Box sx={{ bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa', border: '1px solid', borderColor: darkMode ? '#444' : 'divider', p: 3, borderRadius: 2, color: darkMode ? '#ffffff' : '#000000' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: darkMode ? '#b0b0b0' : 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '1rem' }}>
                            Explanation
                          </Typography>
                          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                            {testCase.explanation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              {/* Intuition */}
              {selectedQuestion.intuition && (
                <Box sx={{ mb: 5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: darkMode ? '#90caf9' : 'primary.main' }}>
                    Approach
                  </Typography>
                  
                  <Box sx={{ bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa', border: '1px solid', borderColor: darkMode ? '#444' : 'divider', p: 3, borderRadius: 2, mb: 3, color: darkMode ? '#ffffff' : '#000000' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Approach:
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {selectedQuestion.intuition.approach}
                    </Typography>
                  </Box>
                  
                  {selectedQuestion.intuition.keyInsights && selectedQuestion.intuition.keyInsights.length > 0 && (
                    <Box sx={{ bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa', border: '1px solid', borderColor: darkMode ? '#444' : 'divider', p: 3, borderRadius: 2, mb: 3, color: darkMode ? '#ffffff' : '#000000' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Key Insights:
                      </Typography>
                      <Box component="ul" sx={{ pl: 3, m: 0 }}>
                        {selectedQuestion.intuition.keyInsights.map((insight, index) => (
                          <Typography component="li" key={index} variant="body1" sx={{ mb: 1, fontSize: '1.1rem', lineHeight: 1.6 }}>
                            {insight}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {selectedQuestion.intuition.algorithmSteps && selectedQuestion.intuition.algorithmSteps.length > 0 && (
                    <Box sx={{ bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa', border: '1px solid', borderColor: darkMode ? '#444' : 'divider', p: 3, borderRadius: 2, mb: 3, color: darkMode ? '#ffffff' : '#000000' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Algorithm Steps:
                      </Typography>
                      <Box component="ol" sx={{ pl: 3, m: 0 }}>
                        {selectedQuestion.intuition.algorithmSteps.map((step, index) => (
                          <Typography component="li" key={index} variant="body1" sx={{ mb: 1, fontSize: '1.1rem', lineHeight: 1.6 }}>
                            {step}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Box sx={{ bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa', border: '1px solid', borderColor: darkMode ? '#444' : 'divider', p: 3, borderRadius: 2, color: darkMode ? '#ffffff' : '#000000' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Time Complexity:
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#4caf50' }}>
                        {selectedQuestion.intuition.timeComplexity}
                      </Typography>
                    </Box>
                    <Box sx={{ bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa', border: '1px solid', borderColor: darkMode ? '#444' : 'divider', p: 3, borderRadius: 2, color: darkMode ? '#ffffff' : '#000000' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Space Complexity:
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#ff9800' }}>
                        {selectedQuestion.intuition.spaceComplexity}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewQuestionOpen(false)} variant="outlined" sx={{ px: 4 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Question Dialog */}
      <Dialog open={createQuestionOpen} onClose={() => setCreateQuestionOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Create Programming Question</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Paste your question JSON data below. Use this sample format:
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setQuestionForm(sampleQuestionJson)}
            >
              Load Sample JSON
            </Button>
          </Box>
          
          <Box sx={{ height: '400px' }} onPaste={(event) => {
            const pastedText = event.clipboardData.getData('text');
            try {
              const parsedJson = JSON.parse(pastedText);
              setQuestionForm(parsedJson);
            } catch (error) {
              // If it's not valid JSON, let the editor handle it normally
            }
          }}>
            <JSONInput
              id='question-json-editor'
              placeholder={sampleQuestionJson}
              locale={locale}
              height='100%'
              width='100%'
              onChange={(data) => {
                if (!data.error) {
                  setQuestionForm(data.jsObject);
                }
              }}
              theme={darkMode ? 'dark_vscode_tribute' : 'light_mitsuketa_tribute'}
              style={{
                body: {
                  fontSize: '14px',
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateQuestionOpen(false)} disabled={createQuestionLoading}>Cancel</Button>
          <Button 
            onClick={handleCreateQuestion} 
            variant="contained"
            disabled={!questionForm || createQuestionLoading}
          >
            {createQuestionLoading ? 'Creating...' : 'Create Question'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateProgrammingAssessment;