import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ teachers: 0, materials: 0, recentMaterials: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [teachersRes, materialsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teachers`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/materials`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const materials = materialsRes.data;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentCount = materials.filter((m: any) => new Date(m.createdAt) > thirtyDaysAgo).length;

        setStats({
          teachers: teachersRes.data.length,
          materials: materials.length,
          recentMaterials: recentCount
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Principal Dashboard</h1>
          <p className="text-secondary mt-1">System overview and administrative controls.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-secondary font-medium">Total Teachers</p>
            <h2 className="text-2xl font-bold">{loading ? '-' : stats.teachers}</h2>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-secondary font-medium">Total Materials</p>
            <h2 className="text-2xl font-bold">{loading ? '-' : stats.materials}</h2>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-secondary font-medium">Uploaded This Month</p>
            <h2 className="text-2xl font-bold">{loading ? '-' : stats.recentMaterials}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <div className="flex flex-col gap-2">
            <Link to="/teachers" className="text-primary hover:underline flex items-center gap-2">
              <Users size={16} /> Manage Teacher Accounts
            </Link>
            <Link to="/materials" className="text-primary hover:underline flex items-center gap-2">
              <BookOpen size={16} /> Review All Materials
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
