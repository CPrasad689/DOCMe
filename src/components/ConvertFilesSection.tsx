import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, FileVideo, Music, Archive, Download, Sparkles, ArrowRight, Cloud, Zap, Shield, FileSpreadsheet, Presentation } from 'lucide-react';

interface ConvertFilesSectionProps {
  onFileSelect: (file: File) => void;
}

const ConvertFilesSection: React.FC<ConvertFilesSectionProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced format support matching the Spring Boot API
  const supportedFormats = [
    // Document formats
    { category: 'Documents', formats: ['PDF', 'DOCX', 'DOC', 'TXT', 'RTF', 'ODT', 'HTML', 'EPUB'], icon: '📄', color: 'blue' },
    // Image formats  
    { category: 'Images', formats: ['JPEG', 'PNG', 'WebP', 'GIF', 'BMP', 'TIFF', 'SVG', 'ICO'], icon: '🖼️', color: 'purple' },
    // Spreadsheet formats
    { category: 'Spreadsheets', formats: ['XLSX', 'XLS', 'CSV', 'ODS'], icon: '📊', color: 'green' },
    // Presentation formats
    { category: 'Presentations', formats: ['PPTX', 'PPT', 'ODP'], icon: '📈', color: 'orange' },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'ico'].includes(extension || '')) {
      return <Image className="h-6 w-6 text-blue-500" />;
    }
    if (type.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
      return <FileVideo className="h-6 w-6 text-purple-500" />;
    }
    if (type.startsWith('audio/') || ['mp3', 'wav', 'flac'].includes(extension || '')) {
      return <Music className="h-6 w-6 text-green-500" />;
    }
    if (['xlsx', 'xls', 'csv', 'ods'].includes(extension || '')) {
      return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
    }
    if (['pptx', 'ppt', 'odp'].includes(extension || '')) {
      return <Presentation className="h-6 w-6 text-orange-500" />;
    }
    if (type.includes('pdf') || ['docx', 'doc', 'txt', 'rtf', 'odt', 'html', 'epub'].includes(extension || '')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    return <Archive className="h-6 w-6 text-gray-500" />;
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF', icon: FileText, color: 'from-red-500 to-red-600' },
    { value: 'docx', label: 'DOCX', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { value: 'txt', label: 'TXT', icon: FileText, color: 'from-gray-500 to-gray-600' },
    { value: 'jpeg', label: 'JPEG', icon: Image, color: 'from-yellow-500 to-yellow-600' },
    { value: 'png', label: 'PNG', icon: Image, color: 'from-green-500 to-green-600' },
    { value: 'webp', label: 'WebP', icon: Image, color: 'from-purple-500 to-purple-600' },
    { value: 'xlsx', label: 'XLSX', icon: FileSpreadsheet, color: 'from-emerald-500 to-emerald-600' },
    { value: 'pptx', label: 'PPTX', icon: Presentation, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <section id="convert-files-section" className="py-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="logo-ultra-4k inline-block">
            <h2 className="text-6xl font-black mb-6 logo-curved logo-3d logo-premium-glow">
              Convert Files
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform any document or image instantly with our advanced conversion engine. 
            Drag, drop, and convert in seconds with professional quality results.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Upload Area - Takes 3 columns */}
          <div className="lg:col-span-3">
            <div
              className={`upload-area rounded-3xl p-12 text-center cursor-pointer transition-all duration-500 min-h-[400px] flex flex-col justify-center ${
                isDragOver ? 'drag-over' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
              
              {!selectedFile ? (
                <>
                  <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-8 animate-premium-float shadow-neon">
                      <Upload className="h-16 w-16 text-white" />
                    </div>
                  </div>

                  <h3 className="text-4xl font-bold mb-4 text-gray-800">
                    Drop files here or click to upload
                  </h3>
                  <p className="text-xl text-gray-500 mb-8">
                    Support for 100+ file formats including documents, images, videos, and more
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2 mb-8 text-sm text-gray-400">
                    <span className="px-3 py-1 bg-white/50 rounded-full">PDF</span>
                    <span className="px-3 py-1 bg-white/50 rounded-full">DOCX</span>
                    <span className="px-3 py-1 bg-white/50 rounded-full">XLSX</span>
                    <span className="px-3 py-1 bg-white/50 rounded-full">PPTX</span>
                    <span className="px-3 py-1 bg-white/50 rounded-full">PNG</span>
                    <span className="px-3 py-1 bg-white/50 rounded-full">JPEG</span>
                    <span className="px-3 py-1 bg-white/50 rounded-full">WebP</span>
                    <span className="px-3 py-1 bg-white/50 rounded-full">23+ Formats</span>
                  </div>
                  
                  <button className="glass-premium px-10 py-4 rounded-2xl text-blue-600 font-bold text-lg hover:scale-105 transition-all duration-300 shadow-neon inline-flex items-center space-x-3">
                    <Sparkles className="h-6 w-6" />
                    <span>Choose Files</span>
                  </button>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-premium-float">
                    {getFileIcon(selectedFile)}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">File Selected</h3>
                    <div className="text-lg font-semibold text-gray-700">{selectedFile.name}</div>
                    <div className="text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 underline"
                  >
                    Choose different file
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Format Selection & Features - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Output Format Selection */}
            <div className="glass-4k rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <ArrowRight className="h-6 w-6 mr-2 text-blue-500" />
                Convert To
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {formatOptions.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setOutputFormat(format.value)}
                    className={`p-3 rounded-xl transition-all duration-300 flex flex-col items-center space-y-2 ${
                      outputFormat === format.value
                        ? `bg-gradient-to-r ${format.color} text-white shadow-neon scale-105`
                        : 'bg-white/50 hover:bg-white/70 text-gray-700 hover:scale-102'
                    }`}
                  >
                    <format.icon className="h-5 w-5" />
                    <span className="font-semibold text-xs">{format.label}</span>
                  </button>
                ))}
              </div>

              {selectedFile && outputFormat && (
                <button className="w-full mt-6 gradient-4k text-white py-4 rounded-xl font-bold text-lg animate-ultra-glow hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Download className="h-6 w-6" />
                  <span>Convert Now</span>
                </button>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="glass-4k rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Lightning Fast</h4>
                <p className="text-sm text-gray-600">Convert files in seconds with our optimized engine</p>
              </div>
              
              <div className="glass-4k rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Secure & Private</h4>
                <p className="text-sm text-gray-600">Your files are processed securely and deleted after conversion</p>
              </div>
              
              <div className="glass-4k rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Cloud className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Cloud Powered</h4>
                <p className="text-sm text-gray-600">No software installation required, works in your browser</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Format Support Grid */}
        <div className="mt-20">
          <h3 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Complete Format Support
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {supportedFormats.map((category, index) => (
              <div key={index} className="glass-4k rounded-2xl p-6 border border-white/20 hover:bg-white/80 transition-all duration-300 group">
                <div className="text-center mb-4">
                  <span className="text-4xl mb-2 block">{category.icon}</span>
                  <h4 className="text-xl font-semibold text-gray-800 mb-3">{category.category}</h4>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {category.formats.map((format, formatIndex) => (
                    <span 
                      key={formatIndex}
                      className={`px-3 py-1 bg-gradient-to-r from-${category.color}-100 to-${category.color}-200 text-${category.color}-700 rounded-full text-sm font-medium border border-${category.color}-300 group-hover:from-${category.color}-200 group-hover:to-${category.color}-300 transition-all duration-200`}
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConvertFilesSection;
