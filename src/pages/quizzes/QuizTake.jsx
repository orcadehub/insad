import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Timer, CheckCircle } from '@mui/icons-material';
import { quizService } from '../../services/quiz/quizService';
import { useSocket } from '../../contexts/SocketContext';

const QuizTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  // Listen for quiz updates
  useEffect(() => {
    if (socket) {
      console.log('Setting up quiz-updated listener for quiz:', id);
      
      const handleQuizUpdate = (data) => {
        console.log('Received quiz-updated event:', data);
        if (data.quizId === id) {
          console.log('Quiz matches, reloading page');
          window.location.reload();
        }
      };
      
      socket.on('quiz-updated', handleQuizUpdate);

      return () => {
        socket.off('quiz-updated', handleQuizUpdate);
      };
    }
  }, [socket, id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz) {
      handleSubmit();
    }
  }, [timeLeft, quiz]);

  const fetchQuiz = async () => {
    try {
      const data = await quizService.getQuizById(id);
      setQuiz(data);
      setTimeLeft(data.duration * 60); // Convert minutes to seconds
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await quizService.submitQuiz(id, answers);
      navigate('/student/quizzes', { 
        state: { message: 'Quiz submitted successfully!' }
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Typography>Loading quiz...</Typography>;
  if (!quiz) return <Typography>Quiz not found</Typography>;

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const currentQ = quiz.questions[currentQuestion];

  return (
    <Box className="max-w-4xl mx-auto">
      <Paper className="p-6 mb-4">
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h5" className="font-bold">
            {quiz.title}
          </Typography>
          <Box className="flex items-center text-orange-600">
            <Timer className="mr-1" />
            <Typography variant="h6">{formatTime(timeLeft)}</Typography>
          </Box>
        </Box>
        
        <LinearProgress variant="determinate" value={progress} className="mb-4" />
        
        <Typography variant="body2" className="text-gray-600">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </Typography>
      </Paper>

      <Paper className="p-6">
        <Typography variant="h6" className="mb-4">
          {currentQ.question}
        </Typography>

        <RadioGroup
          value={answers[currentQ._id] || ''}
          onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
        >
          {currentQ.options.map((option, index) => (
            <FormControlLabel
              key={index}
              value={option}
              control={<Radio />}
              label={option}
              className="mb-2"
            />
          ))}
        </RadioGroup>

        <Box className="flex justify-between mt-6">
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <Box className="space-x-2">
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => setShowSubmitDialog(true)}
                className="bg-green-600 hover:bg-green-700"
                startIcon={<CheckCircle />}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>Submit Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizTake;