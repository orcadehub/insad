import { useState, useEffect } from 'react';
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
  Chip,
  IconButton
} from '@mui/material';
import { Add, Edit, Delete, ContentCopy, Refresh, Block, CheckCircle } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const TenantManagement = () => {
  const { darkMode } = useTheme();
  const [tenants, setTenants] = useState([]);
  const [open, setOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [selectedTenantName, setSelectedTenantName] = useState('');
  const [selectedTenantStatus, setSelectedTenantStatus] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [createdTenant, setCreatedTenant] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    adminEmail: '',
    domain: '',
    apiEndpoint: '',
    logoUrl: '',
    faviconUrl: '',
    themeColor: '#1976d2'
  });

  const fetchTenants = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tenants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Failed to fetch tenants');
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTenant 
        ? `http://localhost:4000/api/tenants/${editingTenant._id}`
        : 'http://localhost:4000/api/tenants';
      
      const method = editingTenant ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (!editingTenant && data.tenant?.apiKey) {
          setCreatedTenant(data.tenant);
          setApiKeyOpen(true);
        }
        toast.success(editingTenant ? 'Tenant updated successfully!' : 'Tenant created successfully!');
        fetchTenants();
        setOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        toast.error('Error saving tenant: ' + error.message);
      }
    } catch (error) {
      toast.error('Error saving tenant: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      companyName: '',
      adminEmail: '',
      domain: '',
      apiEndpoint: '',
      logoUrl: '',
      faviconUrl: '',
      themeColor: '#1976d2'
    });
    setEditingTenant(null);
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      companyName: tenant.companyName || tenant.name,
      adminEmail: tenant.adminEmail,
      domain: tenant.domain,
      apiEndpoint: tenant.apiEndpoint,
      logoUrl: tenant.logoUrl || '',
      faviconUrl: tenant.faviconUrl || '',
      themeColor: tenant.themeColor || '#1976d2'
    });
    setOpen(true);
  };

  const regenerateApiKey = async (tenantId) => {
    setSelectedTenantId(tenantId);
    setRegenerateOpen(true);
  };

  const confirmRegenerateApiKey = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/tenants/${selectedTenantId}/regenerate-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNewApiKey(data.apiKey);
        toast.success('API key regenerated successfully!');
        fetchTenants();
      }
    } catch (error) {
      toast.error('Failed to regenerate API key');
    }
  };

  const closeRegenerateModal = () => {
    setRegenerateOpen(false);
    setSelectedTenantId(null);
    setNewApiKey('');
  };

  const toggleTenantStatus = async (tenant) => {
    setSelectedTenantId(tenant._id);
    setSelectedTenantName(tenant.companyName || tenant.name);
    setSelectedTenantStatus(tenant.isActive);
    setStatusOpen(true);
  };

  const confirmStatusToggle = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/tenants/${selectedTenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !selectedTenantStatus })
      });
      
      if (response.ok) {
        toast.success(`Tenant ${!selectedTenantStatus ? 'activated' : 'blocked'} successfully!`);
        fetchTenants();
        setStatusOpen(false);
      } else {
        toast.error('Failed to update tenant status');
      }
    } catch (error) {
      toast.error('Error updating tenant status: ' + error.message);
    }
  };

  const handleDelete = async (tenant) => {
    setSelectedTenantId(tenant._id);
    setSelectedTenantName(tenant.companyName || tenant.name);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/tenants/${selectedTenantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        toast.success('Tenant deleted successfully!');
        fetchTenants();
        setDeleteOpen(false);
      } else {
        toast.error('Failed to delete tenant');
      }
    } catch (error) {
      toast.error('Error deleting tenant: ' + error.message);
    }
  };

  const copyApiKey = (text, type = 'API key') => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const maskString = (str) => {
    if (!str || str.length < 8) return str;
    return `${str.substring(0, 2)}...${str.substring(str.length - 5)}`;
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
            Tenant Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage and monitor all tenant organizations
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
          Add Tenant
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
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Company Name</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Admin Email</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Domain</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Tenant ID</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>API Key</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Last Access</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: darkMode ? 'grey.200' : 'grey.700', py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant, index) => (
              <TableRow 
                key={tenant._id}
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
                <TableCell sx={{ fontWeight: 600 }}>{tenant.companyName || tenant.name}</TableCell>
                <TableCell>{tenant.adminEmail}</TableCell>
                <TableCell>{tenant.domain}</TableCell>
                <TableCell>
                  <Box className="flex items-center space-x-2">
                    <Typography variant="body2" className="font-mono">
                      {maskString(tenant._id)}
                    </Typography>
                    <IconButton size="small" onClick={() => copyApiKey(tenant._id, 'Tenant ID')}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box className="flex items-center space-x-2">
                    <Typography variant="body2" className="font-mono">
                      {maskString(tenant.apiKey)}
                    </Typography>
                    <IconButton size="small" onClick={() => copyApiKey(tenant.apiKey, 'API key')} title="Copy API Key">
                      <ContentCopy fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => regenerateApiKey(tenant._id)} title="Regenerate API Key">
                      <Refresh fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={tenant.isActive ? 'Active' : 'Blocked'} 
                    color={tenant.isActive ? 'success' : 'error'}
                    size="small"
                    onClick={() => toggleTenantStatus(tenant)}
                    sx={{ cursor: 'pointer' }}
                    icon={tenant.isActive ? <CheckCircle /> : <Block />}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {tenant.lastAccess ? new Date(tenant.lastAccess).toLocaleDateString() : 'Never'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                      onClick={() => handleEdit(tenant)}
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
                      onClick={() => handleDelete(tenant)}
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
          {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ bgcolor: darkMode ? 'grey.900' : 'background.paper' }}>
            <Box className="space-y-4">
              <TextField
                fullWidth
                label="Tenant Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              
              <TextField
                fullWidth
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                required
              />
              
              <TextField
                fullWidth
                label="Admin Email"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                required
              />
              
              <TextField
                fullWidth
                label="Domain"
                placeholder="customer.com"
                value={formData.domain}
                onChange={(e) => setFormData({...formData, domain: e.target.value})}
                required
              />
              
              <TextField
                fullWidth
                label="API Endpoint"
                placeholder="https://customer.com/api"
                value={formData.apiEndpoint}
                onChange={(e) => setFormData({...formData, apiEndpoint: e.target.value})}
                required
              />
              
              <TextField
                fullWidth
                label="Logo URL"
                placeholder="https://..."
                value={formData.logoUrl}
                onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
              />
              
              <TextField
                fullWidth
                label="Favicon URL"
                placeholder="https://..."
                value={formData.faviconUrl}
                onChange={(e) => setFormData({...formData, faviconUrl: e.target.value})}
              />
              
              <TextField
                fullWidth
                label="Theme Color"
                type="color"
                value={formData.themeColor}
                onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTenant ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Regenerate API Key Dialog */}
      <Dialog 
        open={regenerateOpen} 
        onClose={closeRegenerateModal} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: darkMode ? 'grey.800' : 'grey.50',
          color: darkMode ? 'grey.100' : 'text.primary',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'grey.200'}`
        }}>Regenerate API Key</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to regenerate the API key? This will invalidate the current key and may break existing integrations.
          </Typography>
          {newApiKey && (
            <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1} border={1} borderColor="divider">
              <Typography variant="body2" gutterBottom color="text.primary">
                <strong>New API Key (copy now, won't be shown again):</strong>
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" className="font-mono" sx={{ wordBreak: 'break-all' }} color="text.primary">
                  {newApiKey}
                </Typography>
                <IconButton size="small" onClick={() => copyApiKey(newApiKey, 'New API key')}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRegenerateModal}>Cancel</Button>
          {!newApiKey && (
            <Button onClick={confirmRegenerateApiKey} variant="contained" color="warning">
              Regenerate
            </Button>
          )}
          {newApiKey && (
            <Button onClick={closeRegenerateModal} variant="contained">
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteOpen} 
        onClose={() => setDeleteOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: darkMode ? 'grey.800' : 'grey.50',
          color: darkMode ? 'grey.100' : 'text.primary',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'grey.200'}`
        }}>Delete Tenant</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{selectedTenantName}</strong>? This action cannot be undone and will permanently remove all associated data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Toggle Confirmation Dialog */}
      <Dialog 
        open={statusOpen} 
        onClose={() => setStatusOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: darkMode ? 'grey.800' : 'grey.50',
          color: darkMode ? 'grey.100' : 'text.primary',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'grey.200'}`
        }}>Change Tenant Status</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to {selectedTenantStatus ? 'block' : 'activate'} <strong>{selectedTenantName}</strong>?
            {selectedTenantStatus && ' This will prevent the tenant from accessing their portal.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmStatusToggle} 
            variant="contained" 
            color={selectedTenantStatus ? 'error' : 'success'}
          >
            {selectedTenantStatus ? 'Block' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* API Key Display Dialog */}
      <Dialog 
        open={apiKeyOpen} 
        onClose={() => setApiKeyOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: darkMode ? 'grey.800' : 'grey.50',
          color: darkMode ? 'grey.100' : 'text.primary',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'grey.200'}`
        }}>Tenant Created Successfully!</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Your tenant has been created. Please copy the API key below as it will only be shown once.
          </Typography>
          
          <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1} border={1} borderColor="divider">
            <Typography variant="body2" gutterBottom color="text.primary">
              <strong>Tenant Details:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              <strong>Name:</strong> {createdTenant?.companyName || createdTenant?.name}<br/>
              <strong>Tenant ID:</strong> {createdTenant?._id}<br/>
              <strong>Domain:</strong> {createdTenant?.domain}
            </Typography>
            
            <Typography variant="body2" gutterBottom color="text.primary">
              <strong>API Key (copy now, won't be shown again):</strong>
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Typography variant="body2" className="font-mono" sx={{ wordBreak: 'break-all', flexGrow: 1 }} color="text.primary">
                {createdTenant?.apiKey}
              </Typography>
              <IconButton size="small" onClick={() => copyApiKey(createdTenant?.apiKey, 'API key')}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyOpen(false)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantManagement;