import React from 'react';
import { motion } from 'framer-motion';

const isDev = import.meta.env.DEV;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#f9fffe] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md w-full bg-white rounded-2xl shadow-[0_8px_30px_rgba(46,125,50,0.12)] p-8 text-center border border-[#e8f5e9]"
                    >
                        <div className="text-6xl mb-4">🌱</div>
                        <h1 className="text-2xl font-black text-[#064e17] mb-3">Oops! A little snag</h1>
                        <p className="text-[#4a7a4a] mb-6 leading-relaxed text-sm">
                            We encountered a small issue while growing this page. Refreshing usually helps water the roots!
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm w-full"
                        >
                            Refresh Page
                        </button>
                        {isDev && this.state.error && (
                            <div className="mt-6 pt-4 border-t border-[#e8f5e9] text-left">
                                <p className="text-xs text-red-500 font-mono break-words">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
