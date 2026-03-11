import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Eye, Loader } from 'lucide-react';

const PrincipalReportPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // summary, activities, impact, recommendations
  const [presentMode, setPresentMode] = useState(false);

  // Fetch report summary on mount or when month/year changes
  useEffect(() => {
    loadReportSummary();
  }, [selectedMonth, selectedYear]);

  const loadReportSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/v1/reports/principal/summary?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        setError(data.message || 'Failed to load report');
      }
    } catch (err) {
      setError(err.message || 'Error loading report');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/reports/principal/generate-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Report_${selectedMonth}_${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/v1/reports/principal/export-csv?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Report_${selectedMonth}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `School Report - ${reportData?.period.monthName} ${reportData?.period.year}`,
          text: `Environmental activities: ${reportData?.metrics.totalActivities}, NEP Score: ${reportData?.metrics.nepComplianceScore}`,
          url: window.location.href
        });
      } catch (err) {
      }
    } else {
      // Fallback: Copy to clipboard
      const text = `School Report: ${reportData?.metrics.totalActivities} activities, NEP: ${reportData?.metrics.nepComplianceScore}/100`;
      navigator.clipboard.writeText(text);
      alert('Report summary copied to clipboard');
    }
  };

  if (presentMode) {
    return (
      <PresentationMode
        reportData={reportData}
        onExit={() => setPresentMode(false)}
        month={selectedMonth}
        year={selectedYear}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-display font-bold text-[var(--t1)] mb-2">
            📊 Principal's Report Dashboard
          </h1>
          <p className="text-[var(--t2)] text-lg">
            Environmental engagement metrics, impact assessment, and NEP compliance tracking
          </p>
        </motion.div>

        {/* Report Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="eco-card p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Month Selector */}
            <div>
              <label className="block text-sm font-ui text-[var(--t2)] mb-2">
                📅 Report Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--b2)] rounded-lg p-3 text-[var(--t1)] font-ui text-sm focus:ring-2 focus:ring-[var(--v1)] outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {new Date(2024, m - 1).toLocaleString('en-US', {
                      month: 'long'
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div>
              <label className="block text-sm font-ui text-[var(--t2)] mb-2">
                📆 Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--b2)] rounded-lg p-3 text-[var(--t1)] font-ui text-sm focus:ring-2 focus:ring-[var(--v1)] outline-none"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 items-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleGeneratePDF}
                disabled={loading || !reportData}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleExportCSV}
                disabled={loading || !reportData}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                📋 CSV
              </motion.button>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-[var(--b2)]">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--b1)]/50 hover:bg-[var(--b2)] rounded-lg text-sm font-ui text-[var(--t1)] transition"
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setPresentMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--v1)]/10 hover:bg-[var(--v1)]/20 rounded-lg text-sm font-ui text-[var(--v1)] transition"
            >
              <Eye className="w-4 h-4" />
              Present
            </motion.button>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-[rgba(255,64,96,0.1)] border border-[rgba(255,64,96,0.3)] p-4 rounded-xl text-[var(--red)] text-sm font-ui flex items-center gap-2"
            >
              <span>⚠️</span> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 border-4 border-[var(--s2)] border-t-[var(--v1)] rounded-full animate-spin mb-4" />
            <p className="font-ui text-[var(--t2)] text-sm font-bold">
              Loading report...
            </p>
          </motion.div>
        )}

        {/* Report Content */}
        {!loading && reportData && (
          <>
            {/* Key Metrics Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              {[
                {
                  label: 'Total Activities',
                  value: reportData.metrics.totalActivities,
                  icon: '🌱'
                },
                {
                  label: 'Active Students',
                  value: reportData.metrics.activeStudents,
                  icon: '👥'
                },
                {
                  label: 'Engagement Rate',
                  value: reportData.metrics.participationRate,
                  icon: '📈'
                },
                {
                  label: 'NEP Score',
                  value: `${reportData.metrics.nepComplianceScore}/100`,
                  icon: '✅'
                }
              ].map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="eco-card p-4 text-center"
                >
                  <div className="text-3xl mb-2">{metric.icon}</div>
                  <div className="text-2xl font-display font-bold text-[var(--v1)] mb-1">
                    {metric.value}
                  </div>
                  <div className="text-xs font-ui text-[var(--t2)]">
                    {metric.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 mb-6 border-b border-[var(--b2)]"
            >
              {[
                { id: 'summary', label: '📊 Summary', icon: '📊' },
                { id: 'activities', label: '🌿 Activities', icon: '🌿' },
                { id: 'impact', label: '💚 Environmental Impact', icon: '💚' },
                { id: 'recommendations', label: '💡 Recommendations', icon: '💡' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-ui text-sm font-bold transition-colors ${
                    activeTab === tab.id
                      ? 'text-[var(--v1)] border-b-2 border-[var(--v1)]'
                      : 'text-[var(--t2)] hover:text-[var(--t1)]'
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'summary' && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="eco-card p-8"
                >
                  <h2 className="text-2xl font-display font-bold text-[var(--t1)] mb-6">
                    Report Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-ui text-[var(--t2)] mb-2">School</p>
                      <p className="text-lg font-bold text-[var(--t1)]">
                        {reportData.schoolName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-ui text-[var(--t2)] mb-2">UDISE Code</p>
                      <p className="text-lg font-bold text-[var(--t1)]">
                        {reportData.udiseCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-ui text-[var(--t2)] mb-2">Period</p>
                      <p className="text-lg font-bold text-[var(--t1)]">
                        {reportData.period.monthName} {reportData.period.year}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-ui text-[var(--t2)] mb-2">
                        Teachers Engaged
                      </p>
                      <p className="text-lg font-bold text-[var(--t1)]">
                        {reportData.metrics.engagedTeachers}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'activities' && (
                <motion.div
                  key="activities"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="eco-card p-8"
                >
                  <h2 className="text-2xl font-display font-bold text-[var(--t1)] mb-6">
                    Activity Breakdown
                  </h2>
                  <div className="space-y-3">
                    {Object.entries(reportData.activityBreakdown).map(
                      ([activity, count]) => (
                        <div key={activity} className="flex items-center justify-between">
                          <span className="font-ui text-[var(--t1)]">
                            {activity.replace(/-/g, ' ').charAt(0).toUpperCase() +
                              activity.replace(/-/g, ' ').slice(1)}
                          </span>
                          <div className="flex items-center gap-4">
                            <div className="w-32 bg-[var(--b2)] rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[var(--v1)] to-[var(--s1)]"
                                style={{
                                  width: `${(count / reportData.metrics.totalActivities) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-bold text-[var(--t2)] w-12 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'impact' && (
                <motion.div
                  key="impact"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="eco-card p-8"
                >
                  <h2 className="text-2xl font-display font-bold text-[var(--t1)] mb-6">
                    Environmental Impact
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        label: '🌱 Trees Planted',
                        value: reportData.environmentalImpact.treesPlanted,
                        unit: 'trees'
                      },
                      {
                        label: '💨 CO2 Prevented',
                        value: reportData.environmentalImpact.co2Prevented.toFixed(1),
                        unit: 'kg'
                      },
                      {
                        label: '💧 Water Saved',
                        value: reportData.environmentalImpact.waterSaved.toFixed(1),
                        unit: 'liters'
                      },
                      {
                        label: '♻️ Plastic Reduced',
                        value: reportData.environmentalImpact.plasticReduced.toFixed(1),
                        unit: 'kg'
                      },
                      {
                        label: '⚡ Energy Saved',
                        value: reportData.environmentalImpact.energySaved.toFixed(1),
                        unit: 'kWh'
                      }
                    ].map((impact, idx) => (
                      <div key={idx} className="bg-[var(--bg-secondary)] p-4 rounded-lg">
                        <p className="text-2xl mb-2">{impact.label.split(' ')[0]}</p>
                        <p className="text-3xl font-bold text-[var(--v1)] mb-1">
                          {impact.value}
                        </p>
                        <p className="text-xs font-ui text-[var(--t2)]">
                          {impact.label.split(' ').slice(1).join(' ')} ({impact.unit})
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'recommendations' && (
                <motion.div
                  key="recommendations"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="eco-card p-8"
                >
                  <h2 className="text-2xl font-display font-bold text-[var(--t1)] mb-6">
                    Recommendations for Improvement
                  </h2>
                  <div className="space-y-4">
                    {reportData.metrics.totalActivities < reportData.metrics.activeStudents * 0.5 && (
                      <div className="border-l-4 border-[var(--warning)] bg-[rgba(255,193,7,0.1)] p-4 rounded">
                        <p className="font-bold text-[var(--t1)] mb-1">
                          📢 Increase Student Participation
                        </p>
                        <p className="text-sm text-[var(--t2)]">
                          Current engagement is below target. Consider conducting awareness assemblies and incentivizing activity submissions.
                        </p>
                      </div>
                    )}
                    {Object.keys(reportData.activityBreakdown).length < 5 && (
                      <div className="border-l-4 border-[var(--info)] bg-[rgba(33,150,243,0.1)] p-4 rounded">
                        <p className="font-bold text-[var(--t1)] mb-1">
                          🌍 Diversify Activities
                        </p>
                        <p className="text-sm text-[var(--t2)]">
                          Only {Object.keys(reportData.activityBreakdown).length} activity types documented. Introduce tree planting, waste audits, and water conservation drives.
                        </p>
                      </div>
                    )}
                    {reportData.metrics.nepComplianceScore < 85 && (
                      <div className="border-l-4 border-[var(--success)] bg-[rgba(76,175,80,0.1)] p-4 rounded">
                        <p className="font-bold text-[var(--t1)] mb-1">
                          📚 Strengthen NEP Integration
                        </p>
                        <p className="text-sm text-[var(--t2)]">
                          Include competency-based assessments and learning outcomes tracking in activity submissions.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Presentation Mode Component
 * Full-screen slideshow for presentations to stakeholders
 */
const PresentationMode = ({ reportData, onExit, month, year }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    // Title Slide
    {
      type: 'title',
      title: "Principal's Report",
      subtitle: `${reportData?.period?.monthName} ${reportData?.period?.year}`,
      content: reportData?.schoolName
    },
    // Key Metrics Slide
    {
      type: 'metrics',
      title: 'Key Performance Indicators',
      metrics: [
        { icon: '🌱', label: 'Activities', value: reportData?.metrics?.totalActivities },
        { icon: '👥', label: 'Active Students', value: reportData?.metrics?.activeStudents },
        { icon: '📈', label: 'Engagement', value: reportData?.metrics?.participationRate },
        {
          icon: '✅',
          label: 'NEP Score',
          value: `${reportData?.metrics?.nepComplianceScore}/100`
        }
      ]
    },
    // Environmental Impact Slide
    {
      type: 'impact',
      title: 'Environmental Impact Achieved',
      impacts: [
        {
          emoji: '🌱',
          label: 'Trees Planted',
          value: reportData?.environmentalImpact?.treesPlanted
        },
        {
          emoji: '💨',
          label: 'CO2 Prevented',
          value: `${reportData?.environmentalImpact?.co2Prevented?.toFixed(1)} kg`
        },
        {
          emoji: '💧',
          label: 'Water Saved',
          value: `${reportData?.environmentalImpact?.waterSaved?.toFixed(1)} L`
        },
        {
          emoji: '♻️',
          label: 'Plastic Reduced',
          value: `${reportData?.environmentalImpact?.plasticReduced?.toFixed(1)} kg`
        }
      ]
    },
    // Activity Breakdown Slide
    {
      type: 'activities',
      title: 'Activity Breakdown',
      activities: reportData?.activityBreakdown
    },
    // Closing Slide
    {
      type: 'closing',
      title: 'Thank You!',
      subtitle: 'Together, we are building an eco-conscious generation',
      footer: 'EcoKids India | Environmental Education Platform'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black z-[10000] flex flex-col items-center justify-center p-8">
      {/* Slide Content */}
      <motion.div
        key={slide}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full h-full flex items-center justify-center"
      >
        {slides[slide].type === 'title' && (
          <div className="text-center">
            <h1 className="text-7xl font-display font-bold text-white mb-4">
              {slides[slide].title}
            </h1>
            <p className="text-5xl text-green-400 mb-8">
              {slides[slide].subtitle}
            </p>
            <p className="text-3xl text-gray-300">{slides[slide].content}</p>
          </div>
        )}

        {slides[slide].type === 'metrics' && (
          <div className="w-full">
            <h1 className="text-6xl font-bold text-white mb-16 text-center">
              {slides[slide].title}
            </h1>
            <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto">
              {slides[slide].metrics.map((m, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur p-8 rounded-2xl text-center">
                  <div className="text-6xl mb-4">{m.icon}</div>
                  <div className="text-5xl font-bold text-green-400 mb-2">
                    {m.value}
                  </div>
                  <div className="text-2xl text-white">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {slides[slide].type === 'impact' && (
          <div className="w-full">
            <h1 className="text-6xl font-bold text-white mb-16 text-center">
              {slides[slide].title}
            </h1>
            <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto">
              {slides[slide].impacts.map((impact, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur p-8 rounded-2xl text-center">
                  <div className="text-6xl mb-4">{impact.emoji}</div>
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {impact.value}
                  </div>
                  <div className="text-2xl text-white">{impact.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {slides[slide].type === 'activities' && (
          <div className="w-full">
            <h1 className="text-6xl font-bold text-white mb-16 text-center">
              {slides[slide].title}
            </h1>
            <div className="max-w-4xl mx-auto space-y-6">
              {Object.entries(slides[slide].activities || {}).map(([activity, count]) => (
                <div key={activity} className="bg-white/10 backdrop-blur p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl text-white font-bold">
                      {activity.replace(/-/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-4xl font-bold text-green-400">{count}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 mt-4 overflow-hidden">
                    <div
                      className="h-full bg-green-400"
                      style={{
                        width: `${(count / Math.max(...Object.values(slides[slide].activities))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {slides[slide].type === 'closing' && (
          <div className="text-center">
            <h1 className="text-7xl font-bold text-green-400 mb-4">
              {slides[slide].title}
            </h1>
            <p className="text-4xl text-white mb-16">{slides[slide].subtitle}</p>
            <p className="text-2xl text-gray-400">{slides[slide].footer}</p>
          </div>
        )}
      </motion.div>

      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-0 right-0 flex items-center justify-center gap-8">
        <button
          onClick={() => setSlide(Math.max(0, slide - 1))}
          className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white rounded-lg font-bold text-lg transition"
          disabled={slide === 0}
        >
          ← Previous
        </button>
        <span className="text-white font-bold text-xl">
          {slide + 1} / {slides.length}
        </span>
        <button
          onClick={() => setSlide(Math.min(slides.length - 1, slide + 1))}
          className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white rounded-lg font-bold text-lg transition"
          disabled={slide === slides.length - 1}
        >
          Next →
        </button>
        <button
          onClick={onExit}
          className="ml-4 px-6 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg font-bold transition"
        >
          ✕ Exit
        </button>
      </div>
    </div>
  );
};

export default PrincipalReportPage;
