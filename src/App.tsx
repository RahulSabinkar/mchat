import { Routes, Route, Navigate } from 'react-router-dom';
import { ScreeningProvider, useScreening } from '@/context/ScreeningContext';
import { 
  WelcomeScreen, 
  ChildInfoScreen, 
  QuestionsScreen, 
  ResultsScreen 
} from '@/components/screens';

function AppRoutes() {
  const { session } = useScreening();
  
  const getRedirectPath = () => {
    switch (session.phase) {
      case 'intro':
        if (!session.childInfo.name) return '/info';
        return '/screen';
      case 'initial_questions':
        return '/screen';
      case 'follow_up':
        return '/followup';
      case 'results':
        return '/results';
      default:
        return '/';
    }
  };
  
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/info" element={<ChildInfoScreen />} />
      <Route path="/screen" element={<QuestionsScreen />} />
      <Route path="/results" element={<ResultsScreen />} />
      <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ScreeningProvider>
      <AppRoutes />
    </ScreeningProvider>
  );
}

export default App;
