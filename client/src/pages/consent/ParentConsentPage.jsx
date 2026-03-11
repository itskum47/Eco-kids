import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ParentConsentPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  
  // Verify token validity on component mount
  useEffect(() => {
    if (!token) {
      setError('Invalid consent link');
    }
  }, [token]);
  
  const handleGiveConsent = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/v1/consent/parent/verify', { token });
      
      if (response.data.success) {
        setSuccess(true);
        setStudentName(response.data.studentName);
        setConsentGiven(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify consent. The link may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDecline = () => {
    if (window.confirm('Are you sure you want to decline? Your child will not be able to use the EcoKids platform.')) {
      navigate('/consent/declined');
    }
  };
  
  if (success && consentGiven) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              ✅ Consent Confirmed!
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              Thank you for giving parental consent.
            </p>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>{studentName}</strong> can now participate in all EcoKids activities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Progress tracking and gamification features are enabled</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>You'll receive monthly progress reports via email</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>All data is stored securely in India (DPDP Act 2023 compliant)</span>
                </li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              A confirmation email has been sent to your email address.
            </p>
            
            <button
              onClick={() => window.location.href = 'https://ecokids.in'}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Learn More About EcoKids
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-2">🌱 EcoKids India</h1>
          <p className="text-green-100">Environmental Education Platform</p>
        </div>
        
        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Parental Consent Required
          </h2>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div className="space-y-6 mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-2xl mr-2">📋</span>
                What is EcoKids India?
              </h3>
              <p className="text-gray-700 mb-3">
                EcoKids India is a government-compliant educational platform aligned with NEP 2020 
                (National Education Policy) that helps students learn about environmental conservation 
                through gamified activities.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Hands-on environmental activities (tree planting, waste segregation, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Gamification with points, badges, and leaderboards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Progress tracking for students, teachers, and parents</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Aligned with SDG Goals 4, 6, 7, 12, 13, and 15</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                What data do we collect?
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span><strong>Basic information:</strong> Name, grade, school</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span><strong>Activity submissions:</strong> Photos, descriptions of environmental activities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span><strong>Progress data:</strong> Quiz scores, badges earned, eco-points</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span><strong>Usage data:</strong> Login times, features used (for improving the platform)</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                How is the data used?
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span><strong>Education only:</strong> To facilitate environmental learning and track progress</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span><strong> Reports:</strong> Sent to parents and teachers for academic purposes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span><strong>Leaderboards:</strong> Only first name and last initial shown publicly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span><strong>Platform improvement:</strong> Anonymous analytics to enhance user experience</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-2xl mr-2">🔒</span>
                Privacy & Data Protection
              </h3>
              <p className="text-gray-700 mb-3">
                EcoKids India is fully compliant with the following regulations:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>DPDP Act 2023</strong> - Digital Personal Data Protection Act</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>NEP 2020</strong> - National Education Policy alignment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>POCSO Act</strong> - Protection of Children from Sexual Offences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Data stored in India</strong> - All data stored in AWS Mumbai (ap-south-1)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>No third-party sharing</strong> - Data never sold or shared without your consent</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Right to deletion</strong> - You can request account deletion at any time</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGiveConsent}
              disabled={loading || !token}
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                '✓ I Give Parental Consent'
              )}
            </button>
            
            <button
              onClick={handleDecline}
              disabled={loading}
              className="bg-gray-200 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              ✗ Decline
            </button>
          </div>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            ⚠️ This consent link expires in 7 days. If you have any questions, 
            contact us at <a href="mailto:support@ecokids.in" className="text-green-600 hover:underline">support@ecokids.in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentConsentPage;
