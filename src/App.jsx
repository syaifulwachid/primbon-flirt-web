import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Heart, Clock, MessageSquare, ShieldAlert, 
  Send, Copy, Check, Flame, Moon, Sun, Wind, 
  Compass, Gift, AlertTriangle, BookOpen, User, Calendar,
  ArrowRight, CheckCircle2, ChevronRight, Zap, Target
} from 'lucide-react';
import { calculateWeton, calculateMatch, calculateDailyTiming, LAKUNING_MAP } from './engine/primbon';
import { CHAT_STAGES, SITUATION_MODES, getChatRecommendation, getGiftConsultation } from './engine/ronaldFrank';

export default function App() {
  // State Input Form
  const [userName, setUserName] = useState('Radit');
  const [userDate, setUserDate] = useState('1998-05-14');
  const [targetName, setTargetName] = useState('Dian');
  const [targetDate, setTargetDate] = useState('2000-08-22');
  const [pdktStatus, setPdktStatus] = useState('Sedang Hangat'); // 'Baru Kenal' | 'Sedang Hangat' | 'Dingin / Pasif' | 'Teman Lama'

  // Tab Nav
  const [activeTab, setActiveTab] = useState('match'); // 'match' | 'timing' | 'scripts' | 'playbook'

  // Script Generator State
  const [selectedStage, setSelectedStage] = useState('opener');
  const [selectedSituation, setSelectedSituation] = useState('normal');
  const [copiedText, setCopiedText] = useState(null);

  // Hasil Kalkulasi
  const [userWeton, setUserWeton] = useState(null);
  const [targetWeton, setTargetWeton] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [timingResult, setTimingResult] = useState(null);
  const [scriptData, setScriptData] = useState(null);
  const [giftData, setGiftData] = useState(null);

  // Hitung ulang saat tanggal berubah
  useEffect(() => {
    if (userDate) {
      const uW = calculateWeton(userDate);
      setUserWeton(uW);
    }
    if (targetDate) {
      const tW = calculateWeton(targetDate);
      setTargetWeton(tW);
    }
  }, [userDate, targetDate]);

  // Hitung relasi & kecocokan
  useEffect(() => {
    if (userWeton && targetWeton) {
      const match = calculateMatch(userWeton, targetWeton);
      setMatchResult(match);

      const timing = calculateDailyTiming(targetWeton);
      setTimingResult(timing);

      const gift = getGiftConsultation(pdktStatus, timing?.energyLevel?.includes('Weton Kelahiran'));
      setGiftData(gift);
    }
  }, [userWeton, targetWeton, pdktStatus]);

  // Update Script saat stage atau situasi berubah
  useEffect(() => {
    if (targetWeton) {
      const rec = getChatRecommendation(targetWeton.lakuningKey, selectedStage, selectedSituation);
      setScriptData(rec);
    }
  }, [targetWeton, selectedStage, selectedSituation]);

  // Copy Clipboard Helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const getElementBadgeColor = (key) => {
    switch (key) {
      case 'Geni': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Rembulan': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Surya': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Angin': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Bintang': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Bumi': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#090710] text-slate-100 flex flex-col selection:bg-fuchsia-600 selection:text-white pb-16">
      {/* Glow Orbs Background */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#120d20]/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-violet-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-fuchsia-200 to-fuchsia-400 bg-clip-text text-transparent flex items-center gap-2">
                AuraMatch & DateCloser
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full border border-fuchsia-500/30">
                  Primbon x Ronald Frank
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Seni Memikat Wanita Berbasis Astrologi Jawa & Dinamika Emosi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Radar
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 py-6 w-full space-y-6">
        
        {/* INPUT SETUP CARD */}
        <section className="glass-panel p-5 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-fuchsia-400" /> Profil Energi & PDKT
            </h2>
            <span className="text-xs text-fuchsia-400">Otomatis Terkalkulasi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input Pria */}
            <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span> Tanggal Lahir Kamu
              </label>
              <input 
                type="text" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Nama Kamu"
                className="w-full bg-[#161226] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-fuchsia-500 mb-1"
              />
              <input 
                type="date" 
                value={userDate} 
                onChange={(e) => setUserDate(e.target.value)}
                className="w-full bg-[#161226] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-fuchsia-500"
              />
              {userWeton && (
                <div className="mt-1 text-[11px] text-blue-300 flex items-center justify-between">
                  <span>Weton: <strong>{userWeton.wetonString}</strong></span>
                  <span className="bg-blue-500/20 px-1.5 py-0.5 rounded text-[10px]">Neptu {userWeton.totalNeptu}</span>
                </div>
              )}
            </div>

            {/* Input Wanita / Target */}
            <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400"></span> Tanggal Lahir Target
              </label>
              <input 
                type="text" 
                value={targetName} 
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="Nama Dia"
                className="w-full bg-[#161226] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-fuchsia-500 mb-1"
              />
              <input 
                type="date" 
                value={targetDate} 
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-[#161226] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-fuchsia-500"
              />
              {targetWeton && (
                <div className="mt-1 text-[11px] text-fuchsia-300 flex items-center justify-between">
                  <span>Weton: <strong>{targetWeton.wetonString}</strong></span>
                  <span className="bg-fuchsia-500/20 px-1.5 py-0.5 rounded text-[10px]">Neptu {targetWeton.totalNeptu}</span>
                </div>
              )}
            </div>

            {/* Status Interaksi */}
            <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  Status Hubungan Saat Ini
                </label>
                <select 
                  value={pdktStatus} 
                  onChange={(e) => setPdktStatus(e.target.value)}
                  className="w-full bg-[#161226] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-fuchsia-500 text-slate-200"
                >
                  <option value="Baru Kenal">Baru Kenal / Match Dating App</option>
                  <option value="Sedang Hangat">Sedang Hangat / Chat Rutin</option>
                  <option value="Dingin / Pasif">Lagi Dingin / Balas Singkat (Ghosting)</option>
                  <option value="Teman Lama">Teman Biasa (Mencegah Friend-zone)</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-400">
                Membantu AI menyaring tingkat keakraban & mencegah kalimat terlalu agresif.
              </p>
            </div>
          </div>
        </section>

        {/* NAVIGATION TABS */}
        <div className="flex overflow-x-auto space-x-2 border-b border-white/10 pb-2 scrollbar-none">
          <button 
            onClick={() => setActiveTab('match')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'match' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-4 h-4" /> 1. Analisa Karakter & Jodoh
          </button>
          
          <button 
            onClick={() => setActiveTab('timing')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'timing' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" /> 2. Radar Timing & Emosi Hari Ini
          </button>

          <button 
            onClick={() => setActiveTab('scripts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'scripts' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> 3. Amunisi Chat & Date Closer
          </button>

          <button 
            onClick={() => setActiveTab('playbook')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'playbook' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 4. Ronald Frank Playbook
          </button>
        </div>

        {/* TAB 1: KARAKTER & JODOH */}
        {activeTab === 'match' && targetWeton && matchResult && (
          <div className="space-y-6">
            {/* Kartu Profil Target */}
            <div className="glass-panel-glow p-6 rounded-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{targetWeton.lakuning.icon}</span>
                    <h3 className="text-xl font-bold text-white">
                      {targetName} &bull; {targetWeton.wetonString}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getElementBadgeColor(targetWeton.lakuningKey)}`}>
                      {targetWeton.lakuning.name}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/10">
                      Neptu Total: {targetWeton.totalNeptu}
                    </span>
                  </div>
                </div>

                <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-right md:min-w-[180px]">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Kecocokan Primbon</span>
                  <div className="text-2xl font-black text-fuchsia-400 flex items-center justify-end gap-1">
                    {matchResult.score}%
                    <span className="text-xs font-normal text-slate-400">({matchResult.status})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{matchResult.tagline}</span>
                </div>
              </div>

              {/* Rincian Watak Lakuning */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4 text-sm">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">Watak Dominan</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">{targetWeton.lakuning.character}</p>
                  
                  <div className="pt-2 text-xs">
                    <span className="text-emerald-400 font-semibold">Kekuatan Emosi:</span> {targetWeton.lakuning.strengths}
                  </div>
                  <div className="text-xs">
                    <span className="text-rose-400 font-semibold">Titik Sensitif:</span> {targetWeton.lakuning.weaknesses}
                  </div>
                </div>

                <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Peringatan Blunder (Anti-Ilfil)
                  </h4>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {targetWeton.lakuning.triggerAlert}
                  </p>

                  <h4 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300 pt-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Gaya Flirting Paling Memikat
                  </h4>
                  <p className="text-xs text-fuchsia-200/90 leading-relaxed">
                    {targetWeton.lakuning.flirtStyle}
                  </p>
                </div>
              </div>
            </div>

            {/* Analisa Petung Jodoh & Strategi Ronald Frank */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Dinamika Hubungan: Kategori {matchResult.status} ({userWeton.wetonString} + {targetWeton.wetonString})
              </h3>
              
              <p className="text-sm text-slate-300 leading-relaxed">
                {matchResult.meaning}
              </p>

              <div className="bg-gradient-to-r from-fuchsia-950/40 to-violet-950/40 p-4 rounded-xl border border-fuchsia-500/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300 mb-1 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-fuchsia-400" /> Strategi Lapangan Ronald Frank untuk Hubungan Ini
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {matchResult.ronaldFrankStrategy}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RADAR TIMING & EMOSI */}
        {activeTab === 'timing' && timingResult && (
          <div className="space-y-6">
            {/* Status Energi Hari Ini */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-xs text-slate-400">Energi Hari Ini ({timingResult.todayWeton})</span>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Kondisi Batin {targetName}: <span className="text-fuchsia-400">{timingResult.moodStatus}</span>
                  </h3>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-medium text-slate-200 border border-white/10">
                  Energi: {timingResult.energyLevel}
                </div>
              </div>

              {/* Panduan Jam */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Golden Hours */}
                <div className="space-y-3 bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Golden Hours (Waktu Terbaik Chat)
                  </h4>
                  <div className="space-y-2">
                    {timingResult.goldenHours.map((gh, idx) => (
                      <div key={idx} className="bg-black/30 p-2.5 rounded-lg border border-emerald-500/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{gh.label}</span>
                          <span className="text-xs font-mono text-emerald-300 font-semibold">{gh.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{gh.advice}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Hours */}
                <div className="space-y-3 bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Danger Zone (Tahan Chat & Follow-up)
                  </h4>
                  <div className="space-y-2">
                    {timingResult.dangerHours.map((dh, idx) => (
                      <div key={idx} className="bg-black/30 p-2.5 rounded-lg border border-rose-500/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{dh.label}</span>
                          <span className="text-xs font-mono text-rose-300 font-semibold">{dh.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{dh.advice}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Konsultasi Traktiran & Hadiah */}
            {giftData && (
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-fuchsia-400" /> Kapan Boleh Kasih Makanan / Hadiah?
                </h4>
                
                {giftData.allowed ? (
                  <div className="bg-fuchsia-950/30 border border-fuchsia-500/30 p-4 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider">
                      {giftData.tip}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {giftData.advice}
                    </p>
                  </div>
                ) : (
                  <div className="bg-rose-950/30 border border-rose-500/30 p-4 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> {giftData.warning}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {giftData.reason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AMUNISI CHAT & DATE CLOSER */}
        {activeTab === 'scripts' && scriptData && (
          <div className="space-y-6">
            {/* Filter Sub-Stage & Situasi */}
            <div className="glass-panel p-4 rounded-2xl space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Pilih Tahapan Pendekatan:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CHAT_STAGES.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => setSelectedStage(stage.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        selectedStage === stage.id
                          ? 'bg-fuchsia-600/20 border-fuchsia-500 text-white shadow-md'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{stage.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{stage.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Situasi Saat Ini:
                </label>
                <div className="flex flex-wrap gap-2">
                  {SITUATION_MODES.map((sit) => (
                    <button
                      key={sit.id}
                      onClick={() => setSelectedSituation(sit.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedSituation === sit.id
                          ? 'bg-violet-600 text-white border-violet-500'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sit.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Note Situasi & Danger Alert */}
            {scriptData.modifierNote && (
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200">
                <strong>Catatan Taktis:</strong> {scriptData.modifierNote}
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300">
              {scriptData.dangerAlert}
            </div>

            {/* Daftar Template Script Siap Pakai */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Rekomendasi Script Kalimat ({targetWeton.lakuning.name})</span>
                <span className="text-xs text-slate-400 font-normal">Klik untuk menyalin teks</span>
              </h4>

              <div className="grid grid-cols-1 gap-4">
                {scriptData.scripts.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="glass-panel-glow p-5 rounded-2xl border border-white/10 space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm md:text-base font-medium text-slate-100 italic bg-white/5 p-3.5 rounded-xl border border-white/5 w-full leading-relaxed">
                        "{item.text}"
                      </div>
                      
                      <button
                        onClick={() => handleCopy(item.text, idx)}
                        className={`p-2.5 rounded-xl border transition-all flex-shrink-0 ${
                          copiedText === idx 
                            ? 'bg-emerald-500 text-white border-emerald-400' 
                            : 'bg-fuchsia-600/20 text-fuchsia-300 border-fuchsia-500/40 hover:bg-fuchsia-600 hover:text-white'
                        }`}
                        title="Salin Kalimat"
                      >
                        {copiedText === idx ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Zap className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" />
                      <span><strong>Alasan Psikologis:</strong> {item.explanation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlight The Date Closer */}
            {selectedStage === 'date_close' && (
              <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Kunci Sukses Date Close ala Ronald Frank:
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
                  <li><strong>Beri batas waktu:</strong> Selalu batasi durasi pertemuan (misal: "30-45 menit aja") agar wanita tidak merasa terancam terjebak dalam kencan canggung yang lama.</li>
                  <li><strong>Alasan yang spesifik:</strong> Jangan ajak "jalan-jalan gak jelas". Ajak ke tempat/makanan tertentu yang menarik perhatiannya.</li>
                  <li><strong>Non-Reaktif bila ditolak:</strong> Jika dia berhalangan, cukup balas: *"Oke santai, kabar-kabari kalau urusanmu beres ya."* Jangan pernah mengemis atau marah.</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RONALD FRANK PLAYBOOK */}
        {activeTab === 'playbook' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-fuchsia-400" />
                7 Hukum Emas Memikat Wanita (Ronald Frank Knowledge Base)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-fuchsia-300 text-sm">1. Hukum 80/20 (Emosi vs Logika)</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Wanita tidak jatuh cinta karena logika daftar kebaikan atau pertanyaan sopan seperti "udah makan belum?". Wanita tertarik karena emosi yang bergejolak: tertawa, penasaran, tertantang, dan merasa dihargai secara unik.
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-fuchsia-300 text-sm">2. Neediness adalah Racun Utama</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Sikap selalu bersedia setiap detik, langsung membalas chat kilat, dan takut wanita tersinggung akan membuat nilai pria jatuh seketika. Pria yang bernilai tinggi memiliki kesibukan dan standar hidup sendiri.
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-fuchsia-300 text-sm">3. Teasing & Push-Pull</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Jangan selalu mengiyakan pendapat wanita. Candaan ringan (*teasing*) yang membalik situasi seolah dia yang mengejar Anda akan menciptakan tensi ketertarikan seksual dan emosional yang sehat.
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-fuchsia-300 text-sm">4. Kualifikasi, Bukan Memuja</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Berhenti memuji kecantikan fisiknya (ratusan pria lain sudah melakukannya). Puji karakter spesifiknya, selera musiknya, cara pandangnya yang unik, atau kepribadiannya.
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-fuchsia-300 text-sm">5. Chatting Hanyalah Jembatan</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Jangan berlama-lama menjadi sahabat teks selama berbulan-bulan. Begitu ada 2-3 kali momentum obrolan seru, segera konversi menjadi kencan nyata (*Date Close*).
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-fuchsia-300 text-sm">6. Terhindar dari Friend-Zone</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Friend-zone terjadi ketika Anda terlalu baik tanpa menunjukkan intensi pria yang menarik. Tunjukkan bahwa Anda menghargainya sebagai wanita idaman, bukan sekadar teman curhat tentang mantannya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/5 py-4 text-center text-xs text-slate-500">
        <p>AuraMatch & DateCloser &bull; Mengintegrasikan Kebijaksanaan Primbon Jawa & Seni Psikologi Ronald Frank</p>
      </footer>
    </div>
  );
}
