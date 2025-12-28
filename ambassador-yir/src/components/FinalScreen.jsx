import './FinalScreen.css';

function FinalScreen({ data, onReset }) {
  return (
    <div className="screen final-screen">
      <div className="screen-content">
        <div className="final-badge">
          <div className="final-badge-icon">⭐</div>
          <h3 className="final-badge-title">{data.archetype.title}</h3>
          <p className="final-percentile">Top {data.ranking.overall}%</p>
        </div>

        <h2 className="section-title">Let's make next year even bigger</h2>
        <p className="final-text">
          Ready to take your ambassador game to the next level?
        </p>
        <div className="final-actions">
          <a
            href="https://11six24.com"
            className="cta-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Ambassador Perks
          </a>
          <button className="cta-button secondary" onClick={onReset}>
            View Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinalScreen;
