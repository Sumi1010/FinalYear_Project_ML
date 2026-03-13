import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Login from "./login";
import Dashboard from "./dashboard";
import ProfileForm from "./profile";
import MentalPage from "./modules/MentalInput";
import PhysicalInput from "./modules/PhysicalInput";
import NutritionInput from "./modules/NutritionInput";
import HabitTracking from "./modules/HabitTracking";
import PersonalTracker from "./modules/PersonalTracker";
import WeeklyReport from "./WeeklyReport";

function App() {
  const [user, setUser] = useState("");

  return (
    <Routes>
      <Route path="/" element={<Login setUser={setUser} />} />
      <Route path="/profile" element={<ProfileForm user={user} />} />
      <Route path="/dashboard" element={<Dashboard user={user} />} />
      <Route path="/mental" element={<MentalPage user={user} />} />
      <Route path="/physical" element={<PhysicalInput user={user} />} />
      <Route path="/nutrition" element={<NutritionInput user={user} />} />
      <Route path="/habit-tracking" element={<HabitTracking user={user} />} />
      <Route path="/personal-tracker" element={<PersonalTracker />} />
      <Route path="/weekly-report" element={<WeeklyReport user={user} />} />
    </Routes>
  );
}

export default App;