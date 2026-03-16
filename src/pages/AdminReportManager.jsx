import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { getAllReports, updateReportStatus } from '@/services/api';

const STATUS_BADGE_MAP = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
};

export default function AdminReportManager() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const loadReports = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getAllReports();
            setReports(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load reports.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const handleUpdateStatus = async (reportId, status) => {
        try {
            setActionLoadingId(reportId);
            await updateReportStatus(reportId, status);
            await loadReports();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update report status.');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleChatWithBuyer = (report) => {
        if (!report?.reporterId) return;

        const nextParams = new URLSearchParams();
        nextParams.set('userId', String(report.reporterId));
        if (report?.bikeId) {
            nextParams.set('bikeId', String(report.bikeId));
        }

        navigate(`/chat?${nextParams.toString()}`, {
            state: {
                sellerName: report.reporterName || `Buyer #${report.reporterId}`,
                bikeTitle: report.bikeTitle || 'Report conversation',
            },
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-5">
                <h3 className="text-xl font-semibold text-gray-900">Report Manager</h3>
                <p className="text-sm text-gray-500 mt-1">Review and resolve buyer bike reports.</p>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-10 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading reports...
                </div>
            ) : (
                <>
                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {reports.length === 0 ? (
                        <p className="text-sm text-gray-500">No reports found.</p>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => {
                                const status = String(report.status || '').toUpperCase();
                                const badgeClass = STATUS_BADGE_MAP[status] || 'bg-gray-100 text-gray-700 border-gray-200';
                                const isPending = status === 'PENDING';

                                return (
                                    <div key={report.reportId} className="rounded-xl border border-gray-200 p-4 bg-gray-50/60">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Report #{report.reportId}</p>
                                                <p className="text-sm text-gray-600 mt-1">Reporter: {report.reporterName || `#${report.reporterId}`}</p>
                                                <p className="text-sm text-gray-600">Bike: {report.bikeTitle || '--'} {report.bikeId ? `(ID: ${report.bikeId})` : ''}</p>
                                                <p className="text-sm text-gray-600">Seller: {report.sellerName || (report.sellerId ? `#${report.sellerId}` : '--')}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {report.createdAt ? new Date(report.createdAt).toLocaleString('vi-VN') : '--'}
                                                </p>
                                            </div>

                                            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${badgeClass}`}>
                                                {status || '--'}
                                            </span>
                                        </div>

                                        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                                            <p className="text-xs text-gray-500 mb-1">Reason</p>
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{report.reason}</p>
                                        </div>

                                        {Array.isArray(report.imageUrls) && report.imageUrls.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-3">
                                                {report.imageUrls.map((imageUrl, index) => (
                                                    <a
                                                        key={`${report.reportId}-${index}`}
                                                        href={imageUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block"
                                                    >
                                                        <img
                                                            src={imageUrl}
                                                            alt={`report-${report.reportId}-${index + 1}`}
                                                            className="w-28 h-20 rounded-lg object-cover border border-gray-200"
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            <button
                                                onClick={() => handleChatWithBuyer(report)}
                                                disabled={actionLoadingId === report.reportId}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-70"
                                            >
                                                Chat with Buyer
                                            </button>

                                            {isPending && (
                                                <>
                                                <button
                                                    onClick={() => handleUpdateStatus(report.reportId, 'Approved')}
                                                    disabled={actionLoadingId === report.reportId}
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-70"
                                                >
                                                    {actionLoadingId === report.reportId ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(report.reportId, 'Rejected')}
                                                    disabled={actionLoadingId === report.reportId}
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-70"
                                                >
                                                    {actionLoadingId === report.reportId ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                    Reject
                                                </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
