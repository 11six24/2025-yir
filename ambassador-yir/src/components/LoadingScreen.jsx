import './LoadingScreen.css';

function LoadingScreen() {
  return (
    <div className="screen loading-screen">
      <div className="loading-content">
        <div className="spinner"></div>
        <p>Loading your year...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
