import React from 'react';
import { Activity, Thermometer, Wind, Beaker, ChevronRight } from 'lucide-react';
import { patients } from '../../data/mockData';

export default function FamilyHealth() {
  const patient = patients[0];
  
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>건강 기록</h1>
        <p className="text-sm">어르신의 주간 건강 변화를 확인하세요.</p>
      </div>

      {/* Sleep Status */}
      <div className="family-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-main flex items-center gap-2">
            수면 패턴 분석
          </h3>
          <span className="text-sm text-accent font-medium">상세보기 <ChevronRight size={14} className="inline" /></span>
        </div>
        
        <div className="flex items-end gap-3 h-32 pl-2 border-b border-l border-gray-100" style={{ borderColor: 'var(--border-color)' }}>
           {/* Mock Bar Chart */}
           {[6.5, 7.2, 5.8, 8.1, 7.5, 6.0, 4.5].map((h, i) => (
             <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
               <div className="w-full bg-blue-100 rounded-t-sm" style={{ height: `${(h/10)*100}%`, backgroundColor: i === 6 ? '#ef4444' : '#bfdbfe' }}></div>
               <span className="text-[10px] text-muted">{['월','화','수','목','금','토','오늘'][i]}</span>
             </div>
           ))}
        </div>
        <p className="text-xs text-muted mt-3 text-center">어젯밤 수면 시간이 평소보다 부족합니다 (4.5시간).</p>
      </div>

      {/* Activity Status */}
      <div className="family-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-main flex items-center gap-2">
            주간 활동량 (걸음 수)
          </h3>
          <span className="text-sm text-accent font-medium">상세보기 <ChevronRight size={14} className="inline" /></span>
        </div>
        
        <div className="flex items-end gap-3 h-32 pl-2 border-b border-l border-gray-100" style={{ borderColor: 'var(--border-color)' }}>
           {/* Mock Bar Chart */}
           {[3500, 4200, 2800, 5100, 4800, 3100, 800].map((steps, i) => (
             <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
               <div className="w-full bg-green-100 rounded-t-sm" style={{ height: `${(steps/6000)*100}%`, backgroundColor: i === 6 ? '#fecdd3' : '#bbf7d0' }}></div>
               <span className="text-[10px] text-muted">{['월','화','수','목','금','토','오늘'][i]}</span>
             </div>
           ))}
        </div>
        <p className="text-xs text-muted mt-3 text-center">오늘 누적 걸음 수는 800보 입니다.</p>
      </div>

      {/* Recent Measurements */}
      <h3 className="font-bold text-md mt-2" style={{ color: 'var(--text-main)' }}>최근 측정 기록</h3>
      <div className="family-card flex flex-col gap-0 p-0 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100" style={{ borderColor: 'var(--border-color)' }}>
           <div className="flex items-center gap-3">
             <Activity size={20} className="text-red-500" />
             <span className="text-sm font-medium text-main">심박수</span>
           </div>
           <span className="text-sm font-bold text-main">{patient.vitals.heartRate} bpm</span>
        </div>
        <div className="flex justify-between items-center p-4 border-b border-gray-100" style={{ borderColor: 'var(--border-color)' }}>
           <div className="flex items-center gap-3">
             <Wind size={20} className="text-blue-500" />
             <span className="text-sm font-medium text-main">산소포화도</span>
           </div>
           <span className="text-sm font-bold text-main">{patient.vitals.oxygenLevel} %</span>
        </div>
        <div className="flex justify-between items-center p-4">
           <div className="flex items-center gap-3">
             <Thermometer size={20} className="text-orange-500" />
             <span className="text-sm font-medium text-main">체온</span>
           </div>
           <span className="text-sm font-bold text-main">{patient.vitals.temperature} °C</span>
        </div>
      </div>
      
    </div>
  );
}
