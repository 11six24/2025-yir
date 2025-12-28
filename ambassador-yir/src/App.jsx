import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import YearInReview from './pages/YearInReview';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:uuid" element={<YearInReview />} />
        <Route path="/" element={
          <div className="landing">
            <h1>Ambassador Year in Review 2025</h1>
            <p>Please use the unique link sent to your email.</p>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
