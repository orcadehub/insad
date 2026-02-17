import { Typography, Box } from '@mui/material';

const TaskList = () => {
  return (
    <Box>
      <Typography variant="h4" className="font-bold mb-6">
        Daily Tasks
      </Typography>
      <Typography variant="body1">
        Daily tasks and study plans will be implemented here.
      </Typography>
    </Box>
  );
};

export default TaskList;