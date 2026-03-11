import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { loadUser } from './store/slices/authSlice';
import BottomNav from './components/layout/BottomNav';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageLoader from './components/PageLoader';
import { useGradeBand } from './hooks/useGradeBand';

const Home = React.lazy(() => import('./pages/Home'));
const ExperimentsPage = React.lazy(() => import('./pages/ExperimentsPage'));
const TopicsPage = React.lazy(() => import('./pages/Topics'));
const GamesPage = React.lazy(() => import('./pages/GamesPage'));
const QuizList = React.lazy(() => import('./pages/QuizList'));
const QuizTaker = React.lazy(() => import('./pages/QuizTaker'));
const EcoAdventureGame = React.lazy(() => import('./pages/EcoAdventureGame'));
const EcoMazeGame = React.lazy(() => import('./pages/EcoMazeGame'));
const EcoConnectDotsGame = React.lazy(() => import('./pages/EcoConnectDotsGame'));
const MemoryMatchGame = React.lazy(() => import('./pages/MemoryMatchGame'));
const WasteSortingGame = React.lazy(() => import('./pages/WasteSortingGame'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const StudentDashboard = React.lazy(() => import('./pages/dashboard/StudentDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const ExperimentDetail = React.lazy(() => import('./pages/ExperimentDetail'));
const GameDetail = React.lazy(() => import('./pages/GameDetail'));
const ProfileGamification = React.lazy(() => import('./pages/ProfileGamification'));
const SimpleExperimentsPage = React.lazy(() => import('./pages/SimpleExperimentsPage'));
const TopicDetail = React.lazy(() => import('./pages/TopicDetail'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const StudentProfile = React.lazy(() => import('./pages/student/StudentProfile'));
const StudentProgress = React.lazy(() => import('./pages/student/StudentProgress'));
const StudentAssignments = React.lazy(() => import('./pages/student/StudentAssignments'));
const TeacherLayout = React.lazy(() => import('./pages/teacher/TeacherLayout'));
const TeacherDashboard = React.lazy(() => import('./pages/teacher/TeacherDashboard'));
const TeacherSubmissions = React.lazy(() => import('./pages/teacher/TeacherSubmissions'));
const TeacherStudents = React.lazy(() => import('./pages/teacher/TeacherStudents'));
const SchoolAdminLayout = React.lazy(() => import('./pages/school-admin/SchoolAdminLayout'));
const SchoolAdminDashboard = React.lazy(() => import('./pages/school-admin/SchoolAdminDashboard'));
const SchoolAdminStudents = React.lazy(() => import('./pages/school-admin/SchoolAdminStudents'));
const SchoolAdminTeachers = React.lazy(() => import('./pages/school-admin/SchoolAdminTeachers'));
const SchoolAdminImpact = React.lazy(() => import('./pages/school-admin/SchoolAdminImpact'));
const BulkImportPage = React.lazy(() => import('./pages/school-admin/BulkImportPage'));
const SetupWizard = React.lazy(() => import('./pages/school-admin/SetupWizard'));
const DistrictAdminLayout = React.lazy(() => import('./pages/district-admin/DistrictAdminLayout'));
const DistrictAdminDashboard = React.lazy(() => import('./pages/district-admin/DistrictAdminDashboard'));
const DistrictAdminSchools = React.lazy(() => import('./pages/district-admin/DistrictAdminSchools'));
const DistrictAdminImpact = React.lazy(() => import('./pages/district-admin/DistrictAdminImpact'));
const StateAdminLayout = React.lazy(() => import('./pages/state-admin/StateAdminLayout'));
const StateAdminDashboard = React.lazy(() => import('./pages/state-admin/StateAdminDashboard'));
const StateAdminDistricts = React.lazy(() => import('./pages/state-admin/StateAdminDistricts'));
const StateAdminImpact = React.lazy(() => import('./pages/state-admin/StateAdminImpact'));
const EnvironmentalLessonsPage = React.lazy(() => import('./pages/EnvironmentalLessonsPage'));
const LessonDetail = React.lazy(() => import('./pages/LessonDetail'));
const EnvironmentalImpactPage = React.lazy(() => import('./pages/EnvironmentalImpactPage'));
const HabitTrackerPage = React.lazy(() => import('./pages/HabitTrackerPage'));
const CompetitionPage = React.lazy(() => import('./pages/CompetitionPage'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage'));
const LessonsPage = React.lazy(() => import('./pages/LessonsPage'));
const BuddiesPage = React.lazy(() => import('./pages/BuddiesPage'));
const StudentDashboardPage = React.lazy(() => import('./pages/StudentDashboardPage'));
const EcoStorePage = React.lazy(() => import('./pages/EcoStorePage'));
const EcoFeedPage = React.lazy(() => import('./pages/EcoFeedPage'));
const SchoolChallengesPage = React.lazy(() => import('./pages/SchoolChallengesPage'));
const ChallengeDetailPage = React.lazy(() => import('./pages/ChallengeDetailPage'));
const CreateChallengePage = React.lazy(() => import('./pages/CreateChallengePage'));
const ParentReportCardsPage = React.lazy(() => import('./pages/ParentReportCardsPage'));
const SDGImpactPage = React.lazy(() => import('./pages/SDGImpactPage'));
const GovernmentDashboardPage = React.lazy(() => import('./pages/GovernmentDashboardPage'));
const EcoClubHubPage = React.lazy(() => import('./pages/EcoClubHubPage'));
const SubmitActivityPage = React.lazy(() => import('./pages/SubmitActivityPage'));
const VerifyActivitiesPage = React.lazy(() => import('./pages/VerifyActivitiesPage'));
const ActivitiesPage = React.lazy(() => import('./pages/LegacyActivityPages').then((module) => ({ default: module.ActivitiesPage })));
const ActivityRouter = React.lazy(() => import('./pages/LegacyActivityPages').then((module) => ({ default: module.ActivityRouter })));
const LittleKidsPage = React.lazy(() => import('./pages/LegacyActivityPages').then((module) => ({ default: module.LittleKidsPage })));
const ColoringPage = React.lazy(() => import('./pages/LegacyActivityPages').then((module) => ({ default: module.ColoringPage })));
const QRLoginPage = React.lazy(() => import('./pages/QRLoginPage'));
const QRLogin = React.lazy(() => import('./pages/QRLogin'));
const QRCardsPage = React.lazy(() => import('./pages/school-admin/QRCardsPage'));
const ParentConsentDashboard = React.lazy(() => import('./pages/school-admin/ParentConsentDashboard'));
const PrincipalReportPage = React.lazy(() => import('./pages/school-admin/PrincipalReportPage'));
const OfflineBanner = React.lazy(() => import('./components/OfflineBanner'));
const OnboardingWalkthrough = React.lazy(() => import('./components/OnboardingWalkthrough'));
const FirstLoginOnboarding = React.lazy(() => import('./components/FirstLoginOnboarding'));
const EcoBot = React.lazy(() => import('./components/EcoBot'));
const PolicyUpdateBanner = React.lazy(() => import('./components/PolicyUpdateBanner'));
const SkipToContent = React.lazy(() => import('./components/Accessibility').then((module) => ({ default: module.SkipToContent })));
const AdminCMS = React.lazy(() => import('./pages/admin/AdminCMS'));
const Profile = React.lazy(() => import('./pages/Profile'));
const About = React.lazy(() => import('./pages/About'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const PrivacyPolicy = React.lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/legal/TermsOfService'));
const AccessibilityStatement = React.lazy(() => import('./pages/legal/AccessibilityStatement'));
const ParentConsentPage = React.lazy(() => import('./pages/consent/ParentConsentPage'));
const Analytics = React.lazy(() => import('./pages/admin/Analytics'));
const ContentManagement = React.lazy(() => import('./pages/admin/ContentManagement'));
const Overview = React.lazy(() => import('./pages/admin/Overview'));
const SubmissionsReview = React.lazy(() => import('./pages/admin/SubmissionsReview'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));

const RoleRedirect = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user?.role) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'teacher') {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === 'school_admin') {
    return <Navigate to="/school-admin/dashboard" replace />;
  }

  return <Navigate to="/student-dashboard" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { user, isLoading, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const { band } = useGradeBand();
  const { i18n } = useTranslation();
  const [showFirstLoginOnboarding, setShowFirstLoginOnboarding] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language);

    const handleLangChange = (language) => {
      document.documentElement.setAttribute('lang', language);
    };

    i18n.on('languageChanged', handleLangChange);
    return () => i18n.off('languageChanged', handleLangChange);
  }, [i18n]);

  useEffect(() => {
    document.documentElement.setAttribute('data-grade-band', band);
  }, [band]);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg)]">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full border-t-2 border-[var(--g1)] animate-spin" style={{ boxShadow: '0 0 30px rgba(0,255,136,0.3)' }}></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-[var(--c1)] animate-[spin_2s_linear_infinite_reverse]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🌱</span>
          </div>
        </div>
        <div className="font-ui font-bold text-sm tracking-widest uppercase text-[var(--g1)] mt-8 animate-pulse">Initializing System...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={null}>
        <SkipToContent />
        <OfflineBanner />
        {isAuthenticated && <PolicyUpdateBanner />}
        {isAuthenticated && user?.role === 'student' && <OnboardingWalkthrough userName={user?.name} />}
        {isAuthenticated && user?.role === 'student' && user?.firstLogin && showFirstLoginOnboarding && (
          <FirstLoginOnboarding user={user} onCompleted={() => setShowFirstLoginOnboarding(false)} />
        )}
        {isAuthenticated && user && <EcoBot user={user} />}
      </Suspense>

      <div id="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={<PageLoader />}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/accessibility" element={<AccessibilityStatement />} />
                <Route path="/consent/parent/:token" element={<ParentConsentPage />} />
                <Route path="/topics" element={<TopicsPage />} />
                <Route path="/topics/:id" element={<TopicDetail />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/games/:id" element={<GameDetail />} />
                <Route path="/experiments" element={<ExperimentsPage />} />
                <Route path="/experiments/simple" element={<SimpleExperimentsPage />} />
                <Route path="/experiments/:id" element={<ExperimentDetail />} />
                <Route path="/quizzes" element={<QuizList />} />
                <Route path="/quiz/:id" element={<ProtectedRoute><QuizTaker /></ProtectedRoute>} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                <Route path="/activities/:id" element={<ActivityRouter />} />
                <Route path="/little-kids" element={<LittleKidsPage />} />
                <Route path="/little-kids/coloring" element={<ColoringPage />} />
                <Route path="/little-kids/coloring/:template" element={<ColoringPage />} />
                <Route path="/environmental-lessons" element={<EnvironmentalLessonsPage />} />
                <Route path="/environmental-lessons/:id" element={<LessonDetail />} />
                <Route path="/environmental-impact" element={<ProtectedRoute><EnvironmentalImpactPage /></ProtectedRoute>} />
                <Route path="/sdg-impact" element={<ProtectedRoute><SDGImpactPage /></ProtectedRoute>} />
                <Route path="/government-dashboard" element={<ProtectedRoute><GovernmentDashboardPage /></ProtectedRoute>} />
                <Route path="/habit-tracker" element={<ProtectedRoute><HabitTrackerPage /></ProtectedRoute>} />
                <Route path="/competition" element={<CompetitionPage />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/challenges" element={<ProtectedRoute><SchoolChallengesPage /></ProtectedRoute>} />
                <Route path="/challenges/create" element={<ProtectedRoute><CreateChallengePage /></ProtectedRoute>} />
                <Route path="/challenges/:id" element={<ProtectedRoute><ChallengeDetailPage /></ProtectedRoute>} />
                <Route path="/eco-store" element={<ProtectedRoute><EcoStorePage /></ProtectedRoute>} />
                <Route path="/eco-feed" element={<ProtectedRoute><EcoFeedPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/parent-report-cards" element={<ProtectedRoute><ParentReportCardsPage /></ProtectedRoute>} />
                <Route path="/eco-club" element={<ProtectedRoute><EcoClubHubPage /></ProtectedRoute>} />
                <Route path="/leaderboards" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                <Route path="/lessons" element={<ProtectedRoute><LessonsPage /></ProtectedRoute>} />
                <Route path="/lessons/:id" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
                <Route path="/buddies" element={<ProtectedRoute><BuddiesPage /></ProtectedRoute>} />
                <Route path="/student-profile" element={<ProtectedRoute><StudentDashboardPage /></ProtectedRoute>} />
                <Route path="/submit-activity" element={<ProtectedRoute><SubmitActivityPage /></ProtectedRoute>} />
                <Route path="/my-submissions" element={<ProtectedRoute><SubmitActivityPage /></ProtectedRoute>} />
                <Route path="/verify-activities" element={<ProtectedRoute><VerifyActivitiesPage /></ProtectedRoute>} />
                <Route path="/games/eco-adventure" element={<EcoAdventureGame />} />
                <Route path="/games/eco-maze" element={<EcoMazeGame />} />
                <Route path="/games/eco-connect-dots" element={<EcoConnectDotsGame />} />
                <Route path="/games/memory-match" element={<MemoryMatchGame />} />
                <Route path="/games/waste-sorting" element={<WasteSortingGame />} />
                <Route path="/games/adventure" element={<EcoAdventureGame />} />
                <Route path="/games/maze" element={<EcoMazeGame />} />
                <Route path="/games/connect-dots" element={<EcoConnectDotsGame />} />
                <Route path="/games/recycling-sort" element={<WasteSortingGame />} />
                <Route path="/games/ocean-memory" element={<MemoryMatchGame />} />
                <Route path="/games/climate-quest" element={<EcoAdventureGame />} />
                <Route path="/games/water-conservation" element={<EcoMazeGame />} />
                <Route path="/games/animal-habitat" element={<EcoConnectDotsGame />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/qr-login" element={<QRLogin />} />
                <Route path="/qr-login-page" element={<QRLoginPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/role-redirect" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />
                <Route path="/student-dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
                <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />
                <Route path="/student/progress" element={<ProtectedRoute roles={['student']}><StudentProgress /></ProtectedRoute>} />
                <Route path="/student/assignments" element={<ProtectedRoute roles={['student']}><StudentAssignments /></ProtectedRoute>} />
                <Route path="/profile/achievements" element={<ProtectedRoute><ProfileGamification /></ProtectedRoute>} />
                <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><TeacherLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<TeacherDashboard />} />
                  <Route path="submissions" element={<TeacherSubmissions />} />
                  <Route path="students" element={<TeacherStudents />} />
                </Route>
                <Route path="/school-admin/*" element={<ProtectedRoute roles={['school_admin', 'admin']}><SchoolAdminLayout /></ProtectedRoute>}>
                  <Route index element={<SchoolAdminDashboard />} />
                  <Route path="setup" element={<SetupWizard />} />
                  <Route path="dashboard" element={<SchoolAdminDashboard />} />
                  <Route path="students" element={<SchoolAdminStudents />} />
                  <Route path="teachers" element={<SchoolAdminTeachers />} />
                  <Route path="bulk-import" element={<BulkImportPage />} />
                  <Route path="analytics" element={<SchoolAdminImpact />} />
                  <Route path="impact" element={<Navigate to="/school-admin/analytics" replace />} />
                  <Route path="qr-cards" element={<QRCardsPage />} />
                  <Route path="parent-consent" element={<ParentConsentDashboard />} />
                  <Route path="principal-report" element={<PrincipalReportPage />} />
                </Route>
                <Route path="/district-admin/*" element={<ProtectedRoute roles={['district_admin', 'state_admin', 'admin']}><DistrictAdminLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DistrictAdminDashboard />} />
                  <Route path="schools" element={<DistrictAdminSchools />} />
                  <Route path="impact" element={<DistrictAdminImpact />} />
                </Route>
                <Route path="/state-admin/*" element={<ProtectedRoute roles={['state_admin', 'admin']}><StateAdminLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<StateAdminDashboard />} />
                  <Route path="districts" element={<StateAdminDistricts />} />
                  <Route path="impact" element={<StateAdminImpact />} />
                </Route>
                <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/cms" element={<ProtectedRoute roles={['admin', 'teacher']}><AdminCMS /></ProtectedRoute>} />
                <Route path="/admin/content" element={<ProtectedRoute roles={['admin']}><ContentManagement /></ProtectedRoute>} />
                <Route path="/admin/overview" element={<ProtectedRoute roles={['admin']}><Overview /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
                <Route path="/school-admin/analytics" element={<ProtectedRoute roles={['school_admin']}><Analytics /></ProtectedRoute>} />
                <Route path="/teacher/submissions" element={<ProtectedRoute roles={['teacher']}><SubmissionsReview /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}

export default App;
