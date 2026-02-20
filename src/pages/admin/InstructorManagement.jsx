import { useState, useEffect } from 'react';
import { instructorService } from '../../services/instructor/instructorService';
import { tenantService } from '../../services/tenant/tenantService';
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
  Chip,
  IconButton
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const InstructorManagement = () => {
  const { darkMode } = useTheme();
  const [instructors, setInstructors] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    expertise: [],
    permissions: [],
    assignedTenants: []
  });

  const [tenants, setTenants] = useState([]);

  const fetchTenants = async () => {
    try {
      const data = await tenantService.getAllTenants();
      setTenants(data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const data = await instructorService.getAllInstructors();
      setInstructors(data);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  useEffect(() => {
    fetchInstructors();
    fetchTenants();
  }, []);

  const availablePermissions = [
    'create_quizzes',
    'create_assessments',
    'manage_company_specific',
    'manage_practice_questions',
    'manage_aptitude_questions',
    'manage_study_materials',
    'manage_students',
    'view_reports'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting instructor data:', formData);
      if (editingInstructor) {
        await instructorService.updateInstructor(editingInstructor._id, formData);
        toast.success('Instructor updated successfully!');
      } else {
        const result = await instructorService.createInstructor(formData);
        console.log('Create result:', result);
        toast.success('Instructor created successfully!');
      }
      fetchInstructors();
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving instructor:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.message;
      toast.error('Error: ' + errorMsg);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      expertise: [],
      permissions: [],
      assignedTenants: []
    });
    setEditingInstructor(null);
  };

  const handleEdit = (instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      password: '',
      expertise: instructor.profile?.expertise || [],
      permissions: instructor.permissions || [],
      assignedTenants: instructor.assignedTenants?.map(t => t._id) || []
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await instructorService.deleteInstructor(id);
      toast.success('Instructor deleted successfully!');
      fetchInstructors();
    } catch (error) {
      toast.error('Error deleting instructor: ' + error.message);
    }
  };

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
            Instructor Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage instructor accounts and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
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
          Add Instructor
        </Button>
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
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Permissions</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Assigned Tenants</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instructors.map((instructor) => (
              <TableRow 
                key={instructor._id}
                sx={{
                  borderBottom: `1px solid ${darkMode ? 'grey.800' : 'grey.200'}`,
                  '&:hover': { 
                    bgcolor: darkMode ? 'grey.800' : 'grey.50',
                    transition: 'background-color 0.2s ease'
                  },
                  '& .MuiTableCell-root': {
                    py: 2.5,
                    fontSize: '0.875rem'
                  }
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{instructor.name}</TableCell>
                <TableCell>{instructor.email}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {instructor.permissions?.map((perm) => (
                      <Chip 
                        key={perm} 
                        label={perm.replace('_', ' ')} 
                        size="small" 
                        sx={{ 
                          bgcolor: darkMode ? 'primary.900' : 'primary.50',
                          color: 'primary.main',
                          fontWeight: 500
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {instructor.assignedTenants?.map((tenant) => (
                      <Chip 
                        key={tenant._id} 
                        label={tenant.name} 
                        size="small" 
                        sx={{ 
                          bgcolor: darkMode ? 'success.900' : 'success.50',
                          color: 'success.main',
                          fontWeight: 500
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                      onClick={() => handleEdit(instructor)}
                      size="small"
                      sx={{
                        bgcolor: darkMode ? 'primary.900' : 'primary.50',
                        color: 'primary.main',
                        '&:hover': { 
                          bgcolor: darkMode ? 'primary.800' : 'primary.100',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(instructor._id)}
                      size="small"
                      sx={{
                        bgcolor: darkMode ? 'error.900' : 'error.50',
                        color: 'error.main',
                        '&:hover': { 
                          bgcolor: darkMode ? 'error.800' : 'error.100',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
          {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ bgcolor: darkMode ? 'grey.900' : 'background.paper', py: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              
              {!editingInstructor && (
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              )}

              <FormControl fullWidth>
                <InputLabel sx={{ color: darkMode ? 'grey.300' : 'text.secondary' }}>Permissions</InputLabel>
                <Select
                  multiple
                  value={formData.permissions}
                  onChange={(e) => setFormData({...formData, permissions: e.target.value})}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {availablePermissions.map((permission) => (
                    <MenuItem key={permission} value={permission}>
                      {permission.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: darkMode ? 'grey.300' : 'text.secondary' }}>Assigned Tenants</InputLabel>
                <Select
                  multiple
                  value={formData.assignedTenants}
                  onChange={(e) => setFormData({...formData, assignedTenants: e.target.value})}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const tenant = tenants.find(t => t._id === value);
                        return <Chip key={value} label={tenant?.name || value} />;
                      })}
                    </Box>
                  )}
                >
                  {tenants.map((tenant) => (
                    <MenuItem key={tenant._id} value={tenant._id}>
                      {tenant.name} ({tenant.domain})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingInstructor ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default InstructorManagement;