// =============================================================================
// 📝 TODO: DAFTAR MATERI YANG KURANG UNTUK SNBT 2026
// Harap tambahkan materi berikut ke dalam MOCK_LESSONS
// =============================================================================

// --- 1. PENGETAHUAN KUANTITATIF (PK) ---
// [ ] PK-13: Interpretasi Data & Grafik Ganda (Infografik)
// [ ] PK-14: Pecahan Kontekstual (Diskon Bertingkat & Pajak)
// [ ] PK-15: Masalah Kerja (Man-Hours) & Perbandingan Tersarang

// --- 2. LITERASI BAHASA INDONESIA (LBI) ---
// [ ] LBI-07: Teks Eksposisi (Ilmiah Populer) - Struktur & Ide Pokok
// [ ] LBI-08: Teks Argumentasi (Opini & Editorial) - Evaluasi Fakta vs Opini

// --- 3. LITERASI BAHASA INGGRIS (LBE) ---
// [ ] LBE-08: Struktur Teks (Procedure vs Explanation)
// [ ] LBE-09: Tense in Context (Narrative Text flashback)

// --- 4. PENALARAN UMUM (PU) ---
// [ ] PU-12: Logika Keluarga (Family Tree)
// [ ] PU-13: Logika Arah & Jarak (Peta/Kompass)
// [ ] PU-14: Matrix Puzzles (3x3 Grid)

// --- 5. PENALARAN MATEMATIKA (PM) ---
// [ ] PM-05: Deret Campuran (Huruf & Angka)
import { SubtestType, Question, Lesson } from './types';

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'pu-1',
    subtest: SubtestType.PenalaranUmum,
    text: 'Semua pohon di hutan A adalah pohon jati. Sebagian pohon jati berdaun lebar. Kesimpulan yang tepat adalah...',
    options: [
      'Semua pohon di hutan A berdaun lebar.',
      'Sebagian pohon di hutan A berdaun lebar.',
      'Semua pohon jati adalah pohon di hutan A.',
      'Tidak ada pohon jati yang berdaun lebar.',
      'Sebagian pohon berdaun lebar bukan pohon jati.'
    ],
    correctAnswer: 1,
    explanation: 'Karena semua pohon di hutan A adalah jati, dan sebagian jati berdaun lebar, maka otomatis sebagian pohon di hutan A juga berdaun lebar.',
    quickTrick: 'Gunakan diagram Venn. Hutan A ada di dalam Jati. Jika sebagian Jati lebar, maka ada kemungkinan Hutan A juga lebar.'
  }
];

