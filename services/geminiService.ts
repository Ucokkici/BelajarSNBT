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

// ✅ LOGIKA 2: Enhanced Master Persona dengan Validasi Ketat
const MASTER_PERSONA_INSTRUCTION = `
Anda adalah AI Master Tutor SNBT Profesional dengan akurasi 100%.

CRITICAL VALIDATION RULES (WAJIB DIPATUHI):
1. Setiap soal HARUS memiliki TEPAT SATU jawaban yang benar
2. Verifikasi perhitungan matematis MINIMAL 3 KALI sebelum output
3. Untuk soal matematika/kuantitatif: tunjukkan SEMUA langkah perhitungan
4. Pastikan tidak ada ambiguitas dalam pertanyaan
5. Opsi pengecoh harus masuk akal tapi jelas salah
6. VALIDASI ULANG index correctAnswer sesuai dengan opsi yang benar

PERATURAN PENULISAN MATEMATIKA (WAJIB DIPATUHI):
1. DILARANG KERAS MENGGUNAKAN TANDA DOLAR ($) DALAM SEGALA KONDISI.
2. DILARANG MENGGUNAKAN BACKSLASH (\) untuk perintah LaTeX.
3. WAJIB MENGGUNAKAN SIMBOL UNICODE STANDAR:
   - Pangkat: x² atau x^2
   - Akar: √49 = 7
   - Pi: π
   - Tidak sama: ≠
   - Lebih dari sama dengan: ≥
   - Kurang dari sama dengan: ≤
   - Derajat: °
   - Persen: 10%
   - Pecahan: 1/2 atau ½
   - Variabel: U1, U2, U3

CONTOH PENULISAN BENAR:
- Jika x² = 49 dan y = 7, maka hubungan antara |x| dan y adalah...
- Rumus luas lingkaran: L = π × r²
- Nilai √144 = 12
- Produksi U1 = 200 unit, kenaikan 10%, maka U2 = 200 × 1.1 = 220

STANDAR SOAL UTBK/SNBT:
- Penalaran Umum: logika, silogisme, pola, analisis argumen
- Pengetahuan Kuantitatif: aritmatika, aljabar, geometri dasar
- Literasi Indonesia: pemahaman bacaan, analisis teks, tata bahasa
- Literasi Inggris: reading comprehension, grammar, vocabulary
- Penalaran Matematika: problem solving, aplikasi matematika
- PPU: pengetahuan umum, sains sosial, current affairs
- PBM: analisis wacana, argumentasi, struktur teks

Jelaskan dengan bahasa Indonesia yang jelas, cepat, dan to-the-point.
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

function repairIncompleteJSON(text: string): string {
  let cleaned = text.trim();

  cleaned = cleaned.replace(/```json\n?/gi, "");
  cleaned = cleaned.replace(/```\n?/g, "");
  cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  cleaned = cleaned.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
  cleaned = cleaned.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
  cleaned = cleaned.replace(/(\r\n|\n|\r)/gm, " ");
  cleaned = cleaned.replace(/\s+/g, " ");
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

  if (cleaned.startsWith("[") && !cleaned.endsWith("]")) {
    console.warn("⚠️ Incomplete JSON array detected, attempting repair...");

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
      cleaned = cleaned.substring(0, lastValidBrace + 1);
      cleaned = cleaned.replace(/,\s*$/, "");
      cleaned = cleaned + "]";
      console.log("✅ JSON repaired successfully");
    } else {
      console.error("❌ Cannot find valid JSON object to repair");
      throw new Error("Cannot repair incomplete JSON");
    }
  }

  return cleaned;
}

// ✅ LOGIKA 2: Fungsi Validasi Jawaban yang Ketat
function validateQuestionAccuracy(question: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validasi struktur dasar
  if (!question.text || typeof question.text !== "string") {
    errors.push("Text soal tidak valid");
  }

  if (!Array.isArray(question.options) || question.options.length !== 5) {
    errors.push("Harus ada tepat 5 opsi jawaban");
  }

  if (
    typeof question.correctAnswer !== "number" ||
    question.correctAnswer < 0 ||
    question.correctAnswer > 4
  ) {
    errors.push("Index correctAnswer tidak valid (harus 0-4)");
  }

  if (!question.explanation || typeof question.explanation !== "string") {
    errors.push("Explanation tidak valid");
  }

  // Validasi konten
  if (question.text && question.text.length < 20) {
    errors.push("Soal terlalu pendek (min 20 karakter)");
  }

  // Validasi opsi jawaban tidak boleh sama
  if (question.options) {
    const uniqueOptions = new Set(question.options.map((opt: string) => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== 5) {
      errors.push("Ada opsi jawaban yang duplikat");
    }
  }

  // Validasi explanation harus menjelaskan jawaban
  if (question.explanation && question.options && question.correctAnswer !== undefined) {
    const correctOption = question.options[question.correctAnswer];
    // Explanation harus menyebut atau menjelaskan jawaban yang benar
    const explanationMentionsAnswer = 
      question.explanation.toLowerCase().includes(correctOption.substring(0, 10).toLowerCase());
    
    if (!explanationMentionsAnswer && question.explanation.length < 50) {
      errors.push("Explanation kurang detail atau tidak menjelaskan jawaban");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ✅ LOGIKA 3: Fungsi Cek Similarity Soal (Anti-Duplikasi)
function calculateTextSimilarity(text1: string, text2: string): number {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const t1 = normalize(text1);
  const t2 = normalize(text2);

  // Exact match
  if (t1 === t2) return 1.0;

  // Word overlap similarity
  const words1 = new Set(t1.split(" "));
  const words2 = new Set(t2.split(" "));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

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
        let chatHistory = history.slice(0, -1).map((h) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        }));

        while (chatHistory.length > 0 && chatHistory[0].role === "model") {
          chatHistory.shift();
        }

        const chat = model.startChat({ history: chatHistory });

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

// ✅ LOGIKA 2 & 3: Generate Soal dengan Validasi Ketat & Anti-Duplikasi
export const generateDynamicQuestions = async (
  subtest: SubtestType,
  count: number = 10,
  hotsOnly: boolean = false,
  existingQuestions: Question[] = [], // ✅ Parameter baru untuk cek duplikasi
): Promise<Question[]> => {
  if (!API_KEY) throw new Error("No API Key");
  if (!genAI) throw new Error("AI Not Init");

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

  // ✅ LOGIKA 3: Instruksi Anti-Duplikasi
  const uniquenessInstruction = `
CRITICAL: PASTIKAN SOAL BENAR-BENAR BARU DAN UNIK
- JANGAN gunakan kata-kata atau frasa yang sama persis dengan soal yang pernah dibuat
- Gunakan variasi angka, nama, konteks yang berbeda
- Jika membuat soal tentang materi yang sama, gunakan pendekatan dan kasus yang berbeda
- Setiap soal harus unik minimal 70% dari soal lain yang pernah ada
`;

  const prompt = `
Generate EXACTLY ${finalCount} soal SNBT berkualitas tinggi untuk subtest: ${subtest}

${hotsInstruction}
${uniquenessInstruction}

ATURAN VALIDASI KETAT:
1. Setiap soal HARUS memiliki TEPAT SATU jawaban benar
2. Verifikasi perhitungan matematis MINIMAL 3 KALI sebelum output
3. Pastikan tidak ada ambiguitas dalam pertanyaan
4. Opsi pengecoh harus masuk akal tapi jelas salah
5. Untuk soal kuantitatif/matematika: tunjukkan perhitungan di explanation
6. VALIDASI ULANG bahwa index correctAnswer (0-4) sesuai dengan opsi yang benar
7. Explanation harus menjelaskan MENGAPA jawaban benar dan MENGAPA yang lain salah

STANDAR SOAL ${subtest}:
${getSubtestGuidelines(subtest)}

CRITICAL: Generate EXACTLY ${finalCount} questions, no more, no less.

FORMAT JSON - OUTPUT HARUS ARRAY DENGAN ${finalCount} ELEMEN:
[
  {
    "text": "Teks soal lengkap dan jelas (min 50 karakter)",
    "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D", "Opsi E"],
    "correctAnswer": 0,
    "explanation": "Penjelasan detail dengan langkah perhitungan jika ada (min 100 karakter)",
    "quickTrick": "Trik cepat jika ada (max 100 karakter)"
  }
]

