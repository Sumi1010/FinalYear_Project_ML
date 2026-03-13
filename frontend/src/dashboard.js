import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import API from "./api";
import MotivationPopup from "./components/MotivationPopup";

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [streakData, setStreakData] = useState({ streak: 0, badge: "Loading...", activityDates: [] });
  const [wellnessData, setWellnessData] = useState({ total: 0, mental_score: 0, physical_score: 0, nutrition_score: 0, habit_score: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = user || "guest";
        
        // Fetch Streak
        const streakRes = await API.get(`/streak/${username}`);
        if (streakRes.data) {
          setStreakData({
            streak: streakRes.data.streak,
            badge: streakRes.data.badge,
            activityDates: streakRes.data.activity_dates
          });
        }
        
        // Fetch Wellness Score
        const scoreRes = await API.get(`/wellness-score/${username}`);
        if (scoreRes.data) {
          setWellnessData(scoreRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
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

  const scorePercentage = wellnessData.total; // Max 100
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  return (
    <div className="dashboard-container">
      <MotivationPopup user={user} />

      {/* TOP SECTION: Welcome & Avatar */}
      <div className="dashboard-top">
        <div className="user-profile">
          <div className="avatar">{user ? user.charAt(0).toUpperCase() : "U"}</div>
          <div className="welcome-text">
            <h1>Welcome back, {user ? user : "User"}! ✨</h1>
            <p>Ready to improve your wellness today?</p>
          </div>
        </div>
        <button className="weekly-report-btn" onClick={() => navigate("/weekly-report")}>
          📊 Weekly Report
        </button>
      </div>

      {/* SECOND SECTION: Metrics Cards */}
      <div className="metrics-section">
        {/* Wellness Score Card */}
        <div className="metric-card score-card">
          <h3>Wellness Score</h3>
          <div className="circular-progress">
            <svg width="100" height="100">
              <circle className="circle-bg" cx="50" cy="50" r={radius} />
              <circle className="circle-progress" cx="50" cy="50" r={radius} 
                style={{ strokeDasharray: circumference, strokeDashoffset: strokeDashoffset }} 
              />
            </svg>
            <div className="score-value">
              <span>{wellnessData.total}</span>
              <small>/ 100</small>
            </div>
          </div>
          <p className="score-label">Today's Points</p>
        </div>

        {/* Daily Streak Card */}
        <div className="metric-card streak-card">
          <h3>Daily Streak</h3>
          <div className="streak-display">
            <span className="streak-fire">🔥</span>
            <span className="streak-count">{streakData.streak}</span>
          </div>
          <p className="streak-msg">
            {streakData.streak === 0 ? "Start your journey today!" :
             streakData.streak >= 7 ? "You're on fire! Keep going!" :
             "Consistency builds habits!"}
          </p>
          <div className="badge-display">
            🎖️ {streakData.badge}
          </div>
        </div>

        {/* Activity Calendar Card */}
        <div className="metric-card calendar-card">
          <h3>Activity Calendar</h3>
          <div className="calendar-grid">
            {calendarGrid.map((day, idx) => (
              <div
                key={idx}
                className={`calendar-cell ${day.isActive ? "active" : "missed"}`}
                title={day.date}
              ></div>
            ))}
          </div>
          <p className="calendar-label">Last 30 Days Activity</p>
        </div>
      </div>

      {/* THIRD SECTION: Modules */}
      <div className="modules-wrapper">
        <div className="module-card mental">
          <div className="module-icon">🧠</div>
          <h2>Mental Wellness</h2>
          <p className="quote">"Your mind deserves the same care as your body."</p>
          <p className="module-score">Score: {wellnessData.mental_score}/20</p>
          <button className="module-btn" onClick={() => navigate("/mental")}>Start Activity</button>
        </div>

        <div className="module-card physical">
          <div className="module-icon">🏃</div>
          <h2>Physical Wellness</h2>
          <p className="quote">"Move your body. Strengthen your life."</p>
          <p className="module-score">Score: {wellnessData.physical_score}/20</p>
          <button className="module-btn" onClick={() => navigate("/physical")}>Start Activity</button>
        </div>

        <div className="module-card nutrition">
          <div className="module-icon">🥗</div>
          <h2>Nutritional Lifestyle</h2>
          <p className="quote">"Fuel your body with what it truly needs."</p>
          <p className="module-score">Score: {wellnessData.nutrition_score}/20</p>
          <button className="module-btn" onClick={() => navigate("/nutrition")}>Start Activity</button>
        </div>

        <div className="module-card habit-tracking">
          <div className="module-icon">🌟</div>
          <h2>Habit Tracking</h2>
          <p className="quote">"Building good habits, one day at a time."</p>
          <p className="module-score">Score: {wellnessData.habit_score}/20</p>
          <button className="module-btn" onClick={() => navigate("/habit-tracking")}>Start Activity</button>
        </div>
      </div>

    </div>
  );
}