import React, { useState } from "react";
import "./TeacherAddQuestions.css"; 

const API_URL = "http://127.0.0.1:8000";

export default function TeacherDashboard() {
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);

  const handleOptionChange = (idx, value) => {
    const copy = [...options];
    copy[idx] = value;
    setOptions(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/addQuestion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, options, correct }),
      });
      const data = await res.json();
      alert(data.message);
      // Reset form
      setText("");
      setOptions(["", "", "", ""]);
      setCorrect(0);
    } catch (err) {
      alert("Error adding question");
      console.error(err);
    }
  };

  return (
    // Use consistent class names for the container and remove inline styles
    <div className="dashboard-container"> 
      <div className="form-card"> {/* Renamed from 'card' for consistency */}
        <h2 className="card-title">Teacher Dashboard — Add Question</h2> {/* Updated class */}

        <form onSubmit={handleSubmit}>
          <div className="form-group"> {/* Class for input/label grouping */}
            <label className="form-label">Question Text:</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              className="form-control" // Class for inputs/textareas
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
                className="form-control" // Class for inputs
              />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Correct Option:</label>
            <select 
              value={correct} 
              onChange={(e) => setCorrect(Number(e.target.value))}
              className="form-select" // Class for the select box
            >
              {options.map((_, i) => (
                <option key={i} value={i}>
                  Option {i + 1}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-btn primary-btn"> {/* Consistent button classes */}
            Add Question
          </button>
        </form>
      </div>
    </div>
  );
}