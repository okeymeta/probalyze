import React, { useState } from 'react';
import { Market, PredictionOption } from '../types';
import { resolveMarket, closeMarket } from '../lib/marketManager';
import SpinnerIcon from './icons/SpinnerIcon';

interface ResolveModalProps {
  market: Market;
  adminWallet: string;
  onClose: () => void;
  onResolved: () => void;
}

export const ResolveModal: React.FC<ResolveModalProps> = ({ 
  market, 
  adminWallet, 
  onClose, 
  onResolved 
}) => {
  const [outcome, setOutcome] = useState<PredictionOption>('yes');
  const [isResolving, setIsResolving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async () => {
    setIsResolving(true);
    setError(null);

    try {
      const result = await resolveMarket(market.id, outcome, adminWallet);

      if (result.success) {
        console.log('Market resolved successfully!');
        console.log('Winners:', result.winners);
        
        onResolved();
        onClose();
      } else {
        setError(result.error || 'Failed to resolve market');
      }
    } catch (err) {
      console.error('Resolve error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsResolving(false);
    }
  };

  const handleCloseMarket = async () => {
    setIsClosing(true);
    setError(null);

    try {
      const result = await closeMarket(market.id, adminWallet);

      if (result.success) {
        console.log('Market closed successfully!');
        onResolved();
        onClose();
      } else {
        setError(result.error || 'Failed to close market');
      }
    } catch (err) {
      console.error('Close error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsClosing(false);
    }
  };

  const totalPool = market.totalYesAmount + market.totalNoAmount;
  const yesWinners = market.bets.filter(b => b.prediction === 'yes').length;
  const noWinners = market.bets.filter(b => b.prediction === 'no').length;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-lg shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4 sm:mb-6 gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">🔐 Admin Actions</h2>
            <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">{market.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl sm:text-2xl shrink-0 p-1">&times;</button>
        </div>

        {/* Market Stats */}
        <div className="bg-gray-900 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div>
              <div className="text-gray-400 mb-1">Total Pool</div>
              <div className="text-white font-bold text-base sm:text-lg">{totalPool.toFixed(4)} SOL</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Total Bets</div>
              <div className="text-white font-bold text-base sm:text-lg">{market.bets.length}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">YES Bets</div>
              <div className="text-green-400 font-bold text-sm sm:text-base">{yesWinners} ({market.totalYesAmount.toFixed(4)} SOL)</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">NO Bets</div>
              <div className="text-red-400 font-bold text-sm sm:text-base">{noWinners} ({market.totalNoAmount.toFixed(4)} SOL)</div>
            </div>
          </div>
        </div>

        {/* Close Market Button */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-start gap-2">
              <span className="text-lg sm:text-2xl shrink-0">🔒</span>
              <div className="text-xs sm:text-sm text-yellow-300">
                <strong>Close Market:</strong> Stop accepting new bets without resolving the outcome. You can still resolve the market later.
              </div>
            </div>
          </div>
          <button
            onClick={handleCloseMarket}
            disabled={isClosing}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 sm:py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isClosing ? (
              <>
                <SpinnerIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Closing Market...
              </>
            ) : (
              '🔒 Close Market (Stop Betting)'
            )}
          </button>
        </div>

        <div className="border-t border-gray-700 pt-4 sm:pt-6">
          <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Resolve Market</h3>
          
          {/* Outcome Selection */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-300 mb-2 sm:mb-3 font-semibold text-sm sm:text-base">Select Winning Outcome</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <button
                onClick={() => setOutcome('yes')}
                className={`py-3 sm:py-4 px-3 sm:px-6 rounded-lg font-bold text-sm sm:text-lg transition-all ${
                  outcome === 'yes'
                    ? 'bg-green-600 text-white ring-2 ring-green-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                👍 YES
                {outcome === 'yes' && yesWinners > 0 && (
                  <div className="text-xs sm:text-sm font-normal mt-1">{yesWinners} winner{yesWinners !== 1 ? 's' : ''}</div>
                )}
              </button>
              <button
                onClick={() => setOutcome('no')}
                className={`py-3 sm:py-4 px-3 sm:px-6 rounded-lg font-bold text-sm sm:text-lg transition-all ${
                  outcome === 'no'
                    ? 'bg-red-600 text-white ring-2 ring-red-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                👎 NO
                {outcome === 'no' && noWinners > 0 && (
                  <div className="text-xs sm:text-sm font-normal mt-1">{noWinners} winner{noWinners !== 1 ? 's' : ''}</div>
                )}
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-2">
              <span className="text-lg sm:text-2xl shrink-0">⚠️</span>
              <div className="text-xs sm:text-sm text-red-300">
                <strong>Warning:</strong> This action is irreversible. Once resolved, winners will be calculated and payouts distributed. Make sure you've selected the correct outcome.
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleResolve}
            disabled={isResolving}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 sm:py-4 px-3 sm:px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isResolving ? (
              <>
                <SpinnerIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Resolving Market...
              </>
            ) : (
              '⚖️ Resolve & Distribute Payouts'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};