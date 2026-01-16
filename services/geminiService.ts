import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage, SubtestType, Question, AIAnalysis } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log("🔑 --- DEBUG: INIT SERVICE ---");
console.log("🔑 API Key status:", API_KEY ? "✅ Loaded" : "❌ Not Found");
if (API_KEY) {
  console.log("🔑 API Key prefix:", API_KEY.substring(0, 12) + "...");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const analysisCache = new Map<string, AIAnalysis>();
const topicCache = new Map<string, AIAnalysis>();

const MASTER_PERSONA_INSTRUCTION = `
Anda adalah AI Master Tutor SNBT Profesional.
PERATURAN UTAMA:
1. DILARANG KERAS MENGGUNAKAN SIMBOL DOLAR ($) ATAU BACKSLASH (\). 
2. GUNAKAN HANYA SIMBOL UNICODE untuk rumus: →, ¬, ∧, ∨, ∴, ↔, ≡, √, π, ±, ≠, ≤, ≥, ², ³, ∩, ∪, ∑, ∫, ≈, ∈, ∉, ⊂
3. Berikan penjelasan yang super cepat dan to-the-point.
4. Format output dalam paragraf dengan line breaks (\n\n) untuk readability.
`;

// Menggunakan model yang terbukti berfungsi di akun Anda
const DEFAULT_MODEL = "models/gemini-flash-latest";
console.log("🤖 Default Model Set to:", DEFAULT_MODEL);

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 4000; // 4 seconds

async function rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏱️ Rate limiting: Waiting ${Math.round(waitTime / 1000)}s...`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
  return requestFn();
}

// Retry logic
async function retryOnQuotaExceeded<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 5000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const is429 =
        error.message?.includes("429") || error.message?.includes("quota");
      const isLastAttempt = attempt === maxRetries;

      if (is429 && !isLastAttempt) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(
          `⚠️ Quota exceeded. Retrying in ${delay / 1000}s... (Attempt ${
            attempt + 1
          }/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

export const getTutorResponse = async (
  history: ChatMessage[],
  context?: string
): Promise<string> => {
  console.log("💬 --- [getTutorResponse] START ---");
  console.log("💬 History length:", history.length);

  try {
    console.log("💬 Initializing Model:", DEFAULT_MODEL);
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction:
        MASTER_PERSONA_INSTRUCTION +
        `\nKonteks: ${context || "Belajar"}. JANGAN GUNAKAN $.`,
    });

    return await retryOnQuotaExceeded(async () => {
      return await rateLimitedRequest(async () => {
        // Build chat history
        let chatHistory = history.slice(0, -1).map((h) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        }));

        // ✅ FIX: Hapus pesan di awal jika role-nya 'model' agar pesan pertama adalah 'user'
        while (chatHistory.length > 0 && chatHistory[0].role === "model") {
          chatHistory.shift();
        }

        const chat = model.startChat({ history: chatHistory });
        const lastMessage = history[history.length - 1].text;

        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;

        console.log("✅ Tutor response received");
        return response.text();
      });
    });
  } catch (error: any) {
    console.error("❌ --- [getTutorResponse] ERROR ---");
    console.error("❌ Error Message:", error.message);

    if (error.message?.includes("API key")) {
      return "⚠️ API Key tidak valid. Periksa file .env.local Anda.";
    }

    if (error.message?.includes("429") || error.message?.includes("quota")) {
      return "⚠️ Quota API habis untuk hari ini. Coba lagi besok atau upgrade ke paid plan.";
    }

    if (error.message?.includes("400")) {
      return "⚠️ Request tidak valid. Coba refresh halaman.";
    }

    if (error.message?.includes("404")) {
      return `⚠️ Model "${DEFAULT_MODEL}" tidak ditemukan (404). Coba ganti ke 'gemini-pro'.`;
    }

    return "⚠️ Maaf, terjadi kesalahan. Silakan coba lagi.";
  }
};

