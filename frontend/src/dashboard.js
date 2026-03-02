import { useState } from "react";
import MentalInput from "./modules/MentalInput";
import PhysicalInput from "./modules/PhysicalInput";
import NutritionInput from "./modules/NutritionInput";

import "./dashboard.css";

export default function Dashboard({ user }) {
  const [activeModule, setActiveModule] = useState("mental");
  const [streak, setStreak] = useState(5); // later fetch from backend

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <h2>Welcome, {user} 🌿</h2>
        <div className="header-right">
          <div className="streak-box">🔥 {streak} Day Streak</div>
          <button className="report-btn">
            📥 Download Weekly Report
          </button>
        </div>
      </div>

      {/* MODULE SELECTOR */}
      <div className="module-tabs">
        <button 
          className={activeModule === "mental" ? "active" : ""}
          onClick={() => setActiveModule("mental")}
        >
          🧠 Mental Wellbeing
        </button>

        <button 
          className={activeModule === "physical" ? "active" : ""}
          onClick={() => setActiveModule("physical")}
        >
          🏃 Physical Wellbeing
        </button>

        <button 
          className={activeModule === "nutrition" ? "active" : ""}
          onClick={() => setActiveModule("nutrition")}
        >
          🥗 Nutrition Lifestyle
        </button>
      </div>

      {/* MODULE CONTENT */}
      <div className="module-content">
        {activeModule === "mental" && <MentalInput user={user} />}
        {activeModule === "physical" && <PhysicalInput user={user} />}
        {activeModule === "nutrition" && <NutritionInput user={user} />}
      </div>

    </div>
  );
}