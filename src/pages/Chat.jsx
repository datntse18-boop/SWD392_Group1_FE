import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Home, Loader2, MessageCircle, Send, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBikeById, getConversationMessages, getMessageInbox, getUserById, sendMessage } from '@/services/api';

function formatTimestamp(value) {
    if (!value) return '';

    const date = new Date(value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    })}`;
}

export default function Chat() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentUser, setCurrentUser] = useState(null);
    const [inboxItems, setInboxItems] = useState([]);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [loadingInbox, setLoadingInbox] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [conversationMeta, setConversationMeta] = useState({
        otherUserName: location.state?.sellerName || 'Conversation',
        bikeTitle: location.state?.bikeTitle || '',
    });

    const activeOtherUserId = Number(searchParams.get('sellerId') || searchParams.get('userId') || 0);
    const activeBikeId = Number(searchParams.get('bikeId') || 0) || null;

    const activeConversation = useMemo(
        () => inboxItems.find(
            (item) => Number(item.otherUserId) === activeOtherUserId && Number(item.bikeId || 0) === Number(activeBikeId || 0)
        ),
        [activeBikeId, activeOtherUserId, inboxItems]
    );

    const loadInbox = async (userId) => {
        setLoadingInbox(true);
        try {
            const data = await getMessageInbox(userId);
            setInboxItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load inbox.');
        } finally {
            setLoadingInbox(false);
        }
    };

    const loadConversation = async (userId, otherUserId, bikeId) => {
        if (!userId || !otherUserId) {
            setMessages([]);
            return;
        }

        setLoadingMessages(true);
        setError('');

        try {
            const data = await getConversationMessages(userId, otherUserId, bikeId);
            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load conversation.');
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        const rawUser = localStorage.getItem('user');
        if (!rawUser) {
            navigate('/login');
            return;
        }

        try {
            setCurrentUser(JSON.parse(rawUser));
        } catch {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (!currentUser?.userId) return;
        loadInbox(currentUser.userId);
    }, [currentUser?.userId]);

    useEffect(() => {
        if (activeOtherUserId || inboxItems.length === 0) return;

        const firstItem = inboxItems[0];
        const nextParams = new URLSearchParams();
        nextParams.set('userId', firstItem.otherUserId);
        if (firstItem.bikeId) {
            nextParams.set('bikeId', firstItem.bikeId);
        }
        setSearchParams(nextParams);
    }, [activeOtherUserId, inboxItems, setSearchParams]);

    useEffect(() => {
        if (!currentUser?.userId || !activeOtherUserId) return;
        loadConversation(currentUser.userId, activeOtherUserId, activeBikeId);
    }, [activeBikeId, activeOtherUserId, currentUser?.userId]);

    useEffect(() => {
        if (!activeOtherUserId) return;

        const hydrateMeta = async () => {
            const nextMeta = {
                otherUserName: activeConversation?.otherUserName || location.state?.sellerName || 'Conversation',
                bikeTitle: activeConversation?.bikeTitle || location.state?.bikeTitle || '',
            };

            try {
                if (!activeConversation?.otherUserName) {
                    const user = await getUserById(activeOtherUserId);
                    nextMeta.otherUserName = user?.fullName || user?.username || nextMeta.otherUserName;
                }

                if (activeBikeId && !activeConversation?.bikeTitle) {
                    const bike = await getBikeById(activeBikeId);
                    nextMeta.bikeTitle = bike?.title || nextMeta.bikeTitle;
                }
            } catch {
                // Keep fallback names if lookup fails.
            }

            setConversationMeta(nextMeta);
        };

        hydrateMeta();
    }, [activeBikeId, activeConversation, activeOtherUserId, location.state?.bikeTitle, location.state?.sellerName]);

    const handleSelectConversation = (item) => {
        const nextParams = new URLSearchParams();
        nextParams.set('userId', item.otherUserId);
        if (item.bikeId) {
            nextParams.set('bikeId', item.bikeId);
        }
        setSearchParams(nextParams);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!currentUser?.userId || !activeOtherUserId || !draft.trim()) return;

        setSending(true);
        setError('');

        try {
            await sendMessage({
                senderId: currentUser.userId,
                receiverId: activeOtherUserId,
                bikeId: activeBikeId,
                content: draft.trim(),
            });

            setDraft('');
            await Promise.all([
                loadConversation(currentUser.userId, activeOtherUserId, activeBikeId),
                loadInbox(currentUser.userId),
            ]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 lg:px-8">
                <aside className="hidden w-80 shrink-0 rounded-2xl border border-gray-200 bg-white shadow-sm lg:flex lg:flex-col">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
                        <p className="text-sm text-gray-500">Conversations between buyers and sellers.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                        {loadingInbox ? (
                            <div className="flex items-center justify-center py-10 text-gray-500">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        ) : inboxItems.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                                No conversations yet.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {inboxItems.map((item) => {
                                    const isActive = Number(item.otherUserId) === activeOtherUserId
                                        && Number(item.bikeId || 0) === Number(activeBikeId || 0);

                                    return (
                                        <button
                                            key={`${item.otherUserId}-${item.bikeId || 'general'}`}
                                            onClick={() => handleSelectConversation(item)}
                                            className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                                                isActive
                                                    ? 'border-orange-200 bg-orange-50'
                                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-gray-900">{item.otherUserName}</p>
                                                    <p className="truncate text-xs text-gray-500">{item.bikeTitle || 'General conversation'}</p>
                                                </div>
                                                <span className="shrink-0 text-[11px] text-gray-400">{new Date(item.lastSentAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="mt-2 truncate text-sm text-gray-600">{item.lastMessageContent}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </aside>

                <section className="flex min-h-[70vh] flex-1 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">{conversationMeta.otherUserName}</h1>
                                <p className="text-sm text-gray-500">{conversationMeta.bikeTitle || 'Direct conversation'}</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                            <Home className="h-4 w-4" />
                            Home
                        </Button>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/60 px-5 py-5">
                        {!activeOtherUserId ? (
                            <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                                <MessageCircle className="mb-3 h-10 w-10 text-gray-300" />
                                <p className="font-medium text-gray-700">Choose a conversation to start chatting.</p>
                            </div>
                        ) : loadingMessages ? (
                            <div className="flex h-full items-center justify-center text-gray-500">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                                <UserCircle2 className="mb-3 h-10 w-10 text-gray-300" />
                                <p className="font-medium text-gray-700">No messages yet.</p>
                                <p className="text-sm text-gray-500">Send the first message to start this conversation.</p>
                            </div>
                        ) : (
                            messages.map((message) => {
                                const isMine = Number(message.senderId) === Number(currentUser?.userId);
                                return (
                                    <div
                                        key={message.messageId}
                                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                                                isMine
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-white text-gray-800 border border-gray-200'
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                                            <p className={`mt-2 text-[11px] ${isMine ? 'text-orange-100' : 'text-gray-400'}`}>
                                                {formatTimestamp(message.sentAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="border-t border-gray-100 px-5 py-4">
                        {error && (
                            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSend} className="flex gap-3">
                            <input
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder={activeOtherUserId ? 'Type your message...' : 'Open a conversation first'}
                                disabled={!activeOtherUserId || sending}
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-orange-300"
                            />
                            <Button
                                type="submit"
                                disabled={!activeOtherUserId || sending || !draft.trim()}
                                className="h-auto rounded-xl bg-orange-500 px-5 py-3 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
}
