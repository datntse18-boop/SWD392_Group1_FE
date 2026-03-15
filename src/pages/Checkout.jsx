import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, CreditCard, CheckCircle } from 'lucide-react';
import { getBikeById } from '@/services/api';

export default function Checkout() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

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

    const handleCheckout = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            // Mock payment processing
            await new Promise(res => setTimeout(res, 2000));
            alert('Deposit successful! Order placed.');
            navigate('/dashboard'); // Go back to buyer dashboard
        } catch (err) {
            alert('Payment failed.');
        } finally {
            setProcessing(false);
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
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-500 mt-2">Secure your bike with a deposit.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleCheckout} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Payment Details
                            </h2>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Name on Card</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="John Doe"
                                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Card Number</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full h-11 pl-4 pr-10 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                                        />
                                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="MM/YY"
                                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">CVC</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="123"
                                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full mt-8 bg-black hover:bg-gray-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Pay Deposit ({depositAmount.toLocaleString('vi-VN')}₫)
                                    </>
                                )}
                            </button>

                            <p className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-500 text-center">
                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                Payments are secure and encrypted.
                            </p>
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
