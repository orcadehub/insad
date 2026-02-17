import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  IconButton,
  Chip,
  Button
} from '@mui/material';
import { 
  ArrowBack, 
  Code, 
  Games, 
  Web, 
  Api, 
  Storage, 
  Quiz,
  Psychology,
  Security,
  CloudQueue,
  DeviceHub
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const CreateAssessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const [selectedType, setSelectedType] = useState(null);

  const assessmentTypes = [
    {
      id: 'programming',
      title: 'Programming',
      description: 'Code challenges, algorithms, data structures',
      icon: <Code sx={{ fontSize: 40 }} />,
      color: '#3b82f6',
      bgColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
    },
    {
      id: 'gamified-aptitude',
      title: 'Gamified Aptitude',
      description: 'Interactive aptitude tests with game elements',
      icon: <Games sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
      bgColor: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'
    },
    {
      id: 'frontend',
      title: 'Frontend Development',
      description: 'HTML, CSS, JavaScript, React, Vue',
      icon: <Web sx={{ fontSize: 40 }} />,
      color: '#10b981',
      bgColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'
    },
    {
      id: 'backend-api',
      title: 'Backend & API Testing',
      description: 'REST APIs, GraphQL, server-side development',
      icon: <Api sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      bgColor: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)'
    },
    {
      id: 'database',
      title: 'Database & SQL',
      description: 'SQL queries, database design, optimization',
      icon: <Storage sx={{ fontSize: 40 }} />,
      color: '#ef4444',
      bgColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'
    },
    {
      id: 'soft-skills',
      title: 'Soft Skills',
      description: 'Communication, leadership, problem-solving',
      icon: <Psychology sx={{ fontSize: 40 }} />,
      color: '#ec4899',
      bgColor: darkMode ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.05)'
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity',
      description: 'Security concepts, ethical hacking, compliance',
      icon: <Security sx={{ fontSize: 40 }} />,
      color: '#7c3aed',
      bgColor: darkMode ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)'
    },
    {
      id: 'cloud-computing',
      title: 'Cloud Computing',
      description: 'AWS, Azure, GCP, DevOps, containerization',
      icon: <CloudQueue sx={{ fontSize: 40 }} />,
      color: '#0ea5e9',
      bgColor: darkMode ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.05)'
    },
    {
      id: 'system-design',
      title: 'System Design',
      description: 'Architecture, scalability, distributed systems',
      icon: <DeviceHub sx={{ fontSize: 40 }} />,
      color: '#84cc16',
      bgColor: darkMode ? 'rgba(132, 204, 22, 0.1)' : 'rgba(132, 204, 22, 0.05)'
    }
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleCreateAssessment = () => {
    console.log('handleCreateAssessment called', selectedType);
    if (selectedType) {
      console.log('Navigating to:', `/instructor/create-assessment/${selectedType.id}`);
      const { icon, ...assessmentTypeWithoutIcon } = selectedType;
      navigate(`/instructor/create-assessment/${selectedType.id}`, {
        state: {
          ...location.state,
          assessmentType: assessmentTypeWithoutIcon
        }
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton 
          onClick={() => navigate('/instructor/batch-selection', { state: { type: 'assessment' } })}
          sx={{ 
            color: darkMode ? '#94a3b8' : '#64748b',
            '&:hover': {
              color: darkMode ? '#cbd5e1' : '#475569',
              transform: 'translateX(-2px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            background: darkMode 
              ? 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)'
              : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            mb: 0.5
          }}>
            Create Assessment
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Choose the type of assessment you want to create
          </Typography>
        </Box>
      </Box>

      {/* Assessment Type Cards */}
      <Grid container spacing={3}>
        {assessmentTypes.map((type) => (
          <Grid item xs={12} sm={6} md={4} key={type.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                borderRadius: 3,
                boxShadow: selectedType?.id === type.id 
                  ? `0 8px 32px ${type.color}40`
                  : '0 4px 20px rgba(0,0,0,0.08)',
                border: selectedType?.id === type.id 
                  ? `2px solid ${type.color}`
                  : `1px solid ${darkMode ? 'grey.800' : 'grey.200'}`,
                transition: 'all 0.3s ease',
                transform: selectedType?.id === type.id ? 'translateY(-4px)' : 'none',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  borderColor: type.color
                }
              }}
              onClick={() => handleTypeSelect(type)}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: selectedType?.id === type.id ? type.color : type.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    border: `2px solid ${selectedType?.id === type.id ? type.color : type.color + '20'}`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ color: selectedType?.id === type.id ? 'white' : type.color }}>
                    {type.icon}
                  </Box>
                </Box>
                
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: 'text.primary',
                  mb: 2
                }}>
                  {type.title}
                </Typography>
                
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  mb: 2
                }}>
                  {type.description}
                </Typography>

                {selectedType?.id === type.id ? (
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateAssessment();
                    }}
                    sx={{
                      background: `linear-gradient(135deg, ${type.color} 0%, ${type.color}dd 100%)`,
                      color: 'white',
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      boxShadow: `0 4px 12px ${type.color}40`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${type.color}dd 0%, ${type.color}bb 100%)`,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Create Assessment
                  </Button>
                ) : (
                  <Chip 
                    label="Select"
                    sx={{
                      bgcolor: 'transparent',
                      color: type.color,
                      fontWeight: 600,
                      border: `2px solid ${type.color}`,
                      '&:hover': {
                        bgcolor: type.color,
                        color: 'white'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Selected Batches Info */}
      {location.state?.selectedBatches && (
        <Box sx={{ 
          mt: 4, 
          p: 3, 
          borderRadius: 2, 
          bgcolor: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
          border: `1px solid ${darkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Selected Batches:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {location.state.selectedBatches === 'all' 
              ? 'All Batches' 
              : `${location.state.selectedBatches.length} batches selected`
            }
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CreateAssessment;