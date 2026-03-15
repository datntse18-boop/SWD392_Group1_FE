import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminListings from './AdminListings';
import AdminUsers from './AdminUsers';
import { Bike } from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
    { key: 'listings', label: 'Ad posting management', icon: '🏍️' },
    { key: 'users', label: 'User management', icon: '👥' },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('listings');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header giống Homepage */}
            <header className="bg-gradient-to-r from-[#FF7A2F] to-[#D94E0A] sticky top-0 z-40 shadow-sm">
                <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        type="button"
                        className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 text-left"
                        onClick={() => navigate('/')}
                    >
                        <div className="bg-white p-1.5 rounded-lg flex items-center justify-center">
                            <Bike className="text-[#F56218] w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-white tracking-tight">
                                CycleTrust
                            </span>
                            <span className="text-xs text-white/80">
                                Admin Dashboard
                            </span>
                        </div>
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-sm text-white/80">
                            Hello Admin
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleLogout}
                            className="bg-white/10 border-white/40 text-white hover:bg-white/20 rounded-full px-4"
                        >
                            Log out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Layout chính */}
            <main className="container mx-auto px-4 lg:px-8 py-6 flex gap-6">
                {/* Sidebar */}
                <aside className="w-64 shrink-0 hidden md:flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Navigation
                        </p>
                    </div>
                    <nav className="flex-1 px-3 py-3 space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setActiveTab(item.key)}
                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === item.key
                                    ? 'bg-orange-50 text-[#F56218] shadow-sm border border-orange-200'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="truncate">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <section className="flex-1 space-y-4">
                    {/* Tabs cho mobile */}
                    <div className="md:hidden flex gap-2 mb-2 overflow-x-auto no-scrollbar">
                        {menuItems.map((item) => (
                            <Button
                                key={item.key}
                                size="sm"
                                variant={activeTab === item.key ? 'default' : 'outline'}
                                onClick={() => setActiveTab(item.key)}
                                className="rounded-full whitespace-nowrap"
                            >
                                <span className="mr-1">{item.icon}</span>
                                {item.label}
                            </Button>
                        ))}
                    </div>

                    {activeTab === 'listings' && <AdminListings />}
                    {activeTab === 'users' && <AdminUsers />}
                </section>
            </main>
        </div>
    );
}
