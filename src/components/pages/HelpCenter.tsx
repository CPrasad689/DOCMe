import React, { useState } from 'react';
import { Search, HelpCircle, FileText, Upload, Download, CreditCard, Shield, Zap } from 'lucide-react';

const HelpCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      icon: Upload,
      title: 'File Upload',
      color: 'bg-blue-100 text-blue-600',
      articles: [
        'How to upload files for conversion',
        'Supported file formats and sizes',
        'Drag and drop functionality',
        'Batch upload limitations'
      ]
    },
    {
      icon: Download,
      title: 'File Download',
      color: 'bg-green-100 text-green-600',
      articles: [
        'How to download converted files',
        'Download link expiration',
        'Troubleshooting download issues',
        'Mobile download guide'
      ]
    },
    {
      icon: CreditCard,
      title: 'Billing & Plans',
      color: 'bg-purple-100 text-purple-600',
      articles: [
        'Understanding our pricing plans',
        'How to upgrade your account',
        'Billing cycle and payments',
        'Refund and cancellation policy'
      ]
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      color: 'bg-red-100 text-red-600',
      articles: [
        'How we protect your files',
        'Data retention policies',
        'Privacy and GDPR compliance',
        'Account security best practices'
      ]
    }
  ];

  const faqs = [
    {
      question: 'What file formats do you support?',
      answer: 'We support over 100 file formats including PDF, DOCX, XLSX, PPTX, JPEG, PNG, and many more. You can convert between most common document, image, and presentation formats.'
    },
    {
      question: 'How long does file conversion take?',
      answer: 'Most file conversions are completed within seconds. Larger files or batch conversions may take a few minutes depending on your plan and file complexity.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use enterprise-grade encryption to protect your files. All uploaded files are automatically deleted from our servers within 24 hours of processing.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from your account settings. You\'ll continue to have access until the end of your current billing period.'
    },
    {
      question: 'Do you offer API access?',
      answer: 'Yes, our Pro and Enterprise plans include API access for developers who want to integrate our conversion services into their applications.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100/50 to-purple-100/50 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-bold text-blue-600 mb-6 border border-blue-200/30">
            <HelpCircle className="h-5 w-5 mr-2" />
            Support Center
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            How can we help?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Find answers to common questions or search our knowledge base for specific topics.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for help articles, guides, or FAQs..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl bg-white text-gray-900 font-medium focus:border-blue-500 focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Browse by Category</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-shadow cursor-pointer">
                <div className={`rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center ${category.color}`}>
                  <category.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex} className="text-gray-600 text-sm hover:text-blue-600 cursor-pointer">
                      • {article}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl shadow-xl p-8 text-white text-center">
            <Zap className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Quick Start Guide</h3>
            <p className="text-blue-100 mb-6">
              New to DOCMe? Learn how to convert your first file in under 2 minutes.
            </p>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
              Get Started
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl shadow-xl p-8 text-white text-center">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Video Tutorials</h3>
            <p className="text-green-100 mb-6">
              Watch step-by-step video guides for all our features and tools.
            </p>
            <button className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors">
              Watch Videos
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-3xl shadow-xl p-8 text-white text-center">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">API Documentation</h3>
            <p className="text-purple-100 mb-6">
              Integrate our conversion API into your applications with our docs.
            </p>
            <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
              View Docs
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">Can't find what you're looking for?</p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
