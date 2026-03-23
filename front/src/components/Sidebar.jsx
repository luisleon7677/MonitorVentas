import React from 'react';
import { LayoutDashboard, Users, TrendingUp, X } from 'lucide-react';

export default function Sidebar({ activeModule, setActiveModule, isOpen, setIsOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'clients', label: 'Clientes', icon: <Users size={20} /> },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <h1 className="header-title" style={{ fontSize: '1.5rem', margin: 0 }}>
          <span className="text-red">SALES</span><span style={{ color: 'white' }}>MONITOR</span>
        </h1>
        {/* Close button for mobile inside sidebar */}
        <button className="close-btn mobile-only" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
            onClick={() => setActiveModule(item.id)}
          >
            {item.icon}
            <span className="nav-text">{item.label}</span>
          </div>
        ))}
      </nav>
      
      <div className="sidebar-footer">
         <div className="flex items-center justify-center gap-2 text-muted" style={{ padding: '0 16px' }}>
            <TrendingUp size={16} className="text-red" />
            <span className="nav-text" style={{ fontSize: '12px', fontWeight: 'bold' }}>v1.1.0</span>
         </div>
      </div>
    </div>
  );
}
