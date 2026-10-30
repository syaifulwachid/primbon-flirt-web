/**
 * Ronald Frank Dating & Flirting Engine
 * Berdasarkan prinsip buku "Cara Memikat Wanita Idaman Anda", "Sukses Memikat Wanita", dan "Pencinta Wanita".
 * Fokus: Mentalitas High-Value, Hukum 80/20 Emosi vs Logika, Push-Pull, Anti-Friendzone, dan Date Closing.
 */

export const CHAT_STAGES = [
  { id: 'opener', label: '1. Opening & Hook', desc: 'Memulai obrolan tanpa pertanyaan klise yang membosankan' },
  { id: 'teasing', label: '2. Playful Teasing & Push-Pull', desc: 'Membangun percikan emosi dan ketertarikan (tension)' },
  { id: 'connection', label: '3. Deep Connection', desc: 'Membangun keintiman emosional & kualifikasi nilai diri' },
  { id: 'date_close', label: '4. The Date Closer (Ajak Ketemu)', desc: 'Eksekusi ajakan kencan nyata di dunia nyata tanpa tekanan' }
];

export const SITUATION_MODES = [
  { id: 'normal', label: 'PDKT Normal / Hangat' },
  { id: 'cold', label: 'Lagi Dingin / Balas Singkat' },
  { id: 'story_reply', label: 'Balas IG Story / Status WA' },
  { id: 'reconnect', label: 'Mencairkan Suasana Lama' }
];

/**
 * Matriks Rekomendasi Chat berdasarkan Karakter Primbon & Filosofi Ronald Frank
 */
