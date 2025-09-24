import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./StudentLogin.css";

const API_URL = "http://127.0.0.1:8000";

export default function StudentLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Simple client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Client-side password length validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/studentLogin/`, {
        username: email, // Use 'email' for the backend
        password,
      });
      onLogin(res.data);
      navigate("/student-dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Student Login</h2>
        {error && <p className="error-message">{error}</p>}
        <input 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
        />
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength="8"
        />
        <button type="submit">Login</button>
      </form>
      <p className="register-prompt">
        Don't have an account?{" "}
        <Link to="/studentRegister">Register here</Link>
      </p>
    </div>
  );
}
