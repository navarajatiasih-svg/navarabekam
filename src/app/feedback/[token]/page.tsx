"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Star,
  Sparkles,
  Heart,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Building2,
  User,
  Activity,
  MessageSquare,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check
} from "lucide-react";
import Image from "next/image";
import {
  FEEDBACK_CATEGORIES,
  DEFAULT_SUB_RATINGS,
  calculateCategoryAverage,
  buildAspectRatingsPayload,
} from "@/lib/feedbackCriteria";

type FeedbackData = {
  id: string;
  token: string;
  status: "PENDING" | "SUBMITTED" | "FLAGGED";
  customerName: string | null;
  customerPhone: string | null;
  isAnonymous: boolean;
  overallRating: number | null;
  therapistRating: number | null;
  facilityRating: number | null;
  serviceRating: number | null;
  valueRating: number | null;
  comment: string | null;
  aspectRatings: Record<string, any> | null;
  wouldRecommend: boolean | null;
  submittedAt: string | null;
  branch: {
    id: string;
    name: string;
    brand: "RADJA_BEKAM" | "NAVARA";
    address: string;
    phone: string;
    whatsappNumber: string;
  } | null;
  therapist: {
    id: string;
    name: string;
    specialization: string;
    photoUrl: string | null;
  } | null;
  services: string[];
};

const RATING_LABELS: Record<number, string> = {
  1: "Sangat Kecewa 😞",
  2: "Kurang Puas 🙁",
  3: "Cukup Baik 😐",
  4: "Puas & Nyaman 😊",
  5: "Sangat Puas & Istimewa! 🌟",
};

