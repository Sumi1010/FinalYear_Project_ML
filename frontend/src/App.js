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

// New Habit Modules
import Journaling from "./modules/Journaling";
import Reading from "./modules/Reading";
import Learning from "./modules/Learning";

import SplashScreen from "./components/SplashScreen";

function App() {
  const [user, setUser] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Login setUser={setUser} />} />
      <Route path="/profile" element={<ProfileForm user={user} />} />
      <Route path="/dashboard" element={<Dashboard user={user} />} />
      <Route path="/mental" element={<MentalPage user={user} />} />
      <Route path="/physical" element={<PhysicalInput user={user} />} />
      <Route path="/nutrition" element={<NutritionInput user={user} />} />
      
      {/* Habit Tracking Routes */}
      <Route path="/habit-tracking" element={<HabitTracking user={user} />} />
      <Route path="/journaling" element={<Journaling user={user} />} />
      <Route path="/reading" element={<Reading user={user} />} />
      <Route path="/learning" element={<Learning user={user} />} />

      <Route path="/personal-tracker" element={<PersonalTracker />} />
      <Route path="/weekly-report" element={<WeeklyReport user={user} />} />
    </Routes>
  );
}

export default App;