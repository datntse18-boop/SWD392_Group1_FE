import { useState } from "react";
import { Star, CheckCircle } from "lucide-react";
import { submitReview } from "@/services/api";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function ReviewForm({ sellerId, sellerName }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [orderId, setOrderId] = useState("");
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

  // Only show to logged-in buyers (not to the seller themselves)
  if (!currentUser || currentUser.userId === sellerId) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!orderId || isNaN(Number(orderId)) || Number(orderId) < 1) {
      setError("Please enter a valid Order ID.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await submitReview({
        orderId: Number(orderId),
        buyerId: currentUser.userId,
        sellerId: sellerId,
        rating: rating,
        comment: comment.trim() || null,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit review. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gray-50 rounded-xl p-5 mt-8 border border-gray-100">
        <div className="flex items-center gap-3 text-green-700">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Review submitted!</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Thank you for your feedback.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-5 mt-8 border border-gray-100">
      <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
        <Star className="w-4 h-4 text-[#F56218]" fill="currentColor" />
        Leave a Review{sellerName ? ` for ${sellerName}` : ""}
      </h3>

      {error && (
        <div className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className="w-7 h-7"
                  fill={(hovered || rating) >= star ? "#F56218" : "none"}
                  stroke={(hovered || rating) >= star ? "#F56218" : "#D1D5DB"}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {RATING_LABELS[rating]}
            </p>
          )}
        </div>

        {/* Order ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order ID
          </label>
          <input
            type="number"
            min="1"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your order ID"
            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F56218]/30 focus:border-[#F56218] transition-colors"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this seller…"
            rows={3}
            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#F56218]/30 focus:border-[#F56218] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#F56218] hover:bg-[#D94E0A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {loading && (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          )}
          {loading ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
