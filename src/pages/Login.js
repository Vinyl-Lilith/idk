import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button'; // Import our new component
import { Input } from '../components/ui/Input';   // Import our new component
import { User, Lock, Sprout } from 'lucide-react'; // Icons

export const Login = () => {
  // ⬇️ LOGIC REMAINS UNCHANGED [cite: 170-173]
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };
  // ⬆️ LOGIC ENDS

  // ⬇️ NEW UI RENDERING
  return (
    <div className="min-h-screen bg-nature-50 flex flex-col justify-center items-center p-4">
      {/* Background Decor (Optional) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-nature-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative z-10 border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-nature-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transform rotate-3">
            <Sprout className="w-8 h-8 text-nature-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to monitor your greenhouse</p>
        </div>

        {/* Form Section [cite: 174-175] */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username or Email"
            icon={User}
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />

          <div>
            <Input
              label="Password"
              icon={Lock}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end mt-1">
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-nature-600 hover:text-nature-700"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            isLoading={loading}
            variant="primary"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>

        {/* Footer Section [cite: 176] */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="font-semibold text-nature-600 hover:text-nature-700 transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400 text-xs">
        <p>&copy; 2024 Smart Greenhouse Systems</p>
      </div>
    </div>
  );
};
