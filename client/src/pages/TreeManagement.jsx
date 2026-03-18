import React, { useState } from 'react';
import TreePlantingTask from '../components/TreePlantingTask';
import TreeTracker from '../components/TreeTracker';

const TABS = {
  myTrees: 'my-trees',
  plantTree: 'plant-tree'
};

export default function TreeManagement() {
  const [activeTab, setActiveTab] = useState(TABS.myTrees);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePlanted = () => {
    setRefreshTrigger((value) => value + 1);
    setActiveTab(TABS.myTrees);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-md">
          <h1 className="text-2xl font-extrabold text-slate-900">Tree Management</h1>
          <p className="mt-1 text-sm text-slate-600">Plant native trees, submit follow-up checks, and monitor your ecological impact.</p>

          <div className="mt-5 inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab(TABS.myTrees)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === TABS.myTrees ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              My Trees
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(TABS.plantTree)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === TABS.plantTree ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Plant New Tree
            </button>
          </div>
        </div>

        {activeTab === TABS.myTrees ? (
          <TreeTracker key={`tracker-${refreshTrigger}`} />
        ) : (
          <TreePlantingTask onSuccess={handlePlanted} />
        )}
      </div>
    </div>
  );
}