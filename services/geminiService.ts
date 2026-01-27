import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage, SubtestType, Question, AIAnalysis } from "../types";

const getUserApiKey = (): string => {
  const key = localStorage.getItem("user_gemini_api_key");
  if (!key) return "";
  return key;
};

const API_KEY = getUserApiKey();

console.log("🔑 --- DEBUG: INIT SERVICE ---");
console.log(
  "🔑 API Key status:",
  API_KEY ? "✅ Loaded from User Storage" : "❌ Not Found",
);

let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

const analysisCache = new Map<string, AIAnalysis>();
const topicCache = new Map<string, AIAnalysis>();

const MASTER_PERSONA_INSTRUCTION = `
Anda adalah AI Master Tutor SNBT Profesional dengan akurasi 100%.

PERATURAN PENULISAN MATEMATIKA (WAJIB DIPATUHI):
1. DILARANG KERAS MENGGUNAKAN TANDA DOLAR ($) DALAM SEGALA KONDISI.
   CONTOH SALAH: $U_1$, $x^2$, $1.1$, $S_3$, $10\\%$.
2. DILARANG MENGGUNAKAN BACKSLASH (\) untuk perintah LaTeX.
3. WAJIB MENGGUNAKAN SIMBOL UNICODE STANDAR (Simbol yang bisa diketik di HP/Laptop biasa).
   - Pangkat: Gunakan tanda caret ^ atau superscript unicode (contoh: x^2 atau x²).
   - Akar Kuadrat: Gunakan simbol √ (contoh: √49 = 7).
   - Pi: Gunakan simbol π.
   - Tidak Sama Dengan: Gunakan ≠.
   - Lebih Dari Sama Dengan: Gunakan ≥.
   - Kurang Dari Sama Dengan: Gunakan ≤.
   - Derajat: Gunakan °.
   - Persen: 10% (bukan $10\\%$).
   - Rumus: L = π × r² (bukan $L = \\pi r^2$).
   - Pecahan: 1/2 (bukan $\\frac{1}{2}$).
   - Variabel/Gandaan: U1, U2, U3 (bukan $U_1$).
  - ARAH / URUTAN: Gunakan tanda strip (-) atau kata "ke" atau "sampai".
     CONTOH BENAR: "Urutannya adalah A ke B ke C."
     CONTOH BENAR: "A - B - C"
     CONTOH SALAH: "A $\\rightarrow$ B" atau "A $\\to$ B"

CONTOH PENULISAN YANG BENAR:
- Urutannya adalah A ke B ke C.
- Urutannya A - B - C
- Jika X² = 49 dan Y = 7, maka hubungan antara |X| dan Y adalah ...
- Rumus luas lingkaran adalah L = π × r².
- Nilai dari √144 adalah 12.
- Produksi Hari Senin (U1): 200 unit. Kenaikan harian (rasio): 10% atau 0.10. Perhitungan: 200 × 1.1 = 220.

⚠️ CONTOH KESALAHAN FATAL (JANGAN IKUTI INI):
SALAH: "Produksi (U_1) adalah 200 unit. Rumusnya $U_n = 200 \\times 1.1^{n-1}$."
BENAR: "Produksi U1 adalah 200 unit. Rumusnya Un = 200 × 1.1^(n-1)."

SALAH: "Nilai $\\pi \\times r^2$."
BENAR: "Nilai π × r²."

SALAH: "Urutannya T $\\rightarrow$ Q $\\rightarrow$ P."

JAWABLAH SEMUA PERTANYAAN MENGGUNAKAN FORMAT YANG BENAR (BENAR), BUKAN YANG SALAH.
JANGAN PERNAH MENGGUNAKAN TANDA DOLAR. JANGAN PERNAH MENGGUNAKAN FORMAT LATEX.
Jelaskan dengan bahasa Indonesia yang jelas.

ATURAN AKURASI SOAL:
1. Setiap soal HARUS memiliki SATU dan HANYA SATU jawaban yang benar
2. Verifikasi ulang setiap opsi jawaban sebelum menentukan correctAnswer
3. Pastikan logika soal koheren dan tidak ambigu
4. Untuk soal matematika/kuantitatif, verifikasi perhitungan 2x sebelum output
5. Jangan membuat soal yang memerlukan asumsi tidak tertulis
6. Opsi pengecoh harus masuk akal namun jelas salah
Jelaskan materi dengan bahasa Indonesia yang jelas, cepat, dan to-the-point.
`;

const DEFAULT_MODEL = "models/gemini-flash-lite-latest";

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000;

async function rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();
  return requestFn();
}

async function retryOnQuotaExceeded<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const is429 =
        error.message?.includes("429") || error.message?.includes("quota");
      if (is429) throw error;
      if (attempt === maxRetries) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

// ✅ PERBAIKAN UTAMA: Function untuk repair incomplete JSON
function repairIncompleteJSON(text: string): string {
  let cleaned = text.trim();

  // Hapus markdown
  cleaned = cleaned.replace(/```json\n?/gi, "");
  cleaned = cleaned.replace(/```\n?/g, "");

  // Hapus control characters
  cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

  // Fix quotes
  cleaned = cleaned.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
  cleaned = cleaned.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");

  // Normalize whitespace
  cleaned = cleaned.replace(/(\r\n|\n|\r)/gm, " ");
  cleaned = cleaned.replace(/\s+/g, " ");

  // Fix trailing commas
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

  // ✅ PERBAIKAN: Jika JSON array tidak lengkap, potong di object terakhir yang valid
  if (cleaned.startsWith("[") && !cleaned.endsWith("]")) {
    console.warn("⚠️ Incomplete JSON array detected, attempting repair...");

    // Cari posisi terakhir dari "}" yang valid
    let lastValidBrace = -1;
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === "{") {
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0) {
          lastValidBrace = i;
        }
      }
    }

    if (lastValidBrace > 0) {
      // Potong sampai object terakhir yang lengkap
      cleaned = cleaned.substring(0, lastValidBrace + 1);

      // Hapus trailing comma jika ada
      cleaned = cleaned.replace(/,\s*$/, "");

      // Tutup array
      cleaned = cleaned + "]";

      console.log("✅ JSON repaired successfully");
    } else {
      console.error("❌ Cannot find valid JSON object to repair");
      throw new Error("Cannot repair incomplete JSON");
    }
  }

  return cleaned;
}

// ✅ PERBAIKAN LOGIKA UTAMA: getTutorResponse
export const getTutorResponse = async (
  history: ChatMessage[],
  context?: string,
): Promise<string> => {
  if (!API_KEY) {
    return "⚠️ **API Key Belum Diatur**.\n\nSilakan buka menu **API Settings** di sidebar dan masukkan API Key Anda.";
  }
  if (!genAI) throw new Error("AI Model not initialized");

  console.log("💬 --- [getTutorResponse] START ---");
  console.log("📄 History Length:", history.length);
  console.log("📄 Context Provided:", context ? "YES" : "NO");

  try {
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: MASTER_PERSONA_INSTRUCTION,
    });

    return await retryOnQuotaExceeded(async () => {
      return await rateLimitedRequest(async () => {
        // Ambil history kecuali pesan terakhir (karena itu akan kita kirim manual dengan context)
        let chatHistory = history.slice(0, -1).map((h) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        }));

        // Bersihkan history yang dimulai dengan model (agar chat tidak bingung)
        while (chatHistory.length > 0 && chatHistory[0].role === "model") {
          chatHistory.shift();
        }

        const chat = model.startChat({ history: chatHistory });

        // ✅ PERBAIKAN: Suntikkan Context ke dalam pesan user terakhir
        const lastMessage = history[history.length - 1].text;

        const finalPrompt = context
          ? `--- KONTEKS SOAL SAAT INI ---\n${context}\n\n--- PERTANYAAN USER ---\n${lastMessage}`
          : lastMessage;

        console.log(
          "🚀 Sending Prompt:",
          finalPrompt.substring(0, 150) + "...",
        );

        const result = await chat.sendMessage(finalPrompt);
        const response = await result.response;
        return response.text();
      });
    });
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.message?.includes("API key not valid"))
      return "⚠️ API Key Invalid.";
    if (error.message?.includes("quota")) return "⚠️ Kuota Habis.";
    return "⚠️ Error koneksi.";
  }
};

