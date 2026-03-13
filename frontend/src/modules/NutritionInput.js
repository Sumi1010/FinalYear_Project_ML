import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./module.css";

const FOOD_CATEGORIES = [
  "Fruits", "Vegetables", "Rice", "Bread", "Milk", 
  "Egg", "Nuts", "Fast Food", "Soft Drinks", "Sweets"
];

export default function NutritionInput({ user }) {
  const navigate = useNavigate();

  const [stage, setStage] = useState("goal");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState(null);

  // Form State
  const [mealType, setMealType] = useState("Breakfast");
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [waterIntake, setWaterIntake] = useState("1 glass");

  const [showGame, setShowGame] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    if (goal === "Eat Healthier") {
      setGeneratedPlan(["Add 1 extra fruit portion", "Replace sugary snacks with nuts", "Have a side salad with lunch"]);
    } else if (goal === "Improve Hydration") {
      setGeneratedPlan(["Drink a glass of water upon waking", "Carry a water bottle all day", "Drink water before meals"]);
    } else if (goal === "Balanced Diet") {
      setGeneratedPlan(["Include protein in every meal", "Balance carbs with fiber-rich veggies"]);
    } else if (goal === "Reduce Junk Food") {
      setGeneratedPlan(["Limit fast food to once a week", "Swap soft drinks for sparkling water"]);
    }
  };

  const handleFoodToggle = (food) => {
    if (selectedFoods.includes(food)) {
      setSelectedFoods(selectedFoods.filter(f => f !== food));
    } else {
      setSelectedFoods([...selectedFoods, food]);
    }
  };

  const gotoTracker = () => {
    navigate("/personal-tracker", { state: { selectedFoods } });
  };

  const submit = async () => {
    // Determine backend mapped values
    const healthyFoods = ["Fruits", "Vegetables", "Nuts"];
    const junkFoods = ["Fast Food", "Soft Drinks", "Sweets"];
    
    let fruitVegCount = 0;
    let isJunk = "No";
    let waterNum = 1;

    selectedFoods.forEach(f => {
      if (healthyFoods.includes(f)) fruitVegCount++;
      if (junkFoods.includes(f)) isJunk = "Yes";
    });

    if (waterIntake === "2-4 glasses") waterNum = 3;
    if (waterIntake === "5-7 glasses") waterNum = 6;
    if (waterIntake === "8+ glasses") waterNum = 8;

    try {
      await API.post("/nutrition", {
        username: user || "guest",
        meal_type: mealType,
        water_intake: waterNum,
        fruit_veg_servings: fruitVegCount,
        junk_food: isJunk,
        energy_level: "Medium" // Mocked to conform to existing backend
      });
      setShowGame(true);
    } catch (err) {
      console.error("Error submitting nutrition check-in:", err);
      alert("Failed to save check-in.");
    }
  };

  const handleFoodClick = (isHealthy) => {
    if (isHealthy) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= 3) {
        setGameCompleted(true);
      }
    } else {
      alert("Oops! That's not a healthy choice. Try again!");
    }
  };

  const gameFoods = [
    { name: "Apple", healthy: true, emoji: "🍎" },
    { name: "Carrot", healthy: true, emoji: "🥕" },
    { name: "Burger", healthy: false, emoji: "🍔" },
    { name: "Soda", healthy: false, emoji: "🥤" },
    { name: "Banana", healthy: true, emoji: "🍌" },
    { name: "Pizza", healthy: false, emoji: "🍕" }
  ];

  if (gameCompleted) {
    return (
      <div className="nutrition-page">
        <div className="nutrition-card" style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px" }}>Great Job! You completed today's Activity.</h3>
          <button className="nutrition-btn" onClick={() => navigate('/dashboard')} style={{ marginBottom: '10px' }}>
            Return to Dashboard
          </button>
          <button className="nutrition-btn" onClick={gotoTracker} style={{ background: '#4facfe' }}>
            View Personal Tracker
          </button>
        </div>
      </div>
    );
  }

  if (showGame) {
    return (
      <div className="nutrition-page">
        <div className="nutrition-card">
          <h3>🥗 Nutrition Activity</h3>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
            Select the healthy foods! Score: {score}/3
          </p>
          <div className="food-grid">
            {gameFoods.map((food, idx) => (
              <div
                key={idx}
                className="food-item"
                onClick={() => handleFoodClick(food.healthy)}
              >
                <span className="food-emoji">{food.emoji}</span>
                <p style={{ margin: 0, color: '#333', fontWeight: 500 }}>{food.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nutrition-page">
      <div className="nutrition-card">
        {stage === "goal" && (
          <div className="goal-selection-section">
            <h3 className="nutrition-title">🥗 Set Your Nutrition Goal</h3>
            {!generatedPlan ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                {["Eat Healthier", "Improve Hydration", "Balanced Diet", "Reduce Junk Food"].map((g) => (
                  <button key={g} className="nutrition-btn" onClick={() => handleGoalSelect(g)}>
                    {g}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: '20px', background: '#ecfdf5', padding: '20px', borderRadius: '15px' }}>
                <h4 style={{ color: '#065f46', marginBottom: '15px' }}>Your '{selectedGoal}' Plan:</h4>
                <ul style={{ textAlign: "left", marginBottom: "20px", color: '#047857', lineHeight: '1.6' }}>
                  {generatedPlan.map((step, i) => <li key={i}>{step}</li>)}
                </ul>
                <button className="nutrition-btn" onClick={() => setStage("form")}>
                  Proceed to Daily Check-in
                </button>
              </div>
            )}
            <br />
            <button className="nutrition-btn" style={{ background: '#ccc', color: '#333' }} onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        )}

        {stage === "form" && (
          <>
            <h3 style={{color: '#2c3e50'}}>🥗 Smart Nutrition Tracker</h3>

            <label className="nutrition-label">Meal Type</label>
            <select className="nutrition-select" value={mealType} onChange={e => setMealType(e.target.value)}>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>

            <label className="nutrition-label">Select Food Items</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {FOOD_CATEGORIES.map(food => (
                <div 
                  key={food} 
                  onClick={() => handleFoodToggle(food)}
                  style={{
                    padding: '8px 15px', 
                    borderRadius: '20px', 
                    border: '1px solid #ccc',
                    cursor: 'pointer',
                    background: selectedFoods.includes(food) ? '#43e97b' : '#fff',
                    color: selectedFoods.includes(food) ? '#fff' : '#333',
                    fontWeight: selectedFoods.includes(food) ? '600' : '400',
                    transition: 'all 0.2s'
                  }}
                >
                  {food}
                </div>
              ))}
            </div>

            <label className="nutrition-label">Water Intake</label>
            <select className="nutrition-select" value={waterIntake} onChange={e => setWaterIntake(e.target.value)}>
              <option value="1 glass">1 glass</option>
              <option value="2-4 glasses">2-4 glasses</option>
              <option value="5-7 glasses">5-7 glasses</option>
              <option value="8+ glasses">8+ glasses</option>
            </select>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="nutrition-btn" onClick={submit} style={{ flex: 1 }}>Submit</button>
              <button className="nutrition-btn" onClick={gotoTracker} style={{ flex: 1, background: '#a18cd1' }}>Personal Tracker</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}