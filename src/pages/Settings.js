import { useState, useEffect } from 'react';
import { settingsAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Lock, Palette, Info, ShieldCheck, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings = () => {
  // ⬇️ YOUR ORIGINAL STATE & LOGIC
  const { user } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (user) {
      setNewUsername(user.username);
      setTheme(user.theme || 'light');
    }
  }, [user]);

  const handleUpdateUsername = async () => {
    try {
      await settingsAPI.updateUsername(newUsername);
      toast.success('Username updated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update username');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password changed');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) { toast.error(error.response?.data?.error || 'Failed'); }
  };

  const handleThemeChange = async (newTheme) => {
    try {
      await settingsAPI.updateTheme(newTheme);
      setTheme(newTheme);
      document.body.className = newTheme;
      toast.success(`Theme: ${newTheme}`);
    } catch (error) { toast.error('Failed to change theme'); }
  };
  // ⬆️ ORIGINAL LOGIC ENDS

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">User Settings</h1>
        <p className="text-gray-500">Control your credentials and application appearance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-nature-100 text-nature-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold border-4 border-nature-50">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
            <span className="px-3 py-1 bg-nature-100 text-nature-700 rounded-full text-xs font-bold uppercase mt-2 inline-block">
              {user?.role}
            </span>
            
            <div className="mt-8 space-y-4 text-left border-t border-gray-50 pt-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={16} className="text-gray-400" /> <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400" /> <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <ShieldCheck size={16} className="text-gray-400" /> <span>Status: <span className="text-emerald-600 font-bold">{user?.status}</span></span>
              </div>
            </div>
          </div>
          
          <div className="bg-nature-900 p-6 rounded-3xl text-white shadow-xl">
             <Info className="text-nature-400 mb-2" />
             <h4 className="font-bold">Privacy Tip</h4>
             <p className="text-xs text-nature-200 leading-relaxed mt-1">
               Greenhouse sensors and manual logs are tracked by your username. Choose a name that helps admins identify you.
             </p>
          </div>
        </div>

        {/* Action Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Section */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <User className="text-nature-500" size={20} /> Identity Management
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <Input 
                  label="Display Username" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <Button onClick={handleUpdateUsername} className="w-full sm:w-auto h-[46px]">Update Name</Button>
            </div>
          </section>

          {/* Security Section */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <Lock className="text-nature-500" size={20} /> Security & Passwords
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input 
                type="password" 
                label="Current Password" 
                placeholder="Required to make changes"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  type="password" 
                  label="New Password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input 
                  type="password" 
                  label="Confirm Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="secondary" className="w-full sm:w-auto">Update Secure Password</Button>
            </form>
          </section>

          {/* Theme Section */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <Palette className="text-nature-500" size={20} /> Interface Theme
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['light', 'dark', 'auto'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`p-4 rounded-2xl border-2 transition-all capitalize font-medium ${
                    theme === t 
                      ? 'border-nature-500 bg-nature-50 text-nature-700' 
                      : 'border-gray-100 hover:border-gray-200 text-gray-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
