import { useState } from "react";
import API from "../api";
import "./module.css";

export default function PhysicalInput({ user }) {
  const [sleep, setSleep] = useState(3);
  const [water, setWater] = useState("");
  const [activity, setActivity] = useState("");

  const submit = async () => {
    await API.post("/physical-checkin", {
      username: user,
      sleep_quality: sleep,
      water_intake: parseInt(water),
      physical_activity: activity
    });

    alert("Physical check-in saved 🏃");
  };

  return (
    <div className="module-card">
      <h3>🏃 Physical Daily Check-In</h3>

      <label>Sleep Quality (1-5)</label>
      <input type="range" min="1" max="5"
        value={sleep}
        onChange={e => setSleep(e.target.value)}
      />

      <label>Water Intake (glasses)</label>
      <input type="number"
        onChange={e => setWater(e.target.value)}
      />

      <label>Physical Activity</label>
      <input
        placeholder="Walking / Gym / Yoga"
        onChange={e => setActivity(e.target.value)}
      />

      <button onClick={submit}>Submit</button>
    </div>
  );
}