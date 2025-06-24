import React, { useState, useRef, useEffect } from 'react';

const YouTubeSummarizer = () => {
  const [link, setLink] = useState('');
  const [summary, setSummary] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/score_feed");
    eventSource.onmessage = (event) => {
      setScore(parseFloat(event.data));
    };
    return () => eventSource.close();
  }, []);

  const getVideoId = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v');
    } catch {
      return '';
    }
  };

  const handleSubmit = async () => {
    if (!link.includes('youtube.com/watch')) {
      alert('Please enter a valid YouTube link.');
      return;
    }

    alert('Starting concentration monitoring... Please turn on your camera.');

    setShowVideo(true);
    const videoId = getVideoId(link);
    const time = 0;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link, time_stamp: time }),
      });

      const data = await response.json();
      setSummary(data.summary);
      setQuiz(data.quiz);

      if (iframeRef.current) {
        iframeRef.current.contentWindow.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          '*'
        );
      }

      alert('Distraction detected. Summary shown.');
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const videoId = getVideoId(link);

  return (
    <div className="youtube-summarizer">
      <div className="container">
        <div className="header">
          <h1 className="main-title">YouTube Summarizer</h1>
          <p className="subtitle">AI-Powered Learning with Concentration Monitoring</p>
        </div>
        
        <div className="input-section">
          <input
            type="text"
            placeholder="Paste YouTube video link here..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="url-input"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`submit-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Processing...' : 'Track & Summarize'}
          </button>
        </div>

        {videoId && (
          <div className="video-section">
            <div className="video-container">
              <iframe
                ref={iframeRef}
                className="youtube-iframe"
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {showVideo && (
              <div className="webcam-section">
                <h4 className="webcam-title">Real-Time Concentration</h4>
                <img
                  src="http://localhost:5000/video_feed"
                  alt="Webcam Feed"
                  className="webcam-feed"
                  onError={(e) => {
                    console.error('Video feed error:', e);
                    e.target.alt = 'Video feed unavailable';
                  }}
                  onLoad={() => {
                    console.log('Video feed loaded successfully');
                  }}
                />
              </div>
            )}
          </div>
        )}

        <div className="score-section">
          <h3 className="score-title">Distraction Level</h3>
          <h1 className={`score-display ${score <= 40 ? 'score-focused' : 'score-distracted'}`}>
            {score}%
          </h1>
        </div>

        {summary && (
          <div className="summary-section">
            <h3 className="summary-title">Summary</h3>
            <p className="summary-text">{summary}</p>
          </div>
        )}

        {quiz.length > 0 && (
          <div className="quiz-section">
            <h3 className="quiz-title">Knowledge Quiz</h3>
            {quiz.map((q, i) => (
              <div key={i} className="quiz-item">
                <div className="quiz-question">Q{i + 1}: {q.question}</div>
                <ul className="quiz-options">
                  {q.options.map((opt, j) => (
                    <li key={j}>{opt}</li>
                  ))}
                </ul>
                <div className="quiz-answer">Answer: {q.answer}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeSummarizer;
