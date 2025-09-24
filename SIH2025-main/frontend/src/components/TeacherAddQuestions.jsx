import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import "./TeacherAddQuestions.css"; 

const API_URL = "http://127.0.0.1:8000";

export default function TeacherAddQuestions() {
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [message, setMessage] = useState(null);
  // Added a placeholder quiz ID to match the backend model
  const [quizId, setQuizId] = useState("test_quiz_id"); 

  const handleOptionChange = (idx, value) => {
    const copy = [...options];
    copy[idx] = value;
    setOptions(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages
    try {
      const res = await fetch(`${API_URL}/addQuestion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Added the quizId to the request body
        body: JSON.stringify({ quiz_id: quizId, text, options, correct }),
      });
      const data = await res.json();
      setMessage({ type: 'success', text: data.message });
      
      // Reset form
      setText("");
      setOptions(["", "", "", ""]);
      setCorrect(0);
    } catch (err) {
      setMessage({ type: 'error', text: "Error adding question. Please try again." });
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container"> 
      <div className="form-card">
        <div className="form-header">
          <Link to="/teacher" className="go-back-btn">
            <ArrowLeft className="icon-sm" />
            <span>Go to Dashboard</span>
          </Link>
          <h2 className="card-title">Add New Question</h2>
        </div>

        {message && (
          <div className={`message-box ${message.type}`}>
            {message.type === 'success' ? <CheckCircle className="message-icon" /> : <XCircle className="message-icon" />}
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Question Text:</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              className="form-control"
            />
          </div>

          {options.map((opt, i) => (
            <div key={i} className="form-group">
              <label className="form-label">Option {i + 1}:</label>
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                required
                className="form-control"
              />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Correct Option:</label>
            <select 
              value={correct} 
              onChange={(e) => setCorrect(Number(e.target.value))}
              className="form-select"
            >
              {options.map((_, i) => (
                <option key={i} value={i}>
                  Option {i + 1}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-btn primary-btn">
            Add Question
          </button>
        </form>
      </div>
    </div>
  );
}