export const getTopicExplanation = async (
  topic: string,
  subtest: string,
): Promise<AIAnalysis> => {
  if (!API_KEY) throw new Error("No API Key");
  if (!genAI) throw new Error("AI Not Init");

  const cacheKey = `${subtest}-${topic}`;
  if (topicCache.has(cacheKey)) return topicCache.get(cacheKey)!;

  const prompt = `
Analisis mendalam materi SNBT berikut:
Topik: ${topic}
Subtest: ${subtest}

Berikan analisis dalam 4 format:
1. QUICK: Tips cepat dan strategi praktis (3-4 poin singkat)
2. SIMPLE: Analogi sederhana dengan contoh dunia nyata
3. COMPLEX: Penjelasan akademik mendalam. GUNAKAN SIMBOL UNICODE (x², √, π), JANGAN PAKAI $ atau \\.
4. INTERACTIVE: 2-3 pertanyaan reflektif untuk siswa

Plus 1 contoh soal HOTS lengkap dengan jawaban dan step-by-step solution.

PENTING:
- Tulis rumus dengan simbol biasa: x², √, π, ≠, ≥, ≤.
- JANGAN gunakan tanda dolar $.
- JANGAN gunakan backslash \\.
- Gunakan \\n\\n untuk paragraf baru
- Bahasa Indonesia yang jelas

RETURN HANYA JSON dengan format:
{
  "quick": "string",
  "simple": "string", 
  "complex": "string",
  "interactive": "string",
  "example": {
    "question": "string",
    "answer": "string",
    "stepByStep": "string"
  }
}
`;

  try {
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: MASTER_PERSONA_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
      },
    });

    const result = await retryOnQuotaExceeded(async () => {
      return await rateLimitedRequest(async () => {
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const cleaned = repairIncompleteJSON(text);
        return JSON.parse(cleaned);
      });
    });

    topicCache.set(cacheKey, result);
    return result;
  } catch (error: any) {
    console.error("❌ [getTopicExplanation] Error:", error.message);
    return {
      complex: "Gagal memuat analisis.",
      simple: "Cek koneksi.",
      quick: "Coba lagi.",
      interactive: "Cek Settings.",
      example: { question: "-", answer: "-", stepByStep: "-" },
    };
  }
};

