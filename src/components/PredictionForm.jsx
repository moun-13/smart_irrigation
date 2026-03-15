import React, { useState } from 'react';
import { Thermometer, CloudRain, Droplets, Leaf } from 'lucide-react';

const formFields = [
  { id: 'temperature', label: 'Temperature (°C)', icon: Thermometer, placeholder: 'e.g., 25', type: 'number' },
  { id: 'rainfall', label: 'Rainfall (mm)', icon: CloudRain, placeholder: 'e.g., 10', type: 'number' },
  { id: 'soilMoisture', label: 'Soil Moisture (%)', icon: Droplets, placeholder: 'e.g., 40', type: 'number' }
];

const cropTypes = ['Wheat', 'Corn', 'Rice', 'Soybeans', 'Cotton', 'Tomatoes'];

const PredictionForm = ({ onSubmit, isPredicting }) => {
  const [formData, setFormData] = useState({
    temperature: '',
    rainfall: '',
    soilMoisture: '',
    cropType: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-green to-brand-blue"></div>
      
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Enter Environmental Data</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id} className="block text-sm font-medium text-text-main flex items-center gap-2">
                <field.icon className="h-4 w-4 text-brand-blue" />
                {field.label}
              </label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                required
                placeholder={field.placeholder}
                value={formData[field.id]}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              />
            </div>
          ))}

          <div className="space-y-2">
            <label htmlFor="cropType" className="block text-sm font-medium text-text-main flex items-center gap-2">
              <Leaf className="h-4 w-4 text-brand-green" />
              Crop Type
            </label>
            <select
              id="cropType"
              name="cropType"
              required
              value={formData.cropType}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white appearance-none"
            >
              <option value="" disabled>Select crop type</option>
              {cropTypes.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPredicting}
          className="w-full mt-8 py-4 rounded-xl font-bold text-white bg-brand-green hover:bg-brand-green-dark transition-all duration-300 shadow-md shadow-brand-green/20 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isPredicting ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
              Analyzing Data...
            </span>
          ) : (
            'Predict Water Stress'
          )}
        </button>
      </form>
    </div>
  );
};

export default PredictionForm;
