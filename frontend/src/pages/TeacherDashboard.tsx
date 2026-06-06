import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, MessageSquare, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, recent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/materials?teacherId=${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const materials = res.data;
        
        // Calculate recent (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentCount = materials.filter((m: any) => new Date(m.createdAt) > sevenDaysAgo).length;

        setStats({
          total: materials.length,
          recent: recentCount
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}</h1>
          <p className="text-secondary mt-1">Here is what's happening with your study materials today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-secondary font-medium">Total Materials</p>
            <h2 className="text-2xl font-bold">{loading ? '-' : stats.total}</h2>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-secondary font-medium">Uploaded Recently</p>
            <h2 className="text-2xl font-bold">{loading ? '-' : stats.recent}</h2>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm text-secondary font-medium">New Reviews</p>
            <h2 className="text-2xl font-bold">0</h2>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <Link to="/materials" className="btn btn-primary">
            <Plus size={18} /> Upload New Material
          </Link>
          <Link to="/materials" className="btn btn-secondary">
            <BookOpen size={18} /> Manage Repository
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
