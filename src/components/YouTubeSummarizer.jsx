import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const YouTubeSummarizer = () => {
  const [link, setLink] = useState('');
  const [summary, setSummary] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);
  const [score, setScore] = useState(0);
  
  // Audio detection state
  const [audioDetectionActive, setAudioDetectionActive] = useState(false);
  const [emotionResult, setEmotionResult] = useState(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);

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

  // Audio detection functions
  const startAudioDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 2048;
      microphoneRef.current.connect(analyserRef.current);
      
      setAudioDetectionActive(true);
      processAudioFrame();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopAudioDetection = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setAudioDetectionActive(false);
    setEmotionResult(null);
  };

  const processAudioFrame = async () => {
    if (!analyserRef.current || !audioDetectionActive) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Convert audio data to format expected by backend
    const audioFrame = {
      data: Array.from(dataArray),
      sample_rate: audioContextRef.current.sampleRate,
      timestamp: Date.now()
    };

    try {
      const response = await fetch('http://localhost:5000/api/audio-emotion-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_frame: audioFrame }),
      });

      if (response.ok) {
        const result = await response.json();
        setEmotionResult(result);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    }

    if (audioDetectionActive) {
      animationFrameRef.current = requestAnimationFrame(processAudioFrame);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopAudioDetection();
    };
  }, []);

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

        {/* Audio Detection Controls */}
        <div className="audio-detection-section">
          <h3 className="audio-title">Audio Emotion Detection</h3>
          <div className="audio-controls">
            <button
              onClick={startAudioDetection}
              disabled={audioDetectionActive}
              className={`audio-btn start-btn ${audioDetectionActive ? 'disabled' : ''}`}
            >
              {audioDetectionActive ? 'Detection Active' : 'Start Audio Detection'}
            </button>
            <button
              onClick={stopAudioDetection}
              disabled={!audioDetectionActive}
              className={`audio-btn stop-btn ${!audioDetectionActive ? 'disabled' : ''}`}
            >
              Stop Audio Detection
            </button>
          </div>
          
          {emotionResult && (
            <div className="emotion-results">
              <h4 className="emotion-title">Current Emotion Analysis</h4>
              <div className="emotion-display">
                <div className={`emotion-badge ${emotionResult.emotion}`}>
                  {emotionResult.emotion.toUpperCase()}
                </div>
                <div className="emotion-details">
                  <p><strong>Confidence:</strong> {(emotionResult.confidence * 100).toFixed(1)}%</p>
                  <p><strong>Concentration:</strong> {(emotionResult.concentration * 100).toFixed(1)}%</p>
                  <p className={`distraction-status ${emotionResult.distracted ? 'distracted' : 'focused'}`}>
                    <strong>Status:</strong> {emotionResult.distracted ? 'Distracted' : 'Focused'}
                  </p>
                </div>
              </div>
            </div>
          )}
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
            <p className="summary-text"><ReactMarkdown>{summary}</ReactMarkdown></p>
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

      <style jsx>{`
        .audio-detection-section {
          margin: 20px 0;
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          background: #f9f9f9;
        }

        .audio-title {
          color: #333;
          margin-bottom: 15px;
          font-size: 1.2em;
        }

        .audio-controls {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }

        .audio-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .start-btn {
          background: #4CAF50;
          color: white;
        }

        .start-btn:hover:not(.disabled) {
          background: #45a049;
        }

        .stop-btn {
          background: #f44336;
          color: white;
        }

        .stop-btn:hover:not(.disabled) {
          background: #da190b;
        }

        .disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .emotion-results {
          background: white;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .emotion-title {
          margin-bottom: 10px;
          color: #555;
        }

        .emotion-display {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .emotion-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          color: white;
        }

        .emotion-badge.focused { background: #4CAF50; }
        .emotion-badge.engaged { background: #2196F3; }
        .emotion-badge.excited { background: #FF9800; }
        .emotion-badge.calm { background: #9C27B0; }
        .emotion-badge.distracted { background: #f44336; }
        .emotion-badge.bored { background: #795548; }

        .emotion-details p {
          margin: 5px 0;
          font-size: 0.9em;
        }

        .distraction-status.distracted {
          color: #f44336;
        }

        .distraction-status.focused {
          color: #4CAF50;
        }
      `}</style>
    </div>
  );
};

export default YouTubeSummarizer;
