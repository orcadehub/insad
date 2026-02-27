import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Tabs, Tab, Box } from '@mui/material';
import QuizQuestionsTab from './QuizQuestionsTab';
import MongoDBQuestionsTab from './MongoDBQuestionsTab';
import FrontendQuestionsTab from './FrontendQuestionsTab';
import ProgrammingQuestionsTab from './ProgrammingQuestionsTab';

export default function AddQuestionDialog({ 
  open, 
  onClose, 
  assessment,
  availableQuizQuestions,
  availableMongoDBQuestions,
  availableFrontendQuestions,
  availableProgrammingQuestions,
  onAddQuizQuestion,
  onRemoveQuizQuestion,
  addToAssessmentLoading,
  darkMode
}) {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const isMongoDB = assessment?.type === 'mongodb';
  const isFrontend = assessment?.type === 'frontend';
  const isProgramming = assessment?.type === 'programming';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Add Question to Assessment</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Quiz Questions" />
            {isFrontend && <Tab label="Frontend Questions" />}
            {isProgramming && <Tab label="Programming Questions" />}
            {isMongoDB && <Tab label="MongoDB Questions" />}
          </Tabs>
        </Box>
        
        {tabValue === 0 && (
          <QuizQuestionsTab
            availableQuizQuestions={availableQuizQuestions}
            assessment={assessment}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onAddQuestion={onAddQuizQuestion}
            onRemoveQuestion={onRemoveQuizQuestion}
            addToAssessmentLoading={addToAssessmentLoading}
            darkMode={darkMode}
          />
        )}
        
        {tabValue === 1 && isFrontend && (
          <FrontendQuestionsTab
            availableFrontendQuestions={availableFrontendQuestions}
            assessment={assessment}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            addToAssessmentLoading={addToAssessmentLoading}
            darkMode={darkMode}
          />
        )}
        
        {tabValue === 1 && isProgramming && (
          <ProgrammingQuestionsTab
            availableProgrammingQuestions={availableProgrammingQuestions}
            assessment={assessment}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            addToAssessmentLoading={addToAssessmentLoading}
            darkMode={darkMode}
          />
        )}
        
        {tabValue === 1 && isMongoDB && (
          <MongoDBQuestionsTab
            availableMongoDBQuestions={availableMongoDBQuestions}
            assessment={assessment}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            addToAssessmentLoading={addToAssessmentLoading}
            darkMode={darkMode}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
