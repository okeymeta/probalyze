import React, { useState } from 'react';
import { X, FileText, Shield, Check } from 'lucide-react';

interface TermsAndPrivacyModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  isOpen,
  onAccept,
  onDecline
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  if (!isOpen) return null;

  const canProceed = acceptedTerms && acceptedPrivacy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome to Probalyze</h2>
              <p className="text-sm text-gray-400">Please review and accept our terms</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 px-6 py-4 font-semibold transition-all ${
              activeTab === 'terms'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Terms & Conditions
            </div>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-6 py-4 font-semibold transition-all ${
              activeTab === 'privacy'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy Policy
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-300">
          {activeTab === 'terms' ? (
            <>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Terms & Conditions</h3>
                <p className="text-sm text-gray-400 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
              </div>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">1. Acceptance of Terms</h4>
                <p className="text-sm leading-relaxed">
                  By accessing and using Probalyze, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">2. Platform Overview</h4>
                <p className="text-sm leading-relaxed mb-2">
                  Probalyze is a decentralized prediction market platform built on Solana blockchain. Users can:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Create and participate in prediction markets</li>
                  <li>Place bets using SOL cryptocurrency</li>
                  <li>Trade YES/NO positions on various outcomes</li>
                  <li>Copy trades from other users</li>
                  <li>Earn rewards from correct predictions</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">3. Platform Fees</h4>
                <p className="text-sm leading-relaxed mb-2">
                  Probalyze charges the following fees to maintain and operate the platform:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li><strong>2.5% Trading Fee</strong>: Charged on every bet placed (deducted from bet amount)</li>
                  <li><strong>3% Settlement Fee</strong>: Charged on winnings when markets are resolved</li>
                  <li>All fees are non-refundable and automatically collected</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">4. Market Rules</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Markets have defined closing times when betting stops</li>
                  <li>Markets are resolved by platform administrators based on objective outcomes</li>
                  <li>Single-bettor markets are automatically refunded after 78 hours</li>
                  <li>All market outcomes are final once resolved</li>
                  <li>No appeals or disputes after market resolution</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">5. User Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>You must be 18+ years old to use Probalyze</li>
                  <li>You are responsible for securing your wallet and private keys</li>
                  <li>You must comply with local laws regarding gambling and cryptocurrency</li>
                  <li>You acknowledge that cryptocurrency markets are volatile</li>
                  <li>You use the platform at your own risk</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">6. Prohibited Activities</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Market manipulation or coordinated betting schemes</li>
                  <li>Creating markets with misleading or false information</li>
                  <li>Exploiting platform bugs or vulnerabilities</li>
                  <li>Using bots or automated trading systems without approval</li>
                  <li>Money laundering or illicit financial activities</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">7. Risk Disclosure</h4>
                <p className="text-sm leading-relaxed">
                  Trading on prediction markets involves significant risk. You may lose all funds invested. 
                  Cryptocurrency prices are volatile. Past performance does not guarantee future results. 
                  Only invest what you can afford to lose.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">8. No Warranty</h4>
                <p className="text-sm leading-relaxed">
                  Probalyze is provided "as is" without warranties of any kind. We do not guarantee platform uptime, 
                  accuracy of information, or profitability of trades. Use at your own discretion.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">9. Limitation of Liability</h4>
                <p className="text-sm leading-relaxed">
                  Probalyze and its operators are not liable for any losses, damages, or disputes arising from platform use. 
                  This includes but is not limited to: trading losses, smart contract failures, blockchain issues, or third-party services.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">10. Modifications</h4>
                <p className="text-sm leading-relaxed">
                  We reserve the right to modify these terms at any time. Continued use of the platform after changes 
                  constitutes acceptance of new terms.
                </p>
              </section>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Privacy Policy</h3>
                <p className="text-sm text-gray-400 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
              </div>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">1. Information We Collect</h4>
                <p className="text-sm leading-relaxed mb-2">
                  Probalyze is a decentralized platform. We collect minimal information:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li><strong>Wallet Addresses</strong>: Your public Solana wallet address</li>
                  <li><strong>Transaction Data</strong>: Bets, trades, and market interactions</li>
                  <li><strong>Usage Data</strong>: Platform interactions and feature usage</li>
                  <li><strong>No Personal Data</strong>: We do not collect names, emails, or identity documents</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">2. How We Use Information</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Process and record your bets and trades</li>
                  <li>Calculate winnings and distribute payouts</li>
                  <li>Display platform statistics and market data</li>
                  <li>Improve platform features and user experience</li>
                  <li>Prevent fraud and market manipulation</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">3. Data Storage</h4>
                <p className="text-sm leading-relaxed">
                  All platform data is stored using Supabase cloud storage. Transaction data is also recorded on the 
                  Solana blockchain, which is public and permanent. Market data, bets, and balances are stored in 
                  encrypted JSON files accessible only to platform infrastructure.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">4. Blockchain Transparency</h4>
                <p className="text-sm leading-relaxed">
                  Since Probalyze operates on Solana blockchain, all transactions are publicly visible. Anyone can view 
                  your wallet address and transaction history on blockchain explorers. This is inherent to blockchain technology.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">5. Copy Trading Privacy</h4>
                <p className="text-sm leading-relaxed">
                  When using copy trading features, other users can view your wallet address and your trading positions 
                  in markets. This allows them to replicate your trading strategies.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">6. Third-Party Services</h4>
                <p className="text-sm leading-relaxed mb-2">
                  Probalyze integrates with:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li><strong>Solana Blockchain</strong>: For transaction processing</li>
                  <li><strong>Wallet Providers</strong>: Phantom, Solflare, etc.</li>
                  <li><strong>Supabase</strong>: For cloud data storage</li>
                </ul>
                <p className="text-sm leading-relaxed mt-2">
                  These services have their own privacy policies which you should review.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">7. Cookies and Tracking</h4>
                <p className="text-sm leading-relaxed">
                  We use local storage to save your wallet connection preferences and platform settings. 
                  We do not use cookies for advertising or tracking purposes.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">8. Data Security</h4>
                <p className="text-sm leading-relaxed">
                  We implement industry-standard security measures to protect platform data. However, no system is 100% secure. 
                  You are responsible for protecting your wallet private keys and recovery phrases.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">9. Your Rights</h4>
                <p className="text-sm leading-relaxed">
                  Since blockchain data is immutable, we cannot delete or modify transaction history. 
                  You can disconnect your wallet at any time to stop using the platform. Platform usage data 
                  may be retained for analytics and compliance purposes.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">10. Children's Privacy</h4>
                <p className="text-sm leading-relaxed">
                  Probalyze is not intended for users under 18 years old. We do not knowingly collect information 
                  from minors. If you are under 18, please do not use this platform.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">11. Contact Information</h4>
                <p className="text-sm leading-relaxed">
                  For privacy concerns or questions, you can reach out through our platform's support channels. 
                  Note that due to decentralized nature, response times may vary.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-purple-400 mb-2">12. Policy Updates</h4>
                <p className="text-sm leading-relaxed">
                  We may update this privacy policy periodically. Continued platform use after changes indicates acceptance. 
                  Check this page regularly for updates.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Checkboxes */}
        <div className="p-6 border-t border-gray-700 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-1">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 checked:bg-purple-500 checked:border-purple-500 cursor-pointer transition-all"
              />
              {acceptedTerms && (
                <Check className="w-3 h-3 text-white absolute pointer-events-none" />
              )}
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              I have read and agree to the <strong className="text-purple-400">Terms & Conditions</strong>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-1">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 checked:bg-purple-500 checked:border-purple-500 cursor-pointer transition-all"
              />
              {acceptedPrivacy && (
                <Check className="w-3 h-3 text-white absolute pointer-events-none" />
              )}
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              I have read and agree to the <strong className="text-purple-400">Privacy Policy</strong>
            </span>
          </label>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
            <p className="text-xs text-yellow-300">
              ⚠️ <strong>Important:</strong> By accepting, you acknowledge that prediction markets involve risk and you may lose your investment. 
              Only trade with funds you can afford to lose.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onDecline}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Decline & Disconnect
          </button>
          <button
            onClick={onAccept}
            disabled={!canProceed}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-blue-600"
          >
            {canProceed ? 'Accept & Continue' : 'Please Accept Both'}
          </button>
        </div>
      </div>
    </div>
  );
};
