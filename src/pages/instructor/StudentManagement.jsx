import { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  CircularProgress,
  TablePagination,
  InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Upload, Visibility, VisibilityOff, Search } from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const StudentManagement = () => {
  const { darkMode } = useTheme();
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [bulkData, setBulkData] = useState({
    file: null,
    defaultPassword: ''
  });
  const [failedUploads, setFailedUploads] = useState([]);
  const [showFailedUploads, setShowFailedUploads] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedTenant } = useTenant();

  const handleBulkUpload = () => {
    setBulkOpen(true);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkData.file || !bulkData.defaultPassword) {
      toast.error('Please select a file and enter default password');
      return;
    }
    
    setBulkLoading(true);
    const formData = new FormData();
    formData.append('file', bulkData.file);
    formData.append('defaultPassword', bulkData.defaultPassword);
    formData.append('tenantId', selectedTenant._id);
    
    try {
      const response = await fetch('http://localhost:4000/api/students/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message);
        setBulkOpen(false);
        setBulkData({ file: null, defaultPassword: '' });
        fetchStudents();
        
        if (result.failedUploads && result.failedUploads.length > 0) {
          setFailedUploads(result.failedUploads);
          setShowFailedUploads(true);
        }
      } else {
        toast.error(result.message || 'Bulk upload failed');
      }
    } catch (error) {
      toast.error('Error uploading file: ' + error.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedTenant) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/students?tenantId=${selectedTenant._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedTenant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingStudent ? `http://localhost:4000/api/students/${editingStudent._id}` : 'http://localhost:4000/api/students';
      const method = editingStudent ? 'PUT' : 'POST';
      
      const requestBody = {
        ...formData,
        tenantId: selectedTenant._id
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      let result = {};
      try {
        result = await response.json();
      } catch (jsonError) {
        result = { message: 'Server error' };
      }
      
      if (response.ok) {
        toast.success(editingStudent ? 'Student updated successfully!' : 'Student created successfully!');
        setOpen(false);
        resetForm();
        fetchStudents();
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error saving student: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: ''
    });
    setEditingStudent(null);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: ''
    });
    setOpen(true);
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/students/${studentToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Student deleted successfully!');
        fetchStudents();
      } else {
        const result = await response.json();
        toast.error(result.message || 'Failed to delete student');
      }
    } catch (error) {
      toast.error('Error deleting student: ' + error.message);
    } finally {
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
    }
  };

  if (!selectedTenant) {
    return (
      <Box className="text-center py-12">
        <Typography variant="h6" className="text-gray-500">
          Please select a tenant to manage students
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
            Student Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Managing students for: {selectedTenant.name}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
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
            Add Student
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={handleBulkUpload}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Bulk Add
          </Button>
        </Box>
      </Box>


      <TableContainer component={Paper} sx={{ 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: `1px solid ${darkMode ? 'grey.800' : 'grey.200'}`,
        overflow: 'hidden'
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              bgcolor: darkMode ? 'grey.900' : 'grey.50',
              borderBottom: `2px solid ${darkMode ? 'grey.700' : 'grey.300'}`
            }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students
              .filter(student => 
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(student)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(student)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={students.filter(student => 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
          ).length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

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
          {editingStudent ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box className="space-y-4">
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              
              <TextField
                fullWidth
                label={editingStudent ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!editingStudent}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingStudent ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog 
        open={bulkOpen} 
        onClose={() => setBulkOpen(false)} 
        maxWidth="sm" 
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
        }}>Bulk Upload Students</DialogTitle>
        <form onSubmit={handleBulkSubmit}>
          <DialogContent>
            <Box className="space-y-4">
              <Typography variant="body2" color="textSecondary">
                Upload an Excel file with 'name' and 'email' columns
              </Typography>
              
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setBulkData({...bulkData, file: e.target.files[0]})}
                style={{ width: '100%', padding: '8px' }}
              />
              
              <TextField
                fullWidth
                label="Default Password"
                type={showPassword ? 'text' : 'password'}
                value={bulkData.defaultPassword}
                onChange={(e) => setBulkData({...bulkData, defaultPassword: e.target.value})}
                required
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkOpen(false)} disabled={bulkLoading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={bulkLoading}>
              {bulkLoading ? <CircularProgress size={20} /> : 'Upload'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
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
        }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {studentToDelete?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Failed Uploads Dialog */}
      <Dialog 
        open={showFailedUploads} 
        onClose={() => setShowFailedUploads(false)} 
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
          bgcolor: darkMode ? 'grey.800' : 'warning.50',
          color: darkMode ? 'grey.100' : 'warning.main',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'warning.200'}`,
          py: 3
        }}>Failed Uploads</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="mb-4">
            The following students could not be uploaded:
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {failedUploads.map((failed, index) => (
                  <TableRow key={index}>
                    <TableCell>{failed.name}</TableCell>
                    <TableCell>{failed.email}</TableCell>
                    <TableCell>{failed.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFailedUploads(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentManagement;