import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Homepage } from './pages/Homepage';
import { Logic } from './pages/Logic';
import { Manual } from './pages/Manual';
import { AdminPanel } from './pages/AdminPanel';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Navbar />
                <Homepage />
              </ProtectedRoute>
            } />
            
            <Route path="/logic" element={
              <ProtectedRoute>
                <Navbar />
                <Logic />
              </ProtectedRoute>
            } />
            
            <Route path="/manual" element={
              <ProtectedRoute>
                <Navbar />
                <Manual />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <Navbar />
                <AdminPanel />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Navbar />
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

