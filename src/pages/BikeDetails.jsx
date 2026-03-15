import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBikeById, uploadBikeImage, deleteBikeImage } from '@/services/api';
import { ArrowLeft, User, MapPin, CheckCircle, Tag, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BikeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const fetchBikeDetails = async () => {
        try {
            setLoading(true);
            const data = await getBikeById(id);
            setBike(data);
        } catch (err) {
            console.error("Error fetching bike details:", err);
            setError("Failed to load bike details. It may have been removed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }

        if (id) {
            fetchBikeDetails();
        }
    }, [id]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            await uploadBikeImage(id, file);
            // Refresh details to show new image
            await fetchBikeDetails();
        } catch (err) {
            console.error("Upload failed:", err);
            const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Failed to upload image. Please try again.";
            alert(`Upload failed: ${errorMsg}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteImage = async (imageUrl, index, e) => {
        e.stopPropagation(); // prevent clicking thumbnail
        if (!window.confirm("Are you sure you want to delete this image?")) return;

        try {
            setIsUploading(true);
            await deleteBikeImage(id, imageUrl);
            
            // Adjust selected index if needed
            if (index === selectedImageIndex) {
                 setSelectedImageIndex(0);
            } else if (index < selectedImageIndex) {
                 setSelectedImageIndex(prev => prev - 1);
            }

            await fetchBikeDetails();
        } catch (err) {
            console.error("Delete failed:", err);
            const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Failed to delete image.";
            alert(`Delete failed: ${errorMsg}`);
        } finally {
            setIsUploading(false);
        }
    };

    const isOwner = user && bike && user.userId === bike.sellerId;

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F56218]"></div>
            </div>
        );
    }

    if (error || !bike) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-[#F56218] mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to listings
                </button>
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center">
                    <h2 className="text-xl font-bold mb-2">Oops!</h2>
                    <p>{error || "Bike not found."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 lg:px-8 py-8 w-full max-w-6xl">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-[#F56218] mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to listings
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column: Images */}
                <div className="space-y-4">
                    <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative group">
                        {bike.imageUrls && bike.imageUrls.length > 0 ? (
                            <div className="relative w-full h-full group">
                                <img
                                    src={bike.imageUrls[selectedImageIndex] || bike.imageUrls[0]}
                                    alt={bike.title}
                                    className="w-full h-full object-cover transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="bg-white/90 backdrop-blur-sm text-gray-900 border-0"
                                        onClick={() => window.open(bike.imageUrls[selectedImageIndex] || bike.imageUrls[0], '_blank')}
                                    >
                                        View Full Size
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No image available
                            </div>
                        )}
                    </div>
                    {/* Thumbnail grid (if multiple images or if owner) */}
                    <div className="flex flex-wrap gap-2">
                        {bike.imageUrls && bike.imageUrls.map((url, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`relative w-20 sm:w-24 aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer hover:opacity-100 group/thumb ${selectedImageIndex === index ? 'border-[#F56218] shadow-md opacity-100 scale-105' : 'border-gray-200 opacity-70'}`}
                            >
                                <img src={url} alt={`${bike.title} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                
                                {/* Delete Overlay */}
                                {isOwner && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                         <button 
                                            onClick={(e) => handleDeleteImage(url, index, e)}
                                            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-sm"
                                            title="Delete Image"
                                         >
                                            <Trash2 className="w-4 h-4" />
                                         </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isOwner && (
                            <div className="relative">
                                <input
                                    type="file"
                                    id="bike-image-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                                <label
                                    htmlFor="bike-image-upload"
                                    className={`w-20 sm:w-24 aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#F56218] hover:bg-orange-50 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-6 h-6 text-[#F56218] animate-spin" />
                                    ) : (
                                        <>
                                            <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
                                            <span className="text-[10px] font-medium text-gray-500 text-center px-1">Add Photo</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="flex flex-col">
                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                            {bike.title}
                        </h1>
                        <div className="text-3xl font-extrabold text-[#D94E0A] mb-4">
                            {bike.price == 0 ? 'Contact for price' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bike.price)}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {bike.bikeCondition && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {bike.bikeCondition}
                                </span>
                            )}
                            {bike.categoryName && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {bike.categoryName}
                                </span>
                            )}
                            {bike.brandName && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {bike.brandName}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100 space-y-4">
                        <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Seller Information</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                                <User className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{bike.sellerName || 'Anonymous Seller'}</p>
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    Vietnam
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors border border-gray-200">
                                Contact Seller
                            </button>
                            <button 
                                onClick={() => navigate(`/checkout/${bike.bikeId}`)}
                                className="flex-1 bg-[#F56218] hover:bg-[#D94E0A] text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>

                    <div className="mt-2 text-gray-700">
                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">Description</h3>
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-600">
                            {bike.description || "No description provided."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
