import { Typography, Box } from '@mui/material';
import { useTenant } from '../../contexts/TenantContext';

const InstructorDashboard = () => {
  const { selectedTenant } = useTenant();
  
  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-bold">
          Instructor Dashboard
        </Typography>
        {selectedTenant && (
          <Typography variant="h6" className="text-gray-600">
            Managing: {selectedTenant.name}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default InstructorDashboard;