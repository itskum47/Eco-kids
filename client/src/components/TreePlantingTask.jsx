import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';

export default function TreePlantingTask({ onSuccess }) {
  const [species, setSpecies] = useState([]);
  const [region, setRegion] = useState('urban');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSpecies(region);
  }, [region]);

  const selectedSpecies = useMemo(
    () => species.find((item) => item._id === selectedSpeciesId),
    [species, selectedSpeciesId]
  );

  const loadSpecies = async (selectedRegion) => {
    try {
      const { data } = await apiClient.get('/v1/trees/species', { params: { region: selectedRegion } });
      setSpecies(data?.data || []);
    } catch (error) {
      toast.error('Unable to load tree species');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedSpeciesId || !photoUrl.trim()) {
      return toast.error('Species and photo URL are required');
    }

    setLoading(true);
    try {
      await apiClient.post('/v1/trees/plant', {
        speciesId: selectedSpeciesId,
        photoUrl,
        notes
      });
      toast.success('Tree planted and follow-ups scheduled');
      setSelectedSpeciesId('');
      setPhotoUrl('');
      setNotes('');
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to submit tree planting task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-md">
      <h2 className="text-xl font-bold text-slate-900">Tree Planting Task</h2>
      <p className="mt-1 text-sm text-slate-600">Select a native species, submit proof, and unlock 3/6/12 month follow-ups.</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Region</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="himalayan">Himalayan</option>
            <option value="coastal">Coastal</option>
            <option value="desert">Desert</option>
            <option value="forest">Forest</option>
            <option value="urban">Urban</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Species (required)</span>
          <select value={selectedSpeciesId} onChange={(e) => setSelectedSpeciesId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
            <option value="">Select species</option>
            {species.map((item) => (
              <option key={item._id} value={item._id}>
                {item.commonNameEn} ({item.commonNameHi}) - {item.co2AbsorptionPerYear} kg CO2/year
              </option>
            ))}
          </select>
        </label>

        {selectedSpecies ? (
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            <p><strong>Scientific:</strong> {selectedSpecies.scientificName}</p>
            <p><strong>Water:</strong> {selectedSpecies.waterNeeds}</p>
            <p><strong>Maturity:</strong> {selectedSpecies.matureAge || 'N/A'} years</p>
            <p className="mt-1 text-xs text-slate-600">{selectedSpecies.description}</p>
          </div>
        ) : null}

        <input
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="Photo URL"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          required
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <button type="submit" disabled={loading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60">
          Submit Tree Planting
        </button>
      </form>
    </section>
  );
}
