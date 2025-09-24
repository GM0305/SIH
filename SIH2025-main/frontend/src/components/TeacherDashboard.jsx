import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Users, TrendingUp, Edit, Trash2, Eye, BarChart3 } from 'lucide-react';
import "./TeacherDashboard.css";

const API_URL = "http://127.0.0.1:8000";

export default function TeacherDashboard({ session, onLogout }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const response = await fetch(`${API_URL}/teacher/testHistory/${session.username}`);
        if (!response.ok) {
          throw new Error('Failed to fetch teacher quizzes');
        }
        const data = await response.json();
        setQuizzes(data.history || []);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setQuizzes([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    }

    if (session?.username) {
      fetchQuizzes();
    }
  }, [session]);

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green';
    if (score >= 75) return 'text-blue';
    if (score >= 65) return 'text-yellow';
    return 'text-red';
  };

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Teacher Dashboard: {session.username}</h1>
            <p className="dashboard-subtitle">Manage your quizzes and track student progress</p>
          </div>
          <Link
            to="/addQuestion" // Updated to your '/addQuestion' route
            className="create-quiz-btn"
          >
            <Plus className="icon-sm" />
            <span>Create Quiz</span>
          </Link>
          <button onClick={onLogout} className="logout-btn">
            Log Out
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-container bg-blue">
              <BookOpen className="icon-md text-blue" />
            </div>
            <div className="stat-content">
              <p className="stat-number">{quizzes.length}</p>
              <p className="stat-label">Total Quizzes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-container bg-green">
              <Users className="icon-md text-green" />
            </div>
            <div className="stat-content">
              <p className="stat-number">
                {quizzes.reduce((acc, quiz) => acc + quiz.students, 0)}
              </p>
              <p className="stat-label">Total Students</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-container bg-yellow">
              <TrendingUp className="icon-md text-yellow" />
            </div>
            <div className="stat-content">
              <p className="stat-number">
                {Math.round(quizzes.reduce((acc, quiz) => acc + quiz.averageScore, 0) / quizzes.filter(q => q.students > 0).length) || 0}%
              </p>
              <p className="stat-label">Avg Score</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-container bg-purple">
              <BarChart3 className="icon-md text-purple" />
            </div>
            <div className="stat-content">
              <p className="stat-number">
                {quizzes.filter(q => q.published).length}
              </p>
              <p className="stat-label">Published</p>
            </div>
          </div>
        </div>

        {/* Quizzes Table */}
        <div className="table-card">
          <div className="table-header-container">
            <h2 className="table-title">Your Quizzes</h2>
          </div>
          
          <div className="table-responsive">
            <table className="quiz-table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Quiz</th>
                  <th className="table-th">Subject</th>
                  <th className="table-th">Questions</th>
                  <th className="table-th">Students</th>
                  <th className="table-th">Avg Score</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => (
                    <tr key={quiz.id} className="table-row-hover">
                      <td className="table-td">
                        <div>
                          <p className="quiz-title">{quiz.title}</p>
                          <p className="quiz-created">Created {quiz.created}</p>
                        </div>
                      </td>
                      <td className="table-td text-normal">{quiz.subject}</td>
                      <td className="table-td text-normal">{quiz.questions}</td>
                      <td className="table-td text-normal">{quiz.students}</td>
                      <td className="table-td">
                        <span className={`quiz-score ${getScoreColor(quiz.averageScore)}`}>
                          {quiz.students > 0 ? `${quiz.averageScore}%` : '-'}
                        </span>
                      </td>
                      <td className="table-td">
                        <span className={`status-badge ${
                          quiz.published 
                            ? 'bg-green text-green' 
                            : 'bg-yellow text-yellow'
                        }`}>
                          {quiz.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="table-td">
                        <div className="action-buttons-group">
                          <button className="action-btn text-normal hover-blue">
                            <Eye className="icon-sm" />
                          </button>
                          <button className="action-btn text-normal hover-green">
                            <Edit className="icon-sm" />
                          </button>
                          <Link to="/teacher/analytics" className="action-btn text-normal hover-purple">
                            <BarChart3 className="icon-sm" />
                          </Link>
                          <button className="action-btn text-normal hover-red">
                            <Trash2 className="icon-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-quizzes-message">
                      No quizzes found. Create a new one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
