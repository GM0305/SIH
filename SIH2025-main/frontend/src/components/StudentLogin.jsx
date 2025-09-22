import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./StudentLogin.css";

const API_URL = "http://127.0.0.1:8000";

export default function StudentLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/studentLogin/`, {
        username,
        password,
      });
      onLogin(res.data);
      navigate("/student-dashboard");
    } catch (err) {
      alert("Invalid student login");
    }
  }

  return (
  <div className="login-container"> {/* Main page container */}
   <form onSubmit={handleLogin} className="login-form"> {/* Form card container */}
      <h2>Student Login</h2>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
         <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
         <button type="submit">Login</button>
         </form>
         <p className="register-prompt"> {/* Link prompt container */}
         Don't have an account?{" "}
         <Link to="/studentRegister">Register here</Link>
      </p> 
  </div>
 );
}
