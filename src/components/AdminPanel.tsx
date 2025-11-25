import React, { useState } from 'react';
import { createMarket } from '../lib/marketManager';
import { uploadImage } from '../lib/storageManager';
import { MarketCategory } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

interface AdminPanelProps {
  adminWallet: string;
  onMarketCreated: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ adminWallet, onMarketCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MarketCategory>('crypto');
  const [initialYesPrice, setInitialYesPrice] = useState(50);
  const [closesInDays, setClosesInDays] = useState(7);
  const [resolveInDays, setResolveInDays] = useState(8);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const categories: { value: MarketCategory; label: string; icon: string }[] = [
    { value: 'crypto', label: 'Crypto', icon: '₿' },
    { value: 'politics', label: 'Politics', icon: '🏛️' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'economy', label: 'Economy', icon: '📈' },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !description || !imageFile) {
      setError('All fields are required');
      return;
    }

    if (resolveInDays <= closesInDays) {
      setError('Resolve time must be after close time');
      return;
    }

    setIsCreating(true);

    try {
      // Upload image first
      const imageFilename = `market-${Date.now()}-${imageFile.name}`;
      const uploadResult = await uploadImage(imageFile, imageFilename);

      if (uploadResult.error) {
        setError(`Image upload failed: ${uploadResult.error.message}`);
        setIsCreating(false);
        return;
      }

      // Calculate timestamps
      const now = Date.now();
      const closesAt = now + (closesInDays * 24 * 60 * 60 * 1000);
      const resolveTime = now + (resolveInDays * 24 * 60 * 60 * 1000);

      // Create market with all new parameters
      const result = await createMarket(
        title, 
        description, 
        uploadResult.publicUrl, 
        category,
        initialYesPrice / 100, // Convert percentage to decimal
        closesAt,
        resolveTime,
        adminWallet
      );

      if (result.success) {
        setSuccess(`Market created successfully! ID: ${result.marketId}`);
        setTitle('');
        setDescription('');
        setCategory('crypto');
        setInitialYesPrice(50);
        setClosesInDays(7);
        setResolveInDays(8);
        setImageFile(null);
        setImagePreview('');
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
    const date = new Date(Date.now() + (closesInDays * 24 * 60 * 60 * 1000));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getResolveDate = () => {
    const date = new Date(Date.now() + (resolveInDays * 24 * 60 * 60 * 1000));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-3xl font-bold text-purple-400 mb-6">🔐 Admin Panel - Create Market</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2 font-semibold">Market Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Will Bitcoin reach $100k by end of 2024?"
            className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-semibold">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide details about the market conditions, resolution criteria, etc."
            className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={4}
            maxLength={1000}
          />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Closes In (Days) 🔒
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={closesInDays}
              onChange={(e) => setClosesInDays(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Betting closes: {getCloseDate()}</p>
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Resolve In (Days) ⚖️
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={resolveInDays}
              onChange={(e) => setResolveInDays(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Will resolve: {getResolveDate()}</p>
          </div>
        </div>

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
              <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-lg" />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg">
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
            '🚀 Create Market'
          )}
        </button>
      </form>
    </div>
  );
};