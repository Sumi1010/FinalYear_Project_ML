import { useRef, useEffect, useState } from "react";
import "./games.css";

export default function ScribbleGame({ onComplete }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [time, setTime] = useState(60);

  useEffect(() => {
    if (time === 0) onComplete();
    const t = setInterval(() => setTime(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [time, onComplete]);

  const draw = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#6BCF9B";
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const start = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setDrawing(true);
  };

  return (
    <div className="game-bg">
      <h2>🎨 Scribble & Relax</h2>
      <p>Draw freely • {time}s remaining</p>

      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        onMouseDown={start}
        onMouseUp={() => setDrawing(false)}
        onMouseMove={draw}
        className="canvas"
      />
    </div>
  );
}
