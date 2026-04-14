import React, { useState } from 'react';
import PredictionForm from '../components/PredictionForm';
import ResultCard from '../components/ResultCard';

const Predict = () => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState(null);

  const handlePredict = (data) => {
    setIsPredicting(true);
    setResult(null);

    // Simulate ML API call with a realistic delay
    setTimeout(() => {
      // Dummy logic for calculating stress score based on input values
      const temp = parseFloat(data.temperature);
      const rain = parseFloat(data.rainfall);
      const moisture = parseFloat(data.soilMoisture);

      // Higher temp, lower rain, lower moisture = higher stress
      let score = (temp * 2) - (rain * 1.5) + ((100 - moisture) * 0.8);
      
      // Clamp between 0 and 100
      score = Math.max(0, Math.min(100, score));
      
      let level = 'low';
      if (score >= 70) level = 'high';
      else if (score >= 40) level = 'medium';

      setResult({
        score,
        level,
        timestamp: new Date().toISOString()
      });
      setIsPredicting(false);
    }, 1500);
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
        
        {result && <ResultCard result={result} />}
        
      </div>
    </div>
  );
};

export default Predict;
