import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Test.css";

const API_URL = "http://127.0.0.1:8000";
const DEFAULT_TIME_SECONDS = 15 * 60;

export default function Test({ session }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [remaining, setRemaining] = useState(DEFAULT_TIME_SECONDS);
  const [currentQ, setCurrentQ] = useState(0);
  const timerRef = useRef(null);

  // State for the custom pop-up modal
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    isSubmitting: false,
    onConfirm: null,
  });

  // Fetch questions from backend
  useEffect(() => {
    async function fetchQuestions() {
      const res = await fetch(`${API_URL}/questions`);
      const data = await res.json();
      setQuestions(data.questions);
      setAnswers(data.questions.map(() => ({ selectedIndex: null, reasoning: "" })));
    }
    fetchQuestions();
  }, []);

  // Timer
  useEffect(() => {
    if (questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [questions]);

  function updateAnswer(qIdx, selectedIndex) {
    const copy = [...answers];
    copy[qIdx].selectedIndex = selectedIndex;
    setAnswers(copy);
  }

  function updateReason(qIdx, text) {
    const copy = [...answers];
    copy[qIdx].reasoning = text;
    setAnswers(copy);
  }

  const submitTest = async () => {
    setPopup({
      show: true,
      message: "Submitting test. Please do not close this window.",
      isSubmitting: true,
    });
    try {
      const res = await fetch(`${API_URL}/submitTest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: session.username,
          answers,
        }),
      });
      const data = await res.json();
      console.log("Test submitted, backend result:", data);
      navigate("/testresults");
    } catch (err) {
      console.error("Error submitting test:", err);
      setPopup({
        show: true,
        message: "Error submitting test. Please try again.",
        isSubmitting: false,
      });
    }
  };

  const handleSubmit = (auto = false) => {
    if (auto) {
      submitTest();
      return;
    }

    setPopup({
      show: true,
      message: "Are you sure you want to submit the test?",
      isSubmitting: false,
      onConfirm: submitTest,
    });
  };

  if (questions.length === 0) return <div className="loading-state">Loading questions...</div>;

  const q = questions[currentQ];

  return (
    <section className="test-container">
      {popup.show && (
        <div className="modal-overlay">
          <div className="modal-container">
            <p className="modal-message">{popup.message}</p>
            {!popup.isSubmitting && (
              <div className="modal-actions">
                {popup.onConfirm && (
                  <>
                    <button
                      onClick={() => {
                        setPopup({ show: false, message: "" });
                        popup.onConfirm();
                      }}
                      className="modal-btn modal-confirm-btn"
                    >
                      Yes, Submit
                    </button>
                    <button
                      onClick={() => setPopup({ show: false, message: "" })}
                      className="modal-btn modal-cancel-btn"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {!popup.onConfirm && (
                  <button
                    onClick={() => setPopup({ show: false, message: "" })}
                    className="modal-btn modal-confirm-btn"
                  >
                    OK
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="progress-section">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="progress-dots">
          {questions.map((_, idx) => (
            <button
              key={idx}
              className={`progress-dot ${
                idx === currentQ ? "active-dot" : answers[idx].selectedIndex !== null ? "answered-dot" : ""
              }`}
              onClick={() => setCurrentQ(idx)}
            ></button>
          ))}
        </div>
      </div>

      <div className="test-status-bar">
        <p className="status-item user-info">{session.username}</p>
        <p className="status-item timer-info">
          Time left:
          <span className={remaining < 300 ? "time-danger" : "time-normal"}>
            {formatTime(remaining)}
          </span>
        </p>
        <p className="status-item question-counter">Q {currentQ + 1} / {questions.length}</p>
      </div>

      <div className="question-card">
        <h3 className="question-text">{q.text}</h3>
        
        <div className="options-group">
          {q.options.map((opt, i) => (
            <label key={i} className="option-label">
              <input
                type="radio"
                className="option-radio"
                checked={answers[currentQ].selectedIndex === i}
                onChange={() => updateAnswer(currentQ, i)}
              />
              <span className="option-text">
                {String.fromCharCode(65 + i)}. {opt}
              </span>
            </label>
          ))}
        </div>

        <div className="reasoning-group">
          <label className="reasoning-label">Your Reasoning :</label>
          <textarea
            placeholder="Explain your choice here "
            value={answers[currentQ].reasoning}
            onChange={(e) => updateReason(currentQ, e.target.value)}
            className="reasoning-textarea form-control"
          />
        </div>
      </div>

      <div className="test-navigation">
        <button 
          onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
          className="nav-btn prev-btn"
          disabled={currentQ === 0}
        >
          &larr; Previous
        </button>
        <button 
          onClick={() => setCurrentQ((c) => Math.min(questions.length - 1, c + 1))}
          className="nav-btn next-btn"
          disabled={currentQ === questions.length - 1}
        >
          Next &rarr;
        </button>
        <button 
          onClick={() => handleSubmit(false)}
          className="nav-btn submit-btn register-btn"
        >
          Submit Test
        </button>
      </div>
    </section>
  );

  function formatTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }
}
