import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  FaTree,
  FaTint,
  FaLeaf,
  FaBolt,
  FaRecycle,
  FaGlobeAmericas,
  FaSkullCrossbones
} from 'react-icons/fa';

/**
 * Environmental Impact Page
 * Displays user's environmental impact metrics and global statistics
 */
export default function EnvironmentalImpactPage() {
  const [userImpact, setUserImpact] = useState(null);
  const [globalImpact, setGlobalImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchImpactData();
  }, []);

  const fetchImpactData = async () => {
    try {
      setLoading(true);

      // Fetch user's personal impact
      const userRes = await axios.get('/api/impact/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserImpact(userRes.data.data);

      // Fetch global impact statistics
      const globalRes = await axios.get('/api/impact/global');
      setGlobalImpact(globalRes.data.data);
    } catch (error) {
      console.error('Error fetching impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">🌍 Your Environmental Impact</h1>
          <p className="text-green-50 text-lg">
            Every action counts. Here's the measurable difference you're making.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex gap-4 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-6 font-semibold transition ${
              activeTab === 'personal'
                ? 'text-green-600 border-b-4 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            Your Impact
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`py-3 px-6 font-semibold transition ${
              activeTab === 'global'
                ? 'text-green-600 border-b-4 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            Global Impact
          </button>
        </div>
      </div>

      {/* Personal Impact Section */}
      {activeTab === 'personal' && userImpact && (
        <div className="max-w-6xl mx-auto">
          {/* Main Impact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Trees Planted */}
            <ImpactCard
              icon={<FaTree className="text-3xl text-green-600" />}
              title="Trees Planted"
              value={userImpact.environmentalImpact.treesPlanted}
              unit="trees"
              bgColor="bg-green-50"
              borderColor="border-green-200"
            />

            {/* CO2 Prevented */}
            <ImpactCard
              icon={<FaSkullCrossbones className="text-3xl text-purple-600" />}
              title="CO₂ Prevented"
              value={Math.round(userImpact.environmentalImpact.co2Prevented * 100) / 100}
              unit="kg"
              bgColor="bg-purple-50"
              borderColor="border-purple-200"
            />

            {/* Water Saved */}
            <ImpactCard
              icon={<FaTint className="text-3xl text-blue-600" />}
              title="Water Saved"
              value={Math.round(userImpact.environmentalImpact.waterSaved * 100) / 100}
              unit="litres"
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
            />

            {/* Plastic Reduced */}
            <ImpactCard
              icon={<FaRecycle className="text-3xl text-amber-600" />}
              title="Plastic Reduced"
              value={Math.round(userImpact.environmentalImpact.plasticReduced * 100) / 100}
              unit="kg"
              bgColor="bg-amber-50"
              borderColor="border-amber-200"
            />

            {/* Energy Saved */}
            <ImpactCard
              icon={<FaBolt className="text-3xl text-yellow-600" />}
              title="Energy Saved"
              value={Math.round(userImpact.environmentalImpact.energySaved * 100) / 100}
              unit="kWh"
              bgColor="bg-yellow-50"
              borderColor="border-yellow-200"
            />

            {/* Activities Completed */}
            <ImpactCard
              icon={<FaGlobeAmericas className="text-3xl text-teal-600" />}
              title="Activities Completed"
              value={userImpact.environmentalImpact.activitiesCompleted}
              unit="activities"
              bgColor="bg-teal-50"
              borderColor="border-teal-200"
            />
          </div>

          {/* Real-World Equivalents Section */}
          {userImpact.equivalents && (
            <div className="bg-[var(--s1)] rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                🎯 Real-World Impact Equivalents
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Cars Off Road */}
                <EquivalentCard
                  icon="🚗"
                  title="Cars Off Road"
                  value={userImpact.equivalents.equivalentCarsOffRoad}
                  description="for 1 day"
                />

                {/* Showering Hours Saved */}
                <EquivalentCard
                  icon="🚿"
                  title="Showers Avoided"
                  value={userImpact.equivalents.equivalentShowersAvoided}
                  description="(~5 minutes each)"
                />

                {/* Plastic Bottles Avoided */}
                <EquivalentCard
                  icon="🍾"
                  title="Plastic Bottles Avoided"
                  value={userImpact.equivalents.equivalentPlasticBottlesAvoided}
                  description="(500ml bottles)"
                />

                {/* Households + Energy */}
                <EquivalentCard
                  icon="🏠"
                  title="Households (1 day energy)"
                  value={userImpact.equivalents.equivalentHouseholdsDayEnergy}
                  description="average consumption"
                />

                {/* Flight Hours */}
                <EquivalentCard
                  icon="✈️"
                  title="Flights Avoided"
                  value={userImpact.equivalents.equivalentAirflightsAvoided}
                  description="round trip"
                />

                {/* Trees Needed to Offset */}
                <EquivalentCard
                  icon="🌳"
                  title="Trees Equivalent"
                  value={userImpact.equivalents.equivalentTreesNeededToOffset}
                  description="for full offset"
                />
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-center text-gray-600 text-sm">
            Last updated:{' '}
            {new Date(userImpact.environmentalImpact.lastImpactUpdate).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Global Impact Section */}
      {activeTab === 'global' && globalImpact && (
        <div className="max-w-6xl mx-auto">
          {/* Global Stats Header */}
          <div className="bg-[var(--s1)] rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🌎 Community Environmental Impact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <GlobalStatCard
                icon="🌍"
                title="Total CO₂ Prevented"
                value={Math.round(globalImpact.globalImpact.co2Prevented * 100) / 100}
                unit="kg"
              />

              <GlobalStatCard
                icon="🌳"
                title="Trees Planted"
                value={globalImpact.globalImpact.treesPlanted}
                unit="trees"
              />

              <GlobalStatCard
                icon="💧"
                title="Water Saved"
                value={Math.round(globalImpact.globalImpact.waterSaved * 100) / 100}
                unit="litres"
              />

              <GlobalStatCard
                icon="♻️"
                title="Plastic Reduced"
                value={Math.round(globalImpact.globalImpact.plasticReduced * 100) / 100}
                unit="kg"
              />

              <GlobalStatCard
                icon="⚡"
                title="Energy Saved"
                value={Math.round(globalImpact.globalImpact.energySaved * 100) / 100}
                unit="kWh"
              />

              <GlobalStatCard
                icon="👥"
                title="Students Participating"
                value={globalImpact.globalImpact.studentsParticipating}
                unit="students"
              />
            </div>
          </div>

          {/* Global Equivalents */}
          {globalImpact.equivalents && (
            <div className="bg-[var(--s1)] rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Global Impact Equivalents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EquivalentCard
                  icon="🚗"
                  title="Cars Off Road"
                  value={globalImpact.equivalents.equivalentCarsOffRoad}
                  description="for 1 year"
                />

                <EquivalentCard
                  icon="✈️"
                  title="Flights Avoided"
                  value={globalImpact.equivalents.equivalentAirflightsAvoided}
                  description="round trip flights"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ImpactCard Component
 * Displays individual impact metric
 */
function ImpactCard({ icon, title, value, unit, bgColor, borderColor }) {
  return (
    <div
      className={`${bgColor} border-l-4 ${borderColor} rounded-lg shadow-md p-6 hover:shadow-lg transition`}
    >
      <div className="flex items-center gap-4 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-1">{value}</div>
      <p className="text-gray-600 text-sm">{unit}</p>
    </div>
  );
}

/**
 * EquivalentCard Component
 * Displays real-world equivalents
 */
function EquivalentCard({ icon, title, value, description }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition">
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
      <div className="text-2xl font-bold text-green-600 mb-1">{value}</div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

/**
 * GlobalStatCard Component
 * Displays global statistics
 */
function GlobalStatCard({ icon, title, value, unit }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
      <div className="text-3xl font-bold text-green-600 mb-1">{value}</div>
      <p className="text-gray-600 text-sm">{unit}</p>
    </div>
  );
}
