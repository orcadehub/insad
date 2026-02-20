import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { Dashboard, Quiz, Assessment, People, BarChart, Business, Code, MenuBook } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTenant } from '../contexts/TenantContext';

const InstructorLayout = () => {
  const { user, loading } = useAuth();
  const { darkMode } = useTheme();
  const { selectedTenant } = useTenant();
  const navigate = useNavigate();
  
  // Force re-render when user changes
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    if (user) {
      forceUpdate({});
      // Redirect to tenant selection if no tenant is selected
      if (!selectedTenant) {
        navigate('/instructor/select-tenant');
      }
    }
  }, [user, selectedTenant, navigate]);

  const getMenuItems = () => {
    if (!user || loading || !user.permissions) return [{ text: 'Dashboard', icon: <Dashboard />, path: '/instructor' }];
    
    const baseItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/instructor' }
    ];
    
    if (user.permissions.includes('create_quizzes')) {
      baseItems.push({ text: 'Quizzes', icon: <Quiz />, path: '/instructor/quizzes' });
    }
    
    if (user.permissions.includes('create_assessments')) {
      baseItems.push({ text: 'Assessments', icon: <Assessment />, path: '/instructor/assessments' });
    }
    
    if (user.permissions.includes('manage_students')) {
      baseItems.push({ text: 'Students', icon: <People />, path: '/instructor/students' });
    }
    
    if (user.permissions.includes('view_reports')) {
      baseItems.push({ text: 'Reports', icon: <BarChart />, path: '/instructor/reports' });
    }
    
    if (user.permissions.includes('manage_company_specific')) {
      baseItems.push({ text: 'Company Specific', icon: <Business />, path: '/instructor/company-specific' });
    }
    
    if (user.permissions.includes('manage_practice_questions')) {
      baseItems.push({ text: 'Practice Questions', icon: <Code />, path: '/instructor/practice' });
    }
    
    if (user.permissions.includes('manage_aptitude_questions')) {
      baseItems.push({ text: 'Aptitude Questions', icon: <Quiz />, path: '/instructor/aptitude' });
    }
    
    if (user.permissions.includes('manage_study_materials')) {
      baseItems.push({ text: 'Study Materials', icon: <MenuBook />, path: '/instructor/study-materials' });
    }
    
    return baseItems;
  };
  
  return (
    <Box className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar key={user?._id} menuItems={getMenuItems()} />
      <Box className="flex-1 flex flex-col">
        <Navbar title="Instructor Portal" />
        <Box className="flex-1 p-6 overflow-auto">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default InstructorLayout;