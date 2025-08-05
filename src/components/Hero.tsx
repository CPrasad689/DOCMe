import React from 'react';
import { ArrowRight, Sparkles, Shield, Zap, Play, Star, Rocket, Globe } from 'lucide-react';

interface HeroProps {
  onStartConverting: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartConverting }) => {
  return (
    <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-32 left-1/4 animate-bounce delay-300">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-48 right-1/4 animate-bounce delay-700">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-40 left-1/3 animate-bounce delay-1000">
          <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-60"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 text-sm font-medium text-blue-800 mb-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-blue-200/50 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
              AI-Powered Document Processing
            </span>
            <div className="ml-2 flex space-x-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">
              Convert Any File
            </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block animate-gradient-x bg-300% relative">
              Instantly & Securely
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-lg -z-10 animate-pulse"></div>
            </span>
          </h1>
          
          <p className="text-2xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed font-medium">
            Transform your documents with our 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold"> AI-powered conversion platform</span>. 
            Support for <span className="text-blue-600 font-bold">100+ file formats</span> with enterprise-grade security and lightning-fast processing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          <button 
            onClick={onStartConverting}
            className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center">
              <Rocket className="mr-3 h-6 w-6 group-hover:animate-bounce" />
              Start Converting Now
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
          
          <button className="relative border-2 border-gray-300 text-gray-700 px-12 py-5 rounded-2xl font-bold text-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center justify-center group bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-xl transform hover:scale-105">
            <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
            Watch Demo
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group flex items-center justify-center space-x-4 p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/50">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900 text-lg mb-1">100% Secure</h3>
              <p className="text-gray-600 font-medium">End-to-end encryption</p>
              <div className="flex items-center mt-2">
                <Globe className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600 font-semibold">SSL Protected</span>
              </div>
            </div>
          </div>
          
          <div className="group flex items-center justify-center space-x-4 p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/50">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-yellow-500 to-orange-600 p-4 rounded-2xl">
                <Zap className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900 text-lg mb-1">Lightning Fast</h3>
              <p className="text-gray-600 font-medium">Process in seconds</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs text-yellow-600 font-semibold">Real-time Processing</span>
              </div>
            </div>
          </div>
          
          <div className="group flex items-center justify-center space-x-4 p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/50">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl">
                <Sparkles className="h-10 w-10 text-white animate-pulse" />
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900 text-lg mb-1">AI Enhanced</h3>
              <p className="text-gray-600 font-medium">Smart optimization</p>
              <div className="flex items-center mt-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-xs text-purple-600 font-semibold ml-2">AI Powered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 flex flex-col items-center">
          <p className="text-gray-500 font-medium mb-6">Trusted by 10M+ users worldwide</p>
          <div className="flex items-center space-x-8 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-gray-600 font-semibold">Google Drive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-gray-600 font-semibold">Dropbox</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="text-gray-600 font-semibold">OneDrive</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;