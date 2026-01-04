import { ThemeProvider, AuthProvider, useAuth } from './context';
import { Login, Government, Company, Authority } from './pages';

const AppContent = () => {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  switch (userType) {
    case 'government':
      return <Government />;
    case 'company':
      return <Company />;
    case 'authority':
      return <Authority />;
    default:
      return <Login />;
  }
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
