import { useState } from "react";
import API from "../api";
import "./module.css";

export default function NutritionInput({ user }) {
  const [mealQuality, setMealQuality] = useState(3);
  const [junk, setJunk] = useState(0);
  const [fruits, setFruits] = useState(0);

  const submit = async () => {
    await API.post("/nutrition-checkin", {
      username: user,
      meal_quality: mealQuality,
      junk_food: junk,
      fruit_intake: fruits
    });

    alert("Nutrition check-in saved 🥗");
  };

  return (
    <div className="module-card">
      <h3>🥗 Nutrition Daily Check-In</h3>

      <label>Meal Quality (1-5)</label>
      <input type="range" min="1" max="5"
        value={mealQuality}
        onChange={e => setMealQuality(e.target.value)}
      />

      <label>Junk Food Count</label>
      <input type="number"
        onChange={e => setJunk(e.target.value)}
      />

      <label>Fruit Intake (servings)</label>
      <input type="number"
        onChange={e => setFruits(e.target.value)}
      />

      <button onClick={submit}>Submit</button>
    </div>
  );
}