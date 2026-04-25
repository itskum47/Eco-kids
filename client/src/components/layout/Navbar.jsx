import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/slices/authSlice';
import { useGradeBand } from '../../hooks/useGradeBand';
import GradeAdaptive from '../GradeAdaptive';
import LanguageSwitcher from '../common/LanguageSwitcher';

// SVG Icons
const LeafIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="url(#grad)" className={className} width="24" height="24">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'var(--eco-green)' }} />
        <stop offset="100%" style={{ stopColor: '#4ade80' }} />
      </linearGradient>
    </defs>
    <path d="M12 22C12 22 21 16 21 9C21 5.13 17.87 2 14 2C12 2 10 3 10 3S8 2 6 2C2.13 2 -1 5.13 -1 9C-1 16 8 22 8 22L12 22Z" opacity="0.8" />
    <path d="M12 22C12 22 21 16 21 9C21 5.13 17.87 2 14 2C12 2 10 3 10 3V22Z" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);
const GamepadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><path d="M15 13h.01"></path><path d="M18 11h.01"></path></svg>
);
const FlaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>
);
const LightningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);
const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 4h10"></path><path d="M17 4v8a5 5 0 0 1-10 0V4"></path><path d="M7 4H4.5a2.5 2.5 0 0 0 0 5H7"></path><path d="M17 4h2.5a2.5 2.5 0 0 1 0 5H17"></path></svg>
);
const FlameIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--orange)" stroke="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14.38-4.22.42-4.28a.5.5 0 0 1 .84.09c.8 1.45 2.12 3.16 3.4 5.2A6 6 0 1 1 12 21a5.9 5.9 0 0 1-3.5-1.15c.67.11 1 0 1-1.35z"></path></svg>
);
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--sun)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const FeedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const ChallengesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
);
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);

