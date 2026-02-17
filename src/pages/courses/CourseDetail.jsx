import { Box, Typography, Button, Tabs, Tab, List, ListItem, ListItemText } from '@mui/material';
import { PlayArrow, Download, CheckCircle } from '@mui/icons-material';
import { useState } from 'react';
import CustomCard from '../../components/common/Card';

const CourseDetail = () => {
  const [activeTab, setActiveTab] = useState(0);

  const lessons = [
    { id: 1, title: 'Introduction to JavaScript', duration: '15 min', completed: true },
    { id: 2, title: 'Variables and Data Types', duration: '20 min', completed: true },
    { id: 3, title: 'Functions and Scope', duration: '25 min', completed: false },
    { id: 4, title: 'Objects and Arrays', duration: '30 min', completed: false }
  ];

  return (
    <Box className="max-w-6xl mx-auto">
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold mb-2">
          JavaScript Fundamentals
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Master the basics of JavaScript programming language
        </Typography>
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Box className="lg:col-span-2">
          <CustomCard>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Overview" />
              <Tab label="Curriculum" />
              <Tab label="Resources" />
            </Tabs>

            <Box className="mt-4">
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" className="mb-3">Course Description</Typography>
                  <Typography variant="body1" className="mb-4">
                    This comprehensive course covers all the fundamental concepts of JavaScript programming. 
                    You'll learn variables, functions, objects, and much more through hands-on exercises.
                  </Typography>
                  
                  <Typography variant="h6" className="mb-3">What You'll Learn</Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="JavaScript syntax and fundamentals" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Working with variables and data types" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Functions and scope management" />
                    </ListItem>
                  </List>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" className="mb-3">Course Lessons</Typography>
                  <List>
                    {lessons.map((lesson) => (
                      <ListItem key={lesson.id} className="border rounded mb-2">
                        <Box className="flex items-center justify-between w-full">
                          <Box className="flex items-center">
                            {lesson.completed ? (
                              <CheckCircle className="text-green-500 mr-3" />
                            ) : (
                              <PlayArrow className="text-gray-400 mr-3" />
                            )}
                            <Box>
                              <Typography variant="body1">{lesson.title}</Typography>
                              <Typography variant="body2" className="text-gray-500">
                                {lesson.duration}
                              </Typography>
                            </Box>
                          </Box>
                          <Button size="small" variant="outlined">
                            {lesson.completed ? 'Review' : 'Start'}
                          </Button>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" className="mb-3">Course Resources</Typography>
                  <List>
                    <ListItem className="border rounded mb-2">
                      <Download className="mr-3" />
                      <ListItemText primary="Course Slides (PDF)" secondary="2.5 MB" />
                      <Button size="small">Download</Button>
                    </ListItem>
                    <ListItem className="border rounded mb-2">
                      <Download className="mr-3" />
                      <ListItemText primary="Code Examples" secondary="1.2 MB" />
                      <Button size="small">Download</Button>
                    </ListItem>
                  </List>
                </Box>
              )}
            </Box>
          </CustomCard>
        </Box>

        <Box>
          <CustomCard title="Course Progress">
            <Box className="text-center mb-4">
              <Typography variant="h3" className="font-bold text-primary-600">
                50%
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Course Completion
              </Typography>
            </Box>
            
            <Box className="space-y-3">
              <Box className="flex justify-between">
                <Typography variant="body2">Lessons Completed</Typography>
                <Typography variant="body2">2/4</Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography variant="body2">Time Spent</Typography>
                <Typography variant="body2">2.5 hours</Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography variant="body2">Next Lesson</Typography>
                <Typography variant="body2">Functions</Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              className="bg-primary-600 hover:bg-primary-700 mt-4"
              startIcon={<PlayArrow />}
            >
              Continue Learning
            </Button>
          </CustomCard>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseDetail;