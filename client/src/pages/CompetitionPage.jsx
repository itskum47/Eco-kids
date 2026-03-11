import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaTrophy, FaLeaf, FaRecycle, FaTint, FaBolt, FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../utils/api';

const TABS = ['Students', 'Schools', 'Districts', 'State'];

const CompetitionPage = () => {
  const { user } = useSelector(state => state.auth);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('Students');
  const [leaderboard, setLeaderboard] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const limit = activeTab === 'Students' ? 0 : 50;

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, offset]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      let response;
      const params = `?limit=${limit}&offset=${offset}`;

      switch (activeTab) {
        case 'Schools':
          response = await apiRequest(`/competition/schools${params}`);
          break;
        case 'Districts':
          response = await apiRequest(`/competition/districts${params}`);
          break;
        case 'State':
          response = await apiRequest(`/competition/states${params}`);
          break;
        default:
          response = await apiRequest(`/competition/students${params}${user?._id ? `&userId=${user._id}` : ''}`);
      }

      if (activeTab === 'Students' && user?._id) {
        setStudentData(response.data);
      } else {
        setLeaderboard(response.data || []);
      }
      setTotal(response.total || 0);
    } catch (error) {
      console.error(`Error loading ${activeTab} leaderboard:`, error);
      setLeaderboard([]);
      setStudentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTableHeaders = () => {
    const baseHeaders = [t('leaderboard.rank'), t('leaderboard.student'), 'CO₂ ' + (t('stats.co2') || 'Prevented'), t('stats.trees'), t('waste_title') || 'Plastic Reduced', t('topics.questionsCount', { count: '' }).replace('  ', '').trim() || 'Activities'];

    if (activeTab === 'Schools') {
      return ['Rank', 'School', 'CO₂ Prevented', 'Trees', 'Plastic Reduced', 'Students'];
    }
    if (activeTab === 'Districts') {
      return ['Rank', 'District', 'CO₂ Prevented', 'Trees', 'Plastic Reduced', 'Students'];
    }
    if (activeTab === 'State') {
      return ['Rank', 'State', 'CO₂ Prevented', 'Trees', 'Plastic Reduced', 'Students'];
    }
    return baseHeaders;
  };

  const renderTableRow = (item) => {
    if (activeTab === 'Schools') {
      return (
        <tr key={item.rank} className="border-b border-slate-200 hover:bg-slate-50">
          <td className="px-6 py-3 text-sm font-semibold text-slate-900">{item.rank}</td>
          <td className="px-6 py-3 text-sm text-slate-700">{item.schoolName}</td>
          <td className="px-6 py-3 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1">
              <FaLeaf className="text-emerald-600" />
              {item.co2Prevented.toFixed(2)} kg
            </span>
          </td>
          <td className="px-6 py-3 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1">
              <FaRecycle className="text-emerald-600" />
              {item.treesPlanted}
            </span>
          </td>
          <td className="px-6 py-3 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1">
              <FaTint className="text-blue-600" />
              {item.plasticReduced.toFixed(2)} kg
            </span>
          </td>
          <td className="px-6 py-3 text-sm font-medium text-slate-900">{item.studentCount}</td>
        </tr>
      );
    }

    if (activeTab === 'Districts') {
      return (
        <tr key={item.rank} className="border-b border-slate-200 hover:bg-slate-50">
          <td className="px-6 py-3 text-sm font-semibold text-slate-900">{item.rank}</td>
          <td className="px-6 py-3 text-sm text-slate-700">{item.districtName}</td>
          <td className="px-6 py-3 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1">
              <FaLeaf className="text-emerald-600" />
              {item.co2Prevented.toFixed(2)} kg
            </span>
          </td>
          <td className="px-6 py-3 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1">
              <FaRecycle className="text-emerald-600" />
              {item.treesPlanted}
            </span>
          </td>
          <td className="px-6 py-3 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1">
              <FaTint className="text-blue-600" />
              {item.plasticReduced.toFixed(2)} kg
            </span>
          </td>
          <td className="px-6 py-3 text-sm font-medium text-slate-900">{item.studentCount}</td>
        </tr>
      );
    }

    if (activeTab === 'State') {
      return (
        <tr key={item.rank} className="border-b border-slate-200 hover:bg-slate-50">
          <td className="px-6 py-3 text-sm font-semibold text-slate-900">{item.rank}</td>
          <td className="px-6 py-3 text-sm text-slate-700">{item.stateName}</td>
          <td className="px-6 py-3 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1">
              <FaLeaf className="text-emerald-600" />
              {item.co2Prevented.toFixed(2)} kg
            </span>
          </td>
          <td className="px-6 py-3 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1">
              <FaRecycle className="text-emerald-600" />
              {item.treesPlanted}
            </span>
          </td>
          <td className="px-6 py-3 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1">
              <FaTint className="text-blue-600" />
              {item.plasticReduced.toFixed(2)} kg
            </span>
          </td>
          <td className="px-6 py-3 text-sm font-medium text-slate-900">{item.studentCount}</td>
        </tr>
      );
    }

    const isCurrentUser = item.id === user?._id;
    return (
      <tr key={item.id || item.rank} className={`border-b border-slate-200 transition-colors ${isCurrentUser ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'hover:bg-slate-50'
        }`}>
        <td className="px-6 py-3 text-sm font-semibold text-slate-900">{item.rank}</td>
        <td className="px-6 py-3 text-sm text-slate-700 font-medium">
          {item.name} {isCurrentUser && <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{t('leaderboard.youLabel')}</span>}
        </td>
        <td className="px-6 py-3 text-sm text-slate-700">
          <span className="inline-flex items-center gap-1">
            <FaLeaf className="text-emerald-600" />
            {item.co2Prevented.toFixed(2)} kg
          </span>
        </td>
        <td className="px-6 py-3 text-sm text-slate-700">
          <span className="inline-flex items-center gap-1">
            <FaRecycle className="text-emerald-600" />
            {item.treesPlanted}
          </span>
        </td>
        <td className="px-6 py-3 text-sm text-slate-700">
          <span className="inline-flex items-center gap-1">
            <FaTint className="text-blue-600" />
            {item.plasticReduced.toFixed(2)} kg
          </span>
        </td>
        <td className="px-6 py-3 text-sm font-medium text-slate-900">{item.activitiesCompleted}</td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-eraser text-slate-900 mb-2 flex items-center gap-3">
            <FaTrophy className="text-amber-500" />
            Competition Leaderboards
          </h1>
          <p className="text-lg text-slate-600">
            {t('leaderboard.subtitle')}
          </p>
        </div>

        <div className="bg-[var(--s1)] rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-200">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setOffset(0);
                }}
                className={`flex-1 px-6 py-4 text-center font-semibold transition ${activeTab === tab
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b-2 border-slate-200">
                <tr>
                  {renderTableHeaders().map(header => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-sm font-semibold text-slate-900"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      {t('loading.leaderboard')}
                    </td>
                  </tr>
                ) : activeTab === 'Students' && studentData ? (
                  <>
                    {studentData.topLeaders.map(item => renderTableRow(item))}
                    {studentData.neighborhood && studentData.neighborhood.length > 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-2 text-center text-slate-400 bg-slate-50/50">
                          <span className="text-xl tracking-widest leading-none">...</span>
                        </td>
                      </tr>
                    )}
                    {studentData.neighborhood && studentData.neighborhood.map(item => renderTableRow(item))}
                  </>
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      {t('empty.leaderboard')}
                    </td>
                  </tr>
                ) : (
                  leaderboard.map(item => renderTableRow(item))
                )}
              </tbody>
            </table>
          </div>

          {activeTab !== 'Students' && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Showing {leaderboard.length > 0 ? offset + 1 : 0}-
                {Math.min(offset + limit, total)} of {total} entries
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors"
                >
                  {t('leaderboard.podium_3rd') ? 'Previous' : 'Previous'}
                </button>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionPage;
