import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, LogOut, Loader2, CheckCircle2, Eye, UserCircle2, History, RotateCcw } from 'lucide-react';
import { getPendingInspectionRequests, getInspectionReports, getBikeById, getUserById, getInspectionHistoryByBike, requestReInspection } from '@/services/api';

const menuItems = [
    { key: 'profile', label: 'My Profile', icon: <UserCircle2 className="w-5 h-5" /> },
    { key: 'inspections', label: 'Pending Inspections', icon: <ClipboardCheck className="w-5 h-5" /> },
    { key: 'completed', label: 'Inspected Bikes', icon: <CheckCircle2 className="w-5 h-5" /> },
    { key: 'history', label: 'Inspection History', icon: <History className="w-5 h-5" /> },
];

export default function InspectorDashboard() {
    const [activeTab, setActiveTab] = useState('inspections');
    const [user, setUser] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [completedRequests, setCompletedRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [historyBikeId, setHistoryBikeId] = useState('');
    const [historyReports, setHistoryReports] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [reInspectLoading, setReInspectLoading] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const mapPendingRequest = (item) => ({
        reportId: item.reportId || item.inspectionReportId || item.id,
        bikeId: item.bikeId || item.bike?.bikeId,
        title: item.bikeTitle || item.title || item.bike?.title || 'Untitled Bike',
        seller: item.sellerName || item.seller?.fullName || item.bike?.sellerName || 'Unknown Seller',
        price: item.price || item.bike?.price || 0,
        date: item.requestedAt || item.createdAt || item.inspectedAt || item.inspectionDate || item.date,
    });

    const mapInspectionReport = (item) => ({
        reportId: item.reportId || item.inspectionReportId || item.id,
        bikeId: item.bikeId || item.bike?.bikeId,
        title: item.bikeTitle || item.title || item.bike?.title || 'Untitled Bike',
        seller: item.sellerName || item.seller?.fullName || item.bike?.sellerName || 'Unknown Seller',
        status: (item.inspectionStatus || item.status || '').toUpperCase(),
        date: item.inspectedAt || item.updatedAt || item.createdAt,
    });

    const fetchPendingRequests = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await getPendingInspectionRequests();
            const mapped = (Array.isArray(data) ? data : []).map(mapPendingRequest);

            const enriched = await Promise.all(
                mapped.map(async (item) => {
                    if (item.seller && item.seller !== 'Unknown Seller') {
                        return item;
                    }

                    if (!item.bikeId) {
                        return item;
                    }

                    try {
                        const bike = await getBikeById(item.bikeId);
                        return {
                            ...item,
                            seller: bike?.sellerName || bike?.seller?.fullName || item.seller,
                            date: item.date || bike?.createdAt || bike?.updatedAt || null,
                        };
                    } catch {
                        return item;
                    }
                })
            );

            setPendingRequests(enriched);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load pending inspections.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCompletedRequests = async (currentUser) => {
        try {
            const data = await getInspectionReports();
            const mapped = (Array.isArray(data) ? data : []).map(mapInspectionReport);
            const inspectorId = Number(currentUser?.userId);

            const completed = mapped.filter(
                (item) =>
                    Number(item.reportId) > 0 &&
                    Number(item.bikeId) > 0 &&
                    (item.status === 'APPROVED' || item.status === 'REJECTED')
            );

            if (Number.isFinite(inspectorId) && inspectorId > 0) {
                const ownReports = (Array.isArray(data) ? data : []).filter(
                    (item) => Number(item.inspectorId || item.inspector?.userId) === inspectorId
                );

                const ownMapped = ownReports
                    .map(mapInspectionReport)
                    .filter((item) => item.status === 'APPROVED' || item.status === 'REJECTED');

                const enrichedOwnMapped = await Promise.all(
                    ownMapped.map(async (item) => {
                        if (item.seller && item.seller !== 'Unknown Seller') {
                            return item;
                        }

                        if (!item.bikeId) {
                            return item;
                        }

                        try {
                            const bike = await getBikeById(item.bikeId);
                            return {
                                ...item,
                                seller: bike?.sellerName || bike?.seller?.fullName || item.seller,
                            };
                        } catch {
                            return item;
                        }
                    })
                );

                setCompletedRequests(enrichedOwnMapped);
                return;
            }

            const enrichedCompleted = await Promise.all(
                completed.map(async (item) => {
                    if (item.seller && item.seller !== 'Unknown Seller') {
                        return item;
                    }

                    if (!item.bikeId) {
                        return item;
                    }

                    try {
                        const bike = await getBikeById(item.bikeId);
                        return {
                            ...item,
                            seller: bike?.sellerName || bike?.seller?.fullName || item.seller,
                        };
                    } catch {
                        return item;
                    }
                })
            );

            setCompletedRequests(enrichedCompleted);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load inspected bikes.');
        }
    };

    // FR-11: Fetch inspection history by bike ID
    const fetchInspectionHistory = async (bikeId) => {
        if (!bikeId) return;
        setHistoryLoading(true);
        setError('');
        try {
            const data = await getInspectionHistoryByBike(Number(bikeId));
            setHistoryReports(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load inspection history.');
            setHistoryReports([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    // FR-12: Request re-inspection
    const handleReInspection = async (reportId) => {
        setReInspectLoading(reportId);
        setSuccessMessage('');
        setError('');
        try {
            const newReport = await requestReInspection(reportId);
            // Navigate directly to the evaluation form so the inspector can proceed
            navigate(`/inspector/form/${newReport.reportId || newReport.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request re-inspection.');
            setReInspectLoading(null);
        }
    };

    useEffect(() => {
        const initUser = async () => {
            const userDataString = localStorage.getItem('user');
            let parsedUser = null;

            if (userDataString) {
                parsedUser = JSON.parse(userDataString);

                try {
                    const fullUser = await getUserById(parsedUser.userId);
                    const mergedUser = { ...parsedUser, ...fullUser };
                    setUser(mergedUser);
                    localStorage.setItem('user', JSON.stringify(mergedUser));
                    parsedUser = mergedUser;
                } catch {
                    setUser(parsedUser);
                }
            }

            fetchPendingRequests();
            fetchCompletedRequests(parsedUser);
        };

        initUser();
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
                            onClick={() => { setActiveTab(item.key); setError(''); setSuccessMessage(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === item.key
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
                            {activeTab === 'inspections' ? 'Pending Inspections' : activeTab === 'completed' ? 'Inspected Bikes' : activeTab === 'history' ? 'Inspection History' : 'My Profile'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {activeTab === 'inspections'
                                ? 'Review and inspect bikes before they are fully listed on the marketplace.'
                                : activeTab === 'completed'
                                    ? 'Bikes that you already inspected with final decision.'
                                    : activeTab === 'history'
                                        ? 'View all past inspection reports for a specific bike.'
                                        : 'View your personal account information.'}
                        </p>
                    </div>

                    {/* Content */}
                    {successMessage && (
                        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            {successMessage}
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
                                <p className="text-sm text-gray-500">Loading pending inspections...</p>
                            </div>
                        ) : error ? (
                            <div className="m-6 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                                {error}
                            </div>
                        ) : activeTab === 'inspections' && pendingRequests.length === 0 ? (
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
                        ) : activeTab === 'inspections' ? (
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
                                    {pendingRequests.map((request) => (
                                        <tr key={request.reportId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500">#{request.bikeId}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900">{request.title}</p>
                                                <p className="text-xs text-emerald-600 font-medium">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.price)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{request.seller}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {request.date ? new Date(request.date).toLocaleDateString() : '--'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/inspector/form/${request.reportId}`, { state: { request } })}
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
                        ) : activeTab === 'completed' && completedRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    No inspected bikes yet
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
                                    Completed inspections will appear here after you submit a result.
                                </p>
                            </div>
                        ) : activeTab === 'completed' ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bike Title</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inspected Date</th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {completedRequests.map((request) => (
                                        <tr key={request.reportId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500">#{request.bikeId}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{request.seller || 'Unknown Seller'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${request.status === 'APPROVED'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-red-50 text-red-700 border border-red-200'
                                                    }`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {request.date ? new Date(request.date).toLocaleDateString() : '--'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/bike/${request.bikeId}`)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors cursor-pointer border border-gray-200"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Bike
                                                </button>
                                                {request.status === 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleReInspection(request.reportId)}
                                                        disabled={reInspectLoading === request.reportId}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-60 ml-2"
                                                    >
                                                        {reInspectLoading === request.reportId ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                                        Re-Inspect
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : activeTab === 'history' ? (
                            <div className="p-6">
                                {/* Search by Bike ID */}
                                <div className="flex items-end gap-4 mb-6">
                                    <div className="flex-1">
                                        <label htmlFor="historyBikeId" className="block text-sm font-medium text-gray-700 mb-1">Bike ID</label>
                                        <input
                                            id="historyBikeId"
                                            type="number"
                                            placeholder="Enter Bike ID to view history..."
                                            value={historyBikeId}
                                            onChange={(e) => setHistoryBikeId(e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={() => fetchInspectionHistory(historyBikeId)}
                                        disabled={!historyBikeId || historyLoading}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
                                    >
                                        {historyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <History className="w-4 h-4" />}
                                        Search
                                    </button>
                                </div>

                                {historyLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
                                        <p className="text-sm text-gray-500">Loading inspection history...</p>
                                    </div>
                                ) : historyReports.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <History className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No inspection history</h3>
                                        <p className="text-gray-500 text-sm text-center max-w-sm">
                                            {historyBikeId ? 'No inspection reports found for this bike.' : 'Enter a Bike ID above to view its inspection history.'}
                                        </p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Report ID</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bike</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inspector</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Comment</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inspected Date</th>
                                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {historyReports.map((report) => (
                                                <tr key={report.reportId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-500">#{report.reportId}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.bikeTitle || `Bike #${report.bikeId}`}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{report.inspectorName || '--'}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${report.inspectionStatus === 'APPROVED'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : report.inspectionStatus === 'REJECTED'
                                                                ? 'bg-red-50 text-red-700 border border-red-200'
                                                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                            }`}>
                                                            {report.inspectionStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{report.overallComment || '--'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {report.inspectedAt ? new Date(report.inspectedAt).toLocaleDateString() : '--'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => navigate(`/bike/${report.bikeId}`)}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors cursor-pointer border border-gray-200"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View Bike
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ) : (
                            <div className="m-6 max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><p className="text-gray-500">Full Name</p><p className="font-medium text-gray-900">{user?.fullName || '--'}</p></div>
                                    <div><p className="text-gray-500">Email</p><p className="font-medium text-gray-900">{user?.email || '--'}</p></div>
                                    <div><p className="text-gray-500">Phone</p><p className="font-medium text-gray-900">{user?.phone || '--'}</p></div>
                                    <div><p className="text-gray-500">Address</p><p className="font-medium text-gray-900">{user?.address || '--'}</p></div>
                                    <div><p className="text-gray-500">Role</p><p className="font-medium text-gray-900">{user?.roleName || 'INSPECTOR'}</p></div>
                                    <div><p className="text-gray-500">Status</p><p className="font-medium text-gray-900">{user?.status || 'ACTIVE'}</p></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
