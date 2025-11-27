import React, { useState } from 'react';
import { Market, MarketComment } from '../types';
import { addMarketComment, toggleCommentLike, deleteMarketComment } from '../lib/marketManager';
import { MessageCircle, Heart, Trash2, Send, Reply } from 'lucide-react';
import { ADMIN_WALLET_ADDRESS } from '../constants';
import SpinnerIcon from './icons/SpinnerIcon';

interface CommentSectionProps {
  market: Market;
  userWallet?: string;
  onCommentAdded: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  market,
  userWallet,
  onCommentAdded
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const comments = market.comments || [];
  const topLevelComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userWallet || !newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addMarketComment(market.id, userWallet, newComment.trim());
      if (result.success) {
        setNewComment('');
        onCommentAdded();
      } else {
        setError(result.error || 'Failed to post comment');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!userWallet || !replyContent.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addMarketComment(market.id, userWallet, replyContent.trim(), parentId);
      if (result.success) {
        setReplyContent('');
        setReplyTo(null);
        onCommentAdded();
      } else {
        setError(result.error || 'Failed to post reply');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!userWallet) return;
    await toggleCommentLike(market.id, commentId, userWallet);
    onCommentAdded();
  };

  const handleDelete = async (commentId: string) => {
    if (!userWallet) return;
    const result = await deleteMarketComment(market.id, commentId, userWallet);
    if (result.success) {
      onCommentAdded();
    }
  };

  const formatWallet = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const CommentItem: React.FC<{ comment: MarketComment; isReply?: boolean }> = ({ comment, isReply = false }) => {
    const isOwner = userWallet === comment.walletAddress;
    const isAdmin = userWallet === ADMIN_WALLET_ADDRESS;
    const hasLiked = userWallet && comment.likes.includes(userWallet);
    const replies = getReplies(comment.id);

    return (
      <div className={`${isReply ? 'ml-6 mt-2' : ''}`}>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs text-white font-bold">
                {comment.walletAddress.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-gray-400 text-xs font-mono">{formatWallet(comment.walletAddress)}</span>
              {comment.walletAddress === ADMIN_WALLET_ADDRESS && (
                <span className="text-xs bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded">Admin</span>
              )}
              <span className="text-gray-600 text-xs">{formatTime(comment.timestamp)}</span>
            </div>
            {(isOwner || isAdmin) && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-red-400/50 hover:text-red-400 p-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <p className="text-gray-200 text-sm mb-2 whitespace-pre-wrap break-words">{comment.content}</p>
          
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => handleLike(comment.id)}
              className={`flex items-center gap-1 transition-colors ${
                hasLiked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
              }`}
            >
              <Heart className={`w-3 h-3 ${hasLiked ? 'fill-current' : ''}`} />
              {comment.likes.length > 0 && comment.likes.length}
            </button>
            
            {!isReply && userWallet && (
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-400 transition-colors"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            )}
          </div>
        </div>

        {replyTo === comment.id && (
          <div className="ml-6 mt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply(comment.id)}
              />
              <button
                onClick={() => handleSubmitReply(comment.id)}
                disabled={isSubmitting || !replyContent.trim()}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {replies.map(reply => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </div>
    );
  };

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-400" />
        Comments
        {comments.length > 0 && (
          <span className="text-sm text-gray-500">({comments.length})</span>
        )}
      </h3>

      {userWallet ? (
        <form onSubmit={handleSubmitComment} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <SpinnerIcon className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-xs mt-2">{error}</p>
          )}
        </form>
      ) : (
        <div className="bg-gray-800/50 rounded-lg p-3 mb-4 text-center">
          <p className="text-gray-400 text-sm">Connect wallet to comment</p>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {topLevelComments.length > 0 ? (
          topLevelComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};
