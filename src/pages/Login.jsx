import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { FIXED_USERNAME, FIXED_PASSWORD } from "../authConfig.js";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (username === FIXED_USERNAME && password === FIXED_PASSWORD) {
      localStorage.setItem("lab_logged_in", "true");
      navigate("/");
    } else {
      setError("Galat username ya password. Dobara try karein.");
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-box card">
        <div className="brand-mark"><FlaskConical size={24} /></div>
        <h1>Lab Management System</h1>
        <p className="sub">Login karke aage badhein</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error-text show">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
