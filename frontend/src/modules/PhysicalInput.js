import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import SquatGame from "../games/SquatGame";
import JumpGame from "../games/JumpGame";
import StretchHoldGame from "../games/StretchHoldGame";
import ReactionGame from "../games/ReactionGame";
import "./module.css";

export default function PhysicalInput({ user }) {
  const navigate = useNavigate();

  const [sleep, setSleep] = useState(3);
  const [water, setWater] = useState("");
  const [activity, setActivity] = useState("");

  // 🔥 Game Stage Controller
  const [gameStage, setGameStage] = useState("form");

  const submit = async () => {
    try {
      await API.post("/physical-checkin", {
        username: user,
        sleep_quality: sleep,
        water_intake: parseInt(water),
        physical_activity: activity
      });

      alert("Physical check-in saved 🏃");

      // Start first game
      setGameStage("squat");

    } catch (error) {
      console.error("Error saving physical check-in:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="module-card">

      {/* 🟢 FORM */}
      {gameStage === "form" && (
        <>
          <h3>🏃 Physical Daily Check-In</h3>

          <label>Sleep Quality (1-5)</label>
          <input
            type="range"
            min="1"
            max="5"
            value={sleep}
            onChange={e => setSleep(e.target.value)}
          />

          <label>Water Intake (glasses)</label>
          <input
            type="number"
            value={water}
            onChange={e => setWater(e.target.value)}
          />

          <label>Physical Activity</label>
          <input
            placeholder="Walking / Gym / Yoga"
            value={activity}
            onChange={e => setActivity(e.target.value)}
          />

          <button onClick={submit}>
            Submit
          </button>
        </>
      )}

      {/* 🟢 SQUAT GAME */}
      {gameStage === "squat" && (
        <SquatGame onComplete={() => setGameStage("jump")} />
      )}

      {/* 🟢 JUMP GAME */}
      {gameStage === "jump" && (
        <JumpGame onComplete={() => setGameStage("stretch")} />
      )}

      {/* 🟢 STRETCH GAME */}
      {gameStage === "stretch" && (
        <StretchHoldGame onComplete={() => setGameStage("reaction")} />
      )}

      {/* 🟢 REACTION GAME */}
      {gameStage === "reaction" && (
        <ReactionGame onComplete={() => navigate("/dashboard")} />
      )}

    </div>
  );
}