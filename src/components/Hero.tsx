import React, { useState, useRef } from 'react';
import { ArrowRight, Rocket, Upload, FileText, Download, Check } from 'lucide-react';

const Hero = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionComplete, setConversionComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format lists
  const allFormats = [
    // Document formats
    'pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'html', 'epub',
    // Image formats
    'jpeg', 'jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'ico',
    // Spreadsheet formats
    'xlsx', 'xls', 'csv', 'ods',
    // Presentation formats
    'pptx', 'ppt', 'odp'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    setConversionComplete(false);
    
    // Auto-detect input format from file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    setInputFormat(extension);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !outputFormat) return;
    
    setIsConverting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('outputFormat', outputFormat);
      
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${selectedFile.name.split('.')[0]}.${outputFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setConversionComplete(true);
        setTimeout(() => setConversionComplete(false), 3000);
      } else {
        console.error('Conversion failed');
      }
    } catch (error) {
      console.error('Error during conversion:', error);
    }
    
    setIsConverting(false);
  };
  return (
    <section className="relative pt-3 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-red-600">
      {/* Orange-Red 4K Animated Background Elements - "The Woof" Color */}
      <div className="absolute inset-0 -z-10">
        {/* Main orange-red gradient base */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/30 via-red-600/40 to-red-700/50 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-red-500/30 to-red-800/40 animate-gradient-x"></div>
        
        {/* Large floating orange-red orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-400/30 to-red-500/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-orange-500/25 to-red-600/35 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-orange-300/25 to-red-400/35 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Additional orange-red depth layers */}
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-gradient-to-r from-red-500/20 to-red-700/30 rounded-full blur-2xl animate-ping delay-500"></div>
        <div className="absolute bottom-10 left-1/4 w-56 h-56 bg-gradient-to-r from-orange-400/15 to-red-500/25 rounded-full blur-2xl animate-ping delay-1500"></div>
        
        {/* Floating Orange-Red Elements */}
        <div className="absolute top-32 left-1/4 animate-bounce delay-300">
          <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full opacity-70"></div>
        </div>
        <div className="absolute top-48 right-1/4 animate-bounce delay-700">
          <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full opacity-70"></div>
        </div>
        <div className="absolute bottom-40 left-1/3 animate-bounce delay-1000">
          <div className="w-5 h-5 bg-gradient-to-r from-orange-300 to-red-400 rounded-full opacity-70"></div>
        </div>
        <div className="absolute top-60 right-1/3 animate-bounce delay-1300">
          <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-700 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-60 right-1/4 animate-bounce delay-1600">
          <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-65"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto text-center">
        <div className="mb-1">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">
              Convert Any File
            </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block animate-gradient-x bg-300% relative">
              Instantly & Securely
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-lg -z-10 animate-pulse"></div>
            </span>
          </h1>
          
          <p className="text-2xl text-gray-600 mb-6 max-w-4xl mx-auto leading-relaxed font-medium">
            Transform your documents with lightning-fast processing.
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div
            className={`relative border-2 border-dashed rounded-3xl p-2 transition-all duration-300 ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-gray-300 bg-white/50 backdrop-blur-sm'
            } ${selectedFile ? 'bg-green-50/50 border-green-400' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.rtf,.odt,.html,.epub,.jpeg,.jpg,.png,.webp,.gif,.bmp,.tiff,.svg,.ico,.xlsx,.xls,.csv,.ods,.pptx,.ppt,.odp"
            />
            
            <div className="text-center cursor-pointer">
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <FileText className="h-12 w-12 text-green-600 mr-4" />
                    <div className="text-left">
                      <p className="text-xl font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {inputFormat.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  {conversionComplete && (
                    <div className="flex items-center justify-center text-green-600">
                      <Check className="h-6 w-6 mr-2" />
                      <span className="font-semibold">File converted and downloaded!</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <Upload className="h-12 w-12 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      Drop files here or click to upload
                    </p>
                    <p className="text-xs text-gray-600 mb-4">
                      Support for 25+ file formats including PDF, DOCX, images, and more
                    </p>
                    
                    {/* Format Selection Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <div onClick={(e) => e.stopPropagation()}>
                        <label className="block text-lg font-semibold text-gray-900 mb-2">
                          Convert From:
                        </label>
                        <div className="relative">
                          <select
                            value={inputFormat}
                            onChange={(e) => setInputFormat(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full px-4 py-4 border-3 border-blue-300 rounded-xl bg-white text-gray-900 font-semibold text-base focus:border-blue-600 focus:ring-4 focus:ring-blue-200 focus:outline-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer appearance-none ${!inputFormat ? 'italic text-gray-500' : ''}`}
                            style={{ backgroundImage: 'none' }}
                          >
                            <option value="" className="text-gray-500 font-medium py-3 italic">Select</option>
                            
                            <optgroup label="📄 Documents" className="font-bold text-blue-800 bg-blue-100">
                              <option value="doc" className="font-medium text-gray-900 py-2 pl-4">DOC - Microsoft Word 97-2003</option>
                              <option value="docx" className="font-medium text-gray-900 py-2 pl-4">DOCX - Microsoft Word</option>
                              <option value="pdf" className="font-medium text-gray-900 py-2 pl-4">PDF - Portable Document Format</option>
                              <option value="txt" className="font-medium text-gray-900 py-2 pl-4">TXT - Plain Text</option>
                              <option value="rtf" className="font-medium text-gray-900 py-2 pl-4">RTF - Rich Text Format</option>
                              <option value="odt" className="font-medium text-gray-900 py-2 pl-4">ODT - OpenDocument Text</option>
                              <option value="html" className="font-medium text-gray-900 py-2 pl-4">HTML - HyperText Markup Language</option>
                            </optgroup>
                            
                            <optgroup label="🖼️ Images" className="font-bold text-green-800 bg-green-100">
                              <option value="jpg" className="font-medium text-gray-900 py-2 pl-4">JPG - JPEG Image</option>
                              <option value="jpeg" className="font-medium text-gray-900 py-2 pl-4">JPEG - Joint Photographic Experts Group</option>
                              <option value="png" className="font-medium text-gray-900 py-2 pl-4">PNG - Portable Network Graphics</option>
                              <option value="bmp" className="font-medium text-gray-900 py-2 pl-4">BMP - Bitmap Image</option>
                              <option value="svg" className="font-medium text-gray-900 py-2 pl-4">SVG - Scalable Vector Graphics</option>
                              <option value="tiff" className="font-medium text-gray-900 py-2 pl-4">TIFF - Tagged Image File Format</option>
                              <option value="gif" className="font-medium text-gray-900 py-2 pl-4">GIF - Graphics Interchange Format</option>
                              <option value="webp" className="font-medium text-gray-900 py-2 pl-4">WEBP - Web Picture Format</option>
                              <option value="ico" className="font-medium text-gray-900 py-2 pl-4">ICO - Icon File</option>
                            </optgroup>
                            
                            <optgroup label="📊 Spreadsheets" className="font-bold text-orange-800 bg-orange-100">
                              <option value="xlsx" className="font-medium text-gray-900 py-2 pl-4">XLSX - Microsoft Excel</option>
                              <option value="xls" className="font-medium text-gray-900 py-2 pl-4">XLS - Microsoft Excel 97-2003</option>
                              <option value="csv" className="font-medium text-gray-900 py-2 pl-4">CSV - Comma Separated Values</option>
                              <option value="ods" className="font-medium text-gray-900 py-2 pl-4">ODS - OpenDocument Spreadsheet</option>
                            </optgroup>
                            
                            <optgroup label="📺 Presentations" className="font-bold text-purple-800 bg-purple-100">
                              <option value="pptx" className="font-medium text-gray-900 py-2 pl-4">PPTX - Microsoft PowerPoint</option>
                              <option value="ppt" className="font-medium text-gray-900 py-2 pl-4">PPT - Microsoft PowerPoint 97-2003</option>
                              <option value="odp" className="font-medium text-gray-900 py-2 pl-4">ODP - OpenDocument Presentation</option>
                            </optgroup>
                            
                            <optgroup label="📚 eBooks" className="font-bold text-indigo-800 bg-indigo-100">
                              <option value="epub" className="font-medium text-gray-900 py-2 pl-4">EPUB - Electronic Publication</option>
                              <option value="mobi" className="font-medium text-gray-900 py-2 pl-4">MOBI - Mobipocket eBook</option>
                              <option value="azw" className="font-medium text-gray-900 py-2 pl-4">AZW - Amazon Kindle Format</option>
                            </optgroup>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div onClick={(e) => e.stopPropagation()}>
                        <label className="block text-lg font-semibold text-gray-900 mb-2">
                          Convert To:
                        </label>
                        <div className="relative">
                          <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full px-4 py-4 border-3 border-purple-300 rounded-xl bg-white text-gray-900 font-semibold text-base focus:border-purple-600 focus:ring-4 focus:ring-purple-200 focus:outline-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer appearance-none ${!outputFormat ? 'italic text-gray-500' : ''}`}
                            style={{ backgroundImage: 'none' }}
                          >
                            <option value="" className="text-gray-500 font-medium py-3 italic">Select</option>
                            
                            <optgroup label="📄 Documents" className="font-bold text-blue-800 bg-blue-100">
                              <option value="doc" className="font-medium text-gray-900 py-2 pl-4">DOC - Microsoft Word 97-2003</option>
                              <option value="docx" className="font-medium text-gray-900 py-2 pl-4">DOCX - Microsoft Word</option>
                              <option value="pdf" className="font-medium text-gray-900 py-2 pl-4">PDF - Portable Document Format</option>
                              <option value="txt" className="font-medium text-gray-900 py-2 pl-4">TXT - Plain Text</option>
                              <option value="rtf" className="font-medium text-gray-900 py-2 pl-4">RTF - Rich Text Format</option>
                              <option value="odt" className="font-medium text-gray-900 py-2 pl-4">ODT - OpenDocument Text</option>
                              <option value="html" className="font-medium text-gray-900 py-2 pl-4">HTML - HyperText Markup Language</option>
                            </optgroup>
                            
                            <optgroup label="🖼️ Images" className="font-bold text-green-800 bg-green-100">
                              <option value="jpg" className="font-medium text-gray-900 py-2 pl-4">JPG - JPEG Image</option>
                              <option value="jpeg" className="font-medium text-gray-900 py-2 pl-4">JPEG - Joint Photographic Experts Group</option>
                              <option value="png" className="font-medium text-gray-900 py-2 pl-4">PNG - Portable Network Graphics</option>
                              <option value="bmp" className="font-medium text-gray-900 py-2 pl-4">BMP - Bitmap Image</option>
                              <option value="svg" className="font-medium text-gray-900 py-2 pl-4">SVG - Scalable Vector Graphics</option>
                              <option value="tiff" className="font-medium text-gray-900 py-2 pl-4">TIFF - Tagged Image File Format</option>
                              <option value="gif" className="font-medium text-gray-900 py-2 pl-4">GIF - Graphics Interchange Format</option>
                              <option value="webp" className="font-medium text-gray-900 py-2 pl-4">WEBP - Web Picture Format</option>
                              <option value="ico" className="font-medium text-gray-900 py-2 pl-4">ICO - Icon File</option>
                            </optgroup>
                            
                            <optgroup label="📊 Spreadsheets" className="font-bold text-orange-800 bg-orange-100">
                              <option value="xlsx" className="font-medium text-gray-900 py-2 pl-4">XLSX - Microsoft Excel</option>
                              <option value="xls" className="font-medium text-gray-900 py-2 pl-4">XLS - Microsoft Excel 97-2003</option>
                              <option value="csv" className="font-medium text-gray-900 py-2 pl-4">CSV - Comma Separated Values</option>
                              <option value="ods" className="font-medium text-gray-900 py-2 pl-4">ODS - OpenDocument Spreadsheet</option>
                            </optgroup>
                            
                            <optgroup label="📺 Presentations" className="font-bold text-purple-800 bg-purple-100">
                              <option value="pptx" className="font-medium text-gray-900 py-2 pl-4">PPTX - Microsoft PowerPoint</option>
                              <option value="ppt" className="font-medium text-gray-900 py-2 pl-4">PPT - Microsoft PowerPoint 97-2003</option>
                              <option value="odp" className="font-medium text-gray-900 py-2 pl-4">ODP - OpenDocument Presentation</option>
                            </optgroup>
                            
                            <optgroup label="📚 eBooks" className="font-bold text-indigo-800 bg-indigo-100">
                              <option value="epub" className="font-medium text-gray-900 py-2 pl-4">EPUB - Electronic Publication</option>
                              <option value="mobi" className="font-medium text-gray-900 py-2 pl-4">MOBI - Mobipocket eBook</option>
                              <option value="azw" className="font-medium text-gray-900 py-2 pl-4">AZW - Amazon Kindle Format</option>
                            </optgroup>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Convert Now Button - appears when both formats are selected */}
                    {inputFormat && outputFormat && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="relative bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center mx-auto group overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center">
                            <Upload className="mr-3 h-6 w-6 group-hover:animate-bounce" />
                            <span className="font-bold">Upload File to Convert</span>
                          </div>
                          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Format Selection */}
          {selectedFile && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Convert From:
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={inputFormat}
                    onChange={(e) => setInputFormat(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-900 font-semibold text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none appearance-none shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-blue-400"
                    disabled
                  >
                    <option value={inputFormat} className="font-semibold">
                      {inputFormat ? `${inputFormat.toUpperCase()} (Auto-detected)` : 'Select input format'}
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="group">
                <label className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Convert To:
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-900 font-semibold text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none appearance-none shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-purple-400"
                  >
                    <option value="" className="text-gray-500 font-medium">Select output format</option>
                    
                    <optgroup label="📄 Documents" className="font-bold text-blue-700 bg-blue-50">
                      <option value="doc" className="font-semibold text-gray-800 py-2">DOC - Microsoft Word 97-2003</option>
                      <option value="docx" className="font-semibold text-gray-800 py-2">DOCX - Microsoft Word</option>
                      <option value="pdf" className="font-semibold text-gray-800 py-2">PDF - Portable Document Format</option>
                      <option value="txt" className="font-semibold text-gray-800 py-2">TXT - Plain Text</option>
                      <option value="rtf" className="font-semibold text-gray-800 py-2">RTF - Rich Text Format</option>
                      <option value="odt" className="font-semibold text-gray-800 py-2">ODT - OpenDocument Text</option>
                    </optgroup>
                    
                    <optgroup label="🖼️ Images" className="font-bold text-green-700 bg-green-50">
                      <option value="jpg" className="font-semibold text-gray-800 py-2">JPG - JPEG Image</option>
                      <option value="png" className="font-semibold text-gray-800 py-2">PNG - Portable Network Graphics</option>
                      <option value="bmp" className="font-semibold text-gray-800 py-2">BMP - Bitmap Image</option>
                      <option value="svg" className="font-semibold text-gray-800 py-2">SVG - Scalable Vector Graphics</option>
                      <option value="tiff" className="font-semibold text-gray-800 py-2">TIFF - Tagged Image File</option>
                    </optgroup>
                    
                    <optgroup label="📊 Spreadsheets" className="font-bold text-orange-700 bg-orange-50">
                      <option value="xlsx" className="font-semibold text-gray-800 py-2">XLSX - Microsoft Excel</option>
                      <option value="csv" className="font-semibold text-gray-800 py-2">CSV - Comma Separated Values</option>
                      <option value="ods" className="font-semibold text-gray-800 py-2">ODS - OpenDocument Spreadsheet</option>
                    </optgroup>
                    
                    <optgroup label="📺 Presentations" className="font-bold text-purple-700 bg-purple-50">
                      <option value="pptx" className="font-semibold text-gray-800 py-2">PPTX - Microsoft PowerPoint</option>
                      <option value="odp" className="font-semibold text-gray-800 py-2">ODP - OpenDocument Presentation</option>
                    </optgroup>
                    
                    <optgroup label="📚 eBooks" className="font-bold text-indigo-700 bg-indigo-50">
                      <option value="epub" className="font-semibold text-gray-800 py-2">EPUB - Electronic Publication</option>
                      <option value="mobi" className="font-semibold text-gray-800 py-2">MOBI - Mobipocket eBook</option>
                      <option value="azw" className="font-semibold text-gray-800 py-2">AZW - Amazon Kindle Format</option>
                    </optgroup>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* Convert Button */}
          {selectedFile && outputFormat && (
            <div className="mt-12 text-center">
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="relative bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white px-12 py-6 rounded-3xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 flex items-center justify-center mx-auto group disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center">
                  {isConverting ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-white mr-4"></div>
                      <span className="text-xl font-bold">Converting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="mr-4 h-8 w-8 group-hover:animate-bounce" />
                      <span className="text-xl font-bold">Convert & Download</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20">
          <button 
            className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-16 py-6 rounded-3xl font-bold text-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 flex items-center justify-center group overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center">
              <Rocket className="mr-4 h-8 w-8 group-hover:animate-bounce" />
              <span className="font-black">Start Converting Now</span>
              <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-2 transition-transform duration-500" />
            </div>
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;