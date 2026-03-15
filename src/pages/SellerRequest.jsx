import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Store,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Loader2,
    CalendarDays,
    Hash,
    FileText,
    Bike,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requestSellerRole, getUserById } from '@/services/api';

// ── Status configuration ────────────────────────────────────────────────────
const STATUS_CONFIG = {
    PENDING: {
        label: 'Pending',
        icon: <Clock className="w-3.5 h-3.5" />,
        badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-100',
        bannerClass: 'bg-yellow-50 border-yellow-100',
        iconClass: 'text-yellow-600',
        message: 'Your request is waiting for admin approval.',
        description:
            'Your application is under review by our team. This typically takes 1–2 business days.',
    },
    APPROVED: {
        label: 'Approved',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        badgeClass: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-100',
        bannerClass: 'bg-green-50 border-green-100',
        iconClass: 'text-green-600',
        message: 'Your request has been approved. You are now a Seller.',
        description:
            'Welcome to CycleTrust Sellers! You can now list your bikes in the marketplace.',
    },
    REJECTED: {
        label: 'Rejected',
        icon: <XCircle className="w-3.5 h-3.5" />,
        badgeClass: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-100',
        bannerClass: 'bg-red-50 border-red-100',
        iconClass: 'text-red-600',
        message: 'Your request was rejected. Please contact support or try again.',
        description:
            'Your seller application did not meet our current requirements. Contact support@cycletrust.com for details.',
    },
};

