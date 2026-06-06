import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Lock, LogOut } from 'lucide-react';

const ForcePasswordChange = () => {
  const { user, checkAuth, logout } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setIsChanging(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/change-password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Re-fetch user to get the updated requiresPasswordChange flag
      await checkAuth();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password. Please verify your current password.');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="card text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Security Required</h1>
          <p className="text-secondary mb-6">
            Hi {user?.name}, as this is your first time logging in (or your password was reset), you must change your password before you can access the dashboard.
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 p-3 rounded text-sm text-left mb-6 border border-red-200 dark:border-red-800/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <div>
              <label className="label">Current (Temporary) Password</label>
              <input 
                type="password" 
                className="input" 
                value={passwords.currentPassword}
                onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input 
                type="password" 
                className="input" 
                value={passwords.newPassword}
                onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input 
                type="password" 
                className="input" 
                value={passwords.confirmPassword}
                onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                required
                minLength={6}
              />
            </div>
            
            <button type="submit" className="btn btn-primary w-full mt-4" disabled={isChanging}>
              {isChanging ? 'Securing Account...' : 'Update & Continue'}
            </button>
          </form>

          <button 
            onClick={logout} 
            className="btn btn-secondary w-full mt-4 text-danger border-transparent"
          >
            <LogOut size={18} /> Cancel & Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForcePasswordChange;