export default function CustomerFeedbackPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<FeedbackData | null>(null);

  // Form states
  const [overallRating, setOverallRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(true);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>("");

  // Detailed sub-criteria ratings & accordion states
  const [subRatings, setSubRatings] = useState<Record<string, number>>(DEFAULT_SUB_RATINGS);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    therapist: true,
    facility: true,
    service: true,
    value: true,
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleSubRatingChange = (key: string, score: number) => {
    setSubRatings((prev) => ({
      ...prev,
      [key]: score,
    }));
  };

  useEffect(() => {
    async function loadFeedback() {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/feedback/${token}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setData(json.data);
          if (json.data.status === "SUBMITTED") {
            setSuccess(true);
          }
          if (json.data.customerName) {
            setCustomerName(json.data.customerName);
          }
          if (json.data.overallRating) {
            setOverallRating(json.data.overallRating);
          }
          if (json.data.comment) {
            setComment(json.data.comment);
          }
          if (typeof json.data.wouldRecommend === "boolean") {
            setWouldRecommend(json.data.wouldRecommend);
          }
          if (json.data.aspectRatings) {
            const savedAspects =
              json.data.aspectRatings.subCriteria || json.data.aspectRatings;
            setSubRatings((prev) => ({
              ...prev,
              ...savedAspects,
            }));
          }
        } else {
          setError(json.error || "Form feedback tidak ditemukan");
        }
      } catch (err: any) {
        setError("Gagal memuat form feedback. Silakan coba beberapa saat lagi.");
      } finally {
        setLoading(false);
      }
    }
    loadFeedback();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overallRating) {
      alert("Mohon berikan rating keseluruhan terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);
      const therapistAvg = calculateCategoryAverage("therapist", subRatings);
      const facilityAvg = calculateCategoryAverage("facility", subRatings);
      const serviceAvg = calculateCategoryAverage("service", subRatings);
      const valueAvg = calculateCategoryAverage("value", subRatings);
      const aspectPayload = buildAspectRatingsPayload(subRatings);

      const res = await fetch(`/api/feedback/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overallRating,
          therapistRating: data?.therapist ? Math.round(therapistAvg) : null,
          facilityRating: Math.round(facilityAvg),
          serviceRating: Math.round(serviceAvg),
          valueRating: Math.round(valueAvg),
          comment,
          aspectRatings: aspectPayload,
          wouldRecommend,
          isAnonymous,
          customerName: isAnonymous ? null : customerName,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert(json.error || "Gagal mengirim feedback");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan saat mengirim feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const isRadjaBekam = data?.branch?.brand === "RADJA_BEKAM";
  const brandName = isRadjaBekam ? "Radja Bekam" : "Navara Reflexology";
  const brandTagline = isRadjaBekam ? "Pelopor Bekam Steril & Medis" : "Solusi Teman Sehatku";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <p className="text-emerald-200/80 font-medium">Memuat form kepuasan pelanggan...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold mb-2">Tautan Tidak Tersedia</h1>
        <p className="text-white/60 text-sm max-w-sm mb-6">{error || "Link feedback mungkin sudah kedaluwarsa atau tidak valid."}</p>
        <a
          href="/"
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition"
        >
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center mx-auto mb-5 text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Terima Kasih! 🙏</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Masukan berharga dari Anda sangat berarti bagi kami di <strong className="text-emerald-700">{brandName}</strong> untuk terus meningkatkan kualitas terapis dan kenyamanan klinik.
          </p>

          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 text-xs text-slate-600 space-y-1 mb-6 text-left">
            <div className="flex justify-between font-medium">
              <span>Cabang:</span>
              <span className="font-bold text-slate-800">{data.branch?.name || "Klinik"}</span>
            </div>
            {data.therapist && (
              <div className="flex justify-between font-medium">
                <span>Terapis:</span>
                <span className="font-bold text-slate-800">{data.therapist.name}</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-1 border-t border-emerald-200/60">
              <span>Status Penilaian:</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Terkirim
              </span>
            </div>
          </div>

          {data.branch?.whatsappNumber && (
            <a
              href={`https://wa.me/${data.branch.whatsappNumber.replace(/^0/, "62").replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition mb-3"
            >
              <MessageSquare className="w-4 h-4" /> Hubungi WhatsApp Cabang
            </a>
          )}

          <a
            href="/"
            className="block text-slate-400 hover:text-slate-600 text-xs font-semibold mt-4 transition"
          >
            ← Selesai & Tutup Halaman
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-6 px-4 pb-20">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/15 blur-[120px] rounded-full" />
      </div>

      {/* Header Container */}
      <header className="w-full max-w-lg text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 mb-3 shadow-xl">
          <Image
            src={isRadjaBekam ? "/navara-logo.png" : "/navara-logo.png"}
            alt={brandName}
            width={44}
            height={44}
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">{brandName}</h1>
        <p className="text-emerald-300 text-xs font-semibold tracking-wide uppercase mt-0.5">{brandTagline}</p>
      </header>

      {/* Visit Meta Card */}
      <div className="w-full max-w-lg bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="overflow-hidden flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kunjungan di Cabang</span>
            <p className="font-bold text-sm text-white truncate">{data.branch?.name || "Klinik Utama"}</p>
          </div>
        </div>

        {data.therapist && (
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
                {data.therapist.photoUrl ? (
                  <img src={data.therapist.photoUrl} alt={data.therapist.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  data.therapist.name.charAt(0)
                )}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Terapis Anda</span>
                <span className="text-xs font-bold text-slate-200">{data.therapist.name}</span>
              </div>
            </div>
            {data.services.length > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Layanan</span>
                <span className="text-xs font-semibold text-emerald-400 truncate max-w-[150px] inline-block">
                  {data.services.join(", ")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Feedback Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
        {/* 1. OVERALL RATING */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Penilaian Keseluruhan
          </span>
          <h2 className="text-lg font-bold text-white mb-1">Bagaimana Pengalaman Anda Hari Ini?</h2>
          <p className="text-xs text-slate-400 mb-6">Sentuh bintang untuk memberikan penilaian</p>

          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setOverallRating(star)}
                className="p-2 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    star <= overallRating
                      ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                      : "text-slate-600 hover:text-slate-500"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="min-h-[28px] flex items-center justify-center">
            <span className="text-sm font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 rounded-full">
              {RATING_LABELS[overallRating]}
            </span>
          </div>
        </div>

        {/* 2. DETAILED ASPECT RATINGS (ACCORDION SECTIONS) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Penilaian Aspek Terperinci
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Ketuk untuk buka/tutup rincian
            </span>
          </div>

          {FEEDBACK_CATEGORIES.map((cat) => {
            // If category is therapist and no therapist is assigned to visit, skip it
            if (cat.id === "therapist" && !data.therapist) return null;

            const isExpanded = expandedCategories[cat.id] ?? true;
            const catAvg = calculateCategoryAverage(cat.id, subRatings);

            const iconMap: Record<string, any> = {
              therapist: <Activity className="w-4 h-4 text-emerald-400" />,
              facility: <Building2 className="w-4 h-4 text-cyan-400" />,
              service: <User className="w-4 h-4 text-amber-400" />,
              value: <Sparkles className="w-4 h-4 text-purple-400" />,
            };

            const title =
              cat.id === "therapist" && data.therapist
                ? `Kinerja Terapis (${data.therapist.name})`
                : cat.title;

            return (
              <div
                key={cat.id}
                className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl transition-all duration-200"
              >
                {/* Header / Accordion trigger */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-700/30 transition cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 rounded-xl bg-slate-900/70 border border-slate-700/60 shrink-0">
                      {iconMap[cat.id]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-white">{title}</h4>
                        <span className="text-[10px] bg-slate-700/70 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                          {cat.subCriteria.length} Aspek
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Average badge */}
                    <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-xl">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black text-amber-300">
                        {catAvg.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Sub-criteria list */}
                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 space-y-2.5 border-t border-slate-700/50">
                    {cat.subCriteria.map((sub) => {
                      const currentScore = subRatings[sub.key] ?? 5;
                      const scoreText =
                        currentScore === 5
                          ? "Sangat Baik 🌟"
                          : currentScore === 4
                          ? "Baik 👍"
                          : currentScore === 3
                          ? "Cukup 😐"
                          : currentScore === 2
                          ? "Kurang 🙁"
                          : "Sangat Kurang 😞";

                      return (
                        <div
                          key={sub.key}
                          className="bg-slate-900/60 border border-slate-700/50 hover:border-slate-600/70 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                        >
                          <div className="pr-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-xs text-white">
                                {sub.label}
                              </p>
                              <span className="text-[10px] text-amber-300/90 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded-md">
                                {scoreText}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {sub.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 self-center sm:self-auto shrink-0 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => handleSubRatingChange(sub.key, star)}
                                className="p-1 hover:scale-125 active:scale-95 transition-transform focus:outline-none"
                                title={`${star} Bintang`}
                              >
                                <Star
                                  className={`w-5 h-5 transition-colors ${
                                    star <= currentScore
                                      ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]"
                                      : "text-slate-700 hover:text-slate-600"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 3. RECOMMENDATION (NPS) */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 shadow-2xl">
          <h3 className="font-bold text-sm text-white mb-1">Apakah Anda akan merekomendasikan {brandName} kepada teman atau keluarga?</h3>
          <p className="text-xs text-slate-400 mb-4">Pilihan Anda membantu kami mengukur kualitas rekomendasi</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWouldRecommend(true)}
              className={`py-3.5 px-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                wouldRecommend === true
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/10"
                  : "bg-slate-900/40 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              <ThumbsUp className="w-4 h-4 text-emerald-400" /> Pasti, Sangat Rekomendasi
            </button>
            <button
              type="button"
              onClick={() => setWouldRecommend(false)}
              className={`py-3.5 px-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                wouldRecommend === false
                  ? "bg-red-500/20 border-red-400 text-red-300 shadow-lg shadow-red-500/10"
                  : "bg-slate-900/40 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              <ThumbsDown className="w-4 h-4 text-red-400" /> Mungkin Belum
            </button>
          </div>
        </div>

        {/* 4. OPEN COMMENTS & SUGGESTIONS */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 shadow-2xl">
          <label className="block font-bold text-sm text-white mb-1">
            Kritik, Saran & Pesan Tambahan <span className="text-slate-400 text-xs font-normal">(Opsional)</span>
          </label>
          <p className="text-xs text-slate-400 mb-3">
            Tuliskan apa saja yang menurut Anda bisa kami tingkatkan untuk kunjungan berikutnya.
          </p>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Contoh: Terapis sangat teliti dan ramah, ruangan dingin dan nyaman..."
            className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />

          {/* Anonymous toggle */}
          <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-300">Kirim Secara Anonim?</p>
              <p className="text-[10px] text-slate-500">Nama Anda tidak akan ditampilkan ke terapis</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isAnonymous ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  isAnonymous ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.99] text-white font-bold text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Mengirimkan Penilaian...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Kirim Feedback Sekarang</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
