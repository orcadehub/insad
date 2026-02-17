import { useState } from 'react';
import { Box, TextField, Button, Typography, Grid, Chip } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

export default function CreateFrontendQuestionForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    title: '',
    problemStatement: '',
    requirements: [''],
    acceptanceCriteria: [''],
    jestTestFile: '',
    difficulty: 'medium',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  const handleAddRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] });
  };

  const handleRemoveRequirement = (index) => {
    setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== index) });
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleAddCriteria = () => {
    setFormData({ ...formData, acceptanceCriteria: [...formData.acceptanceCriteria, ''] });
  };

  const handleRemoveCriteria = (index) => {
    setFormData({ ...formData, acceptanceCriteria: formData.acceptanceCriteria.filter((_, i) => i !== index) });
  };

  const handleCriteriaChange = (index, value) => {
    const newCriteria = [...formData.acceptanceCriteria];
    newCriteria[index] = value;
    setFormData({ ...formData, acceptanceCriteria: newCriteria });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Box sx={{ maxHeight: '60vh', overflow: 'auto', pr: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Question Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Problem Statement (use \n for new line, \t for tab)"
            value={formData.problemStatement}
            onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
            required
            helperText="Detailed SRS description"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Requirements
          </Typography>
          {formData.requirements.map((req, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label={`Requirement ${index + 1}`}
                value={req}
                onChange={(e) => handleRequirementChange(index, e.target.value)}
              />
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveRequirement(index)}
                disabled={formData.requirements.length === 1}
              >
                <Delete />
              </Button>
            </Box>
          ))}
          <Button startIcon={<Add />} onClick={handleAddRequirement} variant="outlined">
            Add Requirement
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Acceptance Criteria
          </Typography>
          {formData.acceptanceCriteria.map((criteria, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label={`Criteria ${index + 1}`}
                value={criteria}
                onChange={(e) => handleCriteriaChange(index, e.target.value)}
              />
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveCriteria(index)}
                disabled={formData.acceptanceCriteria.length === 1}
              >
                <Delete />
              </Button>
            </Box>
          ))}
          <Button startIcon={<Add />} onClick={handleAddCriteria} variant="outlined">
            Add Criteria
          </Button>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Jest Test File (Read-only for students)"
            value={formData.jestTestFile}
            onChange={(e) => setFormData({ ...formData, jestTestFile: e.target.value })}
            required
            helperText="Complete Jest test suite"
            placeholder="describe('Test Suite', () => { ... });"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Difficulty"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label="Add Tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button variant="outlined" onClick={handleAddTag}>
              <Add />
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {formData.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                color="primary"
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.problemStatement || !formData.jestTestFile}
          >
            {loading ? 'Creating...' : 'Create Frontend Question'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
