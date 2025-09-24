import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TestResults.css"

const API_URL = "http://127.0.0.1:8000";

export default function TestResults({ session }) {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.username) {
        navigate("/"); // redirect if no session
        console.warn("⚠️ No session.username found, redirecting to home...");
        return;
    }

    console.log("👉 Fetching test results for user:", session.username);

    async function fetchResults() {
      try {
        const res = await fetch(`${API_URL}/testResults/${session.username}`);
        if (!res.ok) throw new Error("No results found");
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error(err);
        setResult(null);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [session, navigate]);

  if (loading) return <div className="loading-state">Loading results...</div>;

  if (!result) {
    return (
      <div className="no-results-container">
        <p className="no-results-message">No test results found.</p>
        <button 
            onClick={() => navigate("/studentDashboard")} 
            className="submit-btn primary-btn"
        >
            Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <section className="results-container">
      <div className="results-card">
        <h2 className="card-title">Test Results</h2>
        
        <div className="score-summary-card">
            <p className="summary-score">
                Score: <span className="score-value">{result.score}</span> / {result.questions.length*2}
            </p> 
            <p className="summary-total">Total Questions: {result.questions.length}</p>
        </div>

        <h3 className="details-heading">Detailed Breakdown</h3>

        <div className="table-responsive">
            <table className="results-table">
                <thead>
                    <tr>
                        <th>Q#</th>
                        <th>Question</th>
                        <th>Your Answer</th>
                        <th>Correct Answer</th>
                        <th>AI Verdict</th>
                        <th>Your Reasoning</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {result.detailed_scores?.map((d, i) => (
                        <tr key={i} className={d.total > 0 ? 'row-correct' : 'row-incorrect'}>
                            <td>{i + 1}</td>
                            <td className="question-column">{d.question}</td>
                            <td>{d.student_answer || "—"}</td>
                            <td>{d.correct_answer || "—"}</td>
                            <td className="verdict-column">{d.verdict || "—"}</td>
                            <td>{d.reasoning || "—"}</td>
                            <td className="score-column">{d.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        <button 
            onClick={() => navigate("/student-dashboard")} 
            className="submit-btn register-btn back-home-btn"
        >
            Go to Dashboard
        </button>
      </div>
    </section>
  );
}
