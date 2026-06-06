import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, UserX, UserCheck, Shield, Trash2 } from 'lucide-react';

interface Teacher {
  id: string;
  username: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  teacherProfile: {
    subjects: string;
    grades: string;
  };
}

const Teachers = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    subjects: '',
    grades: ''
  });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(res.data);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchTeachers();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teachers/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teachers`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ username: '', name: '', email: '', phone: '', password: '', subjects: '', grades: '' });
      fetchTeachers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create teacher');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teachers/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeachers();
    } catch (error) {
      alert('Failed to update teacher status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete teacher ${name}? All their uploaded materials will be transferred to your Admin account.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeachers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete teacher');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Teachers</h1>
          <p className="text-secondary mt-1">Add or disable teacher accounts and view their assigned subjects.</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditingId(null);
          setFormData({ username: '', name: '', email: '', phone: '', password: '', subjects: '', grades: '' });
          setIsModalOpen(true);
        }}>
          <Plus size={18} /> Add Teacher
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Subjects</th>
              <th>Grades</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="skeleton h-8 w-full max-w-md mx-auto"></div>
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-secondary">
                  No teachers found.
                </td>
              </tr>
            ) : (
              teachers.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="font-medium flex items-center gap-2">
                      <Shield size={14} className="text-indigo-500" />
                      {t.name}
                    </div>
                  </td>
                  <td>{t.username}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {t.teacherProfile?.subjects?.split(',').map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">{s.trim()}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {t.teacherProfile?.grades?.split(',').map((g: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">{g.trim()}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      t.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingId(t.id);
                          setFormData({
                            username: t.username,
                            name: t.name,
                            email: t.email || '',
                            phone: (t as any).phone || '',
                            password: '', // Leave blank when editing
                            subjects: t.teacherProfile?.subjects || '',
                            grades: t.teacherProfile?.grades || ''
                          });
                          setIsModalOpen(true);
                        }}
                        className="btn btn-secondary text-xs py-1 px-2"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => toggleStatus(t.id, t.status)}
                        className={`btn ${t.status === 'ACTIVE' ? 'btn-danger' : 'btn-secondary'} text-xs py-1 px-2`}
                      >
                        {t.status === 'ACTIVE' ? (
                          <><UserX size={14} /> Disable</>
                        ) : (
                          <><UserCheck size={14} /> Enable</>
                        )}
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id, t.name)}
                        className="btn bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 border-transparent text-xs py-1 px-2"
                        title="Permanently Delete"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="label">Full Name</label>
                <input type="text" className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>

              {!editingId && (
                <div>
                  <label className="label">Username</label>
                  <input type="text" className="input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email Address (Optional)</label>
                  <input type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="label">Phone Number (Optional)</label>
                  <input type="tel" className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              {!editingId && (
                <div>
                  <label className="label">Temporary Password</label>
                  <input type="password" className="input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                </div>
              )}

              <div>
                <label className="label">Subjects (comma separated)</label>
                <input type="text" className="input" value={formData.subjects} onChange={e => setFormData({...formData, subjects: e.target.value})} placeholder="e.g. Mathematics, Science" />
              </div>

              <div>
                <label className="label">Grades (comma separated)</label>
                <input type="text" className="input" value={formData.grades} onChange={e => setFormData({...formData, grades: e.target.value})} placeholder="e.g. Grade 10, Grade 11" />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-color)]">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Teacher'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
