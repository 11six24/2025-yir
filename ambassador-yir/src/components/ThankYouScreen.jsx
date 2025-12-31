import './ThankYouScreen.css';

function ThankYouScreen({ data, onNext }) {
  // Calculate total community impact (you can adjust this based on total ambassador data)
  const communityImpact = 4436; // Total active ambassadors

  return (
    <div className="screen thankyou-screen">
      <div className="screen-content">
        <h2 className="section-title">Because of you...</h2>
        <p className="thank-you-text">
          You're one of <strong className="community-stat">{communityImpact.toLocaleString()}</strong> ambassadors who helped grow 11SIX24 this year.
        </p>
        <p className="thank-you-quote">
          "Our ambassadors are the heart of 11SIX24. Thank you for being part of the journey."
        </p>
        <p className="signature">— David Groechel Founder 11SIX24</p>
        <button className="cta-button" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default ThankYouScreen;
