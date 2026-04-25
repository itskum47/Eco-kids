import React from 'react';

const ActivityFeed = ({ activities = [] }) => {
    const feedItems = activities || [];

    return (
        <div className="mt-8">
            <h3 className="font-ui font-bold text-[13px] text-[var(--t1)] mb-4 px-2">Recent Activity</h3>

            <div className="flex flex-col gap-3">
                {feedItems.length === 0 ? (
                    <div className="eco-card p-4 text-sm text-[var(--t3)] border border-dashed border-[var(--s2)]">
                        No verified activity yet. The feed will populate after the first submission.
                    </div>
                ) : (
                    feedItems.map(item => (
                    <div
                        key={item.id}
                        className={`eco-card p-4 flex gap-4 overflow-hidden border-l-4 ${item.status === 'approved' ? 'border-l-[var(--g1)]' :
                                item.status === 'pending' ? 'border-l-[var(--amber)]' :
                                    'border-l-[var(--red)]'
                            }`}
                    >
                        {/* Icon */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--bg)] flex items-center justify-center text-xl">
                            {item.icon}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-ui font-bold text-sm text-[var(--t1)] truncate pr-2">
                                    {item.type}
                                </h4>
                                {item.status === 'approved' && (
                                    <span className="font-mono text-[11px] font-bold text-[var(--g1)] whitespace-nowrap">
                                        {item.points} XP
                                    </span>
                                )}
                                {item.status === 'pending' && (
                                    <span className="font-mono text-[10px] text-[var(--amber)] flex items-center gap-1 whitespace-nowrap">
                                        <span className="animate-spin w-2 h-2 border border-t-[var(--amber)] rounded-full" /> Pending
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-[var(--t3)]">
                                <span>{item.timestamp}</span>
                            </div>

                            {/* Status specific details */}
                            {item.status === 'approved' && item.teacher && (
                                <p className="text-[11px] text-[var(--t2)] mt-1.5 flex items-center gap-1">
                                    <span className="text-[var(--g1)]">✓</span> Approved by {item.teacher}
                                </p>
                            )}
                            {item.status === 'rejected' && item.feedback && (
                                <p className="text-[11px] text-[var(--red)] font-medium mt-1.5 bg-[rgba(255,64,96,0.1)] px-2 py-1.5 rounded-md inline-block">
                                    <span className="mr-1">⚠️</span> {item.feedback}
                                </p>
                            )}
                        </div>
                    </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
