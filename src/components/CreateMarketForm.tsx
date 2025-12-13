import React, { useState } from 'react';
import { MarketService } from '../services/marketService';
import { ArrowLeft, Upload, Calendar, Tag, Type, FileText, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface CreateMarketFormProps {
  onBack: () => void;
  onSuccess: (id: string) => void;
}

const CreateMarketForm: React.FC<CreateMarketFormProps> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    category: 'Crypto',
    endDate: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload by converting to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const id = MarketService.createMarket(formData);
      onSuccess(id);
    } catch (err) {
      alert("Failed to create market");
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 animate-fade-in relative">
      <button onClick={onBack} className="flex items-center gap-2 text-poly-subtext hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Markets
      </button>

      <div className="bg-poly-card border border-poly-hover rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Market</h1>
        
        <form onSubmit={handlePreSubmit} className="space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-poly-subtext">Question</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-poly-subtext">
                <Type size={18} />
              </span>
              <input
                type="text"
                name="question"
                required
                value={formData.question}
                onChange={handleChange}
                placeholder="e.g., Will Bitcoin hit $150k in 2025?"
                className="w-full bg-poly-bg border border-poly-hover rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-poly-blue focus:ring-1 focus:ring-poly-blue transition-all placeholder-poly-subtext/50"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-poly-subtext">Description & Rules</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-poly-subtext">
                <FileText size={18} />
              </span>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe how the market resolves..."
                className="w-full bg-poly-bg border border-poly-hover rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-poly-blue focus:ring-1 focus:ring-poly-blue transition-all placeholder-poly-subtext/50 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-poly-subtext">Category</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-poly-subtext">
                  <Tag size={18} />
                </span>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-poly-bg border border-poly-hover rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-poly-blue focus:ring-1 focus:ring-poly-blue appearance-none cursor-pointer"
                >
                  <option value="Crypto">Crypto</option>
                  <option value="Politics">Politics</option>
                  <option value="Sports">Sports</option>
                  <option value="Business">Business</option>
                  <option value="Pop Culture">Pop Culture</option>
                </select>
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-poly-subtext">End Date</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-poly-subtext">
                  <Calendar size={18} />
                </span>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-poly-bg border border-poly-hover rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-poly-blue focus:ring-1 focus:ring-poly-blue color-scheme-dark"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-poly-subtext">Market Image</label>
            
            {!formData.image ? (
                <div className="relative border-2 border-dashed border-poly-hover rounded-xl p-8 hover:bg-poly-hover/20 transition-colors group text-center cursor-pointer bg-poly-bg">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-poly-card border border-poly-hover rounded-full flex items-center justify-center text-poly-subtext group-hover:text-white group-hover:border-poly-blue transition-all">
                            <Upload size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-white font-medium group-hover:text-poly-blue transition-colors">Click to upload or drag and drop</p>
                            <p className="text-xs text-poly-subtext mt-1">SVG, PNG, JPG or GIF (max. 2MB)</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden border border-poly-hover group h-48 bg-poly-bg flex items-center justify-center">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button 
                            type="button"
                            onClick={removeImage}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg font-bold text-sm backdrop-blur-sm transition-all transform hover:scale-105"
                        >
                            <X size={16} /> Remove Image
                        </button>
                    </div>
                </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 bg-poly-blue hover:bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
            >
              Review & Create <Upload size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-poly-card border border-poly-hover rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
                <button 
                    onClick={() => setShowConfirmation(false)}
                    disabled={loading}
                    className="absolute top-4 right-4 text-poly-subtext hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="text-poly-blue" />
                    Confirm Market Details
                </h2>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-xs text-poly-subtext uppercase tracking-wide font-semibold">Question</label>
                        <p className="text-white font-medium">{formData.question}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-poly-subtext uppercase tracking-wide font-semibold">Category</label>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="px-2 py-1 bg-poly-hover rounded text-xs text-white">{formData.category}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-poly-subtext uppercase tracking-wide font-semibold">End Date</label>
                            <p className="text-white mt-1 text-sm">{formData.endDate}</p>
                        </div>
                    </div>

                    {formData.image && (
                         <div>
                            <label className="text-xs text-poly-subtext uppercase tracking-wide font-semibold">Image</label>
                            <div className="mt-1 h-20 w-full rounded-lg overflow-hidden border border-poly-hover">
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                         </div>
                    )}

                    <div>
                        <label className="text-xs text-poly-subtext uppercase tracking-wide font-semibold">Description</label>
                        <p className="text-poly-subtext text-sm line-clamp-3 bg-poly-bg p-3 rounded-lg border border-poly-hover mt-1">
                            {formData.description}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowConfirmation(false)}
                        disabled={loading}
                        className="flex-1 py-3 rounded-lg font-bold text-poly-subtext hover:text-white hover:bg-poly-hover transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 py-3 bg-poly-blue hover:bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creating...' : 'Confirm & Create'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CreateMarketForm;
