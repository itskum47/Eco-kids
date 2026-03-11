import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-[#e8f5e9] shadow-sm animate-pulse w-full">
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-3 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="h-16 bg-gray-50 rounded-xl border border-gray-100"></div>
                <div className="h-16 bg-gray-50 rounded-xl border border-gray-100"></div>
                <div className="h-16 bg-gray-50 rounded-xl border border-gray-100"></div>
            </div>

            <div className="space-y-4">
                <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
                <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
