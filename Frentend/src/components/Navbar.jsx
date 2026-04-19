import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout, Home, Droplets, LayoutDashboard, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="bg-brand-green/10 p-2 rounded-xl group-hover:bg-brand-green/20 transition-colors">
                <Sprout className="h-6 w-6 text-brand-green-dark" />
              </div>
              <span className="font-bold text-xl text-brand-dark tracking-tight">
                Irriga-Sense
              </span>
            </NavLink>
          </div>
          
          <div className="flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) => `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-brand-green/10 text-brand-green-dark font-medium' : 'text-text-muted hover:bg-gray-50 hover:text-brand-dark'}`}
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink
                  to="/predict"
                  className={({ isActive }) => `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-brand-blue/10 text-brand-blue-dark font-medium' : 'text-text-muted hover:bg-gray-50 hover:text-brand-dark'}`}
                >
                  <Droplets className="h-4 w-4" />
                  <span className="hidden sm:inline">Predict</span>
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-brand-green/10 text-brand-green-dark font-medium' : 'text-text-muted hover:bg-gray-50 hover:text-brand-dark'}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </NavLink>
              </>
            )}
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-2 text-text-muted">
                  <UserCircle className="h-4 w-4" />
                  <span className="text-sm">{user?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-text-muted hover:bg-gray-50 hover:text-brand-dark transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-brand-blue/10 text-brand-blue-dark font-medium' : 'text-text-muted hover:bg-gray-50 hover:text-brand-dark'}`}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) => `px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-brand-green/10 text-brand-green-dark font-medium' : 'bg-brand-green text-white hover:bg-brand-green-dark'}`}
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
