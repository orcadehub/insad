import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, IconButton, Paper, Tooltip, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { ArrowBack, Save, Add, Delete, DragIndicator, Title, FormatListBulleted, TableChart, Code as CodeIcon, TextFields, Visibility, Image as ImageIcon, MenuBook, LightMode, DarkMode } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const StudyMaterialEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    estimatedDuration: '',
    chapters: []
  });
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);
  const [previewMode, setPreviewMode] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', index: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchMaterial();
    }
  }, [id]);

  const fetchMaterial = async () => {
    try {
      const token = localStorage.getItem('instructorToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/study-materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      toast.error('Error fetching material');
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('instructorToken');
      const url = id === 'new'
        ? `${import.meta.env.VITE_API_URL}/api/study-materials`
        : `${import.meta.env.VITE_API_URL}/api/study-materials/${id}`;
      
      const response = await fetch(url, {
        method: id === 'new' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Saved successfully!');
        navigate('/instructor/study-materials');
      }
    } catch (error) {
      toast.error('Error saving material');
    } finally {
      setSaving(false);
    }
  };

  const addChapter = () => {
    setFormData({
      ...formData,
      chapters: [...formData.chapters, { title: 'New Chapter', order: formData.chapters.length + 1, lessons: [] }]
    });
    setActiveChapter(formData.chapters.length);
  };

  const addLesson = () => {
    const updated = [...formData.chapters];
    updated[activeChapter].lessons.push({
      title: 'New Lesson',
      order: updated[activeChapter].lessons.length + 1,
      content: ''
    });
    setFormData({ ...formData, chapters: updated });
    setActiveLesson(updated[activeChapter].lessons.length - 1);
  };

  const updateChapter = (field, value) => {
    const updated = [...formData.chapters];
    updated[activeChapter][field] = value;
    setFormData({ ...formData, chapters: updated });
  };

  const updateLesson = (field, value) => {
    const updated = [...formData.chapters];
    updated[activeChapter].lessons[activeLesson][field] = value;
    setFormData({ ...formData, chapters: updated });
  };

  const deleteChapter = (index) => {
    const updated = formData.chapters.filter((_, i) => i !== index);
    setFormData({ ...formData, chapters: updated });
    setActiveChapter(Math.max(0, index - 1));
    setDeleteDialog({ open: false, type: '', index: null });
  };

  const deleteLesson = (index) => {
    const updated = [...formData.chapters];
    updated[activeChapter].lessons = updated[activeChapter].lessons.filter((_, i) => i !== index);
    setFormData({ ...formData, chapters: updated });
    setActiveLesson(Math.max(0, index - 1));
    setDeleteDialog({ open: false, type: '', index: null });
  };

  const addContentBlock = (type) => {
    const updated = [...formData.chapters];
    const lesson = updated[activeChapter].lessons[activeLesson];
    
    switch(type) {
      case 'heading':
        lesson.content += '\n<h2>Heading</h2>';
        break;
      case 'paragraph':
        lesson.content += '\n<p>Your paragraph text here...</p>';
        break;
      case 'list':
        lesson.content += '\n<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
        break;
      case 'table':
        lesson.content += '\n<table><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Data 1</td><td>Data 2</td></tr></table>';
        break;
      case 'code':
        lesson.content += '\n<pre><code>// Your code here\n</code></pre>';
        break;
      case 'image':
        lesson.content += '\n<img src="https://via.placeholder.com/600x400" alt="Description" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />';
        break;
    }
    
    setFormData({ ...formData, chapters: updated });
  };

  const currentChapter = formData.chapters[activeChapter];
  const currentLesson = currentChapter?.lessons[activeLesson];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        p: 2.5, 
        bgcolor: darkMode ? '#1e293b' : 'white', 
        borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <IconButton 
          onClick={() => navigate('/instructor/study-materials')} 
          sx={{ 
            bgcolor: darkMode ? '#334155' : '#f1f5f9',
            '&:hover': { bgcolor: darkMode ? '#475569' : '#e2e8f0' }
          }}
        >
          <ArrowBack />
        </IconButton>
        <TextField
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Material Title"
          variant="standard"
          sx={{ 
            flexGrow: 1, 
            '& input': { fontSize: '1.75rem', fontWeight: 700, color: darkMode ? '#f1f5f9' : '#0f172a' },
            '& .MuiInput-underline:before': { borderBottomColor: darkMode ? '#475569' : '#cbd5e1' },
            '& .MuiInput-underline:hover:before': { borderBottomColor: darkMode ? '#64748b' : '#94a3b8' }
          }}
        />
        <Button 
          variant="contained" 
          size="large"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />} 
          onClick={handleSubmit}
          disabled={saving}
          sx={{ 
            px: 4, 
            py: 1.5,
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: darkMode ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 4px 12px rgba(25, 118, 210, 0.2)'
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <IconButton
          onClick={() => document.dispatchEvent(new CustomEvent('toggleTheme'))}
          sx={{
            bgcolor: darkMode ? '#334155' : '#f1f5f9',
            '&:hover': { bgcolor: darkMode ? '#475569' : '#e2e8f0' }
          }}
        >
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <Box sx={{ 
          width: 400, 
          bgcolor: darkMode ? '#1e293b' : 'white', 
          borderRight: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: darkMode ? '4px 0 12px rgba(0,0,0,0.3)' : '4px 0 12px rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
            <Typography variant="overline" sx={{ fontWeight: 700, mb: 2, color: darkMode ? '#94a3b8' : '#64748b', letterSpacing: 1.2 }}>
              Material Info
            </Typography>
            <TextField
              size="small"
              label="Category"
              value={formData.category}
              fullWidth
              sx={{ mb: 2 }}
              disabled
              InputProps={{ readOnly: true }}
            />
            <TextField
              size="small"
              label="Duration"
              value={formData.estimatedDuration}
              placeholder="e.g., 8 hours"
              fullWidth
              disabled
              InputProps={{ readOnly: true }}
            />
          </Box>

          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="overline" sx={{ fontWeight: 700, color: darkMode ? '#94a3b8' : '#64748b', letterSpacing: 1.2 }}>
                Chapters
              </Typography>
            </Box>

            {formData.chapters.map((chapter, idx) => (
              <Box key={idx}>
                <Paper
                  onClick={() => setActiveChapter(idx)}
                  elevation={activeChapter === idx ? 4 : 0}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: activeChapter === idx ? (darkMode ? '#3b82f6' : '#1976d2') : (darkMode ? '#334155' : '#f8fafc'),
                    color: activeChapter === idx ? 'white' : 'inherit',
                    border: activeChapter === idx ? 'none' : `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: activeChapter === idx ? (darkMode ? '#2563eb' : '#1565c0') : (darkMode ? '#475569' : '#f1f5f9'),
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <DragIndicator fontSize="small" sx={{ opacity: 0.6 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                      {chapter.title}
                    </Typography>
                  </Box>
                </Paper>

                {activeChapter === idx && (
                  <Box sx={{ ml: 2, mb: 2 }}>
                    {chapter.lessons?.map((lesson, lIdx) => (
                      <Paper
                        key={lIdx}
                        onClick={() => setActiveLesson(lIdx)}
                        elevation={activeLesson === lIdx ? 2 : 0}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          borderRadius: 1.5,
                          cursor: 'pointer',
                          bgcolor: activeLesson === lIdx ? (darkMode ? '#f59e0b' : '#ff9800') : (darkMode ? '#1e293b' : 'white'),
                          color: activeLesson === lIdx ? 'white' : 'inherit',
                          border: `1px solid ${activeLesson === lIdx ? 'transparent' : (darkMode ? '#334155' : '#e2e8f0')}`,
                          transition: 'all 0.2s',
                          '&:hover': { 
                            bgcolor: activeLesson === lIdx ? (darkMode ? '#d97706' : '#f57c00') : (darkMode ? '#334155' : '#f8fafc'),
                            transform: 'translateX(4px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ flexGrow: 1, fontWeight: 500 }}>
                            {lesson.title}
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                    <Button 
                      size="small" 
                      startIcon={<Add />} 
                      onClick={addLesson} 
                      fullWidth 
                      variant="outlined"
                      sx={{ 
                        mt: 1.5,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        fontWeight: 600
                      }}
                    >
                      Add Lesson
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {currentChapter && currentLesson ? (
            <>
              <Box sx={{ 
                p: 3, 
                bgcolor: darkMode ? '#1e293b' : 'white', 
                borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.05)'
              }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    value={currentChapter.title}
                    placeholder="Chapter Title"
                    size="small"
                    sx={{ width: 320 }}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    value={currentLesson.title}
                    onChange={(e) => updateLesson('title', e.target.value)}
                    placeholder="Lesson Title"
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                </Box>
              </Box>

              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 4, bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
                <Tabs 
                  value={previewMode} 
                  onChange={(e, val) => setPreviewMode(val)} 
                  sx={{ 
                    mb: 3,
                    '& .MuiTab-root': { fontWeight: 600, fontSize: '0.95rem' }
                  }}
                >
                  <Tab label="Edit" />
                  <Tab label="Preview" icon={<Visibility />} iconPosition="start" />
                </Tabs>

                {previewMode === 0 ? (
                  <Paper 
                    elevation={3}
                    sx={{ 
                      p: 4, 
                      bgcolor: darkMode ? '#1e293b' : 'white',
                      borderRadius: 3
                    }}
                  >
                    <Typography variant="overline" sx={{ fontWeight: 700, mb: 2, color: darkMode ? '#94a3b8' : '#64748b', letterSpacing: 1.2, display: 'block' }}>
                      Lesson Content
                    </Typography>
                    <TextField
                      value={currentLesson.content}
                      onChange={(e) => updateLesson('content', e.target.value)}
                      multiline
                      rows={22}
                      fullWidth
                      placeholder="Write your lesson content here... (HTML supported)"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'monospace',
                          fontSize: '0.9rem'
                        }
                      }}
                    />
                  </Paper>
                ) : (
                  <Paper 
                    elevation={3}
                    sx={{ 
                      p: 4, 
                      bgcolor: darkMode ? '#1e293b' : 'white',
                      borderRadius: 3,
                      minHeight: 600
                    }}
                  >
                    <Typography variant="overline" sx={{ fontWeight: 700, mb: 3, color: darkMode ? '#94a3b8' : '#64748b', letterSpacing: 1.2, display: 'block' }}>
                      Preview
                    </Typography>
                    <Box sx={{ 
                      '& h1, & h2, & h3, & h4, & h5, & h6': { fontWeight: 700, mb: 2, color: darkMode ? '#f1f5f9' : '#0f172a' },
                      '& h1': { fontSize: '2.5rem' },
                      '& h2': { fontSize: '1.75rem' }, 
                      '& h3': { fontSize: '1.5rem' },
                      '& h4': { fontSize: '1.25rem' },
                      '& p': { mb: 2.5, lineHeight: 1.8, fontSize: '1rem' }, 
                      '& ul, & ol': { mb: 2.5, pl: 4, lineHeight: 1.8 }, 
                      '& li': { mb: 1 },
                      '& table': { width: '100%', borderCollapse: 'collapse', mb: 3, borderRadius: 2, overflow: 'hidden' }, 
                      '& th': { bgcolor: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#f1f5f9' : '#0f172a', fontWeight: 700, p: 2, textAlign: 'left', borderBottom: `2px solid ${darkMode ? '#475569' : '#cbd5e1'}` },
                      '& td': { p: 2, borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }, 
                      '& pre': { bgcolor: darkMode ? '#0f172a' : '#1e293b', color: '#e2e8f0', p: 3, borderRadius: 2, overflow: 'auto', mb: 3, border: `1px solid ${darkMode ? '#334155' : '#475569'}` }, 
                      '& code': { fontFamily: 'monospace', fontSize: '0.9rem' },
                      '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2, boxShadow: darkMode ? '0 8px 16px rgba(0,0,0,0.4)' : '0 8px 16px rgba(0,0,0,0.1)' },
                      '& a': { color: darkMode ? '#60a5fa' : '#1976d2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
                      '& blockquote': { borderLeft: `4px solid ${darkMode ? '#3b82f6' : '#1976d2'}`, pl: 3, py: 1, my: 2, fontStyle: 'italic', color: darkMode ? '#94a3b8' : '#64748b' },
                      '& strong, & b': { fontWeight: 700 },
                      '& em, & i': { fontStyle: 'italic' },
                      '& hr': { border: 'none', borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, my: 3 },
                      '& *': { maxWidth: '100%' }
                    }}>
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                    </Box>
                  </Paper>
                )}
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
              <Box sx={{ textAlign: 'center', p: 6 }}>
                <MenuBook sx={{ fontSize: 100, color: darkMode ? '#475569' : '#cbd5e1', mb: 3 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: darkMode ? '#f1f5f9' : '#0f172a' }}>
                  No content selected
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Start by creating your first chapter
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<Add />} 
                  onClick={addChapter}
                  sx={{ px: 4, py: 1.5, fontWeight: 600, borderRadius: 2 }}
                >
                  Create First Chapter
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: '', index: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteDialog.type}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: '', index: null })}>Cancel</Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={() => {
              if (deleteDialog.type === 'chapter') {
                deleteChapter(deleteDialog.index);
              } else {
                deleteLesson(deleteDialog.index);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudyMaterialEdit;
