import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy, Loader2 } from 'lucide-react';
import { confirmPayment, getOrderById } from '@/services/api';

export default function PaymentPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadOrder = async () => {
            try {
                setLoading(true);
                const data = await getOrderById(Number(orderId));
                setOrder(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load payment order information.');
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [orderId]);

    const amount = useMemo(() => Number(order?.depositAmount || 0), [order?.depositAmount]);
    const qrSrc = useMemo(() => {
        const qrAmount = Number.isFinite(amount) ? Math.round(amount) : 0;
        return `https://img.vietqr.io/image/MB-123456789-compact.png?amount=${qrAmount}&addInfo=ORDER${orderId}`;
    }, [amount, orderId]);

    const handleConfirmPayment = async () => {
        try {
            setSubmitting(true);
            setError('');
            await confirmPayment(Number(orderId));
            navigate(`/orders/${orderId}?payment=success`);
        } catch (err) {
            setError(err.response?.data?.message || 'Payment confirmation failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyTransferContent = async () => {
        try {
            await navigator.clipboard.writeText(`ORDER${orderId}`);
        } catch {
            // ignore clipboard errors for demo
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <button
                    onClick={() => navigate(`/orders/${orderId}`)}
                    className="flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors cursor-pointer font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to order
                </button>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
                    <h1 className="text-2xl font-bold text-gray-900">Deposit Payment</h1>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {order && (
                        <>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm space-y-2">
                                <h2 className="font-semibold text-gray-900 mb-2">Order Information</h2>
                                <p><span className="font-medium">Order ID:</span> #{order.orderId}</p>
                                <p><span className="font-medium">Bike Name:</span> {order.bikeTitle}</p>
                                <p><span className="font-medium">Seller Name:</span> {order.sellerName}</p>
                                <p><span className="font-medium">Amount:</span> {amount.toLocaleString('vi-VN')} VND</p>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                <h3 className="font-semibold text-gray-900 mb-3">VietQR (Demo)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                                    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 flex items-center justify-center">
                                        <img
                                            src={qrSrc}
                                            alt="VietQR payment"
                                            className="w-56 max-w-full rounded-lg border border-gray-100"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <p><span className="font-medium">Bank:</span> MB Bank</p>
                                        <p><span className="font-medium">Account:</span> 123456789</p>
                                        <p><span className="font-medium">Account Name:</span> CycleTrust</p>
                                        <p><span className="font-medium">Amount:</span> {amount.toLocaleString('vi-VN')}₫</p>
                                        <p className="flex items-center gap-2">
                                            <span className="font-medium">Content:</span> ORDER{orderId}
                                            <button
                                                type="button"
                                                onClick={handleCopyTransferContent}
                                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                                <Copy className="w-3 h-3" /> Copy
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleConfirmPayment}
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors disabled:opacity-70"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    I have paid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/orders/${orderId}`)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
