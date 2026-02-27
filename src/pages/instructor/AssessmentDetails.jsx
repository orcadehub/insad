const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';
import { Container, Typography, Button, Chip, Box, Grid, Tabs, Tab, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Badge, Tooltip, FormControl, InputLabel, Select, MenuItem, TablePagination } from '@mui/material';
import { Assessment, AccessTime, QuestionAnswer, Schedule, History, ArrowBack, Edit, Delete, PlayArrow, Pause, Stop, Refresh, Visibility, RestartAlt, PersonAdd, Warning, Search } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const AssessmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedTenant } = useTenant();
  const { darkMode } = useTheme();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [students, setStudents] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [editTimeOpen, setEditTimeOpen] = useState(false);
  const [newStartTime, setNewStartTime] = useState('');
  const [earlyStartBuffer, setEarlyStartBuffer] = useState(5);
  const [maxTabSwitches, setMaxTabSwitches] = useState(3);
  const [assessmentStatus, setAssessmentStatus] = useState('draft');
  const [allowedIPs, setAllowedIPs] = useState('');
  const [duration, setDuration] = useState(60);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', student: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [markCompletedOpen, setMarkCompletedOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [markAllInProgressOpen, setMarkAllInProgressOpen] = useState(false);
  const [markAllResumeOpen, setMarkAllResumeOpen] = useState(false);
  const [markAllCompletedResumeOpen, setMarkAllCompletedResumeOpen] = useState(false);
  const [deleteAllAttemptsOpen, setDeleteAllAttemptsOpen] = useState(false);

  useEffect(() => {
    if (selectedTenant && id) {
      fetchAssessmentDetails();
      fetchStudentAttempts();
      const interval = setInterval(fetchStudentAttempts, 10000); // Real-time updates every 10 seconds
      return () => clearInterval(interval);
    }
  }, [selectedTenant, id]);

  // Timer countdown
  useEffect(() => {
    if (assessment?.startTime) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const startTime = new Date(assessment.startTime).getTime();
        const endTime = startTime + (assessment.duration * 60 * 1000);
        
        if (now < startTime) {
          setTimeLeft({ type: 'starts', time: startTime - now });
        } else if (now < endTime) {
          setTimeLeft({ type: 'ends', time: endTime - now });
        } else {
          setTimeLeft({ type: 'expired', time: 0 });
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [assessment]);

  const fetchAssessmentDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssessment(data);
        if (data.startTime) {
          const localTime = new Date(data.startTime);
          const year = localTime.getFullYear();
          const month = String(localTime.getMonth() + 1).padStart(2, '0');
          const day = String(localTime.getDate()).padStart(2, '0');
          const hours = String(localTime.getHours()).padStart(2, '0');
          const minutes = String(localTime.getMinutes()).padStart(2, '0');
          setNewStartTime(`${year}-${month}-${day}T${hours}:${minutes}`);
        } else {
          setNewStartTime('');
        }
        setEarlyStartBuffer(data.earlyStartBuffer || 5);
        setMaxTabSwitches(data.maxTabSwitches || 3);
        setAssessmentStatus(data.status || 'draft');
        setAllowedIPs(data.allowedIPs ? data.allowedIPs.join(', ') : '');
        setDuration(data.duration || 60);
        console.log('Loaded allowedIPs from assessment:', data.allowedIPs);
      }
    } catch (error) {
      console.error('Error fetching assessment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAttempts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${id}/attempts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching student attempts:', error);
    }
  };

  const handleUpdateStartTime = async () => {
    console.log('Frontend sending allowedIPs:', allowedIPs);
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${id}/update-time`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          startTime: newStartTime, 
          earlyStartBuffer,
          maxTabSwitches,
          status: assessmentStatus,
          allowedIPs: allowedIPs.split(',').map(ip => ip.trim()).filter(ip => ip),
          allowedLanguages: assessment?.allowedLanguages || ['python', 'cpp', 'java', 'c'],
          duration,
          showKeyInsights: assessment?.showKeyInsights || false,
          showAlgorithmSteps: assessment?.showAlgorithmSteps || false
        })
      });
      
      if (response.ok) {
        toast.success('Assessment updated successfully');
        fetchAssessmentDetails();
        setEditTimeOpen(false);
      }
    } catch (error) {
      toast.error('Failed to update start time');
    }
  };

  const handleStudentAction = async (action, studentId, attemptId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/attempts/${attemptId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success(`${action} successful`);
        fetchStudentAttempts();
        setActionDialog({ open: false, type: '', student: null });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${action}`);
      }
    } catch (error) {
      console.error(`Error with ${action}:`, error);
      toast.error(`Failed to ${action}`);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${id}/update-time`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed' })
      });
      
      if (response.ok) {
        toast.success('Assessment marked as completed');
        fetchAssessmentDetails();
        setMarkCompletedOpen(false);
      } else {
        toast.error('Failed to mark assessment as completed');
      }
    } catch (error) {
      toast.error('Error marking assessment as completed');
    }
  };

  const handleMarkAllInProgressCompleted = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${id}/mark-all-inprogress-completed`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.count} students marked as completed`);
        fetchStudentAttempts();
        setMarkAllInProgressOpen(false);
      } else {
        toast.error('Failed to mark students as completed');
      }
    } catch (error) {
      toast.error('Error marking students as completed');
    }
  };

  const handleMarkAllInProgressResume = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${id}/mark-all-inprogress-resume`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.count} students marked as resume allowed`);
        fetchStudentAttempts();
        setMarkAllResumeOpen(false);
      } else {
        toast.error('Failed to mark students as resume allowed');
      }
    } catch (error) {
      toast.error('Error marking students as resume allowed');
    }
  };

  const handleMarkAllCompletedResume = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${id}/mark-all-completed-resume`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.count} students marked as resume allowed`);
        fetchStudentAttempts();
        setMarkAllCompletedResumeOpen(false);
      } else {
        toast.error('Failed to mark students as resume allowed');
      }
    } catch (error) {
      toast.error('Error marking students as resume allowed');
    }
  };

  const handleDeleteAllAttempts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${id}/delete-all-attempts`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.count} attempts deleted successfully`);
        fetchStudentAttempts();
        setDeleteAllAttemptsOpen(false);
      } else {
        toast.error('Failed to delete attempts');
      }
    } catch (error) {
      toast.error('Error deleting attempts');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'NOT_STARTED': 'default',
      'IN_PROGRESS': 'primary',
      'INTERRUPTED': 'warning',
      'RESUME_ALLOWED': 'info',
      'COMPLETED': 'success',
      'AUTO_SUBMITTED': 'secondary',
      'TAB_SWITCH_VIOLATION': 'error',
      'TERMINATED': 'error',
      'RETAKE_ALLOWED': 'info',
      'RETAKE_STARTED': 'primary'
    };
    return colors[status] || 'default';
  };

  const formatTimeLeft = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Filter students based on search term and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.attemptStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginate filtered students
  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography>Loading assessment details...</Typography>
      </Container>
    );
  }

  if (!assessment) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography color="error">Assessment not found</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4} sx={{ cursor: 'pointer' }} onClick={() => navigate('/instructor/assessments')}>
        <ArrowBack sx={{ color: 'text.secondary' }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Assessment Control Center
        </Typography>
      </Box>

      {/* Assessment Overview Card */}
      <Card sx={{ 
        mb: 4, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: `1px solid ${darkMode ? 'grey.800' : 'grey.200'}`
      }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom sx={{ 
                fontWeight: 800, 
                color: 'text.primary', 
                mb: 3,
                letterSpacing: '-0.02em'
              }}>
                {assessment.title}
              </Typography>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                mb: 4,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                bgcolor: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)',
                border: `1px solid ${darkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`
              }}>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: darkMode ? '#a5b4fc' : '#6366f1',
                  fontSize: '0.9rem'
                }}>
                  ID: {assessment._id}
                </Typography>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1.5} mb={4}>
                <Chip 
                  icon={<AccessTime />} 
                  label={`${assessment.duration} min`} 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    height: 32,
                    px: 1,
                    bgcolor: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                    color: darkMode ? '#60a5fa' : '#2563eb',
                    border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                    borderRadius: 2,
                    '& .MuiChip-icon': { color: 'inherit', fontSize: '1rem' }
                  }}
                />
                <Chip 
                  icon={<QuestionAnswer />} 
                  label={`${assessment.questions?.length || 0} questions`} 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    height: 32,
                    px: 1,
                    bgcolor: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                    color: darkMode ? '#10b981' : '#059669',
                    border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                    borderRadius: 2,
                    '& .MuiChip-icon': { color: 'inherit', fontSize: '1rem' }
                  }}
                />
                <Chip 
                  label={`Tab Limit: ${assessment.maxTabSwitches === -1 ? 'Unlimited' : assessment.maxTabSwitches || 3}`} 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    height: 32,
                    px: 1,
                    bgcolor: assessment.maxTabSwitches === -1 
                      ? (darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
                      : (darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)'),
                    color: assessment.maxTabSwitches === -1 
                      ? (darkMode ? '#10b981' : '#059669')
                      : (darkMode ? '#f59e0b' : '#d97706'),
                    border: `1px solid ${assessment.maxTabSwitches === -1 
                      ? (darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)')
                      : (darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)')}`,
                    borderRadius: 2
                  }}
                />
                {assessment.startTime && (
                  <>
                    <Chip 
                      icon={<Schedule />}
                      label={`Date: ${new Date(assessment.startTime).toLocaleDateString('en-GB')}`}
                      sx={{ 
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        height: 32,
                        px: 1,
                        bgcolor: darkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                        color: darkMode ? '#818cf8' : '#6366f1',
                        border: `1px solid ${darkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
                        borderRadius: 2,
                        '& .MuiChip-icon': { color: 'inherit', fontSize: '1rem' }
                      }}
                    />
                    <Chip 
                      icon={<AccessTime />}
                      label={`Time: ${new Date(assessment.startTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}`}
                      sx={{ 
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        height: 32,
                        px: 1,
                        bgcolor: darkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                        color: darkMode ? '#a855f7' : '#8b5cf6',
                        border: `1px solid ${darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                        borderRadius: 2,
                        '& .MuiChip-icon': { color: 'inherit', fontSize: '1rem' }
                      }}
                    />
                  </>
                )}
                <Chip 
                  label={assessment.status?.toUpperCase() || 'DRAFT'}
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    height: 32,
                    px: 1,
                    bgcolor: assessment.status === 'active' 
                      ? (darkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)')
                      : assessment.status === 'completed'
                      ? (darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)')
                      : (darkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(156, 163, 175, 0.1)'),
                    color: assessment.status === 'active' 
                      ? (darkMode ? '#22c55e' : '#16a34a')
                      : assessment.status === 'completed'
                      ? (darkMode ? '#3b82f6' : '#2563eb')
                      : (darkMode ? '#9ca3af' : '#6b7280'),
                    border: `1px solid ${assessment.status === 'active' 
                      ? (darkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)')
                      : assessment.status === 'completed'
                      ? (darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)')
                      : (darkMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.2)')}`,
                    borderRadius: 2
                  }}
                />
                <Chip 
                  label={`Created: ${new Date(assessment.createdAt).toLocaleDateString('en-GB')}`} 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    height: 32,
                    px: 1,
                    bgcolor: darkMode ? 'rgba(107, 114, 128, 0.15)' : 'rgba(107, 114, 128, 0.1)',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    border: `1px solid ${darkMode ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.2)'}`,
                    borderRadius: 2
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                {/* Timer Display */}
                {timeLeft && (
                  <Box sx={{ 
                    mb: 3, 
                    p: 3, 
                    backgroundColor: darkMode 
                      ? (timeLeft.type === 'ends' ? '#1f1f23' : '#0f1419')
                      : (timeLeft.type === 'ends' ? '#fef2f2' : '#f0f9ff'),
                    borderRadius: 2,
                    border: darkMode 
                      ? `1px solid ${timeLeft.type === 'ends' ? '#dc2626' : '#2563eb'}`
                      : `1px solid ${timeLeft.type === 'ends' ? '#fecaca' : '#bae6fd'}`,
                    display: 'inline-block',
                    minWidth: 'fit-content'
                  }}>
                    {timeLeft.type === 'starts' && (
                      <Typography variant="h6" sx={{ color: darkMode ? '#60a5fa' : '#2563eb', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Starts in: {formatTimeLeft(timeLeft.time)}
                      </Typography>
                    )}
                    {timeLeft.type === 'ends' && (
                      <Typography variant="h6" sx={{ color: darkMode ? '#f87171' : '#dc2626', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Ends in: {formatTimeLeft(timeLeft.time)}
                      </Typography>
                    )}
                    {timeLeft.type === 'expired' && (
                      <Typography variant="h6" sx={{ color: darkMode ? '#f87171' : '#dc2626', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Assessment Expired
                      </Typography>
                    )}
                  </Box>
                )}
                
                {/* Control Buttons */}
                <Box display="flex" gap={1.5} flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Tooltip title="Preview assessment questions" arrow>
                    <Button 
                      variant="outlined" 
                      size="medium"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/instructor/assessments/${id}/view`)}
                      sx={{
                        borderColor: darkMode ? '#10b981' : '#059669',
                        color: darkMode ? '#10b981' : '#059669',
                        '&:hover': {
                          borderColor: darkMode ? '#059669' : '#047857',
                          backgroundColor: darkMode ? '#064e3b' : '#ecfdf5'
                        }
                      }}
                    >
                      View Assessment
                    </Button>
                  </Tooltip>
                  <Tooltip title="Edit assessment settings and configuration" arrow>
                    <Button 
                      variant="outlined" 
                      size="medium"
                      startIcon={<Edit />}
                      onClick={() => setEditTimeOpen(true)}
                      disabled={assessment.status === 'completed'}
                      sx={{
                        borderColor: darkMode ? '#60a5fa' : '#2563eb',
                        color: darkMode ? '#60a5fa' : '#2563eb',
                        '&:hover': {
                          borderColor: darkMode ? '#3b82f6' : '#1d4ed8',
                          backgroundColor: darkMode ? '#1e3a8a' : '#eff6ff'
                        },
                        '&:disabled': {
                          borderColor: darkMode ? '#4b5563' : '#d1d5db',
                          color: darkMode ? '#6b7280' : '#9ca3af'
                        }
                      }}
                    >
                      Edit
                    </Button>
                  </Tooltip>
                  {timeLeft?.type === 'expired' && assessment.status !== 'completed' && (
                    <Tooltip title="Mark assessment as completed" arrow>
                      <Button 
                        variant="contained" 
                        size="medium"
                        onClick={() => setMarkCompletedOpen(true)}
                        sx={{
                          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                          }
                        }}
                      >
                        Mark Completed
                      </Button>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: `1px solid ${darkMode ? 'grey.800' : 'grey.200'}`
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 4, 
            borderBottom: `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)'
              : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)'
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={3}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100())'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                  border: `1px solid ${darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PersonAdd sx={{ color: darkMode ? '#a855f7' : '#8b5cf6', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                    Students Appeared
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: darkMode ? '#a855f7' : '#8b5cf6',
                    fontSize: '1.25rem'
                  }}>
                    {filteredStudents.length} Total
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={2} alignItems="center">
                <FormControl size="medium" sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Filter by Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{
                      borderRadius: 3,
                      bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                      border: `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                      '&:hover': {
                        border: `2px solid ${darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                      }
                    }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="NOT_STARTED">Not Started</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="AUTO_SUBMITTED">Auto Submitted</MenuItem>
                    <MenuItem value="INTERRUPTED">Interrupted</MenuItem>
                    <MenuItem value="TAB_SWITCH_VIOLATION">Tab Switch Violation</MenuItem>
                    <MenuItem value="TERMINATED">Terminated</MenuItem>
                    <MenuItem value="RESUME_ALLOWED">Resume Allowed</MenuItem>
                    <MenuItem value="RETAKE_ALLOWED">Retake Allowed</MenuItem>
                    <MenuItem value="RETAKE_STARTED">Retake Started</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={() => setMarkAllInProgressOpen(true)}
                  sx={{
                    bgcolor: '#f59e0b',
                    '&:hover': { bgcolor: '#d97706' },
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Mark All In-Progress as Completed
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setMarkAllResumeOpen(true)}
                  sx={{
                    bgcolor: '#10b981',
                    '&:hover': { bgcolor: '#059669' },
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Mark All In-Progress as Resume Allowed
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setMarkAllCompletedResumeOpen(true)}
                  sx={{
                    bgcolor: '#8b5cf6',
                    '&:hover': { bgcolor: '#7c3aed' },
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Mark All Completed as Resume Allowed
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setDeleteAllAttemptsOpen(true)}
                  sx={{
                    bgcolor: '#ef4444',
                    '&:hover': { bgcolor: '#dc2626' },
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Delete All Attempts
                </Button>
              <TextField
                size="medium"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1.5, color: 'text.secondary' }} />
                }}
                sx={{ 
                  width: 350,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                    border: `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    '&:hover': {
                      border: `2px solid ${darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                    },
                    '&.Mui-focused': {
                      border: `2px solid ${darkMode ? '#a855f7' : '#8b5cf6'}`,
                      boxShadow: darkMode 
                        ? '0 0 0 3px rgba(139, 92, 246, 0.1)'
                        : '0 0 0 3px rgba(139, 92, 246, 0.05)'
                    }
                  }
                }}
              />
              </Box>
            </Box>
          </Box>
          
          <TableContainer component={Paper} sx={{ 
            background: 'transparent',
            boxShadow: 'none'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  bgcolor: darkMode 
                    ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.6) 0%, rgba(100, 116, 139, 0.4) 100%)'
                    : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)',
                  '& .MuiTableCell-head': {
                    borderBottom: `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    py: 2
                  }
                }}>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>Submission Reason</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>Start Time</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>Time Used</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>Tab Switches</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>Fullscreen Exits</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <PersonAdd sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          No students have appeared for this assessment yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Students will appear here once they start the assessment
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student, index) => (
                    <TableRow key={student._id} sx={{ 
                      '&:hover': { 
                        bgcolor: darkMode 
                          ? 'rgba(139, 92, 246, 0.05)'
                          : 'rgba(139, 92, 246, 0.02)'
                      },
                      '& .MuiTableCell-root': {
                        borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
                        py: 2
                      },
                      bgcolor: index % 2 === 0 
                        ? (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(248, 250, 252, 0.5)')
                        : 'transparent'
                    }}>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>{student.studentName || 'Unknown'}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{student.studentEmail || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={student.attemptStatus || 'NOT_STARTED'}
                          color={getStatusColor(student.attemptStatus)}
                          size="medium"
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            height: 32
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {student.submissionReason ? (
                          <Chip 
                            label={student.submissionReason.replace(/_/g, ' ')}
                            size="small"
                            sx={{
                              bgcolor: student.submissionReason.includes('VIOLATION') ? 'error.100' : 'info.100',
                              color: student.submissionReason.includes('VIOLATION') ? 'error.800' : 'info.800',
                              fontWeight: 600
                            }}
                          />
                        ) : '-'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {student.startedAt ? (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {new Date(student.startedAt).toLocaleTimeString()}
                          </Typography>
                        ) : 'Not started'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {student.timeUsedSeconds ? `${Math.floor(student.timeUsedSeconds / 60)}:${String(student.timeUsedSeconds % 60).padStart(2, '0')}` : '0:00'}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold" sx={{ 
                            color: 'text.primary',
                            fontSize: '0.95rem'
                          }}>
                            {student.tabSwitchCount || 0} / {assessment.maxTabSwitches === -1 ? '∞' : assessment.maxTabSwitches || 3}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold" sx={{ 
                            color: 'text.primary',
                            fontSize: '0.95rem'
                          }}>
                            {student.fullscreenExitCount || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Allow Resume (Resets tab switches to 0)">
                            <IconButton 
                              size="medium" 
                              sx={{
                                color: darkMode ? '#10b981' : '#059669',
                                bgcolor: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                                border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                                borderRadius: 2,
                                '&:hover': {
                                  bgcolor: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                                  transform: 'scale(1.05)'
                                }
                              }}
                              onClick={() => setActionDialog({ open: true, type: 'resume', student })}
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Allow Retake">
                            <IconButton 
                              size="medium" 
                              sx={{
                                color: darkMode ? '#f59e0b' : '#d97706',
                                bgcolor: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                                border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`,
                                borderRadius: 2,
                                '&:hover': {
                                  bgcolor: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                                  transform: 'scale(1.05)'
                                }
                              }}
                              onClick={() => setActionDialog({ open: true, type: 'retake', student })}
                            >
                              <RestartAlt />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Terminate Attempt">
                            <IconButton 
                              size="medium" 
                              sx={{
                                color: darkMode ? '#ef4444' : '#dc2626',
                                bgcolor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                                border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                                borderRadius: 2,
                                '&:hover': {
                                  bgcolor: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                                  transform: 'scale(1.05)'
                                }
                              }}
                              onClick={() => setActionDialog({ open: true, type: 'terminate', student })}
                            >
                              <Stop />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredStudents.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 30]}
            labelRowsPerPage="Students per page:"
            sx={{ 
              borderTop: `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.6) 0%, rgba(100, 116, 139, 0.4) 100%)'
                : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)',
              '& .MuiTablePagination-toolbar': {
                px: 3,
                py: 2
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontWeight: 600,
                color: 'text.primary'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Edit Assessment Dialog */}
      <Dialog 
        open={editTimeOpen} 
        onClose={() => setEditTimeOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: darkMode 
              ? '0 25px 50px rgba(0, 0, 0, 0.5)'
              : '0 25px 50px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{
          background: darkMode 
            ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          color: 'text.primary',
          fontWeight: 700,
          fontSize: '1.5rem',
          py: 3
        }}>
          Edit Assessment Settings
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'grid', gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              inputProps={{ min: 30, max: 300 }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Allow Late Start</InputLabel>
              <Select
                value={earlyStartBuffer}
                onChange={(e) => setEarlyStartBuffer(e.target.value)}
                label="Allow Late Start"
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
              >
                <MenuItem value={0}>No late start allowed</MenuItem>
                {Array.from({ length: Math.floor(duration / 10) }, (_, i) => (i + 1) * 10).map(minutes => (
                  <MenuItem key={minutes} value={minutes}>{minutes} minutes after start</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Max Tab Switches</InputLabel>
              <Select
                value={maxTabSwitches}
                onChange={(e) => setMaxTabSwitches(e.target.value)}
                label="Max Tab Switches"
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
              >
                <MenuItem value={-1}>Unlimited (Disable tab switch monitoring)</MenuItem>
                {[0,1,2,3,4,5,6,7,8,9,10].map(num => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Assessment Status</InputLabel>
              <Select
                value={assessmentStatus}
                onChange={(e) => setAssessmentStatus(e.target.value)}
                label="Assessment Status"
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Allowed IP Addresses (comma separated)"
              placeholder="192.168.1.1, 10.0.0.1, 172.16.0.1"
              value={allowedIPs}
              onChange={(e) => setAllowedIPs(e.target.value)}
              helperText="Leave empty to allow from any IP address"
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Allowed Programming Languages</InputLabel>
              <Select
                multiple
                value={assessment?.allowedLanguages || ['python', 'cpp', 'java', 'c']}
                onChange={(e) => {
                  const updatedAssessment = { ...assessment, allowedLanguages: e.target.value };
                  setAssessment(updatedAssessment);
                }}
                label="Allowed Programming Languages"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value.toUpperCase()} size="small" />
                    ))}
                  </Box>
                )}
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
              >
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="c">C</MenuItem>
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="typescript">TypeScript</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Show Key Insights</InputLabel>
              <Select
                value={assessment?.showKeyInsights || false}
                onChange={(e) => {
                  setAssessment({ ...assessment, showKeyInsights: e.target.value });
                }}
                label="Show Key Insights"
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
              >
                <MenuItem value={true}>Yes - Show to students</MenuItem>
                <MenuItem value={false}>No - Hide from students</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Show Algorithm Steps</InputLabel>
              <Select
                value={assessment?.showAlgorithmSteps || false}
                onChange={(e) => {
                  setAssessment({ ...assessment, showAlgorithmSteps: e.target.value });
                }}
                label="Show Algorithm Steps"
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
              >
                <MenuItem value={true}>Yes - Show to students</MenuItem>
                <MenuItem value={false}>No - Hide from students</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2 }}>
          <Button 
            onClick={() => setEditTimeOpen(false)}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStartTime} 
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              fontWeight: 700,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
              }
            }}
          >
            Update Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: '', student: null })}>
        <DialogTitle>
          {actionDialog.type === 'resume' && 'Allow Resume'}
          {actionDialog.type === 'retake' && 'Allow Retake'}
          {actionDialog.type === 'terminate' && 'Terminate Attempt'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {actionDialog.type === 'resume' && 
              `Are you sure you want to allow ${actionDialog.student?.studentName} to resume? This will reset their tab switch count to 0 and allow them to continue from where they left off.`
            }
            {actionDialog.type === 'retake' && 
              `Are you sure you want to allow ${actionDialog.student?.studentName} to retake the assessment? This will create a new attempt for them.`
            }
            {actionDialog.type === 'terminate' && 
              `Are you sure you want to terminate the assessment attempt for ${actionDialog.student?.studentName}? This action cannot be undone.`
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: '', student: null })}>Cancel</Button>
          <Button 
            onClick={() => handleStudentAction(actionDialog.type, actionDialog.student?.studentId, actionDialog.student?._id)}
            variant="contained"
            color={actionDialog.type === 'terminate' ? 'error' : 'primary'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark Completed Confirmation Dialog */}
      <Dialog open={markCompletedOpen} onClose={() => setMarkCompletedOpen(false)}>
        <DialogTitle>Mark Assessment as Completed</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark this assessment as completed? This will prevent any further student attempts and finalize the assessment results.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkCompletedOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleMarkCompleted}
            variant="contained"
            color="success"
          >
            Mark Completed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark All In-Progress as Completed Dialog */}
      <Dialog open={markAllInProgressOpen} onClose={() => setMarkAllInProgressOpen(false)}>
        <DialogTitle>Mark All In-Progress as Completed</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark all IN_PROGRESS students as COMPLETED with submission reason as TIME_UP? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkAllInProgressOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleMarkAllInProgressCompleted}
            variant="contained"
            sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
          >
            Mark All Completed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark All In-Progress as Resume Allowed Dialog */}
      <Dialog open={markAllResumeOpen} onClose={() => setMarkAllResumeOpen(false)}>
        <DialogTitle>Mark All In-Progress as Resume Allowed</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark all IN_PROGRESS students as RESUME_ALLOWED? This will reset their tab switch count to 0 and allow them to continue.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkAllResumeOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleMarkAllInProgressResume}
            variant="contained"
            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
          >
            Mark All Resume Allowed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark All Completed as Resume Allowed Dialog */}
      <Dialog open={markAllCompletedResumeOpen} onClose={() => setMarkAllCompletedResumeOpen(false)}>
        <DialogTitle>Mark All Completed as Resume Allowed</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark all COMPLETED students as RESUME_ALLOWED? This will reset their tab switch count to 0 and allow them to continue.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkAllCompletedResumeOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleMarkAllCompletedResume}
            variant="contained"
            sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
          >
            Mark All Resume Allowed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Attempts Dialog */}
      <Dialog open={deleteAllAttemptsOpen} onClose={() => setDeleteAllAttemptsOpen(false)}>
        <DialogTitle>Delete All Assessment Attempts</DialogTitle>
        <DialogContent>
          <Typography color="error" fontWeight="bold" mb={2}>
            ⚠️ WARNING: This action cannot be undone!
          </Typography>
          <Typography>
            Are you sure you want to delete ALL student attempts for this assessment? This will permanently remove all attempt records, submissions, and progress data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllAttemptsOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAllAttempts}
            variant="contained"
            color="error"
          >
            Delete All Attempts
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssessmentDetails;