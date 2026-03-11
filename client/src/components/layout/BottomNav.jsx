import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGradeBand } from '../../hooks/useGradeBand';

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const GamepadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><path d="M15 13h.01"></path><path d="M18 11h.01"></path></svg>;
const FlaskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>;
const LightningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;

const BottomNav = () => {
    const { isAuthenticated } = useSelector(state => state.auth);
    const location = useLocation();
    const { band } = useGradeBand();
    const { t } = useTranslation();

    // Only show bottom nav for authenticated users on mobile/tablet
    if (!isAuthenticated) return null;

    const navItems = [
        { name: t('nav.home') || 'Home', path: '/', icon: <HomeIcon /> },
        { name: t('nav.topics') || 'Topics', path: '/topics', icon: <BookIcon /> },
        { name: t('nav.games') || 'Games', path: '/games', icon: <GamepadIcon /> },
        { name: t('nav.experiments') || 'Labs', path: '/experiments', icon: <FlaskIcon /> },
        { name: t('nav.quizzes') || 'Quizzes', path: '/quizzes', icon: <LightningIcon /> },
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
