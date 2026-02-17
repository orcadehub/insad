import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ArrowBack, Timer, EmojiEvents, Lightbulb } from '@mui/icons-material';
import api from '../../services/api/apiClient';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const GamePlayer = () => {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const { darkMode } = useTheme();
  const [game, setGame] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [usedHints, setUsedHints] = useState([]);

  useEffect(() => {
    fetchGame();
  }, [questionId]);

  useEffect(() => {
    if (game && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, game]);

  const fetchGame = async () => {
    try {
      const response = await api.get(`/admin/practice/questions/${questionId}`);
      setGame(response.data);
      setTimeLeft(response.data.totalTimeLimit || 300);
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  };

  const handleSubmitAnswer = () => {
    const level = game.levels[currentLevel];
    const correct = selectedAnswer === level.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + level.pointsForLevel);
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < game.levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setSelectedAnswer('');
      setShowResult(false);
      setUsedHints([]);
    } else {
      setGameCompleted(true);
    }
  };

  const handleUseHint = (hint) => {
    if (!usedHints.includes(hint.hintNumber)) {
      setUsedHints([...usedHints, hint.hintNumber]);
      setScore(Math.max(0, score - hint.pointsDeduction));
    }
  };

  if (!game) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Typography>Loading game...</Typography>
      </Box>
    );
  }

  const level = game.levels[currentLevel];
  const progress = ((currentLevel + 1) / game.levels.length) * 100;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {game.title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip icon={<Timer />} label={`${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`} color="primary" />
          <Chip icon={<EmojiEvents />} label={`${score} pts`} color="success" />
        </Box>
      </Box>

      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Level {currentLevel + 1} of {game.levels.length}</Typography>
          <Typography variant="body2">{Math.round(progress)}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
      </Box>

      {/* Game Card */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          {level.levelTitle && (
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
              {level.levelTitle}
            </Typography>
          )}
          {level.levelDescription && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {level.levelDescription}
            </Typography>
          )}

          <Typography variant="h6" sx={{ mb: 3, lineHeight: 1.6 }}>
            {level.question}
          </Typography>

          {level.questionType === 'MCQ' && (
            <RadioGroup value={selectedAnswer} onChange={(e) => setSelectedAnswer(e.target.value)}>
              {level.options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={option.text}
                  disabled={showResult}
                  sx={{
                    mb: 1,
                    p: 2,
                    border: '1px solid',
                    borderColor: showResult && option.id === level.correctAnswer ? 'success.main' : 'divider',
                    borderRadius: 2,
                    bgcolor: showResult && option.id === level.correctAnswer ? 'success.light' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                />
              ))}
            </RadioGroup>
          )}

          {level.questionType === 'FillBlank' && (
            <input
              type="text"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              disabled={showResult}
              placeholder="Enter your answer"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                marginTop: '16px'
              }}
            />
          )}

          {/* Hints */}
          {level.hints && level.hints.length > 0 && !showResult && (
            <Box sx={{ mt: 3 }}>
              {level.hints.map((hint) => (
                <Button
                  key={hint.hintNumber}
                  variant="outlined"
                  size="small"
                  startIcon={<Lightbulb />}
                  onClick={() => handleUseHint(hint)}
                  disabled={usedHints.includes(hint.hintNumber)}
                  sx={{ mr: 1, mb: 1 }}
                >
                  {usedHints.includes(hint.hintNumber) ? hint.hintText : `Hint ${hint.hintNumber} (-${hint.pointsDeduction} pts)`}
                </Button>
              ))}
            </Box>
          )}

          {/* Result */}
          {showResult && (
            <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: isCorrect ? 'success.light' : 'error.light' }}>
              <Typography variant="h6" color={isCorrect ? 'success.dark' : 'error.dark'}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {isCorrect ? `+${level.pointsForLevel} points` : `Correct answer: ${level.correctAnswer}`}
              </Typography>
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {!showResult ? (
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={handleNextLevel}
              >
                {currentLevel < game.levels.length - 1 ? 'Next Level' : 'Finish Game'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Game Completed Dialog */}
      <Dialog open={gameCompleted} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '2rem' }}>
          🎉 Game Completed!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
            {score} / {game.points}
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Final Score
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You completed all {game.levels.length} levels!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back to Questions
          </Button>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Play Again
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GamePlayer;
