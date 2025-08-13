import React from 'react';
import { Users, Target, Zap, Globe, Award, Heart } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-red-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100/50 to-purple-100/50 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-bold text-blue-600 mb-6 border border-blue-200/30">
            <Users className="h-5 w-5 mr-2" />
            Our Story
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            About DOCMe
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing file conversion with cutting-edge technology, making document 
            transformation fast, secure, and accessible to everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <Target className="h-8 w-8 text-blue-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              To democratize file conversion technology by providing fast, secure, and intelligent 
              document transformation services that empower businesses and individuals worldwide.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <Heart className="h-8 w-8 text-blue-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              Privacy, security, and user experience are at the core of everything we do. We believe 
              in transparent practices and building trust through reliable, high-quality services.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose DOCMe?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Zap className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600">
                Advanced algorithms ensure your files are converted in seconds, not minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Globe className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Global Reach</h3>
              <p className="text-gray-600">
                Serving millions of users worldwide with 99.9% uptime and reliable service.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Award className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Award Winning</h3>
              <p className="text-gray-600">
                Recognized for innovation and excellence in document processing technology.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-6">Our Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-black mb-2">10M+</div>
              <div className="text-blue-100">Files Converted</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">50K+</div>
              <div className="text-blue-100">Happy Users</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">100+</div>
              <div className="text-blue-100">File Formats</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Transform Your Files?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied users who trust DOCMe for their file conversion needs.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