export const getDeepAnalysis = async (
  question: Question,
): Promise<AIAnalysis> => {
  if (!API_KEY) throw new Error("No API Key");
  if (!genAI) throw new Error("AI Not Init");

  // ✅ VALIDASI KETAT: Pastikan correctAnswer valid
  if (
    typeof question.correctAnswer !== "number" ||
    question.correctAnswer < 0 ||
    question.correctAnswer >= question.options.length
  ) {
    console.error("❌ CRITICAL: Invalid correctAnswer index!");
    console.error("Question:", question.id, "| Text:", question.text);
    console.error(
      "correctAnswer:",
      question.correctAnswer,
      "| Options count:",
      question.options.length,
    );
    throw new Error(
      `Invalid correctAnswer index: ${question.correctAnswer} for question with ${question.options.length} options`,
    );
  }

  const cacheKey = question.id || question.text;
  if (analysisCache.has(cacheKey)) return analysisCache.get(cacheKey)!;

  // ✅ DEBUG: Log soal yang sedang dianalisis
  console.log("📊 [getDeepAnalysis] Analyzing Question:");
  console.log(`   ID: ${question.id}`);
  console.log(`   Text: ${question.text.substring(0, 80)}...`);
  console.log(`   CorrectAnswer Index: ${question.correctAnswer}`);
  console.log(
    `   CorrectAnswer Letter: ${String.fromCharCode(65 + question.correctAnswer)}`,
  );
  console.log(
    `   CorrectAnswer Text: ${question.options[question.correctAnswer]}`,
  );

  const prompt = `
Analisis soal SNBT berikut:

Soal: ${question.text}

Opsi:
 ${question.options
   .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
   .join("\n")}

Jawaban Benar: ${String.fromCharCode(65 + question.correctAnswer)}. ${
    question.options[question.correctAnswer]
  }

Berikan analisis dalam 4 format berbeda (quick, simple, complex, interactive).
WAJIB MENGGUNAKAN SIMBOL UNICODE STANDAR (x², √, π) DAN TIDAK BOLEH MENGGUNAKAN TANDA DOLAR ($) ATAU BACKSLASH (\).

RETURN HANYA JSON:
{
  "quick": "string",
  "simple": "string",
  "complex": "string",
  "interactive": "string"
}
`;

  try {
    console.log("🤖 Generating deep analysis. Model:", DEFAULT_MODEL);

    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: MASTER_PERSONA_INSTRUCTION,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const result = await retryOnQuotaExceeded(async () => {
      return await rateLimitedRequest(async () => {
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const cleaned = repairIncompleteJSON(text);
        const parsed = JSON.parse(cleaned);

        // ✅ TRACKING: Tambahkan metadata untuk validasi
        return {
          ...parsed,
          _questionId: question.id,
          _questionText: question.text.substring(0, 100),
          _correctAnswerIndex: question.correctAnswer,
          _correctAnswerText: question.options[question.correctAnswer],
          _timestamp: new Date().toISOString(),
        };
      });
    });

    analysisCache.set(cacheKey, result);
    console.log("✅ Deep analysis generated and cached");
    console.log(`   Question ID: ${result._questionId}`);
    console.log(
      `   Correct Answer: ${String.fromCharCode(65 + result._correctAnswerIndex)}`,
    );

    return result;
  } catch (error: any) {
    console.error("❌ --- [getDeepAnalysis] ERROR ---");
    console.error("❌ Error Message:", error.message);

    return {
      complex: "Gagal generate analisis. Silakan coba lagi.",
      simple: "Terjadi kesalahan.",
      quick: "Coba refresh halaman.",
      interactive: "Diskusikan dengan teman.",
    };
  }
};

