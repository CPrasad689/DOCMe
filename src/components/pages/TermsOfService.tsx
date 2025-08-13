import React from 'react';
import { Scale, FileText, AlertCircle, CreditCard, Zap, Shield } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-red-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100/50 to-purple-100/50 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-bold text-blue-600 mb-6 border border-blue-200/30">
            <Scale className="h-5 w-5 mr-2" />
            Legal Agreement - GDPR & CCPA Compliant
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Clear, simple terms for our file conversion services. GDPR and international law compliant.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 2025 | Version 3.0 | International Compliance
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="space-y-8">

            {/* Agreement */}
            <section>
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Agreement</h2>
              </div>
              <div className="bg-blue-50 rounded-xl p-6">
                <p className="text-blue-800">
                  By using DOCMe, you agree to these terms. Must be 13+ years old (16+ in EU). Under 18? Get parent permission.
                </p>
              </div>
            </section>

            {/* Our Service */}
            <section>
              <div className="flex items-center mb-4">
                <Zap className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Our Service</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">We Convert</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Documents (PDF, DOCX, TXT)</li>
                    <li>• Images (JPEG, PNG, WebP)</li>
                    <li>• Spreadsheets (XLSX, CSV)</li>
                    <li>• Presentations (PPTX, PPT)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Batch processing</li>
                    <li>• API access (paid plans)</li>
                    <li>• Priority processing</li>
                    <li>• 24/7 support</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Pricing & Payment */}
            <section>
              <div className="flex items-center mb-4">
                <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Pricing & Payment</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="font-bold text-gray-900 mb-2">Free</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-2">$0/month</p>
                  <p className="text-sm text-gray-600">10MB, 2 files</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <h3 className="font-bold text-blue-900 mb-2">Basic</h3>
                  <p className="text-2xl font-bold text-blue-900 mb-2">$10/month</p>
                  <p className="text-sm text-blue-800">50MB, 15 files</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <h3 className="font-bold text-green-900 mb-2">Pro</h3>
                  <p className="text-2xl font-bold text-green-900 mb-2">$19/month</p>
                  <p className="text-sm text-green-800">100MB, 50 files</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <h3 className="font-bold text-purple-900 mb-2">Enterprise</h3>
                  <p className="text-2xl font-bold text-purple-900 mb-2">$39/month</p>
                  <p className="text-sm text-purple-800">500MB, 100 files</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="space-y-2 text-gray-700">
                  <p><strong>Billing:</strong> Monthly, in advance</p>
                  <p><strong>Refunds:</strong> 30-day money-back</p>
                  <p><strong>Cancellation:</strong> Anytime</p>
                </div>
              </div>
            </section>

            {/* Your Rights & Privacy */}
            <section>
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Your Rights & Privacy</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="font-bold text-blue-900 mb-3">GDPR Rights (EU)</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>✓ Access your data</li>
                    <li>✓ Correct your data</li>
                    <li>✓ Delete your data</li>
                    <li>✓ Data portability</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="font-bold text-green-900 mb-3">CCPA Rights (California)</h3>
                  <ul className="space-y-2 text-green-800">
                    <li>✓ Know what data we have</li>
                    <li>✓ Delete personal data</li>
                    <li>✓ We don't sell your data</li>
                    <li>✓ No discrimination</li>
                  </ul>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <p className="text-yellow-800">
                  🔒 <strong>Security Promise:</strong> Files deleted within 24 hours. Enterprise encryption. No human access to your content.
                </p>
              </div>
            </section>

            {/* Your Responsibilities */}
            <section>
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Your Responsibilities</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="font-bold text-green-900 mb-3">✅ You Must</h3>
                  <ul className="space-y-2 text-green-800">
                    <li>• Own rights to uploaded files</li>
                    <li>• Keep account secure</li>
                    <li>• Follow applicable laws</li>
                    <li>• Provide accurate info</li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-xl p-6">
                  <h3 className="font-bold text-red-900 mb-3">❌ Don't</h3>
                  <ul className="space-y-2 text-red-800">
                    <li>• Upload illegal content</li>
                    <li>• Share account credentials</li>
                    <li>• Abuse our systems</li>
                    <li>• Reverse engineer</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Legal Limitations */}
            <section>
              <div className="flex items-center mb-4">
                <Scale className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Legal Limitations</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Service Limitations</h3>
                  <p className="text-gray-700">
                    File size limits apply. Conversion accuracy may vary. Service may be temporarily unavailable. 
                    We do our best but can't guarantee perfect results every time.
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-6">
                  <h3 className="font-bold text-orange-900 mb-3">Liability Limits</h3>
                  <p className="text-orange-800">
                    Service provided "as is." Our liability limited to amount you paid us in past 12 months. 
                    Always backup important files before conversion.
                  </p>
                </div>
              </div>
            </section>

            {/* Disputes & Law */}
            <section>
              <div className="flex items-center mb-4">
                <Scale className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Disputes & Law</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="font-bold text-blue-900 mb-3">Problem? Contact Us First</h3>
                  <ol className="space-y-2 text-blue-800 text-sm">
                    <li>1. Email support@docme-in.com</li>
                    <li>2. Management escalation</li>
                    <li>3. Mediation attempt</li>
                    <li>4. Legal action if needed</li>
                  </ol>
                </div>
                <div className="bg-purple-50 rounded-xl p-6">
                  <h3 className="font-bold text-purple-900 mb-3">Applicable Laws</h3>
                  <ul className="space-y-2 text-purple-800 text-sm">
                    <li>• EU: GDPR + local laws</li>
                    <li>• California: CCPA</li>
                    <li>• Consumer protection applies</li>
                    <li>• Local laws override when stronger</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Changes & Account Closure */}
            <section>
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Changes & Account Closure</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 rounded-xl p-6">
                  <h3 className="font-bold text-yellow-900 mb-3">Terms Updates</h3>
                  <ul className="space-y-2 text-yellow-800 text-sm">
                    <li>• 30-day notice for changes</li>
                    <li>• Email + website notification</li>
                    <li>• Right to cancel if you disagree</li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-xl p-6">
                  <h3 className="font-bold text-red-900 mb-3">Account Termination</h3>
                  <ul className="space-y-2 text-red-800 text-sm">
                    <li>• Cancel anytime</li>
                    <li>• Data deleted in 30 days</li>
                    <li>• Download data first</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-bold text-blue-900 mb-3">General Support</h3>
                  <div className="space-y-2 text-blue-800 text-sm">
                    <p><strong>Email:</strong> support@docme-in.com</p>
                    <p><strong>Response:</strong> 24-48 hours</p>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="font-bold text-green-900 mb-3">Legal & Privacy</h3>
                  <div className="space-y-2 text-green-800 text-sm">
                    <p><strong>Legal:</strong> privacy@docme-in.com</p>
                    <p><strong>Privacy Officer:</strong> dp@docme-in.com</p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
