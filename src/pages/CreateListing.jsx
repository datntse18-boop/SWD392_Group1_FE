import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Bike, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateListing() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Using string IDs for simplicity; in a real app, these would be fetched from backend categories/brands APIs.
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        brandId: '',  
        categoryId: '',
        frameSize: '',
        condition: 'Used',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Mock API call or use the real createBike endpoint if connected
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request
            navigate('/seller-dashboard');
        } catch (err) {
            setError('Failed to create listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/seller-dashboard')}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-gray-800">
                    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <span className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Bike className="w-6 h-6" />
                            </span>
                            Create New Listing
                        </h1>
                        <p className="text-sm text-gray-500 mt-2">
                            Fill out the details below to list your bike. Admins will review the listing before it goes live.
                        </p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm flex items-start gap-3 border border-red-100">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                                <div>
                                    <h4 className="font-semibold">Error Submitting Listing</h4>
                                    <p className="mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Section: Basic Info */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Basic Information</h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-sm font-medium">Bike Title</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. 2023 Specialized Tarmac SL7"
                                            required
                                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price" className="text-sm font-medium">Price ($)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                min="0"
                                                value={formData.price}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                required
                                                className="h-11 border-gray-300 focus:border-primary shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="condition" className="text-sm font-medium">Condition</Label>
                                            <select
                                                id="condition"
                                                value={formData.condition}
                                                onChange={handleChange}
                                                className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                                                required
                                            >
                                                <option value="New">New</option>
                                                <option value="Like New">Like New</option>
                                                <option value="Used">Used</option>
                                                <option value="Needs Repair">Needs Repair</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                        <textarea
                                            id="description"
                                            rows="4"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe the bike's history, upgrades, flaws, and general condition..."
                                            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Specifications */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Specifications</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="brandId" className="text-sm font-medium">Brand (ID)</Label>
                                        <Input
                                            id="brandId"
                                            value={formData.brandId}
                                            onChange={handleChange}
                                            placeholder="Brand ID"
                                            required
                                            className="h-11 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="categoryId" className="text-sm font-medium">Category (ID)</Label>
                                        <Input
                                            id="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            placeholder="Category ID"
                                            required
                                            className="h-11 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="frameSize" className="text-sm font-medium">Frame Size</Label>
                                        <Input
                                            id="frameSize"
                                            value={formData.frameSize}
                                            onChange={handleChange}
                                            placeholder="e.g. M, L, 54cm, 56cm"
                                            required
                                            className="h-11 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Photos */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Photos</h3>
                                
                                <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                        <Upload className="w-8 h-8 text-primary" />
                                    </div>
                                    <h4 className="font-medium text-gray-900">Click to upload or drag & drop</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        SVG, PNG, JPG or GIF (max. 800x400px)<br/>
                                        First photo will be the cover image.
                                    </p>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/seller-dashboard')}
                                    className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-md"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {loading ? 'Submitting...' : 'Submit Listing'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