const EMPTY_NOTIFICATIONS = [];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const notificationItems = useSelector(state => state.notifications?.items || EMPTY_NOTIFICATIONS);
  const { t } = useTranslation();
  const { band } = useGradeBand();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);

  useEffect(() => {
    if (!isNotificationsOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotificationsOpen]);

  // Main navigation items (always visible)
  const mainNavigationItems = [
    { path: '/', label: t('nav.home') || 'Home', icon: <HomeIcon />, exact: true },
    { path: '/learn-hub', label: t('nav.topics') || 'Learn', icon: <BookIcon /> },
    { path: '/submit-activity', label: t('nav.submitActivity') || 'Act', icon: <FlaskIcon /> },
    { path: '/eco-store', label: t('nav.ecoStore') || 'Reward', icon: <StarIcon /> },
    { path: '/leaderboards', label: t('nav.leaderboard') || 'Leaderboard', icon: <TrophyIcon /> }
  ];

  // More dropdown items
  const moreNavigationItems = [
    { path: '/my-submissions', label: t('nav.mySubmissions') || 'My Submissions', icon: <FeedIcon /> },
    { path: '/environmental-impact', label: t('nav.impact') || 'Impact', icon: <LightningIcon /> },
    { path: '/challenges', label: t('nav.challenges') || 'Challenges', icon: <ChallengesIcon /> }
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
    setIsProfileOpen(false);
  };

  const streakDays = user?.streak || 5;
  const ecoPoints = typeof user?.ecoCoins === 'number'
    ? user.ecoCoins
    : (user?.gamification?.ecoPoints || 0);
  const notificationsCount = notificationItems.length;

  const isKiddie = band === 'seedling';
  const isExpert = band === 'expert' || band === 'challenger';

  const GradeBadge = () => (
    <button
      onClick={() => navigate('/dashboard')}
      className="cursor-pointer hover:opacity-80 transition-opacity"
      title={t('nav.goToDashboard')}
    >
      <GradeAdaptive
        seedling={<div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border-2 border-green-300 bg-green-100 font-['Fredoka_One'] text-green-700 text-sm shadow-sm hover:shadow-md transition-shadow"><span className="text-lg">🌱</span><span>Seedling</span></div>}
        explorer={<div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 font-['Nunito'] font-bold text-blue-700 text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-shadow"><span className="text-sm">🧭</span><span>Explorer</span></div>}
        challenger={<div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded bg-orange-100 border border-orange-300 font-mono font-bold text-orange-800 text-xs uppercase tracking-wider hover:shadow-md transition-shadow"><span className="text-sm">⚡</span><span>Challenger</span></div>}
        expert={<div className="hidden lg:flex items-center space-x-1.5 px-2 py-1 bg-gray-200 border border-gray-300 font-mono font-bold text-gray-700 text-[10px] uppercase tracking-widest hover:shadow-md transition-shadow"><span className="text-sm">🔬</span><span>Expert Node</span></div>}
        fallback={<div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 font-['Nunito'] font-bold text-blue-700 text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-shadow"><span className="text-sm">🧭</span><span>Explorer</span></div>}
      />
    </button>
  );

  return (
    <>
      <nav
        className="fixed top-0 z-[100] w-full"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          height: 'calc(70px + env(safe-area-inset-top))',
          background: isExpert ? 'rgba(255,255,255,0.95)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: isExpert ? '1px solid #e5e7eb' : '1px solid rgba(0,0,0,0.05)',
          boxShadow: isExpert ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">

            {/* Left Side: Logo & Main Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 group">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <LeafIcon className="drop-shadow-sm" />
                </motion.div>
                <div className="flex items-baseline space-x-1">
                  <span className={`font-black text-2xl tracking-tight leading-none ${isKiddie ? "font-['Fredoka_One'] text-[var(--eco-green)]" : "font-['Nunito'] text-[var(--eco-dark)]"}`}>
                    EcoKids
                  </span>
                  {!isKiddie && <span className="font-['Nunito'] font-bold text-sm leading-none text-gray-400">India</span>}
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1 ml-4">
                {mainNavigationItems.map((item) => {
                  const active = isActive(item.path, item.exact);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative px-3 py-2 flex items-center space-x-1.5 font-bold transition-all duration-200 rounded-full group ${active
                        ? isExpert ? 'bg-gray-100 text-gray-900' : 'bg-[var(--eco-pale)] text-[var(--eco-dark)]'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        } ${isKiddie ? "font-['Fredoka_One'] text-sm" : isExpert ? "font-['DM_Sans'] text-xs" : "font-['Nunito'] text-xs"}`}
                    >
                      <span className={active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}>{item.icon}</span>
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}

                {/* More Dropdown Button */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className={`relative px-3 py-2 flex items-center space-x-1.5 font-bold transition-all duration-200 rounded-full group ${
                      isMoreOpen
                        ? isExpert ? 'bg-gray-100 text-gray-900' : 'bg-[var(--eco-pale)] text-[var(--eco-dark)]'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    } ${isKiddie ? "font-['Fredoka_One'] text-sm" : isExpert ? "font-['DM_Sans'] text-xs" : "font-['Nunito'] text-xs"}`}
                  >
                    <span className="text-sm">▾</span>
                    <span className="whitespace-nowrap">{t('more', { defaultValue: 'More' })}</span>
                  </motion.button>

                  <AnimatePresence>
                    {isMoreOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMoreOpen(false)} role="button" tabIndex={0} aria-label={t('nav.closeMoreMenu')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsMoreOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white shadow-xl py-1 z-50 overflow-hidden"
                        >
                          {moreNavigationItems.map((item) => {
                            const active = isActive(item.path, item.exact);
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMoreOpen(false)}
                                className={`px-5 py-2.5 flex items-center space-x-3 font-bold transition-colors ${
                                  active
                                    ? isExpert ? 'bg-gray-100 text-gray-900' : 'bg-[var(--eco-pale)] text-[var(--eco-dark)]'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-[var(--eco-dark)]'
                                } ${isKiddie ? "font-['Fredoka_One']" : "font-['Nunito']"}`}
                              >
                                <span className={active ? 'opacity-100' : 'opacity-70'}>{item.icon}</span>
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right Side: Stats & Auth */}
            <div className="flex items-center space-x-4">

              <GradeBadge />

              <div className="w-px h-8 bg-gray-200 hidden lg:block mx-1"></div>

              {/* Stats / Indicators */}
              {isAuthenticated && (
                <div className="flex items-center space-x-2 md:space-x-3">
                  {/* Streak */}
                  <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full ${isExpert ? 'bg-gray-100 border border-gray-200' : 'bg-orange-50 border border-orange-200'}`}>
                    <FlameIcon />
                    <span className="font-bold text-sm text-orange-600">{streakDays}</span>
                  </div>

                  {/* Eco-points */}
                  <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full ${isExpert ? 'bg-gray-100 border border-gray-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <StarIcon />
                    <span className="font-bold text-sm text-yellow-600">{ecoPoints}</span>
                  </div>

                  {/* Notifications */}
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() => setIsNotificationsOpen((prev) => !prev)}
                      className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label={t('nav.notifications')}
                    >
                      <BellIcon />
                      {notificationsCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center font-bold text-[9px] text-white">
                          {notificationsCount}
                        </span>
                      )}
                    </button>

                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-80 overflow-y-auto">
                        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">{t('nav.notifications')}</div>
                        {notificationsCount === 0 ? (
                          <div className="px-4 py-6 text-sm text-gray-500">{t('nav.noNotifications')}</div>
                        ) : (
                          <ul className="divide-y divide-gray-100">
                            {notificationItems.map((item, index) => (
                              <li key={item.id || index} className="px-4 py-3 flex items-start gap-3">
                                <span className="text-base mt-0.5">{item.icon || '🔔'}</span>
                                <div className="min-w-0">
                                  <p className="text-sm text-gray-800 break-words">{item.message || 'Notification update'}</p>
                                  <p className="text-xs text-gray-500 mt-1">{item.timestamp || item.createdAt || ''}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Authentication / Profile */}
              {isAuthenticated ? (
                <div className="relative ml-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--eco-pale)] border-2 border-[var(--eco-green)] hover:shadow-md transition-all overflow-hidden"
                  >
                    {isKiddie ? (
                      <span className="text-2xl">🧑‍🚀</span>
                    ) : (
                      <span className="font-bold text-lg text-[var(--eco-dark)]">
                        {user?.firstName?.charAt(0) || 'U'}
                      </span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} role="button" tabIndex={0} aria-label={t('nav.closeProfileMenu')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsProfileOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white shadow-xl py-2 z-50 overflow-hidden"
                        >
                          <div className="px-5 py-3 border-b border-gray-100 mb-1 bg-gray-50/50">
                            <p className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs truncate text-gray-500 mt-0.5">{user?.email}</p>
                          </div>
                          <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="block px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[var(--eco-dark)] transition-colors">
                            {t('nav.profile')}
                          </Link>
                          <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="block px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[var(--eco-dark)] transition-colors">
                            {t('nav.dashboard')}
                          </Link>
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                            >
                              {t('nav.logout')}
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="relative ml-2 flex items-center space-x-3">
                  <Link to="/login" className="font-bold text-sm text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap">
                    {t('nav.login') || 'Log in'}
                  </Link>
                  <Link to="/register" className={`font-bold text-sm px-5 py-2 rounded-full text-white shadow-md hover:-translate-y-0.5 transition-all whitespace-nowrap ${isExpert ? 'bg-gray-800 hover:bg-gray-700' : 'bg-[var(--eco-green)] hover:bg-[var(--eco-dark)]'}`}>
                    {t('nav.signup') || 'Sign up'}
                  </Link>
                </div>
              )}

              {/* Language Switcher */}
              <LanguageSwitcher />
            </div>

          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;