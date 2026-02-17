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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add, AccessTime, CheckCircle, Download, Visibility, Delete } from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import api from '../../services/api/apiClient';

const AssessmentManagement = () => {
  const navigate = useNavigate();
  const { selectedTenant } = useTenant();
  const { darkMode } = useTheme();
  const [assessments, setAssessments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [downloadingAssessment, setDownloadingAssessment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);

  useEffect(() => {
    if (selectedTenant) {
      fetchAssessments();
    }
  }, [selectedTenant]);

  const fetchAssessments = async () => {
    try {
      const response = await api.get(`/assessments?tenantId=${selectedTenant._id}`);
      setAssessments(response.data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const handleAssessmentClick = (assessmentId) => {
    navigate(`/instructor/assessment/${assessmentId}`);
  };

  const handleDownloadResults = async (e, assessmentId, assessmentTitle) => {
    e.stopPropagation();
    setDownloadingAssessment(assessmentId);
    try {
      const response = await api.get(`/assessments/${assessmentId}/results`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${assessmentTitle}_results.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Results downloaded successfully');
    } catch (error) {
      console.error('Error downloading results:', error);
      toast.error('Error downloading results');
    } finally {
      setDownloadingAssessment(null);
    }
  };

  const handleDeleteAssessment = async (e, assessmentId) => {
    e.stopPropagation();
    setAssessmentToDelete(assessmentId);
    setDeleteDialogOpen(true);
  };

  const markAllInProgressCompleted = async (assessmentId) => {
    try {
      const response = await api.patch(`/assessments/${assessmentId}/mark-all-inprogress-completed`);
      toast.success(`${response.data.count} students marked as completed`);
    } catch (error) {
      console.error('Error marking students as completed:', error);
      toast.error('Error marking students as completed');
    }
  };

  const markAllInProgressResume = async (assessmentId) => {
    try {
      const response = await api.patch(`/assessments/${assessmentId}/mark-all-inprogress-resume`);
      toast.success(`${response.data.count} students allowed to resume`);
    } catch (error) {
      console.error('Error allowing resume:', error);
      toast.error('Error allowing resume');
    }
  };

  const markAllInProgressRetake = async (assessmentId) => {
    try {
      const response = await api.patch(`/assessments/${assessmentId}/mark-all-inprogress-retake`);
      toast.success(`${response.data.count} students allowed to retake`);
    } catch (error) {
      console.error('Error allowing retake:', error);
      toast.error('Error allowing retake');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/assessments/${assessmentToDelete}`);
      toast.success('Assessment deleted successfully');
      fetchAssessments();
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast.error('Error deleting assessment');
    } finally {
      setDeleteDialogOpen(false);
      setAssessmentToDelete(null);
    }
  };

  const availableAssessments = assessments.filter(assessment => assessment.status === 'active' || assessment.status === 'draft');
  const completedAssessments = assessments.filter(assessment => assessment.status === 'completed' || assessment.status === 'expired');

  const renderAssessmentCards = (assessmentList) => (
    <Grid container spacing={3}>
      {assessmentList.length > 0 ? (
        assessmentList.map((assessment) => (
          <Grid item xs={12} md={6} lg={4} key={assessment._id}>
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
            }} onClick={() => handleAssessmentClick(assessment._id)}>
              <CardContent sx={{ flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Status chip at top right */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, alignItems: 'center' }}>
                  {assessment.status === 'active' && (
                    <Chip 
                      icon={<CheckCircle />}
                      label="Active"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  {assessment.status === 'draft' && (
                    <Chip 
                      label="Draft"
                      size="small"
                      sx={{ fontWeight: 600, bgcolor: darkMode ? 'grey.700' : 'grey.200', color: 'text.secondary' }}
                    />
                  )}
                </Box>

                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, color: 'text.primary', pr: 8 }}>
                  {assessment.title}
                </Typography>
                
                <Box display="flex" flexWrap="wrap" gap={1.5} mb={3}>
                  <Chip 
                    icon={<AccessTime />}
                    label={`${assessment.duration || 0} min`}
                    size="medium"
                    sx={{ 
                      fontWeight: 600,
                      bgcolor: darkMode ? 'primary.900' : 'primary.50',
                      color: 'primary.main',
                      border: 'none'
                    }}
                  />
                  <Chip 
                    label={`${assessment.questions?.length || 0} questions`}
                    size="medium"
                    sx={{ 
                      fontWeight: 600,
                      bgcolor: darkMode ? 'success.900' : 'success.50',
                      color: 'success.main',
                      border: 'none'
                    }}
                  />
                </Box>

                {/* Batches */}
                <Box mb={3}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                    Assigned Batches:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {assessment.batches && assessment.batches.length > 0 ? (
                      assessment.batches.map((batch) => (
                        <Chip 
                          key={batch._id}
                          label={batch.name}
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            bgcolor: darkMode ? 'secondary.900' : 'secondary.50',
                            color: 'secondary.main',
                            border: 'none'
                          }}
                        />
                      ))
                    ) : (
                      <Chip 
                        label="All Batches"
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          bgcolor: darkMode ? 'secondary.900' : 'secondary.50',
                          color: 'secondary.main',
                          border: 'none'
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Always render this section to maintain consistent spacing */}
                <Box mb={3} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', minHeight: '32px' }}>
                  {assessment.startTime && (
                    <>
                      <Chip 
                        label={`Date: ${new Date(assessment.startTime).toLocaleDateString()}`}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          bgcolor: darkMode ? 'info.900' : 'info.50',
                          color: 'info.main',
                          border: 'none'
                        }}
                      />
                      <Chip 
                        label={`Time: ${new Date(assessment.startTime).toLocaleTimeString()}`}
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

                {/* Action Buttons at Bottom */}
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/instructor/assessments/${assessment._id}/view`);
                    }}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  >
                    View
                  </Button>
                  {(assessment.status === 'completed' || assessment.status === 'expired') && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Download />}
                      onClick={(e) => handleDownloadResults(e, assessment._id, assessment.title)}
                      disabled={downloadingAssessment === assessment._id}
                      sx={{
                        flex: 1,
                        bgcolor: 'success.main',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: 'success.dark'
                        },
                        '&:disabled': {
                          bgcolor: 'grey.400'
                        }
                      }}
                    >
                      {downloadingAssessment === assessment._id ? 'Downloading...' : 'Results'}
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteAssessment(e, assessment._id)}
                    sx={{
                      color: 'error.main',
                      border: '1px solid',
                      borderColor: 'error.main',
                      '&:hover': {
                        bgcolor: 'error.main',
                        color: 'white'
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
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
                {tabValue === 0 ? 'No available assessments' : 'No completed assessments'}
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
          Please select a tenant to manage assessments
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
            Assessment Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Create and manage assessments for your students
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/instructor/batch-selection', { state: { type: 'assessment' } })}
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
          Create Assessment
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Available (${availableAssessments.length})`} />
          <Tab label={`Completed (${completedAssessments.length})`} />
        </Tabs>
      </Box>
      
      {tabValue === 0 && renderAssessmentCards(availableAssessments)}
      {tabValue === 1 && renderAssessmentCards(completedAssessments)}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Assessment</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this assessment? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssessmentManagement;