export type SubCriterion = {
  key: string;
  label: string;
  description: string;
};

export type FeedbackCategory = {
  id: "therapist" | "facility" | "service" | "value";
  title: string;
  subtitle: string;
  subCriteria: SubCriterion[];
};

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  {
    id: "therapist",
    title: "Kinerja & Keahlian Terapis",
    subtitle: "Evaluasi kualitas sentuhan, ketelitian, dan etika terapis selama tindakan",
    subCriteria: [
      {
        key: "tekanan_pijatan",
        label: "Tekanan & Kekuatan Pijatan",
        description: "Kekuatan, irama, dan kenyamanan tekanan pijatan terapis",
      },
      {
        key: "ketelitian_akurasi",
        label: "Ketelitian & Akurasi Titik",
        description: "Ketepatan fokus pada titik keluhan dan ketelatenan terapi",
      },
      {
        key: "keramahan_komunikasi",
        label: "Keramahan & Komunikasi",
        description: "Kesopanan, kepekaan menanyakan kenyamanan (terlalu keras/sakit), dan etika",
      },
      {
        key: "kebersihan_penampilan",
        label: "Kebersihan & Kerapihan Terapis",
        description: "Kerapihan seragam, kebersihan tangan, kuku, dan wangi terapis",
      },
      {
        key: "ketepatan_waktu",
        label: "Ketepatan Durasi Terapi",
        description: "Kesesuaian durasi waktu pengerjaan dengan paket yang dipilih",
      },
    ],
  },
  {
    id: "facility",
    title: "Fasilitas & Kebersihan Klinik",
    subtitle: "Kenyamanan suasana ruangan, kebersihan, dan higienitas peralatan",
    subCriteria: [
      {
        key: "kerapihan_ruangan",
        label: "Kerapihan & Suasana Bilik",
        description: "Kerapihan kamar terapi, penataan sprei, dan kenyamanan kasur terapi",
      },
      {
        key: "kenyamanan_suhu_aroma",
        label: "Suhu Ruangan & Aroma Terapi",
        description: "Kesejukan pendingin ruangan (AC) dan keharuman aroma esensial",
      },
      {
        key: "higienitas_alat",
        label: "Higienitas Perlengkapan Terapi",
        description: "Kebersihan handuk, sterilisasi mangkok bekam, jarum, dan alat terapi",
      },
      {
        key: "fasilitas_umum",
        label: "Fasilitas Penunjang & Toilet",
        description: "Kenyamanan ruang tunggu, dispenser air, kebersihan toilet, dan area parkir",
      },
    ],
  },
  {
    id: "service",
    title: "Pelayanan Kasir & Staff Front Office",
    subtitle: "Keramahan proses reservasi, sambutan kedatangan, dan administrasi",
    subCriteria: [
      {
        key: "sambutan_keramahan",
        label: "Sambutan & Keramahan Front Office",
        description: "Keramahan, senyuman, dan kesopanan staff saat kedatangan dan kepulangan",
      },
      {
        key: "ketepatan_jadwal",
        label: "Ketepatan Jadwal & Efisiensi Antrean",
        description: "Kecepatan proses registrasi, konfirmasi reservasi, dan kepastian jam mulai",
      },
      {
        key: "kejelasan_informasi",
        label: "Kejelasan Informasi & Menu Layanan",
        description: "Pemberian informasi manfaat paket, konsultasi keluhan, dan anjuran pasca terapi",
      },
    ],
  },
  {
    id: "value",
    title: "Kesesuaian Harga & Manfaat",
    subtitle: "Perbandingan nilai manfaat terapi dengan biaya yang dikeluarkan",
    subCriteria: [
      {
        key: "harga_sebanding_manfaat",
        label: "Keseimbangan Biaya & Manfaat Terapi",
        description: "Khasiat, kebugaran, dan rasa segar tubuh sebanding dengan biaya yang dibayar",
      },
      {
        key: "transparansi_biaya",
        label: "Transparansi Biaya & Kemudahan Transaksi",
        description: "Kejelasan struk rincian tagihan, tanpa biaya tersembunyi, dan ragam metode pembayaran",
      },
    ],
  },
];

// Flat list of all sub-criteria keys with default score 5
export const DEFAULT_SUB_RATINGS: Record<string, number> = FEEDBACK_CATEGORIES.reduce(
  (acc, category) => {
    category.subCriteria.forEach((sub) => {
      acc[sub.key] = 5;
    });
    return acc;
  },
  {} as Record<string, number>
);

// Calculate category average (1.0 - 5.0) from current sub-ratings
export function calculateCategoryAverage(
  categoryId: "therapist" | "facility" | "service" | "value",
  subRatings: Record<string, number>
): number {
  const category = FEEDBACK_CATEGORIES.find((c) => c.id === categoryId);
  if (!category || category.subCriteria.length === 0) return 5;

  const validScores = category.subCriteria
    .map((s) => subRatings[s.key])
    .filter((score): score is number => typeof score === "number" && score > 0);

  if (validScores.length === 0) return 5;
  const sum = validScores.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / validScores.length).toFixed(1));
}

// Build aspectRatings payload containing subCriteria, category averages, and legacy compatibility
export function buildAspectRatingsPayload(subRatings: Record<string, number>) {
  const therapistAvg = calculateCategoryAverage("therapist", subRatings);
  const facilityAvg = calculateCategoryAverage("facility", subRatings);
  const serviceAvg = calculateCategoryAverage("service", subRatings);
  const valueAvg = calculateCategoryAverage("value", subRatings);

  return {
    ...subRatings,
    // Grouped objects
    subCriteria: { ...subRatings },
    categoryAverages: {
      therapist: therapistAvg,
      facility: facilityAvg,
      service: serviceAvg,
      value: valueAvg,
    },
    // Legacy keys mapping for backward compatibility
    cleanliness: subRatings["higienitas_alat"] ?? subRatings["kerapihan_ruangan"] ?? 5,
    friendliness: subRatings["keramahan_komunikasi"] ?? subRatings["sambutan_keramahan"] ?? 5,
    punctuality: subRatings["ketepatan_waktu"] ?? subRatings["ketepatan_jadwal"] ?? 5,
    comfort: subRatings["kenyamanan_suhu_aroma"] ?? subRatings["kerapihan_ruangan"] ?? 5,
    technique: subRatings["tekanan_pijatan"] ?? subRatings["ketelitian_akurasi"] ?? 5,
  };
}

// Lookup label & description for any sub-criterion key (supports new and legacy)
export function getCriterionMetadata(key: string): { label: string; description?: string } {
  for (const cat of FEEDBACK_CATEGORIES) {
    const found = cat.subCriteria.find((s) => s.key === key);
    if (found) return found;
  }

  // Fallback for legacy keys
  const legacyMap: Record<string, { label: string; description: string }> = {
    cleanliness: { label: "Kebersihan & Higienitas", description: "Kebersihan fasilitas & alat" },
    friendliness: { label: "Keramahan Staff", description: "Keramahan terapis & resepsionis" },
    punctuality: { label: "Ketepatan Waktu", description: "Ketepatan durasi & antrean" },
    comfort: { label: "Kenyamanan Ruangan", description: "Kenyamanan suasana ruangan" },
    technique: { label: "Kualitas Terapi / Teknik", description: "Kualitas dan teknik terapi" },
  };

  if (legacyMap[key]) {
    return legacyMap[key];
  }

  return {
    label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  };
}
