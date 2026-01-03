import { Navbar, Card, Button } from '../components';
import { useAuth } from '../context';

const Authority = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg relative overflow-hidden">
      {/* Dark mode background decorations - matching first page */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent-primary/5 dark:bg-accent-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/3 dark:bg-pink-500/5 rounded-full blur-3xl" />
      </div>
      
      <Navbar />
      
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center py-16 backdrop-blur-sm">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-xl dark:shadow-purple-500/20">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🚧 Module Under Construction
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The Authority Portal is currently being developed and will be available soon.
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-accent-secondary">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Development in progress...</span>
            </div>
            
            <Button variant="secondary" onClick={logout}>
              Go Back to Login
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Authority;

