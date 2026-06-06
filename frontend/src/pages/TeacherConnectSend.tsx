import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Send, Plus, Search, Smartphone } from 'lucide-react';

const TeacherConnectSend = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  
  const [code, setCode] = useState(initialCode);
  const [resourceUrl, setResourceUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (code.length === 9) {
      validateCode(code);
    }
  }, [code]);

  const validateCode = async (codeToVerify: string) => {
    setIsValidating(true);
    setError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher-connect/verify-code/${codeToVerify}`);
      if (res.data.valid) {
        setSessionData(res.data);
      } else {
        setSessionData(null);
        setError('Invalid or expired code.');
      }
    } catch (err: any) {
      setSessionData(null);
      setError(err.response?.data?.error || 'Invalid or expired code.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionData) return;
    
    setIsSubmitting(true);
    setError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher-connect/submit-resource`, {
        code,
        resourceUrl,
        title,
        notes
      });
      setSuccess(true);
      // Keep code, clear rest
      setResourceUrl('');
      setTitle('');
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card w-full max-w-md text-center py-12">
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Resource Sent!</h2>
          <p className="text-secondary mb-8">The resource has been permanently saved to your Teacher Connect Inbox.</p>
          <button 
            onClick={() => setSuccess(false)} 
            className="btn btn-primary w-full py-3"
          >
            <Plus size={18} /> Send Another Resource
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col p-4">
      <div className="flex items-center gap-2 mb-8 justify-center mt-4">
        <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold">
          <Smartphone size={18} />
        </div>
        <span className="font-bold text-xl">Teacher Connect</span>
      </div>

      <div className="card w-full max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-6 text-center">Send Resource to Inbox</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Transfer Code</label>
            <div className="relative">
              <input 
                type="text" 
                className="input pl-10 tracking-widest font-mono uppercase" 
                value={code} 
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="ABCD-1234"
                required
                maxLength={9}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            {isValidating && <p className="text-xs text-blue-500 mt-1">Validating code...</p>}
            {sessionData && !isValidating && (
              <p className="text-xs text-green-600 mt-1">✓ Connected to {sessionData.teacherName}'s Inbox</p>
            )}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <label className="label">Resource URL *</label>
            <input 
              type="url" 
              className="input" 
              value={resourceUrl} 
              onChange={e => setResourceUrl(e.target.value)} 
              placeholder="https://youtube.com/... or https://drive..."
              required 
            />
          </div>

          <div>
            <label className="label">Title (Optional)</label>
            <input 
              type="text" 
              className="input" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Grade 10 Math Chapter 4" 
            />
          </div>

          <div>
            <label className="label">Notes (Optional)</label>
            <textarea 
              className="input" 
              rows={3}
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Reminders or context for later..." 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary mt-4 py-3"
            disabled={!sessionData || isSubmitting || !resourceUrl}
          >
            {isSubmitting ? 'Sending...' : <><Send size={18} /> Send to Inbox</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherConnectSend;
