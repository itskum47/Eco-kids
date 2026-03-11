import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../utils/api';

const QRLogin = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying QR code...');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('failed');
      setMessage('This QR code has expired. Ask your teacher for a new one.');
      return;
    }

    (async () => {
      try {
        const { data } = await apiRequest('get', `/v1/auth/qr-login?token=${encodeURIComponent(token)}`);
        const name = data?.user?.name || 'Student';
        setStatus('success');
        setMessage(`Welcome back, ${name}! 🌱`);
        setTimeout(() => navigate('/student-dashboard'), 2000);
      } catch (error) {
        setStatus('failed');
        setMessage('This QR code has expired. Ask your teacher for a new one.');
      }
    })();
  }, [navigate, params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
      <div className="bg-white border border-green-100 rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
        {status === 'verifying' && <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />}
        <p className="text-gray-800 font-semibold">{message}</p>
      </div>
    </div>
  );
};

export default QRLogin;
