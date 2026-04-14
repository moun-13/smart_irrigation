import React from 'react';
import Charts from '../components/Charts';
import { Calendar, TrendingUp, ThermometerSun } from 'lucide-react';

// Dummy historical data
const historicalData = [
  { day: 'Mon', stress: 35, moisture: 60, temp: 24, rain: 0 },
  { day: 'Tue', stress: 42, moisture: 55, temp: 26, rain: 0 },
  { day: 'Wed', stress: 30, moisture: 75, temp: 23, rain: 15 },
  { day: 'Thu', stress: 25, moisture: 70, temp: 22, rain: 5 },
  { day: 'Fri', stress: 45, moisture: 50, temp: 27, rain: 0 },
  { day: 'Sat', stress: 65, moisture: 35, temp: 29, rain: 0 },
  { day: 'Sun', stress: 82, moisture: 20, temp: 31, rain: 0 }, // Spike representing need for irrigation
];

const Dashboard = () => {
  // Calculate some simple stats for summary cards
  const latestData = historicalData[historicalData.length - 1];
  const avgStress = Math.round(historicalData.reduce((acc, curr) => acc + curr.stress, 0) / historicalData.length);
  
  return (
    <div className="flex-grow bg-brand-light/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Farm Dashboard</h1>
            <p className="text-text-muted mt-1">Overview of specific field conditions over the last 7 days.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-text-muted">
            <Calendar className="h-4 w-4" />
            Last 7 Days
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                {Math.round(historicalData.reduce((acc, curr) => acc + curr.temp, 0) / historicalData.length)}°C
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
        </div>

        {/* Charts Section */}
        <Charts data={historicalData} />
        
      </div>
    </div>
  );
};

export default Dashboard;
