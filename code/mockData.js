export const patients = [
  {
    id: "p1",
    name: "김영희",
    age: 78,
    status: "danger", // safe, warn, danger
    riskScore: 92,
    deviceBattery: 45,
    lastUpdate: "방금 전",
    vitals: {
      heartRate: 125, // High
      bloodPressure: "150/95", // High
      oxygenLevel: 94, // Low
      temperature: 36.8,
      steps: 3200, // Added steps for today
      stepGoal: 5000,
    },
    llmBrief: "현재 심박수가 125bpm으로 정상 범위를 크게 초과했으며, 웹캠 영상에서 바닥에 쓰러져 있는 듯한 낙상 자세가 포착되었습니다. 산소포화도 역시 94%로 저하되어 실신 및 심혈관계 이상 발생 확률이 92%로 매우 높습니다. 측면 확인 및 즉각적인 출동이 요구됩니다.",
    dietery: {
      type: "저나트륨식",
      medication: ["고혈압 약 (식후 30분)", "관절염 약"],
    },
    dailyChecklist: [
      { time: "08:00", title: "기상 및 활동 시작", status: "done" },
      { time: "09:30", title: "아침 식사 완료", status: "done" },
      { time: "10:00", title: "혈압약 복용 완료", status: "done" },
      { time: "15:00", title: "오후 가벼운 산책", status: "pending" },
    ],
    timeline: [
      { time: "14:30", type: "danger", message: "심박수 급상승 감지 (125bpm)", hasVideo: true },
      { time: "14:28", type: "warn", message: "비정상적인 움직임 (낙상 의심)", hasVideo: true },
      { time: "12:00", type: "safe", message: "점심 식사 완료" },
      { time: "09:00", type: "safe", message: "오전 약 복용 완료" }
    ],
    activeService: {
      type: "약국 심부름",
      step: 3, // 1: 요청, 2: 매칭, 3: 출동, 4: 완료
      worker: "이정임 요양보호사 (도착 15분 전)",
    },
    completedServices: [
      { id: 1, type: "전등 교체", date: "2일 전", comment: "방 안의 어두운 전구를 밝은 LED로 안전하게 교체해 드렸습니다 😊", imgUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop" },
      { id: 2, type: "가벼운 낙상 확인", date: "1주일 전", comment: "크게 다치신 곳은 없고 단순히 미끄러지셨습니다. 찜질 조치 해드렸어요.", imgUrl: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=400&auto=format&fit=crop" }
    ],
    weeklyStats: [
      { day: "월", sleep: 6.5, activity: 4200 },
      { day: "화", sleep: 7.0, activity: 5100 },
      { day: "수", sleep: 5.5, activity: 3800 },
      { day: "목", sleep: 6.0, activity: 4500 },
      { day: "금", sleep: 7.5, activity: 6000 },
      { day: "토", sleep: 8.0, activity: 5500 },
      { day: "일", sleep: 4.5, activity: 3200 },
    ],
    aiGuide: "최근 3일 전반적으로 수면 시간이 불규칙하며, 어젯밤 수면이 4.5시간으로 매우 부족했습니다. 피로 누적이 낙상으로 이어졌을 수 있습니다. 회복을 위해 충분한 안정이 필요합니다."
  },
  {
    id: "p2",
    name: "박철수",
    age: 82,
    status: "warn",
    riskScore: 65,
    deviceBattery: 82,
    lastUpdate: "3분 전",
    vitals: {
      heartRate: 95,
      bloodPressure: "135/85",
      oxygenLevel: 96,
      temperature: 37.3, // Slight fever
    },
    llmBrief: "체온이 37.3도로 미열 기준을 충족하며 센서상 움직임이 평소 대비 30%가량 감소했습니다. 카메라 상에서 소파에 계속 누워있는 모습이 확인되었습니다. 단순 휴식일 가능성이 높으나 감기몸살 등의 초기 증상일 수 있으니 전화 확인을 권장합니다.",
    dietery: {
      type: "고단백식",
      medication: ["당뇨약 (식전)"],
    }
  },
  {
    id: "p3",
    name: "이순호",
    age: 74,
    status: "safe",
    riskScore: 12,
    deviceBattery: 95,
    lastUpdate: "1분 전",
    vitals: {
      heartRate: 72,
      bloodPressure: "120/80",
      oxygenLevel: 98,
      temperature: 36.5,
    },
    llmBrief: "모든 생체 데이터가 정상 범위 내에 있습니다. 주기적인 활동 범위가 평소와 같으며 특이사항은 감지되지 않았습니다. 안전 상태입니다.",
    dietery: {
      type: "일반식",
      medication: ["비타민 C", "오메가 3"],
    }
  },
  {
    id: "p4",
    name: "정말순",
    age: 88,
    status: "safe",
    riskScore: 24,
    deviceBattery: 15,
    lastUpdate: "10분 전",
    vitals: {
      heartRate: 68,
      bloodPressure: "115/75",
      oxygenLevel: 97,
      temperature: 36.4,
    },
    llmBrief: "건강 상태는 양호하나 웨어러블 디바이스 배터리가 15% 미만입니다. 충전이 필요합니다.",
    dietery: {
      type: "당뇨식",
      medication: ["당뇨약"],
    }
  }
];

export const alertsFeed = [
  {
    id: "a1",
    patientId: "p1",
    patientName: "김영희",
    time: "2026-04-06 23:35",
    type: "danger",
    message: "[긴급] 낙상 의심 및 이상 심박수 감지",
    details: "XGBoost AI 판단 결과 위험도 92%. 웹캠 및 스마트워치 교차 검증됨."
  },
  {
    id: "a2",
    patientId: "p2",
    patientName: "박철수",
    time: "2026-04-06 22:15",
    type: "warn",
    message: "[주의] 체온 상승 및 활동량 감소",
    details: "미열(37.3도) 감지, 3시간 연속 누워있음."
  },
  {
    id: "a3",
    patientId: "p4",
    patientName: "정말순",
    time: "2026-04-06 20:00",
    type: "info",
    message: "[안내] 디바이스 배터리 부족",
    details: "스마트워치 배터리 15% 남음. 충전 안내 필요."
  }
];
