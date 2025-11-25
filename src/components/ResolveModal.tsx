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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">🔐 Admin Actions</h2>
            <p className="text-gray-400 text-sm line-clamp-2">{market.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Market Stats */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Total Pool</div>
              <div className="text-white font-bold text-lg">{totalPool.toFixed(4)} SOL</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Total Bets</div>
              <div className="text-white font-bold text-lg">{market.bets.length}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">YES Bets</div>
              <div className="text-green-400 font-bold">{yesWinners} ({market.totalYesAmount.toFixed(4)} SOL)</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">NO Bets</div>
              <div className="text-red-400 font-bold">{noWinners} ({market.totalNoAmount.toFixed(4)} SOL)</div>
            </div>
          </div>
        </div>

        {/* Close Market Button */}
        <div className="mb-6">
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-2xl">🔒</span>
              <div className="text-sm text-yellow-300">
                <strong>Close Market:</strong> Stop accepting new bets without resolving the outcome. You can still resolve the market later.
              </div>
            </div>
          </div>
          <button
            onClick={handleCloseMarket}
            disabled={isClosing}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isClosing ? (
              <>
                <SpinnerIcon className="h-5 w-5 animate-spin" />
                Closing Market...
              </>
            ) : (
              '🔒 Close Market (Stop Betting)'
            )}
          </button>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-bold text-white mb-4">Resolve Market</h3>
          
          {/* Outcome Selection */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-semibold">Select Winning Outcome</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setOutcome('yes')}
                className={`py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                  outcome === 'yes'
                    ? 'bg-green-600 text-white ring-2 ring-green-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                👍 YES
                {outcome === 'yes' && yesWinners > 0 && (
                  <div className="text-sm font-normal mt-1">{yesWinners} winner{yesWinners !== 1 ? 's' : ''}</div>
                )}
              </button>
              <button
                onClick={() => setOutcome('no')}
                className={`py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                  outcome === 'no'
                    ? 'bg-red-600 text-white ring-2 ring-red-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                👎 NO
                {outcome === 'no' && noWinners > 0 && (
                  <div className="text-sm font-normal mt-1">{noWinners} winner{noWinners !== 1 ? 's' : ''}</div>
                )}
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-2xl">⚠️</span>
              <div className="text-sm text-red-300">
                <strong>Warning:</strong> This action is irreversible. Once resolved, winners will be calculated and payouts distributed. Make sure you've selected the correct outcome.
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleResolve}
            disabled={isResolving}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isResolving ? (
              <>
                <SpinnerIcon className="h-5 w-5 animate-spin" />
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