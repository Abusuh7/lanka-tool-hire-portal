'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import StarRating from './StarRating';
import { PenLine, Send, LogIn, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import '@/lib/i18n';

export default function ReviewForm({ toolId, onSubmitted }) {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const [ratings, setRatings] = useState({});
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const CATEGORIES = [
    { key: 'performanceRating', label: t('review.performance', 'Equipment performance') },
    { key: 'customerServiceRating', label: t('review.customerService', 'Customer service') },
    { key: 'supportRating', label: t('review.support', 'Support services') },
    { key: 'afterSalesRating', label: t('review.afterSales', 'After sales support') },
  ];

  if (status === 'loading') return null;

  if (session && session.user.userType !== 'customer') {
    return (
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 mb-4 text-center">
        <p className="text-sm text-gray-600">
          {t('review.staffCannotReview', "Staff accounts can't write reviews. Sign in with a customer account to leave a review.")}
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 mb-4 text-center">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3498db] hover:underline">
          <LogIn size={14} /> {t('review.loginToReview', 'Sign in to write a review.')}
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-5 mb-6 shadow-sm">
        <div className="flex items-start gap-3">
          <CheckCircle size={22} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-emerald-800">
              {t('review.submittedTitle', 'Review Submitted Successfully!')}
            </h4>
            <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
              {t('review.submitted', 'Thanks — your review has been submitted and is awaiting moderation.')}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Link
                href="/dashboard/reviews"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded transition-colors"
              >
                {t('review.viewMyReviews', 'View in My Reviews →')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setTitle('');
                  setBody('');
                  setRatings({});
                }}
                className="text-xs text-emerald-700 hover:underline"
              >
                {t('review.writeAnother', 'Write another review')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const missing = CATEGORIES.find((c) => !ratings[c.key]);
    if (missing || !title || !body) {
      setError(t('review.validationError', 'Please rate every category and fill in a title and review.'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, title, reviewBody: body, ...ratings }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not submit review');
        return;
      }

      setSubmitted(true);
      onSubmitted?.();
    } catch {
      setError('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white border border-gray-200 p-5 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <PenLine size={18} className="text-[#3498db]" />
        <h3 className="text-base font-bold text-[#34495e]">{t('review.writeReview', 'Write a Review')}</h3>
      </div>

      <div className="space-y-3 mb-4">
        {CATEGORIES.map((c) => (
          <div key={c.key} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{c.label}</span>
            <StarRating
              value={ratings[c.key] || 0}
              onChange={(v) => setRatings({ ...ratings, [c.key]: v })}
            />
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder={t('review.titlePlaceholder', 'Review title (e.g. Excellent piece of kit)')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#3498db] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
      />

      <textarea
        placeholder={t('review.bodyPlaceholder', 'Share details about the equipment condition, reliability, and your overall experience...')}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="w-full mb-3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#3498db] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
      />

      {error && <p className="text-sm text-rose-600 font-medium mb-3">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-[#3498db] py-2.5 text-sm font-semibold text-white shadow hover:bg-[#2980b9] disabled:opacity-50 transition-colors"
      >
        <Send size={16} />
        {submitting ? t('review.submitting', 'Submitting…') : t('review.submitReviewBtn', 'Submit Review')}
      </button>
    </form>
  );
}