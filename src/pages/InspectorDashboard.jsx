import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, LogOut } from 'lucide-react';

const menuItems = [
    { key: 'inspections', label: 'Pending Inspections', icon: <ClipboardCheck className="w-5 h-5" /> }
];

export default function InspectorDashboard() {
    const [activeTab, setActiveTab] = useState('inspections');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Mock data for pending inspections
    const [pendingBikes, setPendingBikes] = useState([
        { id: 1, title: '2023 Trek Fuel EX 8 Gen 5', seller: 'John Doe', price: 2500, date: '2026-03-15', status: 'WAITING_INSPECTION' },
        { id: 2, title: 'Specialized Stumpjumper EVO Comp', seller: 'Alice Smith', price: 3200, date: '2026-03-14', status: 'WAITING_INSPECTION' }
    ]);

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
            <aside className="w-64 bg-teal-900 border-r border-teal-800 flex flex-col fixed h-full z-10 text-teal-100">
                <div className="px-6 py-6 border-b border-teal-800 flex items-center justify-between cursor-pointer" onClick={() => navigate('/')}>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        <span className="text-primary">Cycle</span>Trust
                    </h1>
                </div>

                {/* User Info */}
                {user && (
                    <div className="px-6 py-6 border-b border-teal-800 bg-teal-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold border border-teal-500/30">
                                {user.fullName?.charAt(0) || 'I'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                                <p className="text-xs text-teal-300/70 truncate">Inspector Account</p>
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
                                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/50'
                                    : 'text-teal-100 hover:bg-teal-800 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-teal-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 cursor-pointer"
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
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Pending Inspections
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Review and inspect bikes before they are fully listed on the marketplace.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {pendingBikes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <ClipboardCheck className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    No pending inspections
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
                                    All caught up! There are currently no bikes waiting for your review.
                                </p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bike Title</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingBikes.map((bike) => (
                                        <tr key={bike.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500">#{bike.id}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900">{bike.title}</p>
                                                <p className="text-xs text-emerald-600 font-medium">${bike.price}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{bike.seller}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(bike.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/inspector/form/${bike.id}`)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
                                                >
                                                    <ClipboardCheck className="w-4 h-4" />
                                                    Start Inspection
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
