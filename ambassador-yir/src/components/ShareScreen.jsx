import { useRef } from 'react';
import html2canvas from 'html2canvas';
import logo from '../assets/11SIX24_logo.png';
import './ShareScreen.css';

function ShareScreen({ data, onNext, uuid }) {
  const shareCardRef = useRef(null);

  const downloadImage = async () => {
    if (shareCardRef.current) {
      try {
        const canvas = await html2canvas(shareCardRef.current, {
          backgroundColor: '#00D2BE',
          scale: 2,
        });

        const link = document.createElement('a');
        link.download = `${data.name.replace(/\s+/g, '_')}_YearInReview_2025.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  return (
    <div className="screen share-screen">
      <div className="screen-content">
        <h2 className="section-title">Share Your Year</h2>

        <div className="share-preview">
          <div className="share-card" ref={shareCardRef}>
            <div className="share-header">
              <img src={logo} alt="11SIX24" className="share-logo" />
              <h3 className="share-name">{data.name}</h3>
              <p className="share-archetype">{data.archetype.title}</p>
            </div>
            {data.topModels && data.topModels.length > 0 && (
              <div className="share-top-model">
                {data.topModels[0].image && (
                  <img
                    src={data.topModels[0].image}
                    alt={data.topModels[0].name}
                    className="share-model-image"
                  />
                )}
                <div className="share-model-info">
                  <div className="share-model-label">Top Model</div>
                  <div className="share-model-name">{data.topModels[0].name}</div>
                </div>
              </div>
            )}
            <div className="share-stats">
              <div className="share-stat">
                <div className="share-stat-number">{data.stats.orders.toLocaleString()}</div>
                <div className="share-stat-label">Orders</div>
              </div>
              <div className="share-stat">
                <div className="share-stat-number">Top {data.ranking.overall}%</div>
                <div className="share-stat-label">Ranking</div>
              </div>
            </div>
            <div className="share-footer">
              <p>Proud Ambassador of 11SIX24</p>
              <p className="share-year">2025</p>
            </div>
          </div>
        </div>

        <div className="share-buttons">
          <button className="share-button" onClick={downloadImage}>
            📥 Download Image
          </button>
          <button className="share-button" onClick={copyLink}>
            📋 Copy Link
          </button>
        </div>

        <button className="cta-button secondary" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default ShareScreen;
