import React, { useState, useCallback } from 'react';
import { Upload, FileText, Download, Sparkles, AlertCircle, CheckCircle, Loader, Zap, Shield, Cloud, X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FileConverterProps {
  user?: any;
  onAuthRequired: () => void;
}

interface ConversionTask {
  id: string;
  fileName: string;
  fromFormat: string;
  toFormat: string;
  status: 'uploading' | 'converting' | 'completed' | 'error';
  progress: number;
  downloadUrl?: string;
}

const FileConverter: React.FC<FileConverterProps> = ({ user, onAuthRequired }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [tasks, setTasks] = useState<ConversionTask[]>([]);

  const formats = [
    { value: 'pdf', label: 'PDF', color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300', icon: '📄' },
    { value: 'docx', label: 'Word', color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300', icon: '📝' },
    { value: 'xlsx', label: 'Excel', color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300', icon: '📊' },
    { value: 'pptx', label: 'PowerPoint', color: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300', icon: '📈' },
    { value: 'jpg', label: 'JPG', color: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300', icon: '🖼️' },
    { value: 'png', label: 'PNG', color: 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border-pink-300', icon: '🎨' },
    { value: 'webp', label: 'WebP', color: 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border-indigo-300', icon: '🌐' },
    { value: 'mp4', label: 'MP4', color: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300', icon: '🎬' }
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [selectedFormat]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, [selectedFormat]);

  const handleFiles = (files: File[]) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    files.forEach(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const taskId = Math.random().toString(36).substr(2, 9);
      
      const newTask: ConversionTask = {
        id: taskId,
        fileName: file.name,
        fromFormat: fileExtension,
        toFormat: selectedFormat,
        status: 'uploading',
        progress: 0
      };

      setTasks(prev => [...prev, newTask]);

      // Start actual conversion process
      startConversion(file, taskId);
    });
  };

  const startConversion = async (file: File, taskId: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetFormat', selectedFormat);
      formData.append('aiEnhanced', 'true');
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://docme.org.in/api';

      const response = await fetch(`${apiUrl}/conversion/convert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const { conversionId } = await response.json();
      
      // Poll for conversion status
      pollConversionStatus(conversionId, taskId);

    } catch (error) {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'error' }
          : task
      ));
    }
  };

  const pollConversionStatus = async (conversionId: string, taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://docme.org.in/api';
        const response = await fetch(`${apiUrl}/conversion/status/${conversionId}`, {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to get status');
        }

        const status = await response.json();
        
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: status.status,
                progress: status.progress,
                downloadUrl: status.downloadUrl
              }
            : task
        ));

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(pollInterval);
        }

      } catch (error) {
        clearInterval(pollInterval);
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status: 'error' }
            : task
        ));
      }
    }, 2000);
  };

  const getStatusIcon = (status: ConversionTask['status']) => {
    switch (status) {
      case 'uploading':
      case 'converting':
        return <Loader className="h-5 w-5 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusText = (status: ConversionTask['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'converting':
        return 'Converting...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block animate-gradient-x bg-300%">
              File Converter
            </span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
            Upload your files and convert them to any format instantly. 
            Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">advanced engine ensures perfect quality</span> and format compatibility.
          </p>
        </div>

        {/* Format Selection */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Output Format:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {formats.map((format) => (
              <button
                key={format.value}
                onClick={() => setSelectedFormat(format.value)}
                className={`relative p-4 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${
                  selectedFormat === format.value
                    ? 'ring-4 ring-blue-500 ring-offset-2 transform scale-110 shadow-xl'
                    : 'hover:scale-105 shadow-lg hover:shadow-xl'
                } ${format.color}`}
              >
                <div className="text-2xl mb-2">{format.icon}</div>
                <div className="font-bold">{format.label}</div>
                {selectedFormat === format.value && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-4 border-dashed rounded-3xl p-16 text-center transition-all duration-500 bg-white/80 backdrop-blur-sm ${
            dragOver 
              ? 'border-blue-500 bg-blue-50 shadow-2xl scale-105' 
              : 'border-gray-300 hover:border-blue-400 shadow-xl hover:shadow-2xl'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-3xl mb-8 shadow-2xl">
              <Upload className="h-12 w-12 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Drop files here or click to upload
            </h3>
            <p className="text-xl text-gray-600 mb-8 font-medium">
              Choose your files and select the desired output format
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold">
              <div className="flex items-center bg-purple-100 px-4 py-2 rounded-full">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                <span className="text-purple-800">AI Enhanced</span>
              </div>
              <div className="flex items-center bg-blue-100 px-4 py-2 rounded-full">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                <span className="text-blue-800">Batch Processing</span>
              </div>
              <div className="flex items-center bg-green-100 px-4 py-2 rounded-full">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                <span className="text-green-800">Secure & Private</span>
              </div>
              <div className="flex items-center bg-orange-100 px-4 py-2 rounded-full">
                <Cloud className="h-5 w-5 mr-2 text-orange-600" />
                <span className="text-orange-800">Cloud Storage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Tasks */}
        {tasks.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-gray-900">Conversion Tasks</h3>
              <button 
                onClick={() => setTasks([])}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            </div>
            <div className="space-y-6">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(task.status)}
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{task.fileName}</h4>
                        <p className="text-gray-600 font-medium">
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold">
                            {task.fromFormat.toUpperCase()}
                          </span>
                          <span className="mx-3 text-blue-600">→</span>
                          <span className="bg-blue-100 px-3 py-1 rounded-full text-sm font-bold text-blue-800">
                            {task.toFormat.toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <span className="text-lg font-bold text-gray-700">
                        {getStatusText(task.status)}
                      </span>
                      {task.status === 'completed' && (
                        <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                          <Download className="h-5 w-5" />
                          <span>Download</span>
                        </button>
                      )}
                      {task.status === 'error' && (
                        <button className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                          <Plus className="h-5 w-5" />
                          <span>Retry</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {task.status !== 'error' && (
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500 relative overflow-hidden"
                          style={{ width: `${task.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-semibold text-gray-600">
                          {Math.round(task.progress)}% complete
                        </span>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span>Processing with AI</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {task.status === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                      <div className="flex items-center space-x-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-semibold">Conversion failed. Please try again or contact support.</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Batch Actions */}
            {tasks.length > 1 && (
              <div className="mt-8 flex justify-center">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3">
                  <Download className="h-6 w-6" />
                  <span>Download All ({tasks.filter(t => t.status === 'completed').length} files)</span>
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Features Banner */}
        {tasks.length === 0 && (
          <div className="mt-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Why Choose DOCMe?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <div className="bg-white/20 p-4 rounded-2xl mb-3">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h4 className="font-bold mb-2">AI-Powered</h4>
                <p className="text-sm opacity-90">Smart optimization for perfect results</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white/20 p-4 rounded-2xl mb-3">
                  <Shield className="h-8 w-8" />
                </div>
                <h4 className="font-bold mb-2">100% Secure</h4>
                <p className="text-sm opacity-90">Your files are encrypted and auto-deleted</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white/20 p-4 rounded-2xl mb-3">
                  <Zap className="h-8 w-8" />
                </div>
                <h4 className="font-bold mb-2">Lightning Fast</h4>
                <p className="text-sm opacity-90">Convert files in seconds, not minutes</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileConverter;