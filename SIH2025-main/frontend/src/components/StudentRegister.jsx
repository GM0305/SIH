import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentRegister.css";

const API_URL = "http://127.0.0.1:8000";

export default function StudentRegister({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/studentRegister/`, {
        username,
        password,
      });
      //onLogin(res.data);
      navigate("/studentLogin");
    } catch (err) {
      alert("Student Already exists...");
    }
  }

  return (
    <div className="student-register-container"> 
      {/* Applied class for the form card */}
      <form onSubmit={handleLogin} className="student-register-form"> 
        <h2>Student Register</h2>
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
        />
        <input 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          type="password" 
          placeholder="Password" 
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