export const SCRIPT_MATRIX = {
  // Lakuning Geni: Mandiri, tegas, berwibawa, gengsi tinggi
  Geni: {
    opener: [
      {
        text: "Ada yang bilang orang yang gayanya tegas kayak kamu itu biasanya diam-diam punya selera musik yang nggak terduga... bener nggak tebakanku?",
        explanation: "Pernyataan berani (cold reading) yang memancing dia membuktikan dirinya, bukan pertanyaan pasif."
      },
      {
        text: "Lihat story kamu barusan... aura bos besarnya kenceng banget haha. Emang dari lahir udah ditakdirkan nggak bisa santai ya?",
        explanation: "Playful teasing terhadap sifat mandirinya tanpa merendahkan, membuat dia tertawa sekaligus penasaran."
      }
    ],
    teasing: [
      {
        text: "Kamu jangan galak-galak gitu ah, nanti kalau aku terpesona beneran kamu yang repot lho.",
        explanation: "Teknik Push-Pull klasik Ronald Frank: membalik posisi seolah-olah dia yang akan mengejar jika kamu tertarik."
      },
      {
        text: "Lucu juga ya, di luar kelihatan dingin banget, tapi feeling-ku aslinya kamu tipe yang gampang luluh kalau diajak jajan makanan enak.",
        explanation: "Menyentuh sisi manusiawi di balik topeng independennya."
      }
    ],
    connection: [
      {
        text: "Satu hal yang aku apresiasi dari kamu: kamu tahu apa yang kamu mau dan nggak menye-menye. Karakter langka di zaman sekarang.",
        explanation: "Apresiasi karakter (kualifikasi), bukan pujian fisik murahan yang biasa dia dengar dari pria needy."
      }
    ],
    date_close: [
      {
        text: "Minggu ini aku ada agenda mampir ke [Nama Kafe/Resto Unik]. Karena kamu kayaknya paham tempat seru, temenin aku 45 menit ya. Nggak ada alasan nolak kopi enak.",
        explanation: "Assumptive close: ajakan dengan batasan waktu santai (low commitment) dan alasan yang jelas."
      }
    ],
    dangerAlert: "HINDARI: Mendebat pendapatnya secara keras di chat, menyuruh dia bersabar, atau mengeluh dia cuek. Pria high-value tidak pernah menuntut balasan!"
  },

  // Lakuning Rembulan: Romantis, estetik, moody, perasa
  Rembulan: {
    opener: [
      {
        text: "Foto yang kamu upload barusan estetik banget sudut pandangnya. Pasti kamu tipe orang yang suka merhatiin detail-detail kecil yang orang lain lewatin ya?",
        explanation: "Menyentuh sisi sensitivitas dan apresiasi estetika yang menjadi inti kepribadian Lakuning Rembulan."
      },
      {
        text: "Lagi dengerin lagu apa hari ini? Tiba-tiba feeling-ku bilang kamu lagi punya playlist rahasia yang lagi kamu putar terus.",
        explanation: "Pertanyaan yang berakar pada suasana emosi dan musik, membangkitkan kenyamanan personal."
      }
    ],
    teasing: [
      {
        text: "Kayaknya kalau dekat sama kamu harus siap mental nih... bisa-bisa bikin lupa waktu saking asiknya ngobrol.",
        explanation: "Pujian terselubung yang dikemas dengan peringatan candaan (high-value framing)."
      },
      {
        text: "Muka kamu tuh sekilas kelihatan polos penurut ya, tapi tatapannya ada sisi nakal dan isengnya juga ternyata.",
        explanation: "Menciptakan dualitas emosional yang menggelitik rasa penasarannya."
      }
    ],
    connection: [
      {
        text: "Aku ngerasa kamu punya cara sendiri buat bikin suasana di sekitarmu jadi hangat. Nyaman aja rasanya tiap tukar pikiran sama kamu.",
        explanation: "Validasi emosional yang mendalam; membuat dia merasa benar-benar dimengerti."
      }
    ],
    date_close: [
      {
        text: "Ada satu gelato/coffee shop kecil yang suasananya tenang banget, lampu temaramnya pas buat istirahat dari hiruk pikuk. Yuk besok sore kita mampir sebentar sambil recharge energi.",
        explanation: "Sangat sesuai dengan watak Rembulan yang mencintai atmosfer hangat, tenang, dan estetik."
      }
    ],
    dangerAlert: "HINDARI: Kata-kata sarkas kasar, nada meremehkan perasaan, atau menghilang tiba-tiba saat dia sedang curhat terbuka."
  },

  // Lakuning Surya: Percaya diri, berprinsip, elegan, menyukai pria berwibawa
  Surya: {
    opener: [
      {
        text: "Gaya kamu waktu ngerjain project itu rapi banget. Jarang nemu orang yang fokusnya sejelas kamu.",
        explanation: "Pujian profesional dan bernilai tinggi yang langsung menghargai kompetensi dirinya."
      },
      {
        text: "Mau nanya pendapat kamu deh tentang satu hal menarik... menurutmu orang ambisius itu bawaan lahir atau bentukan keadaan?",
        explanation: "Membuka diskusi filosofis berbobot; wanita tipe Surya menyukai obrolan yang menstimulasi intelektual."
      }
    ],
    teasing: [
      {
        text: "Pasti teman-teman kamu sering sungkan ya kalau mau macem-macem sama kamu? Auranya tegas banget soalnya haha.",
        explanation: "Menyoroti karisma wibawanya dengan bumbu tawa ringan."
      }
    ],
    connection: [
      {
        text: "Keren sih, kamu punya standar hidup yang jelas. Cowok yang nggak siap pasti gampang minder kalau ngobrol sama kamu.",
        explanation: "Secara tidak langsung memposisikan kamu sebagai pria langka yang TIDAK minder dan setara dengannya."
      }
    ],
    date_close: [
      {
        text: "Jumat malam ini aku mau makan di [Nama Resto/Tempat Menarik]. Aku pengen dengar cerita kamu tentang [topik yang pernah dibahas]. Selesai jam 8 malam aku jemput atau kita ketemu di lokasi ya?",
        explanation: "Direct & Decisive. Tipe Surya menyukai pria yang punya inisiatif pasti dan tidak plin-plan bertanya 'kamu maunya ke mana?'."
      }
    ],
    dangerAlert: "HINDARI: Menunjukkan rasa minder, curhat masalah hidup yang bikin kasihan, atau menyerahkan semua keputusan kencan ke dia."
  },

  // Lakuning Angin: Spontan, lincah, mudah bosan, menyukai kebebasan
  Angin: {
    opener: [
      {
        text: "Tebak aku barusan lihat apa yang langsung bikin ingat sama kamu... (jangan GR dulu ya haha).",
        explanation: "Metode Curiosity Hook Ronald Frank: 100% memancing balasan cepat karena memicu rasa penasaran naluriah."
      },
      {
        text: "Energi kamu kayaknya nggak pernah habis ya? Penasaran baterai apa yang kamu pakai di kehidupan sehari-hari.",
        explanation: "Opener ringan, energik, dan cocok dengan sifat angin yang lincah."
      }
    ],
    teasing: [
      {
        text: "Kamu tipe orang yang kalau diajak kabur liburan dadakan pasti langsung packing tanpa mikir dua kali kan? Ngaku deh.",
        explanation: "Playful roleplay yang memicu imajinasi petualangan."
      },
      {
        text: "Bagus deh kalau kamu cerewet, jadi aku tinggal santai dengerin sambil ngemil haha.",
        explanation: "Teasing santai yang membalik dinamika obrolan menjadi menyenangkan."
      }
    ],
    connection: [
      {
        text: "Jarang nemu orang yang diajak ngomong hal random apa aja selalu nyambung dan nggak kaku kayak kamu.",
        explanation: "Menghargai fleksibilitas komunikasinya."
      }
    ],
    date_close: [
      {
        text: "Aku baru nemu hidden gem street food/arcade games seru nih. Daripada cuma wacana di chat, nanti malam kita serbu yuk, 1 jam aja seru-seruan!",
        explanation: "Ajakan spontan, menyenangkan, dan berenergi tinggi yang cocok untuk karakter angin."
      }
    ],
    dangerAlert: "HINDARI: Bertanya jadwal terlalu kaku, menanyakan 'lagi di mana sama siapa' secara berulang, atau menciptakan suasana posesif."
  },

  // Lakuning Bintang: Misterius, tenang, pemilih, butuh kenyamanan bertahap
  Bintang: {
    opener: [
      {
        text: "Ada yang bilang orang yang tenang dan nggak banyak tingkah di medsos itu biasanya punya dunia dalam kepala yang seru banget. Bener gitu?",
        explanation: "Validasi terhadap sifat introvert/tenangnya tanpa menghakimi."
      }
    ],
    teasing: [
      {
        text: "Jangan diem-diem terus ah, nanti disangka patung museum saking anggunnya haha.",
        explanation: "Goda ringan untuk memecah kebekuan pertahanan dirinya."
      }
    ],
    connection: [
      {
        text: "Aku suka caramu memilih kata-kata. Tenang, nggak berisik, tapi pas.",
        explanation: "Membangun rapport yang dalam dan aman."
      }
    ],
    date_close: [
      {
        text: "Minggu ini ada pameran seni/toko buku tenang yang pengen aku datangi. Karena suasananya adem, kayaknya cocok buat kamu. Mau mampir bareng sebentar akhir pekan ini?",
        explanation: "Low pressure, lingkungan yang tidak bising, memberikan rasa aman bagi introvert."
      }
    ],
    dangerAlert: "HINDARI: Mendesak balasan cepat, memborbardir dengan panggilan telepon tiba-tiba tanpa janjian."
  },

  // Lakuning Bumi: Sabar, hangat, membumi, suka ketulusan
  Bumi: {
    opener: [
      {
        text: "Ngeliat pembawaan kamu kayaknya adem banget ya, tipe orang yang kalau diajak ngobrol bikin tenang.",
        explanation: "Sentuhan ketulusan yang membumi."
      }
    ],
    teasing: [
      {
        text: "Kamu tuh kelihatan sabar banget ya, kira-kira kalau aku jailin bakal tahan berapa menit? haha.",
        explanation: "Bercanda dengan nada hangat."
      }
    ],
    connection: [
      {
        text: "Zaman sekarang jarang banget nemu orang yang bener-bener tulus dan nggak ribet kayak kamu. Respect buat kamu.",
        explanation: "Pemberian apresiasi otentik."
      }
    ],
    date_close: [
      {
        text: "Akhir pekan ini yuk makan santai di tempat yang makanannya enak dan suasananya homey. Kita ngobrol santai tanpa buru-buru.",
        explanation: "Menawarkan kenyamanan dan kehangatan nyata."
      }
    ],
    dangerAlert: "HINDARI: Pamer materi, flexing berlebihan, atau gaya bicara sok keren yang palsu."
  },

  // Lakuning Banyu: Fleksibel, intuitif, berwawasan luas, emosi mendalam
  Banyu: {
    opener: [
      {
        text: "Kamu punya intuisi yang lumayan tajam ya? Dari cara kamu nanggepin hal-hal di sekitarmu kelihatan peka banget.",
        explanation: "Menyentuh intuisi dan sensitivitas alaminya."
      }
    ],
    teasing: [
      {
        text: "Tenang banget bawaannya kayak air kolam renang pagi hari... tapi hati-hati lho, bisa bikin orang hanyut.",
        explanation: "Metafora air yang puitis sekaligus flirty."
      }
    ],
    connection: [
      {
        text: "Ngobrol sama kamu itu rasanya ngalir aja, nggak ada pretensi dan nggak ada yang perlu ditutup-tutupi.",
        explanation: "Membangun rasa kedekatan emosional otentik."
      }
    ],
    date_close: [
      {
        text: "Sore ini cuacanya enak banget buat duduk santai di rooftop/tepi danau sambil ngopi. Luangin waktu 40 menit yuk, aku jemput jam 5?",
        explanation: "Menyajikan suasana terbuka dan mengalir."
      }
    ],
    dangerAlert: "HINDARI: Kebohongan kecil atau cerita palsu. Tipe Banyu punya radar tajam mendeteksi kepalsuan."
  }
};

/**
 * Mengambil Rekomendasi Khusus Sesuai Karakter Target & Situasi Chat
 */
export function getChatRecommendation(lakuningKey, stageId = 'opener', situationId = 'normal') {
  const persona = SCRIPT_MATRIX[lakuningKey] || SCRIPT_MATRIX['Geni'];
  const scripts = persona[stageId] || persona['opener'];
  
  // Custom modifier jika situasi khusus
  let modifierNote = '';
  if (situationId === 'cold') {
    modifierNote = 'KONDISI DINGIN: Jangan kirim teks panjang! Pilih 1 kalimat pendek yang memicu rasa ingin tahu, lalu diam. Biarkan dia yang menginvestasikan energi untuk membalas.';
  } else if (situationId === 'story_reply') {
    modifierNote = 'BALAS STORY: Jangan beri pujian standar seperti "Cantik banget". Beri komentar pada konteks cerita atau hal ganjil/unik di latar belakang story-nya.';
  } else if (situationId === 'reconnect') {
    modifierNote = 'MENCAIRKAN LAMA: Gunakan teknik "Tiba-tiba ingat kamu": Ceritakan momen lucu atau makanan yang mengingatkan kamu padanya tanpa terkesan meminta balasan.';
  }

  return {
    scripts,
    dangerAlert: persona.dangerAlert,
    modifierNote
  };
}

/**
 * Formula Rahasia Ronald Frank: Kapan Hadiah / Traktiran Tepat Diberikan
 */
export function getGiftConsultation(statusPDKT, isSameWeton) {
  if (statusPDKT === 'Baru Kenal' || statusPDKT === 'Dingin') {
    return {
      allowed: false,
      warning: 'JANGAN PERNAH MEMBERI HADIAH SEKARANG!',
      reason: 'Dalam ajaran Ronald Frank, memberi hadiah atau makanan pada wanita yang belum ada ketertarikan emosional hanya akan membuat Anda tampak putus asa (needy) dan dicap berusaha "menyogok" cintanya dengan materi.'
    };
  }

  if (isSameWeton) {
    return {
      allowed: true,
      tip: 'MOMEN EMAS MICRO-GIFT',
      advice: 'Hari ini energi wetonnya sangat cocok. Kirimkan hal kecil tanpa beban (seperti kopi kesukaannya melalui kurir instan) dengan pesan singkat: "Buat nemenin kerjaan kamu sore ini. Jangan lupa senyum." Tanpa menuntut ucapan terima kasih berlebihan.'
    };
  }

  return {
    allowed: true,
    tip: 'HADIAH PENGALAMAN (EXPERIENCE)',
    advice: 'Daripada benda mati, berikan pengalaman: traktiran makanan unik saat kencan nyata atau cemilan favorit yang pernah dia sebutkan sekilas dalam obrolan.'
  };
}
