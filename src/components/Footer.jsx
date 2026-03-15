import React from 'react';
import { Sprout } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-brand-green opacity-80" />
          <span className="font-semibold text-brand-dark">Irriga-Sense</span>
        </div>
        <p className="text-sm text-text-muted text-center md:text-left">
          &copy; {new Date().getFullYear()} Smart Irrigation Advisor. Predicting plant stress with environmental data.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
