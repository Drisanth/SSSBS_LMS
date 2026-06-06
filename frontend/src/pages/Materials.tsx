import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Link as LinkIcon, MessageSquare } from 'lucide-react';

interface Material {
  id: string;
  title: string;
  description: string;
  academicYear: string;
  grade: string;
  subject: string;
  chapterNo: number;
  chapterName: string;
  type: string;
  urlOrPath: string;
  version: number;
  status: string;
  createdAt: string;
  uploader: { id: string; name: string };
}

const Materials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    academicYear: '2025-2026',
    grade: '',
    subject: '',
    chapterNo: '',
    chapterName: '',
    type: 'YOUTUBE',
    urlOrPath: '',
    createNewVersion: false
  });

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch all materials so dropdowns have all available grades/subjects from the DB.
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/materials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(res.data);
    } catch (error) {
      console.error('Failed to fetch materials', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [user]);

  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    materials.forEach(m => grades.add(m.grade));
    return Array.from(grades).sort();
  }, [materials]);

  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    materials.forEach(m => subjects.add(m.subject));
    return Array.from(subjects).sort();
  }, [materials]);

  useEffect(() => {
    // Auto-fill chapter name if subject, grade, and chapterNo match an existing material
    if (formData.subject && formData.grade && formData.chapterNo) {
      const match = materials.find(m => 
        m.subject === formData.subject && 
        m.grade === formData.grade && 
        String(m.chapterNo) === String(formData.chapterNo) &&
        m.chapterName
      );
      if (match && !formData.chapterName) {
        setFormData(prev => ({ ...prev, chapterName: match.chapterName }));
      }
    }
  }, [formData.subject, formData.grade, formData.chapterNo, materials]);

  const handleOpenModal = (material?: Material) => {
    if (material) {
      setFormData({
        id: material.id,
        title: material.title,
        description: material.description || '',
        academicYear: material.academicYear,
        grade: material.grade,
        subject: material.subject,
        chapterNo: String(material.chapterNo),
        chapterName: material.chapterName,
        type: material.type,
        urlOrPath: material.urlOrPath,
        createNewVersion: false
      });
    } else {
      setFormData({
        id: '',
        title: '',
        description: '',
        academicYear: '2025-2026',
        grade: '',
        subject: '',
        chapterNo: '',
        chapterName: '',
        type: 'YOUTUBE',
        urlOrPath: '',
        createNewVersion: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        chapterNo: Number(formData.chapterNo)
      };

      if (formData.id) {
        // Update
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/materials/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/materials`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      fetchMaterials();
    } catch (error) {
      console.error('Failed to save material', error);
      alert('Error saving material. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMaterials();
    } catch (error) {
      console.error('Failed to delete material', error);
      alert('Error deleting material.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{user?.role === 'TEACHER' ? 'My Materials' : 'All Materials'}</h1>
          <p className="text-secondary mt-1">Manage study materials and repository content.</p>
        </div>
        {user?.role === 'TEACHER' && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Upload Material
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Chapter</th>
              <th>Title</th>
              <th>Type</th>
              {user?.role === 'ADMIN' && <th>Teacher</th>}
              <th>Grade & Subject</th>
              <th>Version</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="skeleton h-8 w-full max-w-md mx-auto"></div>
                </td>
              </tr>
            ) : materials.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-secondary">
                  No materials found.
                </td>
              </tr>
            ) : (
              (user?.role === 'TEACHER' ? materials.filter(m => m.uploader.id === user.id) : materials).map((mat) => (
                <tr key={mat.id}>
                  <td>
                    <div className="font-medium">Ch {mat.chapterNo}</div>
                    <div className="text-xs text-secondary truncate max-w-[150px]">{mat.chapterName}</div>
                  </td>
                  <td>
                    <div className="font-medium">{mat.title}</div>
                    <div className="text-xs text-secondary truncate max-w-[200px]">{mat.description}</div>
                  </td>
                  <td>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium">
                      {mat.type}
                    </span>
                  </td>
                  {user?.role === 'ADMIN' && <td>{mat.uploader.name}</td>}
                  <td>
                    <div className="text-sm">{mat.subject}</div>
                    <div className="text-xs text-secondary">{mat.grade}</div>
                  </td>
                  <td>v{mat.version}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      mat.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      mat.status === 'ARCHIVED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {mat.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <a href={mat.urlOrPath} target="_blank" rel="noopener noreferrer" className="p-1 text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Open Link">
                        <LinkIcon size={16} />
                      </a>
                      {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
                        <>
                          <button onClick={() => handleOpenModal(mat)} className="p-1 text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(mat.id)} className="p-1 text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      {user?.role === 'ADMIN' && (
                        <button className="p-1 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded" title="Add Review">
                          <MessageSquare size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{formData.id ? 'Edit Material' : 'Upload Material'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Grade</label>
                  <input 
                    type="text" 
                    list="gradesList"
                    className="input" 
                    value={formData.grade} 
                    onChange={e => setFormData({...formData, grade: e.target.value})} 
                    placeholder="e.g. Grade 10"
                    required 
                  />
                  <datalist id="gradesList">
                    {availableGrades.map(g => <option key={g} value={g} />)}
                  </datalist>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input 
                    type="text" 
                    list="subjectsList"
                    className="input" 
                    value={formData.subject} 
                    onChange={e => setFormData({...formData, subject: e.target.value})} 
                    placeholder="e.g. Mathematics"
                    required 
                  />
                  <datalist id="subjectsList">
                    {availableSubjects.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Chapter Number</label>
                  <input type="number" className="input" value={formData.chapterNo} onChange={e => setFormData({...formData, chapterNo: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Chapter Name</label>
                  <input type="text" className="input" value={formData.chapterName} onChange={e => setFormData({...formData, chapterName: e.target.value})} required />
                </div>
              </div>

              <div>
                <label className="label">Material Title</label>
                <input type="text" className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>

              <div>
                <label className="label">Description (Optional)</label>
                <textarea className="input" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Material Type</label>
                  <select className="input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                    <option value="YOUTUBE">YouTube Link</option>
                    <option value="EXTERNAL_LINK">External Link</option>
                    {/* Other types will be supported later when S3 is integrated */}
                  </select>
                </div>
                <div>
                  <label className="label">URL / Link</label>
                  <input type="url" className="input" value={formData.urlOrPath} onChange={e => setFormData({...formData, urlOrPath: e.target.value})} required placeholder="https://..." />
                </div>
              </div>

              {formData.id && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.createNewVersion} 
                      onChange={e => setFormData({...formData, createNewVersion: e.target.checked})}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Create as a new version (archives current version)
                    </span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-color)]">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Material</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
