import { useState } from "react";
import API from "./api";
import "./profile.css";
import { useNavigate } from "react-router-dom";

export default function ProfileForm({ onComplete }) {

  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [wakeup, setWakeup] = useState("");
  const [sleep, setSleep] = useState("");
  const [interests, setInterests] = useState([]);
  const navigate = useNavigate();

  const toggle = (val) => {
    setInterests(i =>
      i.includes(val) ? i.filter(x => x !== val) : [...i, val]
    );
  };

  const submit = async () => {
  const username = localStorage.getItem("username");

  if (!age || !gender || !wakeup || !sleep) {
    alert("Please fill all fields");
    return;
  }

  try {
    await API.post(`/profile/${username}`, {
      age_category: age.toString(),
      gender: gender,
      wakeup_time: wakeup,
      sleep_time: sleep,
      interests: interests
    });

    alert("Profile saved successfully");

    navigate("/dashboard");   // 🔥 THIS LINE REDIRECTS

  } catch (err) {
    console.error(err.response?.data);
    alert("Profile save failed");
  }
};

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Tell us about you 🌿</h2>

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