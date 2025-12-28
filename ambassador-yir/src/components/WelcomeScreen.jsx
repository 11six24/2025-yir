import { useEffect, useState } from 'react';
import './WelcomeScreen.css';

function WelcomeScreen({ data, onNext }) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  return (
    <div className="screen welcome-screen">
      {showConfetti && <div className="confetti"></div>}
      <div className="screen-content">
        <h1 className="display-name">{data.name},</h1>
        <h2 className="welcome-headline">you made 2025 legendary.</h2>
        <p className="welcome-subtext">Here's what you accomplished as an Ambassador this year.</p>
        <button className="cta-button" onClick={onNext}>
          Start My Year
        </button>
      </div>
    </div>
  );
}

export default WelcomeScreen;
