import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./module.css";

function StretchGame({ onComplete }) {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="physical-game-container">
      {!started && !done && (
        <>
          <h3 className="physical-title">🧘 Stretch Activity</h3>
          <p>Let's do some simple stretches to relax.</p>
          <button className="physical-btn" onClick={() => setStarted(true)}>Start Activity</button>
        </>
      )}
      {started && !done && (
        <>
          <h3 className="physical-title">Holding Stretch...</h3>
          <p>Reach for your toes and hold!</p>
          <button className="physical-btn" onClick={() => { setStarted(false); setDone(true); }}>Done Stretching</button>
        </>
      )}
      {done && (
        <>
          <h3 className="physical-title">🎉 Great Job!</h3>
          <p>You completed your stretching activity.</p>
          <button className="physical-btn" onClick={onComplete}>Finish Activity</button>
        </>
      )}
    </div>
  );
}

function JumpGame({ onComplete }) {
  const [started, setStarted] = useState(false);
  const [jumps, setJumps] = useState(0);
  const target = 10;

  return (
    <div className="physical-game-container">
      {!started ? (
        <>
          <h3 className="physical-title">🏃 Jump Activity</h3>
          <p>Let's do 10 jumping jacks to get your heart rate up!</p>
          <button className="physical-btn" onClick={() => setStarted(true)}>Start Activity</button>
        </>
      ) : jumps < target ? (
        <>
          <h3 className="physical-title">Jumping Jacks: {jumps} / {target}</h3>
          <button className="physical-btn" onClick={() => setJumps(jumps + 1)}>Jump!</button>
        </>
      ) : (
        <>
          <h3 className="physical-title">🎉 Amazing Energy!</h3>
          <p>You completed {target} jumps!</p>
          <button className="physical-btn" onClick={onComplete}>Finish Activity</button>
        </>
      )}
    </div>
  );
}

function BalanceGame({ onComplete }) {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="physical-game-container">
      {!started && !done && (
        <>
          <h3 className="physical-title">⚖️ Balance Activity</h3>
          <p>Stand on one leg to improve your balance.</p>
          <button className="physical-btn" onClick={() => setStarted(true)}>Start Activity</button>
        </>
      )}
      {started && !done && (
        <>
          <h3 className="physical-title">Balancing...</h3>
          <p>Hold your balance as long as you can!</p>
          <button className="physical-btn" onClick={() => { setStarted(false); setDone(true); }}>Done</button>
        </>
      )}
      {done && (
        <>
          <h3 className="physical-title">🎉 Well done!</h3>
          <p>Your balance is improving.</p>
          <button className="physical-btn" onClick={onComplete}>Finish Activity</button>
        </>
      )}
    </div>
  );
}

export default function PhysicalInput({ user }) {
  const navigate = useNavigate();

  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [steps, setSteps] = useState("");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [note, setNote] = useState("");

  const [gameStage, setGameStage] = useState("form");

  const submit = async () => {
    try {
      await API.post("/physical", {
        username: user,
        exercise_minutes: parseInt(exerciseMinutes) || 0,
        water_intake: parseFloat(waterIntake) || 0,
        steps: parseInt(steps) || 0,
        energy_level: parseInt(energyLevel) || 3,
        note: note
      });

      if (energyLevel <= 2) {
        setGameStage("stretch");
      } else if (steps < 3000) {
        setGameStage("jump");
      } else {
        setGameStage("balance");
      }
    } catch (error) {
      console.error("Error saving physical check-in:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="physical-page">
      <div className="physical-card">
        {gameStage === "form" && (
          <>
            <h3 className="physical-title">🏃 Physical Wellness</h3>

            <label className="physical-label">Exercise Duration (minutes)</label>
            <input
              type="number"
              value={exerciseMinutes}
              onChange={e => setExerciseMinutes(e.target.value)}
              placeholder="e.g. 30"
              className="physical-input"
            />

            <label className="physical-label">Water Intake (liters)</label>
            <input
              type="number"
              value={waterIntake}
              onChange={e => setWaterIntake(e.target.value)}
              step="0.1"
              placeholder="e.g. 2.5"
              className="physical-input"
            />

            <label className="physical-label">Steps Walked Today</label>
            <input
              type="number"
              value={steps}
              onChange={e => setSteps(e.target.value)}
              placeholder="e.g. 5000"
              className="physical-input"
            />

            <label className="physical-label">Energy Level ({energyLevel})</label>
            <input
              type="range"
              min="1"
              max="5"
              value={energyLevel}
              onChange={e => setEnergyLevel(e.target.value)}
              className="physical-slider"
            />

            <label className="physical-label">Notes (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="How are you feeling physically?"
              className="physical-textarea"
              rows={3}
            />

            <button onClick={submit} className="physical-btn">
              Submit & Start Activity
            </button>
          </>
        )}

        {gameStage === "stretch" && <StretchGame onComplete={() => navigate("/dashboard")} />}
        {gameStage === "jump" && <JumpGame onComplete={() => navigate("/dashboard")} />}
        {gameStage === "balance" && <BalanceGame onComplete={() => navigate("/dashboard")} />}
      </div>
    </div>
  );
}