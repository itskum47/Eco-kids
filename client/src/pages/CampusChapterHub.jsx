import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UG_GRADES = ['ug1', 'ug2', 'ug3', 'ug4'];

function isUGStudent(user) {
  return (
    user?.role === 'student' &&
    (UG_GRADES.includes(user?.profile?.grade) ||
      ['college', 'university'].includes(user?.profile?.institutionType))
  );
}

export default function CampusChapterHub({ user }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newChapter, setNewChapter] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [missionForm, setMissionForm] = useState({ title: '', description: '' });

  const fetchChapters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get('/api/v1/campus-chapters');
      setChapters(data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load chapters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/v1/campus-chapters', newChapter);
      setSuccessMsg('Chapter created successfully!');
      setShowCreate(false);
      setNewChapter({ name: '', description: '' });
      fetchChapters();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create chapter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (chapterId) => {
    try {
      await axios.post(`/api/v1/campus-chapters/${chapterId}/join`);
      setSuccessMsg('Joined chapter!');
      fetchChapters();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join chapter');
    }
  };

  const handleViewLeaderboard = async (chapter) => {
    setSelectedChapter(chapter);
    try {
      const { data } = await axios.get(`/api/v1/campus-chapters/${chapter._id}/leaderboard`);
      setLeaderboard(data.data || []);
    } catch {
      setLeaderboard([]);
    }
  };

  const handleProposeMission = async (chapterId) => {
    try {
      await axios.post(`/api/v1/campus-chapters/${chapterId}/missions`, missionForm);
      setSuccessMsg('Mission proposed and sent for review!');
      setMissionForm({ title: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to propose mission');
    }
  };

  if (!isUGStudent(user)) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="text-amber-800 font-medium">Campus Chapters are available for undergraduate students only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-800">Campus Chapters</h1>
          <p className="text-sm text-gray-500 mt-1">Student-led environmental action groups at your institution</p>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Create Chapter
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm flex justify-between">
          {successMsg}
          <button onClick={() => setSuccessMsg('')} className="ml-2 font-bold">×</button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm flex justify-between">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-800">New Chapter</h2>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Chapter name"
            value={newChapter.name}
            onChange={e => setNewChapter(v => ({ ...v, name: e.target.value }))}
            required
          />
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            placeholder="Short description (optional)"
            rows={3}
            value={newChapter.description}
            onChange={e => setNewChapter(v => ({ ...v, description: e.target.value }))}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="text-sm text-gray-500 hover:underline px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading chapters…</div>
      ) : chapters.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No chapters yet at your institution. Be the first to create one!</div>
      ) : (
        <div className="grid gap-4">
          {chapters.map(ch => {
            const isMember = ch.members?.some(m => String(m.userId) === user?._id || String(m.userId?._id) === user?._id);
            return (
              <div key={ch._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{ch.name}</h3>
                    {ch.description && <p className="text-sm text-gray-500 mt-0.5">{ch.description}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!isMember && (
                      <button
                        onClick={() => handleJoin(ch._id)}
                        className="border border-green-500 text-green-700 hover:bg-green-50 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                      >
                        Join
                      </button>
                    )}
                    <button
                      onClick={() => handleViewLeaderboard(ch)}
                      className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                    >
                      Leaderboard
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>👥 {ch.memberCount || 0} members</span>
                  <span>🎯 {ch.activeMissions || 0} active missions</span>
                </div>
                {isMember && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-green-700 font-medium">Propose a mission</summary>
                    <div className="mt-3 space-y-2">
                      <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="Mission title"
                        value={missionForm.title}
                        onChange={e => setMissionForm(v => ({ ...v, title: e.target.value }))}
                      />
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="Description"
                        rows={2}
                        value={missionForm.description}
                        onChange={e => setMissionForm(v => ({ ...v, description: e.target.value }))}
                      />
                      <button
                        onClick={() => handleProposeMission(ch._id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
                      >
                        Submit Mission
                      </button>
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard modal */}
      {selectedChapter && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-gray-800">{selectedChapter.name} — Leaderboard</h2>
              <button onClick={() => setSelectedChapter(null)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No data yet.</p>
            ) : (
              <ol className="space-y-2">
                {leaderboard.map(entry => (
                  <li key={entry.rank} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium text-gray-700">#{entry.rank} {entry.name}</span>
                    <span className="text-green-700 font-semibold">{entry.ecoPoints} pts</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
