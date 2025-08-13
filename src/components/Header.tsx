import React from 'react';
import { Menu, X, Sparkles, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: 'home' | 'converter' | 'about' | 'privacy' | 'terms' | 'contact') => void;
  currentView: 'home' | 'converter' | 'about' | 'privacy' | 'terms' | 'contact';
  user?: { id: string; email: string; planType?: string } | null;
  onAuthClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentView, user, onAuthClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = React.useState(false);
  const [mobileAboutDropdownOpen, setMobileAboutDropdownOpen] = React.useState(false);

  return (
    <header className="bg-black shadow-4k sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-1">
          <div className="flex items-center cursor-pointer mt-3" onClick={() => onNavigate('home')}>
            {/* Logo Image - Animated 4K with floating effect and rounded corners */}
            <div className="relative">
              <img 
                src="/The Woof.png" 
                alt="DOCMe Logo" 
                className="h-28 w-28 mr-4 object-contain animate-float hover:scale-110 transition-all duration-700 filter drop-shadow-2xl rounded-2xl"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5)) drop-shadow(0 0 40px rgba(139, 92, 246, 0.3))',
                  animation: 'float 3s ease-in-out infinite, glow 2s ease-in-out infinite alternate'
                }}
              />
              {/* 4K Glow Effect */}
              <div className="absolute inset-0 h-28 w-28 mr-4 bg-gradient-to-r from-blue-400/30 via-purple-500/30 to-pink-400/30 rounded-2xl blur-xl animate-pulse opacity-60"></div>
              <div className="absolute inset-0 h-28 w-28 mr-4 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl animate-ping opacity-40"></div>
            </div>
            {/* DOCMe Text */}
            <div className="logo-ultra-4k">
              <span className="text-4xl font-black logo-curved logo-3d logo-premium-glow hover:scale-110 transition-all duration-700 cursor-pointer">
                DOCMe
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => onNavigate('home')}
              className={`font-bold text-xl transition-all duration-700 relative group ${
                currentView === 'home' 
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient-x' 
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% hover:animate-gradient-x hover:scale-110'
              }`}
            >
              <span className="relative logo-3d logo-premium-glow">
                Home
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 animate-pulse"></div>
              </span>
              {currentView === 'home' && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full animate-pulse"></div>
              )}
            </button>
            <button 
              onClick={() => onNavigate('converter')}
              className={`font-bold text-xl transition-all duration-700 relative group ${
                currentView === 'converter' 
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient-x' 
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% hover:animate-gradient-x hover:scale-110'
              }`}
            >
              <span className="relative logo-3d logo-premium-glow">
                Convert
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 animate-pulse"></div>
              </span>
              {currentView === 'converter' && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full animate-pulse"></div>
              )}
            </button>
            
            {/* About Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                onMouseEnter={() => setAboutDropdownOpen(true)}
                className={`font-bold text-xl transition-all duration-700 relative group flex items-center ${
                  ['about', 'privacy', 'terms', 'contact'].includes(currentView)
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient-x' 
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% hover:animate-gradient-x hover:scale-110'
                }`}
              >
                <span className="relative logo-3d logo-premium-glow">
                  About
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 animate-pulse"></div>
                </span>
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
                {['about', 'privacy', 'terms', 'contact'].includes(currentView) && (
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full animate-pulse"></div>
                )}
              </button>
              
              {/* Dropdown Menu */}
              {aboutDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 z-50"
                  onMouseLeave={() => setAboutDropdownOpen(false)}
                >
                  <div className="py-2">
                    <button
                      onClick={() => {
                        onNavigate('about');
                        setAboutDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-lg font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 ${
                        currentView === 'about' ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800' : 'text-gray-700 hover:text-blue-700'
                      }`}
                    >
                      About Us
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('privacy');
                        setAboutDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-lg font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 ${
                        currentView === 'privacy' ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800' : 'text-gray-700 hover:text-blue-700'
                      }`}
                    >
                      Privacy Policy
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('terms');
                        setAboutDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-lg font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 ${
                        currentView === 'terms' ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800' : 'text-gray-700 hover:text-blue-700'
                      }`}
                    >
                      Terms of Service
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('contact');
                        setAboutDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-lg font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-b-2xl ${
                        currentView === 'contact' ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800' : 'text-gray-700 hover:text-blue-700'
                      }`}
                    >
                      Contact Us
                    </button>
                  </div>
                </div>
              )}
            </div>
            
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
                className={`text-left font-bold text-xl transition-all duration-700 ${
                  currentView === 'home' 
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient-x logo-3d logo-premium-glow' 
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% hover:animate-gradient-x logo-3d'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => {
                  onNavigate('converter');
                  setMobileMenuOpen(false);
                }}
                className={`text-left font-bold text-xl transition-all duration-700 ${
                  currentView === 'converter' 
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient-x logo-3d logo-premium-glow' 
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% hover:animate-gradient-x logo-3d'
                }`}
              >
                Convert Files
              </button>
              
              {/* Mobile About Dropdown */}
              <div className="space-y-2">
                <button 
                  onClick={() => setMobileAboutDropdownOpen(!mobileAboutDropdownOpen)}
                  className={`text-left font-bold text-xl transition-all duration-700 flex items-center justify-between w-full ${
                    ['about', 'privacy', 'terms', 'contact'].includes(currentView)
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient-x logo-3d logo-premium-glow' 
                      : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% hover:animate-gradient-x logo-3d'
                  }`}
                >
                  <span>About</span>
                  <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${mobileAboutDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {mobileAboutDropdownOpen && (
                  <div className="ml-4 space-y-2 border-l-2 border-gradient-to-b from-blue-400 to-purple-400 pl-4">
                    <button 
                      onClick={() => {
                        onNavigate('about');
                        setMobileMenuOpen(false);
                        setMobileAboutDropdownOpen(false);
                      }}
                      className={`text-left font-semibold text-lg transition-all duration-700 block ${
                        currentView === 'about' 
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient-x logo-3d logo-premium-glow' 
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      About Us
                    </button>
                    <button 
                      onClick={() => {
                        onNavigate('privacy');
                        setMobileMenuOpen(false);
                        setMobileAboutDropdownOpen(false);
                      }}
                      className={`text-left font-semibold text-lg transition-all duration-700 block ${
                        currentView === 'privacy' 
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient-x logo-3d logo-premium-glow' 
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      Privacy Policy
                    </button>
                    <button 
                      onClick={() => {
                        onNavigate('terms');
                        setMobileMenuOpen(false);
                        setMobileAboutDropdownOpen(false);
                      }}
                      className={`text-left font-semibold text-lg transition-all duration-700 block ${
                        currentView === 'terms' 
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient-x logo-3d logo-premium-glow' 
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      Terms of Service
                    </button>
                    <button 
                      onClick={() => {
                        onNavigate('contact');
                        setMobileMenuOpen(false);
                        setMobileAboutDropdownOpen(false);
                      }}
                      className={`text-left font-semibold text-lg transition-all duration-700 block ${
                        currentView === 'contact' 
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient-x logo-3d logo-premium-glow' 
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      Contact Us
                    </button>
                  </div>
                )}
              </div>
              
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