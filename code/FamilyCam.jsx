import React, { useState } from 'react';
import { PlayCircle, Video, Mic, Volume2, Maximize2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { patients } from '../../data/mockData';

export default function FamilyCam() {
  const patient = patients[0];
  const [isMicActive, setIsMicActive] = useState(false);

  const getEventIcon = (type) => {
    switch (type) {
      case 'danger': return <AlertCircle color="#ef4444" size={20} />;
      case 'warn': return <AlertCircle color="#fbbf24" size={20} />;
      case 'safe': return <CheckCircle color="#10b981" size={20} />;
      default: return <Clock color="#64748b" size={20} />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>거실 실시간 뷰</h1>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border" style={{ backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> 연결됨
        </div>
      </div>

      {/* Video Player Area */}
      <div className="family-card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#0f172a' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="flex flex-col items-center gap-2 opacity-50 text-white">
            <PlayCircle size={48} strokeWidth={1} />
            <span className="text-sm">라이브 영상 스트리밍 중...</span>
          </div>
          <div className="absolute top-3 left-3 bg-red-600 px-2 py-1 rounded text-white text-xs font-bold flex items-center gap-1 tracking-wider shadow">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> REC
          </div>
          <div className="absolute bottom-3 right-3 text-white opacity-70 text-xs font-mono drop-shadow-md">
            {new Date().toLocaleTimeString('ko-KR')}
          </div>
        </div>
        
        {/* Controls */}
        <div className="p-3 flex justify-between items-center" style={{ backgroundColor: '#1e293b' }}>
          <div className="flex gap-4">
            <button className="text-white opacity-80 hover:opacity-100 flex items-center gap-1 border-none bg-transparent cursor-pointer"><Volume2 size={20} /></button>
          </div>
          <button 
            className={`px-5 py-2 rounded-full font-bold flex items-center gap-2 transition-colors border-none shadow-sm cursor-pointer ${isMicActive ? 'bg-red-500 text-white scale-95' : 'bg-blue-500 text-white'}`}
            onMouseDown={() => setIsMicActive(true)}
            onMouseUp={() => setIsMicActive(false)}
            onTouchStart={() => setIsMicActive(true)}
            onTouchEnd={() => setIsMicActive(false)}
          >
            <Mic size={18} /> {isMicActive ? '목소리 전송 중...' : '누르고 말하기'}
          </button>
          <div>
            <button className="text-white opacity-80 hover:opacity-100 border-none bg-transparent cursor-pointer"><Maximize2 size={20}/></button>
          </div>
        </div>
      </div>

      {/* AI Event Timeline */}
      <div className="mt-2" style={{ color: 'var(--text-main)' }}>
        <h2 className="text-lg font-bold mb-3">AI 이벤트 자동 기록</h2>
        <div className="family-card flex flex-col items-start gap-0 relative" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <div className="absolute left-[33px] top-8 bottom-8 w-0.5" style={{ backgroundColor: '#e2e8f0' }}></div>
          
          {patient.timeline.map((item, index) => (
            <div key={index} className="flex gap-4 w-full relative z-10 py-3 transition-transform active:scale-[0.98] cursor-pointer">
              <div className="rounded-full bg-white flex items-center justify-center p-1 border-2" style={{ borderColor: '#f1f5f9', marginTop: '2px' }}>
                {getEventIcon(item.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold text-sm ${item.type === 'danger' ? 'text-red-600' : item.type === 'warn' ? 'text-yellow-600' : 'text-gray-700'}`}>
                    {item.message}
                  </span>
                  <span className="text-xs text-gray-400 font-mono font-medium">{item.time}</span>
                </div>
                {item.hasVideo && (
                  <div className="mt-2 h-14 rounded-md flex items-center justify-center text-xs font-semibold shadow-sm border border-transparent hover:border-gray-300 transition-colors" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
                    <PlayCircle size={16} className="mr-1.5 opacity-70" /> 15초 녹화 클립 확인
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
