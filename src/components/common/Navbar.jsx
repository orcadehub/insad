import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, FormControl, Select, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTenant } from '../../contexts/TenantContext';
import { tenantService } from '../../services/tenant/tenantService';
import toast from 'react-hot-toast';

const Navbar = ({ title }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const { selectedTenant, setSelectedTenant, tenants, setTenants } = useTenant();

  useEffect(() => {
    if (user?.role === 'instructor') {
      fetchInstructorTenants();
    }
  }, [user]);

  const fetchInstructorTenants = async () => {
    try {
      const data = await tenantService.getInstructorTenants();
      setTenants(data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleTenantChange = (event) => {
    const tenant = tenants.find(t => t._id === event.target.value);
    setSelectedTenant(tenant);
    toast.success(`Switched to ${tenant?.name}`);
  };

  const handleLogout = () => {
    setLogoutOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setLogoutOpen(false);
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        backgroundColor: darkMode ? '#111827' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1f2937',
        borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
        backdropFilter: 'blur(10px)'
      }}
    >
      <Toolbar sx={{ minHeight: '70px !important', px: 3 }}>
        <Box display="flex" alignItems="center" sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: darkMode ? '#f9fafb' : '#1f2937' }}>
            Welcome, {user?.name || 'User'}
          </Typography>
          {user?.role === 'instructor' && selectedTenant && (
            <Typography variant="body1" sx={{ ml: 3, color: darkMode ? 'grey.400' : 'grey.600' }}>
              Managing: <strong>{selectedTenant.name}</strong>
            </Typography>
          )}
        </Box>

        <div className="flex items-center">
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              borderColor: darkMode ? 'grey.600' : 'grey.300',
              color: darkMode ? 'grey.200' : 'grey.700',
              '&:hover': {
                borderColor: darkMode ? 'grey.500' : 'grey.400',
                bgcolor: darkMode ? 'grey.800' : 'grey.50'
              }
            }}
          >
            Logout
          </Button>
        </div>
      </Toolbar>

      {/* Logout Confirmation Dialog */}
      <Dialog 
        open={logoutOpen} 
        onClose={() => setLogoutOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 600,
          bgcolor: darkMode ? 'grey.800' : 'grey.50',
          color: darkMode ? 'grey.100' : 'text.primary',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'grey.200'}`
        }}>Confirm Logout</DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)}>Cancel</Button>
          <Button onClick={confirmLogout} variant="contained" color="error">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;