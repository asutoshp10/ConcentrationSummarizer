import React, { useState } from 'react';
import './App.css';
import YouTubeSummarizer from './components/YouTubeSummarizer';
import Dashboard from './components/Dashboard';
import WebSummarizer from './components/WebSummarizer';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'youtube_summarizer':
        return <YouTubeSummarizer />;
      case 'web_summarizer':
        return <WebSummarizer />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>AI Learning Hub</h2>
          </div>
          <ul className="nav-menu">
            <li className="nav-item">
              <button 
                className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('dashboard')}
              >
                📊 Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${currentPage === 'youtube_summarizer' ? 'active' : ''}`}
                onClick={() => setCurrentPage('youtube_summarizer')}
              >
                🎥 YouTube Summarizer
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${currentPage === 'web_summarizer' ? 'active' : ''}`}
                onClick={() => setCurrentPage('web_summarizer')}
              >
                🌐 Web Summarizer
              </button>
            </li>
          </ul>
        </div>
      </nav>
      
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
