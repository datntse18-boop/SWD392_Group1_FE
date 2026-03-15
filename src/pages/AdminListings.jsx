import { useState, useEffect } from 'react';
import { getAllBikes, approveBike, rejectBike } from '@/services/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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
        if (!globalThis.confirm('Are you sure you want to APPROVE this listing?')) return;
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
        if (!globalThis.confirm('Are you sure you want to REJECT this listing?')) return;
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
        <div className="space-y-4">
            <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-800">
                            Bike Listings
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Approve or reject bike listings
                        </CardDescription>
                    </div>
                    <div className="text-sm text-gray-500">
                        Total:{' '}
                        <span className="font-semibold text-gray-900">
                            {filteredBikes.length}
                        </span>{' '}
                        listings
                    </div>
                </CardHeader>

                <CardContent className="pt-4">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {filters.map((f) => (
                            <Button
                                key={f}
                                size="sm"
                                variant={filter === f ? 'default' : 'outline'}
                                onClick={() => setFilter(f)}
                                className={`rounded-full text-xs font-medium ${filter === f
                                        ? 'bg-[#F56218] hover:bg-[#e2560f]'
                                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {f === 'ALL' ? 'All' : f}
                                {f !== 'ALL' && (
                                    <span className="ml-1.5 text-[11px] text-gray-500">
                                        ({bikes.filter(b => b.status === f).length})
                                    </span>
                                )}
                            </Button>
                        ))}
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-2 border-[#F56218] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredBikes.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-base font-medium">No listings found</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                ID
                                            </th>
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Title
                                            </th>
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Seller
                                            </th>
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Price
                                            </th>
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Status
                                            </th>
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Created At
                                            </th>
                                            <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredBikes.map((bike) => (
                                            <tr
                                                key={bike.bikeId}
                                                className="hover:bg-orange-50/40 transition-colors"
                                            >
                                                <td className="px-6 py-3 text-xs text-gray-600">
                                                    #{bike.bikeId}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[220px]">
                                                        {bike.title}
                                                    </p>
                                                    {bike.brandName && (
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {bike.brandName}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-700">
                                                    {bike.sellerName || 'N/A'}
                                                </td>
                                                <td className="px-6 py-3 text-sm font-semibold text-[#D94E0A]">
                                                    {bike.price?.toLocaleString('vi-VN')}₫
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full border ${statusColors[bike.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                        {bike.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-500">
                                                    {new Date(bike.createdAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex gap-2 justify-end items-center">
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            onClick={() => setSelectedBike(bike)}
                                                            className="rounded-full border-gray-200 text-gray-700 hover:bg-gray-50"
                                                        >
                                                            👁 View
                                                        </Button>
                                                        {bike.status === 'PENDING' && (
                                                            <>
                                                                <Button
                                                                    size="xs"
                                                                    onClick={() => handleApprove(bike.bikeId)}
                                                                    disabled={actionLoading === bike.bikeId}
                                                                    className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-60"
                                                                >
                                                                    {actionLoading === bike.bikeId ? '...' : '✓ Approve'}
                                                                </Button>
                                                                <Button
                                                                    size="xs"
                                                                    variant="destructive"
                                                                    onClick={() => handleReject(bike.bikeId)}
                                                                    disabled={actionLoading === bike.bikeId}
                                                                    className="rounded-full text-white disabled:opacity-60"
                                                                >
                                                                    {actionLoading === bike.bikeId ? '...' : '✗ Reject'}
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View More Modal */}
            {selectedBike && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Listing Details
                            </h3>
                            <button
                                onClick={() => setSelectedBike(null)}
                                className="text-gray-400 hover:text-gray-700 transition-colors p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4 overflow-y-auto">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                                        {selectedBike.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-4">
                                        Posted on{' '}
                                        {new Date(selectedBike.createdAt).toLocaleString('en-US')}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                                            <p className="text-[11px] text-orange-700 mb-1 uppercase font-semibold">
                                                Price
                                            </p>
                                            <p className="text-lg font-bold text-[#D94E0A]">
                                                {selectedBike.price?.toLocaleString('vi-VN')}₫
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                                            <p className="text-[11px] text-gray-500 mb-1 uppercase font-semibold">
                                                Status
                                            </p>
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[selectedBike.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                {selectedBike.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Images */}
                                <div className="space-y-3">
                                    <h5 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
                                        Images
                                    </h5>
                                    {selectedBike.imageUrls && selectedBike.imageUrls.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                                <img
                                                    src={selectedBike.imageUrls[0]}
                                                    alt={selectedBike.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {selectedBike.imageUrls.length > 1 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedBike.imageUrls.slice(1).map((url, index) => (
                                                        <div
                                                            key={index}
                                                            className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                                                        >
                                                            <img
                                                                src={url}
                                                                alt={`${selectedBike.title} thumbnail ${index + 2}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <h5 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
                                        Information
                                    </h5>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div className="text-gray-500">Brand:</div>
                                        <div className="text-gray-900 font-medium">
                                            {selectedBike.brandName || '--'}
                                        </div>

                                        <div className="text-gray-500">Category:</div>
                                        <div className="text-gray-900 font-medium">
                                            {selectedBike.categoryName || '--'}
                                        </div>

                                        <div className="text-gray-500">Seller:</div>
                                        <div className="text-gray-900 font-medium">
                                            {selectedBike.sellerName || 'Unknown'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-2">
                                    <h5 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
                                        Description
                                    </h5>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {selectedBike.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer (Actions) */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedBike(null)}
                                className="rounded-full border-gray-300 text-gray-700 hover:bg-white"
                            >
                                Close
                            </Button>
                            {selectedBike.status === 'PENDING' && (
                                <>
                                    <Button
                                        onClick={() => {
                                            handleApprove(selectedBike.bikeId);
                                            setSelectedBike(null);
                                        }}
                                        className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white"
                                    >
                                        ✓ Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            handleReject(selectedBike.bikeId);
                                            setSelectedBike(null);
                                        }}
                                        className="rounded-full text-white"
                                    >
                                        ✗ Reject
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
