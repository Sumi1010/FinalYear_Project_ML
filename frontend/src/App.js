import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Login from "./login";
import Dashboard from "./dashboard";
import ProfileForm from "./profile";
import MentalPage from "./modules/MentalInput"

function App() {
  const [user, setUser] = useState("");

  return (
    <Routes>
      <Route path="/" element={<Login setUser={setUser} />} />
      <Route path="/dashboard" element={<Dashboard user={user} />} />
      <Route path="/profile" element={<ProfileForm user={user} />} />
      <Route path="/mental" element={<MentalPage user={user} />} />

    </Routes>
  );
}

export default App;