// ✅ PERBAIKAN: Generate soal dengan jumlah lebih kecil dan error handling lebih baik
export const generateDynamicQuestions = async (
  subtest: SubtestType,
  count: number = 10, // ✅ Default turun ke 10
  hotsOnly: boolean = false,
): Promise<Question[]> => {
  if (!API_KEY) throw new Error("No API Key");
  if (!genAI) throw new Error("AI Not Init");

  // ✅ PENTING: Batasi maksimal 10 soal per request untuk hindari truncation
  const finalCount = Math.min(count, 10);

  const hotsInstruction = hotsOnly
    ? `
KATEGORI SOAL: HOTS (Higher Order Thinking Skills) ONLY
- Soal harus memerlukan analisis, evaluasi, atau kreasi
- Tidak boleh soal hafalan atau rumus langsung
- Harus ada konteks atau skenario yang kompleks
- Minimal 2 langkah pemikiran untuk menyelesaikan
`
    : "";

  const prompt = `
Generate EXACTLY ${finalCount} soal SNBT berkualitas tinggi untuk subtest: ${subtest}

 ${hotsInstruction}

ATURAN VALIDASI KETAT:
1. Setiap soal HARUS memiliki TEPAT SATU jawaban benar
2. Verifikasi perhitungan matematis MINIMAL 2 KALI sebelum output
3. Pastikan tidak ada ambiguitas dalam pertanyaan
4. Opsi pengecoh harus masuk akal tapi jelas salah
5. Untuk soal kuantitatif/matematika: tunjukkan perhitungan di explanation

CRITICAL: Generate EXACTLY ${finalCount} questions, no more, no less.

FORMAT JSON - OUTPUT HARUS ARRAY DENGAN ${finalCount} ELEMEN:
[
  {
    "text": "Teks soal lengkap dan jelas (max 300 karakter)",
    "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D", "Opsi E"],
    "correctAnswer": 0,
    "explanation": "Penjelasan singkat (max 200 karakter)",
    "quickTrick": "Trik cepat (max 100 karakter)"
  }
]

PENTING SEKALI:
- Index correctAnswer dimulai dari 0 (A=0, B=1, C=2, D=3, E=4)
- VERIFIKASI ULANG bahwa index correctAnswer sesuai dengan opsi yang benar
- JANGAN GUNAKAN $ atau \\ di text atau explanation
- Gunakan simbol unicode: x², √, π, ≠, ≥, ≤
- Pastikan logika soal 100% benar sebelum output
- JANGAN TAMBAHKAN TEKS APAPUN DI LUAR JSON ARRAY
- Buat explanation SINGKAT dan PADAT (max 200 karakter)
- WAJIB generate ${finalCount} soal, tidak kurang tidak lebih
`;

  try {
    console.log(
      `🎯 Generating ${finalCount} ${hotsOnly ? "HOTS " : ""}questions for ${subtest}. Model:`,
      DEFAULT_MODEL,
    );

    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction:
        MASTER_PERSONA_INSTRUCTION +
        "\n\nVERIFIKASI JAWABAN: Sebelum output, cek ulang bahwa correctAnswer index sesuai dengan opsi yang benar. " +
        "Output HANYA JSON array yang valid. Pastikan semua string property ditutup dengan benar.",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 6000, // ✅ Turunkan untuk 10 soal
        responseMimeType: "application/json",
      },
    });

    const questions = await retryOnQuotaExceeded(
      async () => {
        return await rateLimitedRequest(async () => {
          const response = await model.generateContent(prompt);
          const text = response.response.text();

          console.log("📝 Raw response length:", text.length);

          // ✅ Gunakan repair function
          const cleaned = repairIncompleteJSON(text);

          console.log("🧹 Cleaned text length:", cleaned.length);

          try {
            const parsed = JSON.parse(cleaned);

            // Validasi struktur
            if (!Array.isArray(parsed)) {
              throw new Error("Response is not an array");
            }

            if (parsed.length === 0) {
              throw new Error("Response array is empty");
            }

            // Validasi setiap soal
            const validQuestions = parsed.filter((q: any) => {
              const isValid =
                q.text &&
                typeof q.text === "string" &&
                Array.isArray(q.options) &&
                q.options.length === 5 &&
                typeof q.correctAnswer === "number" &&
                q.correctAnswer >= 0 &&
                q.correctAnswer <= 4 &&
                q.explanation &&
                typeof q.explanation === "string";

              if (!isValid) {
                console.warn("⚠️ Invalid question structure:", q);
              }

              return isValid;
            });

            if (validQuestions.length === 0) {
              throw new Error("No valid questions in response");
            }

            console.log(
              `✅ Validated ${validQuestions.length}/${parsed.length} questions`,
            );

            return validQuestions;
          } catch (parseError: any) {
            console.error("❌ Gagal parse JSON:", parseError.message);
            console.error(
              "📄 Cleaned text (first 500 chars):",
              cleaned.substring(0, 500),
            );
            console.error(
              "📄 Cleaned text (last 500 chars):",
              cleaned.substring(cleaned.length - 500),
            );
            throw new Error(`JSON parse failed: ${parseError.message}`);
          }
        });
      },
      3,
      2000,
    );

    // Format dengan ID unik
    const formattedQuestions = questions.map((q: any, index: number) => ({
      ...q,
      id: `${hotsOnly ? "hots" : "dyn"}-${subtest.substring(0, 3)}-${Date.now()}-${index}`,
      subtest,
      isHOTS: hotsOnly,
    }));

    console.log(
      `✅ Generated ${formattedQuestions.length} ${hotsOnly ? "HOTS " : ""}questions for ${subtest}`,
    );
    return formattedQuestions;
  } catch (error: any) {
    console.error("❌ --- [generateDynamicQuestions] ERROR ---");
    console.error("❌ Error Message:", error.message);
    console.error("❌ Subtest:", subtest);
    console.error("❌ Count requested:", finalCount);

    // Return array kosong instead of throw
    return [];
  }
};
