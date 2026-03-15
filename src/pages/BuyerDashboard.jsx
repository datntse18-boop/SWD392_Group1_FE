import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Store, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { requestSellerRole } from '@/services/api';

const menuItems = [
    { key: 'orders', label: 'My Orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { key: 'wishlist', label: 'Wishlist', icon: <Heart className="w-5 h-5" /> },
];

export default function BuyerDashboard() {
    const [activeTab, setActiveTab] = useState('orders');
    const [user, setUser] = useState(null);
    const [requestStatus, setRequestStatus] = useState({ loading: false, success: false, error: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
            setUser(JSON.parse(userDataString));
        }
    }, []);

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
                            {activeTab === 'orders' ? 'My Orders' : 'My Wishlist'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {activeTab === 'orders' ? 'Track your purchases and view order history.' : 'Bikes you have saved for later.'}
                        </p>
                    </div>

                    {/* Tab Content Placeholder */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            {activeTab === 'orders' ? (
                                <ShoppingBag className="w-8 h-8 text-gray-400" />
                            ) : (
                                <Heart className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            No {activeTab === 'orders' ? 'orders' : 'items in wishlist'} yet
                        </h3>
                        <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
                            {activeTab === 'orders' 
                                ? "When you buy a bike, your order details will appear here."
                                : "Save bikes you like to your wishlist to easily find them later."}
                        </p>
                        <button 
                            onClick={() => navigate('/')}
                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors cursor-pointer text-sm"
                        >
                            Browse Bikes
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
