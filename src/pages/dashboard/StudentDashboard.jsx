import { Grid, Typography, Box } from '@mui/material';
import { School, Quiz, Assignment, TrendingUp } from '@mui/icons-material';
import CustomCard from '../../components/common/Card';
import StatsCard from '../../components/common/StatsCard';

const StudentDashboard = () => {
  const stats = [
    { title: 'Enrolled Courses', value: '5', icon: <School />, color: 'bg-blue-500' },
    { title: 'Completed Quizzes', value: '12', icon: <Quiz />, color: 'bg-green-500' },
    { title: 'Pending Tasks', value: '3', icon: <Assignment />, color: 'bg-orange-500' },
    { title: 'Progress', value: '78%', icon: <TrendingUp />, color: 'bg-purple-500' }
  ];

  return (
    <Box>
      <Typography variant="h4" className="font-bold mb-6">
        Welcome Back!
      </Typography>

      <Grid container spacing={3} className="mb-6">
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <CustomCard title="Recent Activity">
            <Box className="space-y-3">
              <Box className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Typography>Completed: JavaScript Basics Quiz</Typography>
                <Typography variant="body2" className="text-gray-500">2 hours ago</Typography>
              </Box>
              <Box className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Typography>Started: React Components Course</Typography>
                <Typography variant="body2" className="text-gray-500">1 day ago</Typography>
              </Box>
              <Box className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Typography>Submitted: HTML Assignment</Typography>
                <Typography variant="body2" className="text-gray-500">2 days ago</Typography>
              </Box>
            </Box>
          </CustomCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <CustomCard title="Upcoming Deadlines">
            <Box className="space-y-3">
              <Box className="p-3 border-l-4 border-red-500 bg-red-50">
                <Typography className="font-semibold">CSS Project</Typography>
                <Typography variant="body2" className="text-red-600">Due in 2 days</Typography>
              </Box>
              <Box className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                <Typography className="font-semibold">Python Quiz</Typography>
                <Typography variant="body2" className="text-yellow-600">Due in 5 days</Typography>
              </Box>
            </Box>
          </CustomCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;