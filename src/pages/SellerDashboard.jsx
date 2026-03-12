import React, { useState, useEffect } from 'react';
import { getAllBikes, createBike, updateBike, deleteBike } from '../services/api';
import BikeListingForm from '../components/BikeListingForm';

const SellerDashboard = () => {
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingBike, setEditingBike] = useState(null);
    const [bikeToDelete, setBikeToDelete] = useState(null);

    // Get currentUser from local storage
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const sellerId = currentUser?.userId || currentUser?.id;

    const fetchBikes = async () => {
        try {
            setLoading(true);
            const data = await getAllBikes();
            // Filter bikes for this specific seller
            const sellerBikes = data.filter(b => b.sellerId === sellerId);
            setBikes(sellerBikes);
        } catch (err) {
            setError('Failed to load bikes. Please ensure the Backend API is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBikes();
    }, []);

    const handleCreateNew = () => {
        setEditingBike(null);
        setIsFormVisible(true);
    };

    const handleEdit = (bike) => {
        setEditingBike(bike);
        setIsFormVisible(true);
    };

    const handleDelete = (id) => {
        setBikeToDelete(id);
    };

    const confirmDelete = async () => {
        if (!bikeToDelete) return;
        try {
            await deleteBike(bikeToDelete);
            window.location.reload(); // Reload the page as requested
        } catch (err) {
            alert('An error occurred while deleting the bike!');
            console.error(err);
        } finally {
            setBikeToDelete(null);
        }
    };

    const handleFormSubmit = async (formData) => {
        const payload = { ...formData, sellerId: sellerId };
        console.log('DEBUG: Submitting Bike Payload:', payload);
        try {
            if (editingBike) {
                await updateBike(editingBike.bikeId, payload);
                alert('Listing updated successfully!');
            } else {
                await createBike(payload);
                alert('Listing posted successfully!');
            }
            setIsFormVisible(false);
            fetchBikes(); // Refresh list
        } catch (err) {
            alert('An error occurred while saving the data!');
            console.error(err);
        }
    };

    if (loading) return (
        <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <div className="text-gray-500 font-medium">Loading your listings...</div>
        </div>
    );

    if (isFormVisible) {
        return (
            <div className="container mx-auto p-4 sm:p-8">
                <BikeListingForm
                    initialData={editingBike}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsFormVisible(false)}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Bike Listings</h1>
                    <p className="text-gray-500 mt-1">Manage all your advertised bikes in one place.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg border-b-4 border-indigo-800 font-bold transition-all transform hover:-translate-y-1 active:border-b-0 active:translate-y-1"
                >
                    + Post New Ad
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm mb-6 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Image</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Product Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {bikes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 whitespace-nowrap text-lg text-gray-400 text-center italic">
                                        No listings found. Start by posting your first bike!
                                    </td>
                                </tr>
                            ) : (
                                bikes.map((bike) => (
                                    <tr key={bike.bikeId} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                {bike.imageUrls && bike.imageUrls.length > 0 ? (
                                                    <img src={bike.imageUrls[0].startsWith('http') || bike.imageUrls[0].startsWith('data:image') ? bike.imageUrls[0] : `http://localhost:5026${bike.imageUrls[0]}`} alt={bike.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs text-center p-1">No Image</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base font-bold text-gray-900">{bike.title}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">ID {bike.brandId}: {bike.brandName || 'N/A'}</span>
                                                {bike.isAnonymous && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 rounded font-bold uppercase">Anonymous</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-extrabold text-indigo-600">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bike.price)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${bike.status === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                bike.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-700 border border-red-200'
                                                }`}>
                                                {bike.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button
                                                onClick={() => handleEdit(bike)}
                                                className="text-indigo-600 hover:text-indigo-900 font-bold mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bike.bikeId)}
                                                className="text-red-500 hover:text-red-700 font-bold"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {bikeToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <span className="text-2xl">⚠️</span>
                            <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                        </div>
                        <p className="text-gray-600 mb-6 font-medium text-sm leading-relaxed">
                            Are you sure you want to delete this listing? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setBikeToDelete(null)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
