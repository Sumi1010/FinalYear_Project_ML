import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./module.css";

const HEALTHY_FOODS = ["Fruits", "Vegetables", "Nuts"];
const MODERATE_FOODS = ["Rice", "Bread", "Milk", "Egg"];
const JUNK_FOODS = ["Fast Food", "Soft Drinks", "Sweets"];

export default function PersonalTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedFoods = location.state?.selectedFoods || [];

  let healthyCount = 0;
  let moderateCount = 0;
  let junkCount = 0;

  selectedFoods.forEach(food => {
    if (HEALTHY_FOODS.includes(food)) healthyCount++;
    else if (MODERATE_FOODS.includes(food)) moderateCount++;
    else if (JUNK_FOODS.includes(food)) junkCount++;
  });

  const data = [
    { name: "Healthy Foods", value: healthyCount, color: "#4facfe" },
    { name: "Moderate Foods", value: moderateCount, color: "#fbd071" },
    { name: "Junk Foods", value: junkCount, color: "#fc6076" }
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    data.push({ name: "No Data", value: 1, color: "#ccc" });
  }

  const total = healthyCount + moderateCount + junkCount;
  const score = total > 0 ? Math.round(((healthyCount * 2 + moderateCount) / (total * 2)) * 100) : 0;

  const getSuggestions = () => {
    const list = [];
    if (healthyCount < 2) list.push("Increase fruits and vegetables intake.");
    if (junkCount > 0) list.push("Reduce junk food consumption.");
    list.push("Drink more water daily for better hydration.");
    return list;
  };

  return (
    <div className="nutrition-page" style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div className="nutrition-card" style={{width: '90%', maxWidth: '600px', textAlign: 'center'}}>
        <h2>📊 Nutrition Analysis</h2>
        
        <div style={{ height: "300px", marginTop: "20px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>Nutrition Score: <span style={{color: score > 70 ? '#43e97b' : score > 40 ? '#fbd071' : '#fc6076'}}>{score}/100</span></h3>
        </div>

        <div style={{ marginTop: '20px', background: '#f9fbfd', padding: '15px', borderRadius: '15px' }}>
          <h4 style={{ marginBottom: '10px', color: '#333' }}>💡 Suggestions:</h4>
          <ul style={{ textAlign: 'left', color: '#555', lineHeight: '1.6' }}>
            {getSuggestions().map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        <button className="nutrition-btn" style={{marginTop: '30px'}} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
