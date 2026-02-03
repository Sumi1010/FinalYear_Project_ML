import { useEffect, useState } from "react";
import "./games.css";

export default function FocusTapGame({ onComplete }) {
  const [time, setTime] = useState(30);
  const [pos, setPos] = useState({ top: 100, left: 100 });

  useEffect(() => {
    if (time === 0) onComplete();
    const timer = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [time, onComplete]);

  const move = () => {
    setPos({
      top: Math.random() * 300,
      left: Math.random() * 300
    });
  };

  return (
    <div className="game-bg">
      <h2>🎯 Focus Tap</h2>
      <p>Tap the green circle • Time left: {time}s</p>

      <div
        className="tap-circle"
        style={{ top: pos.top, left: pos.left }}
        onClick={move}
      ></div>
    </div>
  );
}
