import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Activity, Droplets } from 'lucide-react';

const Charts = ({ data }) => {
  return (
    <div className="space-y-8">
      {/* Water Stress Level Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5 text-red-500" />
          <h3 className="text-xl font-bold text-brand-dark">Water Stress Level (Last 7 Days)</h3>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <ReferenceLine y={70} label={{ position: 'top', value: 'High Stress (Irrigate)', fill: '#ef4444', fontSize: 12 }} stroke="#ef4444" strokeDasharray="3 3" />
              <ReferenceLine y={40} label={{ position: 'insideBottomLeft', value: 'Optimal', fill: '#10b981', fontSize: 12 }} stroke="#10b981" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Soil Moisture Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
         <div className="flex items-center gap-2 mb-6">
          <Droplets className="h-5 w-5 text-brand-blue" />
          <h3 className="text-xl font-bold text-brand-dark">Soil Moisture Levels</h3>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line type="monotone" dataKey="moisture" stroke="#3498db" strokeWidth={3} dot={{ stroke: '#3498db', strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6, fill: '#3498db' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
