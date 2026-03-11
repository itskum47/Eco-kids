import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import { storeAPI } from '../utils/api';
import { loadUser } from '../store/slices/authSlice';

const EcoStorePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [items, setItems] = useState([]);
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeemingId, setIsRedeemingId] = useState(null);
  const [error, setError] = useState('');

  const ecoCoins = useMemo(() => {
    if (typeof user?.ecoCoins === 'number') return user.ecoCoins;
    return user?.gamification?.ecoPoints || 0;
  }, [user]);

  const loadStore = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [itemsRes, redemptionsRes] = await Promise.all([
        storeAPI.getItems(),
        storeAPI.getMyRedemptions()
      ]);

      setItems(itemsRes.data?.data || []);
      setMyRedemptions(redemptionsRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load Eco Store right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, []);

  const handleRedeem = async (item) => {
    try {
      setIsRedeemingId(item._id);
      await storeAPI.redeemItem({ storeItemId: item._id, quantity: 1 });
      toast.success('Item redeemed successfully!');
      await Promise.all([loadStore(), dispatch(loadUser())]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Redemption failed');
    } finally {
      setIsRedeemingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 py-24">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Eco-Coins Store</h1>
            <p className="text-gray-600 mt-1">Redeem your eco-coins for rewards and experiences.</p>
          </div>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-50 border border-yellow-200">
            <span className="mr-2">🪙</span>
            <span className="font-semibold text-yellow-700">Balance: {ecoCoins}</span>
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center text-gray-600">
            Loading Eco Store...
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 mb-6">
            <div className="font-semibold">Could not load store</div>
            <div className="text-sm mt-1">{error}</div>
            <button
              onClick={loadStore}
              className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center text-gray-600">
            No store items are available right now.
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const outOfStock = item.stock !== -1 && item.stock <= 0;
              const cannotAfford = ecoCoins < item.ecoCoinCost;
              const disabled = outOfStock || cannotAfford || isRedeemingId === item._id;

              return (
                <div key={item._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 uppercase">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 min-h-[40px]">{item.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-yellow-700 font-bold">🪙 {item.ecoCoinCost}</div>
                    <div className="text-xs text-gray-500">
                      {item.stock === -1 ? 'Unlimited' : `Stock: ${item.stock}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={disabled}
                    className="mt-4 w-full py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRedeemingId === item._id
                      ? 'Redeeming...'
                      : outOfStock
                        ? 'Out of Stock'
                        : cannotAfford
                          ? 'Insufficient Coins'
                          : 'Redeem'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Redemptions</h2>
          {myRedemptions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-gray-600">
              You have not redeemed any items yet.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3">Item</th>
                    <th className="text-left px-4 py-3">Coins</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Code</th>
                  </tr>
                </thead>
                <tbody>
                  {myRedemptions.map((entry) => (
                    <tr key={entry._id} className="border-t border-gray-100">
                      <td className="px-4 py-3">{entry.storeItem?.name || 'Store Item'}</td>
                      <td className="px-4 py-3">{entry.ecoCoinsSpent}</td>
                      <td className="px-4 py-3 capitalize">{entry.status}</td>
                      <td className="px-4 py-3 font-mono text-xs">{entry.redemptionCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EcoStorePage;
