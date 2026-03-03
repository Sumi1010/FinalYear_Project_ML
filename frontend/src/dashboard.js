import { useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">

      {/* HEADER SECTION */}
      <div className="dashboard-header">
        <h1>Welcome, {user ? user : "User"} 🌿</h1>

        <div className="stats">
          <div className="stat-card">
            <h3>🔥 Daily Streak</h3>
            <p>5 Days</p>
          </div>

          <div className="stat-card">
            <h3>📊 Weekly Report</h3>
            <button className="report-btn">
              Download
            </button>
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

      </div>

    </div>
  );
}