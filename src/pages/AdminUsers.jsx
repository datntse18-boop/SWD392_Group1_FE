import { useState, useEffect } from 'react';
import { getAllUsers } from '@/services/api';
import { banUser, unbanUser, updateUserRole } from '@/services/adminApi';

const statusColors = {
    ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
    BANNED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBan = async (id) => {
        if (!window.confirm('Are you sure you want to BAN this user?')) return;
        try {
            setActionLoading(id);
            await banUser(id);
            await fetchUsers();
        } catch (err) {
            alert('Error banning user: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnban = async (id) => {
        if (!window.confirm('Are you sure you want to UNBAN this user?')) return;
        try {
            setActionLoading(id);
            await unbanUser(id);
            await fetchUsers();
        } catch (err) {
            alert('Error unbanning user: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveSeller = async (id) => {
        if (!window.confirm('Are you sure you want to approve this user as a SELLER?')) return;
        try {
            setActionLoading(id);
            // Assuming roleId 3 is SELLER, you may need to adjust if different
            await updateUserRole(id, 3);
            await fetchUsers();
        } catch (err) {
            alert('Error approving seller: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = filter === 'ALL' ? users : users.filter(u => {
        if (filter === 'PENDING_SELLER') return u.pendingSellerUpgrade === true;
        return u.status === filter;
    });

    const filters = ['ALL', 'ACTIVE', 'BANNED', 'PENDING_SELLER'];

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">User Management</h2>
                    <p className="text-gray-400 mt-1">Ban or unban user accounts</p>
                </div>
                <div className="text-sm text-gray-400">
                    Total: <span className="text-white font-semibold">{filteredUsers.length}</span> users
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {filters.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${filter === f
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        {f === 'PENDING_SELLER' ? 'Requests Seller' : (f === 'ALL' ? 'All' : f)}
                        {f !== 'ALL' && (
                            <span className="ml-1.5 text-xs opacity-70">
                                ({f === 'PENDING_SELLER' 
                                    ? users.filter(u => u.pendingSellerUpgrade).length 
                                    : users.filter(u => u.status === f).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-lg">No users found</p>
                </div>
            ) : (
                <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700/50">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created At</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/30">
                            {filteredUsers.map((user) => (
                                <tr key={user.userId} className="hover:bg-gray-700/20 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-300">#{user.userId}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-white">{user.fullName}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{user.phone || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                            {user.roleName || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[user.status] || 'bg-gray-600 text-gray-300'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {user.roleName !== 'ADMIN' && (
                                            <div className="flex flex-col gap-2 items-end">
                                                <div className="flex gap-2">
                                                    {user.status === 'ACTIVE' ? (
                                                        <button
                                                            onClick={() => handleBan(user.userId)}
                                                            disabled={actionLoading === user.userId}
                                                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                                        >
                                                            {actionLoading === user.userId ? '...' : '🔒 Ban'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUnban(user.userId)}
                                                            disabled={actionLoading === user.userId}
                                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                                        >
                                                            {actionLoading === user.userId ? '...' : '🔓 Unban'}
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                {user.pendingSellerUpgrade && user.roleName === 'BUYER' && (
                                                    <button
                                                        onClick={() => handleApproveSeller(user.userId)}
                                                        disabled={actionLoading === user.userId}
                                                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer w-fit"
                                                        title="Approve Seller Request"
                                                    >
                                                        {actionLoading === user.userId ? '...' : '⭐ Approve Seller'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
