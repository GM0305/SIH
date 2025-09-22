import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css"; // Ensure this path is correct

const API_URL = "http://127.0.0.1:8000";

export default function TeacherDashboard({ session }) {
  const navigate = useNavigate();
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if there's no session
    if (!session?.username) {
      navigate("/");
      return;
    }

    setLoading(true);
    async function fetchHistory() {
      try {
        // Fetch test history related to this teacher or all tests
        const res = await fetch(`${API_URL}/teacher/testHistory/${session.username}`);
        const data = await res.json();
        setTestHistory(data.history || []);
      } catch (err) {
        console.error("Error fetching test history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [session, navigate]);

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  return (
    <section className="teacher-dashboard-container">
      <h2 className="card-title">Teacher Dashboard: {session.username}</h2>
      
      {/* Action Buttons */}
      <div className="action-buttons-group">
        <button
          onClick={() => navigate("/addQuestion")} // Redirect to the question addition page
          className="action-btn register-btn" // Purple accent for creation
        >
          + Add New Question
        </button>
        <button
          onClick={() => navigate("/")}
          className="action-btn primary-btn" // Blue accent for primary action (e.g., Log Out)
        >
          Log Out
        </button>
      </div>

      {/* Test History Section */}
      <div className="dashboard-card history-card">
        <h3>Recent Test History</h3>
        {testHistory.length > 0 ? (
          <ul className="history-list">
            {testHistory.map((test) => (
              <li key={test.testId} className="history-list-item">
                <span className="test-title">Test: {test.name}</span>
                <span className="test-date">Created on: {new Date(test.dateCreated).toLocaleDateString()}</span>
                <button
                  onClick={() => navigate(`/testdetails/${test.testId}`)}
                  className="view-btn primary-btn"
                >
                  View Details
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-content-message">No test history found.</p>
        )}
      </div>
      
    </section>
  );
}