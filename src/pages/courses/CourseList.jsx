import { Grid, Typography, Box, Button, Chip, Avatar } from '@mui/material';
import { PlayArrow, Person, Schedule } from '@mui/icons-material';
import CustomCard from '../../components/common/Card';

const CourseList = () => {
  const courses = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Learn the basics of JavaScript programming',
      instructor: 'John Smith',
      duration: '8 weeks',
      level: 'Beginner',
      enrolled: 156,
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'React Development',
      description: 'Build modern web applications with React',
      instructor: 'Jane Doe',
      duration: '12 weeks',
      level: 'Intermediate',
      enrolled: 89,
      image: '/api/placeholder/300/200'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" className="font-bold mb-6">
        Available Courses
      </Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course.id}>
            <CustomCard>
              <Box className="h-48 bg-gray-200 rounded mb-4 flex items-center justify-center">
                <Typography variant="body2" className="text-gray-500">
                  Course Image
                </Typography>
              </Box>
              
              <Box className="flex items-start justify-between mb-2">
                <Typography variant="h6" className="font-semibold">
                  {course.title}
                </Typography>
                <Chip 
                  label={course.level} 
                  size="small"
                  color={course.level === 'Beginner' ? 'success' : 'warning'}
                />
              </Box>
              
              <Typography variant="body2" className="text-gray-600 mb-4">
                {course.description}
              </Typography>

              <Box className="space-y-2 mb-4">
                <Box className="flex items-center text-gray-500">
                  <Person className="w-4 h-4 mr-2" />
                  <Typography variant="body2">{course.instructor}</Typography>
                </Box>
                <Box className="flex items-center text-gray-500">
                  <Schedule className="w-4 h-4 mr-2" />
                  <Typography variant="body2">{course.duration}</Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                startIcon={<PlayArrow />}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Enroll Now
              </Button>
            </CustomCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CourseList;