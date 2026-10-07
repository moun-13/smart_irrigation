import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Sprout, BarChart3, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col flex-grow">
      {/* Hero Section */}
      <section className="relative bg-brand-light overflow-hidden flex-grow flex items-center justify-center py-20 lg:py-32">
        
        {/* Decorative background vectors */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-green/10 blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-brand-blue/10 blur-3xl opacity-60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-brand-green/20 mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-brand-green animate-pulse"></span>
            <span className="text-sm font-medium text-brand-green-dark">Smart Agriculture Solutions</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-dark tracking-tight mb-6">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">Irriga-Sense</span>
          </h1>
          
          <p className="mt-4 text-xl md:text-2xl text-text-muted max-w-3xl mx-auto font-light leading-relaxed mb-10">
            An AI-powered irrigation assistant that predicts plant water stress using environmental data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate(isAuthenticated ? '/predict' : '/signup')}
              className="group px-8 py-4 text-lg font-semibold rounded-2xl bg-brand-green hover:bg-brand-green-dark text-white shadow-lg shadow-brand-green/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
            >
              {isAuthenticated ? 'Start Prediction' : 'Create Account'}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="px-8 py-4 text-lg font-semibold rounded-2xl bg-white text-brand-dark border-2 border-gray-100 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all duration-300"
            >
              {isAuthenticated ? 'View Dashboard' : 'Login'}
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Why choose Irriga-Sense?</h2>
            <div className="w-20 h-1 bg-brand-green mx-auto rounded-full opacity-50"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-brand-light p-8 rounded-3xl border border-brand-green/10 hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Droplet className="h-7 w-7 text-brand-blue" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Save Water</h3>
              <p className="text-text-muted leading-relaxed">
                Optimize your water usage by only irrigating when your crops truly need it, reducing waste and lowering costs.
              </p>
            </div>
            
            <div className="bg-brand-light p-8 rounded-3xl border border-brand-green/10 hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sprout className="h-7 w-7 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Improve Crop Health</h3>
              <p className="text-text-muted leading-relaxed">
                Prevent both under-watering and over-watering to maintain optimal plant stress levels for maximum yield.
              </p>
            </div>
            
            <div className="bg-brand-light p-8 rounded-3xl border border-brand-green/10 hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Data-Driven Decisions</h3>
              <p className="text-text-muted leading-relaxed">
                Move away from guesswork. Leverage environmental data and AI to schedule irrigation scientifically.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
