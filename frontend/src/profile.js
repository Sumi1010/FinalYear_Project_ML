import { useState } from "react";
import API from "./api";
import "./profile.css";

export default function ProfileForm({ user, onComplete }) {
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [wakeup, setWakeup] = useState("");
  const [sleep, setSleep] = useState("");
  const [interests, setInterests] = useState([]);

  const toggle = (val) => {
    setInterests(i =>
      i.includes(val) ? i.filter(x => x !== val) : [...i, val]
    );
  };

  const submit = async () => {
  try {
    await API.post("/profile", {
      username: user,
      age_category: age.toString(),   // ✅ FIXED
      gender: gender,
      wakeup_time: wakeup,            // ✅ FIXED
      sleep_time: sleep,              // ✅ FIXED
      interests: interests             // ✅ already correct
    });

    onComplete();
  } catch (err) {
    console.error(err.response?.data);
    alert("Profile save failed");
  }
};

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Tell us about you 🌿</h2>
        <p className="hint">This helps us personalize your wellbeing journey</p>

        <label>Age</label>
        <input type="number" onChange={e => setAge(e.target.value)} />

        <label>Gender</label>
        <select onChange={e => setGender(e.target.value)}>
          <option value="">Select</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <label>Wake‑up Time</label>
        <input type="time" onChange={e => setWakeup(e.target.value)} />

        <label>Sleep Time</label>
        <input type="time" onChange={e => setSleep(e.target.value)} />

        {gender && (
          <>
            <label>Your Interests</label>
            <div className="checkbox">
              {(gender === "Male"
                ? ["Fitness", "Travel", "Focus"]
                : ["Fitness", "Skincare", "Mindfulness"]
              ).map(i => (
                <label key={i}>
                  <input type="checkbox" onChange={() => toggle(i)} /> {i}
                </label>
              ))}
            </div>
          </>
        )}

        <button onClick={submit}>Save & Continue</button>
      </div>
    </div>
  );
}
