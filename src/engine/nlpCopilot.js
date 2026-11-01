/**
 * NLP Sentiment & AI Flirting Copilot Engine
 * Membedah pesan masuk dari target menggunakan analisis sentimen psikologis,
 * mendeteksi "Shit Test", suhu emosi, rasio investasi kata (Two-Way Context),
 * dan menghasilkan 3 rekomendasi balasan kontekstual yang disesuaikan dengan Weton & Numerologi.
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
    /kamu tuh/i,
    /curiga/i
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
    /pegel/i,
    /revisi/i,
    /dosen/i,
    /skripsi/i
  ],

  // 3. Tipe Dingin / Respons Singkat / Pertanyaan "Knp ?" (Dry Texting)
  dryText: [
    /^(iya|ya|y|ok|oke|oh|sip|hmm|wkwk|haha)$/i,
    /^(gapapa|gpp|terserah)$/i,
    /^(knp|kenapa|napa|apaan|ada apa|kenapa emang|kenapa\?|knp\?|napa\?|apa\?)$/i,
    /knp|kenapa|napa|apaan/i
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
 * Ekstraksi Frasa Utama dari Pesan Wanita (Smart Subject Extractor)
 */
function extractCoreSubject(msg) {
  if (!msg) return 'obrolan ini';
  let text = msg.trim();

  // Hilangkan tanda baca berlebih di ujung
  text = text.replace(/[!?.,~]+$/g, '').trim();

  // Hapus awalan/akhiran umum yang kurang informatif
  let cleaned = text
    .replace(/^(lagi|barusan|aku lagi|baru|kemarin|tadi)\s+/i, '')
    .replace(/\s+(nih|ya|sih|dong|deh|lohh|banget|bgt)$/i, '')
    .trim();

  if (cleaned.length >= 3) {
    return cleaned;
  }
  return text;
}

/**
 * Ekstraksi Konteks Topik dari Pesan Kontak
 */
function extractTopicContext(msg) {
  const text = (msg || '').toLowerCase();

  if (/kantor|kerja|lembur|boss|bos|deadline|laporan/i.test(text)) {
    return { topic: 'kerjaan', label: 'pekerjaan kantor', icon: '💼' };
  }
  if (/skripsi|tugas|kuliah|dosen|kampus|ujian|sem/i.test(text)) {
    return { topic: 'kuliah', label: 'tugas kuliah/dosen', icon: '🎓' };
  }
  if (/kopi|coffee|kafe|cafe|boba|es/i.test(text)) {
    return { topic: 'kopi', label: 'kopi & minuman', icon: '☕' };
  }
  if (/makan|lapar|laper|seblak|bakso|mie|nasi|cemilan|kuliner|food/i.test(text)) {
    return { topic: 'kuliner', label: 'makanan', icon: '🍕' };
  }
  if (/macet|hujan|panas|jalan|angkot|motor|mobil|pim|mall|pintu/i.test(text)) {
    return { topic: 'perjalanan', label: 'kondisi jalan/cuaca/mall', icon: '🚗' };
  }
  if (/film|nonton|cinema|bioskop|series|netflix/i.test(text)) {
    return { topic: 'hiburan', label: 'film / hiburan', icon: '🎬' };
  }
  if (/rumah|rebahan|kasur|kamar|tidur|males|gabut/i.test(text)) {
    return { topic: 'istirahat', label: 'rebahan di rumah', icon: '🏠' };
  }

  return { topic: 'umum', label: 'topik obrolan', icon: '💬' };
}

/**
 * Menganalisa teks pesan terakhir wanita
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
  } else if (NLP_PATTERNS.dryText.some(regex => regex.test(msg)) || msg.length <= 7) {
    detectedType = 'dryText';
    emotionalTone = 'Dry Text (Suhu Emosi Rendah / Pertanyaan Singkat)';
    dangerLevel = 'Rentan';
    tacticalAdvice = 'Tahan jempol! Dilarang spam penjelasan panjang lebar. Berikan balasan gantung yang memicu rasa penasaran agar dia yang balik mengejar.';
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

  // Generate 3 Smart Replies berdasarkan tipe emosi, konteks topik & weton
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
 * Menganalisa Riwayat Percakapan Utuh Dua Arah (Two-Way Context)
 * Menghitung rasio investasi kata, level eskalasi kencan, dan rekomendasi berikutnya.
 */
export function analyzeConversationThread(messages, targetWeton, numerologyData, personalDayData) {
  if (!messages || messages.length === 0) return null;

  let userWords = 0;
  let targetWords = 0;

  messages.forEach(m => {
    const words = (m.text || '').trim().split(/\s+/).filter(Boolean).length;
    if (m.sender === 'user') {
      userWords += words;
    } else {
      targetWords += words;
    }
  });

  const ratio = (userWords / Math.max(targetWords, 1)).toFixed(2);
  let ratioStatus = 'Ideal';
  let ratioMessage = 'Dinamika Seimbang & Menarik (Saling Berinvestasi Kata).';
  let ratioBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  if (parseFloat(ratio) > 2.0 && targetWords > 10) {
    ratioStatus = 'Danger (Over-Investment)';
    ratioMessage = '⚠️ Anda mengetik 2x lebih panjang dari target! Hukum Ronald Frank: Jangan terlihat over-invested. Pangkas pesan berikutnya menjadi 1 kalimat pendek.';
    ratioBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  } else if (parseFloat(ratio) < 0.6 && targetWords > 15) {
    ratioStatus = 'High Mystery (Target Mengejar)';
    ratioMessage = '🔥 Target menginvestasikan kata jauh lebih banyak dari Anda! Nilai diri Anda tinggi dan dia sangat tertarik.';
    ratioBadge = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
  }

  // Tangga Eskalasi (Level 1 s/d 4)
  const totalMessages = messages.length;
  let escalationLevel = 1;
  let escalationLabel = 'Level 1: Opening & Icebreaking';
  let escalationProgress = 25;

  if (totalMessages >= 8 || targetWords > 50) {
    escalationLevel = 4;
    escalationLabel = 'Level 4: 🎯 Date Close Ready (Waktunya Eksekusi Kencan!)';
    escalationProgress = 100;
  } else if (totalMessages >= 5) {
    escalationLevel = 3;
    escalationLabel = 'Level 3: Deep Comfort & Keintiman Emosional';
    escalationProgress = 75;
  } else if (totalMessages >= 3) {
    escalationLevel = 2;
    escalationLabel = 'Level 2: Playful Banter & Teasing';
    escalationProgress = 50;
  }

  // Ambil pesan terakhir dari target
  const lastTargetMsg = [...messages].reverse().find(m => m.sender === 'target');
  const baseAnalysis = analyzeIncomingMessage(
    lastTargetMsg ? lastTargetMsg.text : messages[messages.length - 1].text,
    targetWeton,
    numerologyData,
    personalDayData
  );

  return {
    ...baseAnalysis,
    userWords,
    targetWords,
    ratio,
    ratioStatus,
    ratioMessage,
    ratioBadge,
    escalationLevel,
    escalationLabel,
    escalationProgress
  };
}

/**
 * Generator 3 Opsi Balasan AI Kontekstual Disesuaikan Topik & Emosi Chat
 */
function generateSmartReplies(type, msg, targetWeton, numerologyData, personalDayData) {
  const subject = extractCoreSubject(msg);
  const context = extractTopicContext(msg);

  // 1. KATEGORI UJIAN / SHIT-TEST
  if (type === 'shitTest') {
    return [
      {
        category: 'Agree & Amplify (Humor)',
        text: `Ngomong gitu tuh cuma khusus ke cewek yang suka nuduh kayak kamu aja haha.`,
        reason: 'Mengakui tuduhannya secara bercanda tanpa rasa takut (unshakable confidence).'
      },
      {
        category: 'Playful Teasing (Balik Menuduh)',
        text: `Baru ngobrol bentar udah curigaan gini... jangan-jangan kamu tipe yang gampang baper ya? Bahaya nih haha.`,
        reason: 'Membalik posisi seolah-olah dia yang tertarik dan ingin memiliki Anda.'
      },
      {
        category: 'The Non-Needy Close',
        text: `Daripada nebak-nebak di chat, mending buktikan langsung pas ngopi santai Jumat ini. 30 menit aja, berani gak?`,
        reason: 'Mengalihkan tes logika langsung ke aksi kencan nyata tanpa bertele-tele.'
      }
    ];
  }

  // 2. KATEGORI EXHAUSTED / LELAH
  if (type === 'exhausted') {
    return [
      {
        category: 'Oase / Pelarian Santai (Empati)',
        text: `Kelihatan banget kepalanya lagi butuh disiram es kopi dingin biar gak pusing gara-gara ${subject} haha.`,
        reason: 'Memberikan kesegaran khusus terhadap hal yang bikin dia lelah tanpa menggurui.'
      },
      {
        category: 'The Date Closer Spontan',
        text: `Daripada pusing mikirin ${subject} terus, nanti sore temenin cari cemilan manis 30 menit yuk. Anggap aja break darurat.`,
        reason: 'Memanfaatkan situasi lelahnya menjadi alasan valid untuk keluar kencan.'
      },
      {
        category: 'Comfort & Validasi',
        text: `Soal ${subject} emang bikin pusing, tapi keren sih kamu selalu tanggung jawab lewatinnya. Malam ini wajib istirahat total ya.`,
        reason: 'Validasi tulus terhadap karakter dan usahanya.'
      }
    ];
  }

  // 3. KATEGORI DRY TEXT / PESAN SINGKAT / PERTANYAAN "Knp ?"
  if (type === 'dryText') {
    return [
      {
        category: 'Curiosity Hook (Membuat Penasaran)',
        text: `Ada deh... rahasia negara, nanti kalo pas ngopi santai baru kuceritain haha.`,
        reason: 'Menggantung jawaban memicu rasa penasaran karena wanita tidak tahan dengan cerita yang belum selesai.'
      },
      {
        category: 'Playful Teasing (Goda & Balik Menuduh)',
        text: `Kepo amat... baru ditanya gitu aja udah penasaran setengah mati kamu haha.`,
        reason: 'Membalik posisi seolah-olah dia yang sangat memperhatikan dan penasaran pada Anda.'
      },
      {
        category: 'The Date Closer (Transisi Ajakan Kencan)',
        text: `Panjang ceritanya kalo dijelasin lewat chat. Mending Jumat sore ini 30 menit kita ngopi bentar, berani gak?`,
        reason: 'Mengonversi pertanyaan singkatnya menjadi alasan valid untuk kencan tatap muka secara percaya diri.'
      }
    ];
  }

  // 4. KATEGORI AVOIDANT / MENOLAK HALUS
  if (type === 'avoidant') {
    return [
      {
        category: 'Low Pressure Reframe',
        text: `Santai aja, soal ${subject} itu bukan hal berat kok haha. Cuma cari kopi sebentar sambil istirahat.`,
        reason: 'Menurunkan ekspektasi dan tekanan komitmen yang dirasakan wanita.'
      },
      {
        category: 'Non-Reaktif & Mundur Elegan',
        text: `Oke gak masalah, kelarin dulu urusanmu. Next time aja kalau jadwalmu lagi longgar ya.`,
        reason: 'Pria bernilai tinggi tidak pernah memaksa wanita yang belum siap.'
      },
      {
        category: 'Playful Challenge',
        text: `Hmm kayaknya kamu tipe yang kalau diajak keluar harus pake proposal tertulis 3 rangkap ya? haha.`,
        reason: 'Mencairkan ketegangannya dengan humor.'
      }
    ];
  }

  // 5. GENERATOR BALASAN KONTEKSTUAL BERDASARKAN TOPIK SPESIFIK (KULINER / KANTOOR / HIBURAN / PERJALANAN / ISTIRAHAT / UMUM)
  if (context.topic === 'kuliner' || context.topic === 'kopi') {
    return [
      {
        category: 'Playful Banter (Goda Kuliner)',
        text: `Sedap tuh yang lagi ${subject}! Level pedes/manis berapa nih? Awas ketagihan haha.`,
        reason: 'Merespons makanan/minuman favoritnya dengan candaan ringan.'
      },
      {
        category: 'Curiosity & Connection',
        text: `Soal ${subject} emang gak pernah gagal haha. Selain itu, kuliner/minuman favoritmu apa lagi yang wajib dicoba?`,
        reason: 'Membuka topik hobi kuliner untuk mencari kesamaan selera.'
      },
      {
        category: 'The Date Closer (Kencan Kuliner)',
        text: `Bahasan soal ${subject} ini emang selalu bikin laper haha. Weekend ini temenin aku berburu kuliner bareng yuk.`,
        reason: 'Mengonversi topik makanan langsung menjadi janji kencan.'
      }
    ];
  }

  if (context.topic === 'hiburan') {
    return [
      {
        category: 'Playful Banter (Goda Hiburan)',
        text: `Asik banget yang lagi ${subject}! Nonton genre apa nih? Awas ketiduran di tengah jalan haha.`,
        reason: 'Goda santai seputar tontonan/hiburannya.'
      },
      {
        category: 'Curiosity & Connection',
        text: `Soal ${subject} emang selalu seru. Kamu tipe yang suka cerita alur plot-twist berat atau yang santai ceria?`,
        reason: 'Menggali kepribadian dan selera tontonannya.'
      },
      {
        category: 'The Date Closer (Kencan Nonton)',
        text: `Wah seru tuh! Weekend ini kalau kamu ada waktu senggang, kita nonton / cari tempat santai bareng yuk.`,
        reason: 'Mengajak kencan berdasar antusiasme hiburan.'
      }
    ];
  }

  if (context.topic === 'perjalanan') {
    return [
      {
        category: 'Playful Banter (Goda Tempat)',
        text: `Asik banget yang lagi ${subject}... borong apa aja nih hari ini? Awas dompet jebol haha.`,
        reason: 'Goda santai seputar aktivitas jalan-jalan/belanja.'
      },
      {
        category: 'Curiosity & Connection',
        text: `Tempat kayak ${subject} emang selalu rame. Kamu lebih suka suasana yang rame atau yang tenang santai?`,
        reason: 'Mencari tahu karakter tempat favoritnya.'
      },
      {
        category: 'The Date Closer (Kencan Ngopi)',
        text: `Nanti kalau weekend ini kamu ke daerah ${subject} lagi, temenin aku cari es kopi 30 menit yuk.`,
        reason: 'Memanfaatkan lokasi favoritnya untuk ajakan bertemu.'
      }
    ];
  }

  if (context.topic === 'istirahat') {
    return [
      {
        category: 'Playful Banter (Goda Tim Rebahan)',
        text: `Nikmat banget tim ${subject} haha... gabutnya jangan dipelihara, nanti malah ketiduran sampai besok.`,
        reason: 'Goda santai seputar waktu santai/rebahan.'
      },
      {
        category: 'Storytelling Hook',
        text: `Daripada gabut sendirian pas ${subject}, tadi barusan ada hal random banget yang bikin aku ingat kamu...`,
        reason: 'Memicu rasa penasaran saat dia sedang santai.'
      },
      {
        category: 'The Date Closer (Ajak Keluar)',
        text: `Biar waktu santaimu pas ${subject} lebih seru, sore ini keluar sebentar temenin cari minuman dingin 30 menit yuk.`,
        reason: 'Mengajak keluar saat dia sedang senggang.'
      }
    ];
  }

  if (context.topic === 'kerjaan' || context.topic === 'kuliah') {
    return [
      {
        category: 'Playful Banter (Oase Santai)',
        text: `Muka boleh pusing gara-gara ${subject}, tapi kepala tetep butuh disiram es kopi dingin biar gak ngebul haha.`,
        reason: 'Kesegaran humor seputar pekerjaan/tugas.'
      },
      {
        category: 'Comfort & Validasi',
        text: `Soal ${subject} emang butuh kesabaran ekstra. Kelarin satu bagian dulu, habis itu langsung istirahat ya.`,
        reason: 'Dukungan emosional yang menenangkan.'
      },
      {
        category: 'The Date Closer (Break Darurat)',
        text: `Daripada otaknya ngebul mikirin ${subject} terus, sore ini 30 menit kita cari es kopi dulu yuk. Nanti aku yang traktir.`,
        reason: 'Mengubah rasa lelah kerjaan menjadi kencan rehat santai.'
      }
    ];
  }

  // DEFAULT CONTEXTUAL FLIRTING (Untuk Seluruh Pesan Umum Lainnya)
  return [
    {
      category: 'Playful Banter (Goda Santai)',
      text: `Seru juga tuh pas kamu ${subject}... jarang-jarang nemu orang yang punya cerita kayak gitu haha.`,
      reason: 'Merespons topik obrolannya secara khusus dengan candaan yang relevan.'
    },
    {
      category: 'Storytelling Hook (Koneksi Topik)',
      text: `Ngomong-ngomong pas kamu ${subject}, kebetulan kemarin aku juga sempet ngalamin hal seru yang mirip...`,
      reason: 'Meneruskan percakapan secara natural dengan mengikat topik yang baru dia bahas.'
    },
    {
      category: 'Transisi Kencan Ringan (The Date Closer)',
      text: `Bisa kali bahasan soal ${subject} ini dilanjutin sambil nyeruput minuman dingin. Weekend ini kamu free jam berapa?`,
      reason: 'Mengarahkan topik obrolan aktifnya menjadi alasan pertemuan tatap muka.'
    }
  ];
}
