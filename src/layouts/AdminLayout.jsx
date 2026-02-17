import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Dashboard, Person, Business, Code } from '@mui/icons-material';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useTheme } from '../contexts/ThemeContext';

const adminMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { text: 'Practice', icon: <Code />, path: '/admin/practice' },
  { text: 'Instructors', icon: <Person />, path: '/admin/instructors' },
  { text: 'Tenants', icon: <Business />, path: '/admin/tenants' }
];

const AdminLayout = () => {
  const { darkMode } = useTheme();
  
  return (
    <Box className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar menuItems={adminMenuItems} />
      <Box className="flex-1 flex flex-col">
        <Navbar title="" />
        <Box className="flex-1 p-6 overflow-auto">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;