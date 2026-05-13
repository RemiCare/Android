import { useState, useRef } from "react";
import { T } from "../tokens";

/**
 * ZoneSelector: 카메라 화면 위에서 드래그하여 사각형 구역을 지정하는 컴포넌트
 */
export function ZoneSelector({ label, color = T.teal, onComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [rect, setRect] = useState(null);
  const containerRef = useRef(null);

  const getPos = (e) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    
    // 터치와 마우스 이벤트 모두 대응
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: Math.max(0, Math.min(clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(clientY - rect.top, rect.height))
    };
  };

  const handleStart = (e) => {
    // 폰에서 스크롤 방지
    if (e.type === 'touchstart') e.stopPropagation();
    const { x, y } = getPos(e);
    setRect({ x, y, w: 0, h: 0 });
    setIsDragging(true);
  };

  const handleMove = (e) => {
    if (!isDragging || !rect) return;
    if (e.type === 'touchmove') e.stopPropagation();
    const { x, y } = getPos(e);
    setRect(prev => ({ ...prev, w: x - prev.x, h: y - prev.y }));
  };

  const handleEnd = () => {
    if (!isDragging || !rect) return;
    setIsDragging(false);

    const finalX = rect.w < 0 ? rect.x + rect.w : rect.x;
    const finalY = rect.h < 0 ? rect.y + rect.h : rect.y;
    const finalW = Math.abs(rect.w);
    const finalH = Math.abs(rect.h);

    const { width, height } = containerRef.current.getBoundingClientRect();
    const ratio = { x: finalX / width, y: finalY / height, w: finalW / width, h: finalH / height };

    if (onComplete) onComplete(ratio);
  };

  const STREAM_URL = "http://192.168.1.102:5000/video/feed";

  return (
    <div style={{ position: "relative", width: "100%", height: 320, background: "#000", overflow: "hidden", borderRadius: 8, cursor: "crosshair" }}>
      {/* 배경 영상 */}
      <img 
        src={STREAM_URL} 
        alt="Live Preview" 
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: 0.8, pointerEvents: "none" }} 
      />
      
      {/* 드래그 레이어 */}
      <div 
        ref={containerRef}
        onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd}
        onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
        style={{ position: "absolute", inset: 0, zIndex: 10, touchAction: "none" }}
      >
        {/* 드래그 사각형 */}
        {rect && (
          <div style={{
            position: "absolute",
            left: rect.w < 0 ? rect.x + rect.w : rect.x,
            top: rect.h < 0 ? rect.y + rect.h : rect.y,
            width: Math.abs(rect.w),
            height: Math.abs(rect.h),
            border: `2px solid ${color}`,
            background: `${color}22`,
            pointerEvents: "none",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: "#fff", background: color, fontSize: 10, padding: "2px 6px", fontWeight: "bold", borderRadius: 4 }}>
              {label}
            </span>
          </div>
        )}

        {/* 가이드 문구 */}
        <div style={{ position: "absolute", top: 10, left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}>
          <span style={{ background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 11 }}>
            [{label}] 영역을 드래그하세요
          </span>
        </div>
      </div>
    </div>
  );
}
