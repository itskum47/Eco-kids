import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const steps = [
  'School Details',
  'Academic Year',
  'Import Teachers',
  'Import Students',
  'Launch'
];

const SetupWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [setupComplete, setSetupComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifyingUdise, setVerifyingUdise] = useState(false);
  const [udiseLookupMessage, setUdiseLookupMessage] = useState('');
  const [udiseLookupOk, setUdiseLookupOk] = useState(false);
  const [form, setForm] = useState({
    schoolName: '',
    udiseCode: '',
    principalName: '',
    academicYear: '',
    teacherCount: '',
    studentCount: ''
  });

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const { data } = await axios.get('/api/v1/school-admin/dashboard');
        const payload = data?.data || data;
        const isComplete = Boolean(payload?.setupComplete);
        setSetupComplete(isComplete);
        if (isComplete) {
          navigate('/school-admin/dashboard', { replace: true });
          return;
        }
      } catch (_) {
        // Keep wizard available if dashboard probe fails.
      } finally {
        setLoading(false);
      }
    };

    checkSetup();
  }, [navigate]);

  const verifyUdiseCode = async () => {
    if (!/^\d{11}$/.test(form.udiseCode)) {
      setUdiseLookupOk(false);
      setUdiseLookupMessage('Please enter a valid 11-digit UDISE code.');
      return;
    }

    setVerifyingUdise(true);
    setUdiseLookupMessage('Verifying UDISE code...');

    try {
      const { data } = await axios.get(`/api/v1/school-onboarding/lookup?udise=${form.udiseCode}`);
      const school = data?.data || {};

      setForm((prev) => ({
        ...prev,
        schoolName: school.name || prev.schoolName
      }));

      setUdiseLookupOk(true);
      setUdiseLookupMessage(`UDISE verified: ${school.name || 'School found'} (${school.district || 'District N/A'}, ${school.state || 'State N/A'})`);
    } catch (error) {
      const msg = error?.response?.data?.message || 'UDISE verification failed. Please recheck the code.';
      setUdiseLookupOk(false);
      setUdiseLookupMessage(msg);
    } finally {
      setVerifyingUdise(false);
    }
  };

  const stepTitle = useMemo(() => steps[currentStep], [currentStep]);

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const completeSetup = async () => {
    try {
      await axios.post('/api/v1/school-onboarding/complete', {
        setupComplete: true,
        ...form
      });
    } catch (_) {
      // Fallback navigation for environments without endpoint.
    }
    setSetupComplete(true);
    navigate('/school-admin/dashboard');
  };

  if (loading) {
    return <div className="p-8">Loading setup wizard...</div>;
  }

  if (setupComplete) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">School Setup Wizard</h1>
        <p className="text-gray-600 mt-2">Complete these 5 steps before launching your school workspace.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex flex-wrap gap-2">
          {steps.map((step, idx) => (
            <div
              key={step}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold ${idx <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              {idx + 1}. {step}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Step {currentStep + 1}: {stepTitle}</h2>

        {currentStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="school-name" className="block text-sm font-semibold text-gray-700 mb-1">School Name</label>
              <input id="school-name" className="border rounded-lg px-3 py-2 w-full" placeholder="School Name" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="udise-code" className="block text-sm font-semibold text-gray-700 mb-1">UDISE Code</label>
              <input
                id="udise-code"
                className="border rounded-lg px-3 py-2 flex-1"
                placeholder="UDISE Code (11 digits)"
                value={form.udiseCode}
                aria-describedby="udise-help"
                onChange={(e) => {
                  const nextValue = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setForm({ ...form, udiseCode: nextValue });
                }}
              />
              </div>
              <button
                type="button"
                onClick={verifyUdiseCode}
                disabled={verifyingUdise}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60 mt-6"
              >
                {verifyingUdise ? 'Checking...' : 'Verify'}
              </button>
            </div>
            <p id="udise-help" className="md:col-span-2 text-xs text-gray-500 -mt-2">Enter exactly 11 digits to verify with UDISE registry.</p>
            <div className="md:col-span-2">
              <label htmlFor="principal-name" className="block text-sm font-semibold text-gray-700 mb-1">Principal Name</label>
              <input id="principal-name" className="border rounded-lg px-3 py-2 w-full" placeholder="Principal Name" value={form.principalName} onChange={(e) => setForm({ ...form, principalName: e.target.value })} />
            </div>

            {udiseLookupMessage && (
              <div className={`md:col-span-2 rounded-lg border px-3 py-2 text-sm ${udiseLookupOk ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {udiseLookupMessage}
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <label htmlFor="academic-year" className="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
            <input id="academic-year" className="border rounded-lg px-3 py-2 w-full" placeholder="Academic Year (e.g. 2026-27)" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <label htmlFor="teacher-count" className="block text-sm font-semibold text-gray-700 mb-1">Number of Teachers</label>
            <input id="teacher-count" className="border rounded-lg px-3 py-2 w-full" placeholder="Number of Teachers to Import" value={form.teacherCount} onChange={(e) => setForm({ ...form, teacherCount: e.target.value })} />
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <label htmlFor="student-count" className="block text-sm font-semibold text-gray-700 mb-1">Number of Students</label>
            <input id="student-count" className="border rounded-lg px-3 py-2 w-full" placeholder="Number of Students to Import" value={form.studentCount} onChange={(e) => setForm({ ...form, studentCount: e.target.value })} />
          </div>
        )}

        {currentStep === 4 && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
            Ready to launch. Confirm details and complete setup.
          </div>
        )}

        <div className="flex justify-between pt-3">
          <button onClick={prevStep} disabled={currentStep === 0} className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-50">Back</button>
          {currentStep < steps.length - 1 ? (
            <button onClick={nextStep} className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold">Next</button>
          ) : (
            <button onClick={completeSetup} className="px-4 py-2 rounded-lg bg-green-700 text-white font-semibold">Launch School</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
