import { Typography, Box, Grid, Card, CardContent } from '@mui/material';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { aptitudeService } from '../../services/aptitude/aptitudeService';
import { Quiz } from '@mui/icons-material';

const InstructorDashboard = () => {
  const { selectedTenant } = useTenant();
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const hasAptitudePermission = user?.permissions?.includes('manage_aptitude_questions');

  useEffect(() => {
    if (!hasAptitudePermission) return;
    const fetchStats = async () => {
      try {
        const questions = await aptitudeService.getAllQuestions();
        const today = new Date().setHours(0, 0, 0, 0);
        const todayCount = questions.filter(q => new Date(q.createdAt).setHours(0, 0, 0, 0) === today).length;
        setStats({ total: questions.length, today: todayCount });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [hasAptitudePermission]);
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Instructor Dashboard
        </Typography>
        {selectedTenant && (
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Managing: {selectedTenant.name}
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {hasAptitudePermission && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Quiz sx={{ fontSize: 40, color: 'success.main' }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.today}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Aptitude Questions Created Today
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Quiz sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.total}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Overall Aptitude Questions
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default InstructorDashboard;