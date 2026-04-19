import React, { useEffect, useMemo, useState } from 'react';
import Charts from '../components/Charts';
import { Calendar, TrendingUp, ThermometerSun } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.predictionHistory(token);
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [token]);

  const chartData = useMemo(
    () =>
      [...history]
        .reverse()
        .map((item) => ({
          label: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          stress: Math.round(item.water_stress),
          moisture: item.soil_moisture,
          temp: item.temperature,
          rain: item.rainfall,
        })),
    [history]
  );

  const latestData = chartData[chartData.length - 1];
  const avgStress = chartData.length
    ? Math.round(chartData.reduce((acc, curr) => acc + curr.stress, 0) / chartData.length)
    : 0;

  return (
    <div className="flex-grow bg-brand-light/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Farm Dashboard</h1>
            <p className="text-text-muted mt-1">
              {user?.name ? `${user.name}'s` : 'Your'} personalized irrigation analytics and recommendations.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-text-muted">
            <Calendar className="h-4 w-4" />
            Recent Predictions
          </div>
        </div>

        {loading && <p className="text-text-muted mb-6">Loading prediction history...</p>}
        {error && <p className="text-red-500 mb-6">{error}</p>}
        {!loading && history.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
            <p className="text-text-muted">No predictions yet. Start by creating your first prediction.</p>
          </div>
        )}

        {/* Summary Metric Cards */}
        {latestData && <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${latestData.stress > 70 ? 'bg-red-100' : 'bg-brand-green/10'}`}>
              <TrendingUp className={`h-6 w-6 ${latestData.stress > 70 ? 'text-red-500' : 'text-brand-green'}`} />
            </div>
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wide">Current Stress Level</p>
              <p className="text-3xl font-bold text-brand-dark mt-1">{latestData.stress}<span className="text-lg text-text-muted font-normal">/100</span></p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-brand-blue/10">
              <ThermometerSun className="h-6 w-6 text-brand-blue" />
            </div>
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wide">Avg Weekly Temp</p>
              <p className="text-3xl font-bold text-brand-dark mt-1">
                {Math.round(chartData.reduce((acc, curr) => acc + curr.temp, 0) / chartData.length)}°C
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wide">Avg Stress Level</p>
              <p className="text-3xl font-bold text-brand-dark mt-1">{avgStress}</p>
            </div>
          </div>
        </div>}

        {history[0] && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-brand-dark mb-2">Personalized Recommendation</h2>
            <p className="text-text-muted">{history[0].explanation}</p>
            <p className="mt-3 text-text-main">
              Recommended water: <span className="font-semibold">{history[0].recommended_water_l_m2}L/m²</span> - Frequency:{' '}
              <span className="font-semibold">Every {history[0].irrigation_frequency_days} day{history[0].irrigation_frequency_days > 1 ? 's' : ''}</span>
            </p>
          </div>
        )}

        {/* Charts Section */}
        {chartData.length > 0 && <Charts data={chartData} />}

        {history.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Prediction History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-gray-100">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Crop</th>
                    <th className="py-2 pr-3">Stress</th>
                    <th className="py-2 pr-3">Temp</th>
                    <th className="py-2 pr-3">Moisture</th>
                    <th className="py-2 pr-3">Rainfall</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="py-2 pr-3">{new Date(item.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-3">{item.crop_type}</td>
                      <td className={`py-2 pr-3 font-semibold ${item.stress_level === 'high' ? 'text-red-500' : item.stress_level === 'medium' ? 'text-orange-500' : 'text-brand-green'}`}>
                        {Math.round(item.water_stress)} ({item.stress_level})
                      </td>
                      <td className="py-2 pr-3">{item.temperature}°C</td>
                      <td className="py-2 pr-3">{item.soil_moisture}%</td>
                      <td className="py-2 pr-3">{item.rainfall}mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Dashboard;
