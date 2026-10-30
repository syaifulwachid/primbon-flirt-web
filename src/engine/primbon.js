/**
 * Primbon Engine - Algoritma Matematis & Astrologi Jawa
 * Berisi perhitungan Weton, Neptu, Lakuning, Bioritme Emosi Harian, dan Petung Jodoh.
 */

// Konstanta Nama Hari & Pasaran
export const DINA_LIST = [
  { name: 'Senin', neptu: 4, index: 1 },
  { name: 'Selasa', neptu: 3, index: 2 },
  { name: 'Rabu', neptu: 7, index: 3 },
  { name: 'Kamis', neptu: 8, index: 4 },
  { name: 'Jumat', neptu: 6, index: 5 },
  { name: 'Sabtu', neptu: 9, index: 6 },
  { name: 'Minggu', neptu: 5, index: 0 }
];

export const PASARAN_LIST = [
  { name: 'Legi', neptu: 5, index: 0 },
  { name: 'Pahing', neptu: 9, index: 1 },
  { name: 'Pon', neptu: 7, index: 2 },
  { name: 'Wage', neptu: 4, index: 3 },
  { name: 'Kliwon', neptu: 8, index: 4 }
];

// Watak Pokok (Lakuning)
export const LAKUNING_MAP = {
  Geni: {
    name: 'Lakuning Geni (Api)',
    element: 'Fire',
    icon: '🔥',
    character: 'Berenergi tinggi, bangga, mandiri, berani, mudah terpicu emosi jika disepelekan, berkarisma kuat.',
    strengths: 'Tegas, jujur, setia pada prinsip, pelindung.',
    weaknesses: 'Gengsi tinggi, keras kepala, tidak suka digurui.',
    triggerAlert: 'Pantangan keras: Jangan menasihati seperti anak kecil atau meremehkan keputusannya.',
    flirtStyle: 'Playful challenger. Tantang dia dengan cerdas, berikan apresiasi elegan pada ketegasannya.'
  },
  Rembulan: {
    name: 'Lakuning Rembulan (Bulan)',
    element: 'Moon/Water',
    icon: '🌙',
    character: 'Mempesona, penuh empati, pendengar ulung, perasa, romantis, estetik, menyukai keindahan.',
    strengths: 'Hangat, suportif, peka emosional, mudah dicintai.',
    weaknesses: 'Mood mudah berubah (moody), overthinking, rentan terluka oleh kata-kata kasar.',
    triggerAlert: 'Pantangan keras: Nada sarkas berlebihan atau terkesan mengabaikan ceritanya.',
    flirtStyle: 'Poetic & thoughtful. Perhatikan detail kecil dirinya (parfum, outfit, playlist).'
  },
  Surya: {
    name: 'Lakuning Surya (Matahari)',
    element: 'Sun/Light',
    icon: '☀️',
    character: 'Visioner, percaya diri, terang, berwibawa, berprinsip kokoh, teratur, menyukai orang berkelas.',
    strengths: 'Cerdas, bertanggung jawab, inspiratif, tidak plin-plan.',
    weaknesses: 'Perfeksionis, sedikit dominan, kurang sabar terhadap pria plin-plan.',
    triggerAlert: 'Pantangan keras: Sikap menye-menye, minder, atau tidak punya tujuan yang jelas.',
    flirtStyle: 'Confident equal. Tunjukkan arah hidup, selera humor berbobot, dan ketegasan santai.'
  },
  Angin: {
    name: 'Lakuning Angin (Udara)',
    element: 'Air/Wind',
    icon: '💨',
    character: 'Lincah, fleksibel, mudah bosan, menyukai kebebasan, spontan, menyenangkan dalam obrolan.',
    strengths: 'Humoris, supel, santai, berpikiran terbuka.',
    weaknesses: 'Sulit diprediksi, gampang berpaling jika suasana monoton, takut merasa terkekang.',
    triggerAlert: 'Pantangan keras: Over-controlling, menanyakan keberadaan terus-menerus, chat monoton.',
    flirtStyle: 'Spontaneous adventure. Ajak bercanda santai, lemparkan ide seru tanpa beban komitmen kaku.'
  },
  Bintang: {
    name: 'Lakuning Bintang (Star)',
    element: 'Ether/Stars',
    icon: '✨',
    character: 'Misterius, elegan, setia, tenang, selektif dalam memilih lingkaran pertemanan.',
    strengths: 'Kedalaman berpikir, pengamat yang jeli, loyalitas tinggi.',
    weaknesses: 'Cenderung tertutup di awal, butuh waktu lama untuk membuka hati, waspada.',
    triggerAlert: 'Pantangan keras: Agresivitas berlebihan, terburu-buru menuntut kejelasan.',
    flirtStyle: 'Slow burn & intrigue. Bangun rasa penasaran perlahan, buat dia merasa aman bercerita.'
  },
  Bumi: {
    name: 'Lakuning Bumi (Tanah)',
    element: 'Earth',
    icon: '🌱',
    character: 'Sabar, membumi, suka ketenangan, tulus, menghargai komitmen dan kenyamanan nyata.',
    strengths: 'Stabil, penuh perhatian, tidak suka drama, pendengar setia.',
    weaknesses: 'Lambat merespons perubahan, keras bila dipaksa buru-buru.',
    triggerAlert: 'Pantangan keras: Pamer berlebihan (show-off) atau drama percintaan murahan.',
    flirtStyle: 'Warm comfort & genuine presence. Tunjukkan stabilitas dan ketenangan sikap.'
  },
  Banyu: {
    name: 'Lakuning Banyu (Air)',
    element: 'Water',
    icon: '🌊',
    character: 'Tenang namun dalam, fleksibel, bijaksana, mudah menyesuaikan suasana tapi memiliki arus kuat.',
    strengths: 'Penenang suasana, pemaaf, intuisi tajam.',
    weaknesses: 'Bisa hanyut dalam emosi mendalam jika kecewa berat.',
    triggerAlert: 'Pantangan keras: Kebohongan kecil atau ketidakjujuran yang tercium.',
    flirtStyle: 'Deep resonance. Hubungkan obrolan dengan emosi dan pengalaman hidup yang otentik.'
  }
};

