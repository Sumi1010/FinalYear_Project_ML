import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";
import "./auth.css";

export default function Login({ setUser }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    try {
      const url = isSignup ? "/signup" : "/login";

      // Login or Signup
      await API.post(url, { username, password });

      // Save user globally
      setUser(username);

      // After login → check profile
      const profileCheck = await API.get(`/profile/${username}`);

      if (profileCheck.data.exists) {
        navigate("/dashboard");
      } else {
        navigate("/profile");
      }

    } catch (err) {
      console.error(err);
      setError("Invalid credentials or user already exists.");
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
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
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