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

      // 🔹 Login or Signup
      await API.post(url, { username, password });

      // 🔹 Save user globally + localStorage
      setUser(username);
      localStorage.setItem("username", username);

      // 🔹 Check if profile exists
      try {
        await API.get(`/profile/${username}`);

        // If profile exists → go to dashboard
        navigate("/dashboard");

      } catch {
        // If profile does NOT exist → go to profile page
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

        <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
          
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit">
            {isSignup ? "Create Account" : "Login"}
          </button>

        </form>

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