import React from 'react';
import { Check, Crown, Zap, Star, X, Sparkles, Shield, Rocket, Diamond } from 'lucide-react';
import { initiateRazorpayPayment } from '../lib/razorpay';
import toast from 'react-hot-toast';

interface PricingProps {
  user?: any;
  onAuthRequired: () => void;
}

const Pricing: React.FC<PricingProps> = ({ user, onAuthRequired }) => {
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleUpgrade = async (planType: string, billingCycle: string = 'monthly') => {
    if (!user) {
      onAuthRequired();
      return;
    }

    setLoading(planType);

    try {
      const result = await initiateRazorpayPayment(planType, billingCycle, {
        name: user.user_metadata?.full_name || user.email,
        email: user.email,
        phone: user.user_metadata?.phone
      });

      toast.success('Payment successful! Your subscription is now active.');
      // Refresh the page to update user data
      window.location.reload();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: 'Basic',
      price: '$10',
      period: '/month',
      description: 'Perfect for occasional users',
      icon: Star,
      color: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      features: [
        '15 files at a time conversion',
        'All basic file formats',
        'Standard processing speed',
        'Email support',
        '100MB file size limit',
        'Basic AI optimization'
      ],
      limitations: [
        'Limited to 15 files per batch',
        'No priority support'
      ],
      buttonText: 'Get Started',
      buttonStyle: 'border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 bg-white hover:bg-blue-50'
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      description: 'Best for professionals and small teams',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-purple-50',
      borderColor: 'border-blue-300',
      popular: true,
      features: [
        '50 files at a time conversion',
        'All file formats',
        'Priority processing (5x faster)',
        'Priority support',
        '1GB file size limit',
        'Batch processing',
        'No watermarks',
        'API access',
        'Advanced AI features',
        'Cloud storage integration'
      ],
      buttonText: 'Start Pro Trial',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl transform hover:scale-105 shadow-lg'
    },
    {
      name: 'Enterprise',
      price: '$39',
      period: '/month',
      description: 'For large teams and high-volume usage',
      icon: Diamond,
      color: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-300',
      features: [
        '100 files at a time conversion',
        'All premium file formats',
        'Ultra-fast processing (10x faster)',
        'Dedicated support',
        '10GB file size limit',
        'Advanced batch processing',
        'Team collaboration',
        'Custom integrations',
        'SLA guarantee',
        'On-premise deployment',
        'Custom branding',
        'Advanced analytics',
        'White-label solution',
        'Custom API endpoints'
      ],
      buttonText: 'Contact Sales',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl transform hover:scale-105 shadow-lg'
    }
  ];

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden" id="pricing">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 relative z-10">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100/20 to-purple-100/20 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-bold text-blue-200 mb-8 border border-blue-300/30">
            <Crown className="h-5 w-5 mr-2 text-yellow-400" />
            Premium Plans Available
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
            <span className="text-white">Choose Your</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block animate-gradient-x bg-300%">
              Perfect Plan
            </span>
          </h2>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
            Start free and upgrade as you grow. All plans include our core conversion features 
            with <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">premium plans unlocking advanced AI capabilities</span> and enterprise features.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 max-w-7xl mx-auto relative z-10">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 border-2 ${plan.borderColor} ${
                plan.popular ? 'ring-4 ring-blue-400/50 ring-offset-4 ring-offset-transparent scale-105' : ''
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} opacity-50 rounded-3xl`}></div>
              
              {plan.popular && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full text-sm font-bold shadow-xl flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    Most Popular
                    <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
                  </div>
                </div>
              )}

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <div className={`inline-flex p-5 rounded-3xl bg-gradient-to-r ${plan.color} mb-6 shadow-xl`}>
                    <plan.icon className="h-10 w-10 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-gray-900 mb-3">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 font-medium text-lg">{plan.description}</p>
                  
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-6xl font-black text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2 text-xl font-semibold">{plan.period}</span>
                  </div>
                  
                  {plan.name === 'Pro' && (
                    <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold">
                      <Shield className="h-4 w-4 mr-1" />
                      Save 40% annually
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4">
                        <Check className="h-4 w-4 text-white font-bold" />
                      </div>
                      <span className="text-gray-800 font-medium">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations && plan.limitations.map((limitation, limitIndex) => (
                    <li key={`limit-${limitIndex}`} className="flex items-center opacity-60">
                      <div className="flex-shrink-0 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                        <X className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-gray-500 line-through">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${plan.buttonStyle} flex items-center justify-center space-x-2`}>
                  {plan.name === 'Enterprise' ? (
                    <>
                      <Crown className="h-5 w-5" />
                      <span>{plan.buttonText}</span>
                    </>
                  ) : plan.name === 'Pro' ? (
                    <>
                      <Rocket className="h-5 w-5" />
                      <span>{plan.buttonText}</span>
                    </>
                  ) : (
                    <>
                      <Star className="h-5 w-5" />
                      <span>{plan.buttonText}</span>
                    </>
                  )}
                </button>
                
                {plan.name === 'Pro' && (
                  <button 
                    onClick={() => handleUpgrade('pro', 'monthly')}
                    disabled={loading === 'pro'}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === 'pro' ? 'Processing...' : 'Upgrade to Pro'}
                  </button>
                )}
                
                {plan.name === 'Enterprise' && (
                  <button 
                    onClick={() => handleUpgrade('enterprise', 'monthly')}
                    disabled={loading === 'enterprise'}
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === 'enterprise' ? 'Processing...' : 'Upgrade to Enterprise'}
                  </button>
                )}

                {plan.name === 'Pro' && (
                  <p className="text-center text-sm text-gray-500 mt-4 font-medium">
                    ✨ Secure payment with Razorpay • All major payment methods accepted
                  </p>
                )}
                
                {plan.name === 'Enterprise' && (
                  <p className="text-center text-sm text-gray-500 mt-4 font-medium">
                    🤝 Secure payment with Razorpay • Enterprise billing available
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-4xl mx-auto border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">All plans include:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
              <div className="flex items-center justify-center space-x-3">
                <Shield className="h-6 w-6 text-green-400" />
                <span className="font-semibold">Secure Razorpay payments</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Check className="h-6 w-6 text-green-400" />
                <span className="font-semibold">All payment methods</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Zap className="h-6 w-6 text-yellow-400" />
                <span className="font-semibold">99.9% uptime guarantee</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-gray-300">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-400" />
              <span className="font-semibold">Instant activation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-400" />
              <span className="font-semibold">Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-400" />
              <span className="font-semibold">Secure Indian payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;