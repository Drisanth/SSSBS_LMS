import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, Copy, RefreshCw, Clock, ExternalLink, 
  Archive, Trash2, Send, Search, FileText, Image as ImageIcon, Video, Globe, Play
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  notes: string;
  resourceUrl: string;
  resourceType: string;
  status: string;
  createdAt: string;
}

const TeacherConnectDashboard = () => {
  const navigate = useNavigate();
  const [sessionInfo, setSessionInfo] = useState<{ transferCode: string; expiresAt: string } | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Inbox
  const fetchInbox = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher-connect/inbox`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResources(res.data);
    } catch (error) {
      console.error('Failed to fetch inbox', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll inbox every 5 seconds
  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 5000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for session
  useEffect(() => {
    if (!sessionInfo) return;
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(sessionInfo.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setSessionInfo(null);
        setCountdown('');
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [sessionInfo]);

  const generateCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher-connect/generate-code`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessionInfo(res.data);
    } catch (error) {
      alert('Failed to generate code');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher-connect/resources/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInbox(); // Refresh instantly
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handlePublish = (resource: Resource) => {
    // Navigate to Materials page and pass the resource data to pre-fill the modal
    navigate('/materials', { state: { prefillResource: resource } });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'YOUTUBE': return <Play className="text-red-500" size={18} />;
      case 'PDF': return <FileText className="text-red-400" size={18} />;
      case 'IMAGE': return <ImageIcon className="text-blue-500" size={18} />;
      case 'VIDEO': return <Video className="text-purple-500" size={18} />;
      case 'DRIVE': return <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-4 h-4" alt="Drive" />;
      default: return <Globe className="text-gray-500" size={18} />;
    }
  };

  const filteredResources = resources.filter(r => 
    r.status === activeTab && 
    (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     r.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     r.resourceUrl.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const inboxCount = resources.filter(r => r.status === 'inbox').length;
  const publishedCount = resources.filter(r => r.status === 'published').length;
  const archivedCount = resources.filter(r => r.status === 'archived').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Smartphone className="text-primary" /> Teacher Connect
          </h1>
          <p className="text-secondary mt-1">Send resources directly from your mobile phone to your permanent inbox.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1">
          <div className="card h-full flex flex-col items-center text-center">
            <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-600">
              <Smartphone size={32} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Connect Your Phone</h3>
            <p className="text-sm text-secondary mb-6">Scan the QR code or enter the transfer code on your mobile device to start sending links instantly.</p>
            
            {!sessionInfo ? (
              <button onClick={generateCode} className="btn btn-primary w-full">
                <RefreshCw size={18} /> Generate Transfer Code
              </button>
            ) : (
              <div className="w-full">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 flex flex-col items-center">
                  <div className="bg-white p-2 rounded shadow-sm mb-4">
                    <QRCodeSVG 
                      value={`${window.location.origin}/teacher-connect/send?code=${sessionInfo.transferCode}`} 
                      size={150} 
                    />
                  </div>
                  <div className="font-mono text-2xl font-bold tracking-widest text-primary mb-2">
                    {sessionInfo.transferCode}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                    <Clock size={14} /> Expires in: {countdown}
                  </div>
                </div>
                <button onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/teacher-connect/send?code=${sessionInfo.transferCode}`);
                  alert('Link copied!');
                }} className="btn btn-secondary w-full text-sm">
                  <Copy size={16} /> Copy Direct Link
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col">
          <div className="card flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 w-full">
                <button 
                  className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'inbox' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
                  onClick={() => setActiveTab('inbox')}
                >
                  Inbox <span className="ml-1 bg-gray-100 dark:bg-gray-800 text-xs py-0.5 px-2 rounded-full">{inboxCount}</span>
                </button>
                <button 
                  className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'published' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
                  onClick={() => setActiveTab('published')}
                >
                  Published <span className="ml-1 bg-gray-100 dark:bg-gray-800 text-xs py-0.5 px-2 rounded-full">{publishedCount}</span>
                </button>
                <button 
                  className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'archived' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
                  onClick={() => setActiveTab('archived')}
                >
                  Archived <span className="ml-1 bg-gray-100 dark:bg-gray-800 text-xs py-0.5 px-2 rounded-full">{archivedCount}</span>
                </button>
              </div>
            </div>

            <div className="mb-4 relative">
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="input pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <RefreshCw className="animate-spin text-primary" size={24} />
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-secondary text-center">
                  <Archive size={48} className="mb-4 opacity-20" />
                  <p>No resources found in {activeTab}.</p>
                  {activeTab === 'inbox' && <p className="text-sm mt-2">Generate a code and send from your phone!</p>}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredResources.map(resource => (
                    <div key={resource.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary transition-colors bg-white dark:bg-[#1a1d24]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-1 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {getIconForType(resource.resourceType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[15px] truncate">{resource.title}</h4>
                            <a href={resource.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5 truncate">
                              <ExternalLink size={12} /> {resource.resourceUrl}
                            </a>
                            {resource.notes && (
                              <p className="text-sm text-secondary mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                {resource.notes}
                              </p>
                            )}
                            <div className="text-[11px] text-gray-400 mt-2 font-medium">
                              Received: {new Date(resource.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          {activeTab === 'inbox' && (
                            <button onClick={() => handlePublish(resource)} className="btn btn-primary text-xs py-1.5 px-3">
                              <Send size={14} /> Publish
                            </button>
                          )}
                          
                          <div className="flex justify-end gap-1">
                            {activeTab !== 'archived' && (
                              <button onClick={() => updateStatus(resource.id, 'archived')} className="p-1.5 text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Archive">
                                <Archive size={16} />
                              </button>
                            )}
                            {activeTab === 'archived' && (
                              <button onClick={() => updateStatus(resource.id, 'inbox')} className="p-1.5 text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Move to Inbox">
                                <RefreshCw size={16} />
                              </button>
                            )}
                            <button onClick={() => updateStatus(resource.id, 'deleted')} className="p-1.5 text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherConnectDashboard;
