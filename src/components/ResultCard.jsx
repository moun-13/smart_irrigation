import React from 'react';
import { AlertTriangle, Info, CheckCircle, Activity } from 'lucide-react';

const ResultCard = ({ result }) => {
  if (!result) return null;

  const { score, level } = result;

  // Visual cues based on stress level
  const statusConfig = {
    low: {
      color: 'text-brand-green',
      bg: 'bg-brand-green/10',
      border: 'border-brand-green/20',
      icon: CheckCircle,
      message: 'Wait',
      description: 'Your crops have adequate water. No irrigation is needed at this time.'
    },
    medium: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: Info,
      message: 'Monitor',
      description: 'Stress levels are rising. Keep an eye on the weather and prepare to irrigate.'
    },
    high: {
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertTriangle,
      message: 'Irrigate Now',
      description: 'Critical water stress detected! Immediate irrigation is recommended to prevent yield loss.'
    }
  };

  const config = statusConfig[level];
  const Icon = config.icon;

  return (
    <div className={`p-8 rounded-3xl shadow-sm border ${config.border} bg-white animate-fade-in-up mt-8 relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full ${config.bg} -z-10`}></div>
      
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        
        {/* Score visualization */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 283} 283`}
                className={`transition-all duration-1000 ease-out ${config.color}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-brand-dark">{Math.round(score)}</span>
              <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Score</span>
            </div>
          </div>
        </div>

        {/* Recommendation Content */}
        <div className="flex-grow space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 text-sm font-medium text-text-muted">
            <Activity className="h-4 w-4" />
            AI Analysis Complete
          </div>
          
          <div>
            <h3 className={`text-2xl font-bold flex items-center justify-center md:justify-start gap-2 ${config.color}`}>
              <Icon className="h-6 w-6" />
              Action: {config.message}
            </h3>
            <p className="mt-2 text-text-muted text-lg leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
