import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, User } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../services/api';

const Profile = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.deleteAccount(token);
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center bg-brand-light/50">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-brand-light/50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-brand-green/10 p-3 rounded-2xl text-brand-green">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">My Profile</h1>
              <p className="text-text-muted">Manage your account details</p>
            </div>
          </div>

          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
              <span className="font-semibold text-gray-600">Name</span>
              <span className="md:col-span-2 text-gray-800">{user.name}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
              <span className="font-semibold text-gray-600">Email</span>
              <span className="md:col-span-2 text-gray-800">{user.email}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
              <span className="font-semibold text-gray-600">Farm Location</span>
              <span className="md:col-span-2 text-gray-800">{user.farm_location || 'Not provided'}</span>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-red-100">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-500 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
