import React, { useState, useEffect } from 'react';
import { Cookie, Settings, X, Check, Info } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
}

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    preferences: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load existing preferences
      try {
        const savedPrefs = JSON.parse(consent);
        setPreferences(savedPrefs);
      } catch (e) {
        console.error('Error parsing cookie consent:', e);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      preferences: true,
      marketing: true
    };
    setPreferences(allAccepted);
    saveCookiePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    saveCookiePreferences(preferences);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      preferences: false,
      marketing: false
    };
    setPreferences(essentialOnly);
    saveCookiePreferences(essentialOnly);
    setShowBanner(false);
  };

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    // Initialize analytics and other services based on preferences
    if (prefs.analytics && typeof window !== 'undefined') {
      // Initialize Google Analytics or other analytics services
      console.log('Analytics cookies enabled');
    }
    
    if (prefs.marketing && typeof window !== 'undefined') {
      // Initialize marketing/advertising services
      console.log('Marketing cookies enabled');
    }
    
    if (prefs.preferences && typeof window !== 'undefined') {
      // Enable preference cookies
      console.log('Preference cookies enabled');
    }
  };

  const updatePreference = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-500 shadow-xl">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex items-start flex-1">
              <Cookie className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  We value your privacy
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage, 
                  and provide personalized content. You can customize your preferences or accept all cookies.
                </p>
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 flex items-center"
                >
                  <Info className="h-4 w-4 mr-1" />
                  Learn more about cookies
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={handleRejectAll}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
              >
                Reject All
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="px-6 py-3 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Cookie Settings Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Settings className="h-6 w-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Cookie Preferences</h2>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-gray-700">
                <p className="mb-4">
                  Manage your cookie preferences below. Essential cookies are required for the website to function 
                  and cannot be disabled. Learn more in our{' '}
                  <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>.
                </p>
              </div>

              {/* Essential Cookies */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Essential Cookies</h3>
                    <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Always Active
                    </span>
                  </div>
                  <div className="w-12 h-6 bg-green-500 rounded-full flex items-center">
                    <div className="w-5 h-5 bg-white rounded-full ml-6 shadow transform transition-transform"></div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  These cookies are necessary for the website to function and cannot be switched off. 
                  They include authentication, security, and basic functionality cookies.
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  <strong>Examples:</strong> Session management, CSRF protection, load balancing
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Analytics Cookies</h3>
                  </div>
                  <button
                    onClick={() => updatePreference('analytics', !preferences.analytics)}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      preferences.analytics ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
                <p className="text-gray-600 text-sm">
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously.
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  <strong>Examples:</strong> Google Analytics, usage statistics, performance monitoring
                </div>
              </div>

              {/* Preferences Cookies */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Preference Cookies</h3>
                  </div>
                  <button
                    onClick={() => updatePreference('preferences', !preferences.preferences)}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      preferences.preferences ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      preferences.preferences ? 'translate-x-6' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
                <p className="text-gray-600 text-sm">
                  These cookies enable the website to remember information that changes how the website 
                  behaves or looks, like your preferred language or region.
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  <strong>Examples:</strong> Language settings, theme preferences, region selection
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Marketing Cookies</h3>
                  </div>
                  <button
                    onClick={() => updatePreference('marketing', !preferences.marketing)}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      preferences.marketing ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
                <p className="text-gray-600 text-sm">
                  These cookies are used to track visitors across websites to display relevant 
                  advertisements and measure campaign effectiveness.
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  <strong>Examples:</strong> Advertising networks, social media widgets, conversion tracking
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handleRejectAll}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-white transition-colors font-medium"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptSelected}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Accept All
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                You can change these settings at any time by clicking the cookie settings link in the footer.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
