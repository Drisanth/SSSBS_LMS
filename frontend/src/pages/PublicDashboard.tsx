import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Filter, PlayCircle, BookOpen } from 'lucide-react';

interface Material {
  id: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
  chapterNo: number;
  chapterName: string;
  type: string;
  urlOrPath: string;
  uploader: { id: string, name: string };
  createdAt: string;
}

const PublicDashboard = () => {
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    grade: '',
    subject: '',
    teacherId: '',
    search: ''
  });

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/materials`);
      setAllMaterials(res.data);
    } catch (error) {
      console.error('Failed to fetch materials', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Derived dynamic options based on current selections
  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    allMaterials.forEach(m => grades.add(m.grade));
    return Array.from(grades).sort();
  }, [allMaterials]);

  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    allMaterials.forEach(m => {
      if (!filters.grade || m.grade === filters.grade) {
        subjects.add(m.subject);
      }
    });
    return Array.from(subjects).sort();
  }, [allMaterials, filters.grade]);

  const availableTeachers = useMemo(() => {
    const teachers = new Map<string, string>();
    allMaterials.forEach(m => {
      const matchGrade = !filters.grade || m.grade === filters.grade;
      const matchSubject = !filters.subject || m.subject === filters.subject;
      if (matchGrade && matchSubject) {
        teachers.set(m.uploader.id, m.uploader.name);
      }
    });
    return Array.from(teachers.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [allMaterials, filters.grade, filters.subject]);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, grade: e.target.value, subject: '', teacherId: '' }));
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, subject: e.target.value, teacherId: '' }));
  };

  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, teacherId: e.target.value }));
  };

  // Client-side filtering
  const displayedMaterials = useMemo(() => {
    return allMaterials.filter(m => {
      if (filters.grade && m.grade !== filters.grade) return false;
      if (filters.subject && m.subject !== filters.subject) return false;
      if (filters.teacherId && m.uploader.id !== filters.teacherId) return false;
      
      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (
          !m.title.toLowerCase().includes(query) &&
          !m.chapterName.toLowerCase().includes(query) &&
          !m.uploader.name.toLowerCase().includes(query) &&
          !(m.description || '').toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allMaterials, filters]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Study Materials Repository</h1>
          <p className="text-secondary mt-1">Browse and access all study materials uploaded by our teachers.</p>
        </div>
      </div>

      <div className="card mb-8">
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-4 items-end flex-wrap">
          {/* Smaller search bar */}
          <div className="w-[220px]">
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-secondary" size={18} />
              <input 
                type="text" 
                className="input pl-10" 
                placeholder="Search..." 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
          
          <div className="w-[140px]">
            <label className="label">Grade</label>
            <select 
              className="input" 
              value={filters.grade}
              onChange={handleGradeChange}
            >
              <option value="">All Grades</option>
              {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          
          <div className="w-[150px]">
            <label className="label">Subject</label>
            <select 
              className="input"
              value={filters.subject}
              onChange={handleSubjectChange}
            >
              <option value="">All Subjects</option>
              {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div className="w-[160px]">
            <label className="label">Teacher</label>
            <select 
              className="input"
              value={filters.teacherId}
              onChange={handleTeacherChange}
            >
              <option value="">All Teachers</option>
              {availableTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <button type="button" onClick={() => setFilters({grade: '', subject: '', teacherId: '', search: ''})} className="btn btn-secondary h-[38px]">
             Clear Filters
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card h-48 skeleton"></div>
          ))}
        </div>
      ) : displayedMaterials.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="mx-auto text-secondary mb-4" size={48} />
          <h3 className="text-lg font-medium">No materials found</h3>
          <p className="text-secondary">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedMaterials.map((mat) => (
            <div key={mat.id} className="card flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded dark:bg-indigo-900 dark:text-indigo-200">
                  {mat.subject} • {mat.grade}
                </span>
                {mat.type === 'YOUTUBE' && <PlayCircle className="text-red-500" size={24} />}
              </div>
              <h3 className="font-semibold text-lg mb-1">{mat.title}</h3>
              <p className="text-sm text-secondary mb-4 flex-1">
                Chapter {mat.chapterNo}: {mat.chapterName}
              </p>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-[var(--border-color)]">
                <div className="text-sm">
                  <span className="text-secondary">By </span>
                  <span className="font-medium">{mat.uploader.name}</span>
                </div>
                <a 
                  href={mat.urlOrPath} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary text-xs py-1"
                >
                  View Material
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicDashboard;
