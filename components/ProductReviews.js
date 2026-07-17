"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Star, Send, CheckCircle, Camera, X, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MAX_IMAGE_UPLOAD_BYTES, MAX_IMAGE_UPLOAD_LABEL } from "@/lib/imageLimits";

const MAX_PHOTOS = 5;

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
          aria-label={`Rate ${n} stars`}
        >
          <Star
            className={`w-5 h-5 ${
              n <= value ? "text-brand-gold fill-brand-gold" : "text-brand-border"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewStars({ rating, size = "w-3.5 h-3.5" }) {
  return (
    <div className="flex text-brand-gold">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= rating ? "fill-current" : "fill-none opacity-30"}`}
        />
      ))}
    </div>
  );
}

export default function ProductReviews({ productId, productName }) {
  const { user, isLoaded, openAuth } = useAuth();
  const fileInputRef = useRef(null);
  const photoItemsRef = useRef([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [photoItems, setPhotoItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReviews = () => {
    setLoading(true);
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  useEffect(() => {
    photoItemsRef.current = photoItems;
  }, [photoItems]);

  useEffect(() => {
    return () => {
      photoItemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  const clearPhotos = () => {
    photoItems.forEach((item) => URL.revokeObjectURL(item.preview));
    setPhotoItems([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (id) => {
    setPhotoItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_PHOTOS - photoItems.length;
    if (remaining <= 0) {
      setError(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const nextFiles = files.slice(0, remaining);
    const invalid = nextFiles.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      setError("Please choose image files only (JPG, PNG, WEBP, or GIF).");
      return;
    }

    const tooLarge = nextFiles.find((file) => file.size > MAX_IMAGE_UPLOAD_BYTES);
    if (tooLarge) {
      setError(`Each photo must be ${MAX_IMAGE_UPLOAD_LABEL} or smaller.`);
      return;
    }

    if (files.length > remaining) {
      setError(`Only ${remaining} more photo${remaining === 1 ? "" : "s"} can be added (max ${MAX_PHOTOS}).`);
    } else {
      setError("");
    }

    setPhotoItems((prev) => [
      ...prev,
      ...nextFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const average =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!user) {
      openAuth("signin");
      return;
    }

    if (!body.trim()) {
      setError("Please enter your review.");
      return;
    }

    const token = localStorage.getItem("maple_kiwi_token");
    if (!token) {
      openAuth("signin");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("productId", String(productId));
      formData.append("rating", String(rating));
      formData.append("body", body.trim());
      photoItems.forEach((item) => formData.append("photos", item.file));

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setBody("");
      clearPhotos();
      setMessage("Thank you! Your review has been submitted and will appear after approval.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-card border border-brand-border/60 rounded-3xl p-8 md:p-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h3 className="font-serif text-2xl font-bold text-brand-espresso mb-2">
            Customer Reviews
          </h3>
          <p className="text-xs text-brand-espresso/50">
            Verified reviews for {productName}
          </p>
        </div>
        {average && (
          <div className="flex items-center gap-3 bg-brand-cream/30 border border-brand-border/50 rounded-2xl px-4 py-3">
            <span className="text-3xl font-bold text-brand-rose">{average}</span>
            <div>
              <ReviewStars rating={Math.round(Number(average))} size="w-4 h-4" />
              <p className="text-[10px] text-brand-espresso/50 mt-0.5">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-brand-espresso/40 py-6 text-center">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-brand-espresso/50 py-6 text-center border border-dashed border-brand-border/60 rounded-2xl mb-8">
          No reviews yet — be the first to share your experience!
        </p>
      ) : (
        <div className="space-y-4 mb-10">
          {reviews.map((review) => {
            const reviewPhotos = review.photos || [];
            const avatarPhoto = reviewPhotos[0];

            return (
            <div
              key={review.id}
              className="border border-brand-border/50 rounded-2xl p-5 bg-brand-cream/20"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3 min-w-0">
                  {avatarPhoto ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-border/60 shrink-0 relative">
                      <Image
                        src={avatarPhoto}
                        alt={`${review.authorName}'s photo`}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-rose/10 text-brand-rose text-sm font-bold flex items-center justify-center shrink-0">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-espresso">{review.authorName}</p>
                    <p className="text-[10px] text-brand-espresso/40">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Verified customer"}
                    </p>
                  </div>
                </div>
                <ReviewStars rating={review.rating} />
              </div>
              <p className="text-sm text-brand-espresso/75 leading-relaxed mb-3">{review.body}</p>
              {reviewPhotos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {reviewPhotos.map((src, index) => (
                    <div
                      key={`${review.id}-${index}`}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-brand-border/50 bg-brand-cream/30"
                    >
                      <Image
                        src={src}
                        alt={`Photo ${index + 1} from ${review.authorName}'s review`}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-brand-border/60 pt-8">
        <h4 className="text-sm font-bold uppercase tracking-widest text-brand-rose mb-4">
          Write a Review
        </h4>

        {!isLoaded ? (
          <p className="text-sm text-brand-espresso/40">Loading…</p>
        ) : !user ? (
          <div className="rounded-2xl border border-dashed border-brand-border/70 bg-brand-cream/20 p-6 text-center">
            <LogIn className="w-8 h-8 text-brand-rose/70 mx-auto mb-3" />
            <p className="text-sm text-brand-espresso/70 mb-4">
              Sign in to share your experience with {productName}.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => openAuth("signin")}
                className="inline-flex items-center gap-2 bg-brand-rose hover:bg-brand-rose-hover text-[#FAF7F2] font-semibold text-sm py-2.5 px-5 rounded-full transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </button>
              <button
                type="button"
                onClick={() => openAuth("signup")}
                className="text-sm text-brand-espresso/60 hover:text-brand-rose transition-colors cursor-pointer"
              >
                Create an account
              </button>
            </div>
          </div>
        ) : (
          <>
            {message && (
              <div className="mb-4 flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-brand-espresso/70">
                  Reviewing as <span className="font-semibold text-brand-espresso">{user.name}</span>
                </p>
                <div>
                  <label className="block text-xs font-semibold text-brand-espresso/60 mb-1.5 sm:text-right">
                    Your Rating
                  </label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-espresso/60 mb-1.5">
                  Your Review
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share your experience with this product…"
                  rows={4}
                  className="w-full bg-brand-cream/30 border border-brand-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose/30 resize-none"
                  required
                  minLength={10}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-espresso/60 mb-1.5">
                  Add Photos{" "}
                  <span className="font-normal text-brand-espresso/40">
                    (optional, up to {MAX_PHOTOS})
                  </span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {photoItems.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {photoItems.map((item) => (
                      <div key={item.id} className="relative w-24 h-24 rounded-xl overflow-hidden border border-brand-border/60 shrink-0 group">
                        <Image src={item.preview} alt="Review photo preview" fill className="object-cover" sizes="96px" />
                        <button
                          type="button"
                          onClick={() => removePhoto(item.id)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          aria-label="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {photoItems.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-brand-border/70 bg-brand-cream/20 text-sm text-brand-espresso/70 hover:border-brand-rose/40 hover:text-brand-rose transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    {photoItems.length ? "Add more photos" : "Upload photos"}
                  </button>
                )}
                <p className="text-[10px] text-brand-espresso/40 mt-1.5">
                  {photoItems.length}/{MAX_PHOTOS} photos — JPG, PNG, WEBP or GIF, max {MAX_IMAGE_UPLOAD_LABEL} each
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-brand-rose hover:bg-brand-rose-hover text-[#FAF7F2] font-semibold text-sm py-3 px-6 rounded-full transition-all disabled:opacity-60 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
              <p className="text-[10px] text-brand-espresso/40">
                Reviews are moderated before appearing on the site.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
