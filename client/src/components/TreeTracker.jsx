import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';

export default function TreeTracker() {
  const [trees, setTrees] = useState([]);
  const [summary, setSummary] = useState({ totalTrees: 0, co2CapacityPerYear: 0 });
  const [followUpForm, setFollowUpForm] = useState({ plantedTreeId: '', followUpNumber: 1, photoUrl: '', health: 'healthy', notes: '' });

  const loadTrees = async () => {
    try {
      const { data } = await apiClient.get('/v1/trees/my-trees');
      setTrees(data?.data || []);
      setSummary(data?.summary || { totalTrees: 0, co2CapacityPerYear: 0 });
    } catch (error) {
      toast.error('Unable to load tree tracker');
    }
  };

  useEffect(() => {
    loadTrees();
  }, []);

  const dueNow = useMemo(() => {
    const now = new Date();
    return trees.flatMap((tree) =>
      (tree.followUps || []).filter((task) => new Date(task.dueDate) <= now && (task.status === 'pending' || task.status === 'overdue')).map((task) => ({ tree, task }))
    );
  }, [trees]);

  const submitFollowUp = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post(`/v1/trees/verify/${followUpForm.plantedTreeId}`, {
        followUpNumber: Number(followUpForm.followUpNumber),
        photoUrl: followUpForm.photoUrl,
        health: followUpForm.health,
        notes: followUpForm.notes
      });
      toast.success('Follow-up submitted for teacher review');
      setFollowUpForm({ plantedTreeId: '', followUpNumber: 1, photoUrl: '', health: 'healthy', notes: '' });
      loadTrees();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to submit follow-up');
    }
  };

  return (
    <section className="rounded-2xl border border-sky-200 bg-white p-6 shadow-md">
      <h2 className="text-xl font-bold text-slate-900">Tree Tracker</h2>
      <p className="mt-1 text-sm text-slate-600">Track planting milestones and submit 3/6/12 month verification checks.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Trees Planted</p>
          <p className="mt-1 text-2xl font-black text-emerald-900">{summary.totalTrees}</p>
        </div>
        <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">CO2 Capacity / Year</p>
          <p className="mt-1 text-2xl font-black text-cyan-900">{Number(summary.co2CapacityPerYear || 0).toFixed(1)} kg</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {trees.map((tree) => (
          <div key={tree._id} className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-900">{tree.species?.commonNameEn} ({tree.species?.scientificName})</p>
            <p className="text-xs text-slate-600">Planted: {new Date(tree.plantedDate).toLocaleDateString()} | Status: {tree.status}</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-700">
              {(tree.followUps || []).map((task) => (
                <li key={task._id}>Follow-up #{task.followUpNumber}: {new Date(task.dueDate).toLocaleDateString()} ({task.status})</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <form onSubmit={submitFollowUp} className="mt-6 space-y-3 rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-bold text-slate-900">Submit follow-up verification</h3>
        <select value={followUpForm.plantedTreeId} onChange={(e) => setFollowUpForm((p) => ({ ...p, plantedTreeId: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
          <option value="">Select tree</option>
          {trees.map((tree) => <option key={tree._id} value={tree._id}>{tree.species?.commonNameEn} - {new Date(tree.plantedDate).toLocaleDateString()}</option>)}
        </select>
        <select value={followUpForm.followUpNumber} onChange={(e) => setFollowUpForm((p) => ({ ...p, followUpNumber: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value={1}>3 month check</option>
          <option value={2}>6 month check</option>
          <option value={3}>12 month check</option>
        </select>
        <input value={followUpForm.photoUrl} onChange={(e) => setFollowUpForm((p) => ({ ...p, photoUrl: e.target.value }))} placeholder="Follow-up photo URL" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
        <select value={followUpForm.health} onChange={(e) => setFollowUpForm((p) => ({ ...p, health: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="thriving">Thriving</option>
          <option value="healthy">Healthy</option>
          <option value="struggling">Struggling</option>
          <option value="dead">Dead</option>
        </select>
        <textarea value={followUpForm.notes} onChange={(e) => setFollowUpForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">Submit Follow-up</button>
      </form>

      {dueNow.length > 0 ? <p className="mt-3 text-xs text-amber-700">{dueNow.length} follow-up checks are due now.</p> : null}
    </section>
  );
}
