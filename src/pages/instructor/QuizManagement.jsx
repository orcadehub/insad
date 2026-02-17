import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add, AccessTime, CheckCircle, Download } from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const QuizManagement = () => {
  const navigate = useNavigate();
  const { selectedTenant } = useTenant();
  const { darkMode } = useTheme();
  const [quizzes, setQuizzes] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [downloadingQuiz, setDownloadingQuiz] = useState(null);

  useEffect(() => {
    if (selectedTenant) {
      fetchQuizzes();
    }
  }, [selectedTenant]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/quizzes?tenantId=${selectedTenant._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleQuizClick = (quizId) => {
    navigate(`/instructor/quiz/${quizId}`);
  };

  const handleDownloadResults = async (e, quizId, quizTitle) => {
    e.stopPropagation();
    setDownloadingQuiz(quizId);
    try {
      const response = await fetch(`http://localhost:4000/api/quizzes/${quizId}/results`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${quizTitle}_results.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Results downloaded successfully');
      } else {
        toast.error('Failed to download results');
      }
    } catch (error) {
      console.error('Error downloading results:', error);
      toast.error('Error downloading results');
    } finally {
      setDownloadingQuiz(null);
    }
  };

  const availableQuizzes = quizzes.filter(quiz => quiz.status === 'active' || quiz.status === 'draft');
  const completedQuizzes = quizzes.filter(quiz => quiz.status === 'completed' || quiz.status === 'expired');

  const renderQuizCards = (quizList) => (
    <Grid container spacing={3}>
      {quizList.length > 0 ? (
        quizList.map((quiz) => (
          <Grid item xs={12} md={6} lg={4} key={quiz._id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: `1px solid ${darkMode ? 'grey.800' : 'grey.200'}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                borderColor: 'primary.main'
              }
            }} onClick={() => handleQuizClick(quiz._id)}>
              <CardContent sx={{ flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Status chip at top right */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, alignItems: 'center' }}>
                  {(quiz.status === 'completed' || quiz.status === 'expired') && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Download />}
                      onClick={(e) => handleDownloadResults(e, quiz._id, quiz.title)}
                      disabled={downloadingQuiz === quiz._id}
                      sx={{
                        bgcolor: 'success.main',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2,
                        py: 0.5,
                        '&:hover': {
                          bgcolor: 'success.dark'
                        },
                        '&:disabled': {
                          bgcolor: 'grey.400'
                        }
                      }}
                    >
                      {downloadingQuiz === quiz._id ? 'Downloading...' : 'Results'}
                    </Button>
                  )}
                  {quiz.status === 'active' && (
                    <Chip 
                      icon={<CheckCircle />}
                      label="Active"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  {quiz.status === 'draft' && (
                    <Chip 
                      label="Draft"
                      size="small"
                      sx={{ fontWeight: 600, bgcolor: darkMode ? 'grey.700' : 'grey.200', color: 'text.secondary' }}
                    />
                  )}
                </Box>

                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, color: 'text.primary', pr: 8 }}>
                  {quiz.title}
                </Typography>
                
                <Box display="flex" flexWrap="wrap" gap={1.5} mb={3}>
                  <Chip 
                    icon={<AccessTime />}
                    label={`${quiz.duration || 0} min`}
                    size="medium"
                    sx={{ 
                      fontWeight: 600,
                      bgcolor: darkMode ? 'primary.900' : 'primary.50',
                      color: 'primary.main',
                      border: 'none'
                    }}
                  />
                  <Chip 
                    label={`${quiz.questions?.length || 0} questions`}
                    size="medium"
                    sx={{ 
                      fontWeight: 600,
                      bgcolor: darkMode ? 'success.900' : 'success.50',
                      color: 'success.main',
                      border: 'none'
                    }}
                  />
                </Box>

                {/* Always render this section to maintain consistent spacing */}
                <Box mb={3} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', minHeight: '32px' }}>
                  {quiz.startTime && (
                    <>
                      <Chip 
                        label={`Date: ${new Date(quiz.startTime).toLocaleDateString()}`}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          bgcolor: darkMode ? 'info.900' : 'info.50',
                          color: 'info.main',
                          border: 'none'
                        }}
                      />
                      <Chip 
                        label={`Time: ${new Date(quiz.startTime).toLocaleTimeString()}`}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          bgcolor: darkMode ? 'warning.900' : 'warning.50',
                          color: 'warning.main',
                          border: 'none'
                        }}
                      />
                    </>
                  )}
                </Box>

              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                {tabValue === 0 ? 'No available quizzes' : 'No completed quizzes'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  if (!selectedTenant) {
    return (
      <Box className="text-center py-12">
        <Typography variant="h6" className="text-gray-500">
          Please select a tenant to manage quizzes
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        p: 0
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
            Quiz Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Create and manage quizzes for your students
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/instructor/batch-selection')}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4
            }
          }}
        >
          Create Quiz
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Available (${availableQuizzes.length})`} />
          <Tab label={`Completed (${completedQuizzes.length})`} />
        </Tabs>
      </Box>
      
      {tabValue === 0 && renderQuizCards(availableQuizzes)}
      {tabValue === 1 && renderQuizCards(completedQuizzes)}
    </Box>
  );
};

export default QuizManagement;