import { motion } from 'framer-motion';
import './ArchetypeScreen.css';

function ArchetypeScreen({ data, onNext }) {
  return (
    <div className="screen archetype-screen">
      <div className="screen-content">
        <motion.div
          className="badge-container"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
        >
          <div className="badge">
            <div className="badge-icon">⭐</div>
            <h2 className="archetype-title">{data.archetype.title}</h2>
            <p className="archetype-description">{data.archetype.description}</p>
          </div>
          <motion.div
            className="percentile-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Top <span className="percentile-number">{data.ranking.overall}</span>%
          </motion.div>
        </motion.div>
        <button className="cta-button" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default ArchetypeScreen;
