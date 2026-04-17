import React from 'react';
import { Heart, Activity, Wind, CheckCircle2, Clock, Bot, AlertCircle } from 'lucide-react';
import { patients } from '../../data/mockData';

export default function FamilyHome() {
  const patient = patients[0];
  const isDanger = patient.status === 'danger';

  // Make the LLM string cute and soothing
  const aiMessage = isDanger 
    ? "어머니의 심박수가 비정상적으로 높고 움직임이 없으십니다! 119버튼을 눌러 상황을 확인해 주세요."
    : "어머니는 현재 평온한 상태이며, 아침 약 복용을 완료하셨습니다. 식사도 잘 하셨어요 😊";

  return (
    <div className="flex flex-col gap-5">
      {/* 1. 상단: AI 요약 카드 (다정한 톤, 파스텔 베이지 UI) */}
      <div className="flex flex-col mt-2">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Bot color="var(--color-accent)" size={24} />
          <h1 className="text-xl font-black" style={{ color: 'var(--text-main)' }}>가디언AI 안심 리포트</h1>
        </div>
        
        <div className="p-5 rounded-[24px] shadow-sm border" style={{ 
            backgroundColor: isDanger ? '#fef2f2' : '#ffffff',
            borderColor: isDanger ? '#fca5a5' : 'var(--border-color)',
            boxShadow: 'var(--shadow-main)'
          }}>
          <p className="text-[15px] font-medium leading-relaxed tracking-tight" style={{ color: isDanger ? '#dc2626' : 'var(--text-main)' }}>
            "{aiMessage}"
          </p>
        </div>
      </div>

      {/* 2. 중간: 데일리 체크리스트 타임라인 (잔소리 외주화) */}
      <div className="family-card !mb-0 p-5 rounded-[24px]">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-[17px]" style={{ color: 'var(--text-main)' }}>오늘의 체크리스트</h3>
          <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
            <Activity size={12} /> AI 자동 기록중
          </span>
        </div>

        <div className="flex flex-col gap-4 relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-2 bottom-6 w-0.5" style={{ backgroundColor: 'var(--border-color)' }}></div>
          
          {patient.dailyChecklist?.map((item, idx) => {
            const isDone = item.status === 'done';
            return (
              <div key={idx} className={`relative flex items-center gap-4 z-10 transition-all ${isDone ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white`}
                  style={{ borderColor: isDone ? '#10b981' : 'var(--border-color)' }}>
                  {isDone ? <CheckCircle2 size={16} color="#10b981" /> : <Clock size={16} color="var(--text-muted)" />}
                </div>
                <div className="flex-1 bg-white border rounded-2xl p-3 shadow-sm flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="font-semibold text-[14px]" style={{ color: isDone ? 'var(--text-main)' : 'var(--text-muted)' }}>{item.title}</span>
                  <span className="text-[12px] font-bold" style={{ color: 'var(--text-muted)' }}>{item.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 소형 생체 요약 (디자인 포인트) */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white border p-4 rounded-[24px] shadow-sm flex flex-col items-center justify-center" style={{ borderColor: 'var(--border-color)' }}>
           <Heart size={20} color="#ff8a80" className="mb-2" />
           <span className="font-black text-xl" style={{ color: 'var(--text-main)' }}>{patient.vitals.heartRate}</span>
           <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>BPM</span>
        </div>
        <div className="flex-1 bg-white border p-4 rounded-[24px] shadow-sm flex flex-col items-center justify-center" style={{ borderColor: 'var(--border-color)' }}>
           <Wind size={20} color="#81c784" className="mb-2" />
           <span className="font-black text-xl" style={{ color: 'var(--text-main)' }}>{patient.vitals.oxygenLevel}%</span>
           <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>산소포화도</span>
        </div>
        <div className="flex-1 bg-white border p-4 rounded-[24px] shadow-sm flex flex-col items-center justify-center" style={{ borderColor: 'var(--border-color)' }}>
           <Activity size={20} color="#ffd54f" className="mb-2" />
           <span className="font-black text-xl" style={{ color: 'var(--text-main)' }}>{patient.vitals.steps}</span>
           <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>걸음</span>
        </div>
      </div>
    </div>
  );
}
