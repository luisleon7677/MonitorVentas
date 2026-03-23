import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile top bar */}
      <div className="mobile-header">
        <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <span className="mobile-title">
          <span className="text-red">SALES</span>MONITOR
        </span>
      </div>

      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={(mod) => { setActiveModule(mod); setIsSidebarOpen(false); }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="main-content">
        {renderModule()}
      </main>
    </div>
  );
}
