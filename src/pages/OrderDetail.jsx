import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, PackageCheck, Star } from 'lucide-react';
import { confirmOrderReceived, createReview, getBikeById, getOrderById, getUserById } from '@/services/api';

export default function OrderDetail() {
    const { orderId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmingReceived, setConfirmingReceived] = useState(false);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewSeller, setReviewSeller] = useState(null);
    const [reviewBike, setReviewBike] = useState(null);
    const [reviewMetaLoading, setReviewMetaLoading] = useState(false);

    const isPaymentSuccess = searchParams.get('payment') === 'success';

    const loadOrder = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getOrderById(Number(orderId));
            setOrder(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load order detail.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const status = useMemo(() => String(order?.status || '').toUpperCase(), [order?.status]);
    const currentUserId = useMemo(() => {
        const rawUser = localStorage.getItem('user');
        if (!rawUser) return null;

        try {
            const parsedUser = JSON.parse(rawUser);
            return parsedUser?.userId ? Number(parsedUser.userId) : null;
        } catch {
            return null;
        }
    }, []);

    const canDeposit = status === 'PENDING';
    const canConfirmReceived = status === 'DEPOSITED';

    const loadReviewContext = async (targetOrder) => {
        if (!targetOrder) return;

        try {
            setReviewMetaLoading(true);
            const [sellerData, bikeData] = await Promise.all([
                getUserById(Number(targetOrder.sellerId)),
                targetOrder.bikeId ? getBikeById(Number(targetOrder.bikeId)) : Promise.resolve(null),
            ]);

            setReviewSeller(sellerData || null);
            setReviewBike(bikeData || null);
        } catch {
            setReviewSeller(null);
            setReviewBike(null);
        } finally {
            setReviewMetaLoading(false);
        }
    };

    const handleConfirmReceived = async () => {
        try {
            setConfirmingReceived(true);
            setError('');
            await confirmOrderReceived(Number(orderId));
            await loadOrder();
            setShowConfirmModal(false);
            await loadReviewContext(order);
            setShowReviewModal(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to confirm received bike.');
        } finally {
            setConfirmingReceived(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!currentUserId) {
            setError('Unable to detect current buyer. Please login again.');
            return;
        }

        if (rating < 1 || rating > 5) {
            setError('Rating must be between 1 and 5 stars.');
            return;
        }

        try {
            setReviewSubmitting(true);
            setError('');
            await createReview({
                orderId: Number(orderId),
                buyerId: currentUserId,
                sellerId: Number(order.sellerId),
                rating,
                comment,
            });

            setShowReviewModal(false);
            setSuccessMessage('Review submitted successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <p className="text-gray-700 mb-3">Order not found.</p>
                <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">
                    Back to dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors cursor-pointer font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to dashboard
                </button>

                {isPaymentSuccess && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 text-sm font-medium">
                        Payment Successful. Order Status: Deposited.
                    </div>
                )}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm font-medium">
                        {successMessage}
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Detail</h1>
                        <p className="text-sm text-gray-500 mt-1">Track deposit and delivery progress.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-gray-500">Order ID</p>
                            <p className="font-semibold text-gray-900">#{order.orderId}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-gray-500">Status</p>
                            <p className="font-semibold text-gray-900">{order.status}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-gray-500">Bike</p>
                            <p className="font-semibold text-gray-900">{order.bikeTitle}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-gray-500">Seller</p>
                            <p className="font-semibold text-gray-900">{order.sellerName}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-gray-500">Total Amount</p>
                            <p className="font-semibold text-gray-900">{Number(order.totalAmount || 0).toLocaleString('vi-VN')}₫</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-gray-500">Deposit (10%)</p>
                            <p className="font-semibold text-gray-900">{Number(order.depositAmount || 0).toLocaleString('vi-VN')}₫</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                        {canDeposit && (
                            <button
                                onClick={() => navigate(`/payment/${order.orderId}`)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
                            >
                                <CreditCard className="w-4 h-4" />
                                Deposit
                            </button>
                        )}

                        {canConfirmReceived && (
                            <button
                                onClick={() => setShowConfirmModal(true)}
                                disabled={confirmingReceived}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors disabled:opacity-70"
                            >
                                <PackageCheck className="w-4 h-4" />
                                I have received the order.
                            </button>
                        )}

                        {status === 'RECEIVED' && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Received ✔
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Confirm Received</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            Are you sure you have received the bicycle?
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                disabled={confirmingReceived}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReceived}
                                disabled={confirmingReceived}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:opacity-70"
                            >
                                {confirmingReceived ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReviewModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white border border-gray-200 p-6 max-h-[85vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900">Review Seller</h3>

                        {reviewMetaLoading ? (
                            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading review details...
                            </div>
                        ) : (
                            <div className="mt-5 space-y-4">
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div><p className="text-gray-500">Order</p><p className="font-medium text-gray-900">#{order?.orderId || '--'}</p></div>
                                    <div><p className="text-gray-500">Order Status</p><p className="font-medium text-gray-900">{order?.status || '--'}</p></div>
                                    <div><p className="text-gray-500">Total Amount</p><p className="font-medium text-gray-900">{Number(order?.totalAmount || 0).toLocaleString('vi-VN')}₫</p></div>
                                    <div><p className="text-gray-500">Deposit</p><p className="font-medium text-gray-900">{Number(order?.depositAmount || 0).toLocaleString('vi-VN')}₫</p></div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Seller</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div><p className="text-gray-500">Name</p><p className="font-medium text-gray-900">{reviewSeller?.fullName || order?.sellerName || '--'}</p></div>
                                        <div><p className="text-gray-500">Phone</p><p className="font-medium text-gray-900">{reviewSeller?.phone || '--'}</p></div>
                                        <div className="md:col-span-2"><p className="text-gray-500">Địa chỉ</p><p className="font-medium text-gray-900">{reviewSeller?.address || '--'}</p></div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Bike</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                        <div className="md:col-span-1">
                                            {(() => {
                                                const bikeImage = reviewBike?.imageUrls?.[0] || reviewBike?.imageUrl || null;
                                                if (!bikeImage) {
                                                    return <div className="w-full h-32 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500">No image</div>;
                                                }

                                                return (
                                                    <img
                                                        src={bikeImage}
                                                        alt={reviewBike?.title || order?.bikeTitle || 'Bike'}
                                                        className="w-full h-32 rounded-lg object-cover border border-gray-200"
                                                    />
                                                );
                                            })()}
                                        </div>

                                        <div className="md:col-span-2 space-y-2 text-sm">
                                            <div><p className="text-gray-500">Bike</p><p className="font-medium text-gray-900">{reviewBike?.title || order?.bikeTitle || '--'}</p></div>
                                            <div><p className="text-gray-500">Price</p><p className="font-medium text-gray-900">{Number(reviewBike?.price || order?.totalAmount || 0).toLocaleString('vi-VN')}₫</p></div>
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
                                                    onClick={() => setRating(starValue)}
                                                    className="p-1 rounded hover:bg-gray-100"
                                                >
                                                    <Star
                                                        className={`w-6 h-6 ${starValue <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-gray-700">Comment</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
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
                                onClick={() => setShowReviewModal(false)}
                                disabled={reviewSubmitting}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={reviewSubmitting}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-70"
                            >
                                {reviewSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
