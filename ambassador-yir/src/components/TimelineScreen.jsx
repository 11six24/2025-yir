import { motion } from 'framer-motion';
import './TimelineScreen.css';

function TimelineScreen({ data, onNext }) {
  return (
    <div className="screen timeline-screen">
      <div className="screen-content">
        <h2 className="section-title">Your Journey</h2>
        <div className="timeline">
          <motion.div
            className="timeline-item"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-label">First Joined</div>
              <div className="timeline-value">{data.milestones.firstOrder}</div>
            </div>
          </motion.div>

          <motion.div
            className="timeline-item"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-label">Most Recent Activity</div>
              <div className="timeline-value">{data.milestones.bestMonth}</div>
            </div>
          </motion.div>

          <motion.div
            className="timeline-item"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-label">Portal Visits</div>
              <div className="timeline-value">{data.milestones.totalLogins} times</div>
            </div>
          </motion.div>
        </div>
        <button className="cta-button" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default TimelineScreen;