export const getTopicExplanation = async (
  topic: string,
  subtest: string
): Promise<AIAnalysis> => {
  console.log("📖 --- [getTopicExplanation] START ---");
  console.log("📖 Topic:", topic, "| Subtest:", subtest);

  const cacheKey = `${subtest}-${topic}`;

  if (topicCache.has(cacheKey)) {
    console.log("📦 Using cached analysis for:", topic);
    return topicCache.get(cacheKey)!;
  }

  const prompt = `
Analisis mendalam materi SNBT berikut:
Topik: ${topic}
Subtest: ${subtest}

Berikan analisis dalam 4 format:
1. QUICK: Tips cepat dan strategi praktis (3-4 poin singkat)
2. SIMPLE: Analogi sederhana dengan contoh dunia nyata
3. COMPLEX: Penjelasan akademik mendalam dengan simbol Unicode
4. INTERACTIVE: 2-3 pertanyaan reflektif untuk siswa

Plus 1 contoh soal HOTS lengkap dengan jawaban dan step-by-step solution.

PENTING:
- Gunakan simbol Unicode: →, ¬, ∧, ∨, ∴, ↔, ≡, √, π, ±, ≠, ≤, ≥, ², ³
- JANGAN gunakan $ atau backslash
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
    console.log("🤖 Generating topic analysis. Model:", DEFAULT_MODEL);

    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: MASTER_PERSONA_INSTRUCTION,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    const result = await retryOnQuotaExceeded(async () => {
      return await rateLimitedRequest(async () => {
        const response = await model.generateContent(prompt);
        const text = response.response.text();

        // Clean response
        const cleanText = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        return JSON.parse(cleanText);
      });
    });

    if (
      !result.quick ||
      !result.simple ||
      !result.complex ||
      !result.interactive
    ) {
      throw new Error("Incomplete response from AI");
    }

    topicCache.set(cacheKey, result);
    console.log("✅ Topic analysis generated and cached");

    return result;
  } catch (error: any) {
    console.error("❌ --- [getTopicExplanation] ERROR ---");
    console.error("❌ Error Message:", error.message);

    return {
      complex: `Maaf, terjadi kesalahan: ${error.message}`,
      simple: "Sistem sedang mengalami gangguan. Silakan coba lagi.",
      quick: "Tips: Refresh halaman dan coba lagi.",
      interactive: "Gunakan materi offline sambil menunggu.",
      example: {
        question: "Contoh soal tidak dapat di-generate saat ini.",
        answer: "-",
        stepByStep: "Coba lagi nanti.",
      },
    };
  }
};

export const getDeepAnalysis = async (
  question: Question
): Promise<AIAnalysis> => {
  console.log("🔍 --- [getDeepAnalysis] START ---");
  const cacheKey = question.id || question.text;

  if (analysisCache.has(cacheKey)) {
    console.log("📦 Using cached analysis for question:", question.id);
    return analysisCache.get(cacheKey)!;
  }

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
Gunakan simbol Unicode, JANGAN $ atau backslash.

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
        maxOutputTokens: 3072,
        responseMimeType: "application/json",
      },
    });

    const result = await retryOnQuotaExceeded(async () => {
      return await rateLimitedRequest(async () => {
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const cleanText = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        return JSON.parse(cleanText);
      });
    });

    analysisCache.set(cacheKey, result);
    console.log("✅ Deep analysis generated and cached");

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

export const generateDynamicQuestions = async (
  subtest: SubtestType,
  count: number = 20 // Default di service adalah 20
): Promise<Question[]> => {
  console.log("🎯 --- [generateDynamicQuestions] START ---");

  // Mengurangi jumlah jika caller tidak spesifik (meski App.tsx mungkin tetap paksa 30)
  const finalCount = count > 20 ? 20 : count;

  const prompt = `
Generate ${finalCount} soal SNBT berkualitas tinggi untuk subtest: ${subtest}

RETURN HANYA JSON ARRAY:
[
  {
    "text": "question text",
    "options": ["A", "B", "C", "D", "E"],
    "correctAnswer": 0-4,
    "explanation": "explanation text",
    "quickTrick": "trick text"
  }
]
`;

  try {
    console.log(
      `🎯 Generating ${finalCount} questions for ${subtest}. Model:`,
      DEFAULT_MODEL
    );

    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: MASTER_PERSONA_INSTRUCTION,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 12000, // ✅ UPDATE: Dinaikkan untuk antisipasi soal panjang
        responseMimeType: "application/json",
      },
    });

    const questions = await retryOnQuotaExceeded(async () => {
      return await rateLimitedRequest(async () => {
        const response = await model.generateContent(prompt);
        const text = response.response.text();

        // --- FIX PEMBERSIH JSON PALING ROBUST ---
        let cleanText = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        // 1. FIX SMART QUOTES (Sangat sering penyebab error)
        // Mengganti kutipan ganda miring “ ” dengan kutipan lurus "
        cleanText = cleanText.replace(
          /[\u201C\u201D\u201E\u201F\u2033\u2036]/g,
          '"'
        );
        // Mengganti kutipan tunggal miring ‘ ’ dengan kutipan lurus '
        cleanText = cleanText.replace(
          /[\u2018\u2019\u201A\u201B\u2032\u2035]/g,
          "'"
        );

        // 2. FIX CONTROL CHARACTERS (Backspace dll yang mengacaukan JSON)
        cleanText = cleanText.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

        // 3. FLATTEN KE SATU BARIS
        cleanText = cleanText.replace(/(\r\n|\n|\r)/gm, " ");

        // 4. HAPUS KOMA EKSTRA DI AKHIR OBJEK
        cleanText = cleanText.replace(/,\s*([\]}])/g, "$1");

        try {
          return JSON.parse(cleanText);
        } catch (e) {
          console.error("❌ Gagal parse JSON setelah dibersihkan:", e);
          console.error(
            "🧪 Cek potongan teks (500 char terakhir):",
            cleanText.slice(-500)
          );
          throw e;
        }
      });
    });

    const formattedQuestions = questions.map((q: any) => ({
      ...q,
      id: `dyn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subtest,
    }));

    console.log(`✅ Generated ${formattedQuestions.length} questions`);
    return formattedQuestions;
  } catch (error: any) {
    console.error("❌ --- [generateDynamicQuestions] ERROR ---");
    console.error("❌ Error Message:", error.message);
    return [];
  }
};

