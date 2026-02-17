import React from 'react';
import ChoiceBasedGame from './components/ChoiceBasedGame';
import InputBasedGame from './components/InputBasedGame';
import DragDropGame from './components/DragDropGame';
import VisualInteractiveGame from './components/VisualInteractiveGame';
import ChartBasedGame from './components/ChartBasedGame';
import CodeEditorGame from './components/CodeEditorGame';
import MemoryGame from './components/MemoryGame';
import MultiLevelContainer from './components/MultiLevelContainer';

// Map game types to UI components
const GAME_COMPONENT_MAP = {
  // Choice-based (40+ games use this)
  'MCQ': 'ChoiceBased',
  'LogicalReasoning': 'ChoiceBased',
  'VerbalReasoning': 'ChoiceBased',
  'Syllogisms': 'ChoiceBased',
  'BloodRelations': 'ChoiceBased',
  'Percentages': 'ChoiceBased',
  'ProfitLoss': 'ChoiceBased',
  'TimeWork': 'ChoiceBased',
  'DataSufficiency': 'ChoiceBased',
  'ReadingComprehension': 'ChoiceBased',
  'SentenceCorrection': 'ChoiceBased',
  'Synonyms': 'ChoiceBased',
  'Antonyms': 'ChoiceBased',
  'Idioms': 'ChoiceBased',
  'CurrentAffairs': 'ChoiceBased',
  'GeneralKnowledge': 'ChoiceBased',
  // ... add 25+ more
  
  // Input-based (15+ games)
  'FillBlanks': 'InputBased',
  'NumberSeries': 'InputBased',
  'LetterSeries': 'InputBased',
  'Calculations': 'InputBased',
  'CodingDecoding': 'InputBased',
  'MathChallenge': 'InputBased',
  'SpeedMath': 'InputBased',
  // ... add 8+ more
  
  // Drag-drop (20+ games)
  'SeatingArrangement': 'DragDrop',
  'Ordering': 'DragDrop',
  'Matching': 'DragDrop',
  'ParaJumbles': 'DragDrop',
  'Ranking': 'DragDrop',
  'PatternCompletion': 'DragDrop',
  'SequenceBuilding': 'DragDrop',
  // ... add 13+ more
  
  // Visual-interactive (15+ games)
  'SpatialReasoning': 'VisualInteractive',
  'PaperFolding': 'VisualInteractive',
  'MirrorImages': 'VisualInteractive',
  'CubeDice': 'VisualInteractive',
  'FigureRotation': 'VisualInteractive',
  'EmbeddedFigures': 'VisualInteractive',
  'VennDiagrams': 'VisualInteractive',
  'DirectionSense': 'VisualInteractive',
  // ... add 7+ more
  
  // Chart-based (10+ games)
  'BarChart': 'ChartBased',
  'LineGraph': 'ChartBased',
  'PieChart': 'ChartBased',
  'TableData': 'ChartBased',
  'MixedChart': 'ChartBased',
  'DataInterpretation': 'ChartBased',
  // ... add 4+ more
  
  // Code editor (10+ games)
  'CodeDebug': 'CodeEditor',
  'OutputPrediction': 'CodeEditor',
  'PseudocodeUnderstanding': 'CodeEditor',
  'AlgorithmSelection': 'CodeEditor',
  'SQLQueries': 'CodeEditor',
  'RegexPatterns': 'CodeEditor',
  // ... add 4+ more
  
  // Memory games (5+ games)
  'SequenceMemory': 'Memory',
  'VisualMemory': 'Memory',
  'NumberMemory': 'Memory',
  'SpotDifference': 'Memory',
  'AttentionDetail': 'Memory'
};

// Component registry
const COMPONENTS = {
  'ChoiceBased': ChoiceBasedGame,
  'InputBased': InputBasedGame,
  'DragDrop': DragDropGame,
  'VisualInteractive': VisualInteractiveGame,
  'ChartBased': ChartBasedGame,
  'CodeEditor': CodeEditorGame,
  'Memory': MemoryGame
};

const GameRenderer = ({ question, onAnswer, onComplete }) => {
  // Determine which component to use
  const componentType = GAME_COMPONENT_MAP[question.gameType] || 'ChoiceBased';
  const GameComponent = COMPONENTS[componentType];
  
  // If multi-level, wrap in MultiLevelContainer
  if (question.isMultiLevel) {
    return (
      <MultiLevelContainer
        question={question}
        onComplete={onComplete}
      >
        {(currentLevel) => (
          <GameComponent
            level={currentLevel}
            onAnswer={onAnswer}
          />
        )}
      </MultiLevelContainer>
    );
  }
  
  // Single level game
  return (
    <GameComponent
      level={question.levels[0]}
      onAnswer={onAnswer}
      onComplete={onComplete}
    />
  );
};

export default GameRenderer;
