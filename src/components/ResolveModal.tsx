import React, { useState } from 'react';
import { Market, PredictionOption } from '../types';
import { resolveMarket, closeMarket, resolveMultiOutcomeMarket, editMarket, deleteMarket, addMarketNews, deleteMarketNews, updateMarketRules } from '../lib/marketManager';
import SpinnerIcon from './icons/SpinnerIcon';
import { Trash2, Edit, Newspaper, BookOpen, X, Plus, ExternalLink } from 'lucide-react';

interface ResolveModalProps {
  market: Market;
  adminWallet: string;
  onClose: () => void;
  onResolved: () => void;
}

type TabType = 'resolve' | 'news' | 'edit' | 'rules';

export const ResolveModal: React.FC<ResolveModalProps> = ({ 
  market, 
  adminWallet, 
  onClose, 
  onResolved 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('resolve');
  const [outcome, setOutcome] = useState<PredictionOption>('yes');
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>(market.outcomes?.[0]?.id || '');
  const [isResolving, setIsResolving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editTitle, setEditTitle] = useState(market.title);
  const [editDescription, setEditDescription] = useState(market.description);
  const [editTimingNote, setEditTimingNote] = useState(market.timingNote || '');

  const [newsContent, setNewsContent] = useState('');
  const [newsLink, setNewsLink] = useState('');

  const [rules, setRules] = useState<string[]>(market.rules?.map(r => r.content) || ['']);

  const handleResolve = async () => {
    setIsResolving(true);
    setError(null);

    try {
      let result;
      
      if (market.marketType === 'multi-outcome' && market.outcomes) {
        if (!selectedOutcomeId) {
          setError('Please select a winning outcome');
          setIsResolving(false);
          return;
        }
        result = await resolveMultiOutcomeMarket(market.id, selectedOutcomeId, adminWallet);
      } else {
        result = await resolveMarket(market.id, outcome, adminWallet);
      }

      if (result.success) {
        onResolved();
        onClose();
      } else {
        setError(result.error || 'Failed to resolve market');
      }
    } catch (err) {
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
        onResolved();
        onClose();
      } else {
        setError(result.error || 'Failed to close market');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsClosing(false);
    }
  };

  const handleDeleteMarket = async () => {
    if (!confirm('Are you sure you want to delete this market? This cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteMarket(market.id, adminWallet);

      if (result.success) {
        onResolved();
        onClose();
      } else {
        setError(result.error || 'Failed to delete market');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await editMarket(market.id, {
        title: editTitle,
        description: editDescription,
        timingNote: editTimingNote || undefined
      }, adminWallet);

      if (result.success) {
        setSuccess('Market updated successfully!');
        onResolved();
      } else {
        setError(result.error || 'Failed to update market');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNews = async () => {
    if (!newsContent.trim()) {
      setError('Please enter news content');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await addMarketNews(
        market.id,
        newsContent.trim(),
        newsLink.trim() || undefined,
        adminWallet
      );

      if (result.success) {
        setSuccess('News posted successfully!');
        setNewsContent('');
        setNewsLink('');
        onResolved();
      } else {
        setError(result.error || 'Failed to post news');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    try {
      const result = await deleteMarketNews(market.id, newsId, adminWallet);
      if (result.success) {
        onResolved();
      } else {
        setError(result.error || 'Failed to delete news');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleSaveRules = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const validRules = rules.filter(r => r.trim());
      const result = await updateMarketRules(market.id, validRules, adminWallet);

      if (result.success) {
        setSuccess('Rules updated successfully!');
        onResolved();
      } else {
        setError(result.error || 'Failed to update rules');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const addRule = () => setRules([...rules, '']);
  const removeRule = (index: number) => setRules(rules.filter((_, i) => i !== index));
  const updateRule = (index: number, value: string) => setRules(rules.map((r, i) => i === index ? value : r));

  const totalPool = market.totalYesAmount + market.totalNoAmount;
  const yesWinners = market.bets.filter(b => b.prediction === 'yes').length;
  const noWinners = market.bets.filter(b => b.prediction === 'no').length;
  const isMultiOutcome = market.marketType === 'multi-outcome' && market.outcomes;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'resolve', label: 'Resolve', icon: '⚖️' },
    { id: 'news', label: 'News', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'edit', label: 'Edit', icon: <Edit className="w-4 h-4" /> },
    { id: 'rules', label: 'Rules', icon: <BookOpen className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-xl shadow-2xl my-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">🔐 Admin Actions</h2>
            <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">{market.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl sm:text-2xl shrink-0 p-1">&times;</button>
        </div>

        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(null); setSuccess(null); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-3 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-3 py-2 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {activeTab === 'resolve' && (
          <>
            <div className="bg-gray-900 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Total Pool</div>
                  <div className="text-white font-bold">{totalPool.toFixed(4)} SOL</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Total Bets</div>
                  <div className="text-white font-bold">{market.bets.length}</div>
                </div>
                {!isMultiOutcome && (
                  <>
                    <div>
                      <div className="text-gray-400 mb-1">YES Bets</div>
                      <div className="text-green-400 font-bold">{yesWinners} ({market.totalYesAmount.toFixed(4)} SOL)</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">NO Bets</div>
                      <div className="text-red-400 font-bold">{noWinners} ({market.totalNoAmount.toFixed(4)} SOL)</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {market.status === 'active' && (
              <div className="mb-4">
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg shrink-0">🔒</span>
                    <div className="text-xs text-yellow-300">
                      <strong>Close Market:</strong> Stop accepting new bets without resolving.
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCloseMarket}
                  disabled={isClosing}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isClosing ? (
                    <>
                      <SpinnerIcon className="h-4 w-4 animate-spin" />
                      Closing...
                    </>
                  ) : (
                    '🔒 Close Market'
                  )}
                </button>
              </div>
            )}

            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-base font-bold text-white mb-3">Resolve Market</h3>
              
              {isMultiOutcome ? (
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2 font-semibold text-sm">Select Winning Outcome</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {market.outcomes?.map(o => (
                      <button
                        key={o.id}
                        onClick={() => setSelectedOutcomeId(o.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          selectedOutcomeId === o.id
                            ? 'bg-green-600/30 border-2 border-green-500'
                            : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                        }`}
                      >
                        {o.imageUrl && (
                          <img src={o.imageUrl} alt={o.name} className="w-10 h-10 rounded-full object-cover" />
                        )}
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium">{o.name}</div>
                          <div className="text-xs text-gray-400">
                            Yes: {o.totalYesAmount.toFixed(2)} SOL | No: {o.totalNoAmount.toFixed(2)} SOL
                          </div>
                        </div>
                        {selectedOutcomeId === o.id && (
                          <span className="text-green-400">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2 font-semibold text-sm">Select Winning Outcome</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOutcome('yes')}
                      className={`py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                        outcome === 'yes'
                          ? 'bg-green-600 text-white ring-2 ring-green-400'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      👍 YES
                    </button>
                    <button
                      onClick={() => setOutcome('no')}
                      className={`py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                        outcome === 'no'
                          ? 'bg-red-600 text-white ring-2 ring-red-400'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      👎 NO
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-lg shrink-0">⚠️</span>
                  <div className="text-xs text-red-300">
                    <strong>Warning:</strong> This action is irreversible. Winners will be calculated and payouts distributed.
                  </div>
                </div>
              </div>

              <button
                onClick={handleResolve}
                disabled={isResolving}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isResolving ? (
                  <>
                    <SpinnerIcon className="h-4 w-4 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  '⚖️ Resolve & Distribute Payouts'
                )}
              </button>
            </div>
          </>
        )}

        {activeTab === 'news' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold text-sm">Post News Update</label>
              <textarea
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                placeholder="Enter news or update about this market..."
                className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-semibold text-sm">Link (Optional)</label>
              <input
                type="url"
                value={newsLink}
                onChange={(e) => setNewsLink(e.target.value)}
                placeholder="https://example.com/source"
                className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
            <button
              onClick={handleAddNews}
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isSaving ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post News'
              )}
            </button>

            {market.news && market.news.length > 0 && (
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Previous News</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {market.news.map(n => (
                    <div key={n.id} className="bg-gray-900 p-2 rounded-lg text-xs">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-gray-300 flex-1">{n.content}</p>
                        <button
                          onClick={() => handleDeleteNews(n.id)}
                          className="text-red-400 hover:text-red-300 shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {n.link && (
                        <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 mt-1">
                          <ExternalLink className="w-3 h-3" /> Source
                        </a>
                      )}
                      <div className="text-gray-500 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold text-sm">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-semibold text-sm">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                rows={3}
              />
            </div>
            {market.timingType !== 'fixed' && (
              <div>
                <label className="block text-gray-300 mb-2 font-semibold text-sm">Timing Note</label>
                <input
                  type="text"
                  value={editTimingNote}
                  onChange={(e) => setEditTimingNote(e.target.value)}
                  placeholder="When will this market resolve?"
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            )}
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isSaving ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>

            {market.bets.length === 0 && (
              <div className="border-t border-gray-700 pt-4">
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-3">
                  <div className="text-xs text-red-300">
                    <strong>Danger Zone:</strong> Delete this market permanently. This cannot be undone.
                  </div>
                </div>
                <button
                  onClick={handleDeleteMarket}
                  disabled={isDeleting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isDeleting ? (
                    <>
                      <SpinnerIcon className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Market
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold text-sm">Market Rules</label>
              <div className="space-y-2">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm w-6">{index + 1}.</span>
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => updateRule(index, e.target.value)}
                      placeholder="Enter rule..."
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                    />
                    {rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRule}
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add rule
                </button>
              </div>
            </div>
            <button
              onClick={handleSaveRules}
              disabled={isSaving}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isSaving ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Rules'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
