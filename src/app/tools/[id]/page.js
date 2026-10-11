'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import HireCalculator from '@/components/HireCalculator';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import { ChevronRight, ImageOff, Clock, CalendarDays, CalendarRange, Star, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import '@/lib/i18n';
import { translateCategoryName } from '@/lib/categoryName';

export default function ToolDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchTool = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch(`/api/tools/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setTool(data);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) fetchTool(true);
  }, [id, fetchTool]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#3498db]" />
      </div>
    );
  }

  if (notFound || !tool) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-gray-500 text-sm">
          {t('toolDetail.notFound', 'Tool not found.')}{' '}
          <Link href="/catalogue" className="inline-flex items-center gap-1 text-[#3498db] hover:underline font-medium">
            <ArrowLeft size={14} /> {t('toolDetail.backToCatalogue', 'Back to Catalogue')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#ecf0f1] min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link href="/catalogue" className="text-[#3498db] hover:underline font-medium">
            {t('toolDetail.backToCatalogue', 'Catalogue')}
          </Link>
          <ChevronRight size={14} />
          <span>{translateCategoryName(t, tool.category?.name)}</span>
          <ChevronRight size={14} />
          <span className="text-[#34495e] font-medium">{tool.name}</span>
        </nav>

        {/* Tool Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 mb-6">
            {/* Image */}
            <div className="h-44 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
              {tool.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tool.imageUrl} alt={tool.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <ImageOff size={28} />
                  <span className="text-xs font-medium">{t('toolDetail.noImage', 'NO IMAGE')}</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-2xl font-extrabold text-[#34495e] mb-2">{tool.name}</h1>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{tool.description}</p>

              {/* Price Grid */}
              <div className="flex gap-4">
                <PriceStat icon={<Clock size={14} />} label={t('toolDetail.hourly', 'Hourly')} value={tool.hourlyRate} />
                <PriceStat icon={<CalendarDays size={14} />} label={t('toolDetail.daily', 'Daily')} value={tool.dailyRate} />
                <PriceStat icon={<CalendarRange size={14} />} label={t('toolDetail.weekly', 'Weekly')} value={tool.weeklyRate} />
              </div>
            </div>
          </div>

          {/* Hire Calculator */}
          <HireCalculator toolId={tool.id} />

          {/* Reviews Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-[#34495e]" />
                <h2 className="text-lg font-bold text-[#34495e]">
                  {t('toolDetail.customerReviews', 'Reviews')}
                </h2>
              </div>
              {tool.averageRating !== null && tool.averageRating !== undefined && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-700 border border-amber-200">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  {tool.averageRating.toFixed(1)} ({tool.reviewCount})
                </span>
              )}
            </div>
            <ReviewForm toolId={tool.id} onSubmitted={fetchTool} />
            <ReviewList reviews={tool.reviews || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceStat({ icon, label, value }) {
  return (
    <div className="rounded-md bg-[#ecf0f1] border border-gray-200 px-4 py-2.5 text-center min-w-[90px]">
      <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-0.5">
        {icon} {label}
      </div>
      <div className="text-base font-bold text-[#34495e]">
        LKR {Number(value).toFixed(2)}
      </div>
    </div>
  );
}