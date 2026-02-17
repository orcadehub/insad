import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Dashboard, Quiz, Assessment, Code } from '@mui/icons-material';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const studentMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/student' },
  { text: 'Quizzes', icon: <Quiz />, path: '/student/quizzes' },
  { text: 'Practice', icon: <Code />, path: '/student/practice' },
  { text: 'Assessments', icon: <Assessment />, path: '/student/assessments' }
];

const StudentLayout = () => {
  return (
    <Box className="flex h-screen bg-gray-50">
      <Sidebar menuItems={studentMenuItems} />
      <Box className="flex-1 flex flex-col">
        <Navbar title="Student Portal" />
        <Box className="flex-1 p-6 overflow-auto">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default StudentLayout;