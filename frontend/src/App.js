import { useState } from "react";
import Login from "./login";
import Dashboard from "./dashboard";

function App() {
  const [user, setUser] = useState(null);

  return user ? <Dashboard user={user} /> : <Login setUser={setUser} />;
}

export default App;
