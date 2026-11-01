import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Heart, Clock, MessageSquare, ShieldAlert, 
  Send, Copy, Check, Flame, Moon, Sun, Wind, 
  Compass, Gift, AlertTriangle, BookOpen, User, Calendar,
  ArrowRight, CheckCircle2, ChevronRight, Zap, Target,
  ChevronDown, ChevronUp, SlidersHorizontal, Share2, Plus,
  Trash2, Bell, BellRing, Eye, Sparkle, QrCode, RefreshCw,
  Cpu, CheckCheck, Smartphone, Layers, ShieldCheck, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { calculateWeton, calculateMatch, calculateDailyTiming, LAKUNING_MAP } from './engine/primbon';
import { CHAT_STAGES, SITUATION_MODES, getChatRecommendation, getGiftConsultation } from './engine/ronaldFrank';
import { calculateNameNumerology, calculatePersonalDay } from './engine/numerology';
import { analyzeIncomingMessage, analyzeConversationThread } from './engine/nlpCopilot';

const AuraNativeBridge = Capacitor.isNativePlatform() ? registerPlugin('AuraNativeBridge') : null;

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

  // Tab Nav: 'match' | 'numerology' | 'timing' | 'scripts' | 'wa_monitor' | 'playbook'
  const [activeTab, setActiveTab] = useState('match');

  // Script Generator State
  const [selectedStage, setSelectedStage] = useState('opener');
  const [selectedSituation, setSelectedSituation] = useState('normal');
  const [copiedText, setCopiedText] = useState(null);

  // WhatsApp & NLP Copilot States
  const [incomingChatInput, setIncomingChatInput] = useState('Hahaha iya nih, lagi capek bgt sama deadline kantor');
  const [analyzedChatResult, setAnalyzedChatResult] = useState(null);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [connectedNumber, setConnectedNumber] = useState(null);
  const [wsQR, setWsQR] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Two-Way Conversation History & Kokpit Memori
  const [conversationHistory, setConversationHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(`AURAMATCH_CHAT_HISTORY_${activeTargetId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', sender: 'target', text: 'Lagi capek bgt nih lembur terus di kantor', time: '14:02' },
      { id: '2', sender: 'user', text: 'Kelihatan banget kepalanya butuh disiram es kopi susu sore ini haha', time: '14:05' },
      { id: '3', sender: 'target', text: 'Wkwk bener bgt, mau dong!', time: '14:07' }
    ];
  });
  const [newManualReply, setNewManualReply] = useState('');
  const [threadAnalysis, setThreadAnalysis] = useState(null);

  // Native Android States & Bridge
  const [isNativeApp] = useState(Capacitor.isNativePlatform());
  const [nativePerms, setNativePerms] = useState({
    notificationListener: false,
    overlay: false,
    accessibility: false,
    isBubbleRunning: false
  });

  // Filter WhatsApp & Diagnostik Real-time
  const [monitorAllChats, setMonitorAllChats] = useState(false);
  const [customContactFilter, setCustomContactFilter] = useState('');
  const [extraFilterNames, setExtraFilterNames] = useState(() => {
    try {
      const s = localStorage.getItem('AURAMATCH_EXTRA_FILTERS');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [diagnosticInfo, setDiagnosticInfo] = useState({
    lastContact: '-',
    lastMessage: '-',
    lastTimestamp: 0,
    lastFilterPassed: false,
    isAccessibilityEnabled: false,
    isNotificationEnabled: false,
    isBubbleRunning: false
  });

  // Sinkronisasi Native Android Bridge jika berjalan di HP
  useEffect(() => {
    if (Capacitor.isNativePlatform() && AuraNativeBridge) {
      const checkAllPerms = async () => {
        try {
          const res = await AuraNativeBridge.checkPermissions();
          if (res) setNativePerms(res);
        } catch (e) {
          console.error("Native perms check failed:", e);
        }
      };

      checkAllPerms();

      const listenerPromise = AuraNativeBridge.addListener('onWhatsAppChatEvent', (event) => {
        if (!event || !event.text) return;
        const now = new Date(event.timestamp || Date.now());
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const newMsg = {
          id: `native-${event.timestamp || Date.now()}`,
          sender: event.role === 'user' ? 'user' : 'target',
          text: event.text.trim(),
          time: timeStr
        };

        setConversationHistory(prev => {
          if (prev.length > 0 && prev[prev.length - 1].text === event.text.trim()) {
            return prev;
          }
          return [...prev, newMsg];
        });

        if (event.role !== 'user') {
          setIncomingChatInput(event.text.trim());
        }
      });

      return () => {
        listenerPromise.then(h => h.remove?.()).catch(() => {});
      };
    }
  }, []);

  // Polling Diagnostik Pemindai WhatsApp Real-Time
  useEffect(() => {
    if (Capacitor.isNativePlatform() && AuraNativeBridge && activeTab === 'wa_copilot') {
      const pollDiag = async () => {
        try {
          const diag = await AuraNativeBridge.getDiagnosticStatus();
          if (diag) {
            setDiagnosticInfo(diag);
            if (diag.monitorAll !== undefined) setMonitorAllChats(diag.monitorAll);
          }
        } catch {}
      };
      pollDiag();
      const interval = setInterval(pollDiag, 2000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Sinkronkan daftar nama target CRM + Filter Tambahan ke modul Native Android
  useEffect(() => {
    try {
      localStorage.setItem('AURAMATCH_EXTRA_FILTERS', JSON.stringify(extraFilterNames));
    } catch {}

    if (Capacitor.isNativePlatform() && AuraNativeBridge) {
      const targetNames = [
        ...targets.map(t => t.name).filter(Boolean),
        ...extraFilterNames
      ];
      AuraNativeBridge.updateTargetWhitelist({ targets: targetNames }).catch(() => {});
    }
  }, [targets, extraFilterNames]);

  const handleOpenNativeSetting = async (type) => {
    if (AuraNativeBridge) {
      try {
        await AuraNativeBridge.openPermissionSettings({ type });
        setTimeout(async () => {
          try {
            const res = await AuraNativeBridge.checkPermissions();
            if (res) setNativePerms(res);
          } catch {}
        }, 1500);
      } catch (e) {
        console.error("Open setting failed:", e);
      }
    }
  };

  const handleToggleFloatingBubble = async () => {
    if (AuraNativeBridge) {
      try {
        const res = await AuraNativeBridge.toggleFloatingBubble();
        if (res) {
          setNativePerms(prev => ({ ...prev, isBubbleRunning: res.isBubbleRunning }));
        }
      } catch (e) {
        console.error("Toggle bubble failed:", e);
      }
    }
  };

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

  // Evaluasi awal NLP Copilot
  useEffect(() => {
    if (incomingChatInput && targetWeton && numerologyData && personalDayData) {
      const analysis = analyzeIncomingMessage(incomingChatInput, targetWeton, numerologyData, personalDayData);
      setAnalyzedChatResult(analysis);
    }
  }, [incomingChatInput, targetWeton, numerologyData, personalDayData]);

  // Sinkronisasi memori chat per target
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`AURAMATCH_CHAT_HISTORY_${activeTargetId}`);
      if (saved) {
        setConversationHistory(JSON.parse(saved));
      } else {
        setConversationHistory([
          { id: '1', sender: 'target', text: 'Lagi capek bgt nih lembur terus di kantor', time: '14:02' },
          { id: '2', sender: 'user', text: 'Kelihatan banget kepalanya butuh disiram es kopi susu sore ini haha', time: '14:05' },
          { id: '3', sender: 'target', text: 'Wkwk bener bgt, mau dong!', time: '14:07' }
        ]);
      }
    } catch {}
  }, [activeTargetId]);

  useEffect(() => {
    try {
      localStorage.setItem(`AURAMATCH_CHAT_HISTORY_${activeTargetId}`, JSON.stringify(conversationHistory));
    } catch {}
  }, [conversationHistory, activeTargetId]);

  // Evaluasi Utuh Dua Arah (Two-Way Context & Investment Ratio)
  useEffect(() => {
    if (conversationHistory.length > 0 && targetWeton && numerologyData && personalDayData) {
      const res = analyzeConversationThread(conversationHistory, targetWeton, numerologyData, personalDayData);
      setThreadAnalysis(res);
    }
  }, [conversationHistory, targetWeton, numerologyData, personalDayData]);

  // WebSocket & HTTP Fallback Polling ke WhatsApp Server Lokal (port 4000)
  useEffect(() => {
    let ws = null;
    try {
      ws = new WebSocket('ws://localhost:4000');
      ws.onopen = () => {
        setIsWsConnected(true);
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'qr') {
            setWsQR(data.qr);
          } else if (data.type === 'status') {
            setIsWsConnected(data.isConnected);
            if (data.userNumber) setConnectedNumber(data.userNumber);
            if (data.isConnected) setWsQR(null);
          } else if (data.type === 'new_message') {
            setIncomingChatInput(data.text);
          }
        } catch {}
      };
      ws.onerror = () => {
        setIsWsConnected(false);
      };
      ws.onclose = () => {
        setIsWsConnected(false);
      };
    } catch {
      setIsWsConnected(false);
    }

    // Polling HTTP Fallback (Menembus blokir Mixed Content / HTTPS di Vercel)
    const pollServer = async () => {
      try {
        const res = await fetch('http://localhost:4000/status');
        if (res.ok) {
          const data = await res.json();
          setIsWsConnected(data.isConnected);
          if (data.userNumber) setConnectedNumber(data.userNumber);
          if (data.qr) setWsQR(data.qr);
          if (data.lastIncomingMessage && data.lastIncomingMessage.text) {
            setIncomingChatInput(data.lastIncomingMessage.text);
          }
        }
      } catch {
        // server offline
      }
    };

    pollServer();
    const pollInterval = setInterval(pollServer, 3000);

    return () => {
      if (ws) ws.close();
      clearInterval(pollInterval);
    };
  }, []);

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

  // Trigger Native / Web Notification
  const handleRequestNotification = async () => {
    if (Capacitor.isNativePlatform() && AuraNativeBridge) {
      try {
        await AuraNativeBridge.showNotification({
          title: `🔮 AuraMatch Wingman: Golden Hour ${activeTarget.name}!`,
          body: `Sekarang waktu terbaik mengirim pesan Hook ke ${activeTarget.name}. Karakter ${targetWeton ? targetWeton.lakuning.archetype : 'Lakuning'}-nya sedang santai & terbuka!`
        });
        setNotificationToast(`Notifikasi Alarm Jam Emas berhasil dikirim ke status bar HP Anda!`);
        setTimeout(() => setNotificationToast(null), 4000);
        return;
      } catch (err) {
        console.error("Native notification failed:", err);
      }
    }

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
                  Primbon x WA Copilot
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Target CRM, NLP Sentiment & Dating Copilot
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'match' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> 1. Karakter & Jodoh
          </button>
          
          <button 
            onClick={() => setActiveTab('numerology')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'numerology' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkle className="w-3.5 h-3.5" /> 2. Numerologi
          </button>

          <button 
            onClick={() => setActiveTab('timing')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'timing' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> 3. Radar Jam
          </button>

          <button 
            onClick={() => setActiveTab('scripts')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'scripts' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> 4. Amunisi Chat
          </button>

          <button 
            onClick={() => setActiveTab('wa_copilot')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'wa_copilot' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" /> 5. WA Copilot & NLP
          </button>

          <button 
            onClick={() => setActiveTab('playbook')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'playbook' 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> 6. Playbook
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
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-cyan-300 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-cyan-400" /> Soul Urge (Hasrat Rahasia Batin)
                  </span>
                  <h4 className="font-bold text-white text-xs">{numerologyData.soul.title}</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{numerologyData.soul.craving}</p>
                  <p className="text-cyan-200 text-[11px] pt-1"><strong>Tips Pikat:</strong> {numerologyData.soul.flirtTip}</p>
                </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {/* ================= TAB 4: AMUNISI CHAT ================= */}
        {activeTab === 'scripts' && scriptData && (
          <div className="space-y-4">
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

            {scriptData.modifierNote && (
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200">
                <strong>Catatan Taktis:</strong> {scriptData.modifierNote}
              </div>
            )}

            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300">
              {scriptData.dangerAlert}
            </div>

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

        {/* ================= TAB 5: WA COPILOT & TWO-WAY CONTEXT (UPGRADED!) ================= */}
        {activeTab === 'wa_copilot' && (
          <div className="space-y-4">
            {/* Panel Native Android Wingman (Dua Arah & Floating Bubble) */}
            <div className="glass-panel p-4 rounded-2xl border border-violet-500/30 bg-violet-950/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 flex-shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Android Wingman 2 Arah</span>
                      <span className="text-[9px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">
                        {isNativeApp ? 'Mode Native HP' : 'Tersedia di APK'}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Merekam otomatis pesan masuk gebetan & balasan keluar Anda untuk rasio investasi kata
                    </p>
                  </div>
                </div>

                {isNativeApp && (
                  <button
                    onClick={handleToggleFloatingBubble}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all ${
                      nativePerms.isBubbleRunning 
                        ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                        : 'bg-violet-600 hover:bg-violet-500 text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{nativePerms.isBubbleRunning ? 'Tutup Bubble' : 'Aktifkan Bubble'}</span>
                  </button>
                )}
              </div>

              {/* Status Izin Native Android */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Notifikasi WhatsApp</span>
                    <span className={`text-xs font-bold ${nativePerms.notificationListener ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {nativePerms.notificationListener ? 'Aktif' : 'Perlu Izin'}
                    </span>
                  </div>
                  {isNativeApp && !nativePerms.notificationListener && (
                    <button
                      onClick={() => handleOpenNativeSetting('notification')}
                      className="text-[10px] px-2 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white"
                    >
                      Buka Izin
                    </button>
                  )}
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Baca Chat 2 Arah</span>
                    <span className={`text-xs font-bold ${nativePerms.accessibility ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {nativePerms.accessibility ? 'Aktif' : 'Aksesibilitas'}
                    </span>
                  </div>
                  {isNativeApp && !nativePerms.accessibility && (
                    <button
                      onClick={() => handleOpenNativeSetting('accessibility')}
                      className="text-[10px] px-2 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white"
                    >
                      Buka Izin
                    </button>
                  )}
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Gelembung Melayang</span>
                    <span className={`text-xs font-bold ${nativePerms.overlay ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {nativePerms.overlay ? 'Diizinkan' : 'Overlay Pop-up'}
                    </span>
                  </div>
                  {isNativeApp && !nativePerms.overlay && (
                    <button
                      onClick={() => handleOpenNativeSetting('overlay')}
                      className="text-[10px] px-2 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white"
                    >
                      Buka Izin
                    </button>
                  )}
                </div>
              </div>

              {/* Pusat Kontrol Filter Percakapan & Live Scanner */}
              <div className="bg-[#120d20] border border-violet-500/40 p-3.5 sm:p-4 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <h5 className="text-xs font-bold text-white">Filter Percakapan WhatsApp yang Dipantau</h5>
                  </div>

                  {/* Mode Saklar Toggle */}
                  <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/10">
                    <button
                      onClick={async () => {
                        setMonitorAllChats(false);
                        if (Capacitor.isNativePlatform() && AuraNativeBridge) {
                          await AuraNativeBridge.setMonitorAllChats({ allowAll: false });
                        }
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                        !monitorAllChats ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Target Tertentu
                    </button>
                    <button
                      onClick={async () => {
                        setMonitorAllChats(true);
                        if (Capacitor.isNativePlatform() && AuraNativeBridge) {
                          await AuraNativeBridge.setMonitorAllChats({ allowAll: true });
                        }
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                        monitorAllChats ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Membaca chat apapun yang Anda buka di layar WhatsApp"
                    >
                      Pantau Chat Aktif (Testing)
                    </button>
                  </div>
                </div>

                {/* Penjelasan Mode */}
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {monitorAllChats ? (
                    <span className="text-emerald-300">
                      ⚡ <strong>Mode Pantau Chat Aktif Nyala:</strong> AuraMatch akan otomatis membaca obrolan siapa pun yang saat ini sedang Anda buka di layar WhatsApp untuk pengujian.
                    </span>
                  ) : (
                    <span>
                      🛡️ <strong>Mode Target Tertentu Nyala:</strong> Aplikasi <em>hanya</em> membaca percakapan jika nama kontak di WhatsApp cocok dengan daftar di bawah. Semua chat lain diblokir demi privasi.
                    </span>
                  )}
                </p>

                {/* Form Tambah Nama Kontak WhatsApp Khusus */}
                {!monitorAllChats && (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customContactFilter}
                        onChange={(e) => setCustomContactFilter(e.target.value)}
                        placeholder="Ketik nama kontak di WA Anda (cth: Dian, Ayang, +628...)"
                        className="w-full bg-[#18122c] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (!customContactFilter.trim()) return;
                          const name = customContactFilter.trim();
                          if (!extraFilterNames.includes(name)) {
                            setExtraFilterNames(prev => [...prev, name]);
                          }
                          setCustomContactFilter('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex-shrink-0"
                      >
                        + Tambah Filter
                      </button>
                    </div>

                    {/* Chips Kontak yang Di-Whitelist */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 self-center mr-1">
                        Daftar Terpantau:
                      </span>
                      {[...targets.map(t => t.name), ...extraFilterNames].map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-white/10 text-slate-200 border border-white/15 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1"
                        >
                          <Target className="w-2.5 h-2.5 text-fuchsia-400" />
                          <span>{item}</span>
                          {extraFilterNames.includes(item) && (
                            <button
                              onClick={() => setExtraFilterNames(prev => prev.filter(x => x !== item))}
                              className="text-slate-400 hover:text-rose-400 ml-0.5"
                            >
                              &times;
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* LIVE DIAGNOSTIK KOTAK MONITOR REALTIME */}
                <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-white/10 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Diagnostik Layar WhatsApp Real-Time:
                    </span>
                    <button
                      onClick={() => handleOpenNativeSetting('accessibility')}
                      className="text-[10px] text-violet-400 hover:underline"
                    >
                      Buka Izin Aksesibilitas
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400">Layanan Aksesibilitas: </span>
                      <strong className={nativePerms.accessibility ? 'text-emerald-400' : 'text-rose-400'}>
                        {nativePerms.accessibility ? '✅ AKTIF (Bisa Baca Layar)' : '⚠️ NONAKTIF (Ketuk Buka Izin)'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400">Kontak di Layar WA: </span>
                      <strong className="text-white">{diagnosticInfo.lastContact || '-'}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400">Status Filter: </span>
                      <strong className={diagnosticInfo.lastFilterPassed ? 'text-emerald-400' : 'text-amber-400'}>
                        {diagnosticInfo.lastFilterPassed ? '✅ Diterima & Diproses' : '🛑 Diabaikan (Bukan Target)'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400">Pesan Terakhir Ditangkap: </span>
                      <span className="text-slate-300 italic truncate block">"{diagnosticInfo.lastMessage || 'Menunggu pesan...'}"</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Status Koneksi WhatsApp Web */}
            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isWsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Status WhatsApp: {isWsConnected ? `Terhubung (${connectedNumber || 'Live'})` : 'Mode Co-Pilot Manual (Server Standby)'}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowQRModal(!showQRModal)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{wsQR ? 'Tampilkan QR Code' : 'Scan WA Web'}</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isWsConnected 
                  ? `Sistem aktif memonitor pesan masuk dari ${activeTarget.name}. Setiap ada balasan baru, NLP akan membedah emosinya secara otomatis.`
                  : `Anda bisa menghubungkan WhatsApp Web melalui QR scan, atau gunakan Kokpit Memori 2 Arah di bawah untuk merekam obrolan dan mendapatkan rekomendasi cerdas.`}
              </p>
            </div>

            {/* Modal QR Code */}
            {showQRModal && (
              <div className="glass-panel-glow p-4 sm:p-5 rounded-2xl border border-emerald-500/30 text-center space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-emerald-400">Scan QR Code dengan WhatsApp di HP</h4>
                <p className="text-[11px] text-slate-300">
                  Buka WhatsApp di HP &gt; Menu Titik Tiga / Pengaturan &gt; <strong>Perangkat Tertaut</strong> &gt; Tautkan Perangkat.
                </p>

                {wsQR ? (
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl max-w-[240px] mx-auto shadow-lg">
                    <img src={wsQR} alt="WhatsApp QR Code" className="w-[200px] h-[200px] object-contain" />
                    <span className="text-[10px] text-slate-700 font-semibold mt-1">Arahkan kamera WA ke sini</span>
                  </div>
                ) : (
                  <div className="bg-black/40 p-4 rounded-xl max-w-sm mx-auto border border-white/10 text-xs text-amber-300 space-y-2">
                    <p>💡 <strong>Server WhatsApp Lokal Sedang Berjalan:</strong></p>
                    <p className="text-[11px] text-slate-200">
                      Anda bisa membuka halaman scan langsung di browser laptop Anda:
                    </p>
                    <a
                      href="http://localhost:4000/scan"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Buka http://localhost:4000/scan
                    </a>
                    <p className="text-[10px] text-slate-400 pt-1">
                      (Atau lihat QR Code yang tercetak langsung di jendela PowerShell Anda)
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-white/10 text-xs text-slate-300 hover:text-white"
                >
                  Tutup Jendela
                </button>
              </div>
            )}

            {/* KOKPIT MEMORI 2 ARAH: METERAN INVESTASI KATA & TANGGA ESKALASI */}
            {threadAnalysis && (
              <div className="glass-panel-glow p-4 sm:p-5 rounded-2xl border border-emerald-500/30 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Konteks Percakapan 2 Arah</span>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>{userProfile.name}</span>
                      <span className="text-slate-400">&harr;</span>
                      <span className="text-emerald-400">{activeTarget.name}</span>
                    </h3>
                  </div>

                  {/* Tangga Eskalasi */}
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Status PDKT Funnel</span>
                    <span className="text-xs font-bold text-fuchsia-300">{threadAnalysis.escalationLabel}</span>
                  </div>
                </div>

                {/* Progress Bar Eskalasi */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Progress Menuju Kencan Nyata:</span>
                    <span className="font-bold text-emerald-400">{threadAnalysis.escalationProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${threadAnalysis.escalationProgress}%` }}
                    />
                  </div>
                </div>

                {/* Meteran Rasio Investasi Kata (Ronald Frank Law) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-slate-400 block">Kata Diketik Kamu</span>
                    <span className="text-base font-bold text-blue-300">{threadAnalysis.userWords} kata</span>
                  </div>

                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-slate-400 block">Kata Diketik {activeTarget.name}</span>
                    <span className="text-base font-bold text-fuchsia-300">{threadAnalysis.targetWords} kata</span>
                  </div>

                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 block">Rasio Investasi</span>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-base font-bold text-white">{threadAnalysis.ratio}x</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${threadAnalysis.ratioBadge}`}>
                        {threadAnalysis.ratioStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl text-xs leading-relaxed border ${threadAnalysis.ratioBadge}`}>
                  {threadAnalysis.ratioMessage}
                </div>
              </div>
            )}

            {/* THREAD CHAT 2 ARAH (WhatsApp Style Timeline) */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" /> Riwayat Percakapan yang Terekam:
                </h4>
                <button
                  onClick={() => {
                    if (confirm('Bersihkan riwayat percakapan untuk target ini?')) {
                      setConversationHistory([]);
                    }
                  }}
                  className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Reset Thread
                </button>
              </div>

              {/* Chat Stream Bubble List */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 no-scrollbar">
                {conversationHistory.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 italic">
                    Belum ada riwayat chat. Masukkan pesan dari {activeTarget.name} di bawah untuk memulai!
                  </div>
                ) : (
                  conversationHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[9px] text-slate-500 mb-0.5 px-1">
                        {chat.sender === 'user' ? 'Kamu' : activeTarget.name} &bull; {chat.time}
                      </div>
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                          chat.sender === 'user'
                            ? 'bg-emerald-900/40 text-emerald-100 rounded-tr-sm border border-emerald-500/30'
                            : 'bg-[#211a38] text-slate-100 rounded-tl-sm border border-white/10'
                        }`}
                      >
                        "{chat.text}"
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Tambah Pesan Manual Cepat */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={incomingChatInput}
                    onChange={(e) => setIncomingChatInput(e.target.value)}
                    placeholder={`Pesan baru dari ${activeTarget.name}...`}
                    className="w-full bg-[#140f24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                  />
                  <button
                    onClick={() => {
                      if (!incomingChatInput.trim()) return;
                      const newMsg = {
                        id: String(Date.now()),
                        sender: 'target',
                        text: incomingChatInput.trim(),
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      };
                      setConversationHistory(prev => [...prev, newMsg]);
                      setIncomingChatInput('');
                    }}
                    className="px-3 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-semibold flex-shrink-0"
                  >
                    + Catat Dia
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newManualReply}
                    onChange={(e) => setNewManualReply(e.target.value)}
                    placeholder="Catat pesan yang kamu kirim..."
                    className="w-full bg-[#140f24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => {
                      if (!newManualReply.trim()) return;
                      const newMsg = {
                        id: String(Date.now()),
                        sender: 'user',
                        text: newManualReply.trim(),
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      };
                      setConversationHistory(prev => [...prev, newMsg]);
                      setNewManualReply('');
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex-shrink-0"
                  >
                    + Catat Kamu
                  </button>
                </div>
              </div>
            </div>

            {/* HASIL ANALISA NLP & 3 REKOMENDASI BALASAN CERDAS */}
            {threadAnalysis && (
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center justify-between">
                  <span>3 Rekomendasi Balasan Memikat Berdasarkan Alur Chat</span>
                  <span className="text-[10px] text-slate-400 font-normal">Klik untuk salin & simpan</span>
                </h4>

                <div className="space-y-3">
                  {threadAnalysis.replies.map((reply, rIdx) => (
                    <div
                      key={rIdx}
                      className="glass-panel-glow p-4 rounded-2xl border border-white/10 space-y-2.5 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {reply.category}
                        </span>
                        
                        <button
                          onClick={() => {
                            handleCopy(reply.text, `thread_${rIdx}`);
                            // Catat otomatis ke memori sebagai balasan kamu!
                            const newReply = {
                              id: String(Date.now()),
                              sender: 'user',
                              text: reply.text,
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            };
                            setConversationHistory(prev => [...prev, newReply]);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            copiedText === `thread_${rIdx}`
                              ? 'bg-emerald-500 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          }`}
                        >
                          {copiedText === `thread_${rIdx}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedText === `thread_${rIdx}` ? 'Disalin & Dicatat!' : 'Salin & Catat Balasan'}</span>
                        </button>
                      </div>

                      {/* WhatsApp-Style Bubble */}
                      <div className="bg-[#19132c] p-3.5 rounded-2xl rounded-tl-sm border border-white/10 text-xs sm:text-sm text-slate-100 italic leading-relaxed">
                        "{reply.text}"
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span><strong>Alasan Psikologis:</strong> {reply.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 6: PLAYBOOK ================= */}
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
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'match'
              ? 'text-fuchsia-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${activeTab === 'match' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[8px] mt-0.5">Jodoh</span>
        </button>

        <button
          onClick={() => setActiveTab('numerology')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'numerology'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkle className={`w-4 h-4 ${activeTab === 'numerology' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[8px] mt-0.5">Numerologi</span>
        </button>

        <button
          onClick={() => setActiveTab('timing')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'timing'
              ? 'text-fuchsia-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className={`w-4 h-4 ${activeTab === 'timing' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[8px] mt-0.5">Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('scripts')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'scripts'
              ? 'text-fuchsia-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className={`w-4 h-4 ${activeTab === 'scripts' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[8px] mt-0.5">Amunisi</span>
        </button>

        <button
          onClick={() => setActiveTab('wa_copilot')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'wa_copilot'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className={`w-4 h-4 ${activeTab === 'wa_copilot' ? 'stroke-[2.5] text-emerald-400 animate-pulse' : ''}`} />
          <span className="text-[8px] mt-0.5">WA Copilot</span>
        </button>

        <button
          onClick={() => setActiveTab('playbook')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'playbook'
              ? 'text-fuchsia-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeTab === 'playbook' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[8px] mt-0.5">Playbook</span>
        </button>
      </nav>

      {/* FOOTER DESKTOP */}
      <footer className="hidden md:block mt-auto border-t border-white/5 py-3 text-center text-[11px] text-slate-500">
        <p>AuraMatch &bull; Mengintegrasikan Primbon Jawa, Numerologi Pythagoras, & Seni Psikologi Ronald Frank</p>
      </footer>
    </div>
  );
}
