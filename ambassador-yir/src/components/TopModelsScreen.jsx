import './TopModelsScreen.css';

function TopModelsScreen({ data, onNext }) {
  // Check if ambassador has top models data
  const hasTopModels = data.topModels && data.topModels.length > 0;
  const isLoading = data.topModelsStatus === 'loading';
  const hasNoReferrals = data.topModelsStatus === 'none';

  // Auto-skip if they have no referrals at all
  if (hasNoReferrals && !hasTopModels) {
    onNext();
    return null;
  }

  // If still loading when they reach this screen, show brief loading state
  // (Should rarely happen now that we preload while they go through earlier screens)

  // Show loading state (brief - data is preloading in background)
  if (isLoading) {
    return (
      <div className="screen top-models-screen">
        <div className="screen-content">
          <h2 className="section-title">Loading Your Top Models...</h2>
          <div className="loading-spinner"></div>
          <p className="loading-text">Almost ready! Analyzing your referrals...</p>
          <button className="cta-button secondary" onClick={onNext}>
            Skip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen top-models-screen">
      <div className="screen-content">
        <h2 className="section-title">Your Top Models</h2>
        <p className="top-models-subtitle">
          The paddles your community loved most
        </p>

        <div className="models-list">
          {data.topModels.map((model, index) => (
            <motion.div
              key={index}
              className="model-card"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="model-rank">#{index + 1}</div>
              {model.image && (
                <div className="model-image-wrapper">
                  <img
                    src={model.image}
                    alt={model.name}
                    className="model-image"
                  />
                </div>
              )}
              <div className="model-info">
                <h3 className="model-name">{model.name}</h3>
                <p className="model-count">{model.count} orders</p>
              </div>
            </motion.div>
          ))}
        </div>

        <button className="cta-button" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default TopModelsScreen;