export default function SellerRequest() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [submitStatus, setSubmitStatus] = useState({
        loading: false,
        error: '',
    });

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) {
            setPageLoading(false);
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(stored);
        } catch {
            setPageLoading(false);
            return;
        }

        // Always fetch fresh data so an admin approval is reflected immediately
        const refresh = async () => {
            try {
                const fresh = await getUserById(parsed.userId);
                const merged = { ...parsed, ...fresh };

                // If the backend hasn't promoted role to SELLER yet, preserve the
                // pendingSellerUpgrade flag that was set locally after submit so the
                // Pending state survives a page reload even if the API doesn't echo it.
                if (merged.roleName?.toUpperCase() !== 'SELLER' && parsed.pendingSellerUpgrade) {
                    merged.pendingSellerUpgrade = true;
                }

                setUser(merged);
                localStorage.setItem('user', JSON.stringify(merged));
            } catch {
                // API unavailable – fall back to cached data
                setUser(parsed);
            } finally {
                setPageLoading(false);
            }
        };

        if (parsed.userId) {
            refresh();
        } else {
            setUser(parsed);
            setPageLoading(false);
        }
    }, []);

    // ── Derive current state from stored user ──────────────────────────────
    const roleName = user?.roleName?.toUpperCase();
    const isApproved  = roleName === 'SELLER';
    const isPending   = !isApproved && user?.pendingSellerUpgrade === true;
    const isRejected  = !isApproved && !isPending && user?.rejectedSellerUpgrade === true;
    const hasRequest  = isApproved || isPending || isRejected;

    let requestStatus = null;
    if (isApproved) requestStatus = 'APPROVED';
    else if (isPending) requestStatus = 'PENDING';
    else if (isRejected) requestStatus = 'REJECTED';

    const cfg = requestStatus ? STATUS_CONFIG[requestStatus] : null;

    const requestId   = user?.sellerRequestId  || `REQ-${String(user?.userId ?? '0000').padStart(4, '0')}`;
    const requestDate = user?.sellerRequestDate || new Date().toLocaleDateString('en-GB');

    // ── Submit handler ─────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!user?.userId) return;
        setSubmitStatus({ loading: true, error: '' });
        try {
            await requestSellerRole(user.userId);
            const updated = { ...user, pendingSellerUpgrade: true };
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
            setSubmitStatus({ loading: false, error: '' });
        } catch (err) {
            setSubmitStatus({
                loading: false,
                error: err.response?.data?.message || 'Request failed. Please try again.',
            });
        }
    };

    if (pageLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#F56218] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* ── Mini Header ───────────────────────────────────────────── */}
            <header className="bg-gradient-to-r from-[#FF7A2F] to-[#D94E0A] sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white hover:bg-white/20 rounded-full px-3 py-2 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Marketplace</span>
                    </button>

                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="bg-white p-1.5 rounded-lg flex items-center justify-center">
                            <Bike className="text-[#F56218] w-5 h-5" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">CycleTrust</span>
                    </div>

                    <div className="w-[110px] sm:w-[140px]" />
                </div>
            </header>

            {/* ── Page Content ──────────────────────────────────────────── */}
            <main className="container mx-auto px-4 py-10 sm:py-14 flex flex-col items-center">
                <div className="w-full max-w-md">

                    {/* Page heading */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                            <Store className="w-5 h-5 text-[#F56218]" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                                Seller Registration Request
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Manage your upgrade to seller account
                            </p>
                        </div>
                    </div>

                    {/* ── STATUS CARD ────────────────────────────────────── */}
                    {hasRequest || (requestStatus === 'PENDING') ? (
                        <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-0 pt-5 px-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                        Request Details
                                    </CardTitle>
                                    {cfg && (
                                        <Badge
                                            className={`inline-flex items-center gap-1.5 rounded-full border text-xs font-semibold px-3 py-1 ${cfg.badgeClass}`}
                                        >
                                            {cfg.icon}
                                            {cfg.label}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 pt-5 pb-6 space-y-5">
                                {/* Meta fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-2.5">
                                        <Hash className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium mb-0.5">Request ID</p>
                                            <p className="text-sm font-semibold text-gray-800">{requestId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <CalendarDays className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium mb-0.5">Request Date</p>
                                            <p className="text-sm font-semibold text-gray-800">{requestDate}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100" />

                                {/* Status banner */}
                                {cfg && (
                                    <div className={`flex items-start gap-3 p-4 rounded-xl border ${cfg.bannerClass}`}>
                                        <span className={`mt-0.5 shrink-0 ${cfg.iconClass}`}>
                                            {cfg.icon}
                                        </span>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-700 mb-1">Status</p>
                                            <p className="text-sm text-gray-600 leading-snug">{cfg.message}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {cfg && (
                                    <div className="flex items-start gap-2.5">
                                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium mb-1">Description</p>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {cfg.description}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Approved CTA */}
                                {requestStatus === 'APPROVED' && (
                                    <Button
                                        onClick={() => navigate('/seller-dashboard')}
                                        className="w-full bg-[#F56218] hover:bg-[#D94E0A] text-white rounded-xl font-semibold h-11 mt-1"
                                    >
                                        <Store className="w-4 h-4" />
                                        Go to Seller Dashboard
                                    </Button>
                                )}

                                {/* Rejected – re-submit */}
                                {requestStatus === 'REJECTED' && (
                                    <>
                                        {submitStatus.error && (
                                            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                                {submitStatus.error}
                                            </p>
                                        )}
                                        <Button
                                            variant="outline"
                                            onClick={handleSubmit}
                                            disabled={submitStatus.loading}
                                            className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl font-semibold h-11"
                                        >
                                            {submitStatus.loading
                                                ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                                                : <><Store className="w-4 h-4" />Try Again</>
                                            }
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        /* ── NO REQUEST YET ────────────────────────────── */
                        <Card className="border-0 shadow-md rounded-2xl">
                            <CardContent className="px-6 pt-10 pb-8 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-5">
                                    <Store className="w-8 h-8 text-[#F56218]" />
                                </div>

                                <h2 className="text-lg font-bold text-gray-900 mb-2">
                                    Want to sell bikes?
                                </h2>
                                <p className="text-sm text-gray-500 mb-7 max-w-xs leading-relaxed">
                                    You have not submitted a seller request yet. Submit a request to
                                    start listing your bikes on CycleTrust.
                                </p>

                                {submitStatus.error && (
                                    <div className="w-full mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-left">
                                        {submitStatus.error}
                                    </div>
                                )}

                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitStatus.loading || !user?.userId}
                                    className="w-full bg-[#F56218] hover:bg-[#D94E0A] text-white rounded-xl font-semibold h-11"
                                >
                                    {submitStatus.loading
                                        ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                                        : <><Store className="w-4 h-4" />Submit Seller Request</>
                                    }
                                </Button>

                                <p className="text-xs text-gray-400 mt-4 text-center max-w-[260px] leading-relaxed">
                                    Our team will review your request and notify you within 1–2 business days.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Back link */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mx-auto transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Go back
                    </button>
                </div>
            </main>
        </div>
    );
}
