import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Heart, Clock, MessageSquare, ShieldAlert, 
  Send, Copy, Check, Flame, Moon, Sun, Wind, 
  Compass, Gift, AlertTriangle, BookOpen, User, Calendar,
  ArrowRight, CheckCircle2, ChevronRight, Zap, Target,
  ChevronDown, ChevronUp, SlidersHorizontal, Share2
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

  // Accordion Input toggle di HP
  const [isInputOpen, setIsInputOpen] = useState(false);

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
    <div className="min-h-screen bg-[#090710] text-slate-100 flex flex-col selection:bg-fuchsia-600 selection:text-white pb-24 md:pb-12">
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* HEADER MOBILE-FIRST */}
      <header className="border-b border-white/10 bg-[#120d20]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-violet-600 flex items-center justify-center shadow-md shadow-fuchsia-500/20 flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-white via-fuchsia-200 to-fuchsia-400 bg-clip-text text-transparent">
                  AuraMatch
                </span>
                <span className="text-[9px] uppercase font-semibold tracking-wider bg-fuchsia-500/20 text-fuchsia-300 px-1.5 py-0.5 rounded-full border border-fuchsia-500/30">
                  Primbon x RF
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Astrologi Jawa & Seni Flirting Ronald Frank
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Radar
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-4 w-full space-y-4">
        
        {/* COMPACT INPUT PROFILE BAR / ACCORDION */}
        <section className="glass-panel rounded-2xl border border-white/10 shadow-lg overflow-hidden transition-all">
          {/* Quick Summary Bar (Bisa di-klik untuk buka/tutup di HP) */}
          <div 
            onClick={() => setIsInputOpen(!isInputOpen)}
            className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-300 flex-shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                  <span>{userName} ({userWeton?.wetonString})</span>
                  <span className="text-rose-400">❤️</span>
                  <span>{targetName} ({targetWeton?.wetonString})</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="text-fuchsia-400">{pdktStatus}</span>
                  <span>&bull;</span>
                  <span>{matchResult?.status} ({matchResult?.score}%)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-fuchsia-400 font-medium pl-2 flex-shrink-0">
              <span className="hidden sm:inline">{isInputOpen ? 'Tutup Input' : 'Ubah Data'}</span>
              {isInputOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {/* Form Input Detail */}
          {isInputOpen && (
            <div className="p-3.5 sm:p-5 border-t border-white/10 bg-black/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Input Pria */}
                <div className="space-y-1.5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> Kamu
                  </label>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Nama Kamu"
                    className="w-full bg-[#140f24] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-fuchsia-500 mb-1"
                  />
                  <input 
                    type="date" 
                    value={userDate} 
                    onChange={(e) => setUserDate(e.target.value)}
                    className="w-full bg-[#140f24] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                  />
                  {userWeton && (
                    <div className="mt-1 text-[10px] text-blue-300 flex items-center justify-between">
                      <span>{userWeton.wetonString}</span>
                      <span className="bg-blue-500/20 px-1 py-0.5 rounded text-[9px]">Neptu {userWeton.totalNeptu}</span>
                    </div>
                  )}
                </div>

                {/* Input Target */}
                <div className="space-y-1.5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-fuchsia-400"></span> Target (Wanita)
                  </label>
                  <input 
                    type="text" 
                    value={targetName} 
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder="Nama Dia"
                    className="w-full bg-[#140f24] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-fuchsia-500 mb-1"
                  />
                  <input 
                    type="date" 
                    value={targetDate} 
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-[#140f24] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                  />
                  {targetWeton && (
                    <div className="mt-1 text-[10px] text-fuchsia-300 flex items-center justify-between">
                      <span>{targetWeton.wetonString}</span>
                      <span className="bg-fuchsia-500/20 px-1 py-0.5 rounded text-[9px]">Neptu {targetWeton.totalNeptu}</span>
                    </div>
                  )}
                </div>

                {/* Status Interaksi */}
                <div className="space-y-1.5 bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Status Saat Ini
                    </label>
                    <select 
                      value={pdktStatus} 
                      onChange={(e) => setPdktStatus(e.target.value)}
                      className="w-full bg-[#140f24] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                    >
                      <option value="Baru Kenal">Baru Kenal / Match Dating App</option>
                      <option value="Sedang Hangat">Sedang Hangat / Chat Rutin</option>
                      <option value="Dingin / Pasif">Lagi Dingin / Balas Singkat</option>
                      <option value="Teman Lama">Teman Biasa (Hindari Friendzone)</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => setIsInputOpen(false)}
                    className="w-full mt-2 py-1.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-medium transition-all"
                  >
                    Simpan & Update Hasil
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* DESKTOP TAB NAVIGATION (Hidden on mobile) */}
        <div className="hidden md:flex space-x-2 border-b border-white/10 pb-2">
          <button 
            onClick={() => setActiveTab('match')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'match' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> 1. Karakter & Jodoh
          </button>
          
          <button 
            onClick={() => setActiveTab('timing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'timing' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> 2. Radar Jam & Emosi
          </button>

          <button 
            onClick={() => setActiveTab('scripts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'scripts' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> 3. Amunisi Chat & Closer
          </button>

          <button 
            onClick={() => setActiveTab('playbook')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'playbook' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> 4. Ronald Frank Playbook
          </button>
        </div>

        {/* ================= TAB 1: KARAKTER & JODOH ================= */}
        {activeTab === 'match' && targetWeton && matchResult && (
          <div className="space-y-4">
            {/* Kartu Profil Target */}
            <div className="glass-panel-glow p-4 sm:p-5 rounded-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">{targetWeton.lakuning.icon}</span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {targetName} &bull; {targetWeton.wetonString}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getElementBadgeColor(targetWeton.lakuningKey)}`}>
                      {targetWeton.lakuning.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-300 border border-white/10">
                      Neptu: {targetWeton.totalNeptu}
                    </span>
                  </div>
                </div>

                <div className="bg-black/40 p-2.5 sm:p-3 rounded-xl border border-white/10 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Kecocokan Primbon</span>
                    <span className="text-xs text-slate-300">{matchResult.tagline}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-fuchsia-400 flex items-center gap-1">
                    {matchResult.score}%
                    <span className="text-[10px] font-normal text-slate-400">({matchResult.status})</span>
                  </div>
                </div>
              </div>

              {/* Rincian Watak */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/10 pt-3 text-xs">
                <div className="space-y-2 bg-white/5 p-3 rounded-xl">
                  <h4 className="font-bold uppercase tracking-wider text-fuchsia-300 text-[11px]">Watak Dominan</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{targetWeton.lakuning.character}</p>
                  
                  <div className="pt-1 text-[11px]">
                    <span className="text-emerald-400 font-semibold">Daya Tarik:</span> {targetWeton.lakuning.strengths}
                  </div>
                  <div className="text-[11px]">
                    <span className="text-rose-400 font-semibold">Titik Sensitif:</span> {targetWeton.lakuning.weaknesses}
                  </div>
                </div>

                <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5">
                  <h4 className="font-bold uppercase tracking-wider text-amber-300 text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> Peringatan Anti-Ilfil
                  </h4>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    {targetWeton.lakuning.triggerAlert}
                  </p>

                  <h4 className="font-bold uppercase tracking-wider text-fuchsia-300 text-[11px] pt-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" /> Gaya Flirting Paling Memikat
                  </h4>
                  <p className="text-[11px] text-fuchsia-200/90 leading-relaxed">
                    {targetWeton.lakuning.flirtStyle}
                  </p>
                </div>
              </div>
            </div>

            {/* Analisa Petung Jodoh & Strategi Ronald Frank */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Dinamika Hubungan: Kategori {matchResult.status}
              </h3>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                {matchResult.meaning}
              </p>

              <div className="bg-gradient-to-r from-fuchsia-950/40 to-violet-950/40 p-3 sm:p-4 rounded-xl border border-fuchsia-500/20">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-300 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-fuchsia-400" /> Strategi Lapangan Ronald Frank
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {matchResult.ronaldFrankStrategy}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: RADAR TIMING & EMOSI ================= */}
        {activeTab === 'timing' && timingResult && (
          <div className="space-y-4">
            {/* Status Energi Hari Ini */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-2.5 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">Energi Hari Ini ({timingResult.todayWeton})</span>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Kondisi Batin {targetName}: <span className="text-fuchsia-400">{timingResult.moodStatus}</span>
                  </h3>
                </div>
                <div className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-medium text-slate-200 border border-white/10">
                  Energi: {timingResult.energyLevel}
                </div>
              </div>

              {/* Panduan Jam */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Golden Hours */}
                <div className="space-y-2 bg-emerald-950/20 border border-emerald-500/20 p-3 sm:p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Golden Hours (Waktu Terbaik Chat)
                  </h4>
                  <div className="space-y-2">
                    {timingResult.goldenHours.map((gh, idx) => (
                      <div key={idx} className="bg-black/30 p-2.5 rounded-lg border border-emerald-500/10">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-white">{gh.label}</span>
                          <span className="text-[11px] font-mono text-emerald-300 font-semibold">{gh.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{gh.advice}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Hours */}
                <div className="space-y-2 bg-rose-950/20 border border-rose-500/20 p-3 sm:p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone (Tahan Follow-up)
                  </h4>
                  <div className="space-y-2">
                    {timingResult.dangerHours.map((dh, idx) => (
                      <div key={idx} className="bg-black/30 p-2.5 rounded-lg border border-rose-500/10">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-white">{dh.label}</span>
                          <span className="text-[11px] font-mono text-rose-300 font-semibold">{dh.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{dh.advice}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Konsultasi Hadiah */}
            {giftData && (
              <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 space-y-2.5">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-fuchsia-400" /> Kapan Boleh Kasih Makanan / Hadiah?
                </h4>
                
                {giftData.allowed ? (
                  <div className="bg-fuchsia-950/30 border border-fuchsia-500/30 p-3 sm:p-4 rounded-xl space-y-1">
                    <span className="text-[11px] font-bold text-fuchsia-300 uppercase tracking-wider block">
                      {giftData.tip}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {giftData.advice}
                    </p>
                  </div>
                ) : (
                  <div className="bg-rose-950/30 border border-rose-500/30 p-3 sm:p-4 rounded-xl space-y-1">
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> {giftData.warning}
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

        {/* ================= TAB 3: AMUNISI CHAT & DATE CLOSER ================= */}
        {activeTab === 'scripts' && scriptData && (
          <div className="space-y-4">
            {/* Filter Sub-Stage (Scrollable Horizontal di HP) */}
            <div className="glass-panel p-3 sm:p-4 rounded-2xl space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Tahapan PDKT:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {CHAT_STAGES.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => setSelectedStage(stage.id)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        selectedStage === stage.id
                          ? 'bg-fuchsia-600/30 border-fuchsia-500 text-white shadow'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight truncate">{stage.label}</div>
                      <div className="text-[9px] text-slate-400 truncate mt-0.5 hidden sm:block">{stage.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Situasi Chat:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SITUATION_MODES.map((sit) => (
                    <button
                      key={sit.id}
                      onClick={() => setSelectedSituation(sit.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
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
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200">
                <strong>Catatan Taktis:</strong> {scriptData.modifierNote}
              </div>
            )}

            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300">
              {scriptData.dangerAlert}
            </div>

            {/* Template Script Siap Pakai (Chat Bubble Style) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Rekomendasi Kalimat ({targetWeton.lakuning.name})
                </h4>
                <span className="text-[10px] text-fuchsia-400">Klik tombol salin</span>
              </div>

              <div className="space-y-3">
                {scriptData.scripts.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="glass-panel-glow p-3.5 sm:p-4 rounded-2xl border border-white/10 space-y-2.5 relative"
                  >
                    {/* Chat Bubble Simulation */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="bg-[#1f1738] p-3 rounded-2xl rounded-tl-sm border border-white/10 text-xs sm:text-sm text-slate-100 italic leading-relaxed w-full">
                        "{item.text}"
                      </div>
                      
                      <button
                        onClick={() => handleCopy(item.text, idx)}
                        className={`p-2.5 rounded-xl border transition-all flex-shrink-0 flex items-center justify-center ${
                          copiedText === idx 
                            ? 'bg-emerald-500 text-white border-emerald-400' 
                            : 'bg-fuchsia-600/30 text-fuchsia-300 border-fuchsia-500/40 hover:bg-fuchsia-600 hover:text-white'
                        }`}
                        title="Salin Kalimat"
                      >
                        {copiedText === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400">
                      <Zap className="w-3 h-3 text-fuchsia-400 flex-shrink-0" />
                      <span><strong>Alasan Psikologis:</strong> {item.explanation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kunci Sukses Date Close */}
            {selectedStage === 'date_close' && (
              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Kunci Sukses Date Close Ronald Frank:
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  <li><strong>Batasi durasi:</strong> Tentukan waktu singkat (30–45 menit) agar tidak ada beban komitmen berat.</li>
                  <li><strong>Tempat spesifik:</strong> Ajak ke kuliner/kopi unik yang menarik rasa penasarannya.</li>
                  <li><strong>Non-Reaktif:</strong> Jika ditolak, balas santai: *"Oke santai, kabar-kabari kalau urusanmu beres ya."*</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: PLAYBOOK ================= */}
        {activeTab === 'playbook' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-fuchsia-400" />
                7 Hukum Emas Memikat Wanita (Ronald Frank)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5 space-y-1">
                  <h4 className="font-bold text-fuchsia-300 text-xs">1. Hukum 80/20 (Emosi vs Logika)</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Wanita tertarik karena stimulasi emosional: penasaran, tertawa, dan tertantang. Bukan karena interogasi sopan membosankan.
                  </p>
                </div>

                <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5 space-y-1">
                  <h4 className="font-bold text-fuchsia-300 text-xs">2. Neediness Adalah Racun</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Sikap haus validasi, selalu online 24 jam, dan takut wanita ilfil membuat nilai pria jatuh seketika. Miliki kesibukan pribadi.
                  </p>
                </div>

                <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5 space-y-1">
                  <h4 className="font-bold text-fuchsia-300 text-xs">3. Teasing & Push-Pull</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Goda wanita dengan candaan cerdas yang membalik situasi seolah dia yang mengejar Anda. Ini menciptakan percikan ketertarikan.
                  </p>
                </div>

                <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5 space-y-1">
                  <h4 className="font-bold text-fuchsia-300 text-xs">4. Kualifikasi, Bukan Memuja</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Hentikan memuji paras fisiknya secara berlebihan. Berikan apresiasi pada selera, cara berpikir, atau keunikan karakternya.
                  </p>
                </div>

                <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5 space-y-1">
                  <h4 className="font-bold text-fuchsia-300 text-xs">5. Chatting Hanyalah Jembatan</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Jangan jadi sahabat teks selama berbulan-bulan. Begitu ada 2-3 percikan seru, langsung eksekusi ke kencan nyata (*Date Close*).
                  </p>
                </div>

                <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5 space-y-1">
                  <h4 className="font-bold text-fuchsia-300 text-xs">6. Keluar dari Friend-Zone</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Tunjukkan ketertarikan romantis secara halus namun tegas. Jangan biarkan diri Anda menjadi tempat sampah curhat tentang mantannya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#120d20]/95 backdrop-blur-lg border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('match')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'match'
              ? 'text-fuchsia-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className={`w-5 h-5 ${activeTab === 'match' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Jodoh</span>
        </button>

        <button
          onClick={() => setActiveTab('timing')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'timing'
              ? 'text-fuchsia-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className={`w-5 h-5 ${activeTab === 'timing' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('scripts')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'scripts'
              ? 'text-fuchsia-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${activeTab === 'scripts' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Amunisi</span>
        </button>

        <button
          onClick={() => setActiveTab('playbook')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'playbook'
              ? 'text-fuchsia-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${activeTab === 'playbook' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Playbook</span>
        </button>
      </nav>

      {/* FOOTER DESKTOP */}
      <footer className="hidden md:block mt-auto border-t border-white/5 py-3 text-center text-[11px] text-slate-500">
        <p>AuraMatch & DateCloser &bull; Mengintegrasikan Primbon Jawa & Seni Psikologi Ronald Frank</p>
      </footer>
    </div>
  );
}
