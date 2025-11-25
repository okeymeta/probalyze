import React from 'react';
import { X, TrendingUp, DollarSign, Calculator, Users, BarChart3, Award, Clock, Copy, AlertTriangle, Shield, Zap } from 'lucide-react';
import { PLATFORM_NAME, PLATFORM_FEE_PERCENTAGE, SETTLEMENT_FEE_PERCENTAGE } from '../constants';

interface HowItWorksModalProps {
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="glass-card w-full max-w-2xl sm:max-w-4xl rounded-2xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-gray-800 p-3 sm:p-4 md:p-6 z-10">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold gradient-text mb-1 sm:mb-2">
                📚 Trading Guide
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">Everything you need to know about trading on {PLATFORM_NAME}</p>
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
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Overview */}
          <div className="bg-linear-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-3 sm:p-4 md:p-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-400 shrink-0 mt-0.5 sm:mt-1" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-purple-400 mb-2 sm:mb-3">🎯 What is {PLATFORM_NAME}?</h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                  {PLATFORM_NAME} is a prediction market platform where you can trade on the outcome of real-world events. 
                  Think of it as betting on future events, but with dynamic pricing based on market demand—similar to 
                  how stock prices move based on supply and demand.
                </p>
                <div className="bg-gray-900/50 rounded-lg p-2.5 sm:p-3 md:p-4 border border-gray-800">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <strong className="text-white">Example:</strong> If there's a market on "Will Bitcoin reach $100k by December?", 
                    you can buy "Yes" shares if you think it will happen, or "No" shares if you think it won't. The more people 
                    buy "Yes", the higher the Yes price (and lower the No price), reflecting market confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How This Differs from Traditional Betting */}
          <div className="bg-linear-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-3 sm:p-4 md:p-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-400 shrink-0 mt-0.5 sm:mt-1" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-400 mb-3 sm:mb-4">⚡ How This Differs from Traditional Betting</h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 sm:p-3 md:p-4">
                      <div className="text-red-400 font-bold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <span className="text-lg sm:text-xl">🎰</span>
                        <span>Traditional Betting</span>
                      </div>
                      <ul className="space-y-1.5 sm:space-y-2 text-xs text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 shrink-0">•</span>
                          <span><strong className="text-white">Fixed Odds:</strong> Odds are set by bookmaker and don't change after you bet</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 shrink-0">•</span>
                          <span><strong className="text-white">House Always Wins:</strong> Bookmaker takes a cut and sets odds in their favor</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 shrink-0">•</span>
                          <span><strong className="text-white">Binary Payout:</strong> You either win a fixed amount or lose everything</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 shrink-0">•</span>
                          <span><strong className="text-white">No Market Insight:</strong> You can't see what other bettors are doing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 shrink-0">•</span>
                          <span><strong className="text-white">Centralized:</strong> Bookmaker controls everything and can limit winning accounts</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="text-green-400 font-bold mb-3 flex items-center gap-2">
                        <span className="text-xl">📈</span>
                        <span>{PLATFORM_NAME} Markets</span>
                      </div>
                      <ul className="space-y-2 text-xs text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 shrink-0">•</span>
                          <span><strong className="text-white">Dynamic Odds:</strong> Prices update in real-time based on market activity</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 shrink-0">•</span>
                          <span><strong className="text-white">Peer-to-Peer:</strong> You bet against other traders, not the house</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 shrink-0">•</span>
                          <span><strong className="text-white">Proportional Payouts:</strong> Win more when you bet on the less popular side</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 shrink-0">•</span>
                          <span><strong className="text-white">Full Transparency:</strong> See all bettors, amounts, and market statistics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 shrink-0">•</span>
                          <span><strong className="text-white">Decentralized:</strong> Powered by blockchain, transparent and fair for everyone</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="text-sm font-bold text-blue-400 mb-3">🎓 Key Insight: Market-Driven Pricing</div>
                    <p className="text-xs text-gray-300 leading-relaxed mb-3">
                      In traditional betting, if odds are 3:1, you always get 3x your money if you win, regardless of how many 
                      other people bet. In {PLATFORM_NAME}, your payout depends on the <strong className="text-white">final pool 
                      distribution</strong>. If you bet on an unpopular outcome and win, you get a bigger share of the total pool!
                    </p>
                    <div className="bg-gray-900/70 rounded p-3 text-xs text-gray-400">
                      <strong className="text-blue-400">Example:</strong> You bet 10 SOL on "Yes" at 30%. If the final pool is 30 SOL 
                      on Yes and 70 SOL on No, and Yes wins, you get (10/30) × 100 SOL = 33.33 SOL payout (233% return!). In traditional 
                      betting, you'd get a fixed 3.33x payout regardless of how the pool evolved.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk & How You Can Lose Money */}
          <div className="bg-linear-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-7 h-7 text-red-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-400 mb-4">⚠️ Understanding Risk: How You Can Lose Money</h3>
                
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4">
                    <p className="text-sm text-gray-300 leading-relaxed mb-3">
                      <strong className="text-red-400">Prediction markets involve real financial risk.</strong> You can lose 100% 
                      of your bet amount if the market resolves against your position. Here's exactly how losses occur:
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0">1</div>
                        <h4 className="text-white font-bold">Wrong Prediction = Total Loss</h4>
                      </div>
                      <p className="text-sm text-gray-400 ml-9 mb-3">
                        If you bet on "Yes" and the market resolves to "No", you lose your <strong className="text-red-400">entire 
                        bet amount</strong>. There's no partial refund or consolation prize.
                      </p>
                      <div className="bg-red-500/10 border border-red-500/30 rounded p-3 ml-9 text-xs">
                        <strong className="text-red-400">Example:</strong> You bet 50 SOL on "Bitcoin will hit $100k". If Bitcoin 
                        doesn't reach $100k by the deadline, you lose all 50 SOL. The winning side (No bettors) splits your money 
                        along with all other losing bets.
                      </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="bg-orange-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0">2</div>
                        <h4 className="text-white font-bold">Platform Fees Reduce Your Position</h4>
                      </div>
                      <p className="text-sm text-gray-400 ml-9 mb-3">
                        The {PLATFORM_FEE_PERCENTAGE}% trading fee is deducted immediately when you place a bet. This means you need 
                        to win back more than your original amount just to break even.
                      </p>
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded p-3 ml-9 text-xs">
                        <strong className="text-orange-400">Example:</strong> You bet 100 SOL → 2.5 SOL fee → 97.5 SOL actually 
                        goes into the pool. If you win with the same odds, you need to recover at least 100 SOL to break even 
                        (considering settlement fees too).
                      </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="bg-yellow-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0">3</div>
                        <h4 className="text-white font-bold">Betting on Heavy Favorites = Small Returns</h4>
                      </div>
                      <p className="text-sm text-gray-400 ml-9 mb-3">
                        If you bet on an outcome that already has 90% probability, you can only win ~11% even if correct (minus fees). 
                        You're risking 100% of your bet for minimal upside.
                      </p>
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 ml-9 text-xs">
                        <strong className="text-yellow-400">Example:</strong> Market is 90% Yes / 10% No. You bet 100 SOL on Yes. 
                        If Yes wins, you only get ~111 SOL back (11% return before fees). If No miraculously wins, you lose everything.
                      </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="bg-purple-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0">4</div>
                        <h4 className="text-white font-bold">Price Changes After You Bet</h4>
                      </div>
                      <p className="text-sm text-gray-400 ml-9 mb-3">
                        You lock in your position at current prices, but the market keeps moving. Other traders can place large bets 
                        that shift odds against you, reducing your potential payout even if you win.
                      </p>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3 ml-9 text-xs">
                        <strong className="text-purple-400">Example:</strong> You bet on Yes at 60% (expecting good returns). Then 
                        whales dump 1000 SOL on Yes, pushing it to 95%. Now even if you win, your payout share is much smaller than 
                        you anticipated.
                      </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0">5</div>
                        <h4 className="text-white font-bold">No Early Exit / Can't Cancel</h4>
                      </div>
                      <p className="text-sm text-gray-400 ml-9 mb-3">
                        Once you place a bet, <strong className="text-red-400">there's no way to withdraw or cancel</strong> before 
                        market resolution. Your funds are locked until the event concludes.
                      </p>
                      <div className="bg-red-500/10 border border-red-500/30 rounded p-3 ml-9 text-xs">
                        <strong className="text-red-400">Important:</strong> Even if you change your mind or realize you made a 
                        mistake, you cannot get your money back until the market resolves. If the market takes weeks to resolve, 
                        your funds are inaccessible during that time.
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-red-500/20 to-black border-2 border-red-500/50 rounded-lg p-5">
                    <div className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6" />
                      <span>⚡ Risk Summary</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span><strong className="text-white">Maximum Loss:</strong> 100% of your bet amount</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span><strong className="text-white">No Guarantees:</strong> Even "safe" looking markets can resolve unexpectedly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span><strong className="text-white">Fees Eat Profits:</strong> {PLATFORM_FEE_PERCENTAGE}% entry + {SETTLEMENT_FEE_PERCENTAGE}% exit means you need strong conviction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span><strong className="text-white">No Insurance:</strong> Unlike bank accounts, there's no FDIC protection or safety net</span>
                      </li>
                    </ul>
                    <div className="mt-4 bg-black/50 border border-red-500/30 rounded p-3 text-xs text-red-300">
                      ⚠️ <strong>Only bet what you can afford to lose.</strong> Prediction markets are speculative and should be 
                      treated as high-risk financial activities. Past performance of traders doesn't guarantee future results.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How Trading Works */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-7 h-7 text-green-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-400 mb-4">📊 How Trading Works</h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                      Choose a Market
                    </h4>
                    <p className="text-sm text-gray-400">
                      Browse available markets and find an event you have an opinion on. Each market has a clear 
                      question with a Yes/No outcome.
                    </p>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                      Select Your Position
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">
                      Choose whether you think the outcome will be <strong className="text-green-400">Yes</strong> or <strong className="text-red-400">No</strong>. 
                      You'll see the current market probability for each outcome.
                    </p>
                    <div className="flex gap-3 mt-2">
                      <div className="flex-1 bg-green-500/10 border border-green-500/30 rounded p-2">
                        <div className="text-xs text-gray-500 mb-1">YES</div>
                        <div className="text-lg font-bold text-green-400">65%</div>
                        <div className="text-xs text-gray-400">Market thinks likely</div>
                      </div>
                      <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded p-2">
                        <div className="text-xs text-gray-500 mb-1">NO</div>
                        <div className="text-lg font-bold text-red-400">35%</div>
                        <div className="text-xs text-gray-400">Market thinks unlikely</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                      Enter Your Amount
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">
                      Decide how much SOL you want to bet. The platform will show you potential returns before you confirm.
                    </p>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3 text-xs text-gray-400">
                      <strong className="text-purple-400">Note:</strong> A {PLATFORM_FEE_PERCENTAGE}% platform fee is deducted from your bet amount upfront.
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                      Confirm & Wait
                    </h4>
                    <p className="text-sm text-gray-400">
                      Approve the transaction in your Solana wallet. Once confirmed, your bet is recorded on the blockchain. 
                      Now wait for the market to be resolved when the event concludes.
                    </p>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                      Get Paid (If You Win!)
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">
                      When the market resolves in your favor, winnings are automatically calculated and sent to your wallet. 
                      A {SETTLEMENT_FEE_PERCENTAGE}% settlement fee is deducted from your winnings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Understanding Percentages */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Calculator className="w-7 h-7 text-blue-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-400 mb-4">🧮 Understanding Percentages & Prices</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">What Do Percentages Mean?</h4>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      The percentages you see (e.g., "65% Yes" / "35% No") represent the <strong className="text-white">market's collective 
                      belief</strong> about the likelihood of each outcome. These are calculated based on the total amount of SOL 
                      bet on each side.
                    </p>
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="text-sm font-bold text-blue-400 mb-2">📐 Calculation Formula:</div>
                      <div className="bg-gray-900/70 rounded p-3 font-mono text-xs text-gray-300 mb-3">
                        Yes % = (Total YES bets ÷ Total ALL bets) × 100<br/>
                        No % = (Total NO bets ÷ Total ALL bets) × 100
                      </div>
                      <div className="text-xs text-gray-400">
                        <strong className="text-white">Example:</strong> If 65 SOL is bet on Yes and 35 SOL on No, 
                        the market shows 65% Yes and 35% No.
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">How Percentages Change</h4>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      Every time someone places a bet, the percentages update in real-time to reflect the new distribution:
                    </p>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Initial State:</span>
                        <span className="text-white font-mono">50% Yes | 50% No (0 SOL on each)</span>
                      </div>
                      <div className="border-t border-gray-800 pt-2 flex items-center justify-between">
                        <span className="text-gray-400">After 10 SOL bet on Yes:</span>
                        <span className="text-white font-mono">100% Yes | 0% No</span>
                      </div>
                      <div className="border-t border-gray-800 pt-2 flex items-center justify-between">
                        <span className="text-gray-400">After 5 SOL bet on No:</span>
                        <span className="text-white font-mono">67% Yes | 33% No</span>
                      </div>
                      <div className="border-t border-gray-800 pt-2 flex items-center justify-between">
                        <span className="text-gray-400">After 10 more SOL on No:</span>
                        <span className="text-white font-mono">40% Yes | 60% No</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Initial Starting Price</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      When a market is created, it starts with an <strong className="text-white">initial probability</strong> 
                      (e.g., 50% Yes / 50% No for an uncertain event, or 70% Yes / 30% No for a likely event). This gives traders 
                      a baseline before any bets are placed. Once trading begins, the market percentages move based on actual bets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SOL Calculation & Payouts */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <DollarSign className="w-7 h-7 text-yellow-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">💰 SOL Calculations & Payouts</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Fee Structure</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-purple-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">
                            1
                          </div>
                          <h5 className="font-bold text-purple-400">Trading Fee</h5>
                        </div>
                        <div className="text-2xl font-bold text-purple-400 mb-1">{PLATFORM_FEE_PERCENTAGE}%</div>
                        <p className="text-xs text-gray-400">Deducted from your bet amount when you place a bet</p>
                        <div className="mt-2 bg-gray-900/50 rounded p-2 text-xs text-gray-300 font-mono">
                          Net Bet = Your Amount × (1 - {PLATFORM_FEE_PERCENTAGE/100})
                        </div>
                      </div>

                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-orange-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">
                            2
                          </div>
                          <h5 className="font-bold text-orange-400">Settlement Fee</h5>
                        </div>
                        <div className="text-2xl font-bold text-orange-400 mb-1">{SETTLEMENT_FEE_PERCENTAGE}%</div>
                        <p className="text-xs text-gray-400">Deducted from your winnings when market resolves</p>
                        <div className="mt-2 bg-gray-900/50 rounded p-2 text-xs text-gray-300 font-mono">
                          Final Payout = Gross Win × (1 - {SETTLEMENT_FEE_PERCENTAGE/100})
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Payout Calculation Example</h4>
                    <div className="bg-linear-to-br from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-5">
                      <div className="text-sm font-bold text-green-400 mb-3">📊 Scenario: Bitcoin $100k Market</div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="bg-gray-900/70 rounded-lg p-3 border border-gray-800">
                          <div className="text-xs text-gray-500 mb-2">Market State:</div>
                          <div className="space-y-1 text-xs text-gray-400">
                            <div>• Total YES bets: <span className="text-green-400 font-bold">100 SOL</span></div>
                            <div>• Total NO bets: <span className="text-red-400 font-bold">50 SOL</span></div>
                            <div>• Total pool: <span className="text-white font-bold">150 SOL</span></div>
                            <div>• Market probability: <span className="text-green-400">67% Yes</span> / <span className="text-red-400">33% No</span></div>
                          </div>
                        </div>

                        <div className="bg-gray-900/70 rounded-lg p-3 border border-gray-800">
                          <div className="text-xs text-gray-500 mb-2">Your Bet:</div>
                          <div className="space-y-1 text-xs text-gray-400">
                            <div>• You bet: <span className="text-white font-bold">10 SOL on YES</span></div>
                            <div>• Trading fee ({PLATFORM_FEE_PERCENTAGE}%): <span className="text-purple-400">-0.25 SOL</span></div>
                            <div>• Net bet recorded: <span className="text-white font-bold">9.75 SOL</span></div>
                            <div>• Your share of YES pool: <span className="text-blue-400">9.75 / 100 = 9.75%</span></div>
                          </div>
                        </div>

                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                          <div className="text-xs font-bold text-green-400 mb-2">✅ If YES Wins:</div>
                          <div className="space-y-1 text-xs text-gray-300">
                            <div>• Total pool to distribute: <span className="text-white font-bold">150 SOL</span></div>
                            <div>• Your proportional share: <span className="text-white">150 × 9.75% = </span><span className="font-bold text-green-400">14.625 SOL</span></div>
                            <div>• Settlement fee ({SETTLEMENT_FEE_PERCENTAGE}%): <span className="text-orange-400">-0.439 SOL</span></div>
                            <div className="pt-2 border-t border-green-500/30">
                              <strong className="text-green-400">Final Payout: 14.186 SOL</strong>
                            </div>
                            <div className="text-green-400 font-bold">Net Profit: +4.186 SOL (41.8% return)</div>
                          </div>
                        </div>

                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                          <div className="text-xs font-bold text-red-400 mb-2">❌ If NO Wins:</div>
                          <div className="space-y-1 text-xs text-gray-300">
                            <div>• You bet on YES, market resolved NO</div>
                            <div className="text-red-400 font-bold">You lose your entire 10 SOL bet</div>
                            <div className="text-red-400 font-bold">Net Loss: -10 SOL (-100%)</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded p-3 text-xs text-gray-400">
                        <strong className="text-blue-400">Key Insight:</strong> Your payout depends on your share of the winning pool, 
                        not the odds when you entered. The more people bet against you, the higher your potential returns!
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Payout Formula (Complete)</h4>
                    <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-800 font-mono text-xs text-gray-300 space-y-2">
                      <div><span className="text-blue-400">Step 1:</span> Net Bet = Your Amount × 0.975 (after {PLATFORM_FEE_PERCENTAGE}% fee)</div>
                      <div><span className="text-blue-400">Step 2:</span> Your Share = Net Bet ÷ Total Winning Side Bets</div>
                      <div><span className="text-blue-400">Step 3:</span> Gross Payout = Total Pool × Your Share</div>
                      <div><span className="text-blue-400">Step 4:</span> Final Payout = Gross Payout × 0.97 (after {SETTLEMENT_FEE_PERCENTAGE}% fee)</div>
                      <div className="pt-2 border-t border-gray-800 text-yellow-400">
                        <strong>Net Profit = Final Payout - Your Original Bet</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copy Trading */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Copy className="w-7 h-7 text-cyan-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">👥 Copy Trading</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">What is Copy Trading?</h4>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      Not sure whether to bet Yes or No? Copy Trading lets you <strong className="text-white">replicate the exact 
                      position</strong> of another wallet in a specific market. If a successful trader bets 5 SOL on Yes, 
                      you can copy their bet with your own amount.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">How to Copy a Trade</h4>
                    <div className="space-y-2">
                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-cyan-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
                          <span className="text-white font-semibold">Find a Wallet to Copy</span>
                        </div>
                        <p className="text-xs text-gray-400 ml-7">
                          Look at the market's bettor list and identify wallets with strong performance or large positions.
                        </p>
                      </div>

                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-cyan-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
                          <span className="text-white font-semibold">Enter the Wallet Address</span>
                        </div>
                        <p className="text-xs text-gray-400 ml-7">
                          In the betting modal, enable "Copy Trade" mode and paste the target wallet address.
                        </p>
                      </div>

                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-cyan-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span>
                          <span className="text-white font-semibold">Set Your Amount</span>
                        </div>
                        <p className="text-xs text-gray-400 ml-7">
                          The platform automatically detects their position (Yes or No) and applies it to your bet amount.
                        </p>
                      </div>

                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-cyan-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">4</span>
                          <span className="text-white font-semibold">Confirm & Track</span>
                        </div>
                        <p className="text-xs text-gray-400 ml-7">
                          Your copied trade is recorded separately and will pay out based on your bet amount if the position wins.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <div className="text-xs font-bold text-cyan-400 mb-2">💡 Copy Trading Tips:</div>
                    <ul className="space-y-1 text-xs text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>Copy traders with consistent winning records across multiple markets</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>Don't blindly copy—understand the market yourself before committing large amounts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>Copied trades pay out independently—your returns depend on your bet size, not theirs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>You can copy multiple wallets in the same market to diversify your strategy</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Lifecycle */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Clock className="w-7 h-7 text-orange-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-orange-400 mb-4">⏰ Market Lifecycle & Timing</h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3">📅 Key Timestamps</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 mt-0.5">1</div>
                        <div>
                          <div className="text-white font-semibold">Creation Time</div>
                          <div className="text-xs text-gray-400">When the market is created and trading begins</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-green-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 mt-0.5">2</div>
                        <div>
                          <div className="text-white font-semibold">Trading Period (Active)</div>
                          <div className="text-xs text-gray-400">Users can place bets, percentages update dynamically, copy trading is available</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-orange-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 mt-0.5">3</div>
                        <div>
                          <div className="text-white font-semibold">Market Closes</div>
                          <div className="text-xs text-gray-400">No more bets accepted after "Closes At" time. Market status changes to "Closed"</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-purple-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 mt-0.5">4</div>
                        <div>
                          <div className="text-white font-semibold">Resolution Time</div>
                          <div className="text-xs text-gray-400">Expected time when the outcome will be verified and the market will be resolved</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 mt-0.5">5</div>
                        <div>
                          <div className="text-white font-semibold">Payout Distribution</div>
                          <div className="text-xs text-gray-400">Winnings automatically sent to all winning participants based on their share</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-bold mb-3">🔄 Auto-Refund System (78-Hour Rule)</h4>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                        If a market has <strong className="text-white">only one bettor</strong> (no opposing bets) and remains in this 
                        state for <strong className="text-red-400">78 hours</strong>, the system automatically refunds the solo bettor 
                        and cancels the market. This prevents locked funds in one-sided markets.
                      </p>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>• Single bettor's funds are returned in full (minus fees already paid)</div>
                        <div>• Market is marked as cancelled</div>
                        <div>• Automated checks run every 10 minutes</div>
                        <div>• Protects users from indefinitely locked positions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Official Resolution Process */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-7 h-7 text-emerald-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-emerald-400 mb-4">✅ Official Market Resolution Process</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">How Markets Are Resolved</h4>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      When an event concludes, markets are <strong className="text-white">officially resolved</strong> by our 
                      verification team using trusted, publicly available sources. Resolution follows a strict protocol to 
                      ensure fairness and accuracy.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="bg-emerald-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0">1</div>
                        <h4 className="text-white font-bold">Event Verification</h4>
                      </div>
                      <p className="text-sm text-gray-400 ml-9">
                        Once the real-world event concludes, our verification team collects evidence from multiple authoritative 
                        sources (news agencies, official announcements, blockchain explorers, etc.) to determine the factual outcome.
                      </p>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="bg-emerald-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0">2</div>
                        <h4 className="text-white font-bold">Resolution Criteria Review</h4>
                      </div>
                      <p className="text-sm text-gray-400 ml-9 mb-2">
                        Each market has clear, predefined resolution criteria stated in the description. The team verifies the 
                        outcome matches these exact criteria—no subjective interpretation.
                      </p>
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 ml-9 text-xs text-gray-400">
                        <strong className="text-emerald-400">Example:</strong> "Will Bitcoin reach $100,000 by December 31, 2025?" 
                        → Resolution checks CoinMarketCap/CoinGecko for BTC price on that date. If ≥$100k at any point, resolves YES.
                      </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="bg-emerald-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0">3</div>
                        <h4 className="text-white font-bold">Official Resolution Declaration</h4>
                      </div>
                      <p className="text-sm text-gray-400 ml-9">
                        After verification, the market is officially resolved as YES or NO on the blockchain. This resolution is 
                        immutable and triggers automatic payout calculations.
                      </p>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="bg-emerald-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shrink-0">4</div>
                        <h4 className="text-white font-bold">Automatic Payout Distribution</h4>
                      </div>
                      <p className="text-sm text-gray-400 ml-9 mb-2">
                        The smart contract automatically calculates each winner's proportional share of the total pool and 
                        distributes payouts to winning wallets. No manual intervention required—payouts are instant and final.
                      </p>
                      <div className="bg-gray-900/70 rounded p-3 ml-9 text-xs text-gray-300 space-y-1">
                        <div>• Winners receive their share automatically</div>
                        <div>• Settlement fee ({SETTLEMENT_FEE_PERCENTAGE}%) deducted from winnings</div>
                        <div>• Losers' bets are distributed to winners</div>
                        <div>• All transactions recorded on-chain for transparency</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                    <div className="text-sm font-bold text-emerald-400 mb-2">🔒 Resolution Principles</div>
                    <ul className="space-y-2 text-xs text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span><strong className="text-white">Objectivity:</strong> Resolutions based on verifiable facts, not opinions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span><strong className="text-white">Transparency:</strong> All resolutions include source citations and reasoning</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span><strong className="text-white">Finality:</strong> Once resolved, outcomes cannot be changed or appealed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span><strong className="text-white">Speed:</strong> Markets are resolved promptly after event conclusion (typically within 24-48 hours)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="text-sm font-bold text-yellow-400 mb-2">⚖️ Dispute Resolution</div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      In rare cases where the outcome is ambiguous or sources conflict, the platform's governance team reviews 
                      all evidence and makes a final determination. While resolutions strive for maximum accuracy, participants 
                      acknowledge that the official resolution is binding and final. <strong className="text-white">By trading, 
                      you accept the platform's resolution authority.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bettor Statistics */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Users className="w-7 h-7 text-pink-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-pink-400 mb-4">👥 Bettor Statistics & Transparency</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">What You Can See</h4>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      Every market displays detailed statistics to help you make informed decisions:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <div className="text-green-400 font-bold text-sm mb-1">Yes Side</div>
                        <ul className="space-y-1 text-xs text-gray-400">
                          <li>• Total SOL bet on Yes</li>
                          <li>• Number of unique Yes bettors</li>
                          <li>• Individual wallet addresses</li>
                          <li>• Each wallet's bet amount</li>
                        </ul>
                      </div>

                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <div className="text-red-400 font-bold text-sm mb-1">No Side</div>
                        <ul className="space-y-1 text-xs text-gray-400">
                          <li>• Total SOL bet on No</li>
                          <li>• Number of unique No bettors</li>
                          <li>• Individual wallet addresses</li>
                          <li>• Each wallet's bet amount</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Volume & Activity Metrics</h4>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Volume:</span>
                        <span className="text-white font-mono">Sum of all bets (Yes + No)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">24h Volume:</span>
                        <span className="text-white font-mono">Activity in last 24 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Unique Bettors:</span>
                        <span className="text-white font-mono">Total distinct wallets participating</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Platform Fees Collected:</span>
                        <span className="text-white font-mono">{PLATFORM_FEE_PERCENTAGE}% of all bets in this market</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
                    <div className="text-xs font-bold text-pink-400 mb-2">🔍 Why This Matters:</div>
                    <ul className="space-y-1 text-xs text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-pink-400">•</span>
                        <span><strong className="text-white">Market Depth:</strong> More bettors = more liquidity and stable prices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pink-400">•</span>
                        <span><strong className="text-white">Smart Money:</strong> Identify wallets with consistent winning records</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pink-400">•</span>
                        <span><strong className="text-white">Risk Assessment:</strong> One-sided markets (95%+ on one side) are riskier</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pink-400">•</span>
                        <span><strong className="text-white">Copy Trading:</strong> Find profitable traders to copy</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="bg-linear-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-xl font-bold gradient-text mb-4">📌 Quick Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="bg-gray-900/70 rounded p-2 border border-gray-800">
                  <div className="text-gray-400 text-xs mb-1">Minimum Bet:</div>
                  <div className="text-white font-bold">0.01 SOL</div>
                </div>
                <div className="bg-gray-900/70 rounded p-2 border border-gray-800">
                  <div className="text-gray-400 text-xs mb-1">Trading Fee:</div>
                  <div className="text-purple-400 font-bold">{PLATFORM_FEE_PERCENTAGE}% (deducted upfront)</div>
                </div>
                <div className="bg-gray-900/70 rounded p-2 border border-gray-800">
                  <div className="text-gray-400 text-xs mb-1">Settlement Fee:</div>
                  <div className="text-orange-400 font-bold">{SETTLEMENT_FEE_PERCENTAGE}% (on winnings)</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-gray-900/70 rounded p-2 border border-gray-800">
                  <div className="text-gray-400 text-xs mb-1">Blockchain:</div>
                  <div className="text-white font-bold">Solana (fast & low cost)</div>
                </div>
                <div className="bg-gray-900/70 rounded p-2 border border-gray-800">
                  <div className="text-gray-400 text-xs mb-1">Auto-Refund Period:</div>
                  <div className="text-red-400 font-bold">78 hours (single bettor)</div>
                </div>
                <div className="bg-gray-900/70 rounded p-2 border border-gray-800">
                  <div className="text-gray-400 text-xs mb-1">Copy Trading:</div>
                  <div className="text-cyan-400 font-bold">Available for all markets</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-gray-800 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            Got It - Start Trading!
          </button>
          <p className="text-center text-xs text-gray-600 mt-3">
            Still have questions? Connect your wallet and explore live markets to learn by doing!
          </p>
        </div>
      </div>
    </div>
  );
};