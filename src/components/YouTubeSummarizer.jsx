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

    setShowVideo(true); // <== Show webcam feed
    const videoId = getVideoId(link);
    const time = 20;

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
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>YouTube Summarizer</h2>
      <input
        type="text"
        placeholder="Paste YouTube video link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        style={{
          width: '60%',
          padding: '0.5rem',
          marginRight: '1rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Summarizing...' : 'Submit'}
      </button>

      {videoId && (
        <div style={{ display: 'flex', marginTop: '2rem', gap: '2rem' }}>
          <iframe
            ref={iframeRef}
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>

          {showVideo && (
            <div>
              <h4>Real-Time Concentration</h4>
              <img
                src="http://localhost:5000/video_feed"
                alt="Webcam Feed"
                width="320"
                height="240"
                style={{ 
                  border: '2px solid #ccc', 
                  borderRadius: '8px',
                  backgroundColor: '#000' // Fallback background
                }}
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

      <div style={{ marginTop: '1rem' }}>
        <h3>Real-time Distraction level:</h3>
        <h1 style={{ 
          color: score <= 40 ? '#4CAF50' : '#f44336',
          fontSize: '3rem',
          margin: '10px 0'
        }}>
          {score}%
        </h1>
      </div>

      {summary && (
        <>
          <h3>Summary:</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{summary}</p>
        </>
      )}

      {quiz.length > 0 && (
        <>
          <h3>Quiz:</h3>
          {quiz.map((q, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <strong>Q{i + 1}: {q.question}</strong>
              <ul>
                {q.options.map((opt, j) => (
                  <li key={j}>{opt}</li>
                ))}
              </ul>
              <em>Answer: {q.answer}</em>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default YouTubeSummarizer;
