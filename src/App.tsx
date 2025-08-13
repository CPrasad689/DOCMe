import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import Pricing from './components/Pricing';
import FileConverter from './components/FileConverter';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CookieConsent from './components/CookieConsent';
import AboutUs from './components/pages/AboutUs';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsOfService from './components/pages/TermsOfService';
import ContactUs from './components/pages/ContactUs';
import { useAuth } from './hooks/useAuth';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'converter' | 'about' | 'privacy' | 'terms' | 'contact'>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, loading } = useAuth();

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
      />
      
      {currentView === 'home' ? (
        <>
          <Hero />
          <Pricing user={user} onAuthRequired={() => setAuthModalOpen(true)} />
        </>
      ) : currentView === 'converter' ? (
        <FileConverter user={user} onAuthRequired={() => setAuthModalOpen(true)} />
      ) : currentView === 'about' ? (
        <AboutUs />
      ) : currentView === 'privacy' ? (
        <PrivacyPolicy />
      ) : currentView === 'terms' ? (
        <TermsOfService />
      ) : currentView === 'contact' ? (
        <ContactUs />
      ) : null}
      
      <Footer />
      
      {/* GDPR Cookie Consent */}
      <CookieConsent />
      
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