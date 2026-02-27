import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeContextProvider, useTheme } from './contexts/ThemeContext';
import { TenantProvider } from './contexts/TenantContext';
import { SocketProvider } from './contexts/SocketContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import InstructorLayout from './layouts/InstructorLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';

// Feature Pages
import QuizList from './pages/quizzes/QuizList';
import QuizTake from './pages/quizzes/QuizTake';
import PracticeList from './pages/practice/PracticeList';
import PracticeQuestions from './pages/practice/PracticeQuestions';
import TaskList from './pages/tasks/TaskList';
import CourseList from './pages/courses/CourseList';
import CourseDetail from './pages/courses/CourseDetail';
import Reports from './pages/reports/Reports';
import Profile from './pages/profile/Profile';
import InstructorManagement from './pages/admin/InstructorManagement';
import TenantManagement from './pages/admin/TenantManagement';
import StudentManagement from './pages/instructor/StudentManagement';
import QuizManagement from './pages/instructor/QuizManagement';
import InstructorQuizDetails from './pages/instructor/InstructorQuizDetails';
import InstructorQuizView from './pages/instructor/InstructorQuizView';
import AssessmentManagement from './pages/instructor/AssessmentManagement';
import BatchSelection from './pages/instructor/BatchSelection';
import PracticeManagement from './pages/admin/PracticeManagement';
import TopicsManagement from './pages/admin/TopicsManagement';
import SubtopicsManagement from './pages/admin/SubtopicsManagement';
import QuestionsManagement from './pages/admin/QuestionsManagement';
import GamePlayer from './pages/admin/GamePlayer';
import TenantSelection from './pages/instructor/TenantSelection';
import ProtectedRoute from './components/ProtectedRoute';
import CreateQuiz from './pages/instructor/CreateQuiz';
import CreateAssessment from './pages/instructor/CreateAssessment';
import CreateProgrammingAssessment from './pages/instructor/CreateProgrammingAssessment';
import CreateMongoDBPlaygroundAssessment from './pages/instructor/CreateMongoDBPlaygroundAssessment';
import AssessmentDetails from './pages/instructor/AssessmentDetails';
import ViewAssessment from './pages/instructor/ViewAssessment';
import CompanySpecificManagement from './pages/instructor/CompanySpecificManagement';
import CompanyQuestions from './pages/instructor/CompanyQuestions';
import InstructorPracticeManagement from './pages/instructor/PracticeManagement';
import InstructorPracticeQuestions from './pages/instructor/PracticeQuestions';
import CreateFrontendAssessment from './pages/instructor/CreateFrontendAssessment';
import CreateBackendAssessment from './pages/instructor/CreateBackendAssessment';
import AptitudeQuestions from './pages/instructor/AptitudeQuestions';
import StudyMaterials from './pages/instructor/StudyMaterials';
import StudyMaterialEdit from './pages/instructor/StudyMaterialEdit';

const AppContent = () => {
  const { darkMode } = useTheme();
  
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#dc004e',
      },
      background: {
        default: darkMode ? '#111827' : '#fafafa',
        paper: darkMode ? '#1f2937' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
        secondary: darkMode ? '#b0b0b0' : '#666666',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? '#374151' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000',
          },
        }}
      />
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Remove signup route */}
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          
          {/* Practice Routes (Direct) */}
          <Route path="/practice" element={<PracticeList />} />
          <Route path="/practice/:topicId" element={<PracticeList />} />
          <Route path="/practice/:topicId/:subtopicId" element={<PracticeQuestions />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="quizzes" element={<QuizList />} />
            <Route path="assessments" element={<div>Assessments</div>} />
            <Route path="instructors" element={<InstructorManagement />} />
            <Route path="practice" element={<TopicsManagement />} />
            <Route path="practice/topics/:topicId/subtopics" element={<SubtopicsManagement />} />
            <Route path="practice/subtopics/:subtopicId/questions" element={<QuestionsManagement />} />
            <Route path="practice/play/:questionId" element={<GamePlayer />} />
            <Route path="tenants" element={<TenantManagement />} />
          </Route>
          
          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="quizzes" element={<QuizList />} />
            <Route path="quizzes/:id" element={<QuizTake />} />
            <Route path="practice" element={<PracticeList />} />
            <Route path="practice/:topicId" element={<PracticeList />} />
            <Route path="practice/:topicId/:subtopicId" element={<PracticeList />} />
            <Route path="assessments" element={<div>Assessments</div>} />
            <Route path="reports" element={<Reports />} />
          </Route>
          
          {/* Instructor Tenant Selection */}
          <Route path="/instructor/select-tenant" element={<ProtectedRoute><TenantSelection /></ProtectedRoute>} />
          
          {/* Instructor Routes */}
          <Route path="/instructor" element={<ProtectedRoute><InstructorLayout /></ProtectedRoute>}>
            <Route index element={<InstructorDashboard />} />
            <Route path="quizzes" element={<CreateQuiz />} />
            <Route path="assessments" element={<AssessmentManagement />} />
            <Route path="assessments/:assessmentId/view" element={<ViewAssessment />} />
            <Route path="assessment/:id" element={<AssessmentDetails />} />
            <Route path="company-specific" element={<CompanySpecificManagement />} />
            <Route path="company-specific/:companyId" element={<CompanyQuestions />} />
            <Route path="practice" element={<InstructorPracticeManagement />} />
            <Route path="practice/:topicId" element={<InstructorPracticeQuestions />} />
            <Route path="aptitude" element={<AptitudeQuestions />} />
            <Route path="study-materials" element={<StudyMaterials />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="batch-selection" element={<BatchSelection />} />
            <Route path="create-quiz" element={<CreateQuiz />} />
            <Route path="create-assessment" element={<CreateAssessment />} />
            <Route path="create-assessment/programming" element={<CreateProgrammingAssessment />} />
            <Route path="create-assessment/mongodb-playground" element={<CreateMongoDBPlaygroundAssessment />} />
            <Route path="create-assessment/gamified-aptitude" element={<div>Gamified Aptitude Assessment - Coming Soon</div>} />
            <Route path="create-assessment/frontend" element={<CreateFrontendAssessment />} />
            <Route path="create-assessment/backend-api" element={<CreateBackendAssessment />} />
            <Route path="create-assessment/database" element={<div>Database Assessment - Coming Soon</div>} />
            <Route path="create-assessment/soft-skills" element={<div>Soft Skills Assessment - Coming Soon</div>} />
            <Route path="create-assessment/cybersecurity" element={<div>Cybersecurity Assessment - Coming Soon</div>} />
            <Route path="create-assessment/cloud-computing" element={<div>Cloud Computing Assessment - Coming Soon</div>} />
            <Route path="create-assessment/system-design" element={<div>System Design Assessment - Coming Soon</div>} />
            <Route path="reports" element={<Reports />} />
          </Route>
          
          {/* Study Material Edit - No Layout */}
          <Route path="/instructor/study-materials/:id" element={<ProtectedRoute><StudyMaterialEdit /></ProtectedRoute>} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeContextProvider>
        <TenantProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </TenantProvider>
      </ThemeContextProvider>
    </AuthProvider>
  );
}

export default App;