import React, { useState, useEffect } from 'react';

const BikeListingForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        brandId: '',
        categoryId: '',
        frameSize: '',
        bikeCondition: 'NEW',
        imageUrls: [],
        imageFiles: [],
        isAnonymous: false
    });

    const [isOtherBrand, setIsOtherBrand] = useState(false);
    const [isOtherCategory, setIsOtherCategory] = useState(false);

    const brands = [
        { id: 1, name: 'Giant' },
        { id: 2, name: 'Trek' },
        { id: 3, name: 'Specialized' },
        { id: 4, name: 'Cannondale' },
        { id: 5, name: 'Merida' }
    ];

    const categories = [
        { id: 1, name: 'Road Bike' },
        { id: 2, name: 'Mountain Bike' },
        { id: 3, name: 'City Bike' },
        { id: 4, name: 'Folding Bike' },
        { id: 5, name: 'Electric Bike' }
    ];

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                price: initialData.price || '',
                brandId: initialData.brandId || '',
                categoryId: initialData.categoryId || '',
                frameSize: initialData.frameSize || '',
                bikeCondition: initialData.bikeCondition || 'NEW',
                imageUrls: initialData.imageUrls || [],
                imageFiles: [],
                isAnonymous: initialData.isAnonymous || false
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageFileChange = (e) => {
        const files = Array.from(e.target.files);
        console.log('DEBUG: Selected files:', files);
        if (files.length > 0) {
            setFormData(prev => ({
                ...prev,
                imageFiles: [...prev.imageFiles, ...files]
            }));
            // Reset the input value so the same file can be selected again if removed
            e.target.value = '';
        }
    };

    const removeImageFile = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            imageFiles: prev.imageFiles.filter((_, index) => index !== indexToRemove)
        }));
    };

    const removeExistingImage = (urlToRemove) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter(url => url !== urlToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            price: parseFloat(formData.price) || 0,
            brandId: formData.brandId ? parseInt(formData.brandId) : null,
            categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
            imageUrls: formData.imageUrls,
            imageFiles: formData.imageFiles
        };

        // Validate payload doesn't have NaN
        if (isNaN(payload.brandId)) payload.brandId = null;
        if (isNaN(payload.categoryId)) payload.categoryId = null;

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                {initialData ? 'Edit Bike Listing' : 'Post New Bike Ad'}
            </h2>
            <p className="text-gray-500 mb-8 font-medium">Please fill in the details of your bike below.</p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Product Title *</label>
                    <input
                        type="text" name="title" value={formData.title} onChange={handleChange} required
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
                        placeholder="e.g. Giant Contend AR 1 2025"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                    <textarea
                        name="description" value={formData.description} onChange={handleChange} required rows={4}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
                        placeholder="Describe your bike condition, history, and any upgrades..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Price (VND) *</label>
                        <input
                            type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="1"
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
                            placeholder="Enter amount"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Frame Size</label>
                        <input
                            type="text" name="frameSize" value={formData.frameSize} onChange={handleChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
                            placeholder="S, M, L, 54cm, etc."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Brand Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
                        {!isOtherBrand ? (
                            <select
                                name="brandId"
                                value={formData.brandId}
                                onChange={(e) => {
                                    if (e.target.value === 'other') {
                                        setIsOtherBrand(true);
                                        setFormData(prev => ({ ...prev, brandId: '' }));
                                    } else {
                                        handleChange(e);
                                    }
                                }}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
                            >
                                <option value="other">Other</option>
                                <option value="" disabled>Select Brand</option>
                                {brands.map(b => (
                                    <option key={b.id} value={b.id}>{b.id}: {b.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="number" name="brandId" value={formData.brandId} onChange={handleChange}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
                                    placeholder="Enter Brand ID"
                                />
                                <button type="button" onClick={() => setIsOtherBrand(false)} className="text-sm text-indigo-600 font-bold underline">List</button>
                            </div>
                        )}
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                        {!isOtherCategory ? (
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={(e) => {
                                    if (e.target.value === 'other') {
                                        setIsOtherCategory(true);
                                        setFormData(prev => ({ ...prev, categoryId: '' }));
                                    } else {
                                        handleChange(e);
                                    }
                                }}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
                            >
                                <option value="other">Other</option>
                                <option value="" disabled>Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.id}: {c.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="number" name="categoryId" value={formData.categoryId} onChange={handleChange}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
                                    placeholder="Enter Category ID"
                                />
                                <button type="button" onClick={() => setIsOtherCategory(false)} className="text-sm text-indigo-600 font-bold underline">List</button>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Condition</label>
                    <select
                        name="bikeCondition" value={formData.bikeCondition} onChange={handleChange}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
                    >
                        <option value="NEW">New</option>
                        <option value="USED_LIKE_NEW">Used - Like New</option>
                        <option value="USED_GOOD">Used - Good</option>
                        <option value="USED_FAIR">Used - Fair</option>
                    </select>
                </div>

                {/* Local File Upload Section */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Upload File Images</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-xl file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100 p-2 border border-gray-300 rounded-lg shadow-sm"
                    />

                    {/* Previews for both Existing and New images */}
                    {(formData.imageUrls.length > 0 || formData.imageFiles.length > 0) && (
                        <div className="mt-4 space-y-3">
                            <p className="text-sm font-semibold text-gray-600">Image Previews:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {/* Existing Images */}
                                {formData.imageUrls.map((url, index) => (
                                    <div key={`existing-${index}`} className="relative group aspect-square min-h-[150px] rounded-xl overflow-hidden border-2 border-indigo-100 shadow-sm">
                                        <img
                                            src={url.startsWith('http') || url.startsWith('data:image') ? url : `http://localhost:5026${url}`}
                                            alt="Existing"
                                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-start justify-end p-1">
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(url)}
                                                className="bg-white/90 text-red-600 p-1.5 rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                                                title="Delete this image"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* New Uploaded Files */}
                                {formData.imageFiles.map((file, index) => (
                                    <FilePreview
                                        key={`new-${index}`}
                                        file={file}
                                        onRemove={() => removeImageFile(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg">
                    <input
                        type="checkbox"
                        name="isAnonymous"
                        id="isAnonymous"
                        checked={formData.isAnonymous}
                        onChange={handleChange}
                        className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="isAnonymous" className="text-sm font-semibold text-indigo-900 cursor-pointer">
                        Post this listing anonymously
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                    type="button" onClick={onCancel}
                    className="py-3 px-6 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="py-3 px-10 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:-translate-y-0.5 transition-all"
                >
                    {initialData ? 'Update Listing' : 'Publish Ad'}
                </button>
            </div>
        </form>
    );
};

// Helper component to manage object URLs safely
const FilePreview = ({ file, onRemove }) => {
    const [preview, setPreview] = useState('');

    useEffect(() => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <div className="relative group aspect-square min-h-[150px] rounded-xl overflow-hidden border-2 border-indigo-400 shadow-md">
            {preview && (
                <img
                    src={preview}
                    alt="New preview"
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-start justify-end p-1">
                <button
                    type="button"
                    onClick={onRemove}
                    className="bg-white/90 text-red-600 p-1.5 rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                    title="Remove image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-indigo-600 text-white text-[8px] font-bold py-0.5 px-1 truncate">NEW: {file.name}</div>
        </div>
    );
};

export default BikeListingForm;
