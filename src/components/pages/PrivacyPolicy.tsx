import React from 'react';
import { 
  Shield, 
  Eye, 
  Lock, 
  Server, 
  Globe, 
  FileCheck, 
  UserCheck, 
  Trash2, 
  AlertTriangle, 
  Mail, 
  Phone 
} from 'lucide-react';

// Constants
const COMPANY_INFO = {
  name: 'DOCMe Technologies Ltd.',
  email: 'privacy@docme-in.com',
  dpoEmail: 'dp@docme-in.com'
};

const DATA_RETENTION_PERIODS = {
  uploadedFiles: '24 hours maximum',
  accountData: 'While account is active',
  paymentRecords: '7 years (legal requirement)',
  usageLogs: '2 years'
};

const GDPR_RIGHTS = [
  { title: 'Access', description: 'Get copies of your data', color: 'blue' },
  { title: 'Rectification', description: 'Correct inaccurate data', color: 'green' },
  { title: 'Erasure', description: 'Delete your data', color: 'red' }
];

const DATA_TYPES = [
  { title: 'Account Data', description: 'Name, email, preferences', color: 'blue' },
  { title: 'Technical Data', description: 'IP address, browser, device info', color: 'green' },
  { title: 'Payment Data', description: 'Billing info (via Stripe/Razorpay)', color: 'purple' },
  { title: 'File Data', description: 'Uploaded files (deleted within 24h)', color: 'orange' }
];

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-red-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <PolicyHeader />
        <PolicyContent />
      </div>
    </div>
  );
};

const PolicyHeader: React.FC = () => (
  <div className="text-center mb-12">
    <div className="inline-flex items-center bg-gradient-to-r from-blue-100/50 to-purple-100/50 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-bold text-blue-600 mb-6 border border-blue-200/30">
      <Shield className="h-5 w-5 mr-2" />
      GDPR Compliant Privacy Policy
    </div>
    
    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
      Privacy Policy
    </h1>
    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
      Your privacy matters. We protect your data in accordance with GDPR and international privacy laws.
    </p>
    <p className="text-sm text-gray-500 mt-2">
      Last updated: January 2025 | Version 2.1 | GDPR Compliant
    </p>
  </div>
);

const PolicyContent: React.FC = () => (
  <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
    <div className="space-y-8">
      <DataControllerSection />
      <DataCollectionSection />
      <GDPRRightsSection />
      <ExerciseRightsSection />
      <DataUsageSection />
      <DataRetentionSection />
      <SecuritySection />
      <FileProcessingSection />
      <ThirdPartySection />
      <ContactSection />
      <PolicyUpdatesSection />
    </div>
  </div>
);

const DataControllerSection: React.FC = () => (
  <section>
    <SectionHeader icon={Shield} title="Data Controller" />
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="space-y-2 text-gray-700">
        <p><strong>Company:</strong> {COMPANY_INFO.name}</p>
        <p><strong>Email:</strong> {COMPANY_INFO.email}</p>
        <p><strong>Data Protection Officer:</strong> {COMPANY_INFO.dpoEmail}</p>
      </div>
    </div>
  </section>
);

const DataCollectionSection: React.FC = () => (
  <section>
    <SectionHeader icon={Eye} title="Data We Collect" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {DATA_TYPES.map((item, index) => (
        <DataTypeCard key={index} {...item} />
      ))}
    </div>
  </section>
);

const GDPRRightsSection: React.FC = () => (
  <section>
    <SectionHeader icon={UserCheck} title="Your GDPR Rights" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {GDPR_RIGHTS.map((right, index) => (
        <RightCard key={index} {...right} />
      ))}
    </div>
  </section>
);

const ExerciseRightsSection: React.FC = () => (
  <section>
    <SectionHeader icon={Mail} title="Exercise Your Rights" />
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="space-y-2 text-blue-800">
        <p><strong>Contact:</strong> {COMPANY_INFO.dpoEmail}</p>
        <p><strong>Response Time:</strong> 30 days as required by GDPR</p>
      </div>
    </div>
  </section>
);

const DataUsageSection: React.FC = () => (
  <section>
    <SectionHeader icon={Server} title="How We Use Your Data" />
    <div className="space-y-3">
      <DataUsageItem 
        title="Service Provision" 
        description="File conversion, account management, payments" 
      />
      <DataUsageItem 
        title="Service Improvement" 
        description="Analytics, performance monitoring, security" 
      />
      <DataUsageItem 
        title="Communication" 
        description="Service updates, support (with consent for marketing)" 
      />
    </div>
  </section>
);

const DataRetentionSection: React.FC = () => (
  <section>
    <SectionHeader icon={Trash2} title="Data Retention" />
    <div className="space-y-3">
      {Object.entries(DATA_RETENTION_PERIODS).map(([key, value], index) => (
        <RetentionItem 
          key={index}
          label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          period={value}
        />
      ))}
    </div>
  </section>
);

const SecuritySection: React.FC = () => (
  <section>
    <SectionHeader icon={Lock} title="Security" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SecurityCategory 
        title="Encryption"
        items={[
          'AES-256 encryption at rest',
          'TLS 1.3 in transit',
          'End-to-end file transfers'
        ]}
      />
      <SecurityCategory 
        title="Access Control"
        items={[
          'Multi-factor authentication',
          'Role-based access',
          'Regular security audits'
        ]}
      />
    </div>
  </section>
);

const FileProcessingSection: React.FC = () => (
  <section>
    <SectionHeader icon={FileCheck} title="File Processing Promise" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PromiseCard 
        title="What We Do"
        items={[
          'Secure, automated processing',
          'Delete files within 24 hours',
          'No human access to content'
        ]}
        type="positive"
      />
      <PromiseCard 
        title="What We Don't Do"
        items={[
          'Store files permanently',
          'Share with third parties',
          'Use for machine learning'
        ]}
        type="negative"
      />
    </div>
  </section>
);

const ThirdPartySection: React.FC = () => (
  <section>
    <SectionHeader icon={Globe} title="Third Party Services" />
    <div className="bg-gray-50 rounded-xl p-6">
      <p className="text-gray-700">
        <strong>Payment Processors:</strong> Stripe, Razorpay (PCI DSS compliant)
      </p>
      <p className="text-gray-700 mt-2">
        <strong>Cloud Infrastructure:</strong> Supabase, AWS (encrypted, GDPR compliant)
      </p>
      <p className="text-blue-600 font-medium mt-3">
        We never sell your data to third parties.
      </p>
    </div>
  </section>
);

const ContactSection: React.FC = () => (
  <section>
    <SectionHeader icon={Phone} title="Contact Us" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ContactCard 
        title="Privacy Questions"
        email={COMPANY_INFO.email}
        color="blue"
      />
      <ContactCard 
        title="Data Protection Officer"
        email={COMPANY_INFO.dpoEmail}
        color="purple"
      />
    </div>
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-6">
      <p className="text-yellow-800">
        <strong>Response Time:</strong> Within 30 days
      </p>
      <p className="text-yellow-800 mt-2">
        You may also lodge a complaint with your local data protection authority.
      </p>
    </div>
  </section>
);

const PolicyUpdatesSection: React.FC = () => (
  <section>
    <SectionHeader icon={AlertTriangle} title="Policy Updates" />
    <div className="bg-gray-50 rounded-xl p-6">
      <p className="text-gray-700 mb-4">
        We'll notify you of material changes via email with 30 days notice.
      </p>
      <div className="text-center">
        <p className="text-gray-600 text-sm">
          <strong>Version:</strong> 2.1 | <strong>Effective:</strong> January 1, 2025 | <strong>GDPR Compliant:</strong> ✓ Yes
        </p>
      </div>
    </div>
  </section>
);

// Utility Components
interface SectionHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title }) => (
  <div className="flex items-center mb-4">
    <Icon className="h-6 w-6 text-blue-600 mr-3" />
    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
  </div>
);

interface DataTypeCardProps {
  title: string;
  description: string;
  color: string;
}

const DataTypeCard: React.FC<DataTypeCardProps> = ({ title, description, color }) => (
  <div className={`bg-${color}-50 rounded-xl p-6`}>
    <h3 className={`font-bold text-${color}-900 mb-3`}>{title}</h3>
    <p className={`text-${color}-800 text-sm`}>{description}</p>
  </div>
);

interface RightCardProps {
  title: string;
  description: string;
  color: string;
}

const RightCard: React.FC<RightCardProps> = ({ title, description, color }) => (
  <div className={`bg-${color}-100 rounded-xl p-6 text-center`}>
    <h3 className={`font-bold text-${color}-900 mb-2`}>{title}</h3>
    <p className={`text-${color}-800 text-sm`}>{description}</p>
  </div>
);

interface DataUsageItemProps {
  title: string;
  description: string;
}

const DataUsageItem: React.FC<DataUsageItemProps> = ({ title, description }) => (
  <div className="flex items-start">
    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 mr-3 flex-shrink-0"></div>
    <p className="text-gray-700">
      <strong>{title}:</strong> {description}
    </p>
  </div>
);

interface RetentionItemProps {
  label: string;
  period: string;
}

const RetentionItem: React.FC<RetentionItemProps> = ({ label, period }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
    <span className="font-medium text-gray-900">{label}:</span>
    <span className="text-gray-600">{period}</span>
  </div>
);

interface SecurityCategoryProps {
  title: string;
  items: string[];
}

const SecurityCategory: React.FC<SecurityCategoryProps> = ({ title, items }) => (
  <div>
    <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
    <ul className="space-y-2 text-gray-700">
      {items.map((item, index) => (
        <li key={index}>• {item}</li>
      ))}
    </ul>
  </div>
);

interface PromiseCardProps {
  title: string;
  items: string[];
  type: 'positive' | 'negative';
}

const PromiseCard: React.FC<PromiseCardProps> = ({ title, items, type }) => {
  const isPositive = type === 'positive';
  const colorClass = isPositive ? 'green' : 'red';
  const symbol = isPositive ? '✓' : '✗';

  return (
    <div className={`bg-${colorClass}-50 rounded-xl p-6`}>
      <h3 className={`font-bold text-${colorClass}-900 mb-3`}>{title}</h3>
      <ul className={`space-y-2 text-${colorClass}-800`}>
        {items.map((item, index) => (
          <li key={index}>{symbol} {item}</li>
        ))}
      </ul>
    </div>
  );
};

interface ContactCardProps {
  title: string;
  email: string;
  color: string;
}

const ContactCard: React.FC<ContactCardProps> = ({ title, email, color }) => (
  <div className={`bg-${color}-50 rounded-xl p-6`}>
    <h3 className={`font-bold text-${color}-900 mb-3`}>{title}</h3>
    <p className={`text-${color}-800`}>{email}</p>
  </div>
);

export default PrivacyPolicy;
