import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGradeBand } from '../../hooks/useGradeBand';

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const FlaskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 4h10"></path><path d="M17 4v8a5 5 0 0 1-10 0V4"></path><path d="M7 4H4.5a2.5 2.5 0 0 0 0 5H7"></path><path d="M17 4h2.5a2.5 2.5 0 0 1 0 5H17"></path></svg>;

const BottomNav = () => {
    const { isAuthenticated } = useSelector(state => state.auth);
    const location = useLocation();
    const { band } = useGradeBand();
    const { t } = useTranslation();

    // Only show bottom nav for authenticated users on mobile/tablet
    if (!isAuthenticated) return null;

    const navItems = [
        { name: t('nav.home') || 'Home', path: '/', icon: <HomeIcon /> },
        { name: t('nav.topics') || 'Learn', path: '/learn-hub', icon: <BookIcon /> },
        { name: t('nav.submitActivity') || 'Act', path: '/submit-activity', icon: <FlaskIcon /> },
        { name: t('nav.ecoStore') || 'Reward', path: '/eco-store', icon: <StarIcon /> },
        { name: t('nav.leaderboard') || 'Compete', path: '/leaderboards', icon: <TrophyIcon /> },
    ];

    const isKiddie = band === 'seedling';
    const isExpert = band === 'expert' || band === 'challenger';

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-[100] lg:hidden ${isExpert ? 'bg-white border-t border-gray-200' : 'bg-white/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-gray-100'} pb-safe items-center justify-around flex px-2 py-3`}>
            {navItems.map((item) => {
                const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                return (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className="relative flex flex-col items-center justify-center flex-1 h-full min-w-[50px]"
                    >
                        {isActive && (
                            <motion.div
                                layoutId="bottomNavIndicator"
                                className={`absolute top-0 left-0 right-0 h-1 rounded-b-md ${isKiddie ? 'bg-[var(--eco-green)]' : 'bg-[var(--sky)]'}`}
                                initial={false}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                style={{ top: '-12px' }} // Position slightly above the icon
                            />
                        )}
                        <span className={`text-xl mb-1 transition-colors duration-200 ${isActive ? (isKiddie ? 'text-[var(--eco-green)]' : 'text-[var(--sky)]') : 'text-gray-400'}`}>
                            {item.icon}
                        </span>
                        <span
                            className={`text-[10px] font-bold tracking-wide transition-colors duration-200 ${isKiddie ? "font-['Fredoka_One']" : "font-['Nunito']"} ${isActive ? (isKiddie ? 'text-[var(--eco-green)]' : 'text-[var(--sky)]') : 'text-gray-400'}`}
                        >
                            {item.name}
                        </span>
                    </NavLink>
                );
            })}
        </div>
    );
};

export default BottomNav;
