import { Card, CardContent, Typography, Box } from '@mui/material';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <Card className="card-hover">
      <CardContent>
        <Box className="flex items-center justify-between">
          <Box>
            <Typography variant="body2" className="text-gray-600 mb-1">
              {title}
            </Typography>
            <Typography variant="h4" className="font-bold">
              {value}
            </Typography>
          </Box>
          <Box className={`p-3 rounded-full text-white ${color}`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;