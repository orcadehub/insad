import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  Card,
  CardContent,
  IconButton,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ArrowBack, Add, Delete, Code, Image } from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import api from '../../services/api/apiClient';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedTenant } = useTenant();
  const { darkMode } = useTheme();
  const { selectedBatches = [], selectedStudents = [], batches = [], students = [] } = location.state || {};
  
  const [tabValue, setTabValue] = useState(0);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    duration: 30,
    maxTabSwitches: 3
  });
  
  const [questions, setQuestions] = useState([]);
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [selectedExistingQuestions, setSelectedExistingQuestions] = useState([]);
  
  const [excelFile, setExcelFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [failedImports, setFailedImports] = useState([]);
  const [showFailedModal, setShowFailedModal] = useState(false);
  
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [hoveredQuestion, setHoveredQuestion] = useState(null);
  
  const [customLanguage, setCustomLanguage] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    codeSnippet: '',
    image: '',
    language: '',
    topic: '',
    options: [
      { text: '', image: '' },
      { text: '', image: '' },
      { text: '', image: '' },
      { text: '', image: '' }
    ],
    correctAnswer: 0,
    difficulty: 'medium'
  });

  useEffect(() => {
    if (selectedTenant) {
      fetchExistingQuestions();
    }
  }, [selectedTenant]);

  const fetchExistingQuestions = async () => {
    try {
      const response = await api.get(`/quiz-questions?tenantId=${selectedTenant._id}`);
      setExistingQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const addNewQuestion = async () => {
    try {
      const response = await api.post('/quiz-questions', {
        ...newQuestion,
        language: newQuestion.language === 'other' ? customLanguage : newQuestion.language,
        topic: newQuestion.topic === 'other' ? customTopic : newQuestion.topic,
        tenantId: selectedTenant._id
      });

      setQuestions([...questions, response.data.question]);
      setNewQuestion({
        title: '',
        codeSnippet: '',
        image: '',
        language: '',
        topic: '',
        options: [
          { text: '', image: '' },
          { text: '', image: '' },
          { text: '', image: '' },
          { text: '', image: '' }
        ],
        correctAnswer: 0,
        difficulty: 'medium'
      });
      setCustomLanguage('');
      setCustomTopic('');
      toast.success('Question added successfully!');
      fetchExistingQuestions();
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err.msg));
      } else {
        toast.error(error.response?.data?.message || 'Failed to add question');
      }
    }
  };

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setExcelFile(file);
    }
  };

  const importFromExcel = async () => {
    if (!excelFile) return;
    
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('excel', excelFile);
      formData.append('tenantId', selectedTenant._id);

      const response = await api.post('/quiz-questions/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setQuestions([...questions, ...response.data.questions]);
      
      if (response.data.failedCount > 0) {
        setFailedImports(response.data.failedQuestions);
        setShowFailedModal(true);
        toast.success(`Imported ${response.data.successCount} questions. ${response.data.failedCount} failed - check details.`);
      } else {
        toast.success(`Imported ${response.data.questions.length} questions from Excel!`);
      }
      
      setExcelFile(null);
      document.getElementById('excel-upload').value = '';
      fetchExistingQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error importing from Excel');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExistingQuestionSelect = (questionId) => {
    setSelectedExistingQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const addSelectedQuestions = () => {
    const selected = existingQuestions.filter(q => selectedExistingQuestions.includes(q._id));
    setQuestions([...questions, ...selected]);
    setSelectedExistingQuestions([]);
    toast.success(`${selected.length} questions added to quiz!`);
  };

  const updateNewQuestionOption = (optionIndex, field, value) => {
    // Handle multi-line paste for options
    if (field === 'text' && value.includes('\n')) {
      const lines = value.split('\n').filter(line => line.trim());
      const updatedOptions = [...newQuestion.options];
      
      lines.forEach((line, index) => {
        if (optionIndex + index < 4) {
          updatedOptions[optionIndex + index] = {
            ...updatedOptions[optionIndex + index],
            text: line.trim()
          };
        }
      });
      
      setNewQuestion({
        ...newQuestion,
        options: updatedOptions
      });
    } else {
      setNewQuestion({
        ...newQuestion,
        options: newQuestion.options.map((opt, idx) => 
          idx === optionIndex ? { ...opt, [field]: value } : opt
        )
      });
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizData.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    if (!quizData.description.trim()) {
      toast.error('Quiz description is required');
      return;
    }
    if (!quizData.duration || quizData.duration < 1) {
      toast.error('Quiz duration must be at least 1 minute');
      return;
    }
    if (questions.length === 0 && selectedExistingQuestions.length === 0) {
      toast.error('Please add at least one question to the quiz');
      return;
    }

    try {
      await api.post('/quizzes', {
        title: quizData.title,
        description: quizData.description,
        duration: quizData.duration,
        maxTabSwitches: quizData.maxTabSwitches,
        questions: [...questions.map(q => q._id), ...selectedExistingQuestions],
        batches: selectedBatches,
        students: selectedStudents,
        tenant: selectedTenant._id
      });

      toast.success('Quiz created successfully!');
      navigate('/instructor/quizzes');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating quiz');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            background: darkMode 
              ? 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)'
              : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            Add Quiz Questions
          </Typography>
        </Box>
      </Box>

      {/* Questions Section */}
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.12)',
        border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)} 
            sx={{ 
              mb: 4,
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem'
              }
            }}
          >
            <Tab label="Create New Question" />
            <Tab label="Use Existing Questions" />
            <Tab label="Import from Excel" />
          </Tabs>

          {/* Create New Question Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 3 }}>
                Create New Question
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={newQuestion.language}
                      onChange={(e) => setNewQuestion({...newQuestion, language: e.target.value})}
                      label="Language"
                    >
                      <MenuItem value="javascript">JavaScript</MenuItem>
                      <MenuItem value="python">Python</MenuItem>
                      <MenuItem value="java">Java</MenuItem>
                      <MenuItem value="cpp">C++</MenuItem>
                      <MenuItem value="csharp">C#</MenuItem>
                      <MenuItem value="php">PHP</MenuItem>
                      <MenuItem value="ruby">Ruby</MenuItem>
                      <MenuItem value="go">Go</MenuItem>
                      <MenuItem value="rust">Rust</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  {newQuestion.language === 'other' && (
                    <TextField
                      fullWidth
                      label="Custom Language"
                      value={customLanguage}
                      onChange={(e) => setCustomLanguage(e.target.value)}
                      sx={{ mt: 2 }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Topic</InputLabel>
                    <Select
                      value={newQuestion.topic}
                      onChange={(e) => setNewQuestion({...newQuestion, topic: e.target.value})}
                      label="Topic"
                    >
                      <MenuItem value="basics">Programming Basics</MenuItem>
                      <MenuItem value="data-structures">Data Structures</MenuItem>
                      <MenuItem value="algorithms">Algorithms</MenuItem>
                      <MenuItem value="oop">Object-Oriented Programming</MenuItem>
                      <MenuItem value="web-development">Web Development</MenuItem>
                      <MenuItem value="database">Database</MenuItem>
                      <MenuItem value="networking">Networking</MenuItem>
                      <MenuItem value="security">Security</MenuItem>
                      <MenuItem value="testing">Testing</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  {newQuestion.topic === 'other' && (
                    <TextField
                      fullWidth
                      label="Custom Topic"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      sx={{ mt: 2 }}
                    />
                  )}
                </Grid>
              </Grid>
              
              <TextField
                fullWidth
                label="Question Title"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Code Snippet (Optional)"
                multiline
                rows={4}
                value={newQuestion.codeSnippet}
                onChange={(e) => setNewQuestion({...newQuestion, codeSnippet: e.target.value})}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <Code className="mr-2" />
                }}
              />
              
              <TextField
                fullWidth
                label="Image URL (Optional)"
                value={newQuestion.image}
                onChange={(e) => setNewQuestion({...newQuestion, image: e.target.value})}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: <Image className="mr-2" />
                }}
              />

              <Typography variant="subtitle2" sx={{ mb: 2 }}>Options:</Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {newQuestion.options.map((option, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2 }}>Option {index + 1}</Typography>
                      <TextField
                        fullWidth
                        label="Text"
                        value={option.text}
                        onChange={(e) => updateNewQuestionOption(index, 'text', e.target.value)}
                        onPaste={(e) => {
                          const pastedText = e.clipboardData.getData('text');
                          if (pastedText.includes('\n')) {
                            e.preventDefault();
                            updateNewQuestionOption(index, 'text', pastedText);
                          }
                        }}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Image URL (Optional)"
                        value={option.image}
                        onChange={(e) => updateNewQuestionOption(index, 'image', e.target.value)}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Correct Answer</InputLabel>
                    <Select
                      value={newQuestion.correctAnswer}
                      onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                      label="Correct Answer"
                    >
                      {newQuestion.options.map((option, index) => (
                        <MenuItem key={index} value={index}>
                          Option {index + 1}: {option.text || 'Empty'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                      label="Difficulty"
                    >
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="outlined"
                onClick={addNewQuestion}
                startIcon={<Add />}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: darkMode ? '#60a5fa' : '#2563eb',
                  color: darkMode ? '#60a5fa' : '#2563eb',
                  '&:hover': {
                    borderColor: darkMode ? '#3b82f6' : '#1d4ed8',
                    backgroundColor: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)'
                  }
                }}
              >
                Add Question to Quiz
              </Button>
            </Box>
          )}

          {/* Use Existing Questions Tab */}
          {tabValue === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Existing Questions
                </Typography>
                <Button
                  variant="contained"
                  onClick={addSelectedQuestions}
                  disabled={selectedExistingQuestions.length === 0}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                    }
                  }}
                >
                  Add Selected ({selectedExistingQuestions.length})
                </Button>
              </Box>
              
              {/* Filters */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by Language</InputLabel>
                    <Select
                      value={filterLanguage}
                      onChange={(e) => setFilterLanguage(e.target.value)}
                      label="Filter by Language"
                    >
                      <MenuItem value="">All Languages</MenuItem>
                      <MenuItem value="javascript">JavaScript</MenuItem>
                      <MenuItem value="python">Python</MenuItem>
                      <MenuItem value="java">Java</MenuItem>
                      <MenuItem value="cpp">C++</MenuItem>
                      <MenuItem value="csharp">C#</MenuItem>
                      <MenuItem value="php">PHP</MenuItem>
                      <MenuItem value="ruby">Ruby</MenuItem>
                      <MenuItem value="go">Go</MenuItem>
                      <MenuItem value="rust">Rust</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by Topic</InputLabel>
                    <Select
                      value={filterTopic}
                      onChange={(e) => setFilterTopic(e.target.value)}
                      label="Filter by Topic"
                    >
                      <MenuItem value="">All Topics</MenuItem>
                      <MenuItem value="basics">Programming Basics</MenuItem>
                      <MenuItem value="data-structures">Data Structures</MenuItem>
                      <MenuItem value="algorithms">Algorithms</MenuItem>
                      <MenuItem value="oop">Object-Oriented Programming</MenuItem>
                      <MenuItem value="web-development">Web Development</MenuItem>
                      <MenuItem value="database">Database</MenuItem>
                      <MenuItem value="networking">Networking</MenuItem>
                      <MenuItem value="security">Security</MenuItem>
                      <MenuItem value="testing">Testing</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox />
                      </TableCell>
                      <TableCell>Question</TableCell>
                      <TableCell>Language</TableCell>
                      <TableCell>Topic</TableCell>
                      <TableCell>Difficulty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {existingQuestions
                      .filter(q => !filterLanguage || q.language === filterLanguage)
                      .filter(q => !filterTopic || q.topic === filterTopic)
                      .map((question) => (
                      <TableRow 
                        key={question._id}
                        onMouseEnter={() => setHoveredQuestion(question)}
                        onMouseLeave={() => setHoveredQuestion(null)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedExistingQuestions.includes(question._id)}
                            onChange={() => handleExistingQuestionSelect(question._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{question.title}</Typography>
                          {question.codeSnippet && (
                            <Chip label="Code" size="small" className="mt-1" />
                          )}
                          {question.image && (
                            <Chip label="Image" size="small" className="mt-1 ml-1" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={question.language || 'N/A'} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip label={question.topic || 'N/A'} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={question.difficulty} 
                            size="small" 
                            color={question.difficulty === 'hard' ? 'error' : question.difficulty === 'medium' ? 'warning' : 'success'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Question Preview */}
              {hoveredQuestion && (
                <Card sx={{ position: 'fixed', top: '50%', right: 20, width: 400, zIndex: 1000, transform: 'translateY(-50%)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Question Preview</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{hoveredQuestion.title}</Typography>
                    {hoveredQuestion.codeSnippet && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="body2" component="pre">{hoveredQuestion.codeSnippet}</Typography>
                      </Box>
                    )}
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Options:</Typography>
                    {hoveredQuestion.options?.map((option, index) => (
                      <Typography 
                        key={index} 
                        variant="body2" 
                        sx={{ 
                          mb: 0.5,
                          color: index === hoveredQuestion.correctAnswer ? 'success.main' : 'text.primary',
                          fontWeight: index === hoveredQuestion.correctAnswer ? 'bold' : 'normal'
                        }}
                      >
                        {String.fromCharCode(65 + index)}) {option.text}
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              )}
            </Box>
          )}

          {/* Import from Excel Tab */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 3 }}>
                Import Questions from Excel
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 4, p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Excel Format Requirements</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>Your Excel file must have the following columns:</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2">• <strong>title</strong> - Question title (required)</Typography>
                  <Typography variant="body2">• <strong>language</strong> - Programming language (required)</Typography>
                  <Typography variant="body2">• <strong>topic</strong> - Question topic (required)</Typography>
                  <Typography variant="body2">• <strong>codeSnippet</strong> - Code snippet (optional)</Typography>
                  <Typography variant="body2">• <strong>image</strong> - Image URL (optional)</Typography>
                  <Typography variant="body2">• <strong>option1</strong> - First option text (required)</Typography>
                  <Typography variant="body2">• <strong>option2</strong> - Second option text (required)</Typography>
                  <Typography variant="body2">• <strong>option3</strong> - Third option text (required)</Typography>
                  <Typography variant="body2">• <strong>option4</strong> - Fourth option text (required)</Typography>
                  <Typography variant="body2">• <strong>correctAnswer</strong> - Correct option number (1-4, required)</Typography>
                  <Typography variant="body2">• <strong>difficulty</strong> - easy/medium/hard (required)</Typography>
                </Box>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      style={{ display: 'none' }}
                      id="excel-upload"
                    />
                    <label htmlFor="excel-upload">
                      <Button variant="outlined" component="span" fullWidth>
                        Choose Excel File
                      </Button>
                    </label>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      onClick={importFromExcel}
                      disabled={!excelFile || isImporting}
                      fullWidth
                    >
                      {isImporting ? 'Importing...' : 'Import Questions'}
                    </Button>
                  </Grid>
                </Grid>
                
                {excelFile && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Selected: {excelFile.name}
                  </Typography>
                )}
                
                <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="info.contrastText">
                    <strong>Note:</strong> Make sure your Excel file has a header row with the exact column names listed above.
                    The correctAnswer should be a number (1, 2, 3, or 4) corresponding to the option number.
                  </Typography>
                </Box>
              </Card>
            </Box>
          )}
        </CardContent>
      </Card>

      
      {/* Failed Imports Modal */}
      <Dialog open={showFailedModal} onClose={() => setShowFailedModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Errors</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The following rows could not be imported:
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Row</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {failedImports.map((failed, index) => (
                  <TableRow key={index}>
                    <TableCell>{failed.row}</TableCell>
                    <TableCell>{failed.data.title || 'N/A'}</TableCell>
                    <TableCell>{failed.error}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFailedModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateQuiz;