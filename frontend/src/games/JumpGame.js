import { useState } from "react";

export default function JumpGame({ onComplete }) {
  const [count, setCount] = useState(0);
  const target = 20;

  const handleJump = () => {
    if (count < target) {
      setCount(count + 1);
    }
  };

  return (
    <div className="game-container">
      <h2>🟢 Jump Counter Game</h2>

      <h1>{count} / {target}</h1>

      {count < target ? (
        <button onClick={handleJump}>
          Jump!
        </button>
      ) : (
        <>
          <h3>🎉 Great Energy!</h3>
          <button onClick={onComplete}>
            Back to Dashboard
          </button>
        </>
      )}
    </div>
  );
}