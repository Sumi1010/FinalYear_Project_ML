import { useState, useEffect } from "react";

export default function StretchHoldGame({ onComplete }) {
  const [timeLeft, setTimeLeft] = useState(20);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let timer;

    if (started && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }

    return () => clearTimeout(timer);
  }, [started, timeLeft, onComplete]);

  return (
    <div className="game-container">
      <h2>🟢 Stretch & Hold</h2>

      {!started ? (
        <>
          <h3>Hold Plank for 20 Seconds</h3>
          <button onClick={() => setStarted(true)}>
            Start
          </button>
        </>
      ) : (
        <>
          <h1>{timeLeft}</h1>
          {timeLeft > 0 ? (
            <p>Keep holding... 💪</p>
          ) : (
            <h3>🎉 Great Strength!</h3>
          )}
        </>
      )}
    </div>
  );
}