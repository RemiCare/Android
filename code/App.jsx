import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Bell, Activity } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PatientDetail from './pages/PatientDetail';
import MobileLayout from './components/MobileLayout';
import FamilyHome from './pages/Mobile/FamilyHome';
import FamilyCam from './pages/Mobile/FamilyCam';
import FamilyStats from './pages/Mobile/FamilyStats';
import FamilyCare from './pages/Mobile/FamilyCare';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <div className="glass-panel" style={{ width: '250px', height: 'calc(100vh - 2rem)', margin: '1rem', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem' }}>
      <div className="flex items-center gap-2" style={{ marginBottom: '3rem' }}>
        <Activity className="text-accent" size={32} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2 }}>
          Care<span className="text-accent">Guardian</span><br/>
          <span className="text-sm">지능형 관제 플랫폼</span>
        </h2>
      </div>

      <nav className="flex flex-col gap-4 flex-1">
        <Link to="/" className={`flex items-center gap-4 p-3 rounded-md transition-all ${isActive('/') ? 'bg-accent text-main' : 'text-muted hover:text-main hover:bg-panel'}`} style={{ textDecoration: 'none', color: isActive('/') ? 'var(--text-main)' : 'var(--text-muted)', background: isActive('/') ? 'rgba(59, 130, 246, 0.2)' : 'transparent' }}>
          <LayoutDashboard size={20} />
          <span>통합 관제</span>
        </Link>
        <Link to="/patients" className={`flex items-center gap-4 p-3 rounded-md transition-all ${isActive('/patients') ? 'bg-accent text-main' : 'text-muted hover:text-main hover:bg-panel'}`} style={{ textDecoration: 'none', color: isActive('/patients') ? 'var(--text-main)' : 'var(--text-muted)', background: isActive('/patients') ? 'rgba(59, 130, 246, 0.2)' : 'transparent' }}>
          <Users size={20} />
          <span>대상자 관리</span>
        </Link>
        <Link to="/alerts" className={`flex items-center gap-4 p-3 rounded-md transition-all text-muted hover:text-main hover:bg-panel`} style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>
          <Bell size={20} />
          <span>알림 내역</span>
        </Link>
      </nav>

      <div className="mt-auto">
        <Link to="/settings" className={`flex items-center gap-4 p-3 rounded-md transition-all text-muted hover:text-main hover:bg-panel`} style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>
          <Settings size={20} />
          <span>시스템 설정</span>
        </Link>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', backgroundColor: 'var(--bg-dark)', minHeight: '100vh' }}>
      <Sidebar />
      <main className="flex-1" style={{ padding: '1rem 1rem 1rem 0', height: '100vh', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Dashboard Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Dashboard />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
        </Route>
        
        {/* Family App Routes */}
        <Route path="/app" element={<MobileLayout />}>
          <Route index element={<FamilyHome />} />
          <Route path="cam" element={<FamilyCam />} />
          <Route path="stats" element={<FamilyStats />} />
          <Route path="care" element={<FamilyCare />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
