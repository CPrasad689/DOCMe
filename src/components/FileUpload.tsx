import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, FileVideo, Music, Archive, Download, Sparkles, ArrowRight } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (type.startsWith('video/')) return <FileVideo className="h-8 w-8 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="h-8 w-8 text-green-500" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-8 w-8 text-red-500" />;
    return <Archive className="h-8 w-8 text-orange-500" />;
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'docx', label: 'DOCX', icon: FileText },
    { value: 'txt', label: 'TXT', icon: FileText },
    { value: 'jpg', label: 'JPG', icon: Image },
    { value: 'png', label: 'PNG', icon: Image },
    { value: 'webp', label: 'WebP', icon: Image },
    { value: 'mp4', label: 'MP4', icon: FileVideo },
    { value: 'mp3', label: 'MP3', icon: Music },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Upload Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 logo-curved logo-3d">
          Transform Your Files Instantly
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Upload any document or image and convert it to your desired format
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Drag & Drop Area */}
        <div
          className={`upload-area rounded-3xl p-8 lg:p-12 text-center cursor-pointer transition-all duration-300 ${
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
          
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 animate-premium-float">
              <Upload className="h-12 w-12 text-white" />
            </div>
          </div>

          <h3 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-800">
            Drag your file here
          </h3>
          <p className="text-base lg:text-lg text-gray-500 mb-6">
            Document or Image
          </p>
          
          <div className="text-sm text-gray-400 mb-4">
            Supported formats: PDF, DOCX, TXT, JPG, PNG, WebP, MP4, MP3, and more
          </div>
          
          <button className="glass-premium px-8 py-3 rounded-full text-blue-600 font-semibold hover:scale-105 transition-all duration-300 shadow-neon">
            <Sparkles className="h-5 w-5 inline mr-2" />
            Choose File
          </button>
        </div>

        {/* Output Format Selection */}
        <div className="glass-4k rounded-3xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <ArrowRight className="h-6 w-6 mr-2 text-blue-500" />
            Convert To
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {formatOptions.map((format) => (
              <button
                key={format.value}
                onClick={() => setOutputFormat(format.value)}
                className={`p-4 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                  outputFormat === format.value
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-neon'
                    : 'bg-white/50 hover:bg-white/70 text-gray-700'
                }`}
              >
                <format.icon className="h-5 w-5" />
                <span className="font-semibold">{format.label}</span>
              </button>
            ))}
          </div>

          {selectedFile && outputFormat && (
            <div className="mt-8 p-6 bg-white/30 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                Selected File:
              </h4>
              <div className="flex items-center space-x-4 mb-6">
                {getFileIcon(selectedFile)}
                <div>
                  <div className="font-semibold text-gray-800">{selectedFile.name}</div>
                  <div className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              
              <button className="w-full gradient-4k text-white py-4 rounded-xl font-bold text-lg animate-ultra-glow hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
                <Download className="h-6 w-6" />
                <span>Convert to {outputFormat.toUpperCase()}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="text-center p-6 glass-4k rounded-2xl">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
          <p className="text-gray-600">Advanced AI algorithms ensure perfect conversion quality</p>
        </div>
        
        <div className="text-center p-6 glass-4k rounded-2xl">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Multiple Formats</h3>
          <p className="text-gray-600">Support for 100+ file formats and counting</p>
        </div>
        
        <div className="text-center p-6 glass-4k rounded-2xl">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Instant Processing</h3>
          <p className="text-gray-600">Lightning-fast conversion in seconds</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
