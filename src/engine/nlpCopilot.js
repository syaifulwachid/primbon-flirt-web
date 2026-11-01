/**
 * NLP Sentiment & AI Flirting Copilot Engine
 * Membedah pesan masuk dari target menggunakan analisis sentimen psikologis,
 * mendeteksi "Shit Test", suhu emosi, dan menghasilkan 3 rekomendasi balasan
 * yang disesuaikan dengan Weton & Numerologi target ala Ronald Frank.
 */

// Kamus Pola Deteksi NLP
const NLP_PATTERNS = {
  // 1. Tipe Ujian / Shit-Test (Menantang nilai pria)
  shitTest: [
    /pasti kamu sering ya/i,
    /ke semua cewek ngomong gini ya/i,
    /playboy/i,
    /buaya/i,
    /modus/i,
    /gombal/i,
    /sok tau/i,
    /sok asik/i,
    /kamu tuh/i
  ],

  // 2. Tipe Lelah / Curhat Pekerjaan (Butuh pelarian & tawa, bukan nasihat logis)
  exhausted: [
    /capek/i,
    /lelah/i,
    /pusing/i,
    /lembur/i,
    /kantor/i,
    /deadline/i,
    /bosan/i,
    /muak/i,
    /ribet/i,
    /stress/i,
    /stres/i,
    /pegel/i
  ],

  // 3. Tipe Dingin / Respons Singkat (Dry Texting / Kurang Tertarik / Menguji Ketergantungan)
  dryText: [
    /^(iya|ya|y|ok|oke|oh|sip|hmm|wkwk|haha)$/i,
    /^(gapapa|gpp|terserah)$/i
  ],

  // 4. Tipe Ceria / Tertarik (High Interest & Playful)
  enthusiastic: [
    /hahaha+/i,
    /wkwkwk+/i,
    /serius\?/i,
    /masa sih/i,
    /lucu/i,
    /keren/i,
    /asik/i,
    /kamu lagi apa/i,
    /ceritain dong/i
  ],

  // 5. Tipe Menolak / Menghindar Halus
  avoidant: [
    /lagi sibuk/i,
    /belum tahu/i,
    /kapan-kapan/i,
    /lihat nanti/i,
    /mungkin/i,
    /males keluar/i
  ]
};

/**
 * Menganalisa teks pesan terakhir wanita
 * @param {string} incomingMessage Pesan teks dari target
 * @param {object} targetWeton Profil weton target
 * @param {object} numerologyData Profil numerologi target
 * @param {object} personalDayData Profil siklus hari ini
 */
export function analyzeIncomingMessage(incomingMessage, targetWeton, numerologyData, personalDayData) {
  if (!incomingMessage || !incomingMessage.trim()) {
    return null;
  }

  const msg = incomingMessage.trim();
  let detectedType = 'neutral';
  let emotionalTone = 'Netral / Percakapan Santai';
  let dangerLevel = 'Aman';
  let tacticalAdvice = 'Pertahankan ritme obrolan yang setara dan menyenangkan.';

  // Evaluasi Rule NLP
  if (NLP_PATTERNS.shitTest.some(regex => regex.test(msg))) {
    detectedType = 'shitTest';
    emotionalTone = 'Shit-Test (Menguji Kepalsuan & Mentalitas Anda)';
    dangerLevel = 'Perhatian Khusus';
    tacticalAdvice = 'JANGAN DEFENSIF! Jangan membantah atau menjelaskan diri. Setujui dengan melebih-lebihkannya (Agree & Amplify) atau ledek balik dengan senyuman.';
  } else if (NLP_PATTERNS.exhausted.some(regex => regex.test(msg))) {
    detectedType = 'exhausted';
    emotionalTone = 'Kelelahan Mental / Beban Pekerjaan';
    dangerLevel = 'Rentan';
    tacticalAdvice = 'Jangan berikan solusi logis seperti "minum vitamin/istirahat". Berikan validasi emosional dan tawarkan pelarian santai (kopi/camilan).';
  } else if (NLP_PATTERNS.dryText.some(regex => regex.test(msg)) || msg.length <= 4) {
    detectedType = 'dryText';
    emotionalTone = 'Dry Text (Suhu Emosi Rendah / Sedang Terdistraksi)';
    dangerLevel = 'Rentan';
    tacticalAdvice = 'Tahan jempol! Dilarang spam pertanyaan baru. Balas pendek yang santai atau biarkan hening sejenak agar nilai Anda tetap tinggi.';
  } else if (NLP_PATTERNS.enthusiastic.some(regex => regex.test(msg))) {
    detectedType = 'enthusiastic';
    emotionalTone = 'Tertarik & Ceria (High Momentum)';
    dangerLevel = 'Sangat Kondusif';
    tacticalAdvice = 'Momentum emas! Manfaatkan energi cerianya untuk playful teasing atau langsung eskalasi ke ajakan kencan nyata (The Date Closer).';
  } else if (NLP_PATTERNS.avoidant.some(regex => regex.test(msg))) {
    detectedType = 'avoidant';
    emotionalTone = 'Ragu / Menolak Halus (Resistance)';
    dangerLevel = 'Waspada';
    tacticalAdvice = 'Tunjukkan Non-Reactivity (santai). Balas: "Santai aja, bukan kencan resmi kok haha." lalu ganti topik.';
  }

  // Generate 3 Smart Replies berdasarkan tipe emosi & weton
  const replies = generateSmartReplies(detectedType, msg, targetWeton, numerologyData, personalDayData);

  return {
    rawMessage: msg,
    detectedType,
    emotionalTone,
    dangerLevel,
    tacticalAdvice,
    replies
  };
}

/**
 * Generator 3 Opsi Balasan AI ala Ronald Frank
 */
function generateSmartReplies(type, msg, targetWeton, numerologyData, personalDayData) {
  const targetName = numerologyData?.cleanName || 'dia';

  switch (type) {
    case 'shitTest':
      return [
        {
          category: 'Agree & Amplify (Humor)',
          text: 'Bukan ke semua cewek kok... cuma ke cewek yang tatapannya galak tapi aslinya gampang luluh kayak kamu aja haha.',
          reason: 'Mengakui tuduhannya secara bercanda tanpa rasa takut (unshakable confidence).'
        },
        {
          category: 'Playful Teasing (Balik Menuduh)',
          text: 'Baru kenal udah curigaan gini... jangan-jangan kamu tipe posesif ya? Bahaya nih kalau deket-deket haha.',
          reason: 'Membalik posisi seolah-olah dia yang tertarik dan ingin memiliki Anda.'
        },
        {
          category: 'The Non-Needy Close',
          text: 'Terserah deh dibilang modus apa enggak, yang penting feeling-ku bilang kita bakal seru kalau ngobrol langsung. Jumat malam kopi darat 30 menit yuk.',
          reason: 'Mengalihkan tes logika langsung ke aksi kencan nyata tanpa bertele-tele.'
        }
      ];

    case 'exhausted':
      return [
        {
          category: 'Oase / Pelarian Santai (Empati)',
          text: 'Kelihatan banget kepalanya lagi butuh disiram es kopi susu nih biar gak ngebul haha.',
          reason: 'Memberikan kesegaran tanpa membuat dia merasa digurui atau dinasihati.'
        },
        {
          category: 'The Date Closer Spontan',
          text: 'Daripada pusing mandangin layar terus, nanti sore temenin cari cemilan manis 30 menit yuk. Anggap aja break darurat.',
          reason: 'Memanfaatkan rasa lelahnya menjadi alasan yang sangat valid untuk keluar kencan.'
        },
        {
          category: 'Comfort & Validasi',
          text: 'Kerjaan emang gak ada habisnya, tapi keren sih kamu selalu tanggung jawab sampai tuntas. Malam ini istirahat total ya.',
          reason: 'Validasi tulus terhadap kompetensinya (kualifikasi karakter).'
        }
      ];

    case 'dryText':
      return [
        {
          category: 'Curiosity Hook (Memecah Kebekuan)',
          text: 'Singkat amat balasnya... lagi sibuk menyelamatkan dunia dari serangan alien ya? haha.',
          reason: 'Menegur singkatnya balasan dengan humor ringan tanpa terkesan baper/tersinggung.'
        },
        {
          category: 'High-Value Silence (Tahan Diri)',
          text: 'Oke sip, kelarin dulu urusanmu. Kabari kalau udah santai ya.',
          reason: 'Menunjukkan bahwa waktu Anda juga berharga dan Anda tidak memohon perhatiannya.'
        },
        {
          category: 'Pernyataan Menggantung',
          text: 'Tadi barusan ada hal random banget yang bikin aku ingat kamu, tapi kamu lagi sibuk ya... nanti deh kuceritain.',
          reason: 'Memicu naluri penasaran wanita (wanita tidak tahan dengan cerita yang digantung).'
        }
      ];

    case 'enthusiastic':
      return [
        {
          category: 'The Date Closer (Momentum Kencan)',
          text: 'Ketawanya nular sampai sini haha. Daripada seru di chat doang, besok lusa temenin cari kopi favorit yuk. 40 menit aja sambil ngobrol langsung.',
          reason: 'Mengonversi momentum tawa menjadi kencan nyata (prinsip utama Ronald Frank).'
        },
        {
          category: 'Playful Push-Pull',
          text: 'Ternyata asik juga ya diajak ngobrol, padahal di awal mukanya judes banget kayak satpam perumahan haha.',
          reason: 'Memuji sambil sedikit meledek agar chemistry tetap bergetar.'
        },
        {
          category: 'Eskalasi Topik Intim',
          text: 'Satu pertanyaan penting: kalau lagi libur gini biasanya kamu tim rebahan seharian atau tim petualang nyari tempat baru?',
          reason: 'Menggali kebiasaan dan membuka pintu untuk rencana pertemuan berikutnya.'
        }
      ];

    case 'avoidant':
      return [
        {
          category: 'Low Pressure Reframe',
          text: 'Santai aja, bukan kencan formal lamaran kok haha. Cuma cari kopi sebentar sambil istirahat.',
          reason: 'Menurunkan ekspektasi dan tekanan komitmen yang dirasakan wanita.'
        },
        {
          category: 'Non-Reaktif & Mundur Elegan',
          text: 'Oke gak masalah, next time aja kalau jadwalmu lagi longgar ya.',
          reason: 'Pria bernilai tinggi tidak pernah memaksa wanita yang belum siap.'
        },
        {
          category: 'Playful Challenge',
          text: 'Hmm kayaknya kamu tipe yang kalau diajak keluar harus pake proposal tertulis 3 rangkap ya? haha.',
          reason: 'Mencairkan ketegangannya dengan humor.'
        }
      ];

    default:
      return [
        {
          category: 'Playful Banter',
          text: 'Menarik juga sudut pandangmu. Jarang nemu orang yang cara mikirnya kayak gitu.',
          reason: 'Membangun koneksi intelektual santai.'
        },
        {
          category: 'Storytelling Hook',
          text: 'Ngomong-ngomong soal itu, kemarin aku ngalamin kejadian lucu yang persis kayak yang kamu omongin barusan...',
          reason: 'Meneruskan percakapan secara natural menggunakan teknik storytelling.'
        },
        {
          category: 'Transisi Kencan Ringan',
          text: 'Kayaknya topik ini lebih seru dibahas sambil nyeruput minuman dingin deh. Weekend ini free jam berapa?',
          reason: 'Mengarahkan obrolan menuju kencan tatap muka.'
        }
      ];
  }
}
