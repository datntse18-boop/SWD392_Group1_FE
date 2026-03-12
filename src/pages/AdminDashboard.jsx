import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminListings from './AdminListings';
import AdminUsers from './AdminUsers';

const menuItems = [
    { key: 'listings', label: 'Quản lý tin đăng', icon: '🏍️' },
    { key: 'users', label: 'Quản lý người dùng', icon: '👥' },
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
        <div className="min-h-screen bg-gray-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-gray-800">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        <span className="text-indigo-500">Cycle</span>Trust
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
                </div>

                {/* Menu */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === item.key
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 cursor-pointer"
                    >
                        <span className="text-lg">🚪</span>
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {activeTab === 'listings' && <AdminListings />}
                {activeTab === 'users' && <AdminUsers />}
            </main>
        </div>
    );
}
