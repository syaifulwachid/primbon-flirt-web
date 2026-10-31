import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Heart, Clock, MessageSquare, ShieldAlert, 
  Send, Copy, Check, Flame, Moon, Sun, Wind, 
  Compass, Gift, AlertTriangle, BookOpen, User, Calendar,
  ArrowRight, CheckCircle2, ChevronRight, Zap, Target,
  ChevronDown, ChevronUp, SlidersHorizontal, Share2, Plus,
  Trash2, Bell, BellRing, Eye, Sparkle
} from 'lucide-react';
import { calculateWeton, calculateMatch, calculateDailyTiming, LAKUNING_MAP } from './engine/primbon';
import { CHAT_STAGES, SITUATION_MODES, getChatRecommendation, getGiftConsultation } from './engine/ronaldFrank';
import { calculateNameNumerology, calculatePersonalDay } from './engine/numerology';

// Data Default Awal
const DEFAULT_USER = {
  name: 'Radit',
  birthDate: '1998-05-14'
};

const DEFAULT_TARGETS = [
  {
    id: 'target-1',
    name: 'Dian Sastro',
    birthDate: '2000-08-22',
    pdktStatus: 'Sedang Hangat',
    notes: 'Suka matcha latte, kucing anggora, dan musik indie'
  },
  {
    id: 'target-2',
    name: 'Clara Bella',
    birthDate: '2001-03-15',
    pdktStatus: 'Baru Kenal',
    notes: 'Match dari Bumble, suka nonton film thriller'
  }
];

export default function App() {
  // 1. User Profile Persistent State
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('AURAMATCH_USER_PROFILE');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // 2. Targets List Persistent State
  const [targets, setTargets] = useState(() => {
    try {
      const saved = localStorage.getItem('AURAMATCH_TARGETS');
      return saved ? JSON.parse(saved) : DEFAULT_TARGETS;
    } catch {
      return DEFAULT_TARGETS;
    }
  });

  // 3. Active Target ID Persistent State
  const [activeTargetId, setActiveTargetId] = useState(() => {
    try {
      const saved = localStorage.getItem('AURAMATCH_ACTIVE_TARGET_ID');
      return saved || (DEFAULT_TARGETS[0]?.id || 'target-1');
    } catch {
      return 'target-1';
    }
  });

  // Target Aktif Saat Ini
  const activeTarget = targets.find(t => t.id === activeTargetId) || targets[0] || DEFAULT_TARGETS[0];

  // Accordion & Modal Form States
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('2001-01-01');
  const [newTargetStatus, setNewTargetStatus] = useState('Baru Kenal');
  const [newTargetNotes, setNewTargetNotes] = useState('');

  // Notification State
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notificationToast, setNotificationToast] = useState(null);

  // Tab Nav: 'match' | 'timing' | 'scripts' | 'numerology' | 'playbook'
  const [activeTab, setActiveTab] = useState('match');

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
  const [numerologyData, setNumerologyData] = useState(null);
  const [personalDayData, setPersonalDayData] = useState(null);

  // Simpan ke localStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem('AURAMATCH_USER_PROFILE', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('AURAMATCH_TARGETS', JSON.stringify(targets));
  }, [targets]);

  useEffect(() => {
    localStorage.setItem('AURAMATCH_ACTIVE_TARGET_ID', activeTargetId);
  }, [activeTargetId]);

  // Cek Status Notifikasi
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Hitung Weton & Numerologi
  useEffect(() => {
    if (userProfile.birthDate) {
      const uW = calculateWeton(userProfile.birthDate);
      setUserWeton(uW);
    }
  }, [userProfile.birthDate]);

  useEffect(() => {
    if (activeTarget?.birthDate) {
      const tW = calculateWeton(activeTarget.birthDate);
      setTargetWeton(tW);

      const num = calculateNameNumerology(activeTarget.name);
      setNumerologyData(num);

      const pDay = calculatePersonalDay(activeTarget.birthDate);
      setPersonalDayData(pDay);
    }
  }, [activeTarget?.birthDate, activeTarget?.name]);

  // Hitung Relasi & Kecocokan
  useEffect(() => {
    if (userWeton && targetWeton && activeTarget) {
      const match = calculateMatch(userWeton, targetWeton);
      setMatchResult(match);

      const timing = calculateDailyTiming(targetWeton);
      setTimingResult(timing);

      const gift = getGiftConsultation(activeTarget.pdktStatus, timing?.energyLevel?.includes('Weton Kelahiran'));
      setGiftData(gift);
    }
  }, [userWeton, targetWeton, activeTarget?.pdktStatus]);

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

  // Tambah Target Baru
  const handleAddTarget = (e) => {
    e.preventDefault();
    if (!newTargetName.trim()) return;

    const newTarget = {
      id: `target-${Date.now()}`,
      name: newTargetName.trim(),
      birthDate: newTargetDate,
      pdktStatus: newTargetStatus,
      notes: newTargetNotes
    };

    setTargets(prev => [...prev, newTarget]);
    setActiveTargetId(newTarget.id);
    setIsAddModalOpen(false);
    setNewTargetName('');
    setNewTargetNotes('');
  };

  // Hapus Target
  const handleDeleteTarget = (targetId, e) => {
    e.stopPropagation();
    if (targets.length <= 1) {
      alert('Minimal harus ada 1 target profil gebetan.');
      return;
    }
    if (confirm('Yakin ingin menghapus target ini dari daftar CRM Anda?')) {
      const filtered = targets.filter(t => t.id !== targetId);
      setTargets(filtered);
      if (activeTargetId === targetId) {
        setActiveTargetId(filtered[0].id);
      }
    }
  };

  // Trigger Native / Web Notification Simulator
  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      alert('Browser Anda belum mendukung notifikasi.');
      return;
    }

    let perm = Notification.permission;
    if (perm !== 'granted') {
      perm = await Notification.requestPermission();
      setNotificationPermission(perm);
    }

    if (perm === 'granted') {
      new Notification(`🔮 AuraMatch Wingman: Golden Hour ${activeTarget.name}!`, {
        body: `Sekarang waktu terbaik untuk kirim script Hook. Energi ${activeTarget.name} sedang santai & terbuka.`,
        icon: 'https://auramatchdatecloser.vercel.app/favicon.ico'
      });
      setNotificationToast(`Notifikasi berhasil dikirim ke HP/Desktop Anda!`);
      setTimeout(() => setNotificationToast(null), 4000);
    } else {
      alert('Izin notifikasi ditolak. Anda bisa mengaktifkannya di pengaturan browser.');
    }
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
                  Primbon x Numerologi
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Target CRM & Personal AI Dating Wingman
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestNotification}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/30 border border-fuchsia-500/30 transition-all"
              title="Aktifkan Notifikasi Jam Emas"
            >
              <Bell className="w-3.5 h-3.5 animate-pulse text-fuchsia-400" />
              <span>Alarm Jam</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFIKASI */}
      {notificationToast && (
        <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-2 w-full">
          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{notificationToast}</span>
          </div>
        </div>
      )}

      {/* TARGET CRM SELECTOR BAR (Horizontal Scrollable) */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 w-full">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1">
            <Target className="w-3.5 h-3.5 text-fuchsia-400" /> Gebetan:
          </span>

          {targets.map((tgt) => (
            <div
              key={tgt.id}
              onClick={() => setActiveTargetId(tgt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all flex-shrink-0 border ${
                tgt.id === activeTargetId
                  ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white border-fuchsia-400 shadow-md shadow-fuchsia-500/20'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <Heart className={`w-3 h-3 ${tgt.id === activeTargetId ? 'fill-current text-white' : 'text-fuchsia-400'}`} />
              <span>{tgt.name}</span>
              <span className="text-[10px] opacity-75">({tgt.pdktStatus})</span>
              {targets.length > 1 && (
                <button
                  onClick={(e) => handleDeleteTarget(tgt.id, e)}
                  className="ml-1 opacity-60 hover:opacity-100 hover:text-rose-400"
                  title="Hapus Target"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-fuchsia-300 hover:bg-fuchsia-500/20 border border-fuchsia-500/30 flex-shrink-0 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Target
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-3 w-full space-y-4">
        
        {/* COMPACT INPUT PROFILE BAR / ACCORDION */}
        <section className="glass-panel rounded-2xl border border-white/10 shadow-lg overflow-hidden transition-all">
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
                  <span>{userProfile.name} ({userWeton?.wetonString})</span>
                  <span className="text-rose-400">❤️</span>
                  <span>{activeTarget.name} ({targetWeton?.wetonString})</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="text-fuchsia-400">{activeTarget.pdktStatus}</span>
                  <span>&bull;</span>
                  <span>{matchResult?.status} ({matchResult?.score}%)</span>
                  {numerologyData && (
                    <>
                      <span>&bull;</span>
                      <span className="text-cyan-400">Soul Urge: #{numerologyData.soulUrgeNum}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-fuchsia-400 font-medium pl-2 flex-shrink-0">
              <span className="hidden sm:inline">{isInputOpen ? 'Tutup Edit' : 'Edit Profil'}</span>
              {isInputOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {/* Form Input Detail */}
          {isInputOpen && (
            <div className="p-3.5 sm:p-5 border-t border-white/10 bg-black/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Input Kamu */}
                <div className="space-y-1.5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> Profil Kamu
                  </label>
                  <input 
                    type="text" 
                    value={userProfile.name} 
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    placeholder="Nama Kamu"
                    className="w-full bg-[#140f24] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-fuchsia-500 mb-1"
                  />
                  <input 
                    type="date" 
                    value={userProfile.birthDate} 
                    onChange={(e) => setUserProfile({ ...userProfile, birthDate: e.target.value })}
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
                    <span className="w-2 h-2 rounded-full bg-fuchsia-400"></span> Edit {activeTarget.name}
                  </label>
                  <input 
                    type="text" 
                    value={activeTarget.name} 
                    onChange={(e) => {
                      const updated = targets.map(t => t.id === activeTarget.id ? { ...t, name: e.target.value } : t);
                      setTargets(updated);
                    }}
                    placeholder="Nama Gebetan"
                    className="w-full bg-[#140f24] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-fuchsia-500 mb-1"
                  />
                  <input 
                    type="date" 
                    value={activeTarget.birthDate} 
                    onChange={(e) => {
                      const updated = targets.map(t => t.id === activeTarget.id ? { ...t, birthDate: e.target.value } : t);
                      setTargets(updated);
                    }}
                    className="w-full bg-[#140f24] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                  />
                  {targetWeton && (
                    <div className="mt-1 text-[10px] text-fuchsia-300 flex items-center justify-between">
                      <span>{targetWeton.wetonString}</span>
                      <span className="bg-fuchsia-500/20 px-1 py-0.5 rounded text-[9px]">Neptu {targetWeton.totalNeptu}</span>
                    </div>
                  )}
                </div>

                {/* Status Interaksi & Notes */}
                <div className="space-y-1.5 bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Status PDKT
                    </label>
                    <select 
                      value={activeTarget.pdktStatus} 
                      onChange={(e) => {
                        const updated = targets.map(t => t.id === activeTarget.id ? { ...t, pdktStatus: e.target.value } : t);
                        setTargets(updated);
                      }}
                      className="w-full bg-[#140f24] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-fuchsia-500 mb-1.5"
                    >
                      <option value="Baru Kenal">Baru Kenal / Match Dating App</option>
                      <option value="Sedang Hangat">Sedang Hangat / Chat Rutin</option>
                      <option value="Dingin / Pasif">Lagi Dingin / Balas Singkat</option>
                      <option value="Teman Lama">Teman Biasa (Hindari Friendzone)</option>
                    </select>

                    <input
                      type="text"
                      value={activeTarget.notes || ''}
                      onChange={(e) => {
                        const updated = targets.map(t => t.id === activeTarget.id ? { ...t, notes: e.target.value } : t);
                        setTargets(updated);
                      }}
                      placeholder="Catatan rahasia (makanan favorit, dll)"
                      className="w-full bg-[#140f24] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                  <button 
                    onClick={() => setIsInputOpen(false)}
                    className="w-full mt-2 py-1.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-medium transition-all"
                  >
                    Simpan Perubahan
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'match' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> 1. Karakter & Jodoh
          </button>
          
          <button 
            onClick={() => setActiveTab('numerology')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'numerology' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkle className="w-3.5 h-3.5" /> 2. Numerologi & Cold Reading
          </button>

          <button 
            onClick={() => setActiveTab('timing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'timing' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> 3. Radar Jam & 9 Hari
          </button>

          <button 
            onClick={() => setActiveTab('scripts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'scripts' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> 4. Amunisi Chat & Closer
          </button>

          <button 
            onClick={() => setActiveTab('playbook')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'playbook' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> 5. Playbook
          </button>
        </div>

        {/* ================= TAB 1: KARAKTER & JODOH PRIMBON ================= */}
        {activeTab === 'match' && targetWeton && matchResult && (
          <div className="space-y-4">
            {/* Kartu Profil Target */}
            <div className="glass-panel-glow p-4 sm:p-5 rounded-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">{targetWeton.lakuning.icon}</span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {activeTarget.name} &bull; {targetWeton.wetonString}
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

        {/* ================= TAB 2: NUMEROLOGI & COLD READING ================= */}
        {activeTab === 'numerology' && numerologyData && (
          <div className="space-y-4">
            {/* Kartu Profil Numerologi Pythagoras */}
            <div className="glass-panel-glow p-4 sm:p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Analisa Getaran Nama (Pythagoras)</span>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    {activeTarget.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                    Jiwa #{numerologyData.soulUrgeNum}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                    Topeng #{numerologyData.personalityNum}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Soul Urge */}
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-cyan-300 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-cyan-400" /> Soul Urge (Hasrat Rahasia Batin)
                  </span>
                  <h4 className="font-bold text-white text-xs">{numerologyData.soul.title}</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{numerologyData.soul.craving}</p>
                  <p className="text-cyan-200 text-[11px] pt-1"><strong>Tips Pikat:</strong> {numerologyData.soul.flirtTip}</p>
                </div>

                {/* Outer Mask */}
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-purple-400" /> Outer Mask (Topeng Sosial Luar)
                  </span>
                  <h4 className="font-bold text-white text-xs">Kesan Pertama di Mata Publik:</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{numerologyData.mask.mask}</p>
                  <p className="text-purple-200 text-[11px] pt-1">
                    Orang lain hanya melihat sisi luarnya yang tampak formal/kuat, namun Anda tahu celah rahasia di dalam hatinya!
                  </p>
                </div>
              </div>

              {/* COLD READING GENERATOR CARD */}
              <div className="bg-gradient-to-r from-violet-950/50 to-fuchsia-950/50 p-4 rounded-xl border border-fuchsia-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-fuchsia-400" /> Formula Hipnotik Cold Reading (Siap Salin)
                  </span>
                  <button
                    onClick={() => handleCopy(numerologyData.coldReading, 'cold_reading')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      copiedText === 'cold_reading'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'
                    }`}
                  >
                    {copiedText === 'cold_reading' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === 'cold_reading' ? 'Disalin!' : 'Salin Teks'}</span>
                  </button>
                </div>

                <div className="bg-[#17112a] p-3 rounded-xl border border-white/10 text-xs sm:text-sm text-slate-100 italic leading-relaxed">
                  "{numerologyData.coldReading}"
                </div>

                <p className="text-[10px] text-slate-400 leading-normal">
                  ⚡ <strong>Efek Psikologis:</strong> Kalimat ini mengkontraskan topeng luarnya dengan hasrat tersembunyinya. Target akan merasa Anda adalah satu-satunya pria yang mampu membaca jiwanya sampai ke dasar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: RADAR TIMING & 9 HARI ================= */}
        {activeTab === 'timing' && timingResult && (
          <div className="space-y-4">
            {/* Status Personal Day Numerologi */}
            {personalDayData && (
              <div className="glass-panel-glow p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse"></span>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Siklus 9 Hari: Personal Day #{personalDayData.personalDay}
                    </h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${personalDayData.guidance.badgeColor}`}>
                    {personalDayData.guidance.title}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{personalDayData.guidance.vibe}</p>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-xs text-fuchsia-200">
                  ⚡ <strong>Rekomendasi Aksi:</strong> {personalDayData.guidance.action}
                </div>
              </div>
            )}

            {/* Status Energi Primbon */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-2.5 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">Energi Primbon Hari Ini ({timingResult.todayWeton})</span>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Kondisi Batin {activeTarget.name}: <span className="text-fuchsia-400">{timingResult.moodStatus}</span>
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

        {/* ================= TAB 4: AMUNISI CHAT & DATE CLOSER ================= */}
        {activeTab === 'scripts' && scriptData && (
          <div className="space-y-4">
            {/* Filter Sub-Stage */}
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

        {/* ================= TAB 5: PLAYBOOK ================= */}
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

      {/* MODAL TAMBAH TARGET BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-glow w-full max-w-md p-5 rounded-2xl border border-fuchsia-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-fuchsia-400" /> Tambah Target Gebetan Baru
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddTarget} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Nama Gebetan / Target</label>
                <input
                  type="text"
                  required
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  placeholder="Misal: Nadia Safira"
                  className="w-full bg-[#140f24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Tanggal Lahir Target</label>
                <input
                  type="date"
                  required
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full bg-[#140f24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Status Hubungan Saat Ini</label>
                <select
                  value={newTargetStatus}
                  onChange={(e) => setNewTargetStatus(e.target.value)}
                  className="w-full bg-[#140f24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                >
                  <option value="Baru Kenal">Baru Kenal / Match Dating App</option>
                  <option value="Sedang Hangat">Sedang Hangat / Chat Rutin</option>
                  <option value="Dingin / Pasif">Lagi Dingin / Balas Singkat</option>
                  <option value="Teman Lama">Teman Biasa (Hindari Friendzone)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={newTargetNotes}
                  onChange={(e) => setNewTargetNotes(e.target.value)}
                  placeholder="Tempat kopi favorit, hal yang disukai..."
                  className="w-full bg-[#140f24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-semibold shadow-lg shadow-fuchsia-500/20"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (Thumb Zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#120d20]/95 backdrop-blur-lg border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('match')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
            activeTab === 'match'
              ? 'text-fuchsia-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${activeTab === 'match' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px] mt-0.5">Jodoh</span>
        </button>

        <button
          onClick={() => setActiveTab('numerology')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
            activeTab === 'numerology'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkle className={`w-4 h-4 ${activeTab === 'numerology' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px] mt-0.5">Numerologi</span>
        </button>

        <button
          onClick={() => setActiveTab('timing')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
            activeTab === 'timing'
              ? 'text-fuchsia-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className={`w-4 h-4 ${activeTab === 'timing' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px] mt-0.5">Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('scripts')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
            activeTab === 'scripts'
              ? 'text-fuchsia-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className={`w-4 h-4 ${activeTab === 'scripts' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px] mt-0.5">Amunisi</span>
        </button>

        <button
          onClick={() => setActiveTab('playbook')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
            activeTab === 'playbook'
              ? 'text-fuchsia-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeTab === 'playbook' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px] mt-0.5">Playbook</span>
        </button>
      </nav>

      {/* FOOTER DESKTOP */}
      <footer className="hidden md:block mt-auto border-t border-white/5 py-3 text-center text-[11px] text-slate-500">
        <p>AuraMatch &bull; Mengintegrasikan Primbon Jawa, Numerologi Pythagoras, & Seni Psikologi Ronald Frank</p>
      </footer>
    </div>
  );
}
