import { useState, useEffect } from 'react';
import { getAllBikes, approveBike, rejectBike } from '@/services/adminApi';

const statusColors = {
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
    REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    SOLD: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function AdminListings() {
    const [bikes, setBikes] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedBike, setSelectedBike] = useState(null);

    const fetchBikes = async () => {
        try {
            setLoading(true);
            const data = await getAllBikes();
            setBikes(data);
        } catch (err) {
            console.error('Failed to fetch bikes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBikes();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to APPROVE this listing?')) return;
        try {
            setActionLoading(id);
            await approveBike(id);
            await fetchBikes();
        } catch (err) {
            alert('Error approving: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to REJECT this listing?')) return;
        try {
            setActionLoading(id);
            await rejectBike(id);
            await fetchBikes();
        } catch (err) {
            alert('Error rejecting: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const filteredBikes = filter === 'ALL' ? bikes : bikes.filter(b => b.status === filter);

    const filters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SOLD'];

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">Bike Listings</h2>
                    <p className="text-gray-400 mt-1">Approve or reject bike listings</p>
                </div>
                <div className="text-sm text-gray-400">
                    Total: <span className="text-white font-semibold">{filteredBikes.length}</span> listings
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {filters.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${filter === f
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        {f === 'ALL' ? 'All' : f}
                        {f !== 'ALL' && (
                            <span className="ml-1.5 text-xs opacity-70">
                                ({bikes.filter(b => b.status === f).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredBikes.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-lg">No listings found</p>
                </div>
            ) : (
                <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700/50">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Seller</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created At</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/30">
                            {filteredBikes.map((bike) => (
                                <tr key={bike.bikeId} className="hover:bg-gray-700/20 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-300">#{bike.bikeId}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-white truncate max-w-[200px]">{bike.title}</p>
                                        {bike.brandName && <p className="text-xs text-gray-500 mt-0.5">{bike.brandName}</p>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{bike.sellerName || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-emerald-400 font-medium">
                                        {bike.price?.toLocaleString('vi-VN')}₫
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[bike.status] || 'bg-gray-600 text-gray-300'}`}>
                                            {bike.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {new Date(bike.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end items-center">
                                            <button
                                                onClick={() => setSelectedBike(bike)}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                                            >
                                                👁 View More
                                            </button>
                                            {bike.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(bike.bikeId)}
                                                        disabled={actionLoading === bike.bikeId}
                                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {actionLoading === bike.bikeId ? '...' : '✓ Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(bike.bikeId)}
                                                        disabled={actionLoading === bike.bikeId}
                                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {actionLoading === bike.bikeId ? '...' : '✗ Reject'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* View More Modal */}
            {selectedBike && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-800">
                            <h3 className="text-xl font-bold text-white">Listing Details</h3>
                            <button
                                onClick={() => setSelectedBike(null)}
                                className="text-gray-400 hover:text-white transition-colors p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-1">{selectedBike.title}</h4>
                                    <p className="text-sm text-gray-400 mb-4">Posted on {new Date(selectedBike.createdAt).toLocaleString('en-US')}</p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-800 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Price</p>
                                            <p className="text-emerald-400 font-bold text-lg">{selectedBike.price?.toLocaleString('vi-VN')}₫</p>
                                        </div>
                                        <div className="bg-gray-800 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Status</p>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${statusColors[selectedBike.status] || 'bg-gray-600 text-gray-300'}`}>
                                                {selectedBike.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="font-semibold text-white border-b border-gray-800 pb-2">Information</h5>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div className="text-gray-400">Brand:</div>
                                        <div className="text-white font-medium">{selectedBike.brandName || '--'}</div>

                                        <div className="text-gray-400">Category:</div>
                                        <div className="text-white font-medium">{selectedBike.categoryName || '--'}</div>

                                        <div className="text-gray-400">Seller:</div>
                                        <div className="text-white font-medium">{selectedBike.sellerName || 'Unknown'}</div>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-2">
                                    <h5 className="font-semibold text-white border-b border-gray-800 pb-2">Description</h5>
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {selectedBike.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer (Actions) */}
                        <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedBike(null)}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                            {selectedBike.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() => {
                                            handleApprove(selectedBike.bikeId);
                                            setSelectedBike(null);
                                        }}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                                    >
                                        ✓ Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleReject(selectedBike.bikeId);
                                            setSelectedBike(null);
                                        }}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                                    >
                                        ✗ Reject
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
