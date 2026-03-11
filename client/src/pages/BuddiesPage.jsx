import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BuddiesPage = () => {
  const [buddies, setBuddies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchBuddies();
    fetchAllUsers();
  }, []);

  const fetchBuddies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/buddies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBuddies(response.data.buddies || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load buddies', error);
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/users?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to load users', error);
    }
  };

  const handleAddBuddy = async (buddyId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/v1/buddies/add/${buddyId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Buddy added!');
      fetchBuddies();
    } catch (error) {
      alert('Failed to add buddy');
      console.error(error);
    }
  };

  const handleRemoveBuddy = async (buddyId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/buddies/${buddyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Buddy removed');
      fetchBuddies();
    } catch (error) {
      alert('Failed to remove buddy');
      console.error(error);
    }
  };

  const filteredUsers = allUsers.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const buddyIds = new Set(buddies.map(b => b._id));
  const availableUsers = filteredUsers.filter(user => !buddyIds.has(user._id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">My Eco-Buddies</h1>
          <p className="text-gray-600">Connect with friends and collaborate on eco-projects</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Buddies List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Buddies ({buddies.length})</h2>
              {buddies.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No buddies yet. Add friends below!</p>
              ) : (
                <div className="space-y-3">
                  {buddies.map(buddy => (
                    <div key={buddy._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div>
                        <p className="font-semibold text-gray-800">{buddy.firstName} {buddy.lastName}</p>
                        <p className="text-sm text-gray-600">{buddy.ecoPoints} points</p>
                      </div>
                      <button
                        onClick={() => handleRemoveBuddy(buddy._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Buddies */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Buddies</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              {availableUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No available buddies to add</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableUsers.map(user => (
                    <div key={user._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-600">{user.ecoPoints || 0} points</p>
                      </div>
                      <button
                        onClick={() => handleAddBuddy(user._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuddiesPage;
