import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, Send } from "lucide-react";
import { reviewsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, getUser } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";

interface Review {
  _id: string;
  reviewer: {
    _id: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    profilePhoto?: string;
  };
  rating: number;
  text: string;
  createdAt: string;
}

interface PropertyReviewsProps {
  propertyId: string;
}

const PropertyReviews = ({ propertyId }: PropertyReviewsProps) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const user = getUser();

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    setLoading(true);
    const response = await reviewsApi.getByPropertyId(propertyId);
    if (response.data) {
      setReviews(Array.isArray(response.data) ? response.data : []);
    }
    setLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated()) {
      toast({
        title: "Login Required",
        description: "Please log in to leave a review.",
      });
      return;
    }

    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Rating Required",
        description: "Please select a star rating.",
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        variant: "destructive",
        title: "Review Required",
        description: "Please write a review.",
      });
      return;
    }

    setSubmitting(true);
    const response = await reviewsApi.createPropertyReview(propertyId, {
      rating,
      text: reviewText.trim(),
    });

    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    } else {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setRating(0);
      setReviewText("");
      fetchReviews();
    }
    setSubmitting(false);
  };

  const getReviewerName = (reviewer: Review["reviewer"]) => {
    if (reviewer.fullName) return reviewer.fullName;
    if (reviewer.firstName || reviewer.lastName) {
      return `${reviewer.firstName || ""} ${reviewer.lastName || ""}`.trim();
    }
    return "Anonymous";
  };

  const getInitials = (reviewer: Review["reviewer"]) => {
    const name = getReviewerName(reviewer);
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Reviews
            {reviews.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({reviews.length})
              </span>
            )}
          </CardTitle>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Write Review Form */}
        {isAuthenticated() && (
          <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
            <h4 className="font-medium">Write a Review</h4>
            <div className="flex items-center gap-1">
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
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 ? `${rating} star${rating > 1 ? "s" : ""}` : "Select rating"}
              </span>
            </div>
            <Textarea
              placeholder="Share your experience with this property..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleSubmitReview}
              disabled={submitting || rating === 0 || !reviewText.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        )}

        {!isAuthenticated() && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Please log in to leave a review.
          </p>
        )}

        <Separator />

        {/* Reviews List */}
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No reviews yet. Be the first to review this property!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.reviewer.profilePhoto} />
                    <AvatarFallback>{getInitials(review.reviewer)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{getReviewerName(review.reviewer)}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
                  </div>
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyReviews;