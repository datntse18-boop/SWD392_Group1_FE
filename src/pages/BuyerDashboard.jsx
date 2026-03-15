import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Store, LogOut, CheckCircle, AlertCircle, Loader2, PackageCheck, UserCircle2, Star } from 'lucide-react';
import { confirmOrderReceived, createReview, deleteReview, getBikeById, getOrders, getReviews, getUserById, requestSellerRole, updateReview } from '@/services/api';

const menuItems = [
    { key: 'profile', label: 'My Profile', icon: <UserCircle2 className="w-5 h-5" /> },
    { key: 'orders', label: 'My Orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { key: 'reviewHistory', label: 'Review History', icon: <Star className="w-5 h-5" /> },
    { key: 'wishlist', label: 'Wishlist', icon: <Heart className="w-5 h-5" /> },
];

export default function BuyerDashboard() {
    const [activeTab, setActiveTab] = useState('orders');
    const [user, setUser] = useState(null);
    const [requestStatus, setRequestStatus] = useState({ loading: false, success: false, error: '' });
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState('');
    const [ordersSuccess, setOrdersSuccess] = useState('');
    const [receivedLoadingId, setReceivedLoadingId] = useState(null);
    const [postReceiveActionOrderIds, setPostReceiveActionOrderIds] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState('');
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState('');
    const [reviewActionLoadingId, setReviewActionLoadingId] = useState(null);
    const [reviewActionMessage, setReviewActionMessage] = useState('');
    const [showQuickReviewModal, setShowQuickReviewModal] = useState(false);
    const [quickReviewOrder, setQuickReviewOrder] = useState(null);
    const [quickReviewSeller, setQuickReviewSeller] = useState(null);
    const [quickReviewBike, setQuickReviewBike] = useState(null);
    const [quickReviewLoading, setQuickReviewLoading] = useState(false);
    const [quickReviewSubmitting, setQuickReviewSubmitting] = useState(false);
    const [quickReviewRating, setQuickReviewRating] = useState(5);
    const [quickReviewComment, setQuickReviewComment] = useState('');
    const [quickReviewError, setQuickReviewError] = useState('');
    const [reviewHistorySellerDetailsById, setReviewHistorySellerDetailsById] = useState({});
    const [reviewHistoryBikeDetailsById, setReviewHistoryBikeDetailsById] = useState({});
    const [showConfirmReceiveModal, setShowConfirmReceiveModal] = useState(false);
    const [selectedReceiveOrder, setSelectedReceiveOrder] = useState(null);
    const navigate = useNavigate();

    const loadOrders = async (buyerId) => {
        try {
            setOrdersLoading(true);
            setOrdersError('');
            const data = await getOrders();
            const buyerOrders = (Array.isArray(data) ? data : []).filter(
                (order) => Number(order.buyerId) === Number(buyerId)
            );
            setOrders(buyerOrders);
        } catch (err) {
            setOrdersError(err.response?.data?.message || 'Failed to load orders.');
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadMyReviews = async (buyerId) => {
        try {
            setReviewsLoading(true);
            setReviewsError('');
            const data = await getReviews();
            const buyerReviews = (Array.isArray(data) ? data : []).filter(
                (review) => Number(review.buyerId) === Number(buyerId)
            );
            buyerReviews.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            setMyReviews(buyerReviews);
        } catch (err) {
            setReviewsError(err.response?.data?.message || 'Failed to load your reviews.');
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        const initUser = async () => {
            const userDataString = localStorage.getItem('user');
            if (!userDataString) return;

            const parsedUser = JSON.parse(userDataString);

            try {
                const fullUser = await getUserById(parsedUser.userId);
                const mergedUser = { ...parsedUser, ...fullUser };
                setUser(mergedUser);
                localStorage.setItem('user', JSON.stringify(mergedUser));
                loadOrders(mergedUser.userId);
                loadMyReviews(mergedUser.userId);
            } catch {
                setUser(parsedUser);
                loadOrders(parsedUser.userId);
                loadMyReviews(parsedUser.userId);
            }
        };

        initUser();
    }, []);

    useEffect(() => {
        const loadReviewHistoryDetails = async () => {
            if (!myReviews.length || !orders.length) return;

            const orderMap = new Map((orders || []).map((order) => [Number(order.orderId), order]));
            const uniqueSellerIds = [...new Set(myReviews.map((review) => Number(review.sellerId)).filter(Boolean))];
            const uniqueBikeIds = [
                ...new Set(
                    myReviews
                        .map((review) => orderMap.get(Number(review.orderId))?.bikeId)
                        .filter(Boolean)
                        .map((bikeId) => Number(bikeId))
                ),
            ];

            const sellerDetailsEntries = await Promise.all(
                uniqueSellerIds.map(async (sellerId) => {
                    try {
                        const seller = await getUserById(sellerId);
                        return [sellerId, seller];
                    } catch {
                        return [sellerId, null];
                    }
                })
            );

            const bikeDetailsEntries = await Promise.all(
                uniqueBikeIds.map(async (bikeId) => {
                    try {
                        const bike = await getBikeById(bikeId);
                        return [bikeId, bike];
                    } catch {
                        return [bikeId, null];
                    }
                })
            );

            setReviewHistorySellerDetailsById(
                sellerDetailsEntries.reduce((acc, [sellerId, seller]) => {
                    if (seller) acc[sellerId] = seller;
                    return acc;
                }, {})
            );

            setReviewHistoryBikeDetailsById(
                bikeDetailsEntries.reduce((acc, [bikeId, bike]) => {
                    if (bike) acc[bikeId] = bike;
                    return acc;
                }, {})
            );
        };

        loadReviewHistoryDetails();
    }, [myReviews, orders]);

    const handleConfirmReceived = async (orderId) => {
        try {
            setReceivedLoadingId(orderId);
            setOrdersError('');
            setOrdersSuccess('');
            await confirmOrderReceived(orderId);
            setPostReceiveActionOrderIds((prev) =>
                prev.includes(orderId) ? prev : [...prev, orderId]
            );
            await loadOrders(user?.userId);
            setOrdersSuccess('Order status updated: Received ✔');
            return true;
        } catch (err) {
            setOrdersError(err.response?.data?.message || 'Failed to confirm received bike.');
            return false;
        } finally {
            setReceivedLoadingId(null);
        }
    };

    const handleOpenConfirmReceiveModal = (order) => {
        setSelectedReceiveOrder(order);
        setShowConfirmReceiveModal(true);
    };

    const handleCloseConfirmReceiveModal = () => {
        if (selectedReceiveOrder && receivedLoadingId === selectedReceiveOrder.orderId) return;
        setShowConfirmReceiveModal(false);
        setSelectedReceiveOrder(null);
    };

    const handleConfirmReceivedFromModal = async () => {
        if (!selectedReceiveOrder) return;

        const isSuccess = await handleConfirmReceived(selectedReceiveOrder.orderId);
        if (isSuccess) {
            setShowConfirmReceiveModal(false);
            const orderForReview = {
                ...selectedReceiveOrder,
                status: 'RECEIVED',
            };
            setSelectedReceiveOrder(null);
            await handleOpenQuickReview(orderForReview);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleRequestSeller = async () => {
        if (!user || !user.userId) return;
        setRequestStatus({ loading: true, success: false, error: '' });
        
        try {
            await requestSellerRole(user.userId);
            setRequestStatus({ loading: false, success: true, error: '' });
            
            // Update local user state
            const updatedUser = { ...user, pendingSellerUpgrade: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
            setRequestStatus({ 
                loading: false, 
                success: false, 
                error: err.response?.data?.message || 'Failed to submit request.' 
            });
        }
    };

    const handleStartEditReview = (review) => {
        setReviewActionMessage('');
        setEditingReviewId(review.reviewId);
        setEditRating(Number(review.rating || 5));
        setEditComment(review.comment || '');
    };

    const handleCancelEditReview = () => {
        setEditingReviewId(null);
        setEditRating(5);
        setEditComment('');
    };

    const handleSaveReview = async (reviewId) => {
        if (!user?.userId) return;

        try {
            setReviewActionLoadingId(reviewId);
            setReviewActionMessage('');
            await updateReview(reviewId, {
                rating: editRating,
                comment: editComment,
            });
            await loadMyReviews(user.userId);
            setEditingReviewId(null);
            setReviewActionMessage('Review updated successfully.');
        } catch (err) {
            setReviewsError(err.response?.data?.message || 'Failed to update review.');
        } finally {
            setReviewActionLoadingId(null);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!user?.userId) return;
        const confirmed = window.confirm('Are you sure you want to delete this review?');
        if (!confirmed) return;

        try {
            setReviewActionLoadingId(reviewId);
            setReviewActionMessage('');
            await deleteReview(reviewId);
            await loadMyReviews(user.userId);
            setReviewActionMessage('Review deleted successfully.');
            if (editingReviewId === reviewId) {
                handleCancelEditReview();
            }
        } catch (err) {
            setReviewsError(err.response?.data?.message || 'Failed to delete review.');
        } finally {
            setReviewActionLoadingId(null);
        }
    };

    const handleOpenQuickReview = async (order) => {
        try {
            setQuickReviewLoading(true);
            setQuickReviewError('');
            setQuickReviewOrder(order);
            setQuickReviewSeller(null);
            setQuickReviewBike(null);
            setQuickReviewRating(5);
            setQuickReviewComment('');
            setShowQuickReviewModal(true);

            const [sellerData, bikeData] = await Promise.all([
                getUserById(Number(order.sellerId)),
                order.bikeId ? getBikeById(Number(order.bikeId)) : Promise.resolve(null),
            ]);

            setQuickReviewSeller(sellerData || null);
            setQuickReviewBike(bikeData || null);
        } catch (err) {
            setQuickReviewError(err.response?.data?.message || 'Failed to load review details.');
        } finally {
            setQuickReviewLoading(false);
        }
    };

    const handleCloseQuickReview = () => {
        if (quickReviewSubmitting) return;
        setShowQuickReviewModal(false);
        setQuickReviewOrder(null);
        setQuickReviewSeller(null);
        setQuickReviewBike(null);
        setQuickReviewError('');
    };

    const handleSubmitQuickReview = async () => {
        if (!quickReviewOrder || !user?.userId) return;

        try {
            setQuickReviewSubmitting(true);
            setQuickReviewError('');

            await createReview({
                orderId: Number(quickReviewOrder.orderId),
                buyerId: Number(user.userId),
                sellerId: Number(quickReviewOrder.sellerId),
                rating: quickReviewRating,
                comment: quickReviewComment,
            });

            await loadMyReviews(user.userId);
            setOrdersSuccess('Review submitted successfully.');
            handleCloseQuickReview();
        } catch (err) {
            setQuickReviewError(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setQuickReviewSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
                <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between cursor-pointer" onClick={() => navigate('/')}>
                    <h1 className="text-xl font-bold tracking-tight">
                        <span className="text-primary">Cycle</span>Trust
                    </h1>
                </div>

                {/* User Info */}
                {user && (
                    <div className="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {user.fullName?.charAt(0) || 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                                activeTab === item.key
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                    
                    {/* Convert to Seller Area */}
                    <div className="mt-8 pt-6 border-t border-gray-100 px-2">
                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                            <div className="flex items-start gap-3 mb-3">
                                <Store className="w-5 h-5 text-orange-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">Want to sell bikes?</h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Upgrade your account to a Seller to list and manage your own bikes.
                                    </p>
                                </div>
                            </div>
                            
                            {user?.pendingSellerUpgrade ? (
                                <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100/50 p-2 rounded-lg font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    Request Pending
                                </div>
                            ) : (
                                <button
                                    onClick={handleRequestSeller}
                                    disabled={requestStatus.loading || requestStatus.success}
                                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {requestStatus.loading ? 'Requesting...' : 'Request Upgrade'}
                                </button>
                            )}

                            {requestStatus.error && (
                                <div className="mt-2 text-xs text-red-600 flex items-start gap-1">
                                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    {requestStatus.error}
                                </div>
                            )}
                            
                            {requestStatus.success && (
                                <div className="mt-2 text-xs text-green-600 flex items-start gap-1">
                                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    Request submitted successfully. Waiting for admin approval.
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {activeTab === 'orders'
                                ? 'My Orders'
                                : activeTab === 'wishlist'
                                    ? 'My Wishlist'
                                    : activeTab === 'reviewHistory'
                                        ? 'Review History'
                                        : 'My Profile'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {activeTab === 'orders'
                                ? 'Track your purchases and view order history.'
                                : activeTab === 'wishlist'
                                    ? 'Bikes you have saved for later.'
                                    : activeTab === 'reviewHistory'
                                        ? 'View, edit, or delete your seller reviews.'
                                    : 'View your personal account information.'}
                        </p>
                    </div>

                    {/* Tab Content Placeholder */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm min-h-[400px]">
                        {activeTab === 'orders' ? (
                            <>
                                {ordersLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                                        <p className="text-sm text-gray-500">Loading your orders...</p>
                                    </div>
                                ) : (
                                    <>
                                        {ordersSuccess && (
                                            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
                                                {ordersSuccess}
                                            </div>
                                        )}

                                        {ordersError && (
                                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                                                {ordersError}
                                            </div>
                                        )}

                                        {orders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders yet</h3>
                                        <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
                                            When you order a bike, it will appear here.
                                        </p>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors cursor-pointer text-sm"
                                        >
                                            Browse Bikes
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => {
                                            const status = String(order.status || '').toUpperCase();
                                            const isDeliveredStage = status === 'COMPLETED' || status === 'RECEIVED';
                                            const showPostReceiveActions = postReceiveActionOrderIds.includes(order.orderId) || status === 'RECEIVED';
                                            const hasReviewedOrder = myReviews.some(
                                                (review) => Number(review.orderId) === Number(order.orderId)
                                            );
                                            return (
                                                <div
                                                    key={order.orderId}
                                                    className={`rounded-xl border p-4 ${
                                                        isDeliveredStage
                                                            ? 'border-emerald-200 bg-emerald-50/40'
                                                            : 'border-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{order.bikeTitle}</h3>
                                                            <p className="text-sm text-gray-500 mt-1">Order #{order.orderId}</p>
                                                            <p className="text-sm text-gray-500">Seller: {order.sellerName}</p>
                                                            <p className="text-sm text-gray-500">Status: <span className={`font-semibold ${isDeliveredStage ? 'text-emerald-700' : 'text-gray-700'}`}>{order.status}</span></p>
                                                            <p className="text-sm text-gray-500">Deposit: {Number(order.depositAmount || 0).toLocaleString('vi-VN')}₫</p>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <button
                                                                onClick={() => navigate(`/orders/${order.orderId}`)}
                                                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium"
                                                            >
                                                                View Detail
                                                            </button>

                                                            {status === 'DEPOSITED' && (
                                                                <button
                                                                    onClick={() => handleOpenConfirmReceiveModal(order)}
                                                                    disabled={receivedLoadingId === order.orderId}
                                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-70"
                                                                >
                                                                    {receivedLoadingId === order.orderId ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <PackageCheck className="w-4 h-4" />
                                                                    )}
                                                                    I have received the order.
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {showPostReceiveActions && (
                                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                                            {!hasReviewedOrder && (
                                                                <button
                                                                    onClick={() => handleOpenQuickReview(order)}
                                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                                                                >
                                                                    Good product. Giving it a review.
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => alert('Report')}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                                                            >
                                                                Report
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                    </>
                                )}
                            </>
                        ) : activeTab === 'wishlist' ? (
                            <div className="flex flex-col items-center justify-center h-full pt-12 pb-20">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Heart className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No items in wishlist yet</h3>
                                <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
                                    Save bikes you like to your wishlist to easily find them later.
                                </p>
                            </div>
                        ) : activeTab === 'reviewHistory' ? (
                            <div className="space-y-4">
                                {reviewActionMessage && (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
                                        {reviewActionMessage}
                                    </div>
                                )}

                                {reviewsLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading your reviews...
                                    </div>
                                ) : reviewsError ? (
                                    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                                        {reviewsError}
                                    </div>
                                ) : myReviews.length === 0 ? (
                                    <p className="text-sm text-gray-500">You haven't submitted any reviews yet.</p>
                                ) : (
                                    myReviews.map((review) => {
                                        const isEditing = editingReviewId === review.reviewId;
                                        const activeRating = isEditing ? editRating : Number(review.rating || 0);
                                        const relatedOrder = orders.find((order) => Number(order.orderId) === Number(review.orderId));
                                        const sellerDetail = reviewHistorySellerDetailsById[Number(review.sellerId)];
                                        const bikeDetail = relatedOrder?.bikeId ? reviewHistoryBikeDetailsById[Number(relatedOrder.bikeId)] : null;
                                        const bikeImage = bikeDetail?.imageUrls?.[0] || bikeDetail?.imageUrl || null;
                                        return (
                                            <div key={review.reviewId} className="rounded-xl border border-gray-200 p-4 bg-gray-50/60">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">Order #{review.orderId} • Seller: {review.sellerName || `#${review.sellerId}`}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {review.createdAt ? new Date(review.createdAt).toLocaleString('vi-VN') : '--'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-amber-500">
                                                        {[1, 2, 3, 4, 5].map((starValue) => (
                                                            <button
                                                                key={starValue}
                                                                type="button"
                                                                disabled={!isEditing}
                                                                onClick={() => isEditing && setEditRating(starValue)}
                                                                className={isEditing ? 'p-1 rounded hover:bg-gray-100' : 'p-1'}
                                                            >
                                                                <Star
                                                                    className={`w-4 h-4 ${starValue <= activeRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <div><p className="text-gray-500">Order Status</p><p className="font-medium text-gray-900">{relatedOrder?.status || '--'}</p></div>
                                                    <div><p className="text-gray-500">Bike</p><p className="font-medium text-gray-900">{bikeDetail?.title || relatedOrder?.bikeTitle || '--'}</p></div>
                                                    <div><p className="text-gray-500">Total Amount</p><p className="font-medium text-gray-900">{Number(relatedOrder?.totalAmount || 0).toLocaleString('vi-VN')}₫</p></div>
                                                    <div><p className="text-gray-500">Deposit</p><p className="font-medium text-gray-900">{Number(relatedOrder?.depositAmount || 0).toLocaleString('vi-VN')}₫</p></div>
                                                    <div><p className="text-gray-500">Seller Phone</p><p className="font-medium text-gray-900">{sellerDetail?.phone || '--'}</p></div>
                                                    <div><p className="text-gray-500">Địa chỉ</p><p className="font-medium text-gray-900">{sellerDetail?.address || '--'}</p></div>
                                                    <div className="md:col-span-2">
                                                        <p className="text-gray-500 mb-1">Image</p>
                                                        {bikeImage ? (
                                                            <img
                                                                src={bikeImage}
                                                                alt={bikeDetail?.title || relatedOrder?.bikeTitle || 'Bike image'}
                                                                className="w-40 h-24 rounded-lg object-cover border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-40 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                                                                No image
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {isEditing ? (
                                                    <textarea
                                                        value={editComment}
                                                        onChange={(e) => setEditComment(e.target.value)}
                                                        rows={3}
                                                        className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                ) : (
                                                    <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{review.comment || 'No comment.'}</p>
                                                )}

                                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleSaveReview(review.reviewId)}
                                                                disabled={reviewActionLoadingId === review.reviewId}
                                                                className="px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium disabled:opacity-70"
                                                            >
                                                                {reviewActionLoadingId === review.reviewId ? 'Saving...' : 'Save'}
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEditReview}
                                                                disabled={reviewActionLoadingId === review.reviewId}
                                                                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStartEditReview(review)}
                                                            disabled={reviewActionLoadingId === review.reviewId}
                                                            className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-70"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDeleteReview(review.reviewId)}
                                                        disabled={reviewActionLoadingId === review.reviewId}
                                                        className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-70"
                                                    >
                                                        {reviewActionLoadingId === review.reviewId ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><p className="text-gray-500">Full Name</p><p className="font-medium text-gray-900">{user?.fullName || '--'}</p></div>
                                        <div><p className="text-gray-500">Email</p><p className="font-medium text-gray-900">{user?.email || '--'}</p></div>
                                        <div><p className="text-gray-500">Phone</p><p className="font-medium text-gray-900">{user?.phone || '--'}</p></div>
                                        <div><p className="text-gray-500">Address</p><p className="font-medium text-gray-900">{user?.address || '--'}</p></div>
                                        <div><p className="text-gray-500">Role</p><p className="font-medium text-gray-900">{user?.roleName || 'BUYER'}</p></div>
                                        <div><p className="text-gray-500">Status</p><p className="font-medium text-gray-900">{user?.status || 'ACTIVE'}</p></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showConfirmReceiveModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Confirm Received</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            Are you sure you have received the bicycle?
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={handleCloseConfirmReceiveModal}
                                disabled={receivedLoadingId === selectedReceiveOrder?.orderId}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReceivedFromModal}
                                disabled={receivedLoadingId === selectedReceiveOrder?.orderId}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:opacity-70"
                            >
                                {receivedLoadingId === selectedReceiveOrder?.orderId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showQuickReviewModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white border border-gray-200 p-6 max-h-[85vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-gray-900">Review Seller</h3>
                        <p className="text-sm text-gray-500 mt-1">Please review the order details before submitting.</p>

                        {quickReviewLoading ? (
                            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading review details...
                            </div>
                        ) : (
                            <div className="mt-5 space-y-4">
                                {quickReviewError && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                                        {quickReviewError}
                                    </div>
                                )}

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div><p className="text-gray-500">Order</p><p className="font-medium text-gray-900">#{quickReviewOrder?.orderId || '--'}</p></div>
                                    <div><p className="text-gray-500">Order Status</p><p className="font-medium text-gray-900">{quickReviewOrder?.status || '--'}</p></div>
                                    <div><p className="text-gray-500">Total Amount</p><p className="font-medium text-gray-900">{Number(quickReviewOrder?.totalAmount || 0).toLocaleString('vi-VN')}₫</p></div>
                                    <div><p className="text-gray-500">Deposit</p><p className="font-medium text-gray-900">{Number(quickReviewOrder?.depositAmount || 0).toLocaleString('vi-VN')}₫</p></div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Seller</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div><p className="text-gray-500">Name</p><p className="font-medium text-gray-900">{quickReviewSeller?.fullName || quickReviewOrder?.sellerName || '--'}</p></div>
                                        <div><p className="text-gray-500">Phone</p><p className="font-medium text-gray-900">{quickReviewSeller?.phone || '--'}</p></div>
                                        <div className="md:col-span-2"><p className="text-gray-500">Địa chỉ</p><p className="font-medium text-gray-900">{quickReviewSeller?.address || '--'}</p></div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Bike</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                        <div className="md:col-span-1">
                                            {(() => {
                                                const bikeImage = quickReviewBike?.imageUrls?.[0] || quickReviewBike?.imageUrl || null;
                                                if (!bikeImage) {
                                                    return <div className="w-full h-32 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500">No image</div>;
                                                }

                                                return (
                                                    <img
                                                        src={bikeImage}
                                                        alt={quickReviewBike?.title || quickReviewOrder?.bikeTitle || 'Bike'}
                                                        className="w-full h-32 rounded-lg object-cover border border-gray-200"
                                                    />
                                                );
                                            })()}
                                        </div>

                                        <div className="md:col-span-2 space-y-2 text-sm">
                                            <div><p className="text-gray-500">Bike</p><p className="font-medium text-gray-900">{quickReviewBike?.title || quickReviewOrder?.bikeTitle || '--'}</p></div>
                                            <div><p className="text-gray-500">Price</p><p className="font-medium text-gray-900">{Number(quickReviewBike?.price || quickReviewOrder?.totalAmount || 0).toLocaleString('vi-VN')}₫</p></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Your Review</h4>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Rating (1-5 stars)</p>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((starValue) => (
                                                <button
                                                    key={starValue}
                                                    type="button"
                                                    onClick={() => setQuickReviewRating(starValue)}
                                                    className="p-1 rounded hover:bg-gray-100"
                                                >
                                                    <Star
                                                        className={`w-6 h-6 ${starValue <= quickReviewRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-gray-700">Comment</label>
                                        <textarea
                                            value={quickReviewComment}
                                            onChange={(e) => setQuickReviewComment(e.target.value)}
                                            rows={4}
                                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Share your experience with this seller..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={handleCloseQuickReview}
                                disabled={quickReviewSubmitting}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitQuickReview}
                                disabled={quickReviewSubmitting || quickReviewLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-70"
                            >
                                {quickReviewSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
