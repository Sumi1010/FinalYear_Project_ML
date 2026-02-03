import { useState } from "react";
import API from "./api";
import "./auth.css";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      const url = isSignup ? "/signup" : "/login";
      await API.post(url, { username, password });
      setUser(username);
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🌱 Personal Wellbeing</h1>
        <p className="subtitle">
          Your daily companion for a healthier mind
        </p>

        <input
          placeholder="Username"
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={submit}>
          {isSignup ? "Create Account" : "Login"}
        </button>

        <p className="switch">
          {isSignup ? "Already have an account?" : "New here?"}
          <span onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? " Login" : " Create Account"}
          </span>
        </p>
      </div>
    </div>
  );
}
