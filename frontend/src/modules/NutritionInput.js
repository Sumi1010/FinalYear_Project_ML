import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./module.css";

export default function NutritionInput({ user }) {
  const navigate = useNavigate();

  // Form State
  const [mealType, setMealType] = useState("Breakfast");
  const [waterIntake, setWaterIntake] = useState("");
  const [fruitVeg, setFruitVeg] = useState("");
  const [junkFood, setJunkFood] = useState("No");
  const [energyLevel, setEnergyLevel] = useState("Medium");

  // Game State
  const [showGame, setShowGame] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const foods = [
    { name: "Apple", healthy: true, emoji: "🍎" },
    { name: "Carrot", healthy: true, emoji: "🥕" },
    { name: "Burger", healthy: false, emoji: "🍔" },
    { name: "Soda", healthy: false, emoji: "🥤" },
    { name: "Banana", healthy: true, emoji: "🍌" },
    { name: "Pizza", healthy: false, emoji: "🍕" }
  ];

  const submit = async () => {
    // Validation
    const water = parseInt(waterIntake);
    const fruit = parseInt(fruitVeg);

    if (waterIntake === "" || fruitVeg === "" || isNaN(water) || isNaN(fruit) || water < 0 || fruit < 0) {
      alert("Please provide valid non-negative numbers for water and fruit/veg intake.");
      return;
    }

    try {
      await API.post("/nutrition", {
        username: user || "guest",
        meal_type: mealType,
        water_intake: water,
        fruit_veg_servings: fruit,
        junk_food: junkFood,
        energy_level: energyLevel
      });
      setShowGame(true);
    } catch (err) {
      console.error("Error submitting nutrition check-in:", err);
      alert("Failed to save check-in. Note the backend must be running!");
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

  if (gameCompleted) {
    return (
      <div className="nutrition-page">
        <div className="nutrition-card" style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px" }}>Great Job! You completed today's Nutritional Wellness Activity.</h3>
          <button className="nutrition-btn" onClick={() => navigate('/dashboard')}>
            Finish Activity
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
            {foods.map((food, idx) => (
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
        <h3>🥗 Nutrition Daily Check-In</h3>

        <label className="nutrition-label">Meal Type</label>
        <select className="nutrition-select" value={mealType} onChange={e => setMealType(e.target.value)}>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snack">Snack</option>
        </select>

        <label className="nutrition-label">Water Intake (glasses)</label>
        <input
          className="nutrition-input"
          type="number"
          min="0"
          value={waterIntake}
          onChange={e => setWaterIntake(e.target.value)}
          placeholder="e.g. 2"
        />

        <label className="nutrition-label">Fruit & Vegetable Servings (number)</label>
        <input
          className="nutrition-input"
          type="number"
          min="0"
          value={fruitVeg}
          onChange={e => setFruitVeg(e.target.value)}
          placeholder="e.g. 1"
        />

        <label className="nutrition-label">Junk Food Intake</label>
        <select className="nutrition-select" value={junkFood} onChange={e => setJunkFood(e.target.value)}>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        <label className="nutrition-label">Energy Level after Meal</label>
        <select className="nutrition-select" value={energyLevel} onChange={e => setEnergyLevel(e.target.value)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button className="nutrition-btn" onClick={submit}>Submit</button>
      </div>
    </div>
  );
}