/**
 * Numerology Engine (Pythagorean System)
 * Menghitung Soul Urge (Hasrat Tersembunyi), Personality Number (Topeng Luar),
 * Life Path, dan Personal Day (Siklus Emosi 9 Hari).
 * Terintegrasi dengan teknik Cold Reading Ronald Frank.
 */

// Nilai Pythagoras untuk Huruf A-Z
const PYTHAGOREAN_TABLE = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

/**
 * Mereduksi angka menjadi 1 digit (kecuali master number 11, 22 jika diinginkan, namun untuk interpretasi praktis 1-9)
 */
function reduceToSingleDigit(num) {
  while (num > 9) {
    num = String(num).split('').reduce((acc, curr) => acc + parseInt(curr, 10), 0);
  }
  return num;
}

export const SOUL_URGE_TRAITS = {
  1: {
    title: 'Hasrat Mandiri & Diakui Kehebatannya',
    craving: 'Ingin merasa istimewa, memegang kendali, dan dihargai atas orisinalitasnya. Tidak suka diremehkan.',
    flirtTip: 'Puji keputusannya yang mandiri. Buat dia merasa seperti sosok ratu yang langka.'
  },
  2: {
    title: 'Hasrat Kelembutan & Keamanan Emosional',
    craving: 'Mendambakan keintiman tulus, kata-kata halus, dan rasa aman. Sangat sensitif pada nada bicara.',
    flirtTip: 'Tunjukkan empati mendalam. Dengarkan tanpa menghakimi, gunakan kata-kata hangat.'
  },
  3: {
    title: 'Hasrat Ekspresi Ceria & Tawa',
    craving: 'Ingin bersenang-senang, tertawa lepas, dan diapresiasi sisi estetik/kreatifnya. Benci obrolan kaku.',
    flirtTip: 'Gunakan humor cerdas, ajak membicarakan hobi seru, dan kirimkan meme lucu.'
  },
  4: {
    title: 'Hasrat Stabilitas & Kejujuran Pasti',
    craving: 'Menghargai pria yang konsisten, bisa dipegang omongannya, dan tidak banyak drama.',
    flirtTip: 'Tunjukkan ketepatan waktu, ketulusan, dan sikap pria dewasa yang bertanggung jawab.'
  },
  5: {
    title: 'Hasrat Kebebasan & Petualangan Spontan',
    craving: 'Sangat mendambakan sensasi baru, benci dikekang, dan mudah bosan dengan rutinitas.',
    flirtTip: 'JANGAN posesif! Ajak kencan spontan dan bicarakan rencana liburan atau hal-hal liar tak terduga.'
  },
  6: {
    title: 'Hasrat Perlindungan & Kehangatan Keluarga',
    craving: 'Ingin merasa dilindungi sekaligus merawat orang lain. Menyukai keharmonisan dan perhatian kecil.',
    flirtTip: 'Beri perhatian kecil tanpa pamrih (misal: cemilan saat dia lelah). Tunjukkan sisi pelindung.'
  },
  7: {
    title: 'Hasrat Kedalaman Intelektual & Misteri',
    craving: 'Mencari makna hidup mendalam, menyukai pria berwawasan luas, dan butuh ruang privasi.',
    flirtTip: 'Diskusikan topik filosofis atau misteri. Beri jeda obrolan, jangan memborbardirnya dengan chat.'
  },
  8: {
    title: 'Hasrat Ambisi & Kekuatan Nyata',
    craving: 'Tertarik pada kekuasaan, kesuksesan, dan pria yang setara atau lebih kuat karakternya dari dirinya.',
    flirtTip: 'Tunjukkan visi sukses dan kepemimpinan. Jangan pernah minder di depannya.'
  },
  9: {
    title: 'Hasrat Idealisme & Jiwa Sosial',
    craving: 'Mendambakan hubungan yang menginspirasi, penuh kebaikan, dan memiliki nilai kemanusiaan.',
    flirtTip: 'Apresiasi kebaikan hatinya dan cara pandangnya yang luas tentang dunia.'
  }
};

export const PERSONALITY_TRAITS = {
  1: { mask: 'Pemimpin yang Tegas & Berjarak' },
  2: { mask: 'Pribadi yang Ramah & Pendiam' },
  3: { mask: 'Sosok Ceria & Mudah Bergaul' },
  4: { mask: 'Serius, Teratur & Hati-Hati' },
  5: { mask: 'Lincah, Menarik Perhatian & Modis' },
  6: { mask: 'Anggun, Keibuan & Bertanggung Jawab' },
  7: { mask: 'Misterius, Dingin & Selektif' },
  8: { mask: 'Elegan, Karismatik & Tampak Kuat' },
  9: { mask: 'Karismatik, Berwawasan & Terbuka' }
};

/**
 * Menghitung Angka Nama (Soul Urge & Outer Mask)
 */
