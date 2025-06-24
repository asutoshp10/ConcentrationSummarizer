import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Welcome to your AI Learning Hub</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>🎥 YouTube Sessions</h3>
          <p className="stat-number">12</p>
          <p className="stat-label">Videos Summarized</p>
        </div>
        
        <div className="stat-card">
          <h3>🌐 Web Articles</h3>
          <p className="stat-number">8</p>
          <p className="stat-label">Articles Processed</p>
        </div>
        
        <div className="stat-card">
          <h3>⏱️ Focus Time</h3>
          <p className="stat-number">2.5h</p>
          <p className="stat-label">Today's Focus</p>
        </div>
        
        <div className="stat-card">
          <h3>🎯 Concentration</h3>
          <p className="stat-number">85%</p>
          <p className="stat-label">Average Score</p>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">🎥</span>
            <div className="activity-details">
              <p><strong>YouTube Video Summarized</strong></p>
              <p className="activity-time">2 hours ago</p>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🌐</span>
            <div className="activity-details">
              <p><strong>Web Article Processed</strong></p>
              <p className="activity-time">5 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
