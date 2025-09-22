import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

const API_URL = "http://127.0.0.1:8000";

export default function StudentDashboard({ session }) {
  const navigate = useNavigate();
  const [availableTests, setAvailableTests] = useState([]);
  const [previousTests, setPreviousTests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if there's no session
    if (!session?.username) {
      navigate("/");
      return;
    }

    setLoading(true);
    async function fetchData() {
      try {
        const [availableRes, previousRes] = await Promise.all([
          fetch(`${API_URL}/student/availableTests`),
          fetch(`${API_URL}/student/previousTests/${session.username}`),
        ]);

        const availableData = await availableRes.json();
        const previousData = await previousRes.json();

        setAvailableTests(availableData.tests);
        setPreviousTests(previousData.results);
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

      {/* Available Tests Section */}
      <div className="dashboard-card">
        <h3>Available Tests</h3>
        {availableTests.length > 0 ? (
          <ul className="test-list">
            {availableTests.map((test) => (
              <li key={test.id} className="test-list-item">
                <span className="test-name">{test.name}</span>
                <button
                  onClick={() => navigate(`/test/${test.id}`)}
                  className="take-test-btn primary-btn"
                >
                  Take Test
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-content-message">No new tests available at this time.</p>
        )}
      </div>

      {/* Previous Tests Section */}
      <div className="dashboard-card previous-tests-card">
        <h3>Previous Test Results</h3>
        {previousTests.length > 0 ? (
          <ul className="test-list">
            {previousTests.map((test) => (
              <li key={test.id} className="test-list-item">
                <span className="test-name">{test.name}</span>
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
          <p className="no-content-message">You haven't completed any tests yet.</p>
        )}
      </div>

      <button onClick={() => navigate("/")} className="back-home-btn register-btn">
        Log Out
      </button>
    </section>
  );
}
