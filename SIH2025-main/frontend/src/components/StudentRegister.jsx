import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentRegister.css";

const API_URL = "http://127.0.0.1:8000";

export default function StudentRegister({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Simple client-side email and password validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/studentRegister/`, {
        username: email, // Use 'email' for the backend
        password,
      });
      //onLogin(res.data);
      navigate("/studentLogin");
    } catch (err) {
      setError("This email is already registered. Please login or use a different email.");
    }
  };

  return (
    <div className="student-register-container">
      <form onSubmit={handleRegister} className="student-register-form">
        <h2>Student Register</h2>
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
