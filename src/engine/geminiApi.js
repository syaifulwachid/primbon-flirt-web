/**
 * Engine Integrasi Google Gemini AI API (Hybrid Mode)
 * Menyediakan balasan Generative AI sejati dengan pemetaan model otomatis (gemini-flash-latest, gemini-2.5-flash)
 * dan Perlindungan Kuota Free Tier.
 */

const GEMINI_USAGE_KEY = 'AURAMATCH_GEMINI_USAGE';

/**
 * Mendapatkan status penggunaan harian Free Tier Gemini API
 */
export function getGeminiUsage() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(GEMINI_USAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        return parsed.count;
      }
    }
  } catch {}
  return 0;
}

/**
 * Merekam penggunaan kuota Gemini API
 */
function incrementGeminiUsage() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const current = getGeminiUsage();
    localStorage.setItem(GEMINI_USAGE_KEY, JSON.stringify({
      date: today,
      count: current + 1
    }));
  } catch {}
}

/**
 * Temukan nama model aktif yang didukung oleh API Key
 */
async function getActiveGeminiModel(cleanKey) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
    if (res.ok) {
      const data = await res.json();
      if (data.models && Array.isArray(data.models)) {
        const found = data.models.find(m =>
          m.supportedGenerationMethods &&
          m.supportedGenerationMethods.includes('generateContent') &&
          (m.name.includes('flash') || m.name.includes('pro'))
        );
        if (found && found.name) {
          return found.name.replace(/^models\//, '');
        }
      }
    }
  } catch (e) {
    console.warn('Model list fetch fallback:', e.message);
  }
  return 'gemini-flash-latest';
}

/**
 * Memanggil Google Gemini API untuk menghasilkan 3 Balasan Flirting AI Sejati
 */
export async function generateGeminiSmartReplies({
  apiKey,
  incomingMessage,
  targetName,
  targetWeton,
  chatHistory,
  dailyLimit = 50
}) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API Key Gemini belum diisi. Silakan masukkan API Key di Pengaturan.');
  }

  // Sanitasikan API Key: hapus spasi/karakter Unicode dash (seperti – / —) yang sering ikut ter-copy
  const cleanKey = apiKey.trim().replace(/[\u2010-\u2015\u2212]/g, '-').replace(/\s+/g, '');

  const currentUsage = getGeminiUsage();
  if (currentUsage >= dailyLimit) {
    throw new Error(`Batas kuota harian Free Tier (${dailyLimit}x/hari) telah tercapai. Beralih ke Mode Lokal.`);
  }

  const prompt = `
Anda adalah Master Dating Coach AI & Flirting Copilot bernama AuraMatch.
Tugas Anda adalah membuat 3 opsi balasan obrolan WhatsApp yang sangat memikat, alami (bahasa santai/gaul Indonesia), bernilai tinggi (high-value), dan berfokus pada flirting & ajakan kencan nyata ala strategi Ronald Frank.

PROFIL TARGET:
- Nama: ${targetName || 'Gebetan'}
- Weton: ${targetWeton?.wetonString || 'Umum'} (Karakter Element: ${targetWeton?.lakuning?.name || 'Netral'})

PESAN WHATSAPP TERAKHIR DARI SANG WANITA:
"${incomingMessage}"

RIWAYAT PERCAKAPAN SINGKAT SEBELUMNYA:
${chatHistory ? chatHistory.map(m => `${m.sender === 'user' ? 'Kamu' : targetName}: "${m.text}"`).join('\n') : 'Belum ada.'}

PETUNJUK BALASAN:
Hasilkan TEPAT 3 opsi balasan dalam format JSON ARRAY murni sebagai berikut:
[
  {
    "category": "Playful Banter (Goda Santai)",
    "text": "Kalimat balasan godaan santai & lucu yang merespons langsung pesan terakhirnya.",
    "reason": "Alasan psikologis dibalik balasan ini."
  },
  {
    "category": "Curiosity / Connection Hook",
    "text": "Kalimat balasan yang memicu rasa penasaran atau membangun chemistry.",
    "reason": "Alasan psikologis dibalik balasan ini."
  },
  {
    "category": "The Date Closer (Transisi Kencan)",
    "text": "Kalimat balasan yang mengonversi topiknya menjadi ajakan kencan/ngopi santai 30 menit.",
    "reason": "Alasan psikologis dibalik balasan ini."
  }
]

SYARAT MUTLAK:
- Bahasa Indonesia santai/gaul anak muda, alami, dan tidak seperti robot.
- Nyambung 100% dengan pesan terakhirnya: "${incomingMessage}".
- HANYA kembalikan JSON array valid tanpa teks markdown atau penjelasan ekstra.
`;

  // Temukan nama model aktif yang tersedia untuk API Key ini
  const activeModel = await getActiveGeminiModel(cleanKey);

  const candidateModels = [
    activeModel,
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-pro-latest',
    'gemini-1.5-flash'
  ];

  const apiVersions = ['v1beta', 'v1'];
  let lastErrorMsg = '';

  for (const apiVer of apiVersions) {
    for (const rawModel of candidateModels) {
      if (!rawModel) continue;
      const modelName = rawModel.replace(/[\u2010-\u2015\u2212]/g, '-');

      try {
        const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${modelName}:generateContent?key=${cleanKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 800
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          lastErrorMsg = errorData.error?.message || `HTTP ${response.status}`;
          if (response.status === 404 || (lastErrorMsg && (lastErrorMsg.includes('not found') || lastErrorMsg.includes('not supported')))) {
            continue;
          } else {
            throw new Error(lastErrorMsg);
          }
        }

        const data = await response.json();
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textOutput) {
          continue;
        }

        // Parse JSON Array
        let cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();

        const jsonMatch = cleanJson.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          cleanJson = jsonMatch[0];
        }

        const parsedReplies = JSON.parse(cleanJson);

        if (Array.isArray(parsedReplies) && parsedReplies.length > 0) {
          incrementGeminiUsage();
          return parsedReplies;
        }
      } catch (e) {
        lastErrorMsg = e.message;
        if (e.message && (e.message.includes('API key not valid') || e.message.includes('API_KEY_INVALID'))) {
          throw new Error('API Key Google Gemini tidak valid. Silakan periksa kembali API Key Anda.');
        }
      }
    }
  }

  throw new Error(`Gagal memanggil Gemini API: ${lastErrorMsg}`);
}
