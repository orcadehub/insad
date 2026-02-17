import { useState, useEffect } from 'react';
import { Grid, Typography, Box, Button, Chip } from '@mui/material';
import { PlayArrow, Timer, Quiz } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../../components/common/Card';
import { quizService } from '../../services/quiz/quizService';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await quizService.getQuizzes();
      setQuizzes(data.data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/student/quizzes/${quizId}`);
  };

  if (loading) return <Typography>Loading quizzes...</Typography>;

  return (
    <Box>
      <Typography variant="h4" className="font-bold mb-6">
        Available Quizzes
      </Typography>

      <Grid container spacing={3}>
        {quizzes.map((quiz) => (
          <Grid item xs={12} md={6} lg={4} key={quiz._id}>
            <CustomCard>
              <Box className="flex items-start justify-between mb-3">
                <Quiz className="text-primary-500" />
                <Chip 
                  label={quiz.difficulty} 
                  size="small"
                  color={quiz.difficulty === 'Easy' ? 'success' : quiz.difficulty === 'Medium' ? 'warning' : 'error'}
                />
              </Box>
              
              <Typography variant="h6" className="font-semibold mb-2">
                {quiz.title}
              </Typography>
              
              <Typography variant="body2" className="text-gray-600 mb-4">
                {quiz.description}
              </Typography>

              <Box className="flex items-center justify-between mb-4">
                <Box className="flex items-center text-gray-500">
                  <Timer className="w-4 h-4 mr-1" />
                  <Typography variant="body2">{quiz.duration} min</Typography>
                </Box>
                <Typography variant="body2" className="text-gray-500">
                  {quiz.questions?.length} questions
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => handleStartQuiz(quiz._id)}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Start Quiz
              </Button>
            </CustomCard>
          </Grid>
        ))}
      </Grid>

      {quizzes.length === 0 && (
        <Box className="text-center py-12">
          <Typography variant="h6" className="text-gray-500">
            No quizzes available at the moment
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default QuizList;