/**
 * Menghitung Weton dan atribut primbon dari tanggal Masehi
 * @param {string|Date} dateInput YYYY-MM-DD
 */
export function calculateWeton(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  // Normalisasi waktu ke UTC midnight untuk hindari timezone drift
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  
  // Anchor: 1 Jan 1970 UTC = Kamis (dina 4), Wage (pasaran 3)
  const baseUtc = new Date(Date.UTC(1970, 0, 1));
  const diffDays = Math.round((utcDate.getTime() - baseUtc.getTime()) / (1000 * 60 * 60 * 24));

  // Hitung Hari (0 = Minggu, 1 = Senin, ... 6 = Sabtu)
  const dayOfWeek = (utcDate.getUTCDay());
  const dinaMapIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // mapping ke Senin=0..Minggu=6
  const dina = DINA_LIST[dinaMapIndex];

  // Hitung Pasaran (1 Jan 1970 adalah Wage = index 3)
  let pasaranIdx = (3 + (diffDays % 5)) % 5;
  if (pasaranIdx < 0) pasaranIdx += 5;
  const pasaran = PASARAN_LIST[pasaranIdx];

  const totalNeptu = dina.neptu + pasaran.neptu;

  // Menentukan Lakuning berdasarkan sisa pembagian Neptu (Primbon Betaljemur Adammakna)
  const lakuningKeys = ['Geni', 'Angin', 'Rembulan', 'Surya', 'Bintang', 'Bumi', 'Banyu'];
  const lakuningKey = lakuningKeys[totalNeptu % 7];
  const lakuning = LAKUNING_MAP[lakuningKey];

  return {
    date: dateInput,
    dina: dina.name,
    dinaNeptu: dina.neptu,
    pasaran: pasaran.name,
    pasaranNeptu: pasaran.neptu,
    totalNeptu,
    wetonString: `${dina.name} ${pasaran.name}`,
    lakuningKey,
    lakuning
  };
}

/**
 * Perhitungan Petung Jodoh Primbon (8 Kategori)
 */
