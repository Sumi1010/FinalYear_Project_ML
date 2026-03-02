import { useState } from "react";
import API from "../api";
import "./module.css";

export default function DailyInput({ user, onClose, onResult }) {
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [screenTime, setScreenTime] = useState("");
  const [water, setWater] = useState("");
  const [note, setNote] = useState("");

  const submit = async () => {
    const payload = {
      username: user,
      mood,
      stress,
      sleep_quality: sleepQuality,
      screen_time: parseFloat(screenTime),
      physical_activity: "",
      water_intake: parseInt(water),
      note
    };

    await API.post("/daily", payload);

    const res = await API.post("/recommend-game", payload);

    onResult(res.data);
    onClose();
  };

  return (
    <div className="daily-card">
      <h2>Daily Check‑In 🌼</h2>

      <label>Mood (1–5)</label>
      <input type="range" min="1" max="5"
        value={mood} onChange={e => setMood(e.target.value)} />

      <label>Stress (1–5)</label>
      <input type="range" min="1" max="5"
        value={stress} onChange={e => setStress(e.target.value)} />

      <label>Sleep Quality (1–5)</label>
      <input type="range" min="1" max="5"
        value={sleepQuality} onChange={e => setSleepQuality(e.target.value)} />

      <label>Screen Time (hours)</label>
      <input type="number" onChange={e => setScreenTime(e.target.value)} />

      <label>Water Intake (glasses)</label>
      <input type="number" onChange={e => setWater(e.target.value)} />

      <label>Notes</label>
      <textarea onChange={e => setNote(e.target.value)} />

      <div className="actions">
        <button onClick={submit}>Submit</button>
        <button className="cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
} 