import React, { useState } from 'react';
import { Market } from '../types';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface RulesSectionProps {
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
          {part.length > 50 ? `${part.slice(0, 50)}...` : part}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    return part;
  });
};

export const RulesSection: React.FC<RulesSectionProps> = ({ market }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const rules = market.rules || [];
  const hasRules = rules.length > 0;

  if (!hasRules) {
    return null;
  }

  const displayRules = isExpanded ? rules : rules.slice(0, 3);
  const hasMore = rules.length > 3;

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-yellow-400" />
          Market Rules
          <span className="text-sm text-gray-500">({rules.length})</span>
        </h3>
        {hasMore && (
          <span className="text-gray-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        )}
      </button>

      <div className="mt-4 space-y-2">
        {displayRules.map((rule, index) => (
          <div
            key={rule.id}
            className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
            <p className="text-gray-300 text-sm flex-1">
              {renderClickableText(rule.content)}
            </p>
          </div>
        ))}
      </div>

      {hasMore && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mt-3 text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
        >
          Show {rules.length - 3} more rules
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
