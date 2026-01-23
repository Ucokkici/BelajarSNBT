import React, { useState, useEffect } from "react";
import {
  Save,
  Key,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedKey = localStorage.getItem("user_gemini_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      localStorage.removeItem("user_gemini_api_key");
      setMessage({ type: "success", text: "Koneksi AI diputus." });
      setTimeout(() => navigate("/"), 1500);
      return;
    }

    if (!apiKey.startsWith("AIza")) {
      setMessage({
        type: "error",
        text: "Kode yang dimasukkan salah. Harus dimulai dengan AIza...",
      });
      return;
    }

    localStorage.setItem("user_gemini_api_key", apiKey.trim());
    setMessage({ type: "success", text: "Berhasil! AI Anda sekarang aktif." });

    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="max-w-lg mx-auto pt-8 pb-20 px-4 animate-in zoom-in-95 duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-200 mb-4">
          <Zap size={40} fill="currentColor" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Aktifkan Fitur AI
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-2">
          Masukkan Kode Akses untuk membuka fitur Tutor Cerdas.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl p-6 md:p-8 space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
          <div className="text-blue-600 mt-0.5">
            <ExternalLink size={18} />
          </div>
          <div className="text-xs leading-relaxed text-blue-900">
            <strong className="block mb-1 font-bold">
              Cara Mendapatkan Kode (Gratis):
            </strong>
            <ol className="list-decimal list-inside space-y-1 font-medium pl-1">
              <li>
                Klik link ini:{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-bold hover:text-blue-600"
                >
                  Buat API Key Google
                </a>
              </li>
              <li>Login dengan akun Gmail biasa.</li>
              <li>
                Klik tombol <strong>"Get API Key"</strong> Di kiri bawah.
              </li>
              <li>
                Klik tombol <strong>"Create API Key"</strong> Di kanan atas.
              </li>
              <li>Klik Key yang sudah dibuat Di kolom Key.</li>
              <li>
                Salin kodenya (biasanya diawali <code>AIza</code>).
              </li>
            </ol>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
            Kode Akses (API Key)
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Tempel kodenya di sini..."
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-center"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          <Save size={18} /> Simpan & Aktifkan
        </button>

        {message && (
          <div
            className={`text-center p-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {message.text}
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest">
        Kode Anda tersimpan aman di browser ini saja.
      </p>
    </div>
  );
};

export default Settings;
