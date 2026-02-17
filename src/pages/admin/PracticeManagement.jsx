import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Skeleton
} from '@mui/material';
import { Add, PlayArrow, Edit, ContentCopy } from '@mui/icons-material';
import api from '../../services/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const PracticeManagement = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSubtopicDialog, setOpenSubtopicDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingSubtopic, setEditingSubtopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionJson, setQuestionJson] = useState('');
  const [fetchingTopics, setFetchingTopics] = useState(true);
  const [fetchingSubtopics, setFetchingSubtopics] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  
  // Gamified Aptitude Sample
  const gamifiedSampleJson = {
    "title": "Treasure Hunt - Level 1",
    "description": "Solve multi-step puzzles to find the treasure",
    "difficulty": "Medium",
    "points": 100,
    "gameType": "TreasureHunt",
    "isMultiLevel": true,
    "totalLevels": 3,
    "hasTimer": true,
    "totalTimeLimit": 300,
    "levels": [
      {
        "levelNumber": 1,
        "levelTitle": "Find the Key",
        "levelDescription": "Solve this riddle to get the key",
        "questionType": "MCQ",
        "question": "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        "options": [
          {"id": "A", "text": "Echo", "isCorrect": true},
          {"id": "B", "text": "Shadow", "isCorrect": false},
          {"id": "C", "text": "Wind", "isCorrect": false},
          {"id": "D", "text": "Voice", "isCorrect": false}
        ],
        "correctAnswer": "A",
        "hints": [
          {"hintNumber": 1, "hintText": "Think about sound", "pointsDeduction": 5}
        ],
        "timeLimit": 60,
        "pointsForLevel": 30,
        "shuffleOptions": true
      },
      {
        "levelNumber": 2,
        "levelTitle": "Unlock the Door",
        "levelDescription": "Use the key to solve this puzzle",
        "questionType": "FillBlank",
        "question": "Complete the sequence: 2, 4, 8, 16, __",
        "correctAnswer": "32",
        "timeLimit": 45,
        "pointsForLevel": 30
      },
      {
        "levelNumber": 3,
        "levelTitle": "Find the Treasure",
        "levelDescription": "Final challenge",
        "questionType": "MCQ",
        "question": "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
        "options": [
          {"id": "A", "text": "Yes", "isCorrect": true},
          {"id": "B", "text": "No", "isCorrect": false},
          {"id": "C", "text": "Maybe", "isCorrect": false}
        ],
        "correctAnswer": "A",
        "timeLimit": 60,
        "pointsForLevel": 40
      }
    ],
    "aiShuffle": {
      "enabled": true,
      "shuffleType": "adaptive",
      "adaptiveSettings": {
        "increaseOnSuccess": true,
        "decreaseOnFailure": true
      }
    },
    "speedBonus": {
      "enabled": true,
      "maxBonus": 20,
      "timeThreshold": 120
    },
    "tags": ["Logic", "Riddles", "Sequences"],
    "order": 1
  };
  
  const sampleQuestionJson = {
    "title": "String Echo",
    "description": "Given a string input, return the same string as output.",
    "difficulty": "Easy",
    "points": 10,
    "example": {
      "input": "Hello World",
      "output": "Hello World",
      "explanation": "Return the input string unchanged."
    },
    "testCases": [
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": "Hello World"
        },
        "output": {
          "dataType": "string",
          "value": "Hello World"
        },
        "isPublic": true,
        "explanation": "Basic string with spaces"
      },
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": "123"
        },
        "output": {
          "dataType": "string",
          "value": "123"
        },
        "isPublic": true,
        "explanation": "Numeric string"
      },
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": "a"
        },
        "output": {
          "dataType": "string",
          "value": "a"
        },
        "isPublic": true,
        "explanation": "Single character"
      },
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": ""
        },
        "output": {
          "dataType": "string",
          "value": ""
        },
        "isPublic": false,
        "explanation": "Empty string"
      },
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": "   leading trailing   "
        },
        "output": {
          "dataType": "string",
          "value": "   leading trailing   "
        },
        "isPublic": false,
        "explanation": "String with leading/trailing spaces"
      },
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": "!@#$%^&*()special chars"
        },
        "output": {
          "dataType": "string",
          "value": "!@#$%^&*()special chars"
        },
        "isPublic": false,
        "explanation": "Special characters"
      },
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": "😊unicode"
        },
        "output": {
          "dataType": "string",
          "value": "😊unicode"
        },
        "isPublic": false,
        "explanation": "Unicode characters"
      },
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": "VeryLongStringWithNoSpaces1234567890abcdefghijklmnopqrstuvwxyz"
        },
        "output": {
          "dataType": "string",
          "value": "VeryLongStringWithNoSpaces1234567890abcdefghijklmnopqrstuvwxyz"
        },
        "isPublic": false,
        "explanation": "Very long string"
      },
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": "only\nnew\nlines"
        },
        "output": {
          "dataType": "string",
          "value": "only\nnew\nlines"
        },
        "isPublic": false,
        "explanation": "Newline characters"
      },
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": "   "
        },
        "output": {
          "dataType": "string",
          "value": "   "
        },
        "isPublic": false,
        "explanation": "Only spaces"
      },
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": "MixedCASE123!@#"
        },
        "output": {
          "dataType": "string",
          "value": "MixedCASE123!@#"
        },
        "isPublic": false,
        "explanation": "Mixed case with numbers and symbols"
      },
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": "\t\r\n"
        },
        "output": {
          "dataType": "string",
          "value": "\t\r\n"
        },
        "isPublic": false,
        "explanation": "Tab and carriage return characters"
      },
      {
        "input": {
          "format": "string",
          "dataType": "string",
          "value": "SingleWord"
        },
        "output": {
          "dataType": "string",
          "value": "SingleWord"
        },
        "isPublic": false,
        "explanation": "Single word without spaces"
      }
    ],
    "intuition": {
      "approach": "Direct Return",
      "timeComplexity": "O(1)",
      "spaceComplexity": "O(1)",
      "keyInsights": [
        "Simply echo input string unchanged",
        "Handle all edge cases including empty/special chars"
      ],
      "algorithmSteps": [
        "Read input string",
        "Return exact same string",
        "No processing or modification needed"
      ]
    },
    "constraints": [
      "0 <= input.length <= 10^5",
      "Input contains any printable ASCII characters + Unicode"
    ],
    "tags": ["String", "Basics"],
    "order": 1
  };
  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    order: 0
  });
  const [subtopicForm, setSubtopicForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    order: 0
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setFetchingTopics(true);
    try {
      const response = await api.get('/admin/practice/topics');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setFetchingTopics(false);
    }
  };

  const fetchSubtopics = async (topicId) => {
    setFetchingSubtopics(true);
    try {
      const response = await api.get(`/admin/practice/topics/${topicId}/subtopics`);
      setSubtopics(response.data);
    } catch (error) {
      console.error('Error fetching subtopics:', error);
    } finally {
      setFetchingSubtopics(false);
    }
  };

  const fetchQuestions = async (subtopicId) => {
    setFetchingQuestions(true);
    try {
      const response = await api.get(`/admin/practice/subtopics/${subtopicId}/questions`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setFetchingQuestions(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!topicForm.title.trim() || !topicForm.description.trim()) return;
    
    setLoading(true);
    try {
      if (editingTopic) {
        await api.put(`/admin/practice/topics/${editingTopic._id}`, topicForm);
      } else {
        await api.post('/admin/practice/topics', topicForm);
      }
      fetchTopics();
      setOpenDialog(false);
      setTopicForm({ title: '', description: '', difficulty: 'Easy', order: 0 });
      setEditingTopic(null);
    } catch (error) {
      console.error('Error saving topic:', error.response?.data || error.message);
      alert('Error saving topic: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title,
      description: topic.description,
      difficulty: topic.difficulty,
      order: topic.order
    });
    setOpenDialog(true);
  };

  const handleManageTopic = (topic) => {
    setSelectedTopic(topic);
    fetchSubtopics(topic._id);
  };

  const handleCreateSubtopic = async () => {
    if (!subtopicForm.title.trim() || !subtopicForm.description.trim()) return;
    
    setLoading(true);
    try {
      if (editingSubtopic) {
        await api.put(`/admin/practice/subtopics/${editingSubtopic._id}`, subtopicForm);
      } else {
        await api.post('/admin/practice/subtopics', {
          ...subtopicForm,
          topicId: selectedTopic._id
        });
      }
      fetchSubtopics(selectedTopic._id);
      setOpenSubtopicDialog(false);
      setSubtopicForm({ title: '', description: '', difficulty: 'Easy', order: 0 });
      setEditingSubtopic(null);
    } catch (error) {
      console.error('Error saving subtopic:', error);
      alert('Error saving subtopic: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubtopic = (subtopic) => {
    setEditingSubtopic(subtopic);
    setSubtopicForm({
      title: subtopic.title,
      description: subtopic.description,
      difficulty: subtopic.difficulty,
      order: subtopic.order
    });
    setOpenSubtopicDialog(true);
  };

  const handleManageQuestions = (subtopic) => {
    setSelectedSubtopic(subtopic);
    fetchQuestions(subtopic._id);
    
    // Auto-load appropriate JSON template based on subtopic title
    const template = getTemplateForSubtopic(subtopic.title);
    if (template) {
      setQuestionJson(JSON.stringify(template, null, 2));
    }
  };

  const getTemplateForSubtopic = (subtopicTitle) => {
    const templates = {
      // LOGICAL REASONING
      'Syllogisms': {
        title: 'Syllogism Question',
        description: 'All cats are animals. All animals need food. Therefore?',
        difficulty: 'Easy',
        points: 10,
        gameType: 'MCQ',
        isMultiLevel: false,
        levels: [{
          levelNumber: 1,
          questionType: 'MCQ',
          question: 'All cats are animals. All animals need food. Therefore, all cats need food.',
          options: [
            {id: 'A', text: 'True', isCorrect: true},
            {id: 'B', text: 'False', isCorrect: false},
            {id: 'C', text: 'Cannot be determined', isCorrect: false}
          ],
          correctAnswer: 'A',
          pointsForLevel: 10
        }],
        tags: ['Logic', 'Reasoning'],
        order: 1
      },
      
      'Blood Relations': {
        title: 'Blood Relation Question',
        description: 'Family relationship puzzle',
        difficulty: 'Medium',
        points: 15,
        gameType: 'MCQ',
        isMultiLevel: false,
        levels: [{
          levelNumber: 1,
          questionType: 'MCQ',
          question: 'A is B\'s sister. B is C\'s father. How is A related to C?',
          options: [
            {id: 'A', text: 'Aunt', isCorrect: true},
            {id: 'B', text: 'Mother', isCorrect: false},
            {id: 'C', text: 'Sister', isCorrect: false},
            {id: 'D', text: 'Grandmother', isCorrect: false}
          ],
          correctAnswer: 'A',
          pointsForLevel: 15
        }],
        tags: ['Relations', 'Logic'],
        order: 1
      },

      'Seating Arrangements': {
        title: 'Seating Arrangement',
        description: 'Arrange people based on given conditions',
        difficulty: 'Hard',
        points: 20,
        gameType: 'DragDrop',
        isMultiLevel: false,
        levels: [{
          levelNumber: 1,
          questionType: 'Ordering',
          question: '5 people A, B, C, D, E sit in a row. A sits next to B. C sits at one end. Where does D sit?',
          options: [
            {id: '1', text: 'Position 1'},
            {id: '2', text: 'Position 2'},
            {id: '3', text: 'Position 3'},
            {id: '4', text: 'Position 4'},
            {id: '5', text: 'Position 5'}
          ],
          correctAnswer: ['C', 'A', 'B', 'D', 'E'],
          pointsForLevel: 20
        }],
        tags: ['Arrangement', 'Logic'],
        order: 1
      },

      // QUANTITATIVE
      'Percentages': {
        title: 'Percentage Problem',
        description: 'Calculate percentage',
        difficulty: 'Easy',
        points: 10,
        gameType: 'MCQ',
        isMultiLevel: false,
        levels: [{
          levelNumber: 1,
          questionType: 'MCQ',
          question: 'What is 25% of 80?',
          options: [
            {id: 'A', text: '15', isCorrect: false},
            {id: 'B', text: '20', isCorrect: true},
            {id: 'C', text: '25', isCorrect: false},
            {id: 'D', text: '30', isCorrect: false}
          ],
          correctAnswer: 'B',
          pointsForLevel: 10
        }],
        tags: ['Math', 'Percentage'],
        order: 1
      },

      'Time & Work': {
        title: 'Time and Work Problem',
        description: 'Calculate work completion time',
        difficulty: 'Medium',
        points: 15,
        gameType: 'MCQ',
        isMultiLevel: false,
        levels: [{
          levelNumber: 1,
          questionType: 'MCQ',
          question: 'A can complete a work in 10 days. B can complete it in 15 days. How many days if they work together?',
          options: [
            {id: 'A', text: '5 days', isCorrect: false},
            {id: 'B', text: '6 days', isCorrect: true},
            {id: 'C', text: '7 days', isCorrect: false},
            {id: 'D', text: '8 days', isCorrect: false}
          ],
          correctAnswer: 'B',
          pointsForLevel: 15
        }],
        tags: ['Math', 'Time-Work'],
        order: 1
      },

      // VERBAL
      'Synonyms & Antonyms': {
        title: 'Synonym Question',
        description: 'Find the synonym',
        difficulty: 'Easy',
        points: 5,
        gameType: 'MCQ',
        isMultiLevel: false,
        levels: [{
          levelNumber: 1,
          questionType: 'MCQ',
          question: 'Synonym of HAPPY:',
          options: [
            {id: 'A', text: 'Sad', isCorrect: false},
            {id: 'B', text: 'Joyful', isCorrect: true},
            {id: 'C', text: 'Angry', isCorrect: false},
            {id: 'D', text: 'Tired', isCorrect: false}
          ],
          correctAnswer: 'B',
          pointsForLevel: 5
        }],
        tags: ['Vocabulary', 'English'],
        order: 1
      },

      'Para Jumbles': {
        title: 'Para Jumble',
        description: 'Arrange sentences in correct order',
        difficulty: 'Medium',
        points: 15,
        gameType: 'DragDrop',
        isMultiLevel: false,
        levels: [{
          levelNumber: 1,
          questionType: 'Ordering',
          question: 'Arrange these sentences in logical order:',
          options: [
            {id: 'A', text: 'He went to the market.'},
            {id: 'B', text: 'He bought vegetables.'},
            {id: 'C', text: 'He cooked dinner.'},
            {id: 'D', text: 'He woke up early.'}
          ],
          correctAnswer: ['D', 'A', 'B', 'C'],
          pointsForLevel: 15
        }],
        tags: ['English', 'Comprehension'],
        order: 1
      },

      // PATTERN RECOGNITION
      'Number Series': {
        title: 'Number Series',
        description: 'Find the next number',
        difficulty: 'Easy',
        points: 10,
        gameType: 'InputBased',
        isMultiLevel: false,
        levels: [{
          levelNumber: 1,
          questionType: 'FillBlank',
          question: 'Complete the series: 2, 4, 8, 16, __',
          correctAnswer: '32',
          hints: [{hintNumber: 1, hintText: 'Each number is double the previous', pointsDeduction: 2}],
          pointsForLevel: 10
        }],
        tags: ['Pattern', 'Math'],
        order: 1
      },

      // SPATIAL REASONING
      'Paper Folding & Cutting': {
        title: 'Paper Folding',
        description: 'Visualize paper folding result',
        difficulty: 'Hard',
        points: 20,
        gameType: 'VisualInteractive',
        isMultiLevel: false,
        levels: [{
          levelNumber: 1,
          questionType: 'MCQ',
          question: 'A paper is folded and cut as shown. How will it look when unfolded?',
          questionImage: 'https://example.com/paper-fold.png',
          options: [
            {id: 'A', text: 'Option A', image: 'https://example.com/option-a.png', isCorrect: true},
            {id: 'B', text: 'Option B', image: 'https://example.com/option-b.png', isCorrect: false},
            {id: 'C', text: 'Option C', image: 'https://example.com/option-c.png', isCorrect: false}
          ],
          correctAnswer: 'A',
          pointsForLevel: 20
        }],
        tags: ['Spatial', 'Visual'],
        order: 1
      },

      // DATA INTERPRETATION
      'Bar Charts': {
        title: 'Bar Chart Analysis',
        description: 'Interpret bar chart data',
        difficulty: 'Medium',
        points: 15,
        gameType: 'ChartBased',
        isMultiLevel: false,
        levels: [{
          levelNumber: 1,
          questionType: 'MCQ',
          question: 'Based on the chart, which year had the highest sales?',
          questionImage: 'https://example.com/bar-chart.png',
          options: [
            {id: 'A', text: '2020', isCorrect: false},
            {id: 'B', text: '2021', isCorrect: true},
            {id: 'C', text: '2022', isCorrect: false}
          ],
          correctAnswer: 'B',
          pointsForLevel: 15
        }],
        tags: ['Data', 'Analysis'],
        order: 1
      },

      // CODING
      'Code Output Prediction': {
        title: 'Predict Code Output',
        description: 'What will this code print?',
        difficulty: 'Medium',
        points: 15,
        gameType: 'CodeEditor',
        isMultiLevel: false,
        levels: [{
          levelNumber: 1,
          questionType: 'MCQ',
          question: 'What is the output?\n```python\nx = 5\nprint(x * 2)\n```',
          options: [
            {id: 'A', text: '5', isCorrect: false},
            {id: 'B', text: '10', isCorrect: true},
            {id: 'C', text: '25', isCorrect: false},
            {id: 'D', text: 'Error', isCorrect: false}
          ],
          correctAnswer: 'B',
          pointsForLevel: 15
        }],
        tags: ['Coding', 'Python'],
        order: 1
      },

      // MEMORY GAMES
      'Sequence Memory': {
        title: 'Remember the Sequence',
        description: 'Memorize and recall the sequence',
        difficulty: 'Medium',
        points: 20,
        gameType: 'Memory',
        isMultiLevel: false,
        hasTimer: true,
        totalTimeLimit: 60,
        levels: [{
          levelNumber: 1,
          questionType: 'Interactive',
          question: 'Remember this sequence: 3, 7, 2, 9, 1',
          correctAnswer: [3, 7, 2, 9, 1],
          timeLimit: 30,
          pointsForLevel: 20
        }],
        tags: ['Memory', 'Cognitive'],
        order: 1
      },

      // MULTI-LEVEL GAMES
      'Treasure Hunt': {
        title: 'Treasure Hunt Challenge',
        description: 'Solve multi-step puzzles to find treasure',
        difficulty: 'Hard',
        points: 100,
        gameType: 'TreasureHunt',
        isMultiLevel: true,
        totalLevels: 3,
        hasTimer: true,
        totalTimeLimit: 300,
        levels: [
          {
            levelNumber: 1,
            levelTitle: 'Find the Key',
            questionType: 'MCQ',
            question: 'Solve the riddle: I have keys but no locks. What am I?',
            options: [
              {id: 'A', text: 'Piano', isCorrect: true},
              {id: 'B', text: 'Door', isCorrect: false},
              {id: 'C', text: 'Map', isCorrect: false}
            ],
            correctAnswer: 'A',
            timeLimit: 60,
            pointsForLevel: 30
          },
          {
            levelNumber: 2,
            levelTitle: 'Unlock the Door',
            questionType: 'FillBlank',
            question: 'Complete: 2, 4, 8, 16, __',
            correctAnswer: '32',
            timeLimit: 45,
            pointsForLevel: 30
          },
          {
            levelNumber: 3,
            levelTitle: 'Find Treasure',
            questionType: 'MCQ',
            question: 'Final puzzle: What comes once in a minute, twice in a moment, but never in a thousand years?',
            options: [
              {id: 'A', text: 'Letter M', isCorrect: true},
              {id: 'B', text: 'Time', isCorrect: false},
              {id: 'C', text: 'Second', isCorrect: false}
            ],
            correctAnswer: 'A',
            timeLimit: 60,
            pointsForLevel: 40
          }
        ],
        aiShuffle: {
          enabled: true,
          shuffleType: 'adaptive'
        },
        speedBonus: {
          enabled: true,
          maxBonus: 20,
          timeThreshold: 120
        },
        tags: ['Multi-level', 'Adventure'],
        order: 1
      },

      'Escape Room': {
        title: 'Escape Room Challenge',
        description: 'Solve puzzles to escape within time limit',
        difficulty: 'Hard',
        points: 150,
        gameType: 'EscapeRoom',
        isMultiLevel: true,
        totalLevels: 5,
        hasTimer: true,
        totalTimeLimit: 600,
        levels: [
          {
            levelNumber: 1,
            levelTitle: 'Room 1: The Lock',
            questionType: 'MCQ',
            question: 'Find the code: If A=1, B=2, C=3, what is CAB?',
            options: [
              {id: 'A', text: '312', isCorrect: true},
              {id: 'B', text: '123', isCorrect: false},
              {id: 'C', text: '321', isCorrect: false}
            ],
            correctAnswer: 'A',
            pointsForLevel: 30
          }
          // Add more levels...
        ],
        aiShuffle: {
          enabled: true,
          shuffleType: 'difficulty-based'
        },
        tags: ['Multi-level', 'Puzzle'],
        order: 1
      },

      'Speed Run': {
        title: 'Speed Math Challenge',
        description: 'Solve as many as possible in 60 seconds',
        difficulty: 'Medium',
        points: 50,
        gameType: 'SpeedRun',
        isMultiLevel: false,
        hasTimer: true,
        totalTimeLimit: 60,
        levels: [{
          levelNumber: 1,
          questionType: 'FillBlank',
          question: '15 + 27 = ?',
          correctAnswer: '42',
          pointsForLevel: 5
        }],
        speedBonus: {
          enabled: true,
          maxBonus: 50,
          timeThreshold: 30
        },
        tags: ['Speed', 'Math'],
        order: 1
      }
    };

    return templates[subtopicTitle] || null;
  };

  const handleCreateQuestion = async () => {
    if (!questionJson.trim()) return;
    
    setLoading(true);
    try {
      const questionData = JSON.parse(questionJson);
      questionData.subTopicId = selectedSubtopic._id;
      
      if (editingQuestion) {
        await api.put(`/admin/practice/questions/${editingQuestion._id}`, questionData);
      } else {
        await api.post('/admin/practice/questions', questionData);
      }
      
      fetchQuestions(selectedSubtopic._id);
      setOpenQuestionDialog(false);
      setQuestionJson('');
      setEditingQuestion(null);
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error: ' + (error.message.includes('JSON') ? 'Invalid JSON format' : error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {selectedSubtopic ? `${selectedSubtopic.title} Questions` : selectedTopic ? `Sub Topic Management for ${selectedTopic.title}` : 'Practice Management'}
        </Typography>
        {selectedSubtopic ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedSubtopic(null);
                setQuestions([]);
              }}
            >
              Back to Subtopics
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenQuestionDialog(true)}
            >
              Add Question
            </Button>
          </Box>
        ) : selectedTopic ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedTopic(null);
                setSubtopics([]);
              }}
            >
              Back to Topics
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenSubtopicDialog(true)}
            >
              Add Subtopic
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Create Topic
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {fetchingQuestions ? (
          Array.from(new Array(8)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : fetchingSubtopics ? (
          Array.from(new Array(8)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : fetchingTopics ? (
          Array.from(new Array(8)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : selectedSubtopic ? (
          questions.map((question) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={question._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {question.title}
                    </Typography>
                    <Chip 
                      label={question.difficulty} 
                      color={question.difficulty === 'Easy' ? 'success' : question.difficulty === 'Medium' ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '3rem', lineHeight: 1.5 }}>
                    {question.description.substring(0, 100)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="caption" color="text.secondary">
                      {question.points} points
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingQuestion(question);
                        const { subTopicId, _id, createdAt, updatedAt, __v, ...questionData } = question;
                        setQuestionJson(JSON.stringify(questionData, null, 2));
                        setOpenQuestionDialog(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : selectedTopic ? (
          subtopics.map((subtopic) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={subtopic._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {subtopic.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSubtopic(subtopic);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '3rem', lineHeight: 1.5 }}>
                    {subtopic.description}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={() => handleManageQuestions(subtopic)}
                    sx={{
                      mt: 'auto',
                      py: 1,
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    Manage Questions
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          topics.map((topic) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={topic._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {topic.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTopic(topic);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '3rem', lineHeight: 1.5 }}>
                    {topic.description}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={() => handleManageTopic(topic)}
                    sx={{
                      mt: 'auto',
                      py: 1,
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    Manage Topic
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: '1.5rem',
          bgcolor: darkMode ? 'grey.800' : 'primary.50',
          color: darkMode ? 'grey.100' : 'primary.main',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'primary.200'}`,
          py: 3
        }}>{editingTopic ? 'Edit Topic' : 'Create New Topic'}</DialogTitle>
        <DialogContent sx={{ bgcolor: darkMode ? 'grey.900' : 'background.paper', py: 3 }}>
          <TextField
            fullWidth
            label="Topic Title"
            value={topicForm.title}
            onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={topicForm.description}
            onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={topicForm.difficulty}
              onChange={(e) => setTopicForm({ ...topicForm, difficulty: e.target.value })}
            >
              <MenuItem value="Easy">Easy</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Hard">Hard</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Order"
            type="number"
            value={topicForm.order}
            onChange={(e) => setTopicForm({ ...topicForm, order: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateTopic}
            disabled={loading || !topicForm.title.trim() || !topicForm.description.trim()}
          >
            {loading ? (editingTopic ? 'Updating...' : 'Creating...') : (editingTopic ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subtopic Dialog */}
      <Dialog 
        open={openSubtopicDialog} 
        onClose={() => setOpenSubtopicDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: '1.5rem',
          bgcolor: darkMode ? 'grey.800' : 'primary.50',
          color: darkMode ? 'grey.100' : 'primary.main',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'primary.200'}`,
          py: 3
        }}>{editingSubtopic ? 'Edit Subtopic' : 'Create New Subtopic'}</DialogTitle>
        <DialogContent sx={{ bgcolor: darkMode ? 'grey.900' : 'background.paper', py: 3 }}>
          <TextField
            fullWidth
            label="Subtopic Title"
            value={subtopicForm.title}
            onChange={(e) => setSubtopicForm({ ...subtopicForm, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={subtopicForm.description}
            onChange={(e) => setSubtopicForm({ ...subtopicForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={subtopicForm.difficulty}
              onChange={(e) => setSubtopicForm({ ...subtopicForm, difficulty: e.target.value })}
            >
              <MenuItem value="Easy">Easy</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Hard">Hard</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Order"
            type="number"
            value={subtopicForm.order}
            onChange={(e) => setSubtopicForm({ ...subtopicForm, order: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubtopicDialog(false)} disabled={loading}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateSubtopic}
            disabled={loading || !subtopicForm.title.trim() || !subtopicForm.description.trim()}
          >
            {loading ? (editingSubtopic ? 'Updating...' : 'Creating...') : (editingSubtopic ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Question Dialog */}
      <Dialog 
        open={openQuestionDialog} 
        onClose={() => setOpenQuestionDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'grey.100' : 'text.primary',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: '1.5rem',
          bgcolor: darkMode ? 'grey.800' : 'primary.50',
          color: darkMode ? 'grey.100' : 'primary.main',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'primary.200'}`,
          py: 3
        }}>{editingQuestion ? 'Edit Question' : 'Create New Question'}</DialogTitle>
        <DialogContent sx={{ bgcolor: darkMode ? 'grey.900' : 'background.paper', py: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {selectedTopic?.title === 'Gamified Aptitude' 
                ? 'Paste your gamified question JSON. This supports multi-level games, timers, and AI shuffle.'
                : 'Paste your question JSON data below. Use this sample format:'}
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setQuestionJson(JSON.stringify(
                selectedTopic?.title === 'Gamified Aptitude' ? gamifiedSampleJson : sampleQuestionJson, 
                null, 2
              ))}
            >
              Load Sample JSON
            </Button>
          </Box>
          
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              label="Question JSON Data"
              multiline
              rows={20}
              value={questionJson}
              onChange={(e) => setQuestionJson(e.target.value)}
              placeholder={JSON.stringify(sampleQuestionJson, null, 2)}
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }
              }}
            />
            <IconButton
              sx={{ 
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
              onClick={() => navigator.clipboard.writeText(questionJson)}
              title="Copy JSON"
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuestionDialog(false)} disabled={loading}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateQuestion}
            disabled={loading || !questionJson.trim()}
          >
            {loading ? (editingQuestion ? 'Updating...' : 'Creating...') : (editingQuestion ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PracticeManagement;