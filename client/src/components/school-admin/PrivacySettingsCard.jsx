import React, { useState } from 'react';

const PrivacySettingsCard = ({
  enabled = true,
  loading = false,
  saving = false,
  onToggle
}) => {
  const [confirmDisable, setConfirmDisable] = useState(false);

  const warningText = 'Students from your school will no longer appear in inter-school rankings. Their individual eco-progress is not affected.';

  const handleClick = () => {
    if (!enabled) {
      onToggle && onToggle(true);
      return;
    }

    setConfirmDisable(true);
  };

  const handleDisableConfirm = () => {
    setConfirmDisable(false);
    onToggle && onToggle(false);
  };

  const handleDisableCancel = () => {
    setConfirmDisable(false);
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900">Include our school in public inter-school leaderboards.</p>
            <p className="mt-1 text-sm text-gray-600">Default is ON. You can opt out at any time.</p>
          </div>

          <button
            type="button"
            onClick={handleClick}
            disabled={loading || saving}
            className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-300'} ${(loading || saving) ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-pressed={enabled}
            aria-label="Toggle public leaderboard participation"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {!enabled && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {warningText}
          </div>
        )}

        {(loading || saving) && (
          <p className="text-sm text-gray-500">Saving settings...</p>
        )}

        {confirmDisable && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Are you sure you want to turn this OFF?</p>
            <p className="mt-2 text-sm text-red-700">{warningText}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleDisableConfirm}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Turn Off
              </button>
              <button
                type="button"
                onClick={handleDisableCancel}
                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PrivacySettingsCard;
