import React, { useState } from 'react';
import { PLATFORM_NAME } from '../constants';
import { TrendingUp, Twitter, Github, MessageCircle } from 'lucide-react';
import { TermsModal } from './TermsModal';
import { PrivacyModal } from './PrivacyModal';
import { HowItWorksModal } from './HowItWorksModal';

const Footer: React.FC = () => {
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showHowItWorks, setShowHowItWorks] = useState(false);

    return (
        <>
            <footer className="w-full py-8 sm:py-12 mt-12 border-t border-gray-800/50 bg-[#0a0a0f]/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-xl font-bold gradient-text">{PLATFORM_NAME}</h3>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                The world's most advanced prediction market platform on Solana. Trade with confidence.
                            </p>
                        </div>

                        {/* Markets */}
                        <div>
                            <h4 className="text-white font-bold mb-3 text-sm">Markets</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-purple-400 transition-colors">Trending</a></li>
                                <li><a href="#" className="hover:text-purple-400 transition-colors">Politics</a></li>
                                <li><a href="#" className="hover:text-purple-400 transition-colors">Crypto</a></li>
                                <li><a href="#" className="hover:text-purple-400 transition-colors">Sports</a></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="text-white font-bold mb-3 text-sm">Resources</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>
                                    <button 
                                        onClick={() => setShowHowItWorks(true)}
                                        className="hover:text-purple-400 transition-colors text-left"
                                    >
                                        How It Works
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => setShowHowItWorks(true)}
                                        className="hover:text-purple-400 transition-colors text-left"
                                    >
                                        Trading Guide
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => setShowHowItWorks(true)}
                                        className="hover:text-purple-400 transition-colors text-left"
                                    >
                                        Fee Structure
                                    </button>
                                </li>
                                <li><a href="#" className="hover:text-purple-400 transition-colors">API Docs</a></li>
                            </ul>
                        </div>

                        {/* Community */}
                        <div>
                            <h4 className="text-white font-bold mb-3 text-sm">Community</h4>
                            <div className="flex gap-3 mb-4">
                                <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all">
                                    <Twitter className="w-4 h-4 text-white" />
                                </a>
                                <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all">
                                    <MessageCircle className="w-4 h-4 text-white" />
                                </a>
                                <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all">
                                    <Github className="w-4 h-4 text-white" />
                                </a>
                            </div>
                            <p className="text-xs text-gray-500">Join our growing community of traders</p>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-6 border-t border-gray-800/50">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
                                &copy; {new Date().getFullYear()} {PLATFORM_NAME}. All Rights Reserved. Built on Solana.
                            </p>
                            <div className="flex gap-4 text-xs text-gray-500">
                                <button 
                                    onClick={() => setShowTerms(true)}
                                    className="hover:text-purple-400 transition-colors"
                                >
                                    Terms
                                </button>
                                <button 
                                    onClick={() => setShowPrivacy(true)}
                                    className="hover:text-purple-400 transition-colors"
                                >
                                    Privacy
                                </button>
                                <button 
                                    onClick={() => setShowHowItWorks(true)}
                                    className="hover:text-purple-400 transition-colors"
                                >
                                    Disclaimer
                                </button>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-gray-600 max-w-4xl mx-auto text-center leading-relaxed">
                            <strong>Risk Warning:</strong> Trading prediction markets involves risk. Past performance is not indicative of future results. 
                            Platform fees: 2.5% on all trades + 3% settlement fee on winnings. Markets are resolved by platform administrators based on verifiable outcomes. 
                            Always trade responsibly and never risk more than you can afford to lose.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Modals */}
            {showTerms && (
                <TermsModal 
                    onAccept={() => setShowTerms(false)} 
                    onDecline={() => setShowTerms(false)} 
                />
            )}
            {showPrivacy && (
                <PrivacyModal onClose={() => setShowPrivacy(false)} />
            )}
            {showHowItWorks && (
                <HowItWorksModal onClose={() => setShowHowItWorks(false)} />
            )}
        </>
    );
};

export default Footer;