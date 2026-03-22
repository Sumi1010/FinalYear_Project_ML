import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
          // Calculate dynamic text based on user inputs
          const mental = res.data.mental_data || [];
          const physical = res.data.physical_data || [];
          const habits = res.data.habit_data || [];
          const graphData = res.data.graph_data || [];

          // 1. Analyze Mental (Mood / Stress / texts)
          let hasNegativeMood = false;
          mental.forEach(m => {
            const note = (m.note || "").toLowerCase();
            if (note.includes("sad") || note.includes("tired") || note.includes("stressed") || parseInt(m.mood) <= 2) {
              hasNegativeMood = true;
            }
          });

          // 2. Analyze Habits
          const habitsCompleted = habits.length;
          
          // 3. Analyze Physical
          let totalActivity = 0;
          physical.forEach(p => { totalActivity += parseInt(p.exercise_minutes || 0); });
          let activityLevel = totalActivity >= 105 ? "high" : (totalActivity >= 50 ? "moderate" : "low");

          // 4. Analyze Nutrition
          let totalNutritionScore = 0;
          graphData.forEach(g => { totalNutritionScore += parseInt(g.nutrition_score || 0); });
          const avgNutrition = graphData.length > 0 ? totalNutritionScore / graphData.length : 0;
          let nutritionLevel = avgNutrition >= 50 ? "good levels" : "slightly below recommended levels";

          // Generate User Summary
          let moodText = hasNegativeMood ? "feeling tired and low" : "feeling positive and energetic";
          let userSummary = `This week you often reported ${moodText}. You completed ${habitsCompleted} habits, had ${activityLevel} physical activity, and your nutrition intake was ${nutritionLevel}.`;
          
          if (habitsCompleted < 3) {
            userSummary += " You had low habit consistency.";
          } else {
            userSummary += " You maintained positive habit consistency!";
          }

          // Generate Suggestions
          let suggestionsList = [];
          if (habitsCompleted < 3) {
            suggestionsList.push("Try to stay consistent with your daily habits. Small steps lead to big changes.");
          }
          if (hasNegativeMood) {
            suggestionsList.push("- Take short breaks\n- Practice breathing\n- Talk to someone");
          }
          if (totalActivity < 70) {
            suggestionsList.push("Try at least 10–15 mins daily exercise.");
          }
          if (avgNutrition < 50) {
            suggestionsList.push("Include balanced meals and stay hydrated.");
          }

          let finalSuggestion = suggestionsList.slice(0, 3).join("\n\n");
          if (!finalSuggestion) finalSuggestion = "Keep up the great work! You are doing amazing.";

          // Generate Motivational Message
          let performanceScore = 0;
          if (!hasNegativeMood) performanceScore += 1;
          if (habitsCompleted >= 3) performanceScore += 1;
          if (totalActivity >= 70) performanceScore += 1;
          if (avgNutrition >= 50) performanceScore += 1;

          let motivation = "";
          if (performanceScore >= 3) {
            motivation = "Great job! You're building a healthy and consistent lifestyle 🚀";
          } else if (performanceScore >= 2) {
            motivation = "You're improving steadily. Keep going, consistency is key 💪";
          } else {
            motivation = "Don't worry! Every day is a new chance to improve. Start small 🌱";
          }

          if (hasNegativeMood && performanceScore < 3) {
            motivation += "\n\nRemember to take care of your mental well-being! We are here for you 💙";
          }

          // reverse graph_data to be chronological (oldest to newest)
          const chronData = [...graphData].reverse();
          setReport({ 
            ...res.data, 
            graph_data: chronData,
            user_summary: userSummary,
            suggestion: finalSuggestion,
            motivation: motivation
          });
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

  const downloadReport = async () => {
    const reportElement = document.getElementById("report-section");
    if (!reportElement) return;

    try {
      const canvas = await html2canvas(reportElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Weekly_Report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="weekly-container">
      <div id="report-section">
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
          <p style={{ whiteSpace: "pre-line" }}>{report.suggestion}</p>
        </div>

        {/* SECTION 3 — MOTIVATIONAL MESSAGE */}
        <div className="report-card motivation-card">
          <div className="icon">🌟</div>
          <h3>Motivational Message</h3>
          <p style={{ whiteSpace: "pre-line" }}>{report.motivation}</p>
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

      </div>

      <div className="report-footer">
        <button className="download-btn" onClick={downloadReport}>
          Download Report
        </button>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </button>
      </div>

    </div>
  );
}
