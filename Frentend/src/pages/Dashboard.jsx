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
    if (!token) return;

    const loadHistory = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      setError('');
      try {
        const data = await api.predictionHistory(token);
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    loadHistory(true);
    const intervalId = setInterval(() => {
      loadHistory(false);
    }, 2500);

    return () => clearInterval(intervalId);
  }, [token]);

  const chartData = useMemo(
    () =>
      [...history]
        .reverse()
        .map((item) => {
          const d = new Date(item.created_at);
          const dateLabel = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
          const timeLabel = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          return {
            label: `${dateLabel} ${timeLabel}`,
            stress: Math.round(item.water_stress),
            moisture: item.soil_moisture,
            temp: item.temperature,
            rain: item.rainfall,
          };
        }),
    [history]
  );

  const latestData = chartData[chartData.length - 1];
  const avgStress = chartData.length
    ? Math.round(chartData.reduce((acc, curr) => acc + curr.stress, 0) / chartData.length)
    : 0;

  return (
    <div className="flex-grow bg-brand-light/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Actions & Live Indicator */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">Farm Dashboard</h1>
            <p className="text-text-muted mt-1">
              {user?.name ? `${user.name}'s` : 'Your'} personalized irrigation analytics and real-time sensor stream.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Kafka & Spark Live
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs text-sm font-medium text-text-muted">
              <Calendar className="h-4 w-4 text-brand-green" />
              {history.length} Relevés
            </div>
          </div>
        </div>

        {loading && history.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-8 shadow-xs">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-brand-green rounded-full mb-3" />
            <p className="text-text-muted font-medium">Chargement du flux de prédictions...</p>
          </div>
        )}
        {error && <p className="text-red-500 mb-6 bg-red-50 p-4 rounded-xl border border-red-200">{error}</p>}
        {!loading && history.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-8 shadow-xs">
            <p className="text-text-muted">Aucune prédiction pour l'instant. Le flux Spark Streaming s'affichera dès l'envoi des capteurs.</p>
          </div>
        )}

        {/* Summary Metric Cards */}
        {latestData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
              <div className={`p-4 rounded-2xl ${latestData.stress >= 70 ? 'bg-red-50 text-red-600' : latestData.stress >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <TrendingUp className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Dernier Stress Hydrique</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-brand-dark">{latestData.stress}%</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md uppercase ${
                    latestData.stress >= 70 ? 'bg-red-100 text-red-700' : latestData.stress >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {latestData.stress >= 70 ? 'Élevé' : latestData.stress >= 40 ? 'Moyen' : 'Faible'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                <ThermometerSun className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Température Moyenne</p>
                <p className="text-3xl font-extrabold text-brand-dark mt-1">
                  {(chartData.reduce((acc, curr) => acc + curr.temp, 0) / chartData.length).toFixed(1)}°C
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
              <div className="p-4 rounded-2xl bg-purple-50 text-purple-600">
                <TrendingUp className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Stress Moyen Global</p>
                <p className="text-3xl font-extrabold text-brand-dark mt-1">{avgStress}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Latest Recommendation Alert Card */}
        {history[0] && (
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 rounded-2xl shadow-xs border border-emerald-200/60 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-green"></span>
                  <h2 className="text-lg font-bold text-brand-dark">Recommandation d'irrigation intelligente</h2>
                </div>
                <p className="text-sm text-text-muted">{history[0].explanation}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-white px-4 py-2.5 rounded-xl border border-emerald-100 shadow-xs text-center">
                  <p className="text-xs text-text-muted font-medium">Volume d'eau</p>
                  <p className="text-base font-bold text-brand-green">{Number(history[0].recommended_water_l_m2).toFixed(1)} L/m²</p>
                </div>
                <div className="bg-white px-4 py-2.5 rounded-xl border border-emerald-100 shadow-xs text-center">
                  <p className="text-xs text-text-muted font-medium">Fréquence</p>
                  <p className="text-base font-bold text-brand-dark">Tous les {history[0].irrigation_frequency_days}j</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {chartData.length > 0 && <Charts data={chartData} />}

        {/* Prediction History Table */}
        {history.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-brand-dark">Historique des Flux Capteurs & Prédictions</h2>
                <p className="text-xs text-text-muted mt-0.5">Données IoT ingérées et prédites en continu par Apache Spark</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                {history.length} mesures
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider font-bold text-gray-400 border-b border-gray-100 pb-3">
                    <th className="py-3 px-3">Horodatage</th>
                    <th className="py-3 px-3">Culture</th>
                    <th className="py-3 px-3">Stress Hydrique</th>
                    <th className="py-3 px-3">Température</th>
                    <th className="py-3 px-3">Humidité Sol</th>
                    <th className="py-3 px-3">Pluie</th>
                    <th className="py-3 px-3">Eau conseillée</th>
                    <th className="py-3 px-3">Fréquence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((item) => {
                    const stressVal = Math.round(item.water_stress);
                    const isHigh = item.stress_level === 'high' || stressVal >= 70;
                    const isMedium = item.stress_level === 'medium' || (stressVal >= 40 && stressVal < 70);
                    const d = new Date(item.created_at);
                    const formattedDate = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                    const formattedTime = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-xs bg-gray-100 px-2 py-0.5 rounded-md">
                              {formattedDate}
                            </span>
                            <span className="text-xs font-mono text-gray-600">
                              {formattedTime}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-gray-800">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 text-emerald-800 text-xs font-medium border border-emerald-100">
                            🌱 {item.crop_type}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isHigh 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : isMedium 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-red-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                            {stressVal}% ({item.stress_level})
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-gray-700">
                          {Number(item.temperature).toFixed(1)}°C
                        </td>
                        <td className="py-3 px-3 font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <span>{Number(item.soil_moisture).toFixed(1)}%</span>
                            <div className="w-12 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(100, Math.max(0, item.soil_moisture))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-gray-700">
                          {Number(item.rainfall).toFixed(1)} mm
                        </td>
                        <td className="py-3 px-3 font-semibold text-emerald-700">
                          {Number(item.recommended_water_l_m2).toFixed(1)} L/m²
                        </td>
                        <td className="py-3 px-3 text-xs text-gray-600 font-medium">
                          Tous les {item.irrigation_frequency_days}j
                        </td>
                      </tr>
                    );
                  })}
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
