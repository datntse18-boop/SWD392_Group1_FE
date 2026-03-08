import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Heart,
    Bell,
    MessageCircle,
    User,
    ChevronDown,
    Menu,
    MapPin,
    Bike,
    Settings,
    Map as MapIcon,
    Zap,
    Smile,
    PenTool,
    Shirt,
    Shield,
    Wrench,
    Navigation
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// Bicycle Categories 
const categories = [
    { id: 1, name: 'Mountain Bikes', icon: Bike, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    { id: 2, name: 'Road Bikes', icon: Navigation, color: 'text-green-500', bgColor: 'bg-green-100' },
    { id: 3, name: 'City & Hybrid', icon: MapIcon, color: 'text-purple-500', bgColor: 'bg-purple-100' },
    { id: 4, name: 'Electric Bikes', icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    { id: 5, name: 'Kids Bikes', icon: Smile, color: 'text-pink-500', bgColor: 'bg-pink-100' },
    { id: 6, name: 'Frames & Parts', icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-100' },
    { id: 7, name: 'Apparel', icon: Shirt, color: 'text-indigo-500', bgColor: 'bg-indigo-100' },
    { id: 8, name: 'Accessories', icon: Shield, color: 'text-teal-500', bgColor: 'bg-teal-100' },
    { id: 9, name: 'Tools', icon: Wrench, color: 'text-orange-500', bgColor: 'bg-orange-100' },
    { id: 10, name: 'Other', icon: PenTool, color: 'text-red-500', bgColor: 'bg-red-100' },
];

import { getBikes } from '@/services/api';

export default function Homepage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchBikes = async (filters = {}) => {
        try {
            setLoading(true);
            const data = await getBikes(filters);
            setBikes(data);
        } catch (error) {
            console.error('Error fetching bikes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }

        // Initial fetch
        fetchBikes();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBikes({
            searchTitle: searchQuery,
            categoryId: selectedCategory
        });
    };

    const handleCategoryClick = (categoryId) => {
        // Toggle selection
        const newCategory = selectedCategory === categoryId ? null : categoryId;
        setSelectedCategory(newCategory);

        // Fetch with new category and current search text
        fetchBikes({
            searchTitle: searchQuery,
            categoryId: newCategory
        });
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* ====== HEADER ====== */}
            <header className="bg-gradient-to-r from-[#FF7A2F] to-[#D94E0A] sticky top-0 z-50">
                <div className="container mx-auto px-4 lg:px-8">
                    {/* Top Row: Logo, Navigation, User Actions */}
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Hamburger & Logo */}
                        <div className="flex items-center gap-4">
                            <button className="lg:hidden p-2 text-white hover:bg-white/20 rounded-full transition-colors">
                                <Menu className="w-6 h-6" />
                            </button>
                            <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => navigate('/')}
                            >
                                <div className="bg-white p-1.5 rounded-lg flex items-center justify-center">
                                    <Bike className="text-[#F56218] w-6 h-6" />
                                </div>
                                <span className="text-xl font-bold text-white hidden sm:block tracking-tight">CycleTrust</span>
                            </div>

                            {/* Desktop Nav Links */}
                            <div className="hidden lg:flex items-center gap-6 ml-8 text-white/90 font-medium text-sm">
                                <a href="#" className="hover:text-white transition-colors">Marketplace</a>
                                <a href="#" className="hover:text-white transition-colors">Bikes</a>
                                <a href="#" className="hover:text-white transition-colors">Accessories</a>
                                <a href="#" className="hover:text-white transition-colors">Services</a>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button className="hidden sm:flex items-center gap-1.5 p-2 text-white hover:bg-white/20 rounded-full transition-colors">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="hidden sm:flex items-center gap-1.5 p-2 text-white hover:bg-white/20 rounded-full transition-colors">
                                <Bell className="w-5 h-5" />
                            </button>
                            <button className="hidden lg:flex items-center gap-1.5 p-2 text-white hover:bg-white/20 rounded-full transition-colors">
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Chat</span>
                            </button>

                            <div className="h-6 w-px bg-white/30 hidden lg:block mx-1"></div>

                            {user ? (
                                <div className="flex items-center gap-4 relative group cursor-pointer">
                                    <div className="flex items-center gap-2 p-2 px-3 sm:px-4 text-white hover:bg-white/20 rounded-full transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.fullName || user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium hidden sm:block truncate max-w-[120px]">
                                            {user.fullName || user.username || 'User'}
                                        </span>
                                    </div>

                                    {/* Dropdown menu */}
                                    <div className="absolute top-full right-0 pt-2 hidden group-hover:block z-50">
                                        <div className="w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                                            <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                                <p className="text-sm font-semibold text-gray-800 truncate">
                                                    {user.fullName || user.username || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                                Profile Management
                                            </button>
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                                My Listings
                                            </button>
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleLoginClick}
                                    className="flex items-center gap-2 p-2 px-3 sm:px-4 text-white hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                    <span className="text-sm font-medium hidden sm:block">Sign In</span>
                                </button>
                            )}

                            <Button
                                className="bg-white text-[#F56218] hover:bg-gray-100 border-0 rounded-full px-4 sm:px-6 h-10 font-bold flex items-center gap-2 shadow-sm"
                            >
                                <span className="hidden sm:block">POST AD</span>
                                <span className="sm:hidden">+</span>
                            </Button>
                        </div>
                    </div>

                    {/* Bottom Row: Search Bar */}
                    <div className="pb-4 pt-1">
                        <form onSubmit={handleSearch} className="flex max-w-4xl mx-auto gap-2">
                            <div className="relative flex-1 flex group shadow-sm rounded-lg overflow-hidden bg-white">
                                <div className="hidden md:flex items-center gap-2 px-4 py-3 bg-white border-r border-gray-200 text-sm font-medium hover:bg-gray-50 cursor-pointer min-w-[140px] whitespace-nowrap text-gray-700">
                                    <span>Categories</span>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex-1 flex relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="Search for bicycles, parts, and accessories..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 h-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none shadow-none text-base bg-white text-gray-900"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="bg-gray-900 hover:bg-gray-800 text-white h-12 px-6 rounded-lg font-medium shadow-sm border-0"
                            >
                                Search
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            {/* ====== MAIN CONTENT ====== */}
            <main className="container mx-auto px-4 lg:px-8 py-8 w-full max-w-6xl">

                {/* Banner Strip */}
                <div className="w-full rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100 p-6 mb-8 flex items-center justify-between border border-orange-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Bike className="w-6 h-6 text-[#F56218]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Discover CycleTrust</h2>
                            <p className="text-gray-600 text-sm mt-1">The leading trusted marketplace for new and used bicycles</p>
                        </div>
                    </div>
                    <Button variant="outline" className="hidden sm:flex bg-white hover:bg-gray-50 text-[#F56218] border-orange-200">
                        Learn More
                    </Button>
                </div>

                {/* Categories Grid */}
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Explore Categories</h2>
                    </div>

                    <Card className="border-0 shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-0">
                            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 border-t border-l border-gray-100">
                                {categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => handleCategoryClick(cat.id)}
                                        className={`flex flex-col items-center justify-center p-4 border-r border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group h-auto aspect-square sm:aspect-auto sm:h-32 text-center ${selectedCategory === cat.id ? 'bg-orange-50 border-orange-200 shadow-inner' : ''}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 ${cat.bgColor}`}>
                                            <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                        </div>
                                        <span className={`text-xs font-medium leading-tight group-hover:text-[#F56218] transition-colors ${selectedCategory === cat.id ? 'text-[#F56218] font-bold' : 'text-gray-700'}`}>
                                            {cat.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Listings */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {loading ? 'Loading...' : (bikes.length > 0 ? 'Latest Listings' : 'No bikes found')}
                    </h2>

                    {!loading && bikes.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {bikes.map((bike) => (
                                <Card key={bike.bikeId} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group border-0 shadow-sm">
                                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                        {bike.imageUrls && bike.imageUrls.length > 0 ? (
                                            <img src={bike.imageUrls[0]} alt={bike.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-300">
                                                <Bike className="w-16 h-16 opacity-50" />
                                            </div>
                                        )}
                                        {bike.bikeCondition && (
                                            <div className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-gray-700 shadow-sm">
                                                {bike.bikeCondition}
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-3">
                                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-[#F56218] transition-colors" title={bike.title}>
                                            {bike.title}
                                        </h3>
                                        <div className="text-[#D94E0A] font-bold text-base mb-2">
                                            {bike.price == 0 ? 'Contact for price' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bike.price)}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 gap-1 mt-auto">
                                            <User className="w-3 h-3" />
                                            <span className="truncate">{bike.sellerName}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 flex justify-center">
                        <Button variant="outline" className="w-full sm:w-auto px-8 py-6 rounded-xl border-orange-200 text-[#F56218] hover:bg-orange-50 font-medium">
                            Load More Listings
                        </Button>
                    </div>
                </section>

            </main>

            {/* Simple Footer */}
            <footer className="bg-white border-t border-gray-200 py-8 mt-12">
                <div className="container mx-auto px-4 lg:px-8 text-center text-gray-500 text-sm">
                    <p>© 2026 CycleTrust. Trusted bicycle marketplace.</p>
                </div>
            </footer>
        </div>
    );
}
