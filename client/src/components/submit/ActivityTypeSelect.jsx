import React from 'react';
import { motion } from 'framer-motion';

const ActivityTypeSelect = ({ formData, handleChange, ACTIVITY_TYPES, selectedActivity }) => {
    return (
        <div className="relative z-20">
            <label className="block text-[var(--t2)] font-ui font-bold text-xs uppercase tracking-widest mb-2">
                Activity Type <span className="text-[var(--red)]">*</span>
            </label>
            <div className="relative">
                <select
                    name="activityType"
                    value={formData.activityType}
                    onChange={handleChange}
                    className="w-full bg-[var(--s2)] border border-[var(--b2)] text-[var(--t1)] font-ui px-4 py-3 rounded-xl focus:outline-none focus:border-[var(--v1)] focus:ring-1 focus:ring-[var(--v1)] transition-colors appearance-none cursor-pointer"
                >
                    <option value="" disabled className="text-[var(--t3)]">-- Select an Eco-Activity --</option>
                    {ACTIVITY_TYPES.map(type => (
                        <option key={type.value} value={type.value} className="bg-[var(--s1)] py-2">
                            {type.label}
                        </option>
                    ))}
                </select>

                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[var(--t2)]">
                    ▼
                </div>
            </div>

            {selectedActivity && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3 bg-[rgba(0,255,136,0.05)] border border-[rgba(0,255,136,0.2)] rounded-lg flex items-start gap-3"
                >
                    <span className="text-xl">✨</span>
                    <div>
                        <p className="text-sm text-[var(--t1)] font-ui">
                            <span className="font-bold text-[var(--g1)]">Estimated Impact:</span> {selectedActivity.impactNote}
                        </p>
                        <p className="text-[10px] text-[var(--t3)] mt-1">Impact applied upon teacher verification</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ActivityTypeSelect;
