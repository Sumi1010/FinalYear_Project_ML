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
    { name: "Chapati", calories: 100, type: "Moderate Foods" },
    { name: "Bread", calories: 80, type: "Moderate Foods" },
    { name: "Milk", calories: 120, type: "Healthy Foods" },
    { name: "Eggs", calories: 70, type: "Healthy Foods" },
    { name: "None", calories: 0, type: "None" }
  ],
  Lunch: [
    { name: "Rice", calories: 130, type: "Moderate Foods" },
    { name: "Sambar", calories: 150, type: "Healthy Foods" },
    { name: "Rasam", calories: 90, type: "Healthy Foods" },
    { name: "Dal", calories: 150, type: "Healthy Foods" },
    { name: "Vegetable Curry", calories: 150, type: "Healthy Foods" },
    { name: "Chicken Curry", calories: 250, type: "Moderate Foods" },
    { name: "Curd", calories: 100, type: "Healthy Foods" },
    { name: "Roti", calories: 100, type: "Moderate Foods" },
    { name: "None", calories: 0, type: "None" }
  ],
  Dinner: [
    { name: "Chapati", calories: 100, type: "Moderate Foods" },
    { name: "Rice", calories: 130, type: "Moderate Foods" },
    { name: "Dal", calories: 150, type: "Healthy Foods" },
    { name: "Vegetable Curry", calories: 150, type: "Healthy Foods" },
    { name: "Egg", calories: 70, type: "Healthy Foods" },
    { name: "Milk", calories: 120, type: "Healthy Foods" },
    { name: "None", calories: 0, type: "None" }
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

  // Goal & Calc Data
  const [goal, setGoal] = useState("Maintain Weight");
  const [calcData, setCalcData] = useState({
    bmi: 0,
    bmiStatus: "",
    dailyCalories: 0,
    targetCalories: 0
  });

  // Food Selection
  const [selectedFoods, setSelectedFoods] = useState([]); // [{ name, calories, mealType, quantity }]

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

    const bmiVal = w / Math.pow((h / 100), 2);
    let bmiStat = "Normal";
    if (bmiVal < 18.5) bmiStat = "Underweight";
    else if (bmiVal >= 25) bmiStat = "Overweight";

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
      targetCalories: Math.round(bmr)
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

  const handleFoodToggle = (foodItem, mealType) => {
    const existingIndex = selectedFoods.findIndex(f => f.name === foodItem.name && f.mealType === mealType);
    if (existingIndex >= 0) {
      const newFoods = [...selectedFoods];
      newFoods.splice(existingIndex, 1);
      setSelectedFoods(newFoods);
    } else {
      setSelectedFoods([...selectedFoods, { ...foodItem, mealType, quantity: 1 }]);
    }
  };

  const totalCaloriesVal = selectedFoods.reduce((sum, f) => sum + (f.calories * f.quantity), 0);
  
  const getStatusAndRec = () => {
    const { targetCalories } = calcData;
    const margin = targetCalories * 0.15;
    if (totalCaloriesVal < targetCalories - margin) return { status: "Low", rec: "You are eating less than required. Add balanced meals like rice, dal, and protein." };
    if (totalCaloriesVal > targetCalories + margin) return { status: "Excess", rec: "You exceeded your calorie target. Reduce fried foods and increase activity." };
    return { status: "Balanced", rec: "Great job! Your calorie intake matches your goal." };
  };

  const submit = async () => {
    if (selectedFoods.length === 0) {
      alert("Please select at least one food item across all meals.");
      return;
    }
    const { status } = getStatusAndRec();
    const foodString = selectedFoods.map(f => `${f.name} (${f.mealType})`).join(", ");
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
        meal_type: "All Meals",
        foods: foodString,
        quantity: quantityString,
        total_calories: totalCaloriesVal,
        status: status
      });
      navigate("/personal-tracker", { 
        state: { 
            bmi: calcData.bmi,
            bmiStatus: calcData.bmiStatus,
            dailyCalories: calcData.dailyCalories,
            targetCalories: calcData.targetCalories,
            totalCalories: totalCaloriesVal,
            status: status,
            waterIntake: "1 glass", 
            selectedFoods: selectedFoods
        } 
      });
    } catch (err) {
      console.error("Error submitting nutrition check-in:", err);
      alert("Failed to save check-in.");
    }
  };

  const renderFoodStage = (mealType, stepText, nextStage, nextBtnText) => {
    const foods = FOOD_DATABASE[mealType];
    const handleNext = () => setStage(nextStage);
    const handleBack = () => {
       if (mealType === "Breakfast") setStage("goal");
       else if (mealType === "Lunch") setStage("breakfast");
       else setStage("lunch");
    };

    return (
      <div className="food-selection-section fade-in">
        <h3 className="nutrition-title" style={{ color: "#00796b", textAlign: "center", marginBottom: "5px" }}>Select Your {mealType}</h3>
        <p style={{ textAlign: "center", color: "#666", fontWeight: "bold", marginBottom: "20px" }}>{stepText}</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '30px' }}>
          {foods.map(food => {
              const isSelected = selectedFoods.find(f => f.name === food.name && f.mealType === mealType);
              return (
                <div 
                  key={food.name} 
                  onClick={() => handleFoodToggle(food, mealType)}
                  style={{
                    padding: '10px 18px', 
                    borderRadius: '25px', 
                    border: isSelected ? '2px solid #004d40' : '1px solid #ccc',
                    cursor: 'pointer',
                    background: isSelected ? '#00796b' : '#fff',
                    color: isSelected ? '#fff' : '#333',
                    fontWeight: isSelected ? '600' : '400',
                    transition: 'all 0.2s',
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: isSelected ? "0 4px 12px rgba(0, 121, 107, 0.3)" : "0 2px 5px rgba(0,0,0,0.05)"
                  }}
                >
                  {food.name} <span style={{ fontSize: '0.85em', opacity: 0.85 }}>({food.calories} kcal)</span>
                </div>
              );
          })}
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button className="nutrition-btn" onClick={handleBack} style={{ flex: 1, background: "#e0e0e0", color: "#333", border: "1px solid #ccc" }}>
             Back
          </button>
          <button className="nutrition-btn" onClick={nextStage === "submit" ? submit : handleNext} style={{ flex: 2, background: nextStage === "submit" ? "#4facfe" : "#00796b", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
             {nextBtnText}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="nutrition-page" style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="nutrition-card" style={{ maxWidth: "600px", margin: "0 auto", background: "linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)", borderRadius: "15px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        
        {stage === "body" && (
          <div className="body-details-section" style={{ padding: "20px" }}>
            <h3 className="nutrition-title" style={{ color: "#00796b", textAlign: "center" }}>Step 1: Your Body Details</h3>
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
              <button className="nutrition-btn" onClick={calculateStage2} style={{ background: "#00796b", color: "#fff", marginTop: "15px" }}>
                Next
              </button>
            </div>
            <button className="nutrition-btn" style={{ background: 'transparent', border: '1px solid #ccc', color: '#555', marginTop: '10px' }} onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        )}

        {stage === "goal" && (
          <div className="goal-selection-section" style={{ padding: "20px" }}>
            <h3 className="nutrition-title" style={{ color: "#00796b", textAlign: "center" }}>Step 2: Review & Set Goal</h3>
            <div style={{ background: "#e0f2f1", padding: "20px", borderRadius: "12px", margin: "20px 0", textAlign: "center" }}>
                <p style={{ margin: "0 0 10px 0", fontSize: "1.1rem", color: "#004d40" }}><strong>Body Mass Index (BMI):</strong> {calcData.bmi} <span style={{ opacity: 0.8 }}>({calcData.bmiStatus})</span></p>
                <p style={{ margin: 0, fontSize: "1.1rem", color: "#004d40" }}><strong>Daily Calorie Need:</strong> {calcData.dailyCalories} kcal</p>
            </div>
            
            <label className="nutrition-label" style={{ textAlign: "center", display: "block" }}>Select Your Goal:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px', marginBottom: "25px" }}>
              {["Lose Weight", "Maintain Weight", "Gain Weight"].map((g) => (
                <button 
                  key={g} 
                  className="nutrition-btn" 
                  onClick={() => updateGoal(g)}
                  style={{ 
                     background: goal === g ? "#00796b" : "#fff", 
                     color: goal === g ? "#fff" : "#00695c",
                     border: "1px solid #00796b",
                     transition: "all 0.3s",
                     transform: goal === g ? "scale(1.02)" : "scale(1)"
                  }}
                >
                  {g}
                </button>
              ))}
            </div>

            {goal && (
                <div style={{ background: "#e8f5e9", padding: "15px", borderRadius: "10px", marginBottom: "25px", textAlign: "center", border: "1px dashed #4caf50" }}>
                    <p style={{ margin: 0, fontSize: "1.15rem", color: "#2e7d32", fontWeight: "bold" }}>Your Target Calories: {calcData.targetCalories} kcal</p>
                </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
                <button className="nutrition-btn" onClick={() => setStage("body")} style={{ flex: 1, background: "#e0e0e0", color: "#333", border: "1px solid #ccc" }}>Back</button>
                <button className="nutrition-btn" onClick={() => setStage("breakfast")} style={{ flex: 2, background: "#00796b" }}>Next</button>
            </div>
          </div>
        )}

        {stage === "breakfast" && <div style={{ padding: "20px" }}>{renderFoodStage("Breakfast", "Step 1 of 3", "lunch", "Next →")}</div>}
        {stage === "lunch" && <div style={{ padding: "20px" }}>{renderFoodStage("Lunch", "Step 2 of 3", "dinner", "Next →")}</div>}
        {stage === "dinner" && <div style={{ padding: "20px" }}>{renderFoodStage("Dinner", "Step 3 of 3", "submit", "Next →")}</div>}

        {stage === "submit" && (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h3 className="nutrition-title" style={{ color: "#00796b", marginBottom: "20px" }}>Step 4: Review & Submit</h3>
            <div style={{ background: "#f1f8e9", padding: "15px", borderRadius: "10px", marginBottom: "20px", textAlign: "left" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#33691e" }}>Selected Foods:</h4>
              {selectedFoods.map((f, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>{f.name} <small style={{ opacity: 0.7 }}>({f.mealType})</small></span>
                      <span>{f.calories} kcal</span>
                  </div>
              ))}
              {selectedFoods.length === 0 && <p style={{ color: "#666" }}>No foods selected.</p>}
              <div style={{ borderTop: "1px solid #c5e1a5", marginTop: "10px", paddingTop: "10px", fontWeight: "bold", textAlign: "right", color: "#2e7d32" }}>
                  Total Consumed: {totalCaloriesVal} / {calcData.targetCalories} kcal
              </div>
            </div>
            
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

            <div style={{ display: "flex", gap: "10px" }}>
                <button className="nutrition-btn" onClick={() => setStage("dinner")} style={{ flex: 1, background: "#e0e0e0", color: "#333", border: "1px solid #ccc" }}>Back</button>
                <button className="nutrition-btn" onClick={submit} style={{ flex: 2, background: '#4facfe', boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>Submit & View Report</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}