export function calculateNameNumerology(fullName) {
  if (!fullName) return null;
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  if (!cleanName) return null;

  let vowelSum = 0;
  let consonantSum = 0;

  for (const char of cleanName) {
    const val = PYTHAGOREAN_TABLE[char] || 0;
    if (VOWELS.includes(char)) {
      vowelSum += val;
    } else {
      consonantSum += val;
    }
  }

  const soulUrgeNum = reduceToSingleDigit(vowelSum);
  const personalityNum = reduceToSingleDigit(consonantSum);

  const soul = SOUL_URGE_TRAITS[soulUrgeNum] || SOUL_URGE_TRAITS[1];
  const mask = PERSONALITY_TRAITS[personalityNum] || PERSONALITY_TRAITS[1];

  // Synthesize Cold Reading Script ala Ronald Frank
  let coldReading = `Orang yang baru lihat kamu sekilas pasti ngira kamu sosok yang ${mask.mask.toLowerCase()}... tapi setelah kuperhatikan, aslinya kamu punya sisi yang ${soul.craving.toLowerCase()} Betul gak tebakanku?`;

  return {
    cleanName,
    soulUrgeNum,
    personalityNum,
    soul,
    mask,
    coldReading
  };
}

/**
 * Menghitung Siklus 9 Hari (Personal Day)
 * @param {string|Date} birthDate YYYY-MM-DD
 * @param {Date} currentDate
 */
export function calculatePersonalDay(birthDate, currentDate = new Date()) {
  const bDate = new Date(birthDate);
  if (isNaN(bDate.getTime())) return null;

  const birthDay = bDate.getUTCDate();
  const birthMonth = bDate.getUTCMonth() + 1;

  const curYear = currentDate.getFullYear();
  const curMonth = currentDate.getMonth() + 1;
  const curDay = currentDate.getDate();

  // Personal Year = Birth Day + Birth Month + Current Year
  const curYearSum = String(curYear).split('').reduce((a, b) => a + parseInt(b, 10), 0);
  const personalYear = reduceToSingleDigit(birthDay + birthMonth + curYearSum);

  // Personal Month = Personal Year + Current Month
  const personalMonth = reduceToSingleDigit(personalYear + curMonth);

  // Personal Day = Personal Month + Current Day
  const personalDay = reduceToSingleDigit(personalMonth + curDay);

  const GUIDANCE_MAP = {
    1: {
      title: 'Hari Awal Baru (Fresh & Receptive)',
      vibe: 'Pikiran target sedang terbuka pada sapaan atau kenalan baru.',
      action: 'MOMEN TERBAIK OPENER: Kirimkan hook pertama atau buka kembali obrolan yang sempat terhenti.',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    2: {
      title: 'Hari Kepekaan & Harmoni',
      vibe: 'Emosinya lebih perasa dan mendambakan kelembutan.',
      action: 'BANGUN RAPPORT: Obrolan personal santai, hindari nada bercanda yang terlalu sarkas.',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    3: {
      title: 'Hari Tawa & Spontanitas (High Energy)',
      vibe: 'Mood sedang ceria, mudah tertawa, dan ekspresif.',
      action: 'PLAYFUL TEASING: Waktu emas melempar candaan push-pull atau saling kirim meme.',
      badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30'
    },
    4: {
      title: 'Hari Fokus & Beban Tugas (Workload)',
      vibe: 'Pikiran dipenuhi tanggung jawab, mudah lelah jika diajak basa-basi.',
      action: 'TAHAN JEMPOL (COOL DOWN): Jangan menuntut balasan cepat, beri dia ruang fokus.',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    5: {
      title: 'Hari Petualangan & Spontan (Bosan Rutinitas)',
      vibe: 'Mendambakan suasana baru di luar rumah/kantor.',
      action: 'DATE CLOSE TERBAIK: Ajak keluar dadakan! "Mumpung sore ini sejuk, temenin cari kopi 30 menit yuk."',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    6: {
      title: 'Hari Cinta & Kehangatan (Nurturing)',
      vibe: 'Sangat responsif terhadap perhatian tulus dan kasih sayang.',
      action: 'DEEP CONNECTION: Momen pas mengirimkan micro-treat (kopi/snack favorit) atau validasi tulus.',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    },
    7: {
      title: 'Hari Introspeksi Diri (Quiet Mode)',
      vibe: 'Cenderung pendiam, ingin waktu untuk diri sendiri (me-time).',
      action: 'HIGH-VALUE SILENCE: Berikan jeda hening berkualitas. Jangan spam chat!',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    8: {
      title: 'Hari Ambisi & Ketegasan',
      vibe: 'Fokus pada target pribadi, menghargai orang yang percaya diri.',
      action: 'EQUAL VALUE: Tunjukkan kedewasaan dan ketegasan Anda. Jangan menye-menye.',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    9: {
      title: 'Hari Penuntasan & Emosi Meluap',
      vibe: 'Siklus emosi sedang mencapai puncak pelepasan.',
      action: 'JADI PENDENGAR: Biarkan dia bercerita jika ada keluh kesah, jadilah tempat yang nyaman.',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    }
  };

  return {
    personalDay,
    personalYear,
    guidance: GUIDANCE_MAP[personalDay] || GUIDANCE_MAP[1]
  };
}
