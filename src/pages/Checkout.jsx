import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { createOrder, getBikeById } from '@/services/api';

export default function Checkout() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBikeDetails = async () => {
            try {
                const data = await getBikeById(id);
                setBike(data);
            } catch (err) {
                console.error("Error fetching bike for checkout:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBikeDetails();
    }, [id]);

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setCreatingOrder(true);
        setError('');

        const rawUser = localStorage.getItem('user');
        if (!rawUser) {
            navigate('/login');
            return;
        }

        const currentUser = JSON.parse(rawUser);

        try {
            const order = await createOrder({
                bikeId: Number(bike.bikeId),
                buyerId: Number(currentUser.userId),
                sellerId: Number(bike.sellerId),
                totalAmount: Number(bike.price || 0),
                depositAmount: Number(depositAmount),
            });

            navigate(`/orders/${order.orderId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create order.');
        } finally {
            setCreatingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!bike) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <h2 className="text-xl font-bold mb-4">Bike not found</h2>
                <button onClick={() => navigate('/')} className="text-primary hover:underline cursor-pointer">
                    Return to Homepage
                </button>
            </div>
        );
    }

    const depositAmount = bike.price * 0.1; // 10% deposit
    const remainingAmount = bike.price - depositAmount;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors cursor-pointer font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Order</h1>
                    <p className="text-gray-500 mt-2">Review order information before paying 10% deposit.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleCreateOrder} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Confirm Order
                            </h2>

                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700 space-y-2">
                                <p><span className="font-semibold">Bike:</span> {bike.title}</p>
                                <p><span className="font-semibold">Seller:</span> {bike.sellerName || 'Unknown Seller'}</p>
                                <p><span className="font-semibold">Total:</span> {bike.price?.toLocaleString('vi-VN')}₫</p>
                                <p><span className="font-semibold">Deposit (10%):</span> {depositAmount.toLocaleString('vi-VN')}₫</p>
                            </div>

                            {error && (
                                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={creatingOrder}
                                className="w-full mt-8 bg-black hover:bg-gray-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {creatingOrder ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating Order...
                                    </>
                                ) : (
                                    'Continue to Order Detail'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Order Summary</h3>
                            
                            <div className="flex gap-4 mb-6">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                    {bike.imageUrls && bike.imageUrls[0] ? (
                                        <img src={bike.imageUrls[0]} alt="Bike" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{bike.title}</h4>
                                    <p className="text-gray-500 text-xs mt-1">{bike.condition}</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Total Price</span>
                                    <span className="font-medium text-gray-900">{bike.price?.toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Inspection Fee</span>
                                    <span className="font-medium text-gray-900">Included</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between font-bold text-gray-900 text-lg">
                                    <span>Deposit Due Now (10%)</span>
                                    <span className="text-primary">{depositAmount.toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span>Remaining Balance</span>
                                    <span>{remainingAmount.toLocaleString('vi-VN')}₫</span>
                                </div>
                            </div>

                            <div className="mt-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                <div className="flex items-start gap-2.5">
                                    <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-800 leading-relaxed">
                                        Your deposit secures the bike. The remaining balance is paid directly to the seller after successful inspection and handover.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
