import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./module.css";

export default function PersonalTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
      bmi = 0,
      bmiStatus = "N/A",
      dailyCalories = 0,
      targetCalories = 0,
      totalCalories = 0,
      status = "N/A",
      waterIntake = "1 glass",
      selectedFoods = []
  } = location.state || {};

  let healthyCount = 0;
  let moderateCount = 0;
  let junkCount = 0;

  selectedFoods.forEach(food => {
    if (food.type === "Healthy Foods") healthyCount += food.quantity;
    else if (food.type === "Moderate Foods") moderateCount += food.quantity;
    else if (food.type === "Junk Foods") junkCount += food.quantity;
  });

  const data = [
    { name: "Healthy Foods", value: healthyCount, color: "#4facfe" },
    { name: "Moderate Foods", value: moderateCount, color: "#fbd071" },
    { name: "Junk Foods", value: junkCount, color: "#fc6076" }
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    data.push({ name: "No Data", value: 1, color: "#e0e0e0" }); // Gray for no data
  }

  const getSuggestions = () => {
    const list = [];
    if (bmiStatus === "Underweight") list.push("Consider increasing your caloric intake with nutrient-dense foods like nuts, avocados, and whole grains.");
    else if (bmiStatus === "Overweight") list.push("Focus on a balanced diet with a slight caloric deficit and incorporate regular physical activity.");
    
    if (status === "Excess") list.push("You exceeded your calorie target today. Try to reduce portion sizes or swap high-calorie snacks for fruits.");
    else if (status === "Low") list.push("Your caloric intake is low. Make sure you are eating enough to sustain your energy levels.");
    else if (status === "Balanced") list.push("Great job staying within your calorie target! Consistency is key.");

    if (junkCount > 0) list.push(`You consumed ${junkCount} junk food items. Try limiting fast food and sweets to improve overall health.`);
    if (healthyCount < 2) list.push("Increase your servings of fruits and vegetables for better nutrition.");

    if (waterIntake === "1 glass" || waterIntake === "2-4 glasses") {
        list.push(`You only had ${waterIntake} of water. Aim for at least 8 glasses daily to stay properly hydrated.`);
    } else {
        list.push(`Great hydration! Drinking ${waterIntake} is excellent for your health.`);
    }

    return list;
  };

  const getStatusColor = (s) => {
      if (s === "Balanced") return "#2e7d32";
      if (s === "Low") return "#f57c00";
      if (s === "Excess") return "#c62828";
      return "#333";
  };

  return (
    <div className="nutrition-page" style={{minHeight: '100vh', padding: "20px"}}>
      <div className="nutrition-card" style={{maxWidth: '800px', margin: "0 auto"}}>
        <h2 style={{ textAlign: "center", color: "#00796b", marginBottom: "30px" }}>📊 Smart Nutrition Report</h2>
        
        {/* Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "30px" }}>
            <div style={{ background: "#e0f7fa", padding: "15px", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "#006064" }}>BMI</h4>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#00838f" }}>{bmi}</div>
                <div style={{ fontSize: "0.9rem", color: "#00acc1", fontWeight: "bold" }}>{bmiStatus}</div>
            </div>
            
            <div style={{ background: "#f1f8e9", padding: "15px", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "#33691e" }}>Daily Need</h4>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#558b2f" }}>{dailyCalories}</div>
                <div style={{ fontSize: "0.9rem", color: "#7cb342" }}>kcal/day</div>
            </div>

            <div style={{ background: "#e8eaf6", padding: "15px", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "#1a237e" }}>Target</h4>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#283593" }}>{targetCalories}</div>
                <div style={{ fontSize: "0.9rem", color: "#3f51b5" }}>kcal/day</div>
            </div>

            <div style={{ background: "#fff3e0", padding: "15px", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "#e65100" }}>Consumed</h4>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: getStatusColor(status) }}>{totalCalories}</div>
                <div style={{ fontSize: "0.9rem", color: getStatusColor(status), fontWeight: "bold" }}>{status}</div>
            </div>
        </div>

        {/* Pie Chart */}
        <div style={{ background: "#fafafa", borderRadius: "15px", padding: "20px", marginBottom: "30px", border: "1px solid #eee", width: "100%", boxSizing: "border-box" }}>
            <h4 style={{ textAlign: "center", color: "#424242", marginBottom: "10px" }}>Food Distribution</h4>
            <div style={{ height: "300px", width: "100%", minWidth: 0 }}>
              <ResponsiveContainer width="99%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius="50%"
                    outerRadius="80%"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} items`, name]} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* Suggestions */}
        <div style={{ background: '#f9fbfd', padding: '20px', borderRadius: '15px', borderLeft: "5px solid #4facfe" }}>
          <h4 style={{ marginBottom: '15px', color: '#1565c0', display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.5rem" }}>💡</span> Personalized Suggestions
          </h4>
          <ul style={{ textAlign: 'left', color: '#424242', lineHeight: '1.8', margin: 0, paddingLeft: "20px" }}>
            {getSuggestions().map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        <div style={{ textAlign: "center", marginTop: '30px' }}>
            <button className="nutrition-btn" style={{ background: "#00796b", color: "#fff", padding: "12px 30px", fontSize: "1.1rem" }} onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
        </div>
      </div>
    </div>
  );
}
