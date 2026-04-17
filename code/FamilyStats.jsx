import React, { useState } from 'react';
import { Bot, LineChart as ChartIcon, Moon, Flame, Download, CheckCircle, FileText, AlertTriangle } from 'lucide-react';
import { patients } from '../../data/mockData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FamilyStats() {
  const patient = patients[0];
  const weeklyData = patient.weeklyStats || [];
  const [showBottom, setShowBottom] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadDone(true);
      setTimeout(() => {
        setShowBottom(false);
        setDownloadDone(false);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-5 relative">
      <div className="mb-1 mt-2 px-1">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>통합 인사이트</h1>
        <p className="text-sm opacity-80" style={{ color: 'var(--text-muted)' }}>장기 트렌드 기반 건강 분석</p>
      </div>

      {/* AI Behavioral Guide */}
      <div className="p-5 rounded-[24px] shadow-sm relative overflow-hidden" style={{ background: '#fff9f2', border: '1px solid rgba(251, 146, 60, 0.3)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
        <div className="flex items-start gap-3 relative z-10">
          <AlertTriangle size={24} color="#f97316" className="shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-[15px] mb-2 flex items-center gap-1.5" style={{ color: '#c2410c' }}>
              행동 패턴 경고 <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-600">AI 분석</span>
            </h3>
            <p className="text-[14px] leading-relaxed font-medium" style={{ color: '#78350f' }}>
              ⚠️ "최근 2주간 외출 빈도가 80% 감소하고 낮잠 시간이 늘었습니다. 가벼운 우울감이나 관절 통증이 원인일 수 있습니다. 이번 주말에는 함께 가벼운 산책을 권해 보세요."
            </p>
          </div>
        </div>
      </div>

      {/* Activity Long Trend Chart */}
      <div className="bg-white p-5 rounded-[24px] shadow-sm border" style={{ borderColor: 'var(--border-color)' }}>
        <h3 className="font-bold text-[15px] mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <ChartIcon size={18} color="var(--color-accent)" /> 주간 활동량 트렌드
        </h3>
        <div style={{ height: '220px', width: '100%', marginLeft: '-15px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
              <Line type="smooth" dataKey="activity" stroke="var(--color-accent)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 7 }} name="활동량" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PDF Export Button (100% width) */}
      <button 
        onClick={() => setShowBottom(true)}
        className="w-full py-4 mt-2 rounded-[20px] font-bold text-[16px] text-white flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)', border: 'none' }}>
        <FileText size={20} /> 🏥 병원 진료용 PDF 리포트 발급하기
      </button>

      {/* Bottom Sheet Modal */}
      {showBottom && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-t-[32px] p-6 pb-12 fade-in relative shadow-[0_-15px_40px_rgba(0,0,0,0.1)]">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            
            <h2 className="text-xl font-bold text-center mb-6" style={{ color: 'var(--text-main)' }}>리포트 추출 기간 선택</h2>
            
            {!downloading && !downloadDone ? (
              <div className="flex flex-col gap-3">
                <button onClick={handleDownload} className="w-full py-4 bg-gray-50 border rounded-2xl font-bold text-gray-700 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all text-center">
                  최근 1주일 (요약본)
                </button>
                <button onClick={handleDownload} className="w-full py-4 bg-gray-50 border rounded-2xl font-bold text-gray-700 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all text-center">
                  최근 1개월 (상세 진료용)
                </button>
                <button onClick={() => setShowBottom(false)} className="w-full py-4 mt-2 bg-transparent text-gray-400 font-bold underline border-none">
                  취소
                </button>
              </div>
            ) : downloading ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-purple-600">AI가 데이터를 분석하여 문서를 생성 중입니다...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 fade-in">
                <CheckCircle size={60} color="#10b981" className="mb-4" />
                <p className="font-bold text-green-600 text-lg mb-2">PDF 발급 완료!</p>
                <p className="text-gray-500 text-sm">기기에 자동 저장되었습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}
