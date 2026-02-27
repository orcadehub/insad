import { TextField, InputAdornment, Grid, Box, Typography, Card, Button, Chip, Pagination } from '@mui/material';
import { Search, Storage } from '@mui/icons-material';

export default function MongoDBQuestionsTab({
  availableMongoDBQuestions,
  assessment,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  addToAssessmentLoading,
  darkMode
}) {
  const questionsPerPage = 5;
  
  const filteredQuestions = availableMongoDBQuestions.filter(question =>
    question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  return (
    <Box>
      <TextField
        fullWidth
        placeholder="Search MongoDB questions by title or tags..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      
      <Grid container spacing={2}>
        {paginatedQuestions.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Storage sx={{ fontSize: 48, mb: 2 }} />
              <Typography>
                {searchQuery ? 'No MongoDB questions found matching your search.' : 'No available MongoDB questions.'}
              </Typography>
            </Box>
          </Grid>
        ) : (
          paginatedQuestions.map((question) => (
            <Grid item xs={12} key={question._id}>
              <Card sx={{ 
                p: 2, 
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main'
                }
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {question.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {question.problemStatement?.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip 
                        label={question.difficulty} 
                        size="small" 
                        color={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'error'} 
                      />
                      <Chip 
                        label="MongoDB" 
                        size="small" 
                        sx={{ bgcolor: '#10b981', color: 'white' }}
                      />
                    </Box>
                  </Box>
                  <Button 
                    size="small" 
                    variant="outlined"
                    color="primary"
                    disabled={addToAssessmentLoading === question._id}
                  >
                    Add to Assessment
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))
        )}
        
        {totalPages > 1 && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination 
                count={totalPages}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
