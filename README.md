# AuraMatch & DateCloser (Public Web Demo) 🔮💬

> **Aplikasi Web Asisten Chat Flirting & PDKT Berbasis Paduan Primbon Weton Jawa & Seni Memikat Ronald Frank.**

Live demo interaktif untuk menguji karakter target, menghitung kecocokan weton, membaca radar jam terbaik mengirim chat, mendapatkan amunisi kata-kata *push-pull* / *teasing*, hingga script ajakan kencan nyata (*The Date Closer*).

---

## ✨ Fitur Unggulan
1. **Analisa Karakter Weton & Lakuning**: Mengidentifikasi tipe karakter target (Api, Bulan, Surya, Angin, Bintang, Bumi, Air).
2. **Kecocokan Primbon Jodoh (8 Petung)**: Menghitung persentase kecocokan neptu dan strategi mitigasi risiko menurut ajaran Ronald Frank.
3. **Radar Timing & Bioritme Harian**:
   - Golden Hours (Waktu terbaik memulai obrolan mendalam).
   - Danger Zone (Jam rawan badmood / lelah).
   - Konsultasi Hadiah: Kapan boleh mentraktir makanan vs kapan pantang memberi hadiah agar tidak terkesan *needy*.
4. **Generator Amunisi Chat**:
   - *Stage 1: Opener & Hook* (Anti-tanya basi "lagi apa").
   - *Stage 2: Playful Teasing & Push-Pull* (Membangun tensi ketertarikan emosional).
   - *Stage 3: Deep Connection* (Kualifikasi karakter).
   - *Stage 4: The Date Closer* (Ajak kencan nyata tanpa penolakan canggung).
5. **Ronald Frank Playbook**: 7 Hukum Emas daya tarik pria bernilai tinggi (*High-Value Man*).

---

## 🚀 Cara Menjalankan Lokal

```bash
# Masuk ke direktori web
cd primbon-flirt-web

# Install dependencies
npm install

# Jalankan server development
npm run dev
```

Buka browser di `http://localhost:3000`.

---

## 🌐 Cara Deploy Gratis ke Vercel / Netlify / GitHub Pages

Proyek ini telah dikompilasi ke SPA (*Single Page Application*) statis murni tanpa ketergantungan server:
```bash
npm run build
```
Folder `dist/` dapat langsung diunggah atau dihubungkan ke:
- **Vercel**: Import repository GitHub ini, pilih framework *Vite*, lalu klik Deploy.
- **Netlify**: Drag & drop folder `dist` atau hubungkan branch main.
- **GitHub Pages**: Aktifkan GitHub Actions static HTML deploy.
