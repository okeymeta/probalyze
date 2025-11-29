import React, { useState } from 'react';
import { createMarket } from '../lib/marketManager';
import { uploadImage } from '../lib/storageManager';
import { generateMarketDescription } from '../lib/geminiManager';
import { MarketCategory, MarketType, TimingType } from '../types';
import { getCurrentNetwork, switchNetwork, getAvailableNetworks } from '../lib/networkManager';
import SpinnerIcon from './icons/SpinnerIcon';
import { Plus, Trash2, X, Wand2, Calendar, Wifi } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface OutcomeInput {
  id: string;
  name: string;
  imageFile: File | null;
  imagePreview: string;
}

interface AdminPanelProps {
  adminWallet: string;
  onMarketCreated: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ adminWallet, onMarketCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MarketCategory>('crypto');
  const [marketType, setMarketType] = useState<MarketType>('simple');
  const [timingType, setTimingType] = useState<TimingType>('fixed');
  const [initialYesPrice, setInitialYesPrice] = useState(50);
  const [closesInDays, setClosesInDays] = useState(7);
  const [resolveInDays, setResolveInDays] = useState(8);
  const [closesDate, setClosesDate] = useState<Date | undefined>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [resolveDate, setResolveDate] = useState<Date | undefined>(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000));
  const [showClosesPicker, setShowClosesPicker] = useState(false);
  const [showResolvePicker, setShowResolvePicker] = useState(false);
  const [timingNote, setTimingNote] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [outcomes, setOutcomes] = useState<OutcomeInput[]>([
    { id: '1', name: '', imageFile: null, imagePreview: '' },
    { id: '2', name: '', imageFile: null, imagePreview: '' }
  ]);
  
  const [rules, setRules] = useState<string[]>(['']);

  const categories: { value: MarketCategory; label: string; icon: string }[] = [
    { value: 'crypto', label: 'Crypto', icon: '₿' },
    { value: 'politics', label: 'Politics', icon: '🏛️' },
    { value: 'elections', label: 'Elections', icon: '🗳️' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'economy', label: 'Economy', icon: '📈' },
    { value: 'finance', label: 'Finance', icon: '💰' },
    { value: 'weather', label: 'Weather', icon: '🌤️' },
    { value: 'science', label: 'Science', icon: '🔬' },
    { value: 'esports', label: 'E-Sports', icon: '🎮' },
    { value: 'ai', label: 'AI', icon: '🤖' },
    { value: 'other', label: 'Other', icon: '📊' }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be smaller than 10MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleOutcomeImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be smaller than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOutcomes(prev => prev.map(o => 
          o.id === id ? { ...o, imageFile: file, imagePreview: reader.result as string } : o
        ));
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const addOutcome = () => {
    if (outcomes.length < 10) {
      setOutcomes([...outcomes, { id: Date.now().toString(), name: '', imageFile: null, imagePreview: '' }]);
    }
  };

  const removeOutcome = (id: string) => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.filter(o => o.id !== id));
    }
  };

  const updateOutcomeName = (id: string, name: string) => {
    setOutcomes(prev => prev.map(o => o.id === id ? { ...o, name } : o));
  };

  const addRule = () => {
    setRules([...rules, '']);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, value: string) => {
    setRules(prev => prev.map((r, i) => i === index ? value : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !description) {
      setError('Title and description are required');
      return;
    }

    if (marketType === 'simple' && !imageFile) {
      setError('Please upload a market image');
      return;
    }

    if (marketType === 'multi-outcome') {
      const validOutcomes = outcomes.filter(o => o.name.trim());
      if (validOutcomes.length < 2) {
        setError('Please add at least 2 outcomes with names');
        return;
      }
    }

    if (timingType === 'fixed' && resolveInDays <= closesInDays) {
      setError('Resolve time must be after close time');
      return;
    }

    setIsCreating(true);

    try {
      let mainImageUrl = '';
      
      if (imageFile) {
        const imageFilename = `market-${Date.now()}-${imageFile.name}`;
        const uploadResult = await uploadImage(imageFile, imageFilename);

        if (uploadResult.error) {
          setError(`Image upload failed: ${uploadResult.error.message}`);
          setIsCreating(false);
          return;
        }
        mainImageUrl = uploadResult.publicUrl;
      }

      const outcomeData: { name: string; imageUrl?: string }[] = [];
      if (marketType === 'multi-outcome') {
        for (const outcome of outcomes.filter(o => o.name.trim())) {
          let outcomeImageUrl: string | undefined;
          if (outcome.imageFile) {
            const filename = `outcome-${Date.now()}-${outcome.imageFile.name}`;
            const uploadResult = await uploadImage(outcome.imageFile, filename);
            if (!uploadResult.error) {
              outcomeImageUrl = uploadResult.publicUrl;
            }
          }
          outcomeData.push({ name: outcome.name.trim(), imageUrl: outcomeImageUrl });
        }
      }

      // Use exact dates from calendar picker, not recalculated from days
      const closesAt = timingType === 'fixed' && closesDate ? closesDate.getTime() : null;
      const resolveTime = timingType === 'fixed' && resolveDate ? resolveDate.getTime() : null;

      const validRules = rules.filter(r => r.trim());

      const result = await createMarket({
        title,
        description,
        imageUrl: mainImageUrl,
        category,
        marketType,
        initialYesPrice: initialYesPrice / 100,
        timingType,
        closesAt,
        resolveTime,
        timingNote: timingType !== 'fixed' ? timingNote : undefined,
        outcomes: marketType === 'multi-outcome' ? outcomeData : undefined,
        rules: validRules.length > 0 ? validRules : undefined,
        adminWallet
      });

      if (result.success) {
        setSuccess(`Market created successfully! ID: ${result.marketId}`);
        setTitle('');
        setDescription('');
        setCategory('crypto');
        setMarketType('simple');
        setTimingType('fixed');
        setInitialYesPrice(50);
        setClosesInDays(7);
        setResolveInDays(8);
        setClosesDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        setResolveDate(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000));
        setShowClosesPicker(false);
        setShowResolvePicker(false);
        setTimingNote('');
        setImageFile(null);
        setImagePreview('');
        setOutcomes([
          { id: '1', name: '', imageFile: null, imagePreview: '' },
          { id: '2', name: '', imageFile: null, imagePreview: '' }
        ]);
        setRules(['']);
        onMarketCreated();
      } else {
        setError(result.error || 'Failed to create market');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const getCloseDate = () => {
    if (closesDate) return closesDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return new Date(Date.now() + (closesInDays * 24 * 60 * 60 * 1000)).toLocaleDateString();
  };

  const getResolveDate = () => {
    if (resolveDate) return resolveDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return new Date(Date.now() + (resolveInDays * 24 * 60 * 60 * 1000)).toLocaleDateString();
  };

  const handleClosesDateChange = (date: Date | undefined) => {
    if (date) {
      setClosesDate(date);
      const now = Date.now();
      const daysUntil = Math.ceil((date.getTime() - now) / (24 * 60 * 60 * 1000));
      setClosesInDays(Math.max(1, daysUntil));
      setShowClosesPicker(false);
    }
  };

  const handleResolveDateChange = (date: Date | undefined) => {
    if (date) {
      setResolveDate(date);
      const now = Date.now();
      const daysUntil = Math.ceil((date.getTime() - now) / (24 * 60 * 60 * 1000));
      setResolveInDays(Math.max(1, daysUntil));
      setShowResolvePicker(false);
    }
  };

  const currentNetwork = getCurrentNetwork();
  const networks = getAvailableNetworks();

  return (
    <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-400">🔐 Admin Panel - Create Market</h2>
        <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-2">
          <Wifi className="w-4 h-4 text-purple-400" />
          <select
            value={currentNetwork}
            onChange={(e) => switchNetwork(e.target.value as 'mainnet' | 'testnet')}
            className="bg-gray-900 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {networks.map(net => (
              <option key={net.name} value={net.name}>{net.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => setMarketType('simple')}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              marketType === 'simple'
                ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Simple Yes/No
          </button>
          <button
            type="button"
            onClick={() => setMarketType('multi-outcome')}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              marketType === 'multi-outcome'
                ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Multi-Outcome
          </button>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-semibold">Market Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={marketType === 'multi-outcome' 
              ? "e.g., Who will win the 2028 Presidential Election?"
              : "e.g., Will Bitcoin reach $100k by end of 2024?"}
            className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={200}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-gray-300 font-semibold">Description</label>
            <button
              type="button"
              onClick={async () => {
                if (!title.trim()) {
                  setError('Please enter a title first');
                  return;
                }
                setIsGenerating(true);
                setError(null);
                try {
                  const generated = await generateMarketDescription(title, category);
                  setDescription(generated);
                  setSuccess('Description generated with AI! ✨');
                  setTimeout(() => setSuccess(null), 3000);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to generate description');
                } finally {
                  setIsGenerating(false);
                }
              }}
              disabled={isGenerating || !title.trim()}
              className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Wand2 className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide details about the market conditions, resolution criteria, etc. Or click Generate to use AI!"
            className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={3}
            maxLength={1000}
          />
        </div>

        {marketType === 'multi-outcome' && (
          <div className="space-y-3">
            <label className="block text-gray-300 font-semibold">Outcomes / Candidates</label>
            {outcomes.map((outcome, index) => (
              <div key={outcome.id} className="flex items-center gap-2 bg-gray-900 p-3 rounded-lg">
                <span className="text-gray-500 font-mono w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={outcome.name}
                  onChange={(e) => updateOutcomeName(outcome.id, e.target.value)}
                  placeholder="Outcome name (e.g., J.D. Vance)"
                  className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleOutcomeImageChange(outcome.id, e)}
                    className="hidden"
                  />
                  {outcome.imagePreview ? (
                    <img src={outcome.imagePreview} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                      IMG
                    </div>
                  )}
                </label>
                {outcomes.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOutcome(outcome.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {outcomes.length < 10 && (
              <button
                type="button"
                onClick={addOutcome}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
              >
                <Plus className="w-4 h-4" /> Add another outcome
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MarketCategory)}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Initial YES Price: <span className="text-purple-400 font-bold">{initialYesPrice}%</span>
            </label>
            <input
              type="range"
              min="10"
              max="90"
              value={initialYesPrice}
              onChange={(e) => setInitialYesPrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10%</span>
              <span>50%</span>
              <span>90%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-semibold">Timing</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setTimingType('fixed')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                timingType === 'fixed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Fixed Date
            </button>
            <button
              type="button"
              onClick={() => setTimingType('flexible')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                timingType === 'flexible'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Flexible
            </button>
            <button
              type="button"
              onClick={() => setTimingType('tbd')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                timingType === 'tbd'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              TBD
            </button>
          </div>

          {timingType === 'fixed' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-gray-300 mb-2 text-sm font-semibold">Closes 🔒</label>
                <button
                  type="button"
                  onClick={() => setShowClosesPicker(!showClosesPicker)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between hover:border-purple-500/50 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {getCloseDate()}
                  </span>
                </button>
                {showClosesPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 z-50 shadow-2xl">
                    <DayPicker
                      mode="single"
                      selected={closesDate}
                      onSelect={handleClosesDateChange}
                      disabled={(date) => date < new Date()}
                      fromDate={new Date()}
                      toDate={new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)}
                      className="text-white"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">{closesInDays} days from now</p>
              </div>

              <div className="relative">
                <label className="block text-gray-300 mb-2 text-sm font-semibold">Resolves ⚖️</label>
                <button
                  type="button"
                  onClick={() => setShowResolvePicker(!showResolvePicker)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between hover:border-purple-500/50 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {getResolveDate()}
                  </span>
                </button>
                {showResolvePicker && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 z-50 shadow-2xl">
                    <DayPicker
                      mode="single"
                      selected={resolveDate}
                      onSelect={handleResolveDateChange}
                      disabled={(date) => date <= (closesDate || new Date())}
                      fromDate={closesDate || new Date()}
                      toDate={new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)}
                      className="text-white"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">{resolveInDays} days from now</p>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={timingNote}
                onChange={(e) => setTimingNote(e.target.value)}
                placeholder={timingType === 'tbd' 
                  ? "e.g., Market will resolve when event occurs"
                  : "e.g., Resolves after the election results are certified"}
                className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {timingType === 'tbd' ? 'No fixed closing date' : 'Flexible timing based on event'}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-semibold">Rules (Optional)</label>
          <div className="space-y-2">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => updateRule(index, e.target.value)}
                  placeholder={`Rule ${index + 1}: e.g., Market resolves based on official announcement`}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
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

        {marketType === 'simple' && (
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">Market Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
              </div>
            )}
          </div>
        )}

        {marketType === 'multi-outcome' && (
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">Main Market Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isCreating}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <>
              <SpinnerIcon className="h-5 w-5 animate-spin" />
              Creating Market...
            </>
          ) : (
            `🚀 Create ${marketType === 'multi-outcome' ? 'Multi-Outcome' : ''} Market`
          )}
        </button>
      </form>
    </div>
  );
};
