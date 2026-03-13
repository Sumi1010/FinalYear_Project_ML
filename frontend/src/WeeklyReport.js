import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";
import API from "./api";
import "./WeeklyReport.css";

export default function WeeklyReport({ user }) {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const username = user || "guest";
        const res = await API.get(`/weekly-report/${username}`);
        if (res.data) {
          // reverse graph_data to be chronological (oldest to newest)
          const chronData = [...res.data.graph_data].reverse();
          setReport({ ...res.data, graph_data: chronData });
        }
      } catch (error) {
        console.error("Error fetching weekly report", error);
      }
    };
    fetchReport();
  }, [user]);

  if (!report) {
    return <div className="report-loading">Loading your detailed weekly report...</div>;
  }

  return (
    <div className="weekly-container">
      <div className="weekly-header">
        <h1>Weekly Wellness Report 📈</h1>
        <p>Insights into your mind and body from the last 7 days.</p>
      </div>

      <div className="report-sections">
        {/* SECTION 1 — USER SUMMARY */}
        <div className="report-card summary-card">
          <div className="icon">📝</div>
          <h3>User Summary</h3>
          <p>{report.user_summary}</p>
        </div>

        {/* SECTION 2 — IMPROVEMENT SUGGESTIONS */}
        <div className="report-card suggestion-card">
          <div className="icon">💡</div>
          <h3>Improvement Suggestions</h3>
          <p>{report.suggestion}</p>
        </div>

        {/* SECTION 3 — MOTIVATIONAL MESSAGE */}
        <div className="report-card motivation-card">
          <div className="icon">🌟</div>
          <h3>Motivational Message</h3>
          <p>{report.motivation}</p>
        </div>
      </div>

      {/* SECTION 4 — DATA VISUALIZATION */}
      <div className="charts-container">
        
        <div className="chart-wrapper">
          <h3>Mood Trend (Score)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={report.graph_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#a18cd1" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h3>Physical Activity (Minutes)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.graph_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="activity_minutes" fill="#ff9a44" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h3>Nutrition Score</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={report.graph_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="nutrition_score" stroke="#43e97b" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h3>Habits Completed</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.graph_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis allowDecimals={false} domain={[0, 'dataMax + 1']} />
              <Tooltip />
              <Bar dataKey="habits_completed" fill="#4facfe" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      <div className="report-footer">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </button>
      </div>

    </div>
  );
}
