import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import FileConverter from './components/FileConverter';
import ConvertFilesSection from './components/ConvertFilesSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { useAuth } from './hooks/useAuth';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'converter'>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user, loading } = useAuth();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentView('converter');
  };

  const scrollToConverter = () => {
    const convertSection = document.getElementById('convert-files-section');
    if (convertSection) {
      convertSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading DOCMe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
        onNavigate={setCurrentView} 
        currentView={currentView}
        user={user}
        onAuthClick={() => setAuthModalOpen(true)}
        onScrollToConverter={scrollToConverter}
      />
      
      {currentView === 'home' ? (
        <>
          <Hero onStartConverting={() => setCurrentView('converter')} />
          <ConvertFilesSection onFileSelect={handleFileSelect} />
          <Features />
          <Pricing user={user} onAuthRequired={() => setAuthModalOpen(true)} />
        </>
      ) : (
        <FileConverter user={user} onAuthRequired={() => setAuthModalOpen(true)} />
      )}
      
      <Footer />
      
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;