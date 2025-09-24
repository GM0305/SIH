import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

const API_URL = "http://127.0.0.1:8000";

export default function StudentDashboard({ session }) {
  const navigate = useNavigate();
  const [availableQuizzes, setAvailableQuizzes] = useState([]); // Renamed for clarity
  const [previousQuizzes, setPreviousQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.username) {
      navigate("/");
      return;
    }

    setLoading(true);
    async function fetchData() {
      try {
        const [availableRes, previousRes] = await Promise.all([
          fetch(`${API_URL}/student/availableQuizzes`),
          fetch(`${API_URL}/student/previousTests/${session.username}`),
        ]);

        if (!availableRes.ok) throw new Error("Failed to fetch available quizzes");
        if (!previousRes.ok) throw new Error("Failed to fetch previous tests");

        const availableData = await availableRes.json();
        const previousData = await previousRes.json();
        console.log(previousData);
        setAvailableQuizzes(availableData.tests || []);
        setPreviousQuizzes(previousData.results || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session, navigate]);

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  return (
    <section className="student-dashboard-container">
      <h2 className="card-title">Welcome, {session.username}!</h2>

      {/* Available Quizzes Section */}
      <div className="dashboard-card">
        <h3>Available Quizzes</h3>
        {availableQuizzes.length > 0 ? (
          <ul className="test-list">
            {availableQuizzes.map((quiz) => (
              <li key={quiz.id} className="test-list-item">
                <span className="test-name">{quiz.name}</span>
                <button
                  onClick={() => navigate(`/test/${quiz.id}`)}
                  className="take-test-btn primary-btn"
                >
                  Take Quiz
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-content-message">No new quizzes available at this time.</p>
        )}
      </div>

      {/* Previous Tests Section */}
      <div className="dashboard-card previous-tests-card">
        <h3>Previous Test Results</h3>
        {previousQuizzes.length > 0 ? (
          <ul className="test-list">
            {previousQuizzes.map((test) => (
              <li key={test.id} className="test-list-item">
                <span className="test-name">{test.username} | Score: {test.score}</span>
                <button
                  onClick={() => navigate(`/testresults/${test.id}`)}
                  className="view-results-btn register-btn"
                >
                  View Results
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-content-message">You haven't completed any quizzes yet.</p>
        )}
      </div>

      <button onClick={() => navigate("/")} className="back-home-btn register-btn">
        Log Out
      </button>
    </section>
  );
}

