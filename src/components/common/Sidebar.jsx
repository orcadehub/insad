import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, IconButton, Tooltip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { DarkMode, LightMode, Menu as MenuIcon } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = ({ menuItems }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, darkMode, toggleDarkMode, toggleSidebar } = useTheme();
  const tenantLogoUrl = import.meta.env.VITE_TENANT_LOGO_URL;

  return (
    <Drawer
      variant="persistent"
      open={true}
      className="sidebar-transition"
      sx={{
        width: sidebarOpen ? 280 : 80,
        '& .MuiDrawer-paper': {
          width: sidebarOpen ? 280 : 80,
          boxSizing: 'border-box',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: 'none',
          background: darkMode 
            ? 'linear-gradient(180deg, #1f2937 0%, #111827 100%)' 
            : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: darkMode 
            ? '4px 0 20px rgba(0, 0, 0, 0.3)' 
            : '4px 0 20px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          minHeight: '70px',
          gap: 2
        }}>
          {sidebarOpen && (
            <img 
              src={tenantLogoUrl}
              alt="Logo"
              style={{ height: '40px', width: 'auto' }}
            />
          )}
          <IconButton 
            onClick={toggleSidebar}
            sx={{
              color: darkMode ? '#f9fafb' : '#1f2937',
              backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)',
              borderRadius: '12px',
              p: 1.5,
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(75, 85, 99, 0.7)' : 'rgba(209, 213, 219, 0.7)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        
        <List sx={{ pt: 2, flex: 1, px: 2 }}>
          {menuItems.map((item) => (
            <Tooltip key={item.text} title={!sidebarOpen ? item.text : ''} placement="right">
              <ListItem
                button
                onClick={() => navigate(item.path)}
                sx={{
                  mb: 1,
                  borderRadius: '16px',
                  minHeight: '52px',
                  px: sidebarOpen ? 2.5 : 0,
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  backgroundColor: location.pathname === item.path
                    ? (darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(25, 118, 210, 0.1)')
                    : 'transparent',
                  border: location.pathname === item.path
                    ? `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(25, 118, 210, 0.2)'}`
                    : '1px solid transparent',
                  color: location.pathname === item.path
                    ? (darkMode ? '#60a5fa' : '#1976d2')
                    : (darkMode ? '#d1d5db' : '#4b5563'),
                  '&:hover': {
                    backgroundColor: location.pathname === item.path
                      ? (darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(25, 118, 210, 0.15)')
                      : (darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)'),
                    transform: 'translateX(4px)',
                    boxShadow: darkMode 
                      ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                      : '0 4px 12px rgba(0, 0, 0, 0.1)'
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 0, 
                  mr: sidebarOpen ? 2 : 0, 
                  justifyContent: 'center',
                  color: 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen && (
                  <ListItemText 
                    primary={item.text} 
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: location.pathname === item.path ? 600 : 500,
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                )}
              </ListItem>
            </Tooltip>
          ))}
        </List>

        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          mt: 'auto'
        }}>
          <Tooltip title={!sidebarOpen ? (darkMode ? 'Light Mode' : 'Dark Mode') : ''} placement="right">
            <IconButton 
              onClick={toggleDarkMode} 
              sx={{
                width: '100%',
                borderRadius: '16px',
                minHeight: '52px',
                px: sidebarOpen ? 2.5 : 0,
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                color: darkMode ? '#d1d5db' : '#4b5563',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)',
                  transform: 'translateX(4px)'
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {darkMode ? <LightMode sx={{ mr: sidebarOpen ? 2 : 0 }} /> : <DarkMode sx={{ mr: sidebarOpen ? 2 : 0 }} />}
              {sidebarOpen && (
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </Typography>
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;