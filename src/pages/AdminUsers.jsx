import { useState, useEffect } from 'react';
import { getAllUsers } from '@/services/api';
import { banUser, unbanUser, updateUserRole } from '@/services/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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
        if (!globalThis.confirm('Are you sure you want to BAN this user?')) return;
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
        if (!globalThis.confirm('Are you sure you want to UNBAN this user?')) return;
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
        if (!globalThis.confirm('Are you sure you want to approve this user as a SELLER?')) return;
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
        <div className="space-y-4">
            <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-800">
                            User Management
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Ban / unban users and manage seller requests
                        </CardDescription>
                    </div>
                    <div className="text-sm text-gray-500">
                        Total:{' '}
                        <span className="font-semibold text-gray-900">
                            {filteredUsers.length}
                        </span>{' '}
                        users
                    </div>
                </CardHeader>

                <CardContent className="pt-4">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {filters.map((f) => (
                            <Button
                                key={f}
                                size="sm"
                                variant={filter === f ? 'default' : 'outline'}
                                onClick={() => setFilter(f)}
                                className={`rounded-full text-xs font-medium ${filter === f
                                        ? 'bg-[#F56218] hover:bg-[#e2560f]'
                                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {f === 'PENDING_SELLER' ? 'Requests Seller' : (f === 'ALL' ? 'All' : f)}
                                {f !== 'ALL' && (
                                    <span className="ml-1.5 text-[11px] text-gray-500">
                                        ({f === 'PENDING_SELLER'
                                            ? users.filter(u => u.pendingSellerUpgrade).length
                                            : users.filter(u => u.status === f).length})
                                    </span>
                                )}
                            </Button>
                        ))}
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-2 border-[#F56218] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-base font-medium">No users found</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                ID
                                            </th>
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Full Name
                                            </th>
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Email
                                            </th>
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Phone
                                            </th>
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Role
                                            </th>
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Status
                                            </th>
                                            <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Created At
                                            </th>
                                            <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.map((user) => (
                                            <tr
                                                key={user.userId}
                                                className="hover:bg-orange-50/40 transition-colors"
                                            >
                                                <td className="px-6 py-3 text-xs text-gray-600">
                                                    #{user.userId}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {user.fullName}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-700">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-700">
                                                    {user.phone || '—'}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {user.roleName || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full border ${statusColors[user.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-500">
                                                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {user.roleName !== 'ADMIN' && (
                                                        <div className="flex flex-col gap-2 items-end">
                                                            <div className="flex gap-2">
                                                                {user.status === 'ACTIVE' ? (
                                                                    <Button
                                                                        size="xs"
                                                                        variant="destructive"
                                                                        onClick={() => handleBan(user.userId)}
                                                                        disabled={actionLoading === user.userId}
                                                                        className="rounded-full text-white disabled:opacity-60"
                                                                    >
                                                                        {actionLoading === user.userId ? '...' : '🔒 Ban'}
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        size="xs"
                                                                        onClick={() => handleUnban(user.userId)}
                                                                        disabled={actionLoading === user.userId}
                                                                        className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-60"
                                                                    >
                                                                        {actionLoading === user.userId ? '...' : '🔓 Unban'}
                                                                    </Button>
                                                                )}
                                                            </div>

                                                            {user.pendingSellerUpgrade && user.roleName === 'BUYER' && (
                                                                <Button
                                                                    size="xs"
                                                                    onClick={() => handleApproveSeller(user.userId)}
                                                                    disabled={actionLoading === user.userId}
                                                                    className="rounded-full bg-[#F56218] hover:bg-[#e2560f] text-white disabled:opacity-60 flex items-center gap-1 w-fit"
                                                                    title="Approve Seller Request"
                                                                >
                                                                    {actionLoading === user.userId ? '...' : '⭐ Approve Seller'}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
