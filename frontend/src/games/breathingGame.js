import { useEffect, useState } from "react";
import "./games.css";

export default function BreathingGame({ onComplete }) {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState("Inhale");

  useEffect(() => {
    const phases = ["Inhale", "Hold", "Exhale"];
    let i = 0;

    const interval = setInterval(() => {
      setPhase(phases[i % 3]);
      i++;

      if (i % 3 === 0) {
        setCycle(c => c + 1);
      }
      if (cycle === 4) {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [cycle, onComplete]);

  return (
    <div className="game-bg">
      <h2>🌬️ Breathe & Relax</h2>
      <div className={`breath-circle ${phase.toLowerCase()}`}></div>
      <h3>{phase}</h3>
      <p>Cycle {cycle + 1} / 5</p>
    </div>
  );
}
