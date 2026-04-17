import React from 'react';
import { Pill, AlertTriangle, Lightbulb, UserCheck, MapPin, CheckCircle, ChevronRight } from 'lucide-react';
import { patients } from '../../data/mockData';

export default function FamilyCare() {
  const patient = patients[0];
  const { activeService, completedServices } = patient;

  return (
    <div className="flex flex-col gap-5 px-1 pb-4">
      {/* 1. 상단: 그리드 버튼 (간편 호출) */}
      <div>
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-main)' }}>돌봄 연계 서비스</h1>
        <p className="text-sm opacity-80 mb-4" style={{ color: 'var(--text-muted)' }}>근처의 전문 요양보호사가 즉시 출동합니다</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white p-4 rounded-[20px] shadow-sm border flex flex-col items-center justify-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Pill size={24} color="#3b82f6" />
            </div>
            <span className="font-bold text-[14px]" style={{ color: 'var(--text-main)' }}>약국 심부름</span>
          </button>
          
          <button className="bg-white p-4 rounded-[20px] shadow-sm border flex flex-col items-center justify-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} color="#ef4444" />
            </div>
            <span className="font-bold text-[14px]" style={{ color: 'var(--text-main)' }}>가벼운 낙상 확인</span>
          </button>
          
          <button className="bg-white p-4 rounded-[20px] shadow-sm border flex flex-col items-center justify-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <Lightbulb size={24} color="#f59e0b" />
            </div>
            <span className="font-bold text-[14px]" style={{ color: 'var(--text-main)' }}>전구등 교체</span>
          </button>
          
          <button className="bg-white p-4 rounded-[20px] shadow-sm border flex flex-col items-center justify-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <UserCheck size={24} color="#10b981" />
            </div>
            <span className="font-bold text-[14px]" style={{ color: 'var(--text-main)' }}>기타 안부 확인</span>
          </button>
        </div>
      </div>

      {/* 2. 중간: 출동 현황 트래커 */}
      {activeService && (
        <div className="bg-white p-5 rounded-[24px] shadow-sm border relative overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 font-bold text-[11px] rounded-full mb-2">진행 중인 요청</span>
              <h3 className="font-bold text-[16px]" style={{ color: 'var(--text-main)' }}>{activeService.type}</h3>
              <p className="text-[13px] mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>{activeService.worker}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin size={20} color="#3b82f6" className="animate-bounce" />
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="relative flex justify-between items-center px-2">
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-100 -translate-y-1/2 -z-10 rounded-full"></div>
            <div className="absolute top-1/2 left-4 h-1 bg-blue-500 -translate-y-1/2 -z-10 rounded-full transition-all duration-1000" style={{ width: `${(activeService.step - 1) * 33.3}%` }}></div>
            
            {['요청', '매칭', '출동중', '완료'].map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = activeService.step >= stepNum;
              const isCurrent = activeService.step === stepNum;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${isActive ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                    {isActive ? <CheckCircle size={12} /> : stepNum}
                  </div>
                  <span className={`text-[11px] font-bold ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. 하단: 조치 결과 보고 (갤러리 형태) */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[16px]" style={{ color: 'var(--text-main)' }}>최근 완료된 돌봄</h3>
          <button className="text-[12px] font-bold bg-transparent border-none flex items-center" style={{ color: 'var(--text-muted)' }}>
            전체보기 <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="flex flex-col gap-4">
          {completedServices?.map((srv) => (
            <div key={srv.id} className="bg-white p-4 rounded-[24px] shadow-sm border flex gap-4" style={{ borderColor: 'var(--border-color)' }}>
              <div className="w-20 h-20 rounded-[16px] shrink-0 bg-gray-100 overflow-hidden relative">
                <img src={srv.imgUrl} alt={srv.type} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[14px]" style={{ color: 'var(--text-main)' }}>{srv.type}</span>
                  <span className="text-[11px] font-medium px-1.5 py-0.5 bg-gray-100 rounded-md" style={{ color: 'var(--text-muted)' }}>{srv.date}</span>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>"{srv.comment}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
