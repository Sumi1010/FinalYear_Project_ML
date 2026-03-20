import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./module.css";

const FOOD_DATABASE = {
  Breakfast: [
    { name: "Idli", calories: 50, type: "Moderate Foods" },
    { name: "Dosa", calories: 120, type: "Moderate Foods" },
    { name: "Pongal", calories: 200, type: "Moderate Foods" },
    { name: "Upma", calories: 150, type: "Moderate Foods" },
    { name: "Poha", calories: 150, type: "Moderate Foods" },
    { name: "Chapati", calories: 100, type: "Moderate Foods" }
  ],
  "Lunch/Dinner": [
    { name: "Rice", calories: 130, type: "Moderate Foods" },
    { name: "Sambar", calories: 150, type: "Healthy Foods" },
    { name: "Rasam", calories: 90, type: "Healthy Foods" },
    { name: "Dal", calories: 150, type: "Healthy Foods" },
    { name: "Vegetable Curry", calories: 150, type: "Healthy Foods" },
    { name: "Chicken Curry", calories: 250, type: "Moderate Foods" },
    { name: "Curd", calories: 100, type: "Healthy Foods" }
  ],
  Snacks: [
    { name: "Samosa", calories: 250, type: "Junk Foods" },
    { name: "Vada", calories: 150, type: "Junk Foods" },
    { name: "Chips", calories: 150, type: "Junk Foods" },
    { name: "Biscuits", calories: 100, type: "Junk Foods" },
    { name: "Tea", calories: 50, type: "Moderate Foods" },
    { name: "Coffee", calories: 60, type: "Moderate Foods" }
  ],
  Healthy: [
    { name: "Fruits", calories: 60, type: "Healthy Foods" },
    { name: "Nuts", calories: 150, type: "Healthy Foods" },
    { name: "Milk", calories: 120, type: "Healthy Foods" }
  ]
};

