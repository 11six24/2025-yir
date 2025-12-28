import './ErrorScreen.css';

function ErrorScreen() {
  return (
    <div className="screen error-screen">
      <div className="error-content">
        <h1>Oops!</h1>
        <p>We couldn't find your Year in Review.</p>
        <p className="error-detail">Make sure you're using the correct link from your email.</p>
      </div>
    </div>
  );
}

export default ErrorScreen;
