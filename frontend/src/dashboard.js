import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [streakData, setStreakData] = useState({
    streak: 0,
    badge: "Loading...",
    activityDates: []
  });

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const username = user || "testuser";
        const response = await fetch(`http://localhost:8000/streak/${username}`);
        if (response.ok) {
          const data = await response.json();
          setStreakData({
            streak: data.streak,
            badge: data.badge,
            activityDates: data.activity_dates
          });
        }
      } catch (error) {
        console.error("Error fetching streak:", error);
      }
    };
    fetchStreak();
  }, [user]);

  const today = new Date();
  const calendarGrid = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
    const isActive = streakData.activityDates.includes(dateStr);
    calendarGrid.push({ date: dateStr, isActive });
  }

  return (
    <div className="dashboard-container">

      {/* HEADER SECTION */}
      <div className="dashboard-header">
        <h1>Welcome, {user ? user : "User"} 🌿</h1>

        <div className="streak-section">
          <div className="streak-card">
            <h3>🔥 Daily Streak</h3>
            <p className="streak-count">🔥 {streakData.streak} Day Streak</p>
            <p className="streak-msg">
              {streakData.streak === 0 ? "Start your journey today!" :
                streakData.streak >= 7 ? "You're on fire! Keep the momentum!" :
                  "Consistency builds healthy habits!"}
            </p>
          </div>

          <div className="badge-card">
            <h3>Earned Badge</h3>
            <p className="badge-name">{streakData.badge}</p>
          </div>

          <div className="calendar-card">
            <h3>📅 Activity Calendar</h3>
            <div className="calendar-grid">
              {calendarGrid.map((day, idx) => (
                <div
                  key={idx}
                  className={`calendar-cell ${day.isActive ? "active" : "missed"}`}
                  title={day.date}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODULE SECTION */}
      <div className="modules-wrapper">

        {/* MENTAL WELLBEING */}
        <div className="module-card mental">
          <h2>Mental Wellbeing</h2>
          <p className="quote">
            "Your mind deserves the same care as your body."
          </p>
          <button
            className="module-btn"
            onClick={() => navigate("/mental")}
          >
            Daily Check‑In
          </button>
        </div>

        {/* PHYSICAL WELLBEING */}
        <div className="module-card physical">
          <h2>Physical Wellbeing</h2>
          <p className="quote">
            "Move your body. Strengthen your life."
          </p>
          <button
            className="module-btn"
            onClick={() => navigate("/physical")}
          >
            Daily Check‑In
          </button>
        </div>

        {/* NUTRITION MODULE */}
        <div className="module-card nutrition">
          <h2>Nutritional Lifestyle</h2>
          <p className="quote">
            "Fuel your body with what it truly needs."
          </p>
          <button
            className="module-btn"
            onClick={() => navigate("/nutrition")}
          >
            Daily Check‑In
          </button>
        </div>

        {/* HABIT TRACKING MODULE */}
        <div className="module-card habit-tracking">
          <h2>Habit Tracking</h2>
          <p className="quote">
            "Building good habits, one day at a time."
          </p>
          <button
            className="module-btn"
            onClick={() => navigate("/habit-tracking")}
          >
            Habit Tracking
          </button>
        </div>

      </div>

    </div>
  );
}