import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiRequest('get', '/v1/student/profile');
        setProfile(data?.data || data?.profile || data?.user || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const badges = profile?.gamification?.badges || profile?.badges || [];
  const ecoCoins = profile?.ecoCoins ?? profile?.gamification?.ecoPoints ?? 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Student Profile</h1>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div><span className="font-semibold">Name:</span> {profile?.name || '-'}</div>
        <div><span className="font-semibold">Grade:</span> {profile?.grade || profile?.profile?.grade || '-'}</div>
        <div><span className="font-semibold">School:</span> {profile?.school || profile?.profile?.school || '-'}</div>
        <div><span className="font-semibold">Eco Coins:</span> {ecoCoins}</div>
        <div>
          <span className="font-semibold block mb-2">Badges Earned:</span>
          <div className="flex flex-wrap gap-2">
            {badges.length === 0 && <span className="text-gray-500">No badges yet</span>}
            {badges.map((badge, idx) => (
              <span key={badge.badgeId || badge.id || idx} className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                {badge.name || badge.title || 'Badge'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
