import React from 'react';
import { Menu, X, Sparkles } from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: 'home' | 'converter') => void;
  currentView: 'home' | 'converter';
  user?: any;
  onAuthClick: () => void;
  onScrollToConverter?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentView, user, onAuthClick, onScrollToConverter }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="bg-black shadow-4k sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="relative p-1 hover:scale-110 transition-all duration-500 animate-premium-float shadow-neon">
              <img 
                src="/The Woof.png" 
                alt="DOCMe Logo" 
                className="h-28 w-28 object-contain filter drop-shadow-2xl logo-image-rounded"
              />
            </div>
            <div className="logo-ultra-4k">
              <span className="text-4xl font-black logo-curved logo-3d logo-premium-glow hover:scale-110 transition-all duration-700 cursor-pointer">
                DOCMe
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-10">
            <button 
              onClick={() => onNavigate('home')}
              className={`font-bold text-lg transition-all duration-300 relative ${
                currentView === 'home' 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600 hover:scale-105'
              }`}
            >
              Home
              {currentView === 'home' && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              )}
            </button>
            <button 
              onClick={() => {
                if (currentView === 'home' && onScrollToConverter) {
                  onScrollToConverter();
                } else {
                  onNavigate('home');
                  setTimeout(() => {
                    if (onScrollToConverter) {
                      onScrollToConverter();
                    }
                  }, 100);
                }
              }}
              className="font-bold text-lg text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105"
            >
              Convert Files
            </button>
            <button className="font-bold text-lg text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105">
              Pricing
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-semibold">
                  Welcome, {user.email}
                </span>
                <div className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                  {user.planType || 'Free'}
                </div>
              </div>
            ) : (
              <button 
                onClick={onAuthClick}
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Sign In</span>
                </div>
              </button>
            )}
          </nav>

          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-200">
            <div className="flex flex-col space-y-6">
              <button 
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className={`text-left font-bold text-lg ${
                  currentView === 'home' ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => {
                  if (currentView === 'home' && onScrollToConverter) {
                    onScrollToConverter();
                  } else {
                    onNavigate('home');
                    setTimeout(() => {
                      if (onScrollToConverter) {
                        onScrollToConverter();
                      }
                    }, 100);
                  }
                  setMobileMenuOpen(false);
                }}
                className="text-left font-bold text-lg text-gray-700"
              >
                Convert Files
              </button>
              <button className="text-left font-bold text-lg text-gray-700">
                Pricing
              </button>
              {!user && (
                <button 
                  onClick={onAuthClick}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold w-fit flex items-center space-x-2 shadow-lg"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;