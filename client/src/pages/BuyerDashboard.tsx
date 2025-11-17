import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "../lib/trpc";
import { Star } from "lucide-react";

export default function BuyerDashboard() {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const transactions = trpc.transaction.getBuyerTransactions.useQuery();
  const createReviewMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      setReviewDialogOpen(false);
      setSelectedTransaction(null);
      setRating(0);
      setComment("");
      transactions.refetch();
    },
  });

  const handleReviewClick = (transactionId: number) => {
    setSelectedTransaction(transactionId);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedTransaction || rating === 0) return;

    const transaction = transactions.data?.find((t) => t.id === selectedTransaction);
    if (!transaction) return;

    createReviewMutation.mutate({
      transactionId: selectedTransaction,
      sellerId: transaction.sellerId,
      rating,
      comment: comment || undefined,
    });
  };

  const canReview = (transaction: any) => {
    const daysSincePurchase = Math.floor(
      (Date.now() - new Date(transaction.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSincePurchase <= 90 && transaction.status === "completed";
  };

  if (transactions.isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Lädt...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meine Käufe</h1>
          <p className="mt-2 text-gray-600">
            Übersicht über alle deine Bestellungen und Bewertungsmöglichkeiten
          </p>
        </div>

        {transactions.data?.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Du hast noch keine Käufe getätigt.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.data?.map((transaction) => {
              const daysLeft = 90 - Math.floor(
                (Date.now() - new Date(transaction.createdAt).getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div key={transaction.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Bestellung #{transaction.id}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {transaction.status === "completed"
                            ? "Abgeschlossen"
                            : transaction.status === "pending"
                            ? "Ausstehend"
                            : transaction.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Datum:</span>{" "}
                          {new Date(transaction.createdAt).toLocaleDateString("de-DE")}
                        </div>
                        <div>
                          <span className="font-medium">Betrag:</span> €
                          {parseFloat(transaction.totalAmount).toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Menge:</span> {transaction.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Plattformgebühr:</span> €
                          {parseFloat(transaction.platformFee).toFixed(2)}
                        </div>
                      </div>

                      {canReview(transaction) && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            ✨ Du kannst diese Transaktion noch {daysLeft} Tage lang bewerten
                          </p>
                        </div>
                      )}

                      {!canReview(transaction) && daysLeft < 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            ⏰ Bewertungszeitraum abgelaufen (90 Tage)
                          </p>
                        </div>
                      )}
                    </div>

                    {canReview(transaction) && (
                      <button
                        onClick={() => handleReviewClick(transaction.id)}
                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Bewerten
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Review Dialog */}
        {reviewDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bewertung abgeben</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wie zufrieden warst du mit diesem Kauf?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {rating === 1 && "Sehr unzufrieden"}
                    {rating === 2 && "Unzufrieden"}
                    {rating === 3 && "Neutral"}
                    {rating === 4 && "Zufrieden"}
                    {rating === 5 && "Sehr zufrieden"}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kommentar (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Teile deine Erfahrungen mit anderen Käufern..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setReviewDialogOpen(false);
                    setSelectedTransaction(null);
                    setRating(0);
                    setComment("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={rating === 0 || createReviewMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {createReviewMutation.isPending ? "Wird gesendet..." : "Bewertung abschicken"}
                </button>
              </div>

              {createReviewMutation.error && (
                <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                  {createReviewMutation.error.message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}

