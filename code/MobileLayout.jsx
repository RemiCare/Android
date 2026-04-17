import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Video, PieChart, HeartHandshake, PhoneCall, Mic, X } from 'lucide-react';
import { patients } from '../data/mockData';

export default function MobileLayout() {
  const location = useLocation();
  const patient = patients[0];
  const [isEmergency, setIsEmergency] = useState(patient.status === 'danger');
  const [showCallModal, setShowCallModal] = useState(false);

  useEffect(() => {
    setIsEmergency(patient.status === 'danger');
  }, [patient.status]);

  const isActive = (path) => {
    if (path === '/app' && location.pathname === '/app') return true;
    if (path !== '/app' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleCall = () => {
    setShowCallModal(true);
  };

  return (
    <div className="family-app-wrapper family-theme">
      
      {/* WebRTC Audio/Video Modal */}
      {showCallModal && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end fade-in pb-12" style={{ backgroundColor: 'rgba(255, 251, 244, 0.95)', backdropFilter: 'blur(10px)' }}>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-32 h-32 rounded-full flex justify-center items-center mb-6 shadow-2xl" style={{ background: 'linear-gradient(135deg, #ffa69e 0%, #ff8a80 100%)', animation: 'pulseDanger 2s infinite' }}>
              <PhoneCall size={50} color="white" className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>비상 통화 연결 중...</h2>
            <p className="text-md font-medium px-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              부모님 댁의 홈캠 마이크를 강제로 엽니다.<br/>스피커폰으로 바로 말씀하실 수 있습니다.
            </p>
            
            {/* Mock Audio Visualizer */}
            <div className="flex items-center gap-2 h-12 mt-8">
               <div className="w-2 h-6 bg-red-400 rounded animate-pulse delay-75"></div>
               <div className="w-2 h-10 bg-red-400 rounded animate-pulse delay-100"></div>
               <div className="w-2 h-12 bg-red-400 rounded animate-pulse delay-150"></div>
               <div className="w-2 h-8 bg-red-400 rounded animate-pulse delay-200"></div>
               <div className="w-2 h-10 bg-red-400 rounded animate-pulse delay-300"></div>
            </div>
          </div>
          
          <div className="px-8 pb-10 flex justify-between items-center w-full gap-4">
            <button className="flex-1 py-4 bg-white rounded-2xl shadow-sm text-gray-500 font-bold flex justify-center items-center gap-2 border-2" style={{ borderColor: 'var(--border-color)' }}>
              <Mic size={20} /> 마이크 끄기
            </button>
            <button onClick={() => setShowCallModal(false)} className="flex-1 py-4 rounded-2xl shadow-md text-white font-bold flex justify-center items-center gap-2" style={{ background: '#ef4444' }}>
              <X size={20} /> 통화 종료
            </button>
          </div>
        </div>
      )}

      <div className="mobile-app-container relative">
        <div className="mobile-content pb-24">
          <Outlet />
        </div>
        
        {/* Navigation Tab Bar */}
        <nav className="bottom-nav relative z-40 bg-white shadow-[0_-10px_30px_rgba(180,160,140,0.1)]" style={{ borderTop: 'none', borderRadius: '24px 24px 0 0', display: 'flex', justifyContent: 'space-between', padding: '0 1rem', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          
          <Link to="/app" className={`bottom-tab flex-1 py-3 ${isActive('/app') ? 'active' : ''}`} style={{ color: isActive('/app') ? 'var(--color-accent)' : 'var(--text-muted)' }}>
            <Home size={24} strokeWidth={isActive('/app') ? 2.5 : 2} />
            <span className="mt-1 font-bold text-[11px]">홈</span>
          </Link>
          
          <Link to="/app/cam" className={`bottom-tab flex-1 py-3 ${isActive('/app/cam') ? 'active' : ''}`} style={{ color: isActive('/app/cam') ? 'var(--color-accent)' : 'var(--text-muted)' }}>
            <Video size={24} strokeWidth={isActive('/app/cam') ? 2.5 : 2} />
            <span className="mt-1 font-bold text-[11px]">홈캠</span>
          </Link>
          
          {/* Central FAB Area (Spacer) */}
          <div className="w-16 flex-shrink-0 relative">
            <button onClick={handleCall} className="absolute left-1/2 -top-6 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white cursor-pointer transition-transform hover:scale-105" 
            style={{ 
              backgroundColor: isEmergency ? '#ef4444' : '#ffa69e',
              animation: isEmergency ? 'pulseDanger 2s infinite' : 'none',
              zIndex: 50
            }}>
              <PhoneCall size={28} color="white" className={isEmergency ? 'animate-bounce' : ''} />
            </button>
          </div>
          
          <Link to="/app/stats" className={`bottom-tab flex-1 py-3 ${isActive('/app/stats') ? 'active' : ''}`} style={{ color: isActive('/app/stats') ? 'var(--color-accent)' : 'var(--text-muted)' }}>
            <PieChart size={24} strokeWidth={isActive('/app/stats') ? 2.5 : 2} />
            <span className="mt-1 font-bold text-[11px]">인사이트</span>
          </Link>
          
          <Link to="/app/care" className={`bottom-tab flex-1 py-3 ${isActive('/app/care') ? 'active' : ''}`} style={{ color: isActive('/app/care') ? 'var(--color-accent)' : 'var(--text-muted)' }}>
            <HeartHandshake size={24} strokeWidth={isActive('/app/care') ? 2.5 : 2} />
            <span className="mt-1 font-bold text-[11px]">돌봄연계</span>
          </Link>
          
        </nav>
      </div>
    </div>
  );
}
