import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeScreen from '../components/WelcomeScreen';
import StatsScreen from '../components/StatsScreen';
import ArchetypeScreen from '../components/ArchetypeScreen';
import TimelineScreen from '../components/TimelineScreen';
import TopModelsScreen from '../components/TopModelsScreen';
import ThankYouScreen from '../components/ThankYouScreen';
import ShareScreen from '../components/ShareScreen';
import FinalScreen from '../components/FinalScreen';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import './YearInReview.css';

const SCREENS = [
  'welcome',
  'stats',
  'archetype',
  'timeline',
  'topmodels',
  'thankyou',
  'share',
  'final'
];

function YearInReview() {
  const { uuid } = useParams();
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [ambassadorData, setAmbassadorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadAmbassadorData();
  }, [uuid]);

  const loadAmbassadorData = async () => {
    try {
      // Use API in production, JSON only for local dev
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      let data;

      if (isLocalDev) {
        // Local dev: try JSON fallback
        try {
          const response = await fetch('/ambassador-data.json');
          const allData = await response.json();
          data = allData[uuid];
        } catch (err) {
          // If JSON doesn't exist, fall back to API
          const response = await fetch(`/api/ambassador/${uuid}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          data = await response.json();
        }
      } else {
        // Production: Always use D1 API
        const response = await fetch(`/api/ambassador/${uuid}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        data = await response.json();

        // Start background polling if top models are being processed
        // This way they load while user goes through earlier screens
        if (data.topModelsStatus === 'loading') {
          pollForTopModels();
        }
      }

      if (data) {
        setAmbassadorData(data);
        setLoading(false);
      } else {
        setError(true);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(true);
      setLoading(false);
    }
  };

  const pollForTopModels = async () => {
    // Poll every 3 seconds for up to 3 minutes (enough for large order counts)
    let attempts = 0;
    const maxAttempts = 60;

    const pollInterval = setInterval(async () => {
      attempts++;

      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        return;
      }

      try {
        const response = await fetch(`/api/ambassador/${uuid}`);
        if (!response.ok) return;

        const data = await response.json();

        // Update if status changed
        if (data.topModelsStatus === 'ready' || data.topModelsStatus === 'none') {
          setAmbassadorData(data);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 3000);
  };

  const nextScreen = () => {
    if (currentScreenIndex < SCREENS.length - 1) {
      setCurrentScreenIndex(currentScreenIndex + 1);
    }
  };

  const resetView = () => {
    setCurrentScreenIndex(0);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !ambassadorData) {
    return <ErrorScreen />;
  }

  const currentScreen = SCREENS[currentScreenIndex];

  return (
    <div className="year-in-review">
      <AnimatePresence mode="wait">
        {currentScreen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomeScreen data={ambassadorData} onNext={nextScreen} />
          </motion.div>
        )}

        {currentScreen === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <StatsScreen data={ambassadorData} onNext={nextScreen} />
          </motion.div>
        )}

        {currentScreen === 'archetype' && (
          <motion.div
            key="archetype"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <ArchetypeScreen data={ambassadorData} onNext={nextScreen} />
          </motion.div>
        )}

        {currentScreen === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.5 }}
          >
            <TimelineScreen data={ambassadorData} onNext={nextScreen} />
          </motion.div>
        )}

        {currentScreen === 'topmodels' && (
          <motion.div
            key="topmodels"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <TopModelsScreen data={ambassadorData} onNext={nextScreen} />
          </motion.div>
        )}

        {currentScreen === 'thankyou' && (
          <motion.div
            key="thankyou"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThankYouScreen data={ambassadorData} onNext={nextScreen} />
          </motion.div>
        )}

        {currentScreen === 'share' && (
          <motion.div
            key="share"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ShareScreen data={ambassadorData} onNext={nextScreen} uuid={uuid} />
          </motion.div>
        )}

        {currentScreen === 'final' && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FinalScreen data={ambassadorData} onReset={resetView} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default YearInReview;