export const PETUNG_JODOH_MAP = {
  1: {
    status: 'PEGAT',
    score: 65,
    tagline: 'Tantangan Komunikasi & Ego',
    meaning: 'Hubungan rentan diuji oleh selisih paham sepele dan saling gengsi jika komunikasi kaku.',
    ronaldFrankStrategy: 'Wajib hindari adu argumen logis di chat. Gunakan framing santai (playful), jangan baperan, dan fokus pada aksi nyata daripada debat teks.'
  },
  2: {
    status: 'RATU',
    score: 95,
    tagline: 'Karisma Harmonis & Saling Segan',
    meaning: 'Pasangan sangat serasi, saling menghormati secara alami, memancarkan aura pasangan idaman.',
    ronaldFrankStrategy: 'Tunjukkan karakter pria bernilai tinggi (high-value), tidak perlu minder. Berikan apresiasi berbobot pada keanggunannya.'
  },
  3: {
    status: 'JODOH',
    score: 98,
    tagline: 'Kecocokan Alami & Chemistry Tinggi',
    meaning: 'Saling melengkapi, getaran emosi nyambung secara alami, toleransi tinggi terhadap kekurangan.',
    ronaldFrankStrategy: 'Momentum emas! Eskalasi chat ke kencan nyata bisa dilakukan dengan santai tanpa perlu strategi berbelit-belit.'
  },
  4: {
    status: 'TOPO',
    score: 75,
    tagline: 'Proses Adaptasi Awal yang Menempa',
    meaning: 'Awal pendekatan terasa ada sedikit dinding/jarak, namun setelah saling memahami akan sangat kokoh.',
    ronaldFrankStrategy: 'Gunakan teknik "Pacing & Patience". Jangan terburu-buru menuntut respon cepat. Berikan kenyamanan konsisten.'
  },
  5: {
    status: 'TINARI',
    score: 90,
    tagline: 'Penuh Keceriaan & Rezeki Baik',
    meaning: 'Hubungan yang dinamis, menyenangkan, penuh tawa, membawa keberuntungan dan kebahagiaan.',
    ronaldFrankStrategy: 'Maksimalkan playful teasing, lelucon cerdas, dan ajakan spontan mencicipi kuliner atau tempat seru.'
  },
  6: {
    status: 'PADU',
    score: 60,
    tagline: 'Adu Argumen & Gesekan Logika',
    meaning: 'Keduanya memiliki karakter kuat sehingga rawan berdebat jika saling memaksakan kehendak.',
    ronaldFrankStrategy: 'Pantangan Ronald Frank: Jangan pernah berdebat logika dengan wanita! Ketika dia mulai membantah, jawab dengan senyuman santai dan candaan pengalih suasana.'
  },
  7: {
    status: 'SUJANAN',
    score: 70,
    tagline: 'Rentan Prasangka & Cemburu',
    meaning: 'Rentan timbul rasa curiga atau salah paham jika ada sinyal yang tidak transparan.',
    ronaldFrankStrategy: 'Terapkan "Unshakable Confidence". Jangan bersikap defensif atau sibuk menjelaskan diri. Bersikap tenang, tegas, dan terbuka.'
  },
  0: {
    status: 'PESTHI',
    score: 96,
    tagline: 'Kedamaian Jiwa & Kehangatan Abadi',
    meaning: 'Hubungan adem-ayem, minim konflik besar, saling mendukung ketenangan batin satu sama lain.',
    ronaldFrankStrategy: 'Bangun deep emotional connection. Bicarakan impian, hal-hal favorit, dan ajak kencan santai dengan suasana hangat.'
  }
};

/**
 * Menghitung Kecocokan Neptu Pria & Wanita
 */
export function calculateMatch(maleWeton, femaleWeton) {
  if (!maleWeton || !femaleWeton) return null;
  const sumNeptu = maleWeton.totalNeptu + femaleWeton.totalNeptu;
  const modulo8 = sumNeptu % 8;
  const petung = PETUNG_JODOH_MAP[modulo8];

  return {
    sumNeptu,
    moduloResult: modulo8,
    ...petung
  };
}

/**
 * Radar Timing Harian & Siklus Emosi Target Hari Ini
 * Menentukan kapan jam emas chat, jam rawan, dan rekomendasi aksi
 */
export function calculateDailyTiming(femaleWeton, targetDate = new Date()) {
  const currentWeton = calculateWeton(targetDate);
  if (!femaleWeton || !currentWeton) return null;

  // Cek apakah hari ini berbenturan dengan weton target (Dina Naas / Hari Pasaran Sama)
  const isSamePasaran = currentWeton.pasaran === femaleWeton.pasaran;
  const isSameDina = currentWeton.dina === femaleWeton.dina;

  let energyLevel = 'Normal';
  let moodStatus = 'Seimbang & Kondusif';
  let doGift = false;
  let giftReason = '';

  if (isSamePasaran && isSameDina) {
    energyLevel = 'Tinggi/Sensitif (Weton Kelahiran)';
    moodStatus = 'Emosional Kuat & Reflektif';
    doGift = true;
    giftReason = 'Hari wetonnya adalah momen ideal untuk mengirimkan micro-surprise (misal: kopi favorit atau dessert) tanpa pamrih!';
  } else if (isSamePasaran) {
    energyLevel = 'Sensitif (Hari Pasaran Aktif)';
    moodStatus = 'Mood mudah terpicu; hindari perdebatan atau pertanyaan menguji.';
  }

  // Jam Emas Komunikasi
  const goldenHours = [
    { time: '12:30 - 13:15', label: 'Lunch Chill', advice: 'Sapaan ringan atau meme lucu penurun stres kerja/kuliah.' },
    { time: '19:45 - 21:30', label: 'Golden Prime Time', advice: 'Waktu terbaik untuk obrolan mendalam (deep chat), playful teasing, dan Date Closing.' }
  ];

  const dangerHours = [
    { time: '08:00 - 10:30', label: 'Rush Hour / Focus Mode', advice: 'Jangan spam chat atau menanyakan kabar berulang-ulang.' },
    { time: '17:00 - 18:30', label: 'Traffic & Exhaustion Zone', advice: 'Waktu lelah perjalanan pulang; tahan chat penting hingga dia sampai di rumah.' }
  ];

  return {
    todayWeton: currentWeton.wetonString,
    energyLevel,
    moodStatus,
    doGift,
    giftReason,
    goldenHours,
    dangerHours
  };
}
