import { useState } from "react";
import ProfileForm from "./profile";
import DailyInput from "./dailyinput";

import BreathingGame from "./games/breathingGame";
import FocusTapGame from "./games/focusTapGame";
import ScribbleGame from "./games/scribbleGame";

import "./dashboard.css";

export default function Dashboard({ user }) {
  const [profileDone, setProfileDone] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [gameToPlay, setGameToPlay] = useState(null);

  /* 🔒 FIRST LOGIN → PROFILE */
  if (!profileDone) {
    return <ProfileForm user={user} onComplete={() => setProfileDone(true)} />;
  }

  /* 🔒 NON‑SKIPPABLE GAME */
  if (gameToPlay) {
    if (gameToPlay === "breathing")
      return <BreathingGame onComplete={() => setGameToPlay(null)} />;

    if (gameToPlay === "focus")
      return <FocusTapGame onComplete={() => setGameToPlay(null)} />;

    if (gameToPlay === "scribble")
      return <ScribbleGame onComplete={() => setGameToPlay(null)} />;
  }

  return (
    <div className="dash-layout">
      {/* LEFT COLUMN */}
      <div className="dash-card">
        <h1>Welcome, {user} 🌿</h1>
        <p className="quote">
          “Your wellbeing matters. One step at a time.”
        </p>
      </div>

      {/* RIGHT COLUMN */}
      <div className="dash-card">
        <h3>Daily Wellness</h3>

        <button className="daily-btn" onClick={() => setShowDaily(true)}>
          Daily Check‑In
        </button>

        {recommendation && (
          <div className="recommend-box">
            <h4>🌟 Today’s Recommendation</h4>
            <p>{recommendation.text}</p>

            <button
              className="game-btn"
              onClick={() => setGameToPlay(recommendation.game)}
            >
              Start Suggested Activity
            </button>
          </div>
        )}
      </div>

      {/* DAILY INPUT POPUP */}
      {showDaily && (
        <div className="modal-overlay">
          <div className="modal">
            <DailyInput
              user={user}
              onClose={() => setShowDaily(false)}
              onResult={(rec) => setRecommendation(rec)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
