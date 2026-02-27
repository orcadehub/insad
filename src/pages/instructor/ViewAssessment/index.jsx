import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { useTheme } from '../../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import AssessmentHeader from './AssessmentHeader';
import AssessmentStats from './AssessmentStats';
import AddQuestionDialog from './AddQuestionDialog';

export default function ViewAssessment() {
  const { assessmentId } = useParams();
  const { darkMode } = useTheme();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [availableQuizQuestions, setAvailableQuizQuestions] = useState([]);
  const [availableMongoDBQuestions, setAvailableMongoDBQuestions] = useState([]);
  const [availableFrontendQuestions, setAvailableFrontendQuestions] = useState([]);
  const [availableProgrammingQuestions, setAvailableProgrammingQuestions] = useState([]);
  const [addToAssessmentLoading, setAddToAssessmentLoading] = useState(null);
  const [editAssessmentOpen, setEditAssessmentOpen] = useState(false);

  useEffect(() => {
    fetchAssessment();
    fetchAvailableQuizQuestions();
    if (assessment?.type === 'mongodb') {
      fetchAvailableMongoDBQuestions();
    } else if (assessment?.type === 'frontend') {
      fetchAvailableFrontendQuestions();
    } else if (assessment?.type === 'programming') {
      fetchAvailableProgrammingQuestions();
    }
  }, [assessmentId, assessment?.type]);

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssessment(data);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
      toast.error('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableQuizQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/quiz-questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableQuizQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    }
  };

  const fetchAvailableMongoDBQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/mongodb-playground-questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableMongoDBQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching MongoDB questions:', error);
    }
  };

  const fetchAvailableFrontendQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/frontend-questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableFrontendQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching frontend questions:', error);
    }
  };

  const fetchAvailableProgrammingQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/programming-questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableProgrammingQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching programming questions:', error);
    }
  };

  const addQuizQuestionToAssessment = async (question) => {
    setAddToAssessmentLoading(question._id);
    try {
      const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}/quiz-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ questionId: question._id })
      });
      
      if (response.ok) {
        fetchAssessment();
        toast.success('Quiz question added to assessment');
      } else {
        toast.error('Failed to add quiz question to assessment');
      }
    } catch (error) {
      toast.error('Error adding quiz question to assessment');
    } finally {
      setAddToAssessmentLoading(null);
    }
  };

  const handleRemoveQuizQuestion = async (questionId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/assessments/${assessmentId}/quiz-questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchAssessment();
        toast.success('Quiz question removed from assessment');
      } else {
        toast.error('Failed to remove quiz question from assessment');
      }
    } catch (error) {
      toast.error('Error removing quiz question from assessment');
    }
  };

  if (loading || !assessment) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        Loading...
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: darkMode ? '#0a0e1a' : '#f8fafc', p: 3 }}>
      <AssessmentHeader 
        assessment={assessment} 
        darkMode={darkMode}
        onEdit={() => setEditAssessmentOpen(true)}
      />
      
      <AssessmentStats assessment={assessment} darkMode={darkMode} />

      <AddQuestionDialog
        open={addQuestionOpen}
        onClose={() => setAddQuestionOpen(false)}
        assessment={assessment}
        availableQuizQuestions={availableQuizQuestions}
        availableMongoDBQuestions={availableMongoDBQuestions}
        availableFrontendQuestions={availableFrontendQuestions}
        availableProgrammingQuestions={availableProgrammingQuestions}
        onAddQuizQuestion={addQuizQuestionToAssessment}
        onRemoveQuizQuestion={handleRemoveQuizQuestion}
        addToAssessmentLoading={addToAssessmentLoading}
        darkMode={darkMode}
      />
    </Box>
  );
}
