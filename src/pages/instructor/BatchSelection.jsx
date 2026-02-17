import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  Chip,
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
  DialogActions,
  TextField,
  IconButton,
  CircularProgress
} from '@mui/material';
import { ArrowBack, Add, Edit, Delete, Search } from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const BatchSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedTenant } = useTenant();
  const { darkMode } = useTheme();
  
  // Determine if this is for assessment or quiz based on the referring page
  const isAssessment = location.pathname.includes('assessment') || location.state?.type === 'assessment';
  const pageTitle = isAssessment ? 'Batch Selection for Assessment' : 'Batch Selection for Quiz';
  const backPath = isAssessment ? '/instructor/assessments' : '/instructor/quizzes';
  const proceedPath = isAssessment ? '/instructor/create-assessment' : '/instructor/create-quiz';
  const proceedText = isAssessment ? 'Proceed to Create Assessment' : 'Proceed to Create Quiz';
  const [batches, setBatches] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState('all');
  const [totalStudents, setTotalStudents] = useState(0);
  const [editBatchOpen, setEditBatchOpen] = useState(false);
  const [manageBatchOpen, setManageBatchOpen] = useState(false);
  const [deleteBatchOpen, setDeleteBatchOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });
  const [allStudents, setAllStudents] = useState([]);
  const [batchStudents, setBatchStudents] = useState([]);
  const [uploadedStudents, setUploadedStudents] = useState([]);
  const [nonExistentStudents, setNonExistentStudents] = useState([]);
  const [showNonExistentDialog, setShowNonExistentDialog] = useState(false);
  const [batchUploadFile, setBatchUploadFile] = useState(null);
  const [batchUploadLoading, setBatchUploadLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file: null
  });

  useEffect(() => {
    if (selectedTenant) {
      fetchBatches();
      fetchTotalStudents();
      fetchAllStudents();
    }
  }, [selectedTenant]);



  const fetchBatches = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/batches?tenantId=${selectedTenant._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/students?tenantId=${selectedTenant._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllStudents(data);
      }
    } catch (error) {
      console.error('Error fetching all students:', error);
    }
  };

  const handleEditBatch = (batch) => {
    setSelectedBatch(batch);
    setEditFormData({ name: batch.name, description: batch.description || '' });
    setEditBatchOpen(true);
  };

  const handleManageBatch = (batch) => {
    setSelectedBatch(batch);
    setBatchStudents(batch.students || []);
    setManageBatchOpen(true);
  };

  const handleDeleteBatch = (batch) => {
    setSelectedBatch(batch);
    setDeleteBatchOpen(true);
  };

  const updateBatch = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/batches/${selectedBatch._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        toast.success('Batch updated successfully!');
        setEditBatchOpen(false);
        fetchBatches();
      } else {
        const result = await response.json();
        toast.error(result.message || 'Failed to update batch');
      }
    } catch (error) {
      toast.error('Error updating batch');
    }
  };

  const deleteBatch = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/batches/${selectedBatch._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Batch deleted successfully!');
        setDeleteBatchOpen(false);
        fetchBatches();
      } else {
        const result = await response.json();
        toast.error(result.message || 'Failed to delete batch');
      }
    } catch (error) {
      toast.error('Error deleting batch');
    }
  };

  const addStudentToBatch = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/batches/${selectedBatch._id}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentIds: [studentId] })
      });

      if (response.ok) {
        const result = await response.json();
        setBatchStudents(result.batch.students);
        toast.success('Student added to batch!');
      }
    } catch (error) {
      toast.error('Error adding student to batch');
    }
  };

  const removeStudentFromBatch = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/batches/${selectedBatch._id}/students`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentIds: [studentId] })
      });

      if (response.ok) {
        const result = await response.json();
        setBatchStudents(result.batch.students);
        toast.success('Student removed from batch!');
      }
    } catch (error) {
      toast.error('Error removing student from batch');
    }
  };

  const handleBatchFileUpload = async (file) => {
    if (!file || !selectedBatch) return;
    
    setBatchUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`http://localhost:4000/api/batches/${selectedBatch._id}/upload-students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setBatchStudents(result.batch.students);
        if (result.nonExistentStudents.length > 0) {
          setNonExistentStudents(result.nonExistentStudents);
          setShowNonExistentDialog(true);
        }
        toast.success(`${result.addedCount} students added to batch`);
        setBatchUploadFile(null);
      } else {
        toast.error(result.message || 'Failed to process file');
      }
    } catch (error) {
      toast.error('Error processing file');
    } finally {
      setBatchUploadLoading(false);
    }
  };

  const fetchTotalStudents = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/students?tenantId=${selectedTenant._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTotalStudents(data.length);
      }
    } catch (error) {
      console.error('Error fetching total students:', error);
    }
  };

  const handleCreateBatch = async () => {
    setCreateLoading(true);
    try {
      const batchResponse = await fetch('http://localhost:4000/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          name: formData.name, 
          description: formData.description,
          tenantId: selectedTenant._id
        })
      });

      if (batchResponse.ok) {
        toast.success('Batch created successfully!');
        setOpen(false);
        setFormData({ name: '', description: '', file: null });
        setUploadedStudents([]);
        fetchBatches();
      } else {
        const result = await batchResponse.json();
        toast.error(result.message || 'Failed to create batch');
      }
    } catch (error) {
      toast.error('Error creating batch');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:4000/api/batches/validate-students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setUploadedStudents(result.validStudents);
        if (result.nonExistentStudents.length > 0) {
          setNonExistentStudents(result.nonExistentStudents);
          setShowNonExistentDialog(true);
        }
        toast.success(`${result.validStudents.length} valid students found`);
      } else {
        toast.error(result.message || 'Failed to process file');
      }
    } catch (error) {
      toast.error('Error processing file');
    }
  };

  const handleBatchSelect = (batchId) => {
    if (batchId === 'all') {
      setSelectedBatches('all');
    } else {
      setSelectedBatches(prev => 
        prev === 'all' ? [batchId] :
        prev.includes(batchId) 
          ? prev.filter(id => id !== batchId)
          : [...prev, batchId]
      );
    }
  };



  const handleProceedToCreation = () => {
    // Navigate to quiz or assessment creation with selected batches
    navigate(proceedPath, { 
      state: { 
        selectedBatches,
        batches: selectedBatches === 'all' ? batches : batches.filter(b => selectedBatches.includes(b._id))
      } 
    });
  };

  if (!selectedTenant) {
    return (
      <Box className="text-center py-12">
        <Typography variant="h6" className="text-gray-500">
          Please select a tenant to manage batches
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton 
            onClick={() => navigate(backPath)}
            sx={{ 
              color: darkMode ? '#94a3b8' : '#64748b',
              '&:hover': {
                color: darkMode ? '#cbd5e1' : '#475569',
                transform: 'translateX(-2px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowBack />
          </IconButton>
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
            {pageTitle}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Add Batch
        </Button>
      </Box>

      {/* Batches Section */}
      <Card sx={{ 
        mb: 4,
        borderRadius: 3, 
        boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.12)',
        border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff'
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 4, 
            borderBottom: `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)'
              : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Available Batches
            </Typography>
          </Box>
          
          <TableContainer component={Paper} sx={{ 
            borderRadius: 3, 
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.12)',
            border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`,
            overflow: 'hidden',
            background: 'transparent'
          }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                </TableCell>
                <TableCell>Batch Name</TableCell>
                <TableCell>Student Count</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow sx={{
                '&:hover': { 
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                },
                '& .MuiTableCell-root': {
                  py: 2
                }
              }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedBatches === 'all'}
                    onChange={() => handleBatchSelect('all')}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>All Batches</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={totalStudents} 
                    size="small" 
                    sx={{
                      fontWeight: 600,
                      bgcolor: darkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                      color: darkMode ? '#818cf8' : '#6366f1',
                      border: `1px solid ${darkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
                      borderRadius: 2
                    }}
                  />
                </TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              {batches.map((batch) => (
                <TableRow key={batch._id} sx={{
                  '&:hover': { 
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                  },
                  '& .MuiTableCell-root': {
                    py: 2
                  }
                }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={Array.isArray(selectedBatches) && selectedBatches.includes(batch._id)}
                      onChange={() => handleBatchSelect(batch._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>{batch.name}</Typography>
                      {batch.description && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {batch.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={batch.students?.length || 0} 
                      size="small" 
                      sx={{
                        fontWeight: 600,
                        bgcolor: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                        color: darkMode ? '#10b981' : '#059669',
                        border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                        borderRadius: 2
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditBatch(batch)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleManageBatch(batch)}
                    >
                      <Add />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteBatch(batch)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Proceed Button */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          size="large"
          onClick={handleProceedToCreation}
          disabled={selectedBatches.length === 0}
          sx={{
            borderRadius: 3,
            px: 6,
            py: 2,
            fontWeight: 700,
            fontSize: '1.1rem',
            textTransform: 'none',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 30px rgba(34, 197, 94, 0.4)'
            },
            '&:disabled': {
              background: darkMode ? '#374151' : '#e5e7eb',
              color: darkMode ? '#6b7280' : '#9ca3af'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {proceedText} ({selectedBatches === 'all' ? 'All batches' : `${selectedBatches.length} batches`} selected)
        </Button>
      </Box>

      {/* Create Batch Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: '1.5rem',
          bgcolor: darkMode ? 'grey.800' : 'primary.50',
          color: darkMode ? 'grey.100' : 'primary.main',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'primary.200'}`,
          py: 3
        }}>
          Create New Batch
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Batch Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setOpen(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateBatch} 
            variant="contained" 
            disabled={!formData.name || createLoading}
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            {createLoading ? <CircularProgress size={20} color="inherit" /> : 'Create Batch'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog 
        open={editBatchOpen} 
        onClose={() => setEditBatchOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: '1.5rem',
          bgcolor: darkMode ? 'grey.800' : 'primary.50',
          color: darkMode ? 'grey.100' : 'primary.main',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'primary.200'}`,
          py: 3
        }}>
          Edit Batch
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Batch Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={editFormData.description}
              onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setEditBatchOpen(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={updateBatch} 
            variant="contained"
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Batch Students Dialog */}
      <Dialog 
        open={manageBatchOpen} 
        onClose={() => setManageBatchOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: '1.5rem',
          bgcolor: darkMode ? 'grey.800' : 'primary.50',
          color: darkMode ? 'grey.100' : 'primary.main',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'primary.200'}`,
          py: 3,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <span>Manage Students - {selectedBatch?.name}</span>
          <TextField
            size="small"
            placeholder="Search students..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, fontSize: 18 }} />
            }}
            sx={{ 
              width: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'
              }
            }}
          />
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>Batch Students</Typography>
              <Box sx={{ 
                maxHeight: 300, 
                overflowY: 'auto',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: 2,
                bgcolor: darkMode ? '#1f2937' : '#ffffff'
              }}>
                {batchStudents
                  .filter(student => 
                    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    student.email?.toLowerCase().includes(studentSearch.toLowerCase())
                  )
                  .map((student) => (
                  <Box key={student._id} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`,
                    '&:hover': {
                      bgcolor: darkMode ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.02)'
                    }
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{student.email}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{student.name}</Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => removeStudentFromBatch(student._id)}
                      sx={{
                        color: darkMode ? '#ef4444' : '#dc2626',
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)'
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>Available Students</Typography>
              <Box sx={{ 
                maxHeight: 300, 
                overflowY: 'auto',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: 2,
                bgcolor: darkMode ? '#1f2937' : '#ffffff'
              }}>
                {allStudents
                  .filter(s => !batchStudents.find(bs => bs._id === s._id))
                  .filter(student => 
                    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    student.email?.toLowerCase().includes(studentSearch.toLowerCase())
                  )
                  .map((student) => (
                  <Box key={student._id} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`,
                    '&:hover': {
                      bgcolor: darkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)'
                    }
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{student.email}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{student.name}</Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => addStudentToBatch(student._id)}
                      sx={{
                        color: darkMode ? '#10b981' : '#059669',
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)'
                        }
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, pt: 4, borderTop: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>Add Students from Excel</Typography>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files[0];
                setBatchUploadFile(file);
                if (file) handleBatchFileUpload(file);
              }}
              disabled={batchUploadLoading}
              style={{ 
                width: '100%', 
                padding: '12px',
                border: `2px dashed ${darkMode ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '8px',
                backgroundColor: darkMode ? '#374151' : '#f9fafb',
                color: darkMode ? '#e5e7eb' : '#374151',
                opacity: batchUploadLoading ? 0.6 : 1
              }}
            />
            {batchUploadLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Processing file and adding students...</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setManageBatchOpen(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Batch Dialog */}
      <Dialog 
        open={deleteBatchOpen} 
        onClose={() => setDeleteBatchOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: '1.5rem',
          bgcolor: darkMode ? 'grey.800' : 'error.50',
          color: darkMode ? 'grey.100' : 'error.main',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'error.200'}`,
          py: 3
        }}>
          Delete Batch
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
            Are you sure you want to delete "{selectedBatch?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setDeleteBatchOpen(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={deleteBatch} 
            color="error" 
            variant="contained"
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Non-Existent Students Dialog */}
      <Dialog open={showNonExistentDialog} onClose={() => setShowNonExistentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Students Not Found</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="mb-4">
            The following students from the Excel file do not exist in the database:
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  bgcolor: darkMode ? 'grey.900' : 'grey.50',
                  borderBottom: `2px solid ${darkMode ? 'grey.700' : 'grey.300'}`,
                  '& .MuiTableCell-head': {
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: darkMode ? 'grey.200' : 'grey.700',
                    py: 2
                  }
                }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nonExistentStudents.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNonExistentDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchSelection;