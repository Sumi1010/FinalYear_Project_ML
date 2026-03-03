import { useState, useEffect } from "react";

export default function ReactionGame({ onComplete }) {
  const [position, setPosition] = useState({ top: 50, left: 50 });
  const [score, setScore] = useState(0);
  const targetScore = 10;

  // Generate random position
  const moveCircle = () => {
    const top = Math.random() * 80;   // % position
    const left = Math.random() * 80;
    setPosition({ top, left });
  };

  useEffect(() => {
    moveCircle();
  }, []);

  const handleTap = () => {
    if (score < targetScore) {
      setScore(score + 1);
      moveCircle();
    }
  };

  if (score >= targetScore) {
    return (
      <div className="game-container">
        <h2>⚡ Reaction Complete!</h2>
        <h3>🎉 Great Reflexes!</h3>
        <button onClick={onComplete}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      className="game-container"
      style={{ position: "relative", height: "400px" }}
    >
      <h2>⚡ Reaction Tap Game</h2>
      <h3>Score: {score} / {targetScore}</h3>

      <div
        onClick={handleTap}
        style={{
          position: "absolute",
          top: `${position.top}%`,
          left: `${position.left}%`,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "green",
          cursor: "pointer"
        }}
      ></div>
    </div>
  );
}