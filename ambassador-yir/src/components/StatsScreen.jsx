import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './StatsScreen.css';

function StatsScreen({ data, onNext }) {
  const [animatedStats, setAnimatedStats] = useState({
    revenue: 0,
    orders: 0,
    clicks: 0,
    commission: 0,
  });

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setAnimatedStats({
        revenue: Math.floor(data.stats.revenue * progress),
        orders: Math.floor(data.stats.orders * progress),
        clicks: Math.floor(data.stats.clicks * progress),
        commission: Math.floor(data.stats.commission * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedStats({
          revenue: data.stats.revenue,
          orders: data.stats.orders,
          clicks: data.stats.clicks,
          commission: data.stats.commission,
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [data]);

  return (
    <div className="screen stats-screen">
      <div className="screen-content">
        <h2 className="section-title">Your Impact</h2>
        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-number">
              ${animatedStats.revenue.toLocaleString()}
            </div>
            <div className="stat-label">Revenue Generated</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-number">
              {animatedStats.orders.toLocaleString()}
            </div>
            <div className="stat-label">Orders Influenced</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-number">
              {animatedStats.clicks.toLocaleString()}
            </div>
            <div className="stat-label">Clicks Driven</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-number">
              ${animatedStats.commission.toLocaleString()}
            </div>
            <div className="stat-label">Commissions Earned</div>
          </motion.div>
        </div>
        <button className="cta-button" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default StatsScreen;
