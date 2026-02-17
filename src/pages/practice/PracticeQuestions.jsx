import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  Button
} from '@mui/material';

const PracticeQuestions = () => {
  const { topicId, subtopicId } = useParams();
  const navigate = useNavigate();
  
  const questions = [
    { _id: '1', title: 'Two Sum', difficulty: 'Easy', points: 10 },
    { _id: '2', title: 'Reverse Array', difficulty: 'Easy', points: 5 },
    { _id: '3', title: 'Valid Palindrome', difficulty: 'Easy', points: 10 },
    { _id: '4', title: 'Binary Search', difficulty: 'Medium', points: 15 }
  ];

  return (
    <Box>
      <Button onClick={() => navigate(`/practice/${topicId}`)} sx={{ mb: 2 }}>
        Back to Subtopics
      </Button>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Practice Questions - {subtopicId}
      </Typography>
      <Grid container spacing={3}>
        {questions.map((question) => (
          <Grid item xs={12} md={4} key={question._id}>
            <Card sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Chip 
                  label={question.difficulty} 
                  color={question.difficulty === 'Easy' ? 'success' : 'warning'}
                  size="small" 
                  sx={{ mb: 1 }} 
                />
                <Typography variant="h6">{question.title}</Typography>
                <Typography variant="body2" color="primary">
                  {question.points} points
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PracticeQuestions;