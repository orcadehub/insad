import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import { Add, Edit, Delete, Upload } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const AptitudeQuestions = () => {
  const { darkMode } = useTheme();
  const [questions, setQuestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'medium',
    topic: '',
    explanation: ''
  });

  const fetchQuestions = async () => {
    try {
      // TODO: Implement API call
      setQuestions([]);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        // TODO: Update API call
        toast.success('Question updated successfully!');
      } else {
        // TODO: Create API call
        toast.success('Question created successfully!');
      }
      fetchQuestions();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error saving question: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'medium',
      topic: '',
      explanation: ''
    });
    setEditingQuestion(null);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData(question);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      // TODO: Delete API call
      toast.success('Question deleted successfully!');
      fetchQuestions();
    } catch (error) {
      toast.error('Error deleting question: ' + error.message);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      // TODO: Implement bulk upload API call
      toast.success('Questions uploaded successfully!');
      setBulkUploadOpen(false);
      setUploadFile(null);
      fetchQuestions();
    } catch (error) {
      toast.error('Error uploading questions: ' + error.message);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Aptitude Questions
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage aptitude questions for assessments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setBulkUploadOpen(true)}
            sx={{ px: 3, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Bulk Upload
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{ px: 3, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Add Question
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: darkMode ? 'grey.900' : 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700 }}>Question</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Topic</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Difficulty</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question._id}>
                <TableCell>{question.question}</TableCell>
                <TableCell>
                  <Chip label={question.topic} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={question.difficulty} 
                    size="small"
                    color={question.difficulty === 'easy' ? 'success' : question.difficulty === 'hard' ? 'error' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(question)} size="small" color="primary">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(question._id)} size="small" color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
          {editingQuestion ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                required
              />

              <TextField
                fullWidth
                label="Question"
                multiline
                rows={3}
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
              />

              {formData.options.map((option, index) => (
                <TextField
                  key={index}
                  fullWidth
                  label={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                />
              ))}

              <FormControl fullWidth>
                <InputLabel>Correct Answer</InputLabel>
                <Select
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  required
                >
                  {formData.options.map((_, index) => (
                    <MenuItem key={index} value={index}>
                      Option {index + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Explanation"
                multiline
                rows={3}
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingQuestion ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkUploadOpen} onClose={() => setBulkUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
          Bulk Upload Aptitude Questions
        </DialogTitle>
        <form onSubmit={handleBulkUpload}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Alert severity="info">
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Required Excel Columns (case-insensitive):</Typography>
                <Typography variant="body2" component="div">
                  • <strong>Topic</strong> - Question topic<br />
                  • <strong>Question</strong> - The question text<br />
                  • <strong>Option1</strong> - First option<br />
                  • <strong>Option2</strong> - Second option<br />
                  • <strong>Option3</strong> - Third option<br />
                  • <strong>Option4</strong> - Fourth option<br />
                  • <strong>CorrectAnswer</strong> - Number (1, 2, 3, or 4)<br />
                  • <strong>Difficulty</strong> - easy, medium, or hard<br />
                  • <strong>Explanation</strong> - Answer explanation (optional)
                </Typography>
              </Alert>

              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ py: 2 }}
              >
                {uploadFile ? uploadFile.name : 'Choose Excel File'}
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setBulkUploadOpen(false);
              setUploadFile(null);
            }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!uploadFile}>
              Upload
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AptitudeQuestions;
