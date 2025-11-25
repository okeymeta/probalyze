
import React from 'react';
import WalletIcon from './icons/WalletIcon.tsx';
import TestimonialCard from './TestimonialCard.tsx';
import { TESTIMONIALS } from '../constants.ts';
import { SolanaProvider } from '../types.ts';

// Move DetectedWallet to types.ts and import it here for consistency
export interface LandingPageProps {
  onConnect: () => void;
  providerFound: boolean;
  availableWallets?: { name: string; provider: SolanaProvider }[];
  onSelectWallet?: (wallet: { name: string; provider: SolanaProvider }) => void;
  selectedWallet?: SolanaProvider | null;
  onMemeCoinLaunch?: () => void;
  stakingMethod?: 'default' | 'meme-coin';
}

const LandingPage: React.FC<LandingPageProps> = ({ onConnect, providerFound, availableWallets = [], onSelectWallet, selectedWallet, onMemeCoinLaunch, stakingMethod }) => {
  return (
    <div className="w-full text-center flex flex-col items-center pt-20 pb-12">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
            <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">High-Yield Staking on Solana</span>
            <h2 className="mt-2 text-4xl md:text-6xl font-extrabold leading-tight text-white">
                Maximize Your Earnings with <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-green-400">Solana Staking & Tasks</span>
            </h2>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
                Unlock the full potential of your SOL. Our platform offers industry-leading returns through secure staking and bonus tasks. Connect your wallet and start earning today.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
                {availableWallets.length > 1 && (
                  <div className="flex flex-wrap justify-center gap-3 mb-4">
                    {availableWallets.map((wallet) => (
                      <button
                        key={wallet.name}
                        onClick={() => onSelectWallet && onSelectWallet(wallet)}
                        className={`inline-flex items-center px-5 py-2 rounded-full border font-bold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 ${selectedWallet === wallet.provider ? 'bg-purple-600 text-white border-purple-700 shadow-lg' : 'bg-gray-800 text-purple-300 border-gray-600 hover:bg-purple-700 hover:text-white'}`}
                      >
                        <WalletIcon className="w-5 h-5 mr-2" />
                        {wallet.name}
                      </button>
                    ))}
                  </div>
                )}
                <button
                    onClick={onConnect}
                    disabled={!providerFound}
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-purple-600 rounded-full shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    <WalletIcon className="w-6 h-6 mr-3" />
                    {providerFound ? 'Connect Wallet & Earn' : 'Solana Wallet Not Found'}
                </button>
                {onMemeCoinLaunch && (
                  <button
                    onClick={onMemeCoinLaunch}
                    disabled={!providerFound}
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-yellow-400 bg-yellow-900 rounded-full shadow-lg shadow-yellow-500/30 hover:bg-yellow-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    🚀 Create & Launch Meme Coin
                  </button>
                )}
                {!providerFound && <p className="text-sm text-gray-400 mt-4">Please install a Solana wallet like Phantom or Solflare to continue.</p>}
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full mt-16 py-16 bg-gray-900/50 border-t border-b border-gray-700">
          <div className="container mx-auto px-6">
            <h3 className="text-3xl font-bold text-center text-white">Trusted by the Community</h3>
            <p className="text-center text-gray-400 mt-2 mb-12">See what our users are saying about their success.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TESTIMONIALS.map((testimonial, index) => (
                    <TestimonialCard key={index} testimonial={testimonial} />
                ))}
            </div>
          </div>
      </section>
    </div>
  );
};

export default LandingPage;