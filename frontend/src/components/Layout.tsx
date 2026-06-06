import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
      <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="mobile-header">
        <button onClick={() => setSidebarOpen(true)} className="btn btn-secondary p-2">
          <Menu size={20} />
        </button>
        <span className="font-bold text-lg">SSSBS LMS</span>
      </div>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
