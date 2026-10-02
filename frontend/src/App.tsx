import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import BookList from './pages/admin/BookList';
import BookForm from './pages/admin/BookForm';
import CategoryList from './pages/admin/CategoryList';
import MemberList from './pages/admin/MemberList';
import TransactionList from './pages/admin/TransactionList';
import FinesList from './pages/admin/FinesList';
import SettingsPage from './pages/admin/Settings';

import Dashboard from './pages/admin/Dashboard';

// Placeholder components
const StudentDashboard = () => <div className="p-8"><h1>Student Dashboard</h1></div>;

// Root redirect based on auth status
const RootRedirect = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'student') return <Navigate to="/student/dashboard" replace />;
  
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="books" element={<BookList />} />
        <Route path="books/new" element={<BookForm />} />
        <Route path="books/:id/edit" element={<BookForm />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="members" element={<MemberList />} />
        <Route path="transactions" element={<TransactionList />} />
        <Route path="fines" element={<FinesList />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Student Routes */}
      <Route path="/student/*" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      
      {/* 404 Not Found */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
          <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
          <p className="text-xl mb-8">Page not found</p>
          <a href="/" className="text-indigo-600 hover:underline">Go to Home</a>
        </div>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