export const testGeminiConnection = async (): Promise<boolean> => {
  console.log("🧪 --- [testGeminiConnection] START ---");
  try {
    console.log("🧪 Model used for test:", DEFAULT_MODEL);

    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const response = await rateLimitedRequest(async () => {
      const result = await model.generateContent("Test");
      return result.response.text();
    });

    console.log("✅ Gemini API is working! Response:", response);
    return true;
  } catch (error: any) {
    console.error("❌ --- [testGeminiConnection] FAILED ---");
    console.error("❌ Error Message:", error.message);
    return false;
  }
};

// ✅ FUNGSI DIAGNOSTIK: Cek Model yang Tersedia
export const listAvailableModels = async () => {
  console.log("🔍 --- [DIAGNOSIS MODEL] START ---");
  console.log("🔍 Mencoba mengambil daftar model langsung dari Google...");

  try {
    // Memanggil API listModels secara manual untuk diagnosis
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("❌ Gagal mengambil data:", data.error.message);
      console.log(
        "💡 Penyebab mungkin: Region account Anda tidak support, atau API Key belum jalan."
      );
      return;
    }

    console.log("✅ SUKSES! Google memberikan daftar model:");
    console.log("---------------------------------------------------");
    console.table(
      data.models.map((m: any) => ({
        "Nama Lengkap (Pakai ini)": m.name,
        "Nama Singkat": m.name.split("/").pop(),
        "Display Name": m.displayName,
      }))
    );
    console.log("---------------------------------------------------");
    console.log("👆 LIHAT TABEL DI CONSOLE!");
    console.log(
      "👆 Salin isi kolom 'Nama Lengkap', lalu ganti DEFAULT_MODEL dengan itu."
    );
  } catch (e) {
    console.error("❌ Error Network:", e);
  }
};
