import React from 'react';
import { X, Shield, Eye, Lock, Database, UserCheck } from 'lucide-react';
import { PLATFORM_NAME } from '../constants';

interface PrivacyModalProps {
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="glass-card w-full max-w-2xl sm:max-w-3xl rounded-2xl border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20 my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-gray-800 p-3 sm:p-4 md:p-6 z-10">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold gradient-text mb-1 sm:mb-2">
                Privacy Policy
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">How we handle your data and protect your privacy</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-gray-800 rounded-lg shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Introduction */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">🔒 Your Privacy Matters</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {PLATFORM_NAME} is committed to protecting your privacy. This policy explains what information 
                  we collect, how we use it, and your rights regarding your data.
                </p>
              </div>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Database className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-purple-400 mb-3">📊 Information We Collect</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2 text-sm">Wallet Information</h4>
                    <ul className="space-y-1 text-sm text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 shrink-0">•</span>
                        <span>Your public wallet address (visible on-chain)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 shrink-0">•</span>
                        <span>Transaction history and signatures (recorded on Solana blockchain)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 shrink-0">•</span>
                        <span>Betting activity, market participation, and trading patterns</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2 text-sm">Usage Data</h4>
                    <ul className="space-y-1 text-sm text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 shrink-0">•</span>
                        <span>Browser type, device information, and operating system</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 shrink-0">•</span>
                        <span>IP address and approximate location (for security purposes)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 shrink-0">•</span>
                        <span>Pages visited, features used, and interaction patterns</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2 text-sm">Local Storage</h4>
                    <ul className="space-y-1 text-sm text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 shrink-0">•</span>
                        <span>Terms acceptance status (stored locally in your browser)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 shrink-0">•</span>
                        <span>User preferences and settings</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How We Use Information */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Eye className="w-6 h-6 text-green-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-3">👁️ How We Use Your Information</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 shrink-0">✓</span>
                    <span><strong>Platform Operations:</strong> Process transactions, manage markets, and facilitate trading</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 shrink-0">✓</span>
                    <span><strong>Security & Fraud Prevention:</strong> Detect suspicious activity and protect against market manipulation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 shrink-0">✓</span>
                    <span><strong>Analytics:</strong> Understand usage patterns and improve platform features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 shrink-0">✓</span>
                    <span><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <UserCheck className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-orange-400 mb-3">🤝 Data Sharing & Disclosure</h3>
                <p className="text-gray-300 text-sm mb-3">
                  We do not sell your personal information. However, certain data may be shared in the following situations:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 shrink-0">•</span>
                    <span><strong>Blockchain Transparency:</strong> All transactions are publicly visible on the Solana blockchain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 shrink-0">•</span>
                    <span><strong>Service Providers:</strong> With trusted partners who help operate the platform (e.g., hosting, analytics)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 shrink-0">•</span>
                    <span><strong>Legal Requirements:</strong> When required by law, court order, or government request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 shrink-0">•</span>
                    <span><strong>Business Transfers:</strong> If the platform is sold or merged with another entity</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-red-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-3">🔐 Data Security</h3>
                <p className="text-gray-300 text-sm mb-3">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 shrink-0">•</span>
                    <span>Encrypted connections (HTTPS/SSL)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 shrink-0">•</span>
                    <span>Secure wallet integration via trusted providers (Phantom, Solflare, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 shrink-0">•</span>
                    <span>Regular security audits and monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 shrink-0">•</span>
                    <span>No storage of private keys (managed by your wallet only)</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-3 italic">
                  Note: While we take security seriously, no system is 100% secure. You are responsible for securing your wallet and private keys.
                </p>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">⚖️ Your Privacy Rights</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 shrink-0">•</span>
                <span><strong>Access:</strong> Request a copy of your data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 shrink-0">•</span>
                <span><strong>Correction:</strong> Update inaccurate information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 shrink-0">•</span>
                <span><strong>Deletion:</strong> Request removal of your data (subject to legal requirements)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 shrink-0">•</span>
                <span><strong>Opt-Out:</strong> Disconnect your wallet to stop using the platform</span>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              Note: Blockchain transactions are permanent and cannot be deleted. Wallet addresses remain visible on-chain.
            </p>
          </div>

          {/* Cookies & Tracking */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">🍪 Cookies & Tracking</h3>
            <p className="text-gray-300 text-sm mb-3">
              We use minimal cookies and local storage for:
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 shrink-0">•</span>
                <span>Remembering your terms acceptance status</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 shrink-0">•</span>
                <span>Maintaining your session and preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 shrink-0">•</span>
                <span>Analytics to improve platform performance</span>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              You can clear cookies in your browser settings at any time.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
            <h3 className="text-lg font-bold text-red-400 mb-3">👶 Children's Privacy</h3>
            <p className="text-gray-300 text-sm">
              {PLATFORM_NAME} is not intended for users under 18 years of age. We do not knowingly collect 
              information from children. If you are a parent and believe your child has used this platform, 
              please contact us immediately.
            </p>
          </div>

          {/* Changes to Policy */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-300 mb-3">📝 Changes to This Policy</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with 
              an updated "Last Modified" date. Continued use of the platform after changes constitutes acceptance 
              of the updated policy.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-300 mb-3">📧 Contact Us</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              If you have questions about this Privacy Policy or wish to exercise your privacy rights, 
              please contact us through our official channels.
            </p>
          </div>

          {/* Effective Date */}
          <div className="text-center">
            <p className="text-xs text-gray-600">
              <strong>Last Updated:</strong> November 24, 2025
            </p>
            <p className="text-xs text-gray-600 mt-1">
              <strong>Effective Date:</strong> November 24, 2025
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-gray-800 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
