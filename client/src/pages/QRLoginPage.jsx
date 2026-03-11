import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';

/**
 * QR Login Page
 * Route: /qr-login (PUBLIC — no auth required)
 * 
 * Handles QR code login:
 * 1. Extract ?token= from URL
 * 2. Call POST /api/v1/auth/qr-login
 * 3. Store tokens and redirect to dashboard
 * 4. Show error if QR code is invalid/expired
 */
const QRLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleQRLogin = async () => {
      try {
        // Extract token from URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          setError('No QR code token found in URL');
          return;
        }

        setMessage('🌱 Logging you in...');
        setIsLoading(true);

        // Call QR login endpoint
        const response = await fetch('/api/v1/auth/qr-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token }),
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'QR code login failed. Invalid or expired QR code.'
          );
        }

        // Store tokens directly (QR login returns tokens in response)
        if (data.token) {
          localStorage.setItem('accessToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }



        setMessage('✅ Login successful! Redirecting...');

        // Redirect to dashboard after 1 second
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1000);
      } catch (err) {
        setError(err.message || 'QR code login failed');
        setIsLoading(false);
      }
    };

    // Only run if we're on the QR login page
    if (location.pathname === '/qr-login') {
      handleQRLogin();
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo/Branding */}
          <div className="mb-8">
            <div className="text-5xl mb-4">🌱</div>
            <h1 className="text-3xl font-bold text-gray-800">EcoKids India</h1>
            <p className="text-gray-600 mt-2">QR Code Login</p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <>
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <div className="animate-spin">
                    <div className="h-12 w-12 border-4 border-green-200 border-t-green-600 rounded-full"></div>
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-700 font-medium">{message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Please wait while we verify your QR code...
              </p>
            </>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <>
              <div className="mb-6">
                <div className="text-5xl">❌</div>
              </div>
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <p className="text-sm text-gray-600 mb-6">
                The QR code is invalid or has expired.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition"
                >
                  Login with Email
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition"
                >
                  Go Home
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Need help? Contact your school administrator.
              </p>
            </>
          )}

          {/* Success State */}
          {!isLoading && !error && message && (
            <>
              <div className="mb-6">
                <div className="text-6xl animate-bounce">✅</div>
              </div>
              <p className="text-lg text-green-600 font-medium">{message}</p>
              <p className="text-sm text-gray-600 mt-2">
                Redirecting to your dashboard...
              </p>
            </>
          )}

          {/* Help Text */}
          {!isLoading && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Scan the QR code printed on your card with your device's camera.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Powered by EcoKids India • Making Education Sustainable
        </p>
      </div>
    </div>
  );
};

export default QRLoginPage;
