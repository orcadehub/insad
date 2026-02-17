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

const PracticeList = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  
  const topics = [
    { _id: 'programming', title: 'Programming', description: 'Core programming concepts' },
    { _id: 'data-structures', title: 'Data Structures', description: 'Arrays, trees, graphs' },
    { _id: 'algorithms', title: 'Algorithms', description: 'Sorting, searching' }
  ];
  
  const subtopics = [
    { _id: 'arrays', title: 'Arrays', description: 'Array problems', topicId: 'programming', difficulty: 'Easy' },
    { _id: 'strings', title: 'Strings', description: 'String problems', topicId: 'programming', difficulty: 'Easy' },
    { _id: 'linked-lists', title: 'Linked Lists', description: 'List problems', topicId: 'programming', difficulty: 'Medium' }
  ];
  
  // Show topics
  if (!topicId) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 4 }}>Practice Topics</Typography>
        <Grid container spacing={3}>
          {topics.map((topic) => (
            <Grid item xs={12} md={4} key={topic._id}>
              <Card onClick={() => navigate(`/practice/${topic._id}`)} sx={{ cursor: 'pointer' }}>
                <CardContent>
                  <Typography variant="h6">{topic.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{topic.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
  
  // Show subtopics
  const currentSubtopics = subtopics.filter(s => s.topicId === topicId);
  return (
    <Box>
      <Button onClick={() => navigate('/practice')} sx={{ mb: 2 }}>Back to Topics</Button>
      <Typography variant="h4" sx={{ mb: 4 }}>Choose a Subtopic</Typography>
      <Grid container spacing={3}>
        {currentSubtopics.map((subtopic) => (
          <Grid item xs={12} md={4} key={subtopic._id}>
            <Card onClick={() => navigate(`/practice/${topicId}/${subtopic._id}`)} sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Chip label={subtopic.difficulty} size="small" sx={{ mb: 1 }} />
                <Typography variant="h6">{subtopic.title}</Typography>
                <Typography variant="body2" color="text.secondary">{subtopic.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PracticeList;