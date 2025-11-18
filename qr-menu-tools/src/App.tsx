import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Creator } from './pages/Creator';
import CustomerView from './pages/CustomerView';
import './index.css';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/qr-menu">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/creator" element={
            <ProtectedRoute>
              <Creator />
            </ProtectedRoute>
          } />
          <Route path="/edit/:menuId" element={
            <ProtectedRoute>
              <Creator />
            </ProtectedRoute>
          } />
          <Route path="/m/:menuId" element={<CustomerView />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