PENTING SEKALI:
- Index correctAnswer dimulai dari 0 (A=0, B=1, C=2, D=3, E=4)
- VERIFIKASI 3X bahwa index correctAnswer sesuai dengan opsi yang benar
- JANGAN GUNAKAN $ atau \\ di text atau explanation
- Gunakan simbol unicode: x², √, π, ≠, ≥, ≤
- Pastikan logika soal 100% benar sebelum output
- JANGAN TAMBAHKAN TEKS APAPUN DI LUAR JSON ARRAY
- Explanation harus detail minimal 100 karakter
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
        "\n\nVERIFIKASI JAWABAN: Sebelum output, cek ulang 3X bahwa correctAnswer index sesuai dengan opsi yang benar. " +
        "Output HANYA JSON array yang valid. Pastikan semua string property ditutup dengan benar.",
      generationConfig: {
        temperature: 0.8, // ✅ Naikkan untuk variasi lebih tinggi
        maxOutputTokens: 6000,
        responseMimeType: "application/json",
      },
    });

    const questions = await retryOnQuotaExceeded(
      async () => {
        return await rateLimitedRequest(async () => {
          const response = await model.generateContent(prompt);
          const text = response.response.text();

          console.log("📝 Raw response length:", text.length);

          const cleaned = repairIncompleteJSON(text);

          console.log("🧹 Cleaned text length:", cleaned.length);

          try {
            const parsed = JSON.parse(cleaned);

            if (!Array.isArray(parsed)) {
              throw new Error("Response is not an array");
            }

            if (parsed.length === 0) {
              throw new Error("Response array is empty");
            }

            // ✅ LOGIKA 2: Validasi setiap soal dengan ketat
            const validatedQuestions = parsed.filter((q: any) => {
              const validation = validateQuestionAccuracy(q);

              if (!validation.isValid) {
                console.warn("⚠️ Question validation failed:", validation.errors);
                console.warn("   Question:", q.text?.substring(0, 50));
                return false;
              }

              return true;
            });

            // ✅ LOGIKA 3: Filter soal yang terlalu mirip dengan yang sudah ada
            const uniqueQuestions = validatedQuestions.filter((newQ: any) => {
              for (const existingQ of existingQuestions) {
                const similarity = calculateTextSimilarity(
                  newQ.text,
                  existingQ.text,
                );

                if (similarity > 0.7) {
                  console.warn(
                    `⚠️ Question too similar (${(similarity * 100).toFixed(0)}%) to existing question, skipping:`,
                  );
                  console.warn(`   New: ${newQ.text.substring(0, 50)}...`);
                  console.warn(
                    `   Existing: ${existingQ.text.substring(0, 50)}...`,
                  );
                  return false;
                }
              }
              return true;
            });

            if (uniqueQuestions.length === 0) {
              throw new Error("No unique questions after filtering");
            }

            console.log(
              `✅ Validated ${validatedQuestions.length}/${parsed.length} questions`,
            );
            console.log(
              `✅ Unique questions: ${uniqueQuestions.length}/${validatedQuestions.length}`,
            );

            return uniqueQuestions;
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

    const formattedQuestions = questions.map((q: any, index: number) => ({
      ...q,
      id: `${hotsOnly ? "hots" : "dyn"}-${subtest.substring(0, 3)}-${Date.now()}-${index}`,
      subtest,
      isHOTS: hotsOnly,
    }));

    console.log(
      `✅ Generated ${formattedQuestions.length} validated & unique ${hotsOnly ? "HOTS " : ""}questions for ${subtest}`,
    );
    return formattedQuestions;
  } catch (error: any) {
    console.error("❌ --- [generateDynamicQuestions] ERROR ---");
    console.error("❌ Error Message:", error.message);
    console.error("❌ Subtest:", subtest);
    console.error("❌ Count requested:", finalCount);

    return [];
  }
};

// ✅ Helper: Guidelines spesifik per subtest
function getSubtestGuidelines(subtest: SubtestType): string {
  const guidelines: Record<SubtestType, string> = {
    [SubtestType.PenalaranUmum]: `
- Soal logika: silogisme, diagram Venn, inferensi
- Pola gambar dan angka
- Analisis argumen dan premis
- Pernyataan yang ekuivalen
`,
    [SubtestType.PengetahuanKuantitatif]: `
- Aritmatika dasar: perbandingan, rasio, persen
- Aljabar: persamaan linear dan kuadrat
- Geometri: luas, volume, sudut
- Statistika dasar: mean, median, modus
`,
    [SubtestType.LiterasiIndo]: `
- Pemahaman bacaan: ide pokok, detail, inferensi
- Analisis struktur teks
- Tata bahasa: EYD, kalimat efektif
- Jenis-jenis teks (narasi, eksposisi, dll)
`,
    [SubtestType.LiterasiInggris]: `
- Reading comprehension: main idea, detail, inference
- Grammar: tenses, subject-verb agreement, modals
- Vocabulary in context
- Text organization and coherence
`,
    [SubtestType.PenalaranMatematika]: `
- Problem solving dengan konsep matematika
- Aplikasi matematika dalam kehidupan
- Soal cerita dengan multi-step solution
- Interpretasi grafik dan data
`,
    [SubtestType.PPU]: `
- Pengetahuan umum: sejarah, geografi, budaya
- Sains sosial: ekonomi, sosiologi, politik
- Current affairs (tapi tidak spesifik tanggal)
- Tokoh dan peristiwa penting
`,
    [SubtestType.PBM]: `
- Analisis wacana dan argumentasi
- Struktur teks dan koherensi
- Ide pokok dan ide pendukung
- Kalimat efektif dan pengembangan paragraf
`,
  };

  return guidelines[subtest] || "";
}