export const MOCK_LESSONS: Lesson[] = [
  // =====================
  // PENALARAN UMUM (PU)
  // =====================
  {
    id: 'pu-1',
    subtest: SubtestType.PenalaranUmum,
    title: 'Implikasi, Negasi, dan Kontraposisi',
    summary: 'Dasar logika formal dalam menarik kesimpulan.',
    points: ['p → q', 'Negasi: p ∧ ¬q', 'Kontraposisi: ¬q → ¬p'],
    trapPatterns: ['Mengira konvers setara implikasi', 'Salah negasi kuantor'],
    quickTricks: [{ name: 'Kontra Aman', formula: '¬q → ¬p', description: 'Kontraposisi selalu benar' }],
    example: {
      question: 'Jika hujan, maka jalanan licin. Sekarang jalanan tidak licin. Kesimpulan?',
      solution: [
        'Identifikasi premis: Hujan (p) → Licin (q).',
        'Fakta: Tidak licin (¬q).',
        'Gunakan Kontraposisi: ¬q → ¬p.',
        'Kesimpulan: Tidak hujan.'
      ],
      formulas: [
        'Implikasi: p → q',
        'Kontraposisi: ¬q → ¬p (Setara dengan implikasi)',
        'Negasi Implikasi: ¬(p → q) ≡ p ∧ ¬q'
      ]
    }
  },
  {
    id: 'pu-2',
    subtest: SubtestType.PenalaranUmum,
    title: 'Silogisme Kategorik',
    summary: 'Menarik kesimpulan dari dua premis.',
    points: ['Semua – Sebagian – Tidak ada', 'Modus Ponens', 'Modus Tollens'],
    trapPatterns: ['Dua premis sebagian', 'Middle term tidak terhubung'],
    quickTricks: [{ name: 'Venn Cepat', formula: 'Irisan', description: 'Gunakan diagram mental' }],
    example: {
      question: 'Semua dokter pintar. Sebagian orang yang pintar suka kopi. Kesimpulan?',
      solution: [
        'Premis 1: Lingkaran Dokter di dalam Pintar.',
        'Premis 2: Irisan Pintar and Suka Kopi tumpang tindih.',
        'Apakah irisan tersebut menyentuh Dokter? Belum tentu.',
        'Kesimpulan: Tidak dapat ditarik (Inkonsisten).'
      ],
      formulas: [
        'Barbara: Semua A adalah B, Semua B adalah C → Semua A adalah C',
        'Darii: Semua A adalah B, Sebagian B adalah C → Sebagian A adalah C',
        'Ferio: Tidak ada A yang B, Sebagian C adalah A → Sebagian C bukan B'
      ]
    }
  },
  {
    id: 'pu-3',
    subtest: SubtestType.PenalaranUmum,
    title: 'Analogi dan Hubungan Kata',
    summary: 'Menentukan pola relasi antar konsep.',
    points: ['Fungsi', 'Sebab akibat', 'Bagian–keseluruhan'],
    trapPatterns: ['Relasi terbalik', 'Relasi terlalu umum'],
    quickTricks: [{ name: 'Kalimat Penghubung', formula: 'A berfungsi untuk B', description: 'Samakan relasi' }],
    example: {
      question: 'KULIT : APEL :: ... : ... (Pilih yang paling tepat)',
      solution: [
        'Analisis: Kulit adalah pelindung luar/pembungkus Apel.',
        'Cari opsi yang memiliki relasi pembungkus/bagian terluar.',
        'Contoh jawaban: KERANG : TELUR / KULIT : JERUK.'
      ],
      formulas: [
        'Sinonim: A = B',
        'Antonim: A = lawan B',
        'Bagian-Seluruh: A adalah bagian dari B',
        'Fungsi: A digunakan untuk B'
      ]
    }
  },
  {
    id: 'pu-4',
    subtest: SubtestType.PenalaranUmum,
    title: 'Asumsi dan Kekuatan Argumen',
    summary: 'Menilai argumen valid atau cacat.',
    points: ['Asumsi tersembunyi', 'Argumen kuat vs lemah'],
    trapPatterns: ['Bahasa meyakinkan', 'Data tidak relevan'],
    quickTricks: [{ name: 'Hilangkan Asumsi', formula: 'Argumen runtuh?', description: 'Asumsi inti' }],
    example: {
      question: 'Argumen: "Kita harus menaikkan pajak rokok untuk menurunkan jumlah perokok." Asumsi apa yang diperlukan?',
      solution: [
        'Cari jembatan logis antara kenaikan pajak dan penurunan perokok.',
        'Jika kenaikan pajak TIDAK membuat orang berhenti merokok, argumen runtuh.',
        'Asumsi: Kenaikan harga akan mengurangi permintaan rokok.'
      ],
      formulas: [
        'Cek Asumsi: Negasi pernyataan, jika argumen hancur → itu asumsi.',
        'Argumen Kuat: Premis relevan & logis → Kesimpulan.',
        'Argumen Lemah: Premis kurang mendukung → Kesimpulan.'
      ]
    }
  },
  {
    id: 'pu-5',
    subtest: SubtestType.PenalaranUmum,
    title: 'Kesalahan Logika (Fallacy)',
    summary: 'Kesimpulan tampak logis tapi salah.',
    points: ['Generalisasi', 'False cause', 'Korelasi semu'],
    trapPatterns: ['Contoh terbatas', 'Urutan waktu'],
    quickTricks: [{ name: 'Uji Selalu', formula: 'Apakah selalu benar?', description: 'Jika tidak → fallacy' }],
    example: {
      question: '"Setiap kali saya bawa payung, hujan turun. Jadi, payung menyebabkan hujan." Mengapa salah?',
      solution: [
        'Hanya karena kejadian B (Hujan) selalu mengikuti A (Payung), tidak berarti A menyebabkan B.',
        'Ini adalah kesalahan Post Hoc Ergo Propter Hoc.',
        'Faktor ketiga: Saya membawa payung karena melihat awan gelap.'
      ],
      formulas: [
        'Generalisasi Cepat: Kesimpulan dari contoh terlalu sedikit.',
        'False Cause: Mengira korelasi adalah sebab-akibat.',
        'Ad Hominem: Menyerang pribadi, bukan argumen.'
      ]
    }
  },
  {
    id: 'pu-6',
    subtest: SubtestType.PenalaranUmum,
    title: 'Rantai Implikasi Panjang',
    summary: 'Penalaran dengan 3–4 implikasi berurutan.',
    points: ['p → q → r → s', 'Menarik kesimpulan langsung dari awal ke akhir'],
    trapPatterns: ['Lompat kesimpulan', 'Salah arah implikasi'],
    quickTricks: [{ name: 'Ujung ke Ujung', formula: 'p → s', description: 'Ambil awal dan akhir rantai' }],
    example: {
      question: 'Jika Lulus (L) → Kerja (K). Jika Kerja (K) → Kaya (Y). Jika Kaya (Y) → Bahagia (H). Premis: Tidak Bahagia.',
      solution: [
        'Rantai: L → K → Y → H.',
        'Fakta: ¬H (Tidak Bahagia).',
        'Jalan mundur (Kontraposisi): ¬H → ¬Y → ¬K → ¬L.',
        'Kesimpulan: Tidak Lulus.'
      ],
      formulas: [
        'Rantai Logika: Jika A→B, B→C, maka A→C.',
        'Kontraposisi Rantai: Jika ¬C, maka ¬A.'
      ]
    }
  },
  {
    id: 'pu-7',
    subtest: SubtestType.PenalaranUmum,
    title: 'Paradox dan Kontradiksi',
    summary: 'Mendeteksi pernyataan yang saling meniadakan.',
    points: ['Kontradiksi internal', 'Pernyataan tidak mungkin benar bersamaan'],
    trapPatterns: ['Bahasa terlihat logis'],
    quickTricks: [{ name: 'Uji Bersamaan', formula: 'Bisa benar bareng?', description: 'Jika tidak → kontradiksi' }],
    example: {
      question: 'Pernyataan X: "Semua siswa kelas A lulus." Pernyataan Y: "Ada siswa kelas A yang tidak lulus." Apa hubungannya?',
      solution: [
        'Pernyataan X mengklaim himpunan "Tidak Lulus" kosong.',
        'Pernyataan Y mengklaim ada anggota di himpunan "Tidak Lulus".',
        'Keduanya tidak mungkin benar dalam waktu yang sama.',
        'Hubungan: Kontradiktif.'
      ],
      formulas: [
        'Kontradiksi: A dan ¬A (Tidak mungkin benar bersamaan).',
        'Kontrari: "Semua A" vs "Tidak ada A" (Tidak mungkin benar bersamaan, bisa salah bersamaan).'
      ]
    }
  },
  {
    id: 'pu-8',
    subtest: SubtestType.PenalaranUmum,
    title: 'Penalaran Berbasis Diagram & Skema',
    summary: 'Menarik kesimpulan dari bagan non-numerik.',
    points: ['Diagram alur', 'Hubungan simbolik'],
    trapPatterns: ['Mengabaikan arah panah'],
    quickTricks: [{ name: 'Ikuti Panah', formula: 'Flow', description: 'Jangan lompat tahap' }],
    example: {
      question: 'Diagram: Kotak A --(panah)--> Kotak B --(panah)--> Kotak C. Jika A terjadi, apa status C?',
      solution: [
        'Arah alur: A memicu B, B memicu C.',
        'Jika A ada, maka B harus ada.',
        'Jika B ada, maka C harus ada.',
        'Kesimpulan: C terjadi.'
      ],
      formulas: [
        'Alur Kausal: A → B → C (A adalah syarat cukup bagi C).',
        'Alur Terbalik: C ← B ← A (C adalah akibat dari A).'
      ]
    }
  },
  {
    id: 'pu-9',
    subtest: SubtestType.PenalaranUmum,
    title: 'Analitik Reasoning: Penataan & Posisi',
    summary: 'Logika permainan untuk menentukan urutan atau posisi.',
    points: ['Susunan linear', 'Posisi relatif', 'Deduksi bertahap'],
    trapPatterns: ['Asumsi posisi tetap', 'Mengabaikan kondisi mutlak'],
    quickTricks: [{ name: 'Skema Kotak', formula: 'Visualisasi', description: 'Gambar kotak/kursi kosong' }],
    example: {
      question: '3 buku disusun berjejer. Buku Matematika di kiri Fisika. Biologi di sebelah Fisika. Urutan dari kiri?',
      solution: [
        'Info 1: M - F (M di kiri F).',
        'Info 2: B di sebelah F.',
        'Gabungan: M harus di ujung kiri agar F punya ruang untuk B di sebelahnya.',
        'Susunan: Matematika - Fisika - Biologi.'
      ],
      formulas: [
        'Posisi Relatif: "A di kiri B" tidak selalu berarti tepat di samping.',
        'Constraint Mutlak: Aturan yang membatasi ruang gerak dipecahkan duluan.'
      ]
    }
  },
  {
    id: 'pu-10',
    subtest: SubtestType.PenalaranUmum,
    title: 'Analitik Reasoning: Pengelompokan',
    summary: 'Membagi elemen ke dalam kategori berdasarkan aturan.',
    points: ['Inclusion/Exclusion', 'Kapasitas kelompok', 'Kombinasi terbatas'],
    trapPatterns: ['Campur aduk aturan antar kelompok', 'Lupa syarat unik'],
    quickTricks: [{ name: 'Tabel Cross', formula: 'Grid', description: 'Centang possible/impossible' }],
    example: {
      question: 'Tim Terdiri dari 3 orang. Kandidat: A, B, C, D. Aturan: Jika A masuk, B tidak boleh. Jika C masuk, D harus masuk.',
      solution: [
        'Cek opsi. Jika ada opsi berisi A dan B bersamaan → Salah.',
        'Jika ada opsi berisi C tapi tidak ada D → Salah.'
      ],
      formulas: [
        'Selection: Jika A, maka tidak B (A ≠ B).',
        'Conditional: Jika C, maka D (C → D).'
      ]
    }
  },
  {
    id: 'pu-11',
    subtest: SubtestType.PenalaranUmum,
    title: 'Logika Kursi Melingkar (Meja Bundar)',
    summary: 'Penataan objek dalam formasi melingkar yang memiliki aturan posisi berbeda dari linear.',
    points: ['Posisi relatif (kiri/kanan)', 'Meja bundar tidak memiliki ujung', 'Penentuan titik acuan'],
    trapPatterns: ['Menganggap posisi 1 dan 5 berdekatan seperti di barisan', 'Bingung arah kiri/kanan saat menghadap pusat'],
    quickTricks: [{ name: 'Gambar Lingkaran', formula: 'n-1 factorial', description: 'Gunakan satu orang sebagai patokan tetap' }],
    example: {
      question: '5 orang (A, B, C, D, E) duduk melingkar. A di sebelah B. C di antara D dan E. Jika B di depan C, siapa di sebelah E?',
      solution: [
        'Gambar lingkaran dan letakkan C sebagai patokan bawah.',
        'B di depan C (patokan atas).',
        'C di antara D dan E (D-C-E atau E-C-D).',
        'A di sebelah B. Karena B di atas, A bisa di kiri atau kanan B.',
        'Analisis sisa ruang untuk menentukan posisi pasti.'
      ],
      formulas: [
        'Permutasi Siklis: (n-1)!',
        'Relasi Berhadapan: Hanya ada jika jumlah orang genap.'
      ]
    }
  },

  // =====================
  // PENGETAHUAN KUANTITATIF (PK)
  // =====================
  {
    id: 'pk-1',
    subtest: SubtestType.PengetahuanKuantitatif,
    title: 'Aritmetika Dasar',
    summary: 'Operasi hitung dan rasio.',
    points: ['Persen', 'Perbandingan', 'Skala'],
    trapPatterns: ['Salah konversi persen'],
    quickTricks: [{ name: 'Basis 100', formula: 'Anggap 100', description: 'Mempermudah persen' }],
    example: {
      question: 'Harga baju Rp120.000 setelah diskon 20%. Berapakah harga aslinya?',
      solution: [
        'Harga Akhir = Harga Awal × (100% - Diskon).',
        '120.000 = Harga Awal × 0,8.',
        'Harga Awal = 120.000 / 0,8 = 150.000.'
      ],
      formulas: [
        'Persen: % = (Bagian / Seluruh) × 100%',
        'Diskon: Baru = Lama × (1 - %)',
        'Pajak/Kenaikan: Baru = Lama × (1 + %)',
        'Perbandingan: a/b = c/d → a×d = b×c'
      ]
    }
  },
  {
    id: 'pk-2',
    subtest: SubtestType.PengetahuanKuantitatif,
    title: 'Aljabar Dasar',
    summary: 'Manipulasi simbol dan persamaan.',
    points: ['Persamaan linear', 'Faktorisasi'],
    trapPatterns: ['Salah tanda'],
    quickTricks: [{ name: 'Substitusi Nilai', formula: '0 atau 1', description: 'Cek cepat' }],
    example: {
      question: 'Jika 2x + 5 = 13, berapakah nilai x?',
      solution: [
        '2x = 13 - 5.',
        '2x = 8.',
        'x = 4.'
      ],
      formulas: [
        'Linear: ax + b = 0 → x = -b/a',
        'Pangkat: (a^m)^n = a^(m×n)',
        'Pecahan Aljabar: a/b + c/d = (ad+bc)/bd'
      ]
    }
  },
  {
    id: 'pk-3',
    subtest: SubtestType.PengetahuanKuantitatif,
    title: 'Statistika Dasar',
    summary: 'Membaca dan mengolah data.',
    points: ['Mean', 'Median', 'Modus'],
    trapPatterns: ['Rata-rata palsu'],
    quickTricks: [{ name: 'Coret Ekstrem', formula: 'Stabilkan', description: 'Cek pengaruh data' }],
    example: {
      question: 'Nilai: 7, 8, 8, 9, 10. Berapa Mean, Median, dan Modus?',
      solution: [
        'Mean = (7+8+8+9+10)/5 = 42/5 = 8,4.',
        'Median = Nilai tengah (urut data) = 8.',
        'Modus = Nilai paling sering = 8.'
      ],
      formulas: [
        'Mean (Rata-rata) = ΣX / n',
        'Median = Tengah data terurut',
        'Modus = Nilai dengan frekuensi tertinggi'
      ]
    }
  },
  {
    id: 'pk-4',
    subtest: SubtestType.PengetahuanKuantitatif,
    title: 'Perbandingan Tanpa Hitung',
    summary: 'Membandingkan nilai secara logis.',
    points: ['Estimasi', 'Batas atas–bawah'],
    trapPatterns: ['Hitung berlebihan'],
    quickTricks: [{ name: 'Dekat 1', formula: 'Banding kasar', description: 'Lebih cepat' }],
    example: {
      question: 'Mana lebih besar: 49% dari 300 atau 51% dari 298?',
      solution: [
        '49% mendekati 50%. 51% juga mendekati 50%.',
        'Bandingkan penyebutnya: 300 > 298.',
        'Karena persentasenya hampir sama, angka dasar menentukan.',
        'Kesimpulan: 49% dari 300 lebih besar.'
      ],
      formulas: [
        'Perkiraan: Bulatkan angka ke puluhan/ratusan terdekat.',
        'Logika: Jika a > c dan b = d, maka a×b > c×d.'
      ]
    }
  },
  {
    id: 'pk-5',
    subtest: SubtestType.PengetahuanKuantitatif,
    title: 'Peluang Dasar Tanpa Rumus',
    summary: 'Probabilitas intuitif berbasis logika.',
    points: ['Kemungkinan relatif', 'Perbandingan peluang'],
    trapPatterns: ['Menghafal rumus'],
    quickTricks: [{ name: 'Banding Kasus', formula: 'Lebih mungkin?', description: 'Bandingkan langsung' }],
    example: {
      question: 'Dalam kantong ada 3 kelereng merah dan 2 biru. Diambil 1. Peluang merah?',
      solution: [
        'Total kelereng = 3 + 2 = 5.',
        'Kelereng merah = 3.',
        'Peluang = Kejadian / Total = 3/5.'
      ],
      formulas: [
        'Peluang (P) = n(A) / n(S)',
        'Peluang Komplemen: P(A) + P(Aᶜ) = 1'
      ]
    }
  },
  {
    id: 'pk-6',
    subtest: SubtestType.PengetahuanKuantitatif,
    title: 'Interpretasi Grafik Kompleks',
    summary: 'Menggabungkan tabel, grafik, dan teks.',
    points: ['Grafik ganda', 'Data implisit'],
    trapPatterns: ['Hanya baca satu grafik'],
    quickTricks: [{ name: 'Judul & Satuan', formula: 'Cek header', description: 'Kunci interpretasi' }],
    example: {
      question: 'Grafik batang menunjukkan penjualan dalam "Ribuan". Batang tahun 2020 menunjukkan angka 50. Berapa penjualan sebenarnya?',
      solution: [
        'Baca satuan: Ribuan.',
        'Baca nilai: 50.',
        'Kalikan: 50 × 1.000 = 50.000.'
      ],
      formulas: [
        'Membaca Grafik: Cek Sumbu X dan Sumbu Y.',
        'Kenaikan/penurunan = (Akhir - Awal) / Awal.'
      ]
    }
  },
  {
    id: 'pk-7',
    subtest: SubtestType.PengetahuanKuantitatif,
    title: 'Geometri Dasar: Bangun Datar',
    summary: 'Menghitung luas, keliling, dan sifat segi banyak.',
    points: ['Segitiga & Segiempat', 'Lingkaran', 'Teorema Pythagoras'],
    trapPatterns: ['Salah rumus', 'Lupa faktor 1/2 segitiga'],
    quickTricks: [{ name: 'Gambar Ulang', formula: 'Visual', description: 'Tandai sudut/sisi' }],
    example: {
      question: 'Persegi panjang panjang 10cm, lebar 5cm. Berapa kelilingnya?',
      solution: [
        'Rumus keliling = 2 × (p + l).',
        '2 × (10 + 5) = 2 × 15 = 30 cm.'
      ],
      formulas: [
        'Persegi: L = s², K = 4s',
        'Persegi Panjang: L = p×l, K = 2(p+l)',
        'Segitiga: L = ½×a×t',
        'Lingkaran: L = πr², K = 2πr'
      ]
    }
  },
  {
    id: 'pk-8',
    subtest: SubtestType.PengetahuanKuantitatif,
    title: 'Geometri Bangun Ruang',
    summary: 'Volume dan luas permukaan benda tiga dimensi.',
    points: ['Kubus & Balok', 'Tabung, Kerucut, Bola'],
    trapPatterns: ['Diameter vs Jari-jari', 'Luas permukaan vs Volume'],
    quickTricks: [{ name: 'Cek Satuan', formula: 'Kubik vs Persegi', description: 'Pastikan satuan sesuai' }],
    example: {
      question: 'Kubus memiliki rusuk 3 cm. Berapa volumenya?',
      solution: [
        'Volume Kubus: s × s × s.',
        '3 × 3 × 3 = 27 cm³.'
      ],
      formulas: [
        'Kubus: V = s³',
        'Balok: V = p×l×t',
        'Tabung: V = πr²t',
        'Bola: V = 4/3 πr³'
      ]
    }
  },
  {
    id: 'pk-9',
    subtest: SubtestType.PengetahuanKuantitatif,
    title: 'Himpunan & Diagram Venn',
    summary: 'Operasi irisan, gabungan, dan komplemen.',
    points: ['Irisan (∩)', 'Himpunan Semesta', 'Inklusi-Eksklusi'],
    trapPatterns: ['Menghitung irisan dua kali'],
    quickTricks: [{ name: 'Mulai dari Tengah', formula: 'Irisan dulu', description: 'Isi daerah potongan dahulu' }],
    example: {
      question: 'Suka Matematika=5, Suka Fisika=6, Suka Keduanya=3. Berapa total siswa?',
      solution: [
        'n(M ∪ F) = n(M) + n(F) - n(M ∩ F).',
        'Total = 5 + 6 - 3 = 8.'
      ],
      formulas: [
        'Irisan: n(A ∩ B)',
        'Gabungan: n(A ∪ B) = n(A) + n(B) - n(A ∩ B)',
        'Hanya A: n(A) - n(A ∩ B)'
      ]
    }
  },
  {
    id: 'pk-10',
    subtest: SubtestType.PengetahuanKuantitatif,
    title: 'Bilangan Pecahan & Desimal',
    summary: 'Operasi hitung bentuk pecahan dan desimal.',
    points: ['Pecahan senilai', 'Operasi campuran'],
    trapPatterns: ['Salah penyebut saat penjumlahan'],
    quickTricks: [{ name: 'Sederhanakan Dulu', formula: 'Bagi FPB', description: 'Perkecil angka sebelum hitung' }],
    example: {
      question: 'Hitung 1/4 + 1/2',
      solution: [
        'Samakan penyebut: 1/4 + 2/4 = 3/4.'
      ],
      formulas: [
        'Penjumlahan: a/b + c/d = (ad+bc) / bd',
        'Perkalian: (a/b) × (c/d) = (ac) / (bd)',
        'Pembagian: (a/b) : (c/d) = (ad) / (bc)'
      ]
    }
  },
  {
    id: 'pk-11',
    subtest: SubtestType.PengetahuanKuantitatif,
    title: 'Waktu dan Kecepatan',
    summary: 'Menghitung hubungan antara Jarak, Kecepatan, dan Waktu.',
    points: ['v = s/t', 'Kecepatan Rata-rata', 'Berpapasan & Menyusul'],
    trapPatterns: ['Lupa menyamakan satuan (km/jam vs m/detik)', 'Rata-rata kecepatan langsung dijumlah lalu bagi dua'],
    quickTricks: [{ name: 'Segitiga JKW', formula: 'J = K × W', description: 'Jarak di atas, Kecepatan & Waktu di bawah' }],
    example: {
      question: 'Mobil melaju 60 km/jam selama 2 jam. Berapa jarak yang ditempuh?',
      solution: [
        'K = 60 km/jam.',
        'W = 2 jam.',
        'J = K × W = 60 × 2 = 120 km.'
      ],
      formulas: [
        'Jarak (s) = Kecepatan (v) × Waktu (t)',
        'Kecepatan (v) = s / t',
        'Waktu (t) = s / v'
      ]
    }
  },
  {
    id: 'pk-12',
    subtest: SubtestType.PengetahuanKuantitatif,
    title: 'Pecahan Campuran & Operasi Pecahan',
    summary: 'Perkalian dan pembagian pecahan biasa maupun campuran.',
    points: ['Ubah ke pecahan biasa dulu', 'Pembagian adalah perkalian terbalik'],
    trapPatterns: ['Langsung mengalikan bilangan bulat tanpa mengubah pecahan'],
    quickTricks: [{ name: 'Coret Silang', formula: 'Simplifikasi', description: 'Sederhanakan angka sebelum dikali' }],
    example: {
      question: 'Hitunglah 1½ × 2/3',
      solution: [
        'Ubah 1½ menjadi 3/2.',
        'Operasi: 3/2 × 2/3.',
        'Coret 3 dengan 3, 2 dengan 2.',
        'Hasil = 1.'
      ],
      formulas: [
        'Perkalian: a/b × c/d = (ac)/(bd)',
        'Pembagian: a/b : c/d = a/b × d/c'
      ]
    }
  },

  // =====================
  // PPU (PENGETAHUAN & PEMAHAMAN UMUM)
  // =====================
  {
    id: 'ppu-1',
    subtest: SubtestType.PPU,
    title: 'Sinonim Kontekstual',
    summary: 'Menentukan makna kata berdasarkan penggunaan spesifik dalam kalimat.',
    points: ['Makna Denotatif vs Konotatif', 'Konteks Kalimat', 'Substitusi Kata'],
    trapPatterns: ['Memilih arti kamus utama padahal tidak sesuai konteks'],
    quickTricks: [{ name: 'Ganti Kata', formula: 'Coba substitusi', description: 'Ganti kata dengan pilihan jawaban' }],
    example: {
      question: 'Kata "instrumental" dalam kalimat "Pendidikan sangat instrumental dalam mobilitas sosial" bermakna?',
      solution: [
        'Identifikasi konteks: Pendidikan sebagai sarana untuk naik kelas sosial.',
        'Ganti kata: "Pendidikan sangat berguna/alat dalam mobilitas sosial".',
        'Kesimpulan: Makna yang tepat adalah "Berperan penting / Sebagai sarana".'
      ],
      formulas: [
        'Sinonim: Kata dengan makna setara dalam konteks tertentu.',
        'Polisemi: Satu kata dengan banyak arti tergantung kalimat.'
      ]
    }
  },
  {
    id: 'ppu-2',
    subtest: SubtestType.PPU,
    title: 'Makna Istilah dan Kata Serapan',
    summary: 'Memahami istilah teknis (ilmiah) dan penulisan serapan yang baku.',
    points: ['Istilah Bidang Ilmu', 'Ejaan Kata Serapan', 'PUEBI'],
    trapPatterns: ['Terkecoh kata yang terdengar keren tapi tidak baku'],
    quickTricks: [{ name: 'Cek Akar Kata', formula: 'Latin/Inggris', description: 'Ingat asal kata untuk menebak arti' }],
    example: {
      question: 'Apa arti istilah "ekosistem" dalam sebuah teks biologi?',
      solution: [
        'Konteks: Biologi (Lingkungan).',
        'Akar: Eco (Rumah/Lingkungan) + System (Tatanan).',
        'Definisi: Tatanan kesatuan utuh antara unsur lingkungan hidup.'
      ],
      formulas: [
        'Istilah: Kata dengan makna khusus dalam disiplin ilmu.',
        'Serapan Baku: Penulisan sesuai kaidah bahasa Indonesia (misal: "Activity" -> "Aktivitas").'
      ]
    }
  },
  {
    id: 'ppu-3',
    subtest: SubtestType.PPU,
    title: 'Padanan Kata (Analogi)',
    summary: 'Menentukan hubungan logis antar pasangan kata secara identik.',
    points: ['Hubungan Fungsi', 'Hubungan Tempat', 'Hubungan Sebab-Akibat'],
    trapPatterns: ['Hubungan terbalik (A:B vs B:A)'],
    quickTricks: [{ name: 'Buat Kalimat', formula: 'A adalah B', description: 'Hubungkan dua kata dengan kalimat pendek' }],
    example: {
      question: 'GURU : SEKOLAH :: ... : ...',
      solution: [
        'Relasi: Profesi - Tempat Kerja.',
        'Kalimat: Guru bekerja di Sekolah.',
        'Cari pola serupa: Petani bekerja di Sawah.'
      ],
      formulas: [
        'Analogi: A : B = C : D',
        'Symmetry: Relasi kiri harus sama persis dengan kanan.'
      ]
    }
  },
  {
    id: 'ppu-4',
    subtest: SubtestType.PPU,
    title: 'Kelompok Kata (Kategorisasi)',
    summary: 'Mengidentifikasi kata yang tidak termasuk dalam satu kategori tertentu.',
    points: ['Persamaan Karakteristik', 'Klasifikasi Objek', 'Logika Himpunan'],
    trapPatterns: ['Terkecoh oleh kata yang jarang didengar tapi satu kategori'],
    quickTricks: [{ name: 'Cari 4 Kemiripan', formula: '4 vs 1', description: 'Tentukan sifat yang dimiliki 4 kata' }],
    example: {
      question: 'Manakah yang tidak termasuk kelompoknya: Meja, Kursi, Lemari, Sapu, Tempat Tidur?',
      solution: [
        'Analisis 4 benda: Meja, Kursi, Lemari, Tempat Tidur adalah Furniture.',
        'Analisis benda ke-5: Sapu adalah alat kebersihan.',
        'Jawaban: Sapu.'
      ],
      formulas: [
        'Kategorisasi: Mengelompokkan berdasarkan ciri esensial.',
        'Logika Inklusi: Benda masuk ke dalam satu himpunan besar.'
      ]
    }
  },
  {
    id: 'ppu-5',
    subtest: SubtestType.PPU,
    title: 'Bahasa Panda (Kriptografi Logis)',
    summary: 'Menerjemahkan bahasa buatan berdasarkan pola pergeseran atau pemetaan huruf.',
    points: ['Pola Pergeseran Alfabet', 'Pola Penggantian Suku Kata', 'Struktur Logis'],
    trapPatterns: ['Menerjemahkan kata per kata tanpa mencari pola huruf'],
    quickTricks: [{ name: 'Tabel Abjad', formula: 'A=Z, B=Y', description: 'Tulis alfabet untuk cek jarak geser' }],
    example: {
      question: 'Jika "Kopi" berkode "Lpqj", maka "Teh" berkode?',
      solution: [
        'Cek pola K -> L (+1), o -> p (+1), p -> q (+1), i -> j (+1).',
        'Terapkan ke "Teh": T+1=U, e+1=f, h+1=i.',
        'Jawaban: Ufi.'
      ],
      formulas: [
        'Caesar Cipher: Pergeseran n langkah dalam alfabet.',
        'Pattern Matching: Mencari kesamaan aturan logis.'
      ]
    }
  },

  // =====================
  // PEMAHAMAN BACAAN & MENULIS (PBM)
  // =====================
  {
    id: 'pbm-1',
    subtest: SubtestType.PBM,
    title: 'Ide Pokok dan Simpulan',
    summary: 'Menentukan inti paragraf.',
    points: ['Ide utama', 'Gagasan pendukung'],
    trapPatterns: ['Detail dianggap ide pokok'],
    quickTricks: [{ name: 'Kalimat Umum', formula: 'Paling netral', description: 'Biasanya ide pokok' }],
    example: {
      question: 'Paragraf: "Air sangat vital. Tanpa air manusia mati. Tanaman juga butuh air." Ide pokok?',
      solution: [
        'Kalimat 1 bersifat umum.',
        'Kalimat berikutnya menjelaskan detail.',
        'Kesimpulan: Pentingnya air bagi kehidupan.'
      ],
      formulas: [
        'Ide Pokok: Terletak di kalimat utama.',
        'Simpulan: Hasil akhir pemikiran dari seluruh data.'
      ]
    }
  },
  {
    id: 'pbm-2',
    subtest: SubtestType.PBM,
    title: 'Kalimat Efektif',
    summary: 'Struktur kalimat yang benar dan hemat.',
    points: ['Kesepadanan', 'Kehematan'],
    trapPatterns: ['Kalimat panjang'],
    quickTricks: [{ name: 'Potong Kata', formula: 'Lebih pendek', description: 'Lebih efektif' }],
    example: {
      question: 'Mana yang efektif? A) Saya pergi ke pasar. B) Saya pergi menuju ke pasar.',
      solution: [
        'Opsi B redudan (menuju dan ke).',
        'Jawaban: A.'
      ],
      formulas: [
        'Prinsip Efektif: Jelas, Hemat, Padat.',
        'Hindari: Pleonasme.'
      ]
    }
  },
  {
    id: 'pbm-3',
    subtest: SubtestType.PBM,
    title: 'Kohesi dan Koherensi',
    summary: 'Keterkaitan antar kalimat.',
    points: ['Kata rujukan', 'Transisi'],
    trapPatterns: ['Kalimat berdiri sendiri'],
    quickTricks: [{ name: 'Kata Sambung', formula: 'Ini-merujuk-itu', description: 'Cek kesinambungan' }],
    example: {
      question: 'Budi beli buku. ... itu sangat mahal.',
      solution: [
        'Rujukan benda: "Buku tersebut" atau "Buku itu".'
      ],
      formulas: [
        'Referensi: Kata ganti (ia, ini, itu) harus jelas.',
        'Koherensi: Alur logis antar kalimat.'
      ]
    }
  },
  {
    id: 'pbm-4',
    subtest: SubtestType.PBM,
    title: 'Paragraf Tidak Efektif',
    summary: 'Mendeteksi paragraf rusak.',
    points: ['Redundansi', 'Loncat ide'],
    trapPatterns: ['Kalimat bagus tapi salah fungsi'],
    quickTricks: [{ name: 'Satu Ide', formula: '1 paragraf = 1 ide', description: 'Jika lebih → salah' }],
    example: {
      question: 'Membahas kopi, tapi ada kalimat tentang teh di tengah. Status kalimat teh?',
      solution: [
        'Kalimat sumbang/tidak relevan.'
      ],
      formulas: [
        'Kepaduan: Semua kalimat mendukung satu ide utama.'
      ]
    }
  },

  // =====================
  // LITERASI BAHASA INDONESIA (LBI)
  // =====================
  {
    id: 'lbi-1',
    subtest: SubtestType.LiterasiIndo,
    title: 'Makna Kata dan Diksi',
    summary: 'Makna kontekstual bahasa.',
    points: ['Sinonim', 'Antonim', 'Makna kiasan'],
    trapPatterns: ['Makna kamus'],
    quickTricks: [{ name: 'Konteks Kalimat', formula: 'Sekitar kata', description: 'Makna ditentukan konteks' }],
    example: {
      question: 'Kata "Kaki" dalam "Kaki gunung itu curam" bermakna?',
      solution: [
        'Makna kontekstual: Bagian bawah.',
        'Bukan anggota tubuh.'
      ],
      formulas: [
        'Denotasi: Makna harfiah.',
        'Konotasi: Makna kiasan.'
      ]
    }
  },
  {
    id: 'lbi-2',
    subtest: SubtestType.LiterasiIndo,
    title: 'Nada dan Sikap Penulis',
    summary: 'Menilai sikap implisit.',
    points: ['Netral', 'Persuasif', 'Kritis'],
    trapPatterns: ['Overinterpretasi'],
    quickTricks: [{ name: 'Fakta vs Opini', formula: 'Objektif?', description: 'Nada terlihat' }],
    example: {
      question: 'Penulis menggunakan kata "Bodoh" and "Merugikan". Nada penulis?',
      solution: [
        'Nada: Kritis / Sarkastik.'
      ],
      formulas: [
        'Nada Objektif: Tanpa emosi, penuh fakta.',
        'Nada Subjektif: Penuh opini emosional.'
      ]
    }
  },
  {
    id: 'lbi-3',
    subtest: SubtestType.LiterasiIndo,
    title: 'Bias dan Sudut Pandang',
    summary: 'Menilai keberpihakan implisit.',
    points: ['Bahasa emosional', 'Pemilihan data'],
    trapPatterns: ['Mengira netral'],
    quickTricks: [{ name: 'Nada Kata', formula: 'Netral vs emosional', description: 'Bias terlihat dari diksi' }],
    example: {
      question: 'Penulis hanya menyebut sisi positif program X. Apa status penulis?',
      solution: [
        'Terdeteksi Bias Pro-Program X.'
      ],
      formulas: [
        'Bias: Keberpihakan informasi.',
        'Sudut Pandang: Posisi penulis terhadap isu.'
      ]
    }
  },
  {
    id: 'lbi-4',
    subtest: SubtestType.LiterasiIndo,
    title: 'Kelemahan Argumen',
    summary: 'Mendeteksi celah logika.',
    points: ['Data tidak cukup', 'Asumsi tersembunyi'],
    trapPatterns: ['Tulisan meyakinkan'],
    quickTricks: [{ name: 'Tanya Kenapa', formula: 'Apakah cukup?', description: 'Jika ragu → lemah' }],
    example: {
      question: 'Susu X bagus karena artis Y minum. Kelemahannya?',
      solution: [
        'Hubungan tidak logis antara selebritas dan kualitas.'
      ],
      formulas: [
        'Non Sequitur: Kesimpulan tidak mengikuti premis.'
      ]
    }
  },
  {
    id: 'lbi-5',
    subtest: SubtestType.LiterasiIndo,
    title: 'Ejaan dan Tanda Baca',
    summary: 'EYD/PUEBI.',
    points: ['Imbuhan', 'Kata ulang', 'Titik dua/koma'],
    trapPatterns: ['Kata depan disambung'],
    quickTricks: [{ name: 'Cek KBBI', formula: 'Baku?', description: 'Pastikan kata baku' }],
    example: {
      question: 'A) di dalam B) didalam. Mana yang benar?',
      solution: [
        'Kata depan dipisah: di dalam.'
      ],
      formulas: [
        'Kata Depan: di, ke, dari (dipisah).',
        'Imbuhan: di- (disambung).'
      ]
    }
  },
  {
    id: 'lbi-6',
    subtest: SubtestType.LiterasiIndo,
    title: 'Teks Narasi (Struktur Cerita)',
    summary: 'Memahami alur cerita fiksi maupun non-fiksi.',
    points: ['Orientasi (Pengenalan)', 'Komplikasi (Konflik)', 'Resolusi (Penyelesaian)', 'Koda (Pesan)'],
    trapPatterns: ['Tertukar antara klimaks dan resolusi'],
    quickTricks: [{ name: 'Cek Perubahan Nasib', formula: 'Sebelum vs Sesudah', description: 'Resolusi ditandai dengan perubahan situasi tokoh' }],
    example: {
      question: 'Bagian mana yang menunjukkan konflik dalam kutipan cerpen?',
      solution: [
        'Cari kalimat yang memicu pertentangan atau masalah.',
        'Biasanya ditandai dengan kata "namun", "sayangnya", atau kejadian tak terduga.'
      ],
      formulas: [
        'Alur: Pengenalan -> Masalah -> Puncak -> Solusi.'
      ]
    }
  },

  // =====================
  // LITERASI BAHASA INGGRIS (LBE)
  // =====================
  {
    id: 'lbe-1',
    subtest: SubtestType.LiterasiInggris,
    title: 'Main Idea dan Detail',
    summary: 'Pemahaman teks bahasa Inggris.',
    points: ['Main idea', 'Supporting detail'],
    trapPatterns: ['Literal translation'],
    quickTricks: [{ name: 'First Sentence', formula: 'Awal paragraf', description: 'Sering ide utama' }],
    example: {
      question: 'Coffee boosts energy. It has caffeine. Main idea?',
      solution: [
        'Sentence 1 is general.',
        'Main idea: Effects of coffee on energy.'
      ],
      formulas: [
        'Main Idea: The overall point of the text.'
      ]
    }
  },
  {
    id: 'lbe-2',
    subtest: SubtestType.LiterasiInggris,
    title: 'Inference & Purpose',
    summary: 'Kesimpulan tersirat.',
    points: ['Inference', 'Tone', 'Purpose'],
    trapPatterns: ['Extreme options'],
    quickTricks: [{ name: 'Not Stated', formula: 'Implisit', description: 'Inference tidak eksplisit' }],
    example: {
      question: 'She slammed the door. Inference?',
      solution: [
        'She is upset/angry.'
      ],
      formulas: [
        'Inference: Logical deduction from facts.'
      ]
    }
  },
  {
    id: 'lbe-3',
    subtest: SubtestType.LiterasiInggris,
    title: 'Meaning & Reference',
    summary: 'Rujukan kata.',
    points: ['Pronoun reference'],
    trapPatterns: ['Ambiguous reference', 'Mistaking object for subject'],
    quickTricks: [{ name: 'Back Reference', formula: 'Previous word', description: 'Pronoun selalu merujuk' }],
    example: {
      question: 'Tom gave Jerry a gift. It was expensive. "It" refers to?',
      solution: [
        'The gift.'
      ],
      formulas: [
        'Pronoun: Replaces a specific noun.'
      ]
    }
  },
  {
    id: 'lbe-4',
    subtest: SubtestType.LiterasiInggris,
    title: 'Strength of Statement',
    summary: 'Memperkuat atau melemahkan.',
    points: ['Supporting evidence'],
    trapPatterns: ['Relevant but weak points', 'Ignoring context'],
    quickTricks: [{ name: 'Dampak ke Klaim', formula: 'Bantu atau hancurkan?', description: 'Fungsi utama' }],
    example: {
      question: 'Claim: Exercise is good. Which strengthens?',
      solution: [
        'Data showing lower risks for active people.'
      ],
      formulas: [
        'Strengthen: New supporting facts.'
      ]
    }
  },
  {
    id: 'lbe-5',
    subtest: SubtestType.LiterasiInggris,
    title: 'Contextual Vocabulary',
    summary: 'Sinonim konteks.',
    points: ['Synonyms'],
    trapPatterns: ['Literal meaning trap', 'Ignoring tone'],
    quickTricks: [{ name: 'Substitusi', formula: 'Ganti kata', description: 'Cek apakah masuk akal' }],
    example: {
      question: '"Compelling" evidence. Meaning?',
      solution: [
        'Persuasive/Strong.'
      ],
      formulas: [
        'Context Clues: Use nearby words to guess meaning.'
      ]
    }
  },
  {
    id: 'lbe-6',
    subtest: SubtestType.LiterasiInggris,
    title: 'Structure & Grammar',
    summary: 'Parallelism, Tenses.',
    points: ['S-V Agreement'],
    trapPatterns: ['Misidentifying subject', 'Tense shifting'],
    quickTricks: [{ name: 'Core Subject', formula: 'Who/What?', description: 'Cari subjek utamanya' }],
    example: {
      question: 'The box of chocolates ___ gone. (is/are)',
      solution: [
        'Subject is "The box" (singular). Answer: is.'
      ],
      formulas: [
        'S-V Agreement: Singular Subject + Singular Verb.'
      ]
    }
  },
  {
    id: 'lbe-7',
    subtest: SubtestType.LiterasiInggris,
    title: 'Gerunds (V-ing as Noun)',
    summary: 'Using the "-ing" form of a verb as a noun in a sentence.',
    points: ['Gerund as Subject', 'Gerund after Prepositions', 'Gerund after specific verbs (enjoy, avoid)'],
    trapPatterns: ['Confusing Gerund with Present Continuous (is + Ving)'],
    quickTricks: [{ name: 'It-Test', formula: 'Replace with "It"', description: 'If you can replace V-ing with "It", it is a Gerund' }],
    example: {
      question: '"Swimming is tiring." What is the function of "Swimming"?',
      solution: [
        'The word "Swimming" acts as the subject of the sentence.',
        'It is a noun form of the verb "swim".',
        'Therefore, it is a Gerund.'
      ],
      formulas: [
        'Gerund = Verb + ing (Used as a noun)',
        'Subject: [V-ing] + Verb + ...'
      ]
    }
  },

  // =====================
  // PENALARAN MATEMATIKA (PM)
  // =====================
  {
    id: 'pm-1',
    subtest: SubtestType.PenalaranMatematika,
    title: 'Pola Bilangan',
    summary: 'Menentukan pola numerik.',
    points: ['Aritmetika', 'Geometri'],
    trapPatterns: ['Arithmetic vs Geometric confusion', 'Index errors'],
    quickTricks: [{ name: 'Selisih', formula: 'Δ', description: 'Cek perubahan' }],
    example: {
      question: '2, 4, 8, 16, ...',
      solution: [
        'Multiply by 2.',
        'Next: 32.'
      ],
      formulas: [
        'Aritmetika: Un = a + (n-1)b',
        'Geometri: Un = a × r^(n-1)'
      ]
    }
  },
  {
    id: 'pm-2',
    subtest: SubtestType.PenalaranMatematika,
    title: 'Generalisasi dan Fungsi',
    summary: 'Logika matematis.',
    points: ['Domain & Range', 'Composition'],
    trapPatterns: ['Inversion error', 'Invalid input'],
    quickTricks: [{ name: 'Uji Nilai', formula: 'Input kecil', description: 'Cek konsistensi' }],
    example: {
      question: 'If f(x) = 2x + 3, what is f(5)?',
      solution: [
        '2(5) + 3 = 13.'
      ],
      formulas: [
        'Function: Map input to output.'
      ]
    }
  },
  {
    id: 'pm-3',
    subtest: SubtestType.PenalaranMatematika,
    title: 'Pembuktian Pola',
    summary: 'Kebenaran pola.',
    points: ['Counter-examples', 'Formal Logic'],
    trapPatterns: ['Hasty generalization', 'Assuming correlation'],
    quickTricks: [{ name: 'Counter-example', formula: 'Pengecualian', description: 'Jika ada → salah' }],
    example: {
      question: 'All even numbers are composite?',
      solution: [
        'Counter-example: 2 is even but prime.'
      ],
      formulas: [
        'Proof: True only if it works for ALL cases.'
      ]
    }
  },
  {
    id: 'pm-4',
    subtest: SubtestType.PenalaranMatematika,
    title: 'Pemodelan Kontekstual',
    summary: 'Model matematis.',
    points: ['Variable modeling', 'Constraint analysis'],
    trapPatterns: ['Units mismatch', 'System error'],
    quickTricks: [{ name: 'Sederhanakan', formula: 'x dan y', description: 'Jangan overthinking' }],
    example: {
      question: '3 apples + 2 oranges = 5000. 1 apple + 1 orange = 2000. Cost of 1 apple?',
      solution: [
        'Multiply 2nd eq by 2: 2A + 2J = 4000.',
        'Subtract: A = 1000.'
      ],
      formulas: [
        'SPLDV: System of linear equations.'
      ]
    }
  }
];
