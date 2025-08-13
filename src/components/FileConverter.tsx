import React, { useState, useCallback } from 'react';
import { Upload, FileText, Download, Sparkles, AlertCircle, CheckCircle, Loader, Zap, Shield, Cloud, X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FileConverterProps {
  user?: { id: string; email: string } | null;
  onAuthRequired: () => void;
}

interface ConversionTask {
  id: string;
  fileName: string;
  fromFormat: string;
  toFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  errorMessage?: string;
  jobId?: string;
}

interface SupportedFormat {
  value: string;
  label: string;
  color: string;
  icon: string;
  category: 'document' | 'image' | 'spreadsheet' | 'presentation';
}

const FileConverter: React.FC<FileConverterProps> = ({ user, onAuthRequired }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [tasks, setTasks] = useState<ConversionTask[]>([]);

  // AI-powered format support - matching OpenRouter service capabilities
  const formats: SupportedFormat[] = [
    // Text and Document formats (AI-powered conversion)
    { value: 'txt', label: 'Text (TXT)', color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300', icon: '�', category: 'document' },
    { value: 'md', label: 'Markdown (MD)', color: 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border-indigo-300', icon: '📝', category: 'document' },
    { value: 'html', label: 'HTML', color: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300', icon: '🌐', category: 'document' },
    { value: 'rtf', label: 'Rich Text (RTF)', color: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300', icon: '📃', category: 'document' },
    { value: 'pdf', label: 'PDF (Text-based)', color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300', icon: '📄', category: 'document' },
    { value: 'docx', label: 'Word (DOCX)', color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300', icon: '📝', category: 'document' },
    { value: 'odt', label: 'OpenDocument (ODT)', color: 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border-teal-300', icon: '�', category: 'document' },
    
    // Spreadsheet formats (AI-powered conversion)
    { value: 'csv', label: 'CSV', color: 'bg-gradient-to-r from-lime-100 to-lime-200 text-lime-800 border-lime-300', icon: '�', category: 'spreadsheet' },
    { value: 'xlsx', label: 'Excel (XLSX)', color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300', icon: '📊', category: 'spreadsheet' },
    { value: 'ods', label: 'OpenDocument Spreadsheet', color: 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300', icon: '📊', category: 'spreadsheet' },
    
    // Presentation formats (AI-powered conversion)
    { value: 'pptx', label: 'PowerPoint (PPTX)', color: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300', icon: '📈', category: 'presentation' },
    { value: 'odp', label: 'OpenDocument Presentation', color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300', icon: '📋', category: 'presentation' },
    
    // Data formats (AI-powered conversion)
    { value: 'json', label: 'JSON', color: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300', icon: '�', category: 'document' },
    { value: 'xml', label: 'XML', color: 'bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 border-cyan-300', icon: '�', category: 'document' },
    { value: 'yaml', label: 'YAML', color: 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border-pink-300', icon: '📝', category: 'document' },
    
    // Code formats (AI-powered conversion)
    { value: 'js', label: 'JavaScript', color: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300', icon: '⚡', category: 'document' },
    { value: 'ts', label: 'TypeScript', color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300', icon: '�', category: 'document' },
    { value: 'py', label: 'Python', color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300', icon: '🐍', category: 'document' },
    { value: 'java', label: 'Java', color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300', icon: '☕', category: 'document' },
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const pollConversionStatus = useCallback(async (conversionId: string, taskId: string) => {
    const maxRetries = 30; // 30 retries with 2 second intervals = 1 minute
    let retries = 0;

    const poll = async () => {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('auth_token');

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/conversion/status/${conversionId}`, {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const status = result.conversion || result;

        if (status.status === 'completed') {
          setTasks(prev => prev.map(task => 
            task.id === taskId ? {
              ...task,
              status: 'completed',
              progress: 100,
              downloadUrl: status.downloadUrl,
              jobId: conversionId
            } : task
          ));
        } else if (status.status === 'failed') {
          setTasks(prev => prev.map(task => 
            task.id === taskId ? {
              ...task,
              status: 'failed',
              errorMessage: status.error || 'Conversion failed'
            } : task
          ));
        } else {
          // Still processing
          const progress = Math.min(20 + (retries / maxRetries) * 70, 90);
          setTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, progress } : task
          ));

          if (retries < maxRetries) {
            retries++;
            setTimeout(poll, 2000);
          } else {
            // Timeout
            setTasks(prev => prev.map(task => 
              task.id === taskId ? {
                ...task,
                status: 'failed',
                errorMessage: 'Conversion timeout'
              } : task
            ));
          }
        }
      } catch (error) {
        console.error('Status polling error:', error);
        setTasks(prev => prev.map(task => 
          task.id === taskId ? {
            ...task,
            status: 'failed',
            errorMessage: 'Status check failed'
          } : task
        ));
      }
    };

    poll();
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    files.forEach(async (file) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const taskId = Math.random().toString(36).substr(2, 9);
      
      const newTask: ConversionTask = {
        id: taskId,
        fileName: file.name,
        fromFormat: fileExtension,
        toFormat: selectedFormat,
        status: 'pending',
        progress: 0
      };

      setTasks(prev => [...prev, newTask]);
      
      // Call startConversion directly without dependency issues
      try {
        // Update task status to processing
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status: 'processing', progress: 10 } : task
        ));

        // Get auth token from localStorage
        const token = localStorage.getItem('auth_token');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('targetFormat', selectedFormat);
        formData.append('aiEnhanced', 'true'); // Enable AI enhancement

        // Call the comprehensive conversion API
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/conversion/convert`, {
          method: 'POST',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.conversionId) {
          // Update progress to show processing started
          setTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, progress: 20 } : task
          ));

          // Start polling for status
          pollConversionStatus(result.conversionId, taskId);
        } else {
          throw new Error(result.error || 'Conversion failed');
        }
      } catch (conversionError) {
        console.error('Conversion error:', conversionError);
        setTasks(prev => prev.map(task => 
          task.id === taskId ? {
            ...task,
            status: 'failed',
            errorMessage: conversionError instanceof Error ? conversionError.message : 'Conversion failed'
          } : task
        ));
      }
    });
  }, [selectedFormat, user, onAuthRequired, pollConversionStatus]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, [handleFiles]);

  /*
  const startConversion = useCallback(async (file: File, taskId: string) => {
    try {
      // Update task status to processing
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'processing', progress: 10 } : task
      ));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetFormat', selectedFormat);
      
      // Add API key if user is authenticated
      const session = await supabase.auth.getSession();
      const apiKey = session.data.session?.access_token;
      if (apiKey) {
        formData.append('apiKey', apiKey);
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      // Upload and initiate conversion
      const uploadResponse = await fetch(`${apiUrl}/api/v1/conversions/upload`, {
        method: 'POST',
        body: formData
      });

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message);
      }

      const jobId = uploadResult.jobId;
      
      // Update task with job ID
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, jobId, progress: 30 } : task
      ));
      
      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${apiUrl}/api/v1/conversions/status/${jobId}`);
          const statusResult = await statusResponse.json();
          
          setTasks(prev => prev.map(task => 
            task.id === taskId ? {
              ...task,
              progress: statusResult.progress || 0,
              status: statusResult.status?.toLowerCase() || 'processing'
            } : task
          ));
          
          if (statusResult.status === 'COMPLETED') {
            clearInterval(pollInterval);
            setTasks(prev => prev.map(task => 
              task.id === taskId ? {
                ...task,
                status: 'completed',
                progress: 100,
                downloadUrl: `${apiUrl}/api/v1/conversions/download/${jobId}`
              } : task
            ));
          } else if (statusResult.status === 'FAILED') {
            clearInterval(pollInterval);
            setTasks(prev => prev.map(task => 
              task.id === taskId ? {
                ...task,
                status: 'failed',
                errorMessage: statusResult.errorMessage || 'Conversion failed'
              } : task
            ));
          }
        } catch (pollError) {
          console.error('Polling error:', pollError);
        }
      }, 2000);

      // Clear interval after 5 minutes to avoid infinite polling
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 300000);

    } catch (conversionError) {
      console.error('Conversion error:', conversionError);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? {
          ...task,
          status: 'failed',
          errorMessage: conversionError instanceof Error ? conversionError.message : 'Conversion failed'
        } : task
      ));
    }
  }, [selectedFormat]);
  */

  const getStatusIcon = (status: ConversionTask['status']) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Loader className="h-5 w-5 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Loader className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: ConversionTask['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-500 via-red-500 to-red-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-400/30 to-red-500/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-orange-500/25 to-red-600/35 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            <span className="text-gray-900 block">
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
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
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
                      {task.status === 'failed' && (
                        <button className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                          <Plus className="h-5 w-5" />
                          <span>Retry</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {task.status !== 'failed' && (
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
                  
                  {task.status === 'failed' && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                      <div className="flex items-center space-x-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-semibold">
                          {task.errorMessage || 'Conversion failed. Please try again or contact support.'}
                        </span>
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