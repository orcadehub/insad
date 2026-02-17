import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { Business } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTenant } from '../../contexts/TenantContext';
import { tenantService } from '../../services/tenant/tenantService';
import toast from 'react-hot-toast';

const TenantSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { setSelectedTenant, tenants, setTenants } = useTenant();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'instructor') {
      fetchInstructorTenants();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchInstructorTenants = async () => {
    try {
      const data = await tenantService.getInstructorTenants();
      setTenants(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setLoading(false);
    }
  };

  const handleTenantSelect = (tenantId) => {
    const tenant = tenants.find(t => t._id === tenantId);
    setSelectedTenant(tenant);
    toast.success(`Selected ${tenant?.name}`);
    navigate('/instructor');
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: darkMode ? 'grey.900' : 'grey.50'
      }}>
        <Typography>Loading tenants...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: darkMode ? 'grey.900' : 'grey.50',
      p: 4
    }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 600 }}>
        Select Your Tenant
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
        Choose a tenant to manage and access your dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto' }}>
        {tenants.map((tenant) => (
          <Grid item xs={12} sm={6} md={4} key={tenant._id}>
            <Card 
              sx={{ 
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
              }}
              onClick={() => handleTenantSelect(tenant._id)}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Business sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                  {tenant.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '0.95rem' }}>
                  {tenant.domain}
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                >
                  Select Tenant
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TenantSelection;