import React from 'react';
import { FileText, Image, FileVideo, Music, Archive, Code, Database, Palette, Cpu, Layers, Zap, Shield } from 'lucide-react';

const Features: React.FC = () => {
  const categories = [
    {
      title: 'Document Conversion',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      formats: ['PDF ↔ Word', 'PDF ↔ Excel', 'PDF ↔ PowerPoint', 'HTML ↔ PDF'],
      description: 'Professional document processing with AI optimization'
    },
    {
      title: 'Image Processing',
      icon: Image,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      formats: ['JPG ↔ PNG', 'WebP ↔ JPEG', 'HEIC ↔ JPG', 'SVG ↔ PNG'],
      description: 'Advanced image enhancement and format conversion'
    },
    {
      title: 'Video & Audio',
      icon: FileVideo,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      formats: ['MP4 ↔ AVI', 'MP3 ↔ WAV', 'MOV ↔ MP4', 'FLAC ↔ MP3'],
      description: 'High-quality media conversion with compression options'
    },
    {
      title: 'Archive & Code',
      icon: Archive,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      formats: ['ZIP ↔ RAR', 'JSON ↔ CSV', 'XML ↔ JSON', 'YAML ↔ JSON'],
      description: 'Developer-friendly data format transformations'
    }
  ];

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50" id="features">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 text-sm font-bold text-blue-800 mb-8 shadow-lg">
            <Cpu className="h-5 w-5 mr-2" />
            Powered by Advanced AI Technology
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              100+ File Formats
            </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block animate-gradient-x bg-300%">
              All in One Platform
            </span>
          </h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
            Convert between any file format with our advanced AI-powered conversion engine. 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">Fast, accurate, and secure processing</span> for all your document needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-10">
          {categories.map((category, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 border border-gray-100 overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Layers className="h-16 w-16 text-gray-400" />
              </div>
              
              <div className="relative z-10">
                <div className={`inline-flex p-5 rounded-3xl bg-gradient-to-r ${category.color} mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <category.icon className="h-10 w-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  {category.title}
                </h3>
                
                <p className="text-gray-600 mb-6 font-medium">
                  {category.description}
                </p>
                
                <div className="space-y-4">
                  {category.formats.map((format, formatIndex) => (
                    <div 
                      key={formatIndex}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group-hover:bg-white transition-colors duration-300 shadow-sm"
                    >
                      <span className="text-gray-800 font-bold">{format}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
                        <Zap className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-8 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 rounded-2xl font-bold hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                  <div className="flex items-center justify-center">
                    <Shield className="h-5 w-5 mr-2" />
                    View All Formats
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-8 py-4 text-xl font-bold text-orange-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <Palette className="h-5 w-5 mr-2" />
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              New formats added weekly with AI improvements
            </span>
          </div>
          
          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-black text-blue-600 mb-2">100+</div>
              <div className="text-gray-600 font-semibold">File Formats</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-green-600 mb-2">10M+</div>
              <div className="text-gray-600 font-semibold">Files Converted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600 font-semibold">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600 font-semibold">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;