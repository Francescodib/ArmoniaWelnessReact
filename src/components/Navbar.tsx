import React, { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  username: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ username, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="lg" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <span className="text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Benvenuto, <span className="text-indigo-600 font-semibold">{username}</span>
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <div className="hidden md:block">
            <button
              onClick={onLogout}
              className="btn-outline flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
            <div className="px-3 py-2 text-sm text-gray-700">
              Benvenuto, <span className="text-indigo-600 font-semibold">{username}</span>
            </div>
            <button
              onClick={onLogout}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-md flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

