import { useState } from "react";
import { MessageCircle, Send, CheckCircle } from "lucide-react";
import { sendMessage } from "@/services/api";

export default function MessageBox({ bikeId, sellerId, sellerName }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  if (!currentUser) {
    return (
      <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100 text-center">
        <MessageCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">
          <a
            href="/login"
            className="text-[#F56218] font-medium hover:underline"
          >
            Sign in
          </a>{" "}
          to message the seller
        </p>
      </div>
    );
  }

  // Don't show the message box if the current user is the seller
  if (currentUser.userId === sellerId) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await sendMessage({
        senderId: currentUser.userId,
        receiverId: sellerId,
        bikeId: bikeId,
        content: content.trim(),
      });
      setSuccess(true);
      setContent("");
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
      <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-[#F56218]" />
        Message {sellerName || "Seller"}
      </h3>

      {success && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3 mb-4 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Message sent successfully!
        </div>
      )}

      {error && (
        <div className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Ask ${sellerName || "the seller"} about this bike…`}
          rows={3}
          className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#F56218]/30 focus:border-[#F56218] transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="w-full flex items-center justify-center gap-2 bg-[#F56218] hover:bg-[#D94E0A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}