export default function NutritionInput({ user }) {
  const navigate = useNavigate();

  const [stage, setStage] = useState("body");
  
  // Step 1: Body Details
  const [bodyDetails, setBodyDetails] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "Female"
  });

  // Step 2: Goal Selection
  const [goal, setGoal] = useState("Maintain Weight");
  const [calcData, setCalcData] = useState({
    bmi: 0,
    bmiStatus: "",
    dailyCalories: 0,
    targetCalories: 0
  });

  // Step 3: Food Input
  const [mealType, setMealType] = useState("Breakfast");
  const [waterIntake, setWaterIntake] = useState("1 glass");
  const [selectedFoods, setSelectedFoods] = useState([]); // [{ name, calories, quantity, type }]

  const handleBodyDetailsChange = (e) => {
    setBodyDetails({ ...bodyDetails, [e.target.name]: e.target.value });
  };

  const calculateStage2 = () => {
    const { height, weight, age, gender } = bodyDetails;
    if (!height || !weight || !age) {
        alert("Please fill in all body details to proceed.");
        return;
    }
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age);

    // Calculate BMI
    const bmiVal = w / Math.pow((h / 100), 2);
    let bmiStat = "Normal";
    if (bmiVal < 18.5) bmiStat = "Underweight";
    else if (bmiVal >= 25) bmiStat = "Overweight";

    // Calculate Daily Calories
    let bmr = 0;
    if (gender === "Female") {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    }

    setCalcData({
      bmi: parseFloat(bmiVal.toFixed(1)),
      bmiStatus: bmiStat,
      dailyCalories: Math.round(bmr),
      targetCalories: Math.round(bmr) // default
    });

    setStage("goal");
  };

  const updateGoal = (selectedGoal) => {
    setGoal(selectedGoal);
    let target = calcData.dailyCalories;
    if (selectedGoal === "Lose Weight") target -= 300;
    if (selectedGoal === "Gain Weight") target += 300;
    setCalcData({ ...calcData, targetCalories: target });
  };

  const proceedToFood = () => {
    setStage("food");
  };

  const handleFoodToggle = (foodItem) => {
    const existing = selectedFoods.find(f => f.name === foodItem.name);
    if (existing) {
      setSelectedFoods(selectedFoods.filter(f => f.name !== foodItem.name));
    } else {
      setSelectedFoods([...selectedFoods, { ...foodItem, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (foodName, delta) => {
    setSelectedFoods(selectedFoods.map(f => {
      if (f.name === foodName) {
        const newQ = Math.max(1, f.quantity + delta);
        return { ...f, quantity: newQ };
      }
      return f;
    }));
  };

  const totalCaloriesVal = selectedFoods.reduce((sum, f) => sum + (f.calories * f.quantity), 0);
  
  const getStatusAndRec = () => {
    const { targetCalories } = calcData;
    // Defining "near target" as within 15% kcals
    const margin = targetCalories * 0.15;
    if (totalCaloriesVal < targetCalories - margin) return { status: "Low", rec: "You are eating less than required. Add balanced meals like rice, dal, and protein." };
    if (totalCaloriesVal > targetCalories + margin) return { status: "Excess", rec: "You exceeded your calorie target. Reduce fried foods and increase activity." };
    return { status: "Balanced", rec: "Great job! Your calorie intake matches your goal." };
  };

  const submit = async () => {
    if (selectedFoods.length === 0) {
      alert("Please select at least one food item.");
      return;
    }
    const { status } = getStatusAndRec();
    const foodString = selectedFoods.map(f => f.name).join(", ");
    const quantityString = selectedFoods.map(f => f.quantity).join(", ");

    try {
      await API.post("/nutrition-calorie", {
        username: user || "guest",
        height: parseFloat(bodyDetails.height),
        weight: parseFloat(bodyDetails.weight),
        age: parseInt(bodyDetails.age),
        gender: bodyDetails.gender,
        bmi: calcData.bmi,
        daily_calories: calcData.dailyCalories,
        target_calories: calcData.targetCalories,
        meal_type: mealType,
        foods: foodString,
        quantity: quantityString,
        total_calories: totalCaloriesVal,
        status: status
      });
      // Redirect to report
      navigate("/personal-tracker", { 
        state: { 
            bmi: calcData.bmi,
            bmiStatus: calcData.bmiStatus,
            dailyCalories: calcData.dailyCalories,
            targetCalories: calcData.targetCalories,
            totalCalories: totalCaloriesVal,
            status: status,
            waterIntake: waterIntake,
            selectedFoods: selectedFoods
        } 
      });
    } catch (err) {
      console.error("Error submitting nutrition check-in:", err);
      alert("Failed to save check-in.");
    }
  };

  return (
    <div className="nutrition-page" style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="nutrition-card" style={{ maxWidth: "600px", margin: "0 auto", background: "linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)", borderRadius: "15px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
        
        {stage === "body" && (
          <div className="body-details-section">
            <h3 className="nutrition-title" style={{ color: "#00796b" }}>Step 1: Your Body Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
              <div>
                <label className="nutrition-label">Height (cm)</label>
                <input type="number" name="height" value={bodyDetails.height} onChange={handleBodyDetailsChange} className="nutrition-select" placeholder="e.g. 165" />
              </div>
              <div>
                <label className="nutrition-label">Weight (kg)</label>
                <input type="number" name="weight" value={bodyDetails.weight} onChange={handleBodyDetailsChange} className="nutrition-select" placeholder="e.g. 60" />
              </div>
              <div>
                <label className="nutrition-label">Age</label>
                <input type="number" name="age" value={bodyDetails.age} onChange={handleBodyDetailsChange} className="nutrition-select" placeholder="e.g. 25" />
              </div>
              <div>
                <label className="nutrition-label">Gender</label>
                <select name="gender" value={bodyDetails.gender} onChange={handleBodyDetailsChange} className="nutrition-select">
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <button className="nutrition-btn" onClick={calculateStage2} style={{ background: "#00796b", color: "#fff", marginTop: "10px" }}>
                Next: Goal Selection
              </button>
            </div>
            <button className="nutrition-btn" style={{ background: 'transparent', border: '1px solid #ccc', color: '#333', marginTop: '10px' }} onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        )}

        {stage === "goal" && (
          <div className="goal-selection-section">
            <h3 className="nutrition-title" style={{ color: "#00796b" }}>Step 2: Review & Set Goal</h3>
            <div style={{ background: "#e0f2f1", padding: "15px", borderRadius: "10px", margin: "15px 0" }}>
                <p><strong>Your BMI:</strong> {calcData.bmi} ({calcData.bmiStatus})</p>
                <p><strong>Daily Calorie Need:</strong> {calcData.dailyCalories} kcal</p>
            </div>
            
            <label className="nutrition-label">Select Your Goal:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', marginBottom: "20px" }}>
              {["Lose Weight", "Maintain Weight", "Gain Weight"].map((g) => (
                <button 
                  key={g} 
                  className="nutrition-btn" 
                  onClick={() => updateGoal(g)}
                  style={{ background: goal === g ? "#00796b" : "#b2dfdb", color: goal === g ? "#fff" : "#004d40" }}
                >
                  {g}
                </button>
              ))}
            </div>

            {goal && (
                <div style={{ background: "#e8f5e9", padding: "15px", borderRadius: "10px", marginBottom: "20px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "1.1rem", color: "#2e7d32", fontWeight: "bold" }}>Your Target Calories: {calcData.targetCalories} kcal</p>
                </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
                <button className="nutrition-btn" onClick={() => setStage("body")} style={{ flex: 1, background: "#ccc", color: "#333" }}>Back</button>
                <button className="nutrition-btn" onClick={proceedToFood} style={{ flex: 2, background: "#00796b" }}>Next: Food Input</button>
            </div>
          </div>
        )}

        {stage === "food" && (
          <div>
            <h3 className="nutrition-title" style={{ color: "#00796b" }}>Step 3: Food Input</h3>
            
             <label className="nutrition-label">Water Intake</label>
            <select className="nutrition-select" value={waterIntake} onChange={e => setWaterIntake(e.target.value)}>
              <option value="1 glass">1 glass</option>
              <option value="2-4 glasses">2-4 glasses</option>
              <option value="5-7 glasses">5-7 glasses</option>
              <option value="8+ glasses">8+ glasses</option>
            </select>
            
            <label className="nutrition-label" style={{ marginTop: "15px" }}>Meal Type</label>
            <select className="nutrition-select" value={mealType} onChange={e => setMealType(e.target.value)}>
              {Object.keys(FOOD_DATABASE).map(mt => (
                  <option key={mt} value={mt}>{mt}</option>
              ))}
            </select>

            <label className="nutrition-label" style={{ marginTop: "15px" }}>Select Food Items</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {FOOD_DATABASE[mealType].map(food => {
                  const isSelected = selectedFoods.find(f => f.name === food.name);
                  return (
                    <div 
                      key={food.name} 
                      onClick={() => handleFoodToggle(food)}
                      style={{
                        padding: '8px 15px', 
                        borderRadius: '20px', 
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                        background: isSelected ? '#00796b' : '#fff',
                        color: isSelected ? '#fff' : '#333',
                        fontWeight: isSelected ? '600' : '400',
                        transition: 'all 0.2s',
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      {food.name} <small style={{ opacity: 0.8 }}>({food.calories} kcal)</small>
                    </div>
                  );
              })}
            </div>

            {selectedFoods.length > 0 && (
                <div style={{ background: "#f1f8e9", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#33691e" }}>Selected Quantities:</h4>
                    {selectedFoods.map(f => (
                        <div key={f.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span>{f.name} ({f.calories * f.quantity} kcal)</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <button onClick={() => handleQuantityChange(f.name, -1)} style={{ width: "25px", height: "25px", borderRadius: "50%", border: "none", background: "#c5e1a5", cursor: "pointer", fontWeight: "bold" }}>-</button>
                                <span>{f.quantity}</span>
                                <button onClick={() => handleQuantityChange(f.name, 1)} style={{ width: "25px", height: "25px", borderRadius: "50%", border: "none", background: "#c5e1a5", cursor: "pointer", fontWeight: "bold" }}>+</button>
                            </div>
                        </div>
                    ))}
                    <div style={{ borderTop: "1px solid #c5e1a5", marginTop: "10px", paddingTop: "10px", fontWeight: "bold", textAlign: "right", color: "#2e7d32" }}>
                        Total Consumed: {totalCaloriesVal} / {calcData.targetCalories} kcal
                    </div>
                </div>
            )}
            
            {selectedFoods.length > 0 && (
                <div style={{ background: getStatusAndRec().status === "Balanced" ? "#e8f5e9" : getStatusAndRec().status === "Low" ? "#fff3e0" : "#ffebee", padding: "15px", borderRadius: "10px", marginBottom: "20px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem", color: getStatusAndRec().status === "Balanced" ? "#2e7d32" : getStatusAndRec().status === "Low" ? "#f57c00" : "#c62828" }}>
                        Status: {getStatusAndRec().status}
                    </p>
                    <p style={{ margin: "5px 0 0 0", fontSize: "0.95rem", color: "#555" }}>
                        {getStatusAndRec().rec}
                    </p>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="nutrition-btn" onClick={() => setStage("goal")} style={{ flex: 1, background: "#ccc", color: "#333" }}>Back</button>
              <button className="nutrition-btn" onClick={submit} style={{ flex: 2, background: '#4facfe' }}>Submit & View Report</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}