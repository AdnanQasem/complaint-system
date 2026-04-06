import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NewComplaint from './pages/NewComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import ComplaintsList from './pages/ComplaintsList';
import Settings from './pages/Settings';
import ResearcherManagement from './pages/ResearcherManagement';
import ComprehensiveReports from './pages/ComprehensiveReports';
import NotFound from './pages/NotFound';
import EditComplaint from './pages/EditComplaint';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'researcher') return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* مسار الإدارة */}
          <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="reports" element={<ComprehensiveReports />} />
            <Route path="users" element={<ResearcherManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* مسار الباحث */}
          <Route path="/" element={<ProtectedRoute allowedRole="researcher"><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="new" element={<NewComplaint />} />
            <Route path="complaints" element={<ComplaintsList />} />
            <Route path="complaint/:id" element={<ComplaintDetails />} />
            <Route path="complaint/edit/:id" element={<EditComplaint />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
