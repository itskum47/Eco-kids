import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import socket from '../services/socket';

const SeasonalEventBanner = () => {
  const { t } = useTranslation();
  const [activeEvent, setActiveEvent] = useState(null);
  const [dismissed, setDismissed] = useState([]);
  const [countdown, setCountdown] = useState(null);

  // Load dismissed events from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dismissed_seasonal_events');
    if (stored) {
      setDismissed(JSON.parse(stored));
    }
  }, []);

  // Fetch active seasonal events on mount
  useEffect(() => {
    fetchActiveEvent();
    const interval = setInterval(fetchActiveEvent, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time event updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    socket.on('seasonal-event-started', (data) => {
      setActiveEvent({
        _id: data.eventId,
        title: data.name,
        description: data.description,
        bonusMultiplier: data.multiplier,
        endsAt: new Date(data.endsAt),
        theme: data.theme,
        emoji: data.emoji
      });
      setCountdown(null);
    });

    socket.on('seasonal-event-ended', (data) => {
      if (activeEvent?._id === data.eventId) {
        setActiveEvent(null);
      }
    });

    return () => {
      socket.off('seasonal-event-started');
      socket.off('seasonal-event-ended');
    };
  }, [activeEvent]);

  // Update countdown timer every second
  useEffect(() => {
    if (!activeEvent?.endsAt) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = new Date(activeEvent.endsAt) - now;

      if (diff <= 0) {
        setActiveEvent(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [activeEvent]);

  const fetchActiveEvent = async () => {
    try {
      const res = await api.get('/v1/events/seasonal/active');
      const event = res.data.data?.[0];

      if (event && !dismissed.includes(event._id)) {
        setActiveEvent(event);
      }
    } catch (err) {
      console.warn('[SeasonalEventBanner] Error fetching active events:', err);
    }
  };

  const handleDismiss = () => {
    if (activeEvent?._id) {
      const newDismissed = [...dismissed, activeEvent._id];
      setDismissed(newDismissed);
      localStorage.setItem('dismissed_seasonal_events', JSON.stringify(newDismissed));
      setActiveEvent(null);
    }
  };

  if (!activeEvent || !countdown) {
    return null;
  }

  // Color scheme based on theme
  const themeColors = {
    earth_day: 'from-green-500 to-green-600',
    environment_day: 'from-green-600 to-emerald-600',
    clean_air: 'from-blue-400 to-blue-500',
    water_week: 'from-cyan-400 to-blue-500',
    biodiversity: 'from-purple-500 to-pink-500',
    diwali_clean: 'from-orange-400 to-red-500',
    independence_green: 'from-orange-500 via-white to-green-500',
    custom: 'from-lime-400 to-green-500'
  };

  const bgClass = themeColors[activeEvent.theme] || themeColors.custom;

  return (
    <AnimatePresence>
      <motion.div
        key="seasonal-banner"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-20 left-0 right-0 z-40 mx-4 md:mx-auto md:max-w-2xl md:left-1/2 md:-translate-x-1/2`}
      >
        <div className={`bg-gradient-to-r ${bgClass} rounded-2xl shadow-2xl overflow-hidden`}>
          <div className="px-6 py-4 md:px-8 md:py-6 text-white">
            <div className="flex items-start justify-between gap-4">
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl" role="img" aria-label="event">
                    {activeEvent.emoji || '🌱'}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg md:text-xl leading-tight truncate">
                      {activeEvent.title}
                    </h3>
                    <p className="text-sm md:text-base font-semibold opacity-90 flex items-center gap-1 mt-1">
                      ⚡ {activeEvent.bonusMultiplier}x Points {t('banner.thisPeriod') || 'This Week!'}
                    </p>
                  </div>
                </div>

                {/* Countdown */}
                <div className="text-xs md:text-sm opacity-90 mt-2">
                  {countdown.days > 0
                    ? t('banner.daysRemaining') ? t('banner.daysRemaining', { days: countdown.days, hours: countdown.hours }) : `${countdown.days}d ${countdown.hours}h remaining`
                    : `${countdown.hours}h ${countdown.minutes}m remaining`}
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                aria-label="Dismiss banner"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white bg-opacity-80"
                initial={{ width: '100%' }}
                animate={{ width: ((countdown.days * 24 + countdown.hours) / (activeEvent.endsAt.getDate() === new Date().getDate() ? 24 : 168)) * 100 + '%' }}
                transition={{ duration: 60, ease: 'linear' }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SeasonalEventBanner;
