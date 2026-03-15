import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Bike, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
    createBikeListing,
    uploadBikeImage,
    getBrands,
    getCategories,
    getBikeConditions,
} from '@/services/api';

export default function CreateListing() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [metaLoading, setMetaLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [conditions, setConditions] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        brandId: '',
        categoryId: '',
        frameSize: '',
        condition: 'Used',
    });

    useEffect(() => {
        const urls = selectedImages.map((file) => ({ file, url: URL.createObjectURL(file) }));
        setPreviewUrls(urls);

        return () => {
            urls.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, [selectedImages]);

    useEffect(() => {
        const fetchMetaData = async () => {
            setMetaLoading(true);
            try {
                const [brandData, categoryData, conditionData] = await Promise.all([
                    getBrands(),
                    getCategories(),
                    getBikeConditions(),
                ]);

                setBrands(Array.isArray(brandData) ? brandData : []);
                setCategories(Array.isArray(categoryData) ? categoryData : []);

                const normalizedConditions = Array.isArray(conditionData)
                    ? conditionData.map((item) => {
                        if (typeof item === 'string') return item;
                        return item.name || item.conditionName || item.value || String(item);
                    })
                    : [];

                const finalConditions = normalizedConditions.length > 0
                    ? normalizedConditions
                    : ['New', 'Like New', 'Used', 'Needs Repair'];

                setConditions(finalConditions);
                setFormData((prev) => ({
                    ...prev,
                    condition: finalConditions.includes(prev.condition)
                        ? prev.condition
                        : finalConditions[0],
                }));
            } catch {
                setError('Failed to load brands/categories. Please refresh and try again.');
            } finally {
                setMetaLoading(false);
            }
        };

        fetchMetaData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        setSelectedImages((prev) => [...prev, ...imageFiles]);
    };

    const removeImage = (indexToRemove) => {
        setSelectedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                price: Number(formData.price),
                brandId: Number(formData.brandId),
                categoryId: Number(formData.categoryId),
                frameSize: formData.frameSize.trim(),
                bikeCondition: formData.condition,
            };

            const createdBike = await createBikeListing(payload);
            const bikeId = createdBike?.bikeId || createdBike?.id;

            if (!bikeId) {
                throw new Error('Bike ID was not returned from server.');
            }

            if (selectedImages.length > 0) {
                await Promise.all(selectedImages.map((file) => uploadBikeImage(bikeId, file)));
            }

            setSuccessMessage('Your listing has been submitted and is waiting for admin approval.');
            setSelectedImages([]);
            setFormData({
                title: '',
                description: '',
                price: '',
                brandId: '',
                categoryId: '',
                frameSize: '',
                condition: conditions[0] || 'Used',
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to create listing. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/seller-dashboard')}
                    className="mb-4 pl-0 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>

                <Card className="shadow-sm">
                    <CardHeader className="border-b bg-white/70">
                        <CardTitle className="text-2xl flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                                <Bike className="w-5 h-5" />
                            </span>
                            Seller Create Bike Listing
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Fill in bike details, create listing, then upload multiple images.
                        </p>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {error && (
                            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. 2023 Specialized Tarmac SL7"
                                        required
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe bike condition, maintenance history, and highlights"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="frameSize">Frame Size</Label>
                                    <Input
                                        id="frameSize"
                                        value={formData.frameSize}
                                        onChange={handleChange}
                                        placeholder="e.g. M / 54cm"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brandId">Brand</Label>
                                    <Select
                                        id="brandId"
                                        value={formData.brandId}
                                        onChange={handleChange}
                                        disabled={metaLoading || brands.length === 0}
                                        required
                                    >
                                        <option value="" disabled>
                                            {metaLoading ? 'Loading brands...' : 'Select brand'}
                                        </option>
                                        {brands.map((brand) => (
                                            <option key={brand.brandId || brand.id} value={brand.brandId || brand.id}>
                                                {brand.brandName || brand.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="categoryId">Category</Label>
                                    <Select
                                        id="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        disabled={metaLoading || categories.length === 0}
                                        required
                                    >
                                        <option value="" disabled>
                                            {metaLoading ? 'Loading categories...' : 'Select category'}
                                        </option>
                                        {categories.map((category) => (
                                            <option key={category.categoryId || category.id} value={category.categoryId || category.id}>
                                                {category.categoryName || category.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="condition">Condition</Label>
                                    <Select
                                        id="condition"
                                        value={formData.condition}
                                        onChange={handleChange}
                                        disabled={metaLoading || conditions.length === 0}
                                        required
                                    >
                                        {conditions.map((condition) => (
                                            <option key={condition} value={condition}>{condition}</option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="images">Bike Images</Label>
                                <label
                                    htmlFor="images"
                                    className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                                        <Upload className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-800">Click to select multiple images</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, WEBP</p>
                                </label>
                                <Input
                                    id="images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImagesChange}
                                    className="hidden"
                                />

                                {previewUrls.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {previewUrls.map((item, index) => (
                                            <div key={`${item.file.name}-${index}`} className="relative rounded-lg overflow-hidden border bg-white">
                                                <img
                                                    src={item.url}
                                                    alt={`preview-${index}`}
                                                    className="h-28 w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                                                    aria-label="Remove image"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {previewUrls.length === 0 && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <ImageIcon className="w-4 h-4" />
                                        No image selected yet.
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => navigate('/seller-dashboard')}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading || metaLoading}>
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {loading ? 'Creating Listing...' : 'Create Listing'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
