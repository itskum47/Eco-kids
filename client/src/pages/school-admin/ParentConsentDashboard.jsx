import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Parent Consent Dashboard
 * Route: /school-admin/parent-consent
 * 
 * Allows school admins to:
 * 1. View consent status per grade
 * 2. Send bulk consent requests or reminders
 * 3. Export non-consented student list as CSV
 * 4. Track consent progress in real-time
 */
const ParentConsentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [consentStatus, setConsentStatus] = useState(null);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [exporting, setExporting] = useState(false);

  const schoolId = user?.profile?.schoolId;

  /**
   * Load consent status on mount
   */
  useEffect(() => {
    fetchConsentStatus();
  }, [schoolId]);

  /**
   * Fetch consent status from API
   */
  const fetchConsentStatus = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/v1/consent/parent-status/${schoolId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load consent status');
      }

      setConsentStatus(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send bulk consent requests to all students without consent
   */
  const handleSendBulkConsent = async () => {
    if (!window.confirm('Send parent consent requests to all students without consent?')) {
      return;
    }

    try {
      setSendingBulk(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/consent/bulk-send-parent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send bulk consent requests');
      }

      setSuccess(
        `✅ Sent ${data.data.emailsSent} consent requests to parents`
      );
      
      // Refresh status
      setTimeout(() => fetchConsentStatus(), 1000);
    } catch (err) {
      console.error('Failed to send bulk consent:', err);
      setError(err.message);
    } finally {
      setSendingBulk(false);
    }
  };

  /**
   * Send reminders to parents who haven't responded
   */
  const handleSendReminders = async () => {
    if (!window.confirm('Send reminders to parents who haven\'t consented yet?')) {
      return;
    }

    try {
      setSendingReminders(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/v1/consent/send-reminder/${schoolId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminders');
      }

      setSuccess(`✅ Sent ${data.data.remindersSent} reminders`);
      
      setTimeout(() => fetchConsentStatus(), 1000);
    } catch (err) {
      console.error('Failed to send reminders:', err);
      setError(err.message);
    } finally {
      setSendingReminders(false);
    }
  };

  /**
   * Export non-consented students list as CSV
   */
  const handleExportList = async () => {
    try {
      setExporting(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/v1/consent/export-non-consented/${schoolId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export list');
      }

      // Download CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `non-consented-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('✅ Non-consented list exported as CSV');
    } catch (err) {
      console.error('Failed to export list:', err);
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin inline-block">
            <div className="h-12 w-12 border-4 border-green-200 border-t-green-600 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading consent status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📋 Parent Consent Management
          </h1>
          <p className="text-gray-600">
            Track and manage parent consent collection for your school
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {consentStatus ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Total Students */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium mb-1">
                  Total Students
                </div>
                <div className="text-4xl font-bold text-blue-600">
                  {consentStatus.total}
                </div>
              </div>

              {/* Consented */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium mb-1">
                  Consented ✅
                </div>
                <div className="text-4xl font-bold text-green-600">
                  {consentStatus.consented}
                </div>
              </div>

              {/* Pending */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium mb-1">
                  Pending ⏳
                </div>
                <div className="text-4xl font-bold text-yellow-600">
                  {consentStatus.pending}
                </div>
              </div>

              {/* No Email */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium mb-1">
                  No Parent Email
                </div>
                <div className="text-4xl font-bold text-gray-600">
                  {consentStatus.noParentEmail}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-gray-900">
                    Overall Consent Rate
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {consentStatus.consentRate}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all"
                    style={{
                      width: consentStatus.consentRate
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Grade-wise Breakdown */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📊 Consent by Grade
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Grade
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Total
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Consented
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Pending
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        No Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(consentStatus.byGrade).map(([grade, data]) => (
                      <tr
                        key={grade}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4 font-medium text-gray-900">
                          Grade {grade}
                        </td>
                        <td className="py-4 px-4 text-gray-600">{data.total}</td>
                        <td className="py-4 px-4 text-green-600 font-medium">
                          {data.consented}
                        </td>
                        <td className="py-4 px-4 text-yellow-600 font-medium">
                          {data.pending}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {data.noEmail}
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-900">
                          {data.rate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Send Bulk Consent */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📧 Send Bulk Consent
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Send parent consent requests to all students at once
                </p>
                <button
                  onClick={handleSendBulkConsent}
                  disabled={sendingBulk || consentStatus.pending === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
                >
                  {sendingBulk ? 'Sending...' : 'Send Consent Requests'}
                </button>
              </div>

              {/* Send Reminders */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🔔 Send Reminders
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Send reminders to parents who haven't responded yet
                </p>
                <button
                  onClick={handleSendReminders}
                  disabled={sendingReminders || consentStatus.pending === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
                >
                  {sendingReminders ? 'Sending...' : 'Send Reminders'}
                </button>
              </div>

              {/* Export List */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📥 Export List
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Download CSV list of students without consent
                </p>
                <button
                  onClick={handleExportList}
                  disabled={exporting || consentStatus.pending === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
                >
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                💡 <strong>Tip:</strong> Parents receive consent requests via email. Check the "No Parent Email" count above — those students cannot receive digital consent requests.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No consent data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentConsentDashboard;
