import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, PackageCheck } from 'lucide-react';
import { confirmOrderReceived, getOrderById } from '@/services/api';

export default function OrderDetail() {
    const { orderId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmingReceived, setConfirmingReceived] = useState(false);
    const [error, setError] = useState('');

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
    const canDeposit = status === 'PENDING';
    const canConfirmReceived = status === 'DEPOSITED';

    const handleConfirmReceived = async () => {
        try {
            setConfirmingReceived(true);
            await confirmOrderReceived(Number(orderId));
            await loadOrder();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to confirm received bike.');
        } finally {
            setConfirmingReceived(false);
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
                                onClick={handleConfirmReceived}
                                disabled={confirmingReceived}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors disabled:opacity-70"
                            >
                                {confirmingReceived ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                                Đã nhận được hàng
                            </button>
                        )}

                        {status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Order Completed
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
