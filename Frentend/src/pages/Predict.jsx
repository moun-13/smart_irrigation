import React, { useState } from 'react';
import PredictionForm from '../components/PredictionForm';
import ResultCard from '../components/ResultCard';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';

const Predict = () => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handlePredict = async (data) => {
    setIsPredicting(true);
    setResult(null);
    setError('');

    try {
      const payload = {
        temperature: parseFloat(data.temperature),
        rainfall: parseFloat(data.rainfall),
        soil_moisture: parseFloat(data.soilMoisture),
        crop_type: data.cropType,
      };
      const prediction = await api.predict(token, payload);
      setResult({
        score: prediction.water_stress,
        level: prediction.level,
        recommendedWater: prediction.recommended_water_l_m2,
        frequencyDays: prediction.irrigation_frequency_days,
        explanation: prediction.explanation,
        timestamp: prediction.timestamp,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleRepredict = () => {
    setResult(null);
  };

  return (
    <div className="flex-grow bg-brand-light/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Water Stress Prediction</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Input environmental parameters below to get an AI-powered assessment of your crop's irrigation needs.
          </p>
        </div>

        <PredictionForm onSubmit={handlePredict} isPredicting={isPredicting} />
        {error && (
          <p className="mt-6 text-center text-red-500 font-medium">{error}</p>
        )}
        
        {result && <ResultCard result={result} onRepredict={handleRepredict} />}
        
      </div>
    </div>
  );
};

export default Predict;
