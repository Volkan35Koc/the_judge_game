import React, { useState, useEffect, useRef } from 'react';
import { CaseData, GamePhase, ChatMessage, SpeakerRole, VerdictResult, EvaluationResult, Evidence } from './types';
import { generateCase, askCharacter, evaluateVerdict } from './services/geminiService';
import { CaseFile } from './components/CaseFile';
import { TrialLog } from './components/TrialLog';
import { Button } from './components/Button';
import { CourtroomScene } from './components/CourtroomScene';
import { TypewriterText } from './components/TypewriterText';
import { Gavel, Scale, BookOpen, History, User, ChevronRight, Fingerprint, FolderSearch, X, Trophy, Settings, Volume2, Sun, Play, RotateCcw, Menu, LogOut, RefreshCw, Save, Book, Lightbulb, CheckCircle, Music, Users, Hammer } from 'lucide-react';
import { t } from './utils/translations';

// Audio Resources
const SOUNDS = {
  GAVEL: 'https://assets.mixkit.co/sfx/preview/mixkit-court-gavel-hit-2297.mp3',
  AMBIENCE: 'https://assets.mixkit.co/sfx/preview/mixkit-office-ambience-2453.mp3', 
  PAPER: 'https://assets.mixkit.co/sfx/preview/mixkit-paper-shuffle-1538.mp3',
  THEME: 'https://assets.mixkit.co/music/preview/mixkit-investigation-and-mystery-234.mp3', 
  TENSION: 'https://assets.mixkit.co/music/preview/mixkit-suspense-mystery-598.mp3' 
};

// Storage Keys
const STORAGE_KEYS = {
  CASE_COUNT: 'judge_case_count',
  SETTINGS_AUDIO: 'judge_settings_audio_v3', // Incremented version to ensure clean slate for new object structure
  SETTINGS_BRIGHTNESS: 'judge_settings_brightness',
  SAVE_DATA: 'judge_save_data', 
  SAVE_LOGS: 'judge_save_logs', 
  SAVE_PHASE: 'judge_save_phase',
  SAVE_NOTEBOOK: 'judge_save_notebook'
};

interface AudioSettings {
  music: number;
  ambience: number;
  sfx: number;
}

