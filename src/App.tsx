import React, { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { SolanaProvider, Market } from './types';
import { ADMIN_WALLET_ADDRESS, PLATFORM_NAME } from './constants';

import Header from './components/Header';
import Footer from './components/Footer';
import SpinnerIcon from './components/icons/SpinnerIcon';
import { Modal } from './components/Modal';
import { TermsModal } from './components/TermsModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminDashboard } from './components/AdminDashboard';
import { MarketList } from './components/MarketList';
import { MarketDetailView } from './components/MarketDetailView';
import { BettingModal } from './components/BettingModal';
import { ResolveModal } from './components/ResolveModal';
import { UserBalanceWidget } from './components/UserBalanceWidget';
import { PortfolioPage } from './components/PortfolioPage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { loadMarkets, checkAndRefundSingleBettorMarkets, initializeStorageFiles } from './lib/marketManager';

type ModalContent = { message: string; type: 'success' | 'error' | 'info'; } | null;
type Page = 'markets' | 'portfolio' | 'leaderboard';

interface DetectedWallet {
    name: string;
    provider: SolanaProvider;
}

const WALLET_STORAGE_KEY = 'probalyze_connected_wallet';
const WALLET_NAME_STORAGE_KEY = 'probalyze_wallet_name';

export const App: React.FC = () => {
    const [provider, setProvider] = useState<SolanaProvider | null>(null);
    const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
    const [modalContent, setModalContent] = useState<ModalContent>(null);
    const [availableWallets, setAvailableWallets] = useState<DetectedWallet[]>([]);
    const [isConnecting, setIsConnecting] = useState(false);
    const [selectedMarketForBetting, setSelectedMarketForBetting] = useState<Market | null>(null);
    const [selectedMarketForResolving, setSelectedMarketForResolving] = useState<Market | null>(null);
    const [selectedMarketForViewing, setSelectedMarketForViewing] = useState<Market | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showAdminDashboard, setShowAdminDashboard] = useState(false);
    const [previewMarkets, setPreviewMarkets] = useState<Market[]>([]);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [isAutoConnecting, setIsAutoConnecting] = useState(true);
    const [currentPage, setCurrentPage] = useState<Page>('markets');

    // Detect wallets and attempt auto-reconnect
    useEffect(() => {
        // Initialize storage files on app load
        initializeStorageFiles().then(() => {
            console.log('Storage files ready');
        });

        // Check if user has previously accepted terms
        const termsAccepted = localStorage.getItem('probalyze_terms_accepted');
        if (termsAccepted === 'true') {
            setHasAcceptedTerms(true);
        }

        // Detect multiple wallets
        const wallets: DetectedWallet[] = [];
        if (typeof window !== 'undefined') {
            const anyWindow = window as any;
            if (anyWindow.solana?.isPhantom) {
                wallets.push({ name: 'Phantom', provider: anyWindow.solana });
            }
            if (anyWindow.solflare?.isSolflare) {
                wallets.push({ name: 'Solflare', provider: anyWindow.solflare });
            }
            if (anyWindow.backpack?.isBackpack) {
                wallets.push({ name: 'Backpack', provider: anyWindow.backpack });
            }
            if (anyWindow.braveSolana) {
                wallets.push({ name: 'Brave', provider: anyWindow.braveSolana });
            }
        }
        setAvailableWallets(wallets);
        
        if (wallets.length === 1) {
            setProvider(wallets[0].provider);
        }

        // Check for previously connected wallet and attempt reconnection
        const savedWalletName = localStorage.getItem(WALLET_NAME_STORAGE_KEY);
        const savedWalletAddress = localStorage.getItem(WALLET_STORAGE_KEY);
        
        if (savedWalletName && savedWalletAddress && wallets.length > 0) {
            const savedWallet = wallets.find(w => w.name === savedWalletName);
            if (savedWallet) {
                setProvider(savedWallet.provider);
                // Attempt silent reconnect
                attemptAutoReconnect(savedWallet.provider, savedWalletAddress);
            } else {
                setIsAutoConnecting(false);
            }
        } else {
            setIsAutoConnecting(false);
        }

        // Load preview markets for landing page
        loadPreviewMarkets();
    }, []);

    const attemptAutoReconnect = async (walletProvider: SolanaProvider, expectedAddress: string) => {
        try {
            const { publicKey: userPublicKey } = await walletProvider.connect({ onlyIfTrusted: true });
            
            if (userPublicKey.toBase58() === expectedAddress) {
                setPublicKey(userPublicKey);
            } else {
                localStorage.removeItem(WALLET_STORAGE_KEY);
                localStorage.removeItem(WALLET_NAME_STORAGE_KEY);
            }
        } catch (error) {
            console.log('Auto-reconnect failed, user needs to manually connect');
            localStorage.removeItem(WALLET_STORAGE_KEY);
            localStorage.removeItem(WALLET_NAME_STORAGE_KEY);
        } finally {
            setIsAutoConnecting(false);
        }
    };
    
    // Auto-refund system - runs every 10 minutes
    useEffect(() => {
        const checkRefunds = async () => {
            try {
                const result = await checkAndRefundSingleBettorMarkets();
                if (result.refunded.length > 0) {
                    console.log(`Auto-refunded ${result.refunded.length} market(s):`, result.refunded);
                    setRefreshTrigger(prev => prev + 1);
                    loadPreviewMarkets();
                }
            } catch (err) {
                console.error('Auto-refund check error:', err);
            }
        };

        checkRefunds();
        const interval = setInterval(checkRefunds, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);
    
    const loadPreviewMarkets = async () => {
        try {
            const markets = await loadMarkets();
            setPreviewMarkets(markets.slice(0, 6));
        } catch (err) {
            console.error('Error loading preview markets:', err);
        }
    };

    const showModal = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setModalContent({ message, type });
    };

    const hideModal = () => {
        setModalContent(null);
    };

    const handleSelectWallet = (wallet: DetectedWallet) => {
        setProvider(wallet.provider);
    };

    const handleAcceptTerms = () => {
        localStorage.setItem('probalyze_terms_accepted', 'true');
        setHasAcceptedTerms(true);
        setShowTermsModal(false);
        handleConnect();
    };

    const handleDeclineTerms = () => {
        setShowTermsModal(false);
        showModal('You must accept the Terms of Service to use Probalyze.', 'error');
    };

    const initiateConnection = () => {
        if (!provider) {
            showModal('No wallet selected. Please select a wallet to continue.', 'error');
            return;
        }

        if (!hasAcceptedTerms) {
            setShowTermsModal(true);
            return;
        }

        handleConnect();
    };

    const handleConnect = useCallback(async () => {
        if (!provider) {
            showModal('No wallet selected. Please select a wallet to continue.', 'error');
            return;
        }

        setIsConnecting(true);

        try {
            const { publicKey: userPublicKey } = await provider.connect({ onlyIfTrusted: false });
            setPublicKey(userPublicKey);
            
            const connectedWalletName = availableWallets.find(w => w.provider === provider)?.name;
            if (connectedWalletName) {
                localStorage.setItem(WALLET_STORAGE_KEY, userPublicKey.toBase58());
                localStorage.setItem(WALLET_NAME_STORAGE_KEY, connectedWalletName);
            }
            
            showModal('Wallet connected successfully!', 'success');
        } catch (error) {
            console.error('Wallet connection failed:', error);
            if (error instanceof Error) {
                if (error.message.includes('User rejected')) {
                    showModal('Connection cancelled. Please approve the connection in your wallet.', 'error');
                } else {
                    showModal(`Connection failed: ${error.message}`, 'error');
                }
            } else {
                showModal('Failed to connect wallet. Please try again.', 'error');
            }
        } finally {
            setIsConnecting(false);
        }
    }, [provider, availableWallets]);

    const handleDisconnect = async () => {
        if (provider) {
            try {
                await provider.disconnect();
                setPublicKey(null);
                setShowAdminDashboard(false);
                setShowAdminPanel(false);
                setSelectedMarketForViewing(null);
                setCurrentPage('markets');
                
                localStorage.removeItem(WALLET_STORAGE_KEY);
                localStorage.removeItem(WALLET_NAME_STORAGE_KEY);
                
                showModal('Wallet disconnected', 'info');
            } catch (err) {
                console.error('Disconnect error:', err);
            }
        }
    };

    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
        setSelectedMarketForViewing(null);
        setShowAdminPanel(false);
        setShowAdminDashboard(false);
    };

    const handleBetClick = (market: Market) => {
        if (!publicKey) {
            showModal('Please connect your wallet first', 'error');
            return;
        }
        setSelectedMarketForBetting(market);
    };

    const handleResolveClick = (market: Market) => {
        setSelectedMarketForResolving(market);
    };

    const handleViewMarket = (market: Market) => {
        setSelectedMarketForViewing(market);
    };

    const handleBackFromMarketView = () => {
        setSelectedMarketForViewing(null);
    };

    const handleMarketCreated = () => {
        setRefreshTrigger(prev => prev + 1);
        setShowAdminPanel(false);
        loadPreviewMarkets();
        showModal('Market created successfully!', 'success');
    };

    const handleBetPlaced = () => {
        setRefreshTrigger(prev => prev + 1);
        loadPreviewMarkets();
        showModal('Bet placed successfully!', 'success');
    };

    const handleMarketResolved = () => {
        setRefreshTrigger(prev => prev + 1);
        loadPreviewMarkets();
        showModal('Market resolved successfully! Payouts have been calculated.', 'success');
    };

    const handleMarketClickFromPortfolio = (marketId: string) => {
        // Find the market and navigate to its detail view
        loadMarkets().then(markets => {
            const market = markets.find(m => m.id === marketId);
            if (market) {
                setSelectedMarketForViewing(market);
                setCurrentPage('markets');
            }
        });
    };

    const isAdmin = publicKey?.toBase58() === ADMIN_WALLET_ADDRESS;

    const renderContent = () => {
        // Show loading while attempting auto-reconnect
        if (isAutoConnecting) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <SpinnerIcon className="h-16 w-16 text-purple-400 animate-spin mb-4" />
                    <h2 className="text-2xl font-bold text-white">Reconnecting Wallet...</h2>
                    <p className="text-gray-400 mt-2">Please wait while we restore your session.</p>
                </div>
            );
        }

        if (isConnecting) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <SpinnerIcon className="h-16 w-16 text-purple-400 animate-spin mb-4" />
                    <h2 className="text-2xl font-bold text-white">Connecting Wallet...</h2>
                    <p className="text-gray-400 mt-2">Please approve the connection in your wallet.</p>
                </div>
            );
        }

        // Landing page - no wallet connected
        if (!publicKey) {
            return (
                <div className="w-full">
                    {/* Hero Section */}
                    <section className="max-w-7xl mx-auto px-6 py-16 text-center">
                        <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-full">
                            <span className="text-sm font-semibold text-purple-300">🚀 Powered by Solana</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
                            Trade on Your Predictions
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                            The most advanced prediction market platform. Trade on real-world events with transparent settlements and real-time charts.
                        </p>
                        
                        {/* Wallet Connection */}
                        <div className="flex flex-col items-center gap-4">
                            {availableWallets.length > 1 && (
                                <div className="flex flex-wrap justify-center gap-3 mb-2">
                                    {availableWallets.map((wallet) => (
                                        <button
                                            key={wallet.name}
                                            onClick={() => handleSelectWallet(wallet)}
                                            className={`px-5 py-2 rounded-lg border font-bold text-sm transition-all ${
                                                provider === wallet.provider 
                                                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/30' 
                                                    : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-purple-500/50'
                                            }`}
                                        >
                                            {wallet.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={initiateConnection}
                                disabled={!provider}
                                className="px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {provider ? '🔗 Connect Wallet & Start Trading' : '❌ Install Solana Wallet'}
                            </button>
                            {!provider && (
                                <p className="text-sm text-gray-500">Install Phantom, Solflare, or another Solana wallet to continue</p>
                            )}
                        </div>
                    </section>

                    {/* Live Markets Preview */}
                    {previewMarkets.length > 0 && (
                        <section className="max-w-7xl mx-auto px-6 py-12">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">🔥 Live Markets</h2>
                                    <p className="text-gray-400">Trade on trending events right now</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Real-time data</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-xs text-green-400 font-semibold">Live</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {previewMarkets.map(market => {
                                    const totalVolume = market.totalYesAmount + market.totalNoAmount;
                                    const yesPercentage = totalVolume > 0 ? (market.totalYesAmount / totalVolume) * 100 : market.initialYesPrice * 100;
                                    
                                    return (
                                        <div 
                                            key={market.id} 
                                            className="glass-card rounded-xl p-6 hover:border-purple-500/30 transition-all cursor-pointer market-card"
                                            onClick={initiateConnection}
                                        >
                                            {market.imageUrl && (
                                                <img 
                                                    src={market.imageUrl} 
                                                    alt={market.title}
                                                    className="w-full h-32 object-cover rounded-lg mb-4"
                                                />
                                            )}
                                            <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">{market.title}</h3>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold text-green-400">{yesPercentage.toFixed(0)}%</span>
                                                    <span className="text-xs text-gray-500">Yes</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">No</span>
                                                    <span className="text-2xl font-bold text-red-400">{(100 - yesPercentage).toFixed(0)}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mb-4">
                                                <div 
                                                    className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all"
                                                    style={{ width: `${yesPercentage}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400">Volume</span>
                                                <span className="text-blue-400 font-semibold">{totalVolume.toFixed(2)} SOL</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="text-center mt-8">
                                <button
                                    onClick={initiateConnection}
                                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all"
                                >
                                    Connect Wallet to Trade on All Markets →
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Features Section */}
                    <section className="max-w-7xl mx-auto px-6 py-16">
                        <h3 className="text-3xl font-bold text-center text-white mb-12">Why Choose {PLATFORM_NAME}?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="glass-card p-8 rounded-xl text-center">
                                <div className="text-5xl mb-4">⚡</div>
                                <h4 className="text-xl font-bold text-white mb-3">Lightning Fast</h4>
                                <p className="text-gray-400">Trade on Solana's blazing-fast blockchain. Instant confirmations and low fees.</p>
                            </div>
                            <div className="glass-card p-8 rounded-xl text-center">
                                <div className="text-5xl mb-4">📊</div>
                                <h4 className="text-xl font-bold text-white mb-3">Real-Time Charts</h4>
                                <p className="text-gray-400">Professional trading interface with live charts that move based on market demand.</p>
                            </div>
                            <div className="glass-card p-8 rounded-xl text-center">
                                <div className="text-5xl mb-4">💰</div>
                                <h4 className="text-xl font-bold text-white mb-3">Transparent Fees</h4>
                                <p className="text-gray-400">2.5% platform fee + 3% settlement fee. Fair, transparent, and competitive.</p>
                            </div>
                        </div>
                    </section>
                </div>
            );
        }

        // Market Detail View
        if (selectedMarketForViewing) {
            return (
                <div className="w-full max-w-7xl mx-auto px-6 py-8">
                    <MarketDetailView
                        market={selectedMarketForViewing}
                        userWallet={publicKey.toBase58()}
                        onBack={handleBackFromMarketView}
                        onBetClick={handleBetClick}
                        onResolveClick={isAdmin ? handleResolveClick : undefined}
                        isAdmin={isAdmin}
                    />
                </div>
            );
        }

        // Portfolio Page
        if (currentPage === 'portfolio') {
            return (
                <PortfolioPage 
                    walletAddress={publicKey.toBase58()} 
                    onMarketClick={handleMarketClickFromPortfolio}
                />
            );
        }

        // Leaderboard Page
        if (currentPage === 'leaderboard') {
            return (
                <LeaderboardPage currentUserWallet={publicKey.toBase58()} />
            );
        }

        // Main app - wallet connected (Markets page)
        return (
            <div className="w-full max-w-7xl mx-auto px-6 py-8">
                {/* Admin Controls */}
                {isAdmin && (
                    <div className="mb-8 flex items-center gap-3">
                        <button
                            onClick={() => {
                                setShowAdminDashboard(!showAdminDashboard);
                                setShowAdminPanel(false);
                            }}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${
                                showAdminDashboard
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                            }`}
                        >
                            📊 Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setShowAdminPanel(!showAdminPanel);
                                setShowAdminDashboard(false);
                            }}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${
                                showAdminPanel
                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                            }`}
                        >
                            ➕ Create Market
                        </button>
                    </div>
                )}

                {/* Admin Dashboard */}
                {isAdmin && showAdminDashboard ? (
                    <AdminDashboard onCreateMarket={() => {
                        setShowAdminPanel(true);
                        setShowAdminDashboard(false);
                    }} />
                ) : isAdmin && showAdminPanel ? (
                    <AdminPanel 
                        adminWallet={publicKey.toBase58()} 
                        onMarketCreated={handleMarketCreated}
                    />
                ) : (
                    <>
                        {/* User Dashboard */}
                        <div className="mb-8">
                            <UserBalanceWidget walletAddress={publicKey.toBase58()} provider={provider} />
                        </div>

                        {/* Markets */}
                        <MarketList
                            userWallet={publicKey.toBase58()}
                            isAdmin={isAdmin}
                            onBetClick={handleBetClick}
                            onResolveClick={isAdmin ? handleResolveClick : undefined}
                            onViewMarket={handleViewMarket}
                            refreshTrigger={refreshTrigger}
                        />
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
            {modalContent && <Modal message={modalContent.message} type={modalContent.type} onClose={hideModal} />}
            {showTermsModal && <TermsModal onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />}
            <Header 
                connectedWallet={publicKey?.toBase58()} 
                isAdmin={isAdmin} 
                onDisconnect={handleDisconnect}
                currentPage={currentPage}
                onNavigate={handleNavigate}
            />
            <main className="flex-grow">
                {renderContent()}
            </main>
            <Footer />

            {/* Betting Modal */}
            {selectedMarketForBetting && provider && publicKey && (
                <BettingModal
                    market={selectedMarketForBetting}
                    provider={provider}
                    userWallet={publicKey.toBase58()}
                    onClose={() => setSelectedMarketForBetting(null)}
                    onBetPlaced={handleBetPlaced}
                />
            )}

            {/* Resolve Modal */}
            {selectedMarketForResolving && publicKey && (
                <ResolveModal
                    market={selectedMarketForResolving}
                    adminWallet={publicKey.toBase58()}
                    onClose={() => setSelectedMarketForResolving(null)}
                    onResolved={handleMarketResolved}
                />
            )}
        </div>
    );
};

export default App;