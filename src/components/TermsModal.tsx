import React from 'react';
import { PLATFORM_NAME, PLATFORM_FEE_PERCENTAGE, SETTLEMENT_FEE_PERCENTAGE } from '../constants';
import { X, AlertTriangle, Shield, DollarSign, Scale } from 'lucide-react';

interface TermsModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-gray-800 p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
                Terms of Service & Risk Disclosure
              </h2>
              <p className="text-gray-400 text-sm">Please read carefully before connecting your wallet</p>
            </div>
            <button
              onClick={onDecline}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Risk Warning */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-2">⚠️ Risk Warning</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  Trading on prediction markets involves substantial risk of loss and is not suitable for everyone. 
                  You should carefully consider whether trading is appropriate for you in light of your experience, 
                  objectives, financial resources, and other relevant circumstances.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 flex-shrink-0">•</span>
                    <span><strong>Loss of Funds:</strong> You may lose some or all of your invested capital.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 flex-shrink-0">•</span>
                    <span><strong>No Guarantees:</strong> Past performance does not guarantee future results.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 flex-shrink-0">•</span>
                    <span><strong>Market Risk:</strong> Prediction markets can be volatile and unpredictable.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 flex-shrink-0">•</span>
                    <span><strong>Blockchain Risks:</strong> Smart contract bugs, network issues, and transaction failures may occur.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Platform Fees */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <DollarSign className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-purple-400 mb-3">💰 Fee Structure</h3>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Trading Fee</span>
                      <span className="text-purple-400 font-bold">{PLATFORM_FEE_PERCENTAGE}%</span>
                    </div>
                    <p className="text-xs text-gray-400">Charged on every bet you place (deducted upfront from your stake)</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Settlement Fee</span>
                      <span className="text-purple-400 font-bold">{SETTLEMENT_FEE_PERCENTAGE}%</span>
                    </div>
                    <p className="text-xs text-gray-400">Charged on your winnings when markets are resolved</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  All fees go to platform operations, maintenance, and development.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Scale className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-3">⚖️ Market Resolution</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 flex-shrink-0">1.</span>
                    <span>Markets are created by platform administrators with clear resolution criteria.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 flex-shrink-0">2.</span>
                    <span>You trade by betting on YES or NO outcomes using SOL.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 flex-shrink-0">3.</span>
                    <span>When the event concludes, administrators resolve the market based on verifiable outcomes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 flex-shrink-0">4.</span>
                    <span>Winnings are automatically distributed to winning participants proportionally.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 flex-shrink-0">5.</span>
                    <span>All transactions are recorded on the Solana blockchain for transparency.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* User Responsibilities */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-3">🛡️ Your Responsibilities</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>You are 18 years or older and legally permitted to participate in prediction markets.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>You are solely responsible for the security of your wallet and private keys.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>You understand that blockchain transactions are irreversible.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>You will not engage in market manipulation, wash trading, or other fraudulent activities.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>You accept that {PLATFORM_NAME} administrators have final authority on market resolutions.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-300 mb-3">📜 Legal Disclaimer</h3>
            <div className="text-xs text-gray-500 leading-relaxed space-y-2">
              <p>
                {PLATFORM_NAME} is a decentralized prediction market platform. We do not provide financial, 
                investment, legal, or tax advice. All content is for informational purposes only.
              </p>
              <p>
                The platform is provided "as is" without warranties of any kind. We are not liable for any 
                losses, damages, or disputes arising from your use of the platform.
              </p>
              <p>
                By connecting your wallet, you acknowledge that you have read, understood, and agree to be 
                bound by these terms and our privacy policy.
              </p>
              <p className="text-gray-400 font-semibold">
                If you do not agree with these terms, do not connect your wallet or use the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-gray-800 p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onDecline}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all border border-gray-700"
            >
              Decline & Exit
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            >
              I Accept - Connect Wallet
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-3">
            Last updated: November 24, 2025
          </p>
        </div>
      </div>
    </div>
  );
};
