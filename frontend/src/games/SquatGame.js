import { useState } from "react";

export default function SquatGame({ onComplete }) {
  const [count, setCount] = useState(0);
  const target = 15;

  const handleSquat = () => {
    if (count < target) {
      setCount(count + 1);
    }
  };

  return (
    <div style={{ marginTop: "30px", textAlign: "center" }}>
      <h3>Complete 15 Squats 🏋️</h3>

      <h1>{count} / {target}</h1>

      {count < target ? (
        <button onClick={handleSquat}>
          I did one squat!
        </button>
      ) : (
        <div>
          <h2>Great Job! 🎉</h2>
          <button onClick={onComplete}>
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}