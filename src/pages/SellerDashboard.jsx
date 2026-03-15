import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, ShoppingCart, Plus, LogOut } from 'lucide-react';

const menuItems = [
    { key: 'listings', label: 'My Listings', icon: <Bike className="w-5 h-5" /> },
    { key: 'sales', label: 'My Sales', icon: <ShoppingCart className="w-5 h-5" /> },
];

export default function SellerDashboard() {
    const [activeTab, setActiveTab] = useState('listings');
    const [user, setUser] = useState(null);
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

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-10 text-slate-300">
                <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between cursor-pointer" onClick={() => navigate('/')}>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        <span className="text-primary">Cycle</span>Trust
                    </h1>
                </div>

                {/* User Info */}
                {user && (
                    <div className="px-6 py-6 border-b border-slate-800 bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {user.fullName?.charAt(0) || 'S'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                                <p className="text-xs text-slate-400 truncate">Seller Account</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                                activeTab === item.key
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {activeTab === 'listings' ? 'My Listings' : 'Sales Orders'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {activeTab === 'listings' 
                                    ? 'Manage your bike listings, track their approval status.' 
                                    : 'Manage orders from buyers and update transaction status.'}
                            </p>
                        </div>
                        
                        {activeTab === 'listings' && (
                            <button 
                                onClick={() => navigate('/seller/create-listing')}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer text-sm shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Bike
                            </button>
                        )}
                    </div>

                    {/* Tab Content Placeholder */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm min-h-[500px]">
                        {activeTab === 'listings' ? (
                            <div className="flex flex-col items-center justify-center h-full pt-12 pb-20">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <Bike className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    No listings found
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
                                    You haven't listed any bikes yet. Click the "Add New Bike" button to create your first listing to sell.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full pt-12 pb-20">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingCart className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    No sales yet
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
                                    When someone orders your listed bike, it will appear here for you to process.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
