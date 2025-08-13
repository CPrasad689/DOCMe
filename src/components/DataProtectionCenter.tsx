import React, { useState } from 'react';
import { 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  User,
  Settings,
  Clock
} from 'lucide-react';

interface DataRequestForm {
  type: 'access' | 'portability' | 'rectification' | 'erasure' | 'restriction' | 'objection';
  email: string;
  fullName: string;
  details: string;
  verification: string;
}

const DataProtectionCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rights' | 'requests' | 'data' | 'consent'>('rights');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState<DataRequestForm>({
    type: 'access',
    email: '',
    fullName: '',
    details: '',
    verification: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would send the request to your backend
      console.log('Data protection request submitted:', formData);
      
      setSubmitStatus('success');
      setShowRequestForm(false);
      setFormData({
        type: 'access',
        email: '',
        fullName: '',
        details: '',
        verification: ''
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestTypes = [
    {
      id: 'access',
      name: 'Data Access Request',
      description: 'Request a copy of all personal data we hold about you',
      icon: Eye,
      color: 'blue'
    },
    {
      id: 'portability',
      name: 'Data Portability Request',
      description: 'Request your data in a machine-readable format',
      icon: Download,
      color: 'green'
    },
    {
      id: 'rectification',
      name: 'Data Correction Request',
      description: 'Request correction of inaccurate personal data',
      icon: FileText,
      color: 'yellow'
    },
    {
      id: 'erasure',
      name: 'Data Deletion Request',
      description: 'Request deletion of your personal data ("right to be forgotten")',
      icon: Trash2,
      color: 'red'
    },
    {
      id: 'restriction',
      name: 'Processing Restriction',
      description: 'Request to restrict processing of your personal data',
      icon: Shield,
      color: 'purple'
    },
    {
      id: 'objection',
      name: 'Object to Processing',
      description: 'Object to processing based on legitimate interests',
      icon: AlertCircle,
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100/50 to-purple-100/50 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-bold text-blue-600 mb-6 border border-blue-200/30">
            <Shield className="h-5 w-5 mr-2" />
            GDPR Data Protection Center
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Your Data Rights
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Exercise your GDPR rights, manage your data, and control your privacy preferences.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { id: 'rights', name: 'Your Rights', icon: Shield },
              { id: 'requests', name: 'Submit Request', icon: Mail },
              { id: 'data', name: 'Your Data', icon: User },
              { id: 'consent', name: 'Consent Management', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {activeTab === 'rights' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your GDPR Rights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requestTypes.map((type) => (
                  <div key={type.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-full bg-${type.color}-100 mr-4`}>
                        <type.icon className={`h-6 w-6 text-${type.color}-600`} />
                      </div>
                      <h3 className="font-semibold text-gray-900">{type.name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, type: type.id as any }));
                        setShowRequestForm(true);
                      }}
                      className={`w-full px-4 py-2 bg-${type.color}-600 text-white rounded-lg hover:bg-${type.color}-700 transition-colors text-sm font-medium`}
                    >
                      Submit Request
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
                <h3 className="font-bold text-blue-900 mb-3">Response Timeline</h3>
                <div className="flex items-center text-blue-800 text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  We respond to all data protection requests within 30 days as required by GDPR Article 12.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit a Data Protection Request</h2>
              
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-bold text-green-900">Request Submitted Successfully</h3>
                      <p className="text-green-800 text-sm mt-1">
                        We've received your data protection request and will respond within 30 days.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {requestTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Details
                  </label>
                  <textarea
                    value={formData.details}
                    onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide specific details about your request..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identity Verification
                  </label>
                  <input
                    type="text"
                    value={formData.verification}
                    onChange={(e) => setFormData(prev => ({ ...prev, verification: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Last 4 digits of phone number or account reference"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    To protect your privacy, we need to verify your identity before processing your request.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-2" />
                      Submit Request
                    </>
                  )}
                </button>
              </form>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
                <h3 className="font-bold text-yellow-900 mb-2">Important Notes</h3>
                <ul className="text-yellow-800 text-sm space-y-1">
                  <li>• We may request additional verification for security purposes</li>
                  <li>• Some requests may take longer if they are complex or voluminous</li>
                  <li>• We'll confirm receipt of your request within 72 hours</li>
                  <li>• For urgent matters, contact our Data Protection Officer directly</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Data Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <User className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="font-bold text-blue-900">Profile Data</h3>
                  </div>
                  <p className="text-blue-800 text-sm">Name, email, phone, preferences</p>
                  <p className="text-blue-600 text-xs mt-2">Stored: Account creation</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <FileText className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="font-bold text-green-900">Usage Data</h3>
                  </div>
                  <p className="text-green-800 text-sm">Conversion history, API usage</p>
                  <p className="text-green-600 text-xs mt-2">Stored: Last 2 years</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <Shield className="h-6 w-6 text-purple-600 mr-3" />
                    <h3 className="font-bold text-purple-900">Security Data</h3>
                  </div>
                  <p className="text-purple-800 text-sm">Login logs, IP addresses</p>
                  <p className="text-purple-600 text-xs mt-2">Stored: 12 months</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download My Data
                  </button>
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Data Report
                  </button>
                  <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consent' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Consent Management</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Email Marketing</h3>
                      <p className="text-gray-600 text-sm">Promotional emails and product updates</p>
                    </div>
                    <button className="w-12 h-6 bg-green-500 rounded-full flex items-center">
                      <div className="w-5 h-5 bg-white rounded-full ml-6 shadow"></div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Consented: January 15, 2025 | You can withdraw consent at any time
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                      <p className="text-gray-600 text-sm">Usage analytics for service improvement</p>
                    </div>
                    <button className="w-12 h-6 bg-gray-300 rounded-full flex items-center">
                      <div className="w-5 h-5 bg-white rounded-full ml-1 shadow"></div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Not consented | Click to enable analytics cookies
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Marketing Cookies</h3>
                      <p className="text-gray-600 text-sm">Personalized advertising and retargeting</p>
                    </div>
                    <button className="w-12 h-6 bg-gray-300 rounded-full flex items-center">
                      <div className="w-5 h-5 bg-white rounded-full ml-1 shadow"></div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Not consented | Click to enable marketing cookies
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
                <h3 className="font-bold text-blue-900 mb-2">Consent Withdrawal</h3>
                <p className="text-blue-800 text-sm">
                  You can withdraw your consent at any time. Withdrawal will not affect the lawfulness 
                  of processing based on consent before its withdrawal.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact DPO */}
      <div className="max-w-6xl mx-auto mt-12">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help with Your Data Rights?</h2>
          <p className="mb-6">
            Our Data Protection Officer is available to assist you with any questions about your privacy rights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:dpo@docme.com"
              className="flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Mail className="h-5 w-5 mr-2" />
              Email DPO: dpo@docme.com
            </a>
            <a
              href="/privacy-policy"
              className="flex items-center justify-center px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
            >
              <Shield className="h-5 w-5 mr-2" />
              Read Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataProtectionCenter;
