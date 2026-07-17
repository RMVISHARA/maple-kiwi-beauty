"use client";

import React, { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

const SLIDE_MS = 750;
const SLIDE_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

const FALLBACK = [
  {
    id: 1,
    authorName: "Amaya Perera",
    rating: 5,
    body: "My fine lines have softened after 6 weeks. Lightweight enough for Colombo humidity.",
    productName: "Retinol 1% in Squalane",
  },
  {
    id: 2,
    authorName: "Dilshan Fernando",
    rating: 5,
    body: "Finally something that controls oil in this heat. Breakouts have calmed down.",
    productName: "Niacinamide 10% + Zinc 1%",
  },
  {
    id: 3,
    authorName: "Nethmi Jayawardena",
    rating: 5,
    body: "Absorbs instantly and my skin feels plump all day. Perfect for tropical weather.",
    productName: "Hyaluronic Acid 2% + B5",
  },
];

function ReviewSlide({ review }) {
  return (
    <div className="p-5 flex flex-col justify-center h-full min-w-0 relative">
      <Quote className="w-4 h-4 text-brand-rose/70 mb-2 shrink-0" />
      <p className="text-[14px] text-white/90 leading-relaxed line-clamp-3 mb-3 font-light">
        &ldquo;{review.body}&rdquo;
      </p>
      <div className="mt-auto flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/15 text-white text-sm font-bold flex items-center justify-center shrink-0 border border-white/25">
          {review.authorName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{review.authorName}</p>
          {review.productName && (
            <p className="text-xs text-white/60 truncate">{review.productName}</p>
          )}
          <div className="flex text-brand-gold pt-0.5">
            {[...Array(review.rating || 5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroReviewCarousel() {
  const [reviews, setReviews] = useState(FALLBACK);
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Homepage shows admin-featured reviews only. If none are featured yet,
    // keep the demo reviews so the hero carousel still has content.
    fetch("/api/reviews?featured=1&limit=12")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(FALLBACK);
        }
      })
      .catch(() => {
        setReviews(FALLBACK);
      });
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => {
      // Double rAF ensures the browser paints the off-screen start position before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    }, 5500);
    return () => clearInterval(timer);
  }, [reviews.length]);

  useEffect(() => {
    if (!animating) return;
    const timeout = setTimeout(() => {
      setIndex((i) => (i + 1) % reviews.length);
      setAnimating(false);
    }, SLIDE_MS);
    return () => clearTimeout(timeout);
  }, [animating, reviews.length]);

  if (reviews.length === 0) return null;

  const current = reviews[index];
  const next = reviews[(index + 1) % reviews.length];

  return (
    <div className="w-full max-w-sm">
      <div className="relative h-[220px] overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md shadow-2xl">
        {/* Current — pushes out to the left */}
        <div
          className={`absolute inset-0 will-change-transform motion-reduce:transition-none ${
            animating ? "-translate-x-full" : "translate-x-0"
          }`}
          style={
            animating
              ? { transition: `transform ${SLIDE_MS}ms ${SLIDE_EASING}` }
              : undefined
          }
        >
          <ReviewSlide review={current} />
        </div>

        {/* Incoming — slides in from the right */}
        <div
          className={`absolute inset-0 will-change-transform motion-reduce:transition-none ${
            animating ? "translate-x-0" : "translate-x-full"
          }`}
          style={
            animating
              ? { transition: `transform ${SLIDE_MS}ms ${SLIDE_EASING}` }
              : undefined
          }
        >
          <ReviewSlide review={next} />
        </div>
      </div>

      {reviews.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {reviews.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? "w-4 bg-brand-rose" : "w-1 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
