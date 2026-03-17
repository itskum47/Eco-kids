import React, { useState, useCallback } from 'react';
import axios from 'axios';

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const WORD_MIN = 150;
const WORD_MAX = 300;

export default function ResearchTrackSubmit({ user, onSuccess }) {
  const [writeUp, setWriteUp] = useState('');
  const [photoUrls, setPhotoUrls] = useState(['', '', '']);
  const [gpsCoordinates, setGpsCoordinates] = useState({ lat: '', lng: '' });
  const [facultyAdvisorId, setFacultyAdvisorId] = useState('');
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const wordCount = countWords(writeUp);
  const wordCountOk = wordCount >= WORD_MIN && wordCount <= WORD_MAX;
  const photosOk = photoUrls.filter(u => u.trim()).length >= 3;
  const gpsOk = gpsCoordinates.lat !== '' && gpsCoordinates.lng !== '';
  const canSubmit = wordCountOk && photosOk && gpsOk && !submitting;

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsCoordinates({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6)
        });
        setLocating(false);
      },
      () => {
        setError('Could not detect location. Please enter coordinates manually.');
        setLocating(false);
      }
    );
  }, []);

  const handlePhotoChange = (index, value) => {
    setPhotoUrls(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addPhotoSlot = () => {
    if (photoUrls.length < 6) setPhotoUrls(prev => [...prev, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!wordCountOk) {
      setError(`Write-up must be ${WORD_MIN}–${WORD_MAX} words. Current: ${wordCount} words.`);
      return;
    }
    const validPhotos = photoUrls.filter(u => u.trim());
    if (validPhotos.length < 3) {
      setError('Please provide at least 3 photo URLs.');
      return;
    }
    if (!gpsOk) {
      setError('GPS coordinates are required. Use "Detect Location" or enter manually.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post('/api/v1/campus-chapters/research-track', {
        writeUp,
        photoUrls: validPhotos,
        gpsCoordinates: { lat: Number(gpsCoordinates.lat), lng: Number(gpsCoordinates.lng) },
        facultyAdvisorId: facultyAdvisorId.trim() || undefined
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-4">
        <div className="text-5xl">🌿</div>
        <h2 className="text-xl font-bold text-green-800">Research Track Submitted!</h2>
        <p className="text-gray-600 text-sm">Your submission is pending review by your faculty advisor.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-800">Research Track Submission</h1>
        <p className="text-sm text-gray-500 mt-1">Document your field research with GPS, photos, and a written analysis.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Write-Up */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Field Research Write-Up
            <span className="ml-2 text-xs text-gray-400">({WORD_MIN}–{WORD_MAX} words required)</span>
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[180px]"
            placeholder="Describe your field observations, methodology, findings, and their environmental implications…"
            value={writeUp}
            onChange={e => setWriteUp(e.target.value)}
          />
          <div className={`text-xs font-medium ${wordCount === 0 ? 'text-gray-400' : wordCountOk ? 'text-green-600' : 'text-red-500'}`}>
            {wordCount} / {WORD_MAX} words
            {wordCount > 0 && !wordCountOk && wordCount < WORD_MIN && ` — ${WORD_MIN - wordCount} more words needed`}
            {wordCount > WORD_MAX && ` — ${wordCount - WORD_MAX} words over limit`}
          </div>
        </div>

        {/* GPS */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">GPS Coordinates</label>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g. 28.6139"
                value={gpsCoordinates.lat}
                onChange={e => setGpsCoordinates(v => ({ ...v, lat: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g. 77.2090"
                value={gpsCoordinates.lng}
                onChange={e => setGpsCoordinates(v => ({ ...v, lng: e.target.value }))}
              />
            </div>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locating}
              className="border border-green-500 text-green-700 hover:bg-green-50 disabled:opacity-50 text-xs font-medium px-3 py-2 rounded-lg transition whitespace-nowrap"
            >
              {locating ? 'Locating…' : '📍 Detect Location'}
            </button>
          </div>
          {gpsOk && (
            <p className="text-xs text-green-600">✓ Coordinates set: {gpsCoordinates.lat}, {gpsCoordinates.lng}</p>
          )}
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Field Photos
            <span className="ml-2 text-xs text-gray-400">(minimum 3 required)</span>
          </label>
          <div className="space-y-2">
            {photoUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12">Photo {i + 1}</span>
                <input
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="https://..."
                  type="url"
                  value={url}
                  onChange={e => handlePhotoChange(i, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${photoUrls.filter(u => u.trim()).length >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
              {photoUrls.filter(u => u.trim()).length} of 3+ photos provided
            </span>
            {photoUrls.length < 6 && (
              <button type="button" onClick={addPhotoSlot} className="text-xs text-green-700 hover:underline">
                + Add photo
              </button>
            )}
          </div>
        </div>

        {/* Faculty Advisor (optional) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Faculty Advisor ID
            <span className="ml-2 text-xs text-gray-400">(optional)</span>
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Faculty advisor user ID"
            value={facultyAdvisorId}
            onChange={e => setFacultyAdvisorId(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition text-sm"
        >
          {submitting ? 'Submitting…' : 'Submit Research Track'}
        </button>
      </form>
    </div>
  );
}
