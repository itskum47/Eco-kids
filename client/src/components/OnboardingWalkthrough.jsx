import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Leaf, Trophy, Upload, BookOpen, Sparkles } from 'lucide-react';

const steps = [
    {
        icon: Leaf,
        title: 'Welcome to EcoKids! 🌏',
        description: 'You\'re about to join thousands of students making a real environmental impact across India.',
        color: 'from-emerald-500 to-teal-500',
        tip: 'Earn Eco-Points by completing real-world environmental activities!'
    },
    {
        icon: Upload,
        title: 'Submit Activities 📸',
        description: 'Plant trees, recycle waste, save water — then snap a photo and submit it for teacher verification.',
        color: 'from-blue-500 to-cyan-500',
        tip: 'GPS location is required to verify your activity is real.'
    },
    {
        icon: Trophy,
        title: 'Climb the Leaderboard 🏆',
        description: 'Earn points, unlock badges, maintain streaks. Compete with your school and across districts!',
        color: 'from-amber-500 to-orange-500',
        tip: 'Keep a 7-day streak for bonus points!'
    },
    {
        icon: BookOpen,
        title: 'Learn & Explore 📚',
        description: 'Take quizzes, run experiments, and complete weekly missions. Every action teaches something new.',
        color: 'from-purple-500 to-pink-500',
        tip: 'Complete all missions in a week for the Perfect Week badge!'
    },
    {
        icon: Sparkles,
        title: 'You\'re Ready! ✨',
        description: 'Start with your first eco-activity. Every small action creates big change.',
        color: 'from-emerald-500 to-green-500',
        tip: 'Your first submission is waiting!'
    }
];

const OnboardingWalkthrough = ({ onComplete, userName = 'Eco Warrior' }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Check if onboarding was already completed
        const completed = localStorage.getItem('ecokids_onboarding_done');
        if (completed === 'true') {
            setIsVisible(false);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('ecokids_onboarding_done', 'true');
        setIsVisible(false);
        onComplete?.();
    };

    const handleSkip = () => {
        handleComplete();
    };

    if (!isVisible) return null;

    const step = steps[currentStep];
    const StepIcon = step.icon;
    const isLast = currentStep === steps.length - 1;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleSkip} role="button" tabIndex={0} aria-label="Close Walkthrough" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSkip()} />

                {/* Modal */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-950
                     border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
                >
                    {/* Skip button */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-[var(--s1)]/5 text-white/40
                       hover:text-white hover:bg-[var(--s1)]/10 transition-colors z-10"
                        aria-label="Skip onboarding"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Icon header */}
                    <div className={`flex items-center justify-center py-8 bg-gradient-to-r ${step.color} bg-opacity-10`}>
                        <div className={`p-4 rounded-2xl bg-gradient-to-r ${step.color} shadow-lg`}>
                            <StepIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 text-center">
                        {currentStep === 0 && (
                            <p className="text-emerald-400 text-sm font-medium mb-2">
                                Hey {userName}! 👋
                            </p>
                        )}
                        <h2 className="text-xl font-bold text-white mb-3">{step.title}</h2>
                        <p className="text-white/60 text-sm leading-relaxed mb-4">{step.description}</p>

                        {/* Tip box */}
                        <div className="bg-[var(--s1)]/[0.03] border border-white/5 rounded-xl px-4 py-3">
                            <p className="text-xs text-emerald-400 font-medium">💡 Pro Tip</p>
                            <p className="text-xs text-white/50 mt-1">{step.tip}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 flex items-center justify-between">
                        {/* Progress dots */}
                        <div className="flex gap-1.5">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-emerald-400' : 'w-1.5 bg-[var(--s1)]/20'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <button
                                    onClick={handlePrev}
                                    className="p-2 rounded-lg bg-[var(--s1)]/5 text-white/60 hover:bg-[var(--s1)]/10 transition-colors"
                                    aria-label="Previous step"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                  bg-gradient-to-r ${step.color} text-white
                  hover:opacity-90 transition-opacity`}
                            >
                                {isLast ? 'Get Started' : 'Next'}
                                {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingWalkthrough;
