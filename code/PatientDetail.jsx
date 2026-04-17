import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Activity, Thermometer, Wind, Video, AlertTriangle, ShieldCheck, BrainCircuit, Coffee, Pill } from 'lucide-react';
import { patients } from '../data/mockData';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = patients.find(p => p.id === id);

  if (!patient) return <div className="p-8">Patient not found</div>;

  // Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } }
    },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 2 }
    }
  };

  // Mock Chart Data for Heart Rate
  const hrData = {
    labels: ['10m', '8m', '6m', '4m', '2m', 'Now'],
    datasets: [{
      label: 'Heart Rate (bpm)',
      data: patient.status === 'danger' ? [75, 78, 85, 110, 120, patient.vitals.heartRate] : [72, 70, 75, 72, 73, patient.vitals.heartRate],
      borderColor: patient.status === 'danger' ? '#ef4444' : '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
    }]
  };

  return (
    <div className="flex flex-col gap-6" style={{ padding: '0 1rem', paddingBottom: '2rem' }}>
      <header className="flex items-center gap-4 fade-in">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-panel transition-all">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="h2 flex items-center gap-3">
            {patient.name} <span className="text-muted text-lg">({patient.age}세)</span>
            {patient.status === 'danger' && <span className="badge bg-danger">응급</span>}
            {patient.status === 'warn' && <span className="badge bg-warn">주의</span>}
            {patient.status === 'safe' && <span className="badge bg-safe">안전</span>}
          </h1>
          <p className="text-muted text-sm mt-1">마지막 동기화: {patient.lastUpdate} | 워치 배터리: {patient.deviceBattery}%</p>
        </div>
      </header>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)' }}>
        
        {/* Left Column: Biometrics & AI Briefing */}
        <div className="flex flex-col gap-6">
          
          {/* AI Briefing Panel (XAI) */}
          <div className={`glass-panel flex flex-col gap-4 fade-in ${patient.status === 'danger' ? 'bg-danger animate-pulse-danger' : patient.status === 'warn' ? 'bg-warn' : 'bg-safe'}`} style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BrainCircuit size={20} /> 
                특화 AI(LLaMA) 상태 브리핑 및 XAI 분석
              </h2>
              <div className="flex items-center gap-2 text-sm font-semibold">
                XGBoost 위험도 
                <span className={`text-lg ml-1 font-bold ${patient.status === 'danger' ? 'text-danger' : patient.status === 'warn' ? 'text-warn' : 'text-safe'}`}>
                  {patient.riskScore}%
                </span>
              </div>
            </div>
            <p className="leading-relaxed" style={{ fontSize: '1.05rem', marginTop: '0.5rem' }}>
              {patient.llmBrief}
            </p>
          </div>

          {/* Biometrics Grid */}
          <div className="grid gap-4 fade-in" style={{ gridTemplateColumns: 'repeat(4, 1fr)', animationDelay: '0.2s' }}>
            <div className="glass-panel flex flex-col gap-3 items-center justify-center py-6">
              <Heart size={28} className={patient.vitals.heartRate > 100 || patient.vitals.heartRate < 50 ? 'text-danger animate-bounce' : 'text-safe'} />
              <div className="text-center">
                <div className="h2">{patient.vitals.heartRate}</div>
                <div className="text-xs text-muted font-semibold uppercase tracking-wider">BPM (심박수)</div>
              </div>
            </div>
            
            <div className="glass-panel flex flex-col gap-3 items-center justify-center py-6">
              <Activity size={28} className={patient.status === 'danger' ? 'text-danger' : 'text-safe'} />
              <div className="text-center">
                <div className="h2" style={{ fontSize: '1.75rem' }}>{patient.vitals.bloodPressure}</div>
                <div className="text-xs text-muted font-semibold uppercase tracking-wider">mmHg (혈압)</div>
              </div>
            </div>

            <div className="glass-panel flex flex-col gap-3 items-center justify-center py-6">
              <Wind size={28} className={patient.vitals.oxygenLevel < 95 ? 'text-danger' : 'text-safe'} />
              <div className="text-center">
                <div className="h2">{patient.vitals.oxygenLevel}<span className="text-lg">%</span></div>
                <div className="text-xs text-muted font-semibold uppercase tracking-wider">SpO2 (산소포화도)</div>
              </div>
            </div>

            <div className="glass-panel flex flex-col gap-3 items-center justify-center py-6">
              <Thermometer size={28} className={patient.vitals.temperature >= 37.5 ? 'text-danger' : patient.vitals.temperature >= 37.0 ? 'text-warn' : 'text-safe'} />
              <div className="text-center">
                <div className="h2">{patient.vitals.temperature}<span className="text-lg">°C</span></div>
                <div className="text-xs text-muted font-semibold uppercase tracking-wider">Temp (체온)</div>
              </div>
            </div>
          </div>

          {/* Chart Panel */}
          <div className="glass-panel fade-in" style={{ height: '300px', animationDelay: '0.3s' }}>
            <h3 className="text-sm font-semibold mb-4 text-muted">최근 심박수 추이 (Wearable Data)</h3>
            <div style={{ height: '220px', width: '100%' }}>
              <Line data={hrData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Right Column: Camera & Care Info */}
        <div className="flex flex-col gap-6">
          
          {/* Webcam Feed */}
          <div className="glass-panel fade-in p-0 overflow-hidden relative" style={{ animationDelay: '0.4s', border: patient.status === 'danger' ? '2px solid var(--color-danger)' : '1px solid var(--border-color)' }}>
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm z-10">
              <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
              <span className="text-xs font-semibold text-white tracking-widest uppercase">Live Cam 01</span>
            </div>
            {patient.status === 'danger' && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-danger/80 px-3 py-1 rounded-full backdrop-blur-sm z-10">
                <AlertTriangle size={14} className="text-white" />
                <span className="text-xs font-bold text-white tracking-wider">낙상 감지됨 (Fall Detected)</span>
              </div>
            )}
            <div className="w-full aspect-video bg-gray-900 flex flex-col items-center justify-center" style={{ backgroundImage: 'linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px' }}>
              <Video size={48} className="text-gray-700 mb-2" />
              <span className="text-gray-500 text-sm">실시간 비전 데이터 스트리밍 중...</span>
              <span className="text-gray-600 text-xs mt-1">(OpenCV / PyTorch 연동 화면)</span>
            </div>
          </div>

          {/* Care Tasks & Dietary */}
          <div className="glass-panel fade-in flex flex-col gap-5" style={{ animationDelay: '0.5s', flex: 1 }}>
            <h3 className="font-bold flex items-center gap-2 border-b pb-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              맞춤형 건강 케어
            </h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-panel border" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                  <Coffee size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">식단 권장 (Dietary)</h4>
                  <p className="text-sm text-main font-bold">{patient.dietery.type}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-panel border" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-400">
                  <Pill size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">복약 알림 (Medication)</h4>
                  <ul className="text-sm border-l-2 pl-3 border-indigo-500/30 flex flex-col gap-2 mt-2">
                    {patient.dietery.medication.map((med, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        <span>{med}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {patient.status === 'danger' && (
               <button className="mt-auto w-full py-4 rounded-lg bg-danger text-white font-bold h3 justify-center shadow-lg hover:opacity-90 transition-all flex items-center gap-2 animate-pulse-danger">
                 <ShieldCheck size={24} />
                 즉각 출동 지시
               </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
