import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [rememberedPassword, setRememberedPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ username, message, rememberedPassword });
      toast.success('Password reset request submitted. An admin will review it.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <textarea
          placeholder="Message to admin (explain your situation)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password you remember (optional)"
          value={rememberedPassword}
          onChange={(e) => setRememberedPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};
