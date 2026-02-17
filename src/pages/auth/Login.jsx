import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import AuthHeader from '../../components/common/AuthHeader';
import toast from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      const { role } = response.user;
      toast.success(`Welcome back, ${response.user.name}!`);
      
      // Redirect instructors to tenant selection first
      if (role === 'instructor') {
        navigate('/instructor/select-tenant');
      } else {
        navigate(`/${role}`);
      }
      
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: darkMode ? 'grey.900' : 'grey.50',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AuthHeader />
      
      <Container maxWidth="sm" sx={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}>
        <Paper 
          elevation={10} 
          sx={{
            p: 6,
            width: '100%',
            borderRadius: 4,
            bgcolor: darkMode ? 'grey.800' : 'background.paper'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: darkMode ? 'grey.100' : 'grey.800',
                background: 'linear-gradient(135deg, #1976d2 0%, #7c3aed 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Welcome Back
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: darkMode ? 'grey.400' : 'grey.600',
                fontSize: '1.1rem'
              }}
            >
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                bgcolor: darkMode ? 'error.900' : 'error.50'
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'grey.700' : 'grey.50'
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'grey.700' : 'grey.50'
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1,
                  px: 4,
                  borderRadius: 3,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #1976d2 0%, #7c3aed 100%)',
                  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #6a1b9a 100%)',
                    boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    background: darkMode ? 'grey.700' : 'grey.300'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>
          </form>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: darkMode ? 'grey.500' : 'grey.500',
                fontSize: '0.95rem'
              }}
            >
              Contact admin for account access
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;