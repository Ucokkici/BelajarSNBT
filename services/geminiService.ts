import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage, SubtestType, Question, AIAnalysis } from "../types";

// --- LOGIKA BARU: Baca API Key dari LocalStorage User ---
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

// Inisialisasi Model
let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

const analysisCache = new Map<string, AIAnalysis>();
const topicCache = new Map<string, AIAnalysis>();

// ✅ PERBAIKAN PROMPT: Di sini kita atur agar AI TIDAK BOLEH pakai simbol web/matetika coding
const MASTER_PERSONA_INSTRUCTION = `
Anda adalah AI Master Tutor SNBT Profesional.
PERATURAN PENULISAN MATEMATIKA (WAJIB DIPATUHI):
1. DILARANG KERAS MENGGUNAKAN TANDA DOLAR ($) untuk rumus. CONTOH SALAH: $X^2 = 49$.
2. DILARANG MENGGUNAKAN BACKSLASH (\) untuk perintah LaTeX.
3. WAJIB MENGGUNAKAN SIMBOL UNICODE STANDAR (Simbol yang bisa diketik di HP/Laptop biasa).
   - Pangkat: Gunakan tanda caret ^ atau superscript unicode (contoh: x^2 atau x²).
   - Akar Kuadrat: Gunakan simbol √ (contoh: √49 = 7).
   - Pi: Gunakan simbol π.
   - Tidak Sama Dengan: Gunakan ≠.
   - Lebih Dari Sama Dengan: Gunakan ≥.
   - Kurang Dari Sama Dengan: Gunakan ≤.
   - Derajat: Gunakan °.

CONTOH PENULISAN YANG BENAR:
- Jika X² = 49 dan Y = 7, maka hubungan antara |X| dan Y adalah ...
- Rumus luas lingkaran adalah L = π × r².
- Nilai dari √144 adalah 12.

Jelaskan materi dengan bahasa Indonesia yang jelas, cepat, dan to-the-point.
`;

// Gunakan model flash (lebih cepat & murah)
const DEFAULT_MODEL = "models/gemini-flash-lite-latest";

// Rate limiting helper
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

// Retry helper
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

export const getTutorResponse = async (
  history: ChatMessage[],
  context?: string,
): Promise<string> => {
  if (!API_KEY) {
    return "⚠️ **API Key Belum Diatur**.\n\nSilakan buka menu **API Settings** di sidebar dan masukkan API Key Anda.";
  }
  if (!genAI) throw new Error("AI Model not initialized");

  console.log("💬 --- [getTutorResponse] START ---");

  try {
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      // System Instruction sudah diupdate di atas
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

        const result = await chat.sendMessage(lastMessage);
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
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await retryOnQuotaExceeded(async () => {
      return await rateLimitedRequest(async () => {
        const response = await model.generateContent(prompt);
        const text = response.response
          .text()
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        return JSON.parse(text);
      });
    });

    topicCache.set(cacheKey, result);
    return result;
  } catch (error: any) {
    console.error(error);
    return {
      complex: "Gagal memuat analisis.",
      simple: "Cek koneksi.",
      quick: "Coba lagi.",
      interactive: "Cek Settings.",
      example: { question: "-", answer: "-", stepByStep: "-" },
    };
  }
};

// ✅ PERBAIKAN PROMPT: getDeepAnalysis juga diupdate agar tidak pakai simbol aneh
export const getDeepAnalysis = async (
  question: Question,
): Promise<AIAnalysis> => {
  if (!API_KEY) throw new Error("No API Key");
  if (!genAI) throw new Error("AI Not Init");

  const cacheKey = question.id || question.text;
  if (analysisCache.has(cacheKey)) return analysisCache.get(cacheKey)!;

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
  count: number = 20,
): Promise<Question[]> => {
  if (!API_KEY) throw new Error("No API Key");
  if (!genAI) throw new Error("AI Not Init");

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

PENTING: Pada bagian "text" atau "explanation", JANGAN GUNAKAN TANDA DOLAR ($) untuk rumus matematika. Gunakan simbol biasa seperti x², √, π, ≠, ≥, ≤.
`;

  try {
    console.log(
      `🎯 Generating ${finalCount} questions for ${subtest}. Model:`,
      DEFAULT_MODEL,
    );

    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: MASTER_PERSONA_INSTRUCTION,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 12000,
        responseMimeType: "application/json",
      },
    });

    const questions = await retryOnQuotaExceeded(async () => {
      return await rateLimitedRequest(async () => {
        const response = await model.generateContent(prompt);
        const text = response.response.text();

        // --- FIX PEMBERSIH JSON ---
        let cleanText = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        // Fix Smart Quotes
        cleanText = cleanText.replace(
          /[\u201C\u201D\u201E\u201F\u2033\u2036]/g,
          '"',
        );
        cleanText = cleanText.replace(
          /[\u2018\u2019\u201A\u201B\u2032\u2035]/g,
          "'",
        );
        cleanText = cleanText.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
        cleanText = cleanText.replace(/(\r\n|\n|\r)/gm, " ");
        cleanText = cleanText.replace(/,\s*([\]}])/g, "$1");

        try {
          return JSON.parse(cleanText);
        } catch (e) {
          console.error("❌ Gagal parse JSON:", e);
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
