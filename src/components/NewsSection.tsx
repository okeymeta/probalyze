import React, { useState } from 'react';
import { Market } from '../types';
import { Newspaper, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface NewsSectionProps {
  market: Market;
}

const renderClickableText = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
        >
          {part.length > 40 ? `${part.slice(0, 40)}...` : part}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    return part;
  });
};

export const NewsSection: React.FC<NewsSectionProps> = ({ market }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const news = market.news || [];
  const hasNews = news.length > 0;

  if (!hasNews) {
    return null;
  }

  const displayNews = isExpanded ? news : news.slice(0, 2);
  const hasMore = news.length > 2;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-400" />
          News & Updates
          <span className="text-sm text-gray-500">({news.length})</span>
        </h3>
        {hasMore && (
          <span className="text-gray-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        )}
      </button>

      <div className="mt-4 space-y-3">
        {displayNews.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800/50 rounded-lg p-3 border-l-2 border-blue-500"
          >
            <p className="text-gray-200 text-sm mb-2">
              {renderClickableText(item.content)}
            </p>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mb-2"
              >
                <ExternalLink className="w-3 h-3" />
                View Source
              </a>
            )}
            <div className="text-gray-500 text-xs">
              {formatTime(item.createdAt)}
            </div>
          </div>
        ))}
      </div>

      {hasMore && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mt-3 text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
        >
          Show {news.length - 2} more updates
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