// --- ISOLATED SETTINGS COMPONENT ---
interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  audioSettings: AudioSettings;
  setAudioSettings: (s: AudioSettings) => void;
  brightness: number;
  setBrightness: (v: number) => void;
  phase: GamePhase;
  onContinue: () => void;
  onSave: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  show, onClose, audioSettings, setAudioSettings, brightness, setBrightness, phase, onContinue, onSave, onRestart, onQuit 
}) => {
  if (!show) return null;

  const handleAudioChange = (key: keyof AudioSettings, value: number) => {
    setAudioSettings({ ...audioSettings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-justice-800 p-6 md:p-8 rounded-lg border-4 border-double border-accent-gold w-full max-w-sm shadow-2xl relative wood-texture">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-justice-300 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-serif font-bold text-accent-gold mb-6 flex items-center justify-center gap-2 border-b border-justice-600 pb-4">
          <Settings className="w-6 h-6" /> {t.settings}
        </h2>

        <div className="space-y-6">
          {/* Game Actions (Only in Game) */}
          {phase !== GamePhase.MENU && (
            <div className="space-y-3 pb-6 border-b border-justice-600">
               <Button onClick={onContinue} className="w-full" variant="gold">
                 <Play className="w-4 h-4 mr-2 inline" /> {t.continueGame}
               </Button>
               <Button onClick={onSave} className="w-full" variant="primary">
                 <Save className="w-4 h-4 mr-2 inline" /> {t.saveGame}
               </Button>
               <Button onClick={onRestart} className="w-full" variant="secondary">
                 <RefreshCw className="w-4 h-4 mr-2 inline" /> {t.restartCase}
               </Button>
            </div>
          )}

          {/* Volume Mixer */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-justice-400 font-bold mb-2 flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> {t.volume}
            </h3>
            
            {/* Music */}
            <div>
              <label className="flex items-center justify-between text-xs text-justice-200 mb-1">
                <span className="flex items-center gap-2"><Music className="w-3 h-3" /> {t.volMusic}</span>
                <span className="text-accent-gold">{Math.round(audioSettings.music * 100)}%</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={audioSettings.music}
                onChange={(e) => handleAudioChange('music', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-justice-900 rounded-lg appearance-none cursor-pointer accent-accent-gold"
              />
            </div>

            {/* Ambience */}
            <div>
              <label className="flex items-center justify-between text-xs text-justice-200 mb-1">
                <span className="flex items-center gap-2"><Users className="w-3 h-3" /> {t.volAmbience}</span>
                <span className="text-accent-gold">{Math.round(audioSettings.ambience * 100)}%</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={audioSettings.ambience}
                onChange={(e) => handleAudioChange('ambience', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-justice-900 rounded-lg appearance-none cursor-pointer accent-accent-gold"
              />
            </div>

            {/* SFX */}
            <div>
              <label className="flex items-center justify-between text-xs text-justice-200 mb-1">
                <span className="flex items-center gap-2"><Hammer className="w-3 h-3" /> {t.volSfx}</span>
                <span className="text-accent-gold">{Math.round(audioSettings.sfx * 100)}%</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={audioSettings.sfx}
                onChange={(e) => handleAudioChange('sfx', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-justice-900 rounded-lg appearance-none cursor-pointer accent-accent-gold"
              />
            </div>
          </div>

          {/* Brightness */}
          <div className="pt-2 border-t border-justice-600/50">
            <label className="flex items-center justify-between text-xs uppercase tracking-wide text-justice-100 mb-2 font-bold">
              <span className="flex items-center gap-2"><Sun className="w-4 h-4" /> {t.brightness}</span>
              <span className="text-accent-gold">{brightness}%</span>
            </label>
            <input 
              type="range" min="50" max="150" step="5" 
              value={brightness}
              onChange={(e) => setBrightness(parseFloat(e.target.value))}
              className="w-full h-2 bg-justice-900 rounded-lg appearance-none cursor-pointer accent-accent-gold"
            />
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-justice-600 space-y-3">
          {phase !== GamePhase.MENU ? (
            <Button onClick={onQuit} className="w-full" variant="danger">
              <LogOut className="w-4 h-4 mr-2 inline" /> {t.menu}
            </Button>
          ) : (
            <Button onClick={onClose} className="w-full" variant="secondary">
              {t.close}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  // --- Global Settings State ---
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS_AUDIO);
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        // Robust check: if legacy number format or missing keys, reset to default
        if (typeof parsed === 'object' && 'music' in parsed && 'ambience' in parsed && 'sfx' in parsed) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse audio settings", e);
    }
    return { music: 0.6, ambience: 0.5, sfx: 0.8 }; 
  });

  const [brightness, setBrightness] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS_BRIGHTNESS);
    return saved ? parseFloat(saved) : 100;
  });
  const [showSettings, setShowSettings] = useState(false);

  // --- Game State ---
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [logs, setLogs] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showCourtRecord, setShowCourtRecord] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false); 
  
  // Progression State
  const [caseCount, setCaseCount] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASE_COUNT);
    return saved ? parseInt(saved, 10) : 1;
  });

  // Notebook State
  const [notebookContent, setNotebookContent] = useState<string>("");
  const [showNotebook, setShowNotebook] = useState(false);

  // Interaction State
  const [questionText, setQuestionText] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [isEvidenceSelectorOpen, setIsEvidenceSelectorOpen] = useState(false);
  
  // Visual Feedback State
  const [animatingEvidence, setAnimatingEvidence] = useState<Evidence | null>(null);
  const [gavelAnimation, setGavelAnimation] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [verdictInput, setVerdictInput] = useState<VerdictResult>({ verdict: 'Not Guilty', reasoning: '', sentence: '' });
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Animation State
  const [displayRole, setDisplayRole] = useState<SpeakerRole | null>(null);
  const [displaySpeaker, setDisplaySpeaker] = useState<string>("");
  const [displayText, setDisplayText] = useState<string>("");
  const [isTextTyping, setIsTextTyping] = useState(false);

  // Audio Refs
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const gavelRef = useRef<HTMLAudioElement | null>(null);
  const paperRef = useRef<HTMLAudioElement | null>(null);
  const themeRef = useRef<HTMLAudioElement | null>(null);
  const tensionRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);

  // --- SAVE / LOAD SYSTEM ---

  const hasSaveGame = () => {
    return !!localStorage.getItem(STORAGE_KEYS.SAVE_DATA);
  };

  const loadGame = () => {
    try {
      const savedCase = localStorage.getItem(STORAGE_KEYS.SAVE_DATA);
      const savedLogs = localStorage.getItem(STORAGE_KEYS.SAVE_LOGS);
      const savedPhase = localStorage.getItem(STORAGE_KEYS.SAVE_PHASE);
      const savedNotebook = localStorage.getItem(STORAGE_KEYS.SAVE_NOTEBOOK);

      if (savedCase && savedLogs && savedPhase) {
        const parsedCase = JSON.parse(savedCase);
        const parsedLogs = JSON.parse(savedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));

        setCaseData(parsedCase);
        setLogs(parsedLogs);
        setPhase(savedPhase as GamePhase);
        if (savedNotebook) setNotebookContent(savedNotebook);
        
        if (parsedLogs.length > 0) {
          const lastLog = parsedLogs[parsedLogs.length - 1];
          setDisplayRole(lastLog.role);
          setDisplaySpeaker(lastLog.speakerName);
          setDisplayText(lastLog.text);
          setIsTextTyping(false); 
        }
        return true;
      }
    } catch (e) {
      console.error("Failed to load save game:", e);
      clearSave();
    }
    return false;
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const saveCurrentGame = (silent = false) => {
    if (caseData && (phase === GamePhase.TRIAL || phase === GamePhase.VERDICT)) {
      localStorage.setItem(STORAGE_KEYS.SAVE_DATA, JSON.stringify(caseData));
      localStorage.setItem(STORAGE_KEYS.SAVE_LOGS, JSON.stringify(logs));
      localStorage.setItem(STORAGE_KEYS.SAVE_PHASE, phase);
      localStorage.setItem(STORAGE_KEYS.SAVE_NOTEBOOK, notebookContent);
      if (!silent) showNotification("Oyun Kaydedildi");
      setShowSettings(false);
    }
  };

  const clearSave = () => {
    localStorage.removeItem(STORAGE_KEYS.SAVE_DATA);
    localStorage.removeItem(STORAGE_KEYS.SAVE_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SAVE_PHASE);
    localStorage.removeItem(STORAGE_KEYS.SAVE_NOTEBOOK);
    setNotebookContent("");
  };

  // --- Audio Logic ---

  const updateVolumes = (settings: AudioSettings) => {
    if(ambienceRef.current) ambienceRef.current.volume = Math.min(settings.ambience * 0.5, 1);
    if(gavelRef.current) gavelRef.current.volume = settings.sfx;
    if(paperRef.current) paperRef.current.volume = settings.sfx;
    if(themeRef.current) themeRef.current.volume = Math.min(settings.music * 0.6, 1);
    if(tensionRef.current) tensionRef.current.volume = Math.min(settings.music * 0.5, 1);
  };

  useEffect(() => {
    const createAudio = (src: string, loop: boolean = false) => {
      const audio = new Audio(src);
      audio.loop = loop;
      audio.preload = 'auto'; 
      return audio;
    };

    gavelRef.current = createAudio(SOUNDS.GAVEL);
    paperRef.current = createAudio(SOUNDS.PAPER);
    ambienceRef.current = createAudio(SOUNDS.AMBIENCE, true);
    themeRef.current = createAudio(SOUNDS.THEME, true);
    tensionRef.current = createAudio(SOUNDS.TENSION, true);

    updateVolumes(audioSettings);

    const unlockAudio = () => {
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        // Resume correct track based on phase
        if (phase === GamePhase.MENU) {
          themeRef.current?.play().catch(() => {});
        } else if (phase === GamePhase.TRIAL || phase === GamePhase.VERDICT) {
          tensionRef.current?.play().catch(() => {});
          ambienceRef.current?.play().catch(() => {});
        }
      }
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      ambienceRef.current?.pause();
      themeRef.current?.pause();
      tensionRef.current?.pause();
    };
  }, []); // Only run once on mount

  // Separate effect for volume updates to avoid re-initializing audios
  useEffect(() => {
    updateVolumes(audioSettings);
    localStorage.setItem(STORAGE_KEYS.SETTINGS_AUDIO, JSON.stringify(audioSettings));
  }, [audioSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS_BRIGHTNESS, brightness.toString());
  }, [brightness]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASE_COUNT, caseCount.toString());
  }, [caseCount]);

  useEffect(() => {
    const manageAudio = async () => {
      themeRef.current?.pause();
      tensionRef.current?.pause();
      ambienceRef.current?.pause();

      try {
        if (phase === GamePhase.MENU) {
          if (hasInteractedRef.current) {
             if(themeRef.current) themeRef.current.currentTime = 0;
             await themeRef.current?.play();
          }
        } else if (phase === GamePhase.TRIAL || phase === GamePhase.VERDICT) {
          if (hasInteractedRef.current) {
            await tensionRef.current?.play();
            await ambienceRef.current?.play();
          }
        } else if (phase === GamePhase.EVALUATION) {
           if (hasInteractedRef.current) await ambienceRef.current?.play();
        }
      } catch (e) {
        console.warn("Audio playback blocked.");
      }
    };
    manageAudio();
  }, [phase]);

  // --- Helpers ---

  const playClick = () => {
    if (paperRef.current) {
      paperRef.current.currentTime = 0;
      paperRef.current.volume = audioSettings.sfx;
      paperRef.current.play().catch(() => {});
    }
  };

  const playGavel = () => {
    setGavelAnimation(true);
    if (gavelRef.current) {
      gavelRef.current.currentTime = 0;
      gavelRef.current.volume = audioSettings.sfx;
      gavelRef.current.play().catch(() => {});
    }
    setTimeout(() => setGavelAnimation(false), 300);
  };

  const playPaper = () => {
    if (paperRef.current) {
      paperRef.current.currentTime = 0;
      paperRef.current.volume = audioSettings.sfx;
      paperRef.current.play().catch(() => {});
    }
  };

  const addLog = (role: SpeakerRole, name: string, text: string) => {
    const newLog: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role,
      speakerName: name,
      text,
      timestamp: new Date()
    };
    setLogs(prev => [...prev, newLog]);
    setDisplayRole(role);
    setDisplaySpeaker(name);
    setDisplayText(text);
    setIsTextTyping(true); 
  };

  const getLightingState = (): 'normal' | 'dim' | 'bright' => {
    if (selectedEvidence || animatingEvidence) return 'dim';
    if (displayRole === SpeakerRole.WITNESS || displayRole === SpeakerRole.DEFENDANT) {
      return 'bright';
    }
    return 'normal';
  };

  const getDifficultyLabel = (count: number) => {
    if (count <= 10) return "KOLAY";
    if (count <= 20) return "KOLAY-ORTA";
    if (count <= 30) return "ORTA";
    if (count <= 40) return "ORTA-ZOR";
    return "ZOR";
  };

  // --- Game Functions ---

  const startGame = async (overrideCount?: number) => {
    playClick();
    hasInteractedRef.current = true;
    
    if (overrideCount === undefined && hasSaveGame()) {
      if (loadGame()) {
        return; 
      }
    }

    const targetCase = overrideCount !== undefined ? overrideCount : caseCount;
    clearSave();
    
    setPhase(GamePhase.LOADING);
    setLoadingMessage(`${t.loadingSummon} (Dosya No: #${targetCase})`);
    playGavel(); 
    try {
      const newCase = await generateCase(targetCase);
      setCaseData(newCase);
      setLogs([]);
      setPhase(GamePhase.TRIAL);
      
      setDisplayRole(SpeakerRole.SYSTEM);
      setDisplaySpeaker('Mübaşir');
      setDisplayText(` Mahkeme heyeti yerini almıştır! Esas No: ${Math.floor(Math.random() * 1000)}/2024. Taraflar hazır. Açık yargılamaya başlanıyor.`);
      setIsTextTyping(true);
      
    } catch (error) {
      console.error(error);
      setPhase(GamePhase.MENU);
      alert("Dava dosyası oluşturulamadı. Lütfen internet bağlantınızı kontrol ediniz.");
    }
  };

  const handleNewGame = () => {
    playClick();
    if (window.confirm(t.resetConfirm)) {
      setCaseCount(1);
      setCaseData(null);
      clearSave(); 
      startGame(1);
      setShowSettings(false);
    }
  };

  const handleNextCase = () => {
    playClick();
    setCaseCount(prev => prev + 1);
    clearSave();
    setTimeout(() => startGame(caseCount + 1), 0);
  };

  const handleOpeningStatements = async () => {
    if (!caseData) return;
    setIsLoading(true);
    playPaper();
    addLog(SpeakerRole.PROSECUTOR, t.prosecutor, caseData.prosecutionOpening);
    await new Promise(r => setTimeout(r, 6000)); 
    addLog(SpeakerRole.DEFENSE, t.defenseAttorney, caseData.defenseOpening);
    setIsLoading(false);
  };

  const handleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !selectedCharacter || !caseData) return;
    
    playClick();
    const currentQ = questionText;
    const currentTarget = selectedCharacter;
    const currentEvidence = selectedEvidence;

    setQuestionText(""); 
    
    if (currentEvidence) {
      setAnimatingEvidence(currentEvidence);
      playPaper();
      setTimeout(() => setAnimatingEvidence(null), 3500); 
    }

    setSelectedEvidence(null);
    setIsEvidenceSelectorOpen(false);
    
    let role = SpeakerRole.WITNESS;
    if (currentTarget === "Prosecutor" || currentTarget === t.prosecutor || currentTarget === "Katılan Vekili") role = SpeakerRole.PROSECUTOR;
    else if (currentTarget === "Defense" || currentTarget === t.defenseAttorney || currentTarget === "Sanık Müdafii") role = SpeakerRole.DEFENSE;
    else if (currentTarget === caseData.defendantName) role = SpeakerRole.DEFENDANT;

    const displayedQ = currentEvidence 
      ? `[${t.evidencePresented} ${currentEvidence.item}] ${currentQ}` 
      : currentQ;

    addLog(SpeakerRole.JUDGE, t.judge, displayedQ);
    setIsLoading(true);

    const response = await askCharacter(caseData, role, currentTarget, logs, currentQ, currentEvidence);
    
    setIsLoading(false);
    addLog(role, currentTarget, response);
  };

  const submitVerdict = async () => {
    if (!caseData) return;
    setPhase(GamePhase.LOADING);
    setLoadingMessage(t.loadingDeliberate);
    playGavel();
    
    const result = await evaluateVerdict(caseData, verdictInput);
    setEvaluation(result);
    setPhase(GamePhase.EVALUATION);
    
    clearSave();
  };

  const quitToMenu = () => {
    playClick();
    if(window.confirm(t.exitConfirm)) {
      if (phase === GamePhase.TRIAL || phase === GamePhase.VERDICT) {
        saveCurrentGame(true); 
      }
      setPhase(GamePhase.MENU);
      setShowSettings(false);
    }
  };

  const handleExit = () => {
    playClick();
    if (window.confirm(t.quitConfirm)) {
      window.close();
    }
  };

  const restartCurrentCase = () => {
    playClick();
    if(window.confirm("Bu davayı en başından başlatmak istediğinize emin misiniz?")) {
      clearSave();
      startGame(caseCount); 
      setShowSettings(false);
    }
  };

  const toggleSettings = () => {
    playClick();
    setShowSettings(!showSettings);
  };

  const toggleNotebook = () => {
    playClick();
    setShowNotebook(!showNotebook);
  };

  return (
    <div style={{ filter: `brightness(${brightness}%)` }} className="w-full h-full">
      
      {/* Settings Modal */}
      <SettingsModal 
        show={showSettings}
        onClose={() => setShowSettings(false)}
        audioSettings={audioSettings}
        setAudioSettings={setAudioSettings}
        brightness={brightness}
        setBrightness={setBrightness}
        phase={phase}
        onContinue={() => setShowSettings(false)}
        onSave={() => saveCurrentGame()}
        onRestart={restartCurrentCase}
        onQuit={quitToMenu}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-4 z-[70] bg-accent-gold text-justice-900 px-4 py-2 rounded shadow-lg animate-in slide-in-from-right fade-in font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {notification}
        </div>
      )}

      {/* Notebook Modal */}
      {showNotebook && (
        <div className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
           <div className="bg-[#f0e6d2] text-black w-full max-w-lg h-[70vh] rounded-lg shadow-2xl flex flex-col relative border-8 border-[#3e2b22]">
              <div className="bg-[#3e2b22] text-accent-gold p-3 flex justify-between items-center shadow-lg">
                 <h2 className="text-lg font-serif font-bold flex items-center gap-2"><Book className="w-5 h-5"/> {t.notebook}</h2>
                 <button onClick={() => setShowNotebook(false)} className="text-white hover:text-red-400 font-bold"><X className="w-5 h-5"/></button>
              </div>
              <div className="flex-1 p-6 relative">
                 <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#999 1px, transparent 1px)', backgroundSize: '100% 2em', marginTop: '3em' }}></div>
                 <textarea 
                   className="w-full h-full bg-transparent border-none outline-none resize-none font-serif text-lg leading-[2em]"
                   placeholder={t.notebookPlaceholder}
                   value={notebookContent}
                   onChange={(e) => setNotebookContent(e.target.value)}
                 />
              </div>
              <div className="bg-[#e0d6c2] p-2 text-xs text-center text-gray-600 italic">
                 Otomatik kaydedilir
              </div>
           </div>
        </div>
      )}

      {phase === GamePhase.MENU && (
        <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-justice-900 text-justice-100 wood-texture p-4 relative overflow-hidden">
          <div className="bg-justice-800 p-8 md:p-12 rounded-lg shadow-2xl border-4 border-double border-justice-600 max-w-xl w-full text-center relative overflow-hidden flex flex-col max-h-full">
            <div className="absolute top-0 left-0 w-full h-2 bg-accent-gold"></div>
            
            <div className="overflow-y-auto scrollbar-hide flex flex-col items-center">
              <Scale className="w-16 h-16 md:w-24 md:h-24 mx-auto text-accent-gold mb-4 md:mb-6 drop-shadow-glow" />
              <h1 className="text-3xl md:text-5xl font-serif font-bold mb-2 tracking-tighter text-shadow-lg leading-tight">{t.menuTitle}</h1>
              <p className="text-sm md:text-lg text-justice-100/80 mb-8 font-serif italic">
                "{t.menuSubtitle}"
              </p>
              
              <div className="w-full space-y-3 max-w-xs">
                {/* START / CONTINUE GAME */}
                {hasSaveGame() ? (
                   <Button 
                    onClick={() => startGame()} 
                    variant="gold" 
                    className="w-full py-4 text-lg uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    {t.continueGame}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => startGame()} 
                    variant="gold" 
                    className="w-full py-4 text-lg uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    {caseCount > 1 ? t.nextCase : t.startGame}
                  </Button>
                )}

                {/* NEW GAME */}
                <Button 
                  onClick={handleNewGame} 
                  variant="secondary" 
                  className="w-full py-3 border-dashed border-justice-500 opacity-90 hover:opacity-100 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t.newGame}
                </Button>

                {/* SETTINGS */}
                <Button 
                  onClick={toggleSettings} 
                  variant="primary" 
                  className="w-full py-3 flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {t.settings}
                </Button>

                {/* EXIT */}
                <Button 
                  onClick={handleExit} 
                  variant="danger" 
                  className="w-full py-3 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t.exitGame}
                </Button>
              </div>

              <div className="mt-8 text-xs text-justice-100/30 uppercase tracking-widest">
                {t.aiPowered} • v3.0
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === GamePhase.LOADING && (
        <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-justice-900 text-justice-100 wood-texture overflow-hidden">
          <div className="animate-bounce mb-6">
            <Gavel className="w-24 h-24 text-accent-gold" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-accent-gold mb-2 text-center px-4">{loadingMessage}</h2>
          <div className="w-64 h-2 bg-justice-800 rounded-full mt-4 overflow-hidden border border-justice-700">
             <div className="h-full bg-accent-gold animate-pulse w-full origin-left transform scale-x-50"></div>
          </div>
        </div>
      )}

      {phase === GamePhase.EVALUATION && evaluation && caseData && (
        <div className="h-[100dvh] w-full bg-justice-900 text-justice-100 flex items-center justify-center p-4 md:p-6 wood-texture overflow-hidden">
          <div className="bg-white/5 backdrop-blur-md max-w-4xl w-full h-full max-h-full md:max-h-[90vh] rounded-xl shadow-2xl border border-white/10 p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8 overflow-y-auto">
              
              <div className="w-full md:w-1/3 bg-justice-900/90 rounded-lg p-6 border border-accent-gold text-center flex flex-col justify-center relative overflow-hidden shrink-0">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-gold to-transparent"></div>
                 <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-4">{t.performance}</h3>
                 <div className="text-7xl md:text-8xl font-serif font-bold text-accent-gold mb-2">{evaluation.score}</div>
                 <div className="text-lg text-white font-serif italic mb-6">"{evaluation.title}"</div>
                 
                 <div className="mt-auto pt-6 border-t border-gray-700">
                    <div className="text-xs text-gray-500 uppercase mb-1">{t.correctVerdict}</div>
                    <div className={`text-xl font-bold ${caseData.correctVerdict === 'Guilty' ? 'text-red-500' : 'text-green-500'}`}>{caseData.correctVerdict === 'Guilty' ? t.guilty : t.notGuilty}</div>
                 </div>
              </div>

              <div className="flex-1 space-y-4 md:space-y-6 flex flex-col overflow-hidden">
                 <div className="shrink-0">
                    <h2 className="text-2xl md:text-3xl font-serif text-white mb-1 line-clamp-2">{caseData.title}</h2>
                    <p className="text-gray-400 text-sm">{t.caseClosed}</p>
                 </div>

                 <div className="bg-justice-800/80 p-5 rounded border-l-4 border-accent-gold overflow-y-auto flex-1">
                    <h4 className="text-accent-gold font-bold mb-2 flex items-center gap-2 sticky top-0 bg-justice-800/80 pb-2"><BookOpen className="w-4 h-4"/> {t.evaluation}</h4>
                    <p className="text-gray-200 leading-relaxed text-sm md:text-base">
                      {"\u00A0" + evaluation.feedback}
                    </p>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 pt-2 shrink-0">
                   <Button onClick={() => setPhase(GamePhase.MENU)} variant="secondary" className="flex-1">{t.menu}</Button>
                   <Button onClick={handleNextCase} variant="gold" className="flex-1">{t.nextCase}</Button>
                 </div>
              </div>
          </div>
        </div>
      )}

      {(phase === GamePhase.TRIAL || phase === GamePhase.VERDICT) && (
        <div className="flex h-[100dvh] w-full bg-[#1a1410] overflow-hidden font-sans select-none relative flex-col md:flex-row">
          
          {/* LEFT: Case File (Sidebar on desktop) */}
          <div className="hidden md:block w-72 h-full z-30 shadow-2xl relative shrink-0">
            <CaseFile caseData={caseData!} activeEvidence={selectedEvidence || animatingEvidence} />
            <button 
               onClick={() => { playClick(); setShowCourtRecord(true); }}
               className="absolute bottom-4 left-4 right-4 bg-justice-800 hover:bg-justice-700 text-justice-100 border border-justice-600 py-3 rounded shadow-lg flex items-center justify-center gap-2 font-serif transition-colors"
            >
              <History className="w-4 h-4" /> {t.courtRecord}
            </button>
          </div>

          {/* CENTER: Game Stage */}
          <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
            
            {/* 1. Header/Top Bar */}
            <div className="h-14 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 md:px-6 shrink-0">
               <div className="text-white/80 font-serif tracking-wide text-shadow text-sm md:text-base truncate max-w-[50%]">
                 {caseData?.title}
               </div>
               <div className="flex items-center gap-2">
                 <div className="hidden md:flex items-center text-xs text-accent-gold/80 px-2">
                   Dava #{caseCount} ({getDifficultyLabel(caseCount)})
                 </div>
                 
                 {/* VERDICT BUTTON */}
                 <Button onClick={() => setPhase(GamePhase.VERDICT)} variant="danger" className="text-xs py-1 px-3 md:px-4 scale-90 opacity-90 hover:opacity-100 hover:scale-100 uppercase tracking-wide">
                   <Gavel className="w-3 h-3 inline mr-1" /> {t.verdictTitle}
                 </Button>
                 
                 {/* NOTEBOOK BUTTON */}
                 <button 
                   onClick={toggleNotebook}
                   className="ml-2 p-2 bg-justice-800 text-accent-gold rounded-md border border-justice-600 hover:bg-justice-700 hover:text-white transition-all shadow-md active:scale-95"
                   title={t.notebook}
                 >
                    <Book className="w-5 h-5" />
                 </button>

                 {/* SETTINGS BUTTON */}
                 <button 
                   onClick={toggleSettings}
                   className="ml-2 p-2 bg-justice-800 text-accent-gold rounded-md border border-justice-600 hover:bg-justice-700 hover:text-white transition-all shadow-md active:scale-95"
                   title={t.settings}
                 >
                    <Settings className="w-5 h-5" />
                 </button>
               </div>
            </div>

            {/* 2. Visual Scene Area */}
            <div className="flex-1 relative bg-gray-900 w-full overflow-hidden shadow-inner">
               <CourtroomScene 
                 activeRole={displayRole} 
                 activeSpeakerName={displaySpeaker} 
                 caseData={caseData}
                 isSpeaking={isTextTyping} 
                 lightingState={getLightingState()}
                 presentedEvidence={animatingEvidence}
               />
            </div>

            {/* 3. Dialogue HUD Area (Judge's Bench) */}
            <div className="h-auto min-h-[180px] md:h-72 bg-[#2c1e18] relative z-30 flex flex-col shrink-0 border-t-8 border-[#1a1410] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              {/* Wood Texture Overlay for Desk */}
              <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none z-0"></div>
              
              {/* Judge's Gavel Prop on Desk */}
              <div 
                onClick={playGavel} 
                className={`absolute -top-16 right-10 z-20 hidden md:block cursor-pointer transition-transform duration-100 origin-bottom-right ${gavelAnimation ? 'rotate-45' : 'rotate-12 hover:scale-105'}`}
                title="Tokmak Vur (Sessizlik!)"
              >
                 <div className="relative">
                    <div className="w-48 h-4 bg-[#3e2b22] rounded shadow-lg transform rotate-45 border-b border-black/30"></div>
                    <div className="w-24 h-12 bg-[#2a1d17] absolute top-[-20px] left-32 rounded border-2 border-[#1a100d] shadow-xl bg-gradient-to-b from-[#4a3b32] to-[#2a1d17]"></div>
                 </div>
              </div>

              {/* Gavel Sound Block (New Detail) */}
              <div 
                className="absolute -top-6 right-36 z-10 hidden md:block cursor-pointer"
                onClick={playGavel}
              >
                 <div className="w-20 h-4 bg-[#1a1410] rounded-full shadow-lg border border-[#3e2b22]"></div>
              </div>

              {/* Desk Pen (New Detail) */}
              <div className="absolute -top-2 left-60 z-10 hidden md:block transform rotate-12 pointer-events-none opacity-80">
                 <div className="w-32 h-2 bg-black rounded-full shadow-md border-b border-gray-600"></div>
                 <div className="w-4 h-2 bg-gold absolute right-0 rounded-r-full bg-yellow-600"></div>
              </div>

              {/* Judge Nameplate */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#1a1410] border-2 border-[#d4af37] px-8 py-2 rounded shadow-xl z-40">
                 <span className="text-[#d4af37] font-serif font-bold uppercase tracking-[0.2em] text-xs md:text-base text-shadow whitespace-nowrap">
                   MAHKEME BAŞKANI
                 </span>
              </div>
              
              {/* Speaker Tag (Now styled as a paper note) */}
              <div className="absolute -top-12 left-4 md:left-8 bg-[#f3e5d8] text-justice-900 font-bold px-4 md:px-6 py-2 rounded-sm shadow-lg border border-gray-400 z-30 transform -rotate-2 origin-bottom-left max-w-[200px]">
                 <div className="absolute -top-3 left-1/2 w-4 h-8 bg-red-800/20 transform -rotate-45"></div> 
                 <span className="block uppercase tracking-widest text-xs md:text-sm font-serif truncate">
                    {displaySpeaker || "..."}
                 </span>
              </div>

              {/* Dialogue Box (Paper on Desk) */}
              <div className="flex-1 p-3 md:p-6 lg:p-8 flex gap-4 md:gap-6 items-start relative z-10 overflow-hidden">
                 <div className="flex-1 relative bg-[#faf6f1] p-4 md:p-6 rounded shadow-inner border border-[#e5d5c5] h-full flex flex-col">
                   <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-justice-600 scrollbar-track-transparent h-full">
                     <p className="text-sm md:text-lg lg:text-xl text-justice-900 font-serif leading-relaxed tracking-wide">
                       <TypewriterText 
                         text={displayText} 
                         speed={20}
                         onComplete={() => setIsTextTyping(false)}
                       />
                       {isTextTyping && <span className="inline-block w-2 h-4 bg-justice-900 ml-1 animate-pulse align-middle"></span>}
                     </p>
                   </div>
                 </div>
              </div>

              {/* Action Bar (Desk Drawer/Controls) */}
              <div className="bg-[#1a100d]/50 px-2 md:px-4 py-3 flex items-center gap-2 md:gap-4 flex-wrap relative border-t border-white/5 z-20 backdrop-blur-sm shrink-0">
                 
                 {/* Evidence Selection Popover */}
                 {isEvidenceSelectorOpen && caseData && (
                    <div className="absolute bottom-full left-0 md:left-4 mb-2 bg-justice-100 text-justice-900 w-64 md:w-80 max-h-64 overflow-y-auto rounded-lg shadow-2xl border-2 border-accent-gold z-50 animate-in slide-in-from-bottom-2">
                      <div className="p-2 bg-justice-200 border-b border-justice-300 font-bold text-xs uppercase tracking-wider flex justify-between items-center">
                        {t.selectEvidence}
                        <button onClick={() => setIsEvidenceSelectorOpen(false)}><X className="w-4 h-4" /></button>
                      </div>
                      <div className="p-1">
                        {caseData.evidence.map((ev, i) => (
                          <button 
                            key={i} 
                            onClick={() => { setSelectedEvidence(ev); setIsEvidenceSelectorOpen(false); }}
                            className="w-full text-left p-2 hover:bg-accent-gold/20 rounded text-sm group"
                          >
                            <div className="font-bold">{ev.item}</div>
                            <div className="text-xs text-justice-600 truncate">{ev.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                 )}

                 {logs.length === 0 ? (
                   <div className="w-full flex justify-center">
                     <Button onClick={handleOpeningStatements} variant="gold" className="animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.4)] w-full md:w-auto font-serif tracking-widest text-lg">
                        {t.beginTrial}
                     </Button>
                   </div>
                 ) : (
                    <form onSubmit={handleQuestion} className="w-full flex items-center gap-2 flex-wrap md:flex-nowrap">
                       
                       {/* Mobile Utils */}
                       <div className="flex md:hidden gap-2 w-full mb-1">
                          <button type="button" onClick={() => { playClick(); setShowEvidence(true); }} className="flex-1 bg-justice-700 text-justice-100 text-xs py-2 rounded border border-justice-600 flex items-center justify-center gap-1 h-8">
                            <Fingerprint className="w-3 h-3" /> {t.evidenceFile}
                          </button>
                          <button type="button" onClick={() => { playClick(); setShowCourtRecord(true); }} className="flex-1 bg-justice-700 text-justice-100 text-xs py-2 rounded border border-justice-600 flex items-center justify-center gap-1 h-8">
                            <History className="w-3 h-3" /> {t.courtRecord}
                          </button>
                       </div>

                       {/* Character Selector */}
                       <div className="flex items-center gap-2 bg-[#1a1410] rounded px-2 py-1 border border-[#3e2b22] flex-grow md:flex-grow-0 w-full md:w-auto shadow-inner h-10">
                         <User className="w-4 h-4 text-accent-gold shrink-0" />
                         <select 
                            className="bg-transparent text-justice-100 text-xs md:text-sm py-1 outline-none font-bold min-w-[100px] w-full cursor-pointer"
                            value={selectedCharacter}
                            onChange={(e) => setSelectedCharacter(e.target.value)}
                          >
                            <option value="" className="bg-[#1a1410] text-gray-500">{t.targetPlaceholder}</option>
                            <option value={t.prosecutor} className="bg-[#1a1410]">{t.prosecutor}</option>
                            <option value={t.defenseAttorney} className="bg-[#1a1410]">{t.defenseAttorney}</option>
                            <option value={caseData?.defendantName} className="bg-[#1a1410]">{t.defendant}</option>
                            {caseData?.witnesses.map(w => (
                              <option key={w.name} value={w.name} className="bg-[#1a1410]">{t.witnessList}: {w.name}</option>
                            ))}
                          </select>
                       </div>
                       
                       {/* Evidence Button */}
                       <button 
                         type="button" 
                         onClick={() => { playClick(); setIsEvidenceSelectorOpen(!isEvidenceSelectorOpen); }}
                         className={`h-10 px-3 rounded border flex items-center gap-2 transition-colors shadow-md ${selectedEvidence ? 'bg-accent-gold text-justice-900 border-yellow-600 font-bold' : 'bg-[#3e2b22] text-justice-100 border-[#5c4033] hover:bg-[#4a3b32]'}`}
                         title={t.presentEvidence}
                       >
                          <FolderSearch className="w-5 h-5" />
                          {selectedEvidence && <span className="text-xs max-w-[60px] truncate hidden md:block">{selectedEvidence.item}</span>}
                       </button>

                       {/* Input Field */}
                       <div className="flex-1 relative">
                          <input 
                              type="text" 
                              className="w-full bg-[#1a1410] text-justice-50 placeholder-justice-100/30 px-3 md:px-4 py-2 rounded border border-[#3e2b22] focus:border-accent-gold outline-none transition-colors text-xs md:text-base h-10 shadow-inner"
                              placeholder={selectedEvidence ? `[${t.evidencePresented} ${selectedEvidence.item}] ...` : t.questionPlaceholder}
                              value={questionText}
                              onChange={(e) => setQuestionText(e.target.value)}
                          />
                          {selectedEvidence && (
                            <button 
                              type="button" 
                              onClick={() => { playClick(); setSelectedEvidence(null); }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                       </div>
                       
                       {/* Submit */}
                       <Button type="submit" disabled={!selectedCharacter || !questionText.trim() || isLoading} className="h-10 px-4 md:px-6 w-full md:w-auto flex justify-center items-center shadow-lg border border-yellow-600/50">
                          <ChevronRight className="w-5 h-5" />
                       </Button>
                    </form>
                 )}
              </div>
            </div>
          </div>

          {/* MODALS */}
          {showEvidence && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:hidden">
              <div className="bg-justice-100 w-full h-[90dvh] rounded shadow-2xl flex flex-col overflow-hidden border-4 border-justice-800 relative">
                 <button 
                  onClick={() => { playClick(); setShowEvidence(false); }} 
                  className="absolute top-2 right-2 bg-justice-800 text-white w-8 h-8 rounded-full flex items-center justify-center z-10"
                 >
                   ✕
                 </button>
                 <CaseFile caseData={caseData!} activeEvidence={selectedEvidence || animatingEvidence} />
              </div>
            </div>
          )}

          {showCourtRecord && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
               <div className="bg-justice-100 w-full max-w-2xl h-[80dvh] rounded shadow-2xl flex flex-col overflow-hidden border-4 border-justice-800">
                  <div className="bg-justice-800 text-accent-gold p-4 flex justify-between items-center shadow-md">
                     <h2 className="text-xl font-serif font-bold flex items-center gap-2"><History /> {t.courtRecord}</h2>
                     <button onClick={() => { playClick(); setShowCourtRecord(false); }} className="text-white hover:text-red-400 font-bold px-2">✕</button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-[#faf6f1] p-0">
                     <TrialLog logs={logs} />
                  </div>
               </div>
            </div>
          )}

          {phase === GamePhase.VERDICT && (
              <div className="absolute inset-0 z-50 bg-justice-900/95 flex items-center justify-center p-4 animate-in fade-in duration-300">
                
                {/* DELIBERATION ROOM (HINTS) */}
                <div className="absolute top-4 left-4 z-50 hidden lg:block animate-in slide-in-from-left-4">
                   <div className="bg-[#f0e6d2] text-black w-72 rounded shadow-2xl border-4 border-[#3e2b22] relative overflow-hidden transform -rotate-1">
                      <div className="bg-[#3e2b22] text-accent-gold p-2 text-center font-bold text-sm uppercase tracking-widest border-b border-black/20">
                         {t.deliberationRoom}
                      </div>
                      <div className="p-4 bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
                         <div className="flex items-center gap-2 mb-2 text-red-800 font-bold text-xs uppercase border-b border-red-800/20 pb-1">
                            <Lightbulb className="w-4 h-4" /> {t.keyPoints}
                         </div>
                         <ul className="list-disc list-outside ml-4 space-y-2 text-xs font-serif leading-relaxed">
                            {caseData?.keyPoints?.map((point, idx) => (
                               <li key={idx}>{point}</li>
                            ))}
                         </ul>
                      </div>
                      {/* Stamp decoration */}
                      <div className="absolute bottom-2 right-2 w-16 h-16 border-2 border-red-800 rounded-full opacity-20 transform -rotate-12 flex items-center justify-center text-[8px] font-bold text-red-800 uppercase text-center p-1">
                         Gizli<br/>Belge
                      </div>
                   </div>
                </div>

                <div className="bg-justice-800 w-full max-w-lg p-6 md:p-8 rounded border-2 border-accent-gold shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90dvh]">
                  <h2 className="text-2xl md:text-3xl font-serif text-accent-gold mb-6 flex items-center justify-center gap-3 border-b border-justice-600 pb-4">
                    <Gavel className="w-8 h-8" /> {t.verdictTitle}
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                        <button 
                          onClick={() => { playClick(); setVerdictInput(p => ({ ...p, verdict: 'Guilty' })); }}
                          className={`flex-1 py-4 md:py-6 rounded border-2 font-serif font-bold text-lg md:text-xl transition-all ${verdictInput.verdict === 'Guilty' ? 'bg-red-900/50 border-red-500 text-red-100 scale-105 shadow-lg shadow-red-900/20' : 'bg-justice-900 border-justice-700 text-gray-500 opacity-50 hover:opacity-100'}`}
                        >
                          {t.guilty}
                        </button>
                        <button 
                           onClick={() => { playClick(); setVerdictInput(p => ({ ...p, verdict: 'Not Guilty' })); }}
                           className={`flex-1 py-4 md:py-6 rounded border-2 font-serif font-bold text-lg md:text-xl transition-all ${verdictInput.verdict === 'Not Guilty' ? 'bg-green-900/50 border-green-500 text-green-100 scale-105 shadow-lg shadow-green-900/20' : 'bg-justice-900 border-justice-700 text-gray-500 opacity-50 hover:opacity-100'}`}
                        >
                          {t.notGuilty}
                        </button>
                    </div>

                    {verdictInput.verdict === 'Guilty' && (
                      <div className="animate-in slide-in-from-top-2">
                        <label className="block text-xs uppercase tracking-widest text-accent-gold mb-2">{t.sentenceLabel}</label>
                        <input 
                          type="text" 
                          className="w-full bg-justice-900 border border-justice-600 rounded p-3 text-white focus:border-accent-gold outline-none"
                          placeholder={t.sentencePlaceholder}
                          value={verdictInput.sentence || ''}
                          onChange={(e) => setVerdictInput(p => ({ ...p, sentence: e.target.value }))}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-accent-gold mb-2">{t.reasoningLabel}</label>
                      <textarea 
                        className="w-full bg-justice-900 border border-justice-600 rounded p-3 text-white h-32 focus:border-accent-gold outline-none resize-none"
                        placeholder={t.reasoningPlaceholder}
                        value={verdictInput.reasoning}
                        onChange={(e) => setVerdictInput(p => ({ ...p, reasoning: e.target.value }))}
                      />
                    </div>

                    <div className="flex justify-between gap-4 pt-4 border-t border-justice-700">
                      <Button variant="secondary" onClick={() => { playClick(); setPhase(GamePhase.TRIAL); }}>{t.backToTrial}</Button>
                      <Button variant="gold" onClick={submitVerdict} className="px-4 md:px-8">{t.deliverJudgment}</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
