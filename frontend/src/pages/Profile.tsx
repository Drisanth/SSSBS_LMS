import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Phone, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(res.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', msg: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', msg: 'New password must be at least 6 characters' });
      return;
    }

    setIsChanging(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordStatus({ 
        type: 'error', 
        msg: err.response?.data?.error || 'Failed to change password. Please verify your current password.' 
      });
    } finally {
      setIsChanging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="skeleton h-8 w-64"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="text-secondary mt-1">Manage your account settings and security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="card text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-primary mb-4 text-3xl font-bold">
              {profileData?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
            </div>
            <h2 className="font-bold text-xl">{profileData?.name || user?.name}</h2>
            <p className="text-sm text-secondary mb-4">@{profileData?.username || user?.username}</p>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium">
              <Shield size={12} /> {profileData?.role || user?.role}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="card">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <User size={18} className="text-primary" /> Personal Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <label className="text-xs font-medium text-secondary mb-1 block">Full Name</label>
                <div className="font-medium text-sm">{profileData?.name || '-'}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-secondary mb-1 block">Username</label>
                <div className="font-medium text-sm">{profileData?.username || '-'}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-secondary mb-1 block flex items-center gap-1">
                  <Mail size={12} /> Email Address
                </label>
                <div className="font-medium text-sm">{profileData?.email || <span className="text-gray-400 italic">Not set</span>}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-secondary mb-1 block flex items-center gap-1">
                  <Phone size={12} /> Phone Number
                </label>
                <div className="font-medium text-sm">{profileData?.phone || <span className="text-gray-400 italic">Not set</span>}</div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-secondary flex items-center gap-1">
                <Shield size={14} /> Personal information can only be updated by a system administrator.
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Lock size={18} className="text-primary" /> Change Password
            </h3>
            
            {passwordStatus && (
              <div className={`p-3 rounded text-sm mb-4 ${
                passwordStatus.type === 'success' 
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/30' 
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/30'
              }`}>
                {passwordStatus.msg}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
              <div>
                <label className="label">Current Password</label>
                <input 
                  type="password" 
                  className="input" 
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input 
                  type="password" 
                  className="input" 
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="input" 
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="flex justify-end mt-2">
                <button type="submit" className="btn btn-primary" disabled={isChanging}>
                  {isChanging ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
