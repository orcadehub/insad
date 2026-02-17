import { AppBar, Toolbar, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const AuthHeader = () => {
  const { isAuthenticated } = useAuth();
  const { darkMode } = useTheme();
  const logoUrl = import.meta.env.VITE_TENANT_LOGO_URL;

  return (
    <Box sx={{ px: 2, pt: 2 }}>
      <AppBar 
        position="static" 
        elevation={3}
        sx={{
          backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
          color: darkMode ? '#ffffff' : '#000000',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '2px solid #6a0dad',
          boxShadow: '0 0 20px rgba(106, 13, 173, 0.3), 0 0 40px rgba(106, 13, 173, 0.1)',
          animation: 'shine 2s ease-in-out infinite alternate',
          '@keyframes shine': {
            '0%': {
              boxShadow: '0 0 20px rgba(106, 13, 173, 0.3), 0 0 40px rgba(106, 13, 173, 0.1)'
            },
            '100%': {
              boxShadow: '0 0 30px rgba(106, 13, 173, 0.6), 0 0 60px rgba(106, 13, 173, 0.3)'
            }
          }
        }}
      >
        <Toolbar sx={{ minHeight: '80px', px: 4 }}>
          <Box className="flex items-center space-x-3">
            <img 
              src={logoUrl}
              alt="Logo"
              style={{ height: '48px', width: 'auto' }}
            />
          </Box>
          
          <Box className="flex-1" />
          
          <Box className="flex items-center space-x-3">
            {!isAuthenticated && (
              <Button 
                variant="contained"
                component={Link} 
                to="/login"
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  bgcolor: '#6a0dad',
                  '&:hover': {
                    bgcolor: '#5a0b9a',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default AuthHeader;