import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

import BreathingGame from "../games/breathingGame";
import FocusTapGame from "../games/focusTapGame";
import ScribbleGame from "../games/scribbleGame";

import "./mental.css";

export default function MentalPage({ user }) {
  const navigate = useNavigate();

  // Form State
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [screenTime, setScreenTime] = useState("");
  const [note, setNote] = useState("");

  const [gameToPlay, setGameToPlay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
  setError("");

  if (!screenTime) {
    setError("Please enter your screen time.");
    return;
  }

  const payload = {
    username: user,
    mood: Number(mood),
    stress: Number(stress),
    sleep_quality: Number(sleepQuality),
    screen_time: Number(screenTime),
    note: note || ""
  };

  try {
    setLoading(true);

    // 1️⃣ Save mental input
    await API.post("/mental", payload);

    // 2️⃣ Get recommended game
    const gameRes = await API.post("/recommend-game", payload);

    console.log("GAME RESPONSE:", gameRes.data);

    if (gameRes.data && gameRes.data.game) {
      setGameToPlay(gameRes.data.game);
    } else {
      setError("Game not returned from server.");
    }

  } catch (err) {
    console.error("API ERROR:", err);
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  /* 🔒 GAME RENDERING */
  if (gameToPlay === "breathing") {
    return <BreathingGame onComplete={() => navigate("/dashboard")} />;
  }

  if (gameToPlay === "focus") {
    return <FocusTapGame onComplete={() => navigate("/dashboard")} />;
  }

  if (gameToPlay === "scribble") {
    return <ScribbleGame onComplete={() => navigate("/dashboard")} />;
  }

  return (
    <div className="mental-container">
      <div className="mental-card">
        <h2>Mental Wellness Check‑In 🧠</h2>

        {error && <p className="error">{error}</p>}

        <label>Mood (1–5)</label>
        <input
          type="range"
          min="1"
          max="5"
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
        />
        <span className="value-display">{mood}</span>

        <label>Stress (1–5)</label>
        <input
          type="range"
          min="1"
          max="5"
          value={stress}
          onChange={(e) => setStress(Number(e.target.value))}
        />
        <span className="value-display">{stress}</span>

        <label>Sleep Quality (1–5)</label>
        <input
          type="range"
          min="1"
          max="5"
          value={sleepQuality}
          onChange={(e) => setSleepQuality(Number(e.target.value))}
        />
        <span className="value-display">{sleepQuality}</span>

        <label>Screen Time (hours)</label>
        <input
          type="number"
          min="0"
          step="0.5"
          value={screenTime}
          onChange={(e) => setScreenTime(e.target.value)}
        />

        <label>Notes</label>
        <textarea
          placeholder="Write anything about your day..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button
          className="submit-btn"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit & Get Activity"}
        </button>
      </div>
    </div>
  );
}