import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Add, ArrowBack, Edit, Delete, Code } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { companyService } from '../../services/companyService';
import { useTheme } from '../../contexts/ThemeContext';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import { submitCode } from '../../services/judge0Service.js';

const CompanyQuestions = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const { darkMode } = useTheme();
  const [company, setCompany] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [questionFormData, setQuestionFormData] = useState(null);
  const [createQuestionLoading, setCreateQuestionLoading] = useState(false);
  const [runCodeOpen, setRunCodeOpen] = useState(false);
  const [selectedQuestionForRun, setSelectedQuestionForRun] = useState(null);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [testResults, setTestResults] = useState([]);
  const [runningTests, setRunningTests] = useState(false);
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
    testCases: [
      {
        input: '2 7 11 15\\n9',
        output: '0 1',
        explanation: 'Basic case',
        isPublic: true
      }
    ],
    tags: ['Array', 'Hash Table'],
    assessmentType: 'programming',
    example: {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9'
    },
    intuition: {
      approach: 'Hash Map',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      keyInsights: ['Use hash map to store complement values'],
      algorithmSteps: ['Create hash map', 'For each number, calculate complement']
    },
    isActive: true
  };

  useEffect(() => {
    fetchQuestions();
  }, [companyId]);

  const fetchQuestions = async () => {
    try {
      const data = await companyService.getQuestionsByCompany(companyId);
      console.log('Fetched questions:', data);
      setQuestions(data);
      if (data.length > 0 && data[0].company) {
        setCompany(data[0].company);
      } else {
        const companies = await companyService.getAllCompanies();
        const currentCompany = companies.find(c => c._id === companyId);
        if (currentCompany) setCompany(currentCompany);
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
      await companyService.createQuestion({
        ...questionFormData,
        company: companyId,
        assessmentType: 'programming'
      });
      toast.success('Question created successfully');
      setAddQuestionOpen(false);
      setQuestionFormData(null);
      fetchQuestions();
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

  const handleCreateJsonPaste = (event) => {
    const pastedText = event.clipboardData.getData('text');
    try {
      let parsedJson;
      try {
        parsedJson = JSON.parse(pastedText);
      } catch {
        parsedJson = eval('(' + pastedText + ')');
      }
      setQuestionFormData(parsedJson);
      event.preventDefault();
    } catch (error) {
      console.log('Could not parse pasted content:', error);
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await companyService.deleteQuestion(id);
        toast.success('Question deleted successfully');
        fetchQuestions();
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
      example: question.example
    });
    setEditDialogOpen(true);
  };

  const handleSaveQuestion = async () => {
    setEditQuestionLoading(true);
    try {
      await companyService.updateQuestion(questionToEdit._id, editedQuestionData);
      toast.success('Question updated successfully');
      setEditDialogOpen(false);
      fetchQuestions();
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
          <IconButton onClick={() => navigate('/instructor/company-specific')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {company?.name || 'Company'} Questions
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
                      variant="contained"
                      size="small"
                      startIcon={<Code />}
                      onClick={() => handleRunCode(question)}
                      sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                    >
                      Run
                    </Button>
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
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Constraints (one per line)" value={editedQuestionData?.constraints?.join('\n') || ''} onChange={(e) => setEditedQuestionData({...editedQuestionData, constraints: e.target.value.split('\n').filter(c => c.trim())})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Example Input" value={editedQuestionData?.example?.input || ''} onChange={(e) => setEditedQuestionData({...editedQuestionData, example: {...editedQuestionData?.example, input: e.target.value}})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Example Output" value={editedQuestionData?.example?.output || ''} onChange={(e) => setEditedQuestionData({...editedQuestionData, example: {...editedQuestionData?.example, output: e.target.value}})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Example Explanation" value={editedQuestionData?.example?.explanation || ''} onChange={(e) => setEditedQuestionData({...editedQuestionData, example: {...editedQuestionData?.example, explanation: e.target.value}})} />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Test Cases</Typography>
                <Button variant="outlined" startIcon={<Add />} onClick={() => setEditedQuestionData({...editedQuestionData, testCases: [...(editedQuestionData?.testCases || []), { input: '', output: '', explanation: '', isPublic: false }]})}>
                  Add Test Case
                </Button>
              </Box>
              {editedQuestionData?.testCases?.map((testCase, index) => (
                <Card key={index} sx={{ mb: 2, p: 2, position: 'relative' }}>
                  <IconButton size="small" onClick={() => setEditedQuestionData({...editedQuestionData, testCases: editedQuestionData.testCases.filter((_, i) => i !== index)})} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}>
                    <Delete fontSize="small" />
                  </IconButton>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Test Case {index + 1}</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <TextField fullWidth label="Input" multiline rows={2} value={testCase.input || ''} onChange={(e) => { const newTestCases = [...editedQuestionData.testCases]; newTestCases[index].input = e.target.value; setEditedQuestionData({...editedQuestionData, testCases: newTestCases}); }} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField fullWidth label="Output" multiline rows={2} value={testCase.output || ''} onChange={(e) => { const newTestCases = [...editedQuestionData.testCases]; newTestCases[index].output = e.target.value; setEditedQuestionData({...editedQuestionData, testCases: newTestCases}); }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Explanation" multiline rows={2} value={testCase.explanation || ''} onChange={(e) => { const newTestCases = [...editedQuestionData.testCases]; newTestCases[index].explanation = e.target.value; setEditedQuestionData({...editedQuestionData, testCases: newTestCases}); }} />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>Visibility</InputLabel>
                        <Select value={testCase.isPublic ? 'public' : 'private'} onChange={(e) => { const newTestCases = [...editedQuestionData.testCases]; newTestCases[index].isPublic = e.target.value === 'public'; setEditedQuestionData({...editedQuestionData, testCases: newTestCases}); }} label="Visibility">
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
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={editQuestionLoading}>Cancel</Button>
          <Button onClick={handleSaveQuestion} variant="contained" disabled={editQuestionLoading}>
            {editQuestionLoading ? 'Saving...' : 'Save Question'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Run Code Dialog */}
      <Dialog open={runCodeOpen} onClose={() => setRunCodeOpen(false)} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ bgcolor: darkMode ? '#1e293b' : 'primary.main', color: 'white', py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Code sx={{ fontSize: '2rem' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Test Code - {selectedQuestionForRun?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: darkMode ? '#0f172a' : '#ffffff' }}>
          <Grid container sx={{ height: '75vh' }}>
            <Grid item xs={12} md={6} sx={{ borderRight: `1px solid ${darkMode ? '#334155' : '#e0e0e0'}`, bgcolor: darkMode ? '#1e293b' : '#ffffff' }}>
              <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Code Editor
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Language</InputLabel>
                    <Select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} label="Language">
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
                  sx={{ flexGrow: 1, '& .MuiInputBase-input': { fontFamily: 'Monaco, monospace', fontSize: '14px' } }}
                />
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Code />}
                  onClick={executeCode}
                  disabled={runningTests || !code.trim()}
                  sx={{ mt: 3, py: 2, fontWeight: 600 }}
                >
                  {runningTests ? 'Running Tests...' : 'Run All Tests'}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ bgcolor: darkMode ? '#1e293b' : '#f8fafc', height: '75vh', overflow: 'auto' }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Test Results
                </Typography>
                {testResults.length > 0 ? (
                  <Box>
                    {testResults.map((result, index) => (
                      <Card key={index} sx={{ mb: 2, border: `2px solid ${result.isCorrect ? '#22c55e' : '#ef4444'}`, bgcolor: result.isCorrect ? (darkMode ? '#064e3b' : '#f0fdf4') : (darkMode ? '#7f1d1d' : '#fef2f2') }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Test Case {index + 1}</Typography>
                            <Chip label={result.isCorrect ? 'PASS' : 'FAIL'} sx={{ fontWeight: 700, bgcolor: result.isCorrect ? '#22c55e' : '#ef4444', color: 'white' }} />
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1, fontFamily: 'monospace' }}><strong>Input:</strong> {result.input}</Typography>
                          <Typography variant="body2" sx={{ mb: 1, fontFamily: 'monospace' }}><strong>Expected:</strong> {result.output}</Typography>
                          <Typography variant="body2" sx={{ mb: 1, fontFamily: 'monospace' }}><strong>Actual:</strong> {result.actualOutput}</Typography>
                          {result.error && <Typography variant="body2" sx={{ color: 'error.main', fontFamily: 'monospace' }}><strong>Error:</strong> {result.error}</Typography>}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Code sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
                    <Typography variant="h6">No test results yet</Typography>
                    <Typography variant="body2">Write your code and click "Run All Tests"</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRunCodeOpen(false)} size="large" sx={{ px: 4, fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyQuestions;
