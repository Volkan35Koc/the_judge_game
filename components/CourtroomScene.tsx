import React from 'react';
import { SpeakerRole, CaseData, Evidence } from '../types';
import { t } from '../utils/translations';
import { Mic, FileText, GlassWater, Book, FolderSearch, MessageSquare } from 'lucide-react';

interface CourtroomSceneProps {
  activeRole: SpeakerRole | null;
  activeSpeakerName: string;
  caseData: CaseData | null;
  isSpeaking: boolean;
  lightingState: 'normal' | 'dim' | 'bright';
  presentedEvidence: Evidence | null;
}

export const CourtroomScene: React.FC<CourtroomSceneProps> = ({ 
  activeRole, 
  activeSpeakerName, 
  caseData, 
  isSpeaking, 
  lightingState,
  presentedEvidence 
}) => {

  // Calculate spotlight position based on active role
  const getSpotlightPosition = () => {
    switch (activeRole) {
      case SpeakerRole.PROSECUTOR: return '20% 55%'; // Left
      case SpeakerRole.DEFENSE: return '80% 55%'; // Right
      case SpeakerRole.WITNESS: 
      case SpeakerRole.DEFENDANT: return '50% 50%'; // Center
      default: return '50% 50%'; // Default center
    }
  };

  const getRoleStyles = (role: SpeakerRole) => {
    const isActive = activeRole === role;
    let styles = "transition-all duration-700 ";
    
    // Base State
    if (!activeRole || activeRole === SpeakerRole.JUDGE || activeRole === SpeakerRole.SYSTEM) {
      // Neutral state: everyone visible but slightly muted
      return styles + (lightingState === 'dim' ? "opacity-40 grayscale blur-[2px] scale-95 z-0" : "opacity-100 grayscale-[10%] scale-100 z-0");
    }

    if (isActive) {
      // Active Speaker
      styles += "opacity-100 filter-none scale-105 z-20 ";
      
      // Evidence Presentation Spotlight Effect
      if (presentedEvidence) {
         // Intense spotlight, everything else fades
         styles += "drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] brightness-125 contrast-110 z-50 ";
      } else if (lightingState === 'dim') {
        // High contrast in dim mode (Selection phase)
        styles += "drop-shadow-[0_0_25px_rgba(255,255,255,0.1)] brightness-110 contrast-125 ";
      } else if (lightingState === 'bright') {
        // Warm glow in bright mode
        styles += "drop-shadow-[0_0_30px_rgba(255,200,100,0.3)] brightness-105 sepia-[10%] ";
      } else {
        styles += "drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] ";
      }

      if (isSpeaking) {
        styles += "animate-[pulse_3s_ease-in-out_infinite] "; 
      }
    } else {
      // Inactive Characters
      styles += "z-0 ";
      if (presentedEvidence) {
         // Extreme dark during evidence presentation
         styles += "opacity-10 grayscale blur-[4px] scale-90 brightness-25";
      } else if (lightingState === 'dim') {
         // Very dark when focus is elsewhere
         styles += "opacity-20 grayscale blur-[2px] scale-90 brightness-50";
      } else {
         styles += "opacity-60 grayscale blur-[1px] scale-95";
      }
    }
    return styles;
  };

  const isWitnessRole = (role: SpeakerRole | null) => 
    role === SpeakerRole.WITNESS || role === SpeakerRole.DEFENDANT;

  const isDefendant = activeRole === SpeakerRole.DEFENDANT;
  const isWitnessSpeaking = isSpeaking && isWitnessRole(activeRole);

  // Updated images for Biometric/Professional look
  const prosecutionImg = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"; // Professional Male in Suit
  const defenseImg = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600"; // Professional Female in Suit
  
  // Diverse, clear face portraits for witnesses (Biometric style)
  const witnessImages = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600", 
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600", 
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600", 
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=600"  
  ];

  const getWitnessImage = () => {
    if (!caseData) return witnessImages[0];
    const charCode = activeSpeakerName.charCodeAt(0) || 0;
    return witnessImages[charCode % witnessImages.length];
  };

  return (
    <div className="relative w-full h-full bg-[#15100d] overflow-hidden flex flex-col perspective-1000">
      
      {/* --- EVIDENCE PRESENTATION OVERLAY --- */}
      {presentedEvidence && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-300">
           {/* Flash Effect */}
           <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
           
           {/* Radial Burst */}
           <div className="absolute w-[150%] h-[150%] bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent animate-[spin_3s_linear_infinite] opacity-50"></div>

           {/* Card - Positioned slightly lower to not block face */}
           <div className="absolute bottom-10 bg-[#1a1410]/95 border-4 border-accent-gold p-6 rounded-lg shadow-[0_0_50px_rgba(212,175,55,0.6)] text-center transform scale-110 flex flex-col items-center gap-2 max-w-md mx-4 animate-in slide-in-from-bottom-10">
              <div className="absolute -top-8 bg-accent-gold p-3 rounded-full border-4 border-[#1a1410] shadow-lg">
                 <FolderSearch className="w-8 h-8 text-[#1a1410]" />
              </div>
              <div className="mt-4">
                <h2 className="text-accent-gold font-serif font-bold text-lg tracking-[0.2em] uppercase mb-1 text-shadow">KANIT SUNULDU</h2>
                <p className="text-white font-bold text-xl font-serif">"{presentedEvidence.item}"</p>
                <p className="text-gray-400 text-xs mt-1 italic">{presentedEvidence.description}</p>
              </div>
           </div>
        </div>
      )}

      {/* --- ROOM BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 z-0">
          {/* Wall Texture */}
          <div className={`absolute inset-0 bg-[#2a201a] transition-colors duration-1000 ${lightingState === 'dim' || presentedEvidence ? 'brightness-[0.25]' : ''}`}></div>
          
          {/* Back Wall Pillars */}
          <div className="absolute inset-0 flex justify-between px-20 opacity-40">
             <div className="w-16 h-full bg-gradient-to-r from-[#1a1410] via-[#3e2b22] to-[#1a1410] shadow-2xl"></div>
             <div className="w-16 h-full bg-gradient-to-r from-[#1a1410] via-[#3e2b22] to-[#1a1410] shadow-2xl"></div>
             <div className="w-16 h-full bg-gradient-to-r from-[#1a1410] via-[#3e2b22] to-[#1a1410] shadow-2xl"></div>
             <div className="w-16 h-full bg-gradient-to-r from-[#1a1410] via-[#3e2b22] to-[#1a1410] shadow-2xl"></div>
          </div>

          {/* Gallery / Audience (Deep Background) */}
          <div className="absolute inset-x-0 bottom-32 h-40 flex justify-center items-end opacity-20 blur-[2px] grayscale pointer-events-none">
             {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-12 h-16 bg-black/50 rounded-t-full mx-2 transform scale-y-110"></div>
             ))}
          </div>

          {/* Justice Banner */}
          <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-24 h-40 bg-red-800 shadow-xl flex items-start justify-center pt-4 rounded-b-lg border-x-4 border-b-4 border-yellow-600/30 z-0 transition-all duration-1000 ${lightingState === 'dim' || presentedEvidence ? 'brightness-[0.3]' : 'brightness-90'}`}>
             <div className="text-white opacity-80 text-4xl font-serif">⚖️</div>
          </div>

          {/* Audience Box (Left Background) */}
          <div className={`absolute bottom-40 left-[-20px] w-64 h-56 bg-[#1a1410] transform skew-y-6 rounded-r-xl border-r-4 border-[#3e2b22] flex flex-col items-center justify-center transition-opacity duration-1000 shadow-2xl overflow-hidden ${lightingState === 'dim' || presentedEvidence ? 'opacity-10' : 'opacity-100'}`}>
             <div className="w-full h-8 bg-[#2c221c] absolute top-0 border-b border-white/5"></div>
             <div className="grid grid-cols-4 gap-2 p-4 opacity-40 mt-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-black rounded-full shadow-inner border border-white/5"></div>
                ))}
             </div>
             <div className="text-white/20 font-bold uppercase tracking-widest text-xl mt-2 font-serif">İzleyiciler</div>
          </div>

          {/* Base Lighting Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>
      </div>

      {/* --- DYNAMIC LIGHTING OVERLAYS --- */}
      
      {/* Evidence Spotlight: Specific focus on the active character */}
      <div 
        className={`absolute inset-0 z-1 pointer-events-none transition-all duration-700 ease-in-out ${presentedEvidence ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: `radial-gradient(circle at ${getSpotlightPosition()}, transparent 10%, rgba(0,0,0,0.5) 30%, #000 80%)`,
          mixBlendMode: 'normal'
        }}
      ></div>

      {/* God Rays for Evidence */}
      <div 
        className={`absolute inset-0 z-1 pointer-events-none transition-all duration-700 ease-in-out ${presentedEvidence ? 'opacity-40' : 'opacity-0'}`}
        style={{
          background: `conic-gradient(from 0deg at ${getSpotlightPosition()}, transparent 45%, rgba(255,255,255,0.2) 48%, rgba(255,255,255,0.2) 52%, transparent 55%)`,
          filter: 'blur(20px)',
          mixBlendMode: 'overlay'
        }}
      ></div>

      {/* Standard Spotlight (Bright Mode) */}
      <div 
        className={`absolute inset-0 z-1 pointer-events-none transition-opacity duration-1000 ease-in-out ${!presentedEvidence && lightingState === 'bright' ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(circle at 50% 60%, rgba(255, 220, 180, 0.15) 0%, transparent 60%)',
          mixBlendMode: 'screen'
        }}
      ></div>
      
      {/* Standard Vignette (Dim Mode) */}
      <div 
        className={`absolute inset-0 z-1 pointer-events-none transition-opacity duration-1000 ease-in-out ${!presentedEvidence && lightingState === 'dim' ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(circle at center, transparent 15%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.95) 100%)',
          mixBlendMode: 'multiply'
        }}
      ></div>


      {/* --- CHARACTERS LAYER --- */}
      <div className="flex-1 flex items-end justify-between px-0 md:px-10 pb-0 max-w-7xl mx-auto w-full relative z-10 h-full">
        
        {/* Prosecution Stand (Left) */}
        <div className={`flex flex-col items-center justify-end w-1/3 h-full pb-4 md:pb-10 relative group transform ${getRoleStyles(SpeakerRole.PROSECUTOR)}`}>
           <div className="relative w-full max-w-[300px] flex flex-col items-center">
             <div className="bg-[#1a1410] text-gray-300 px-4 py-1 mb-2 rounded border border-gray-700 text-xs md:text-sm uppercase tracking-widest font-serif shadow-lg">
                {t.prosecution}
             </div>
             <div className="relative w-40 h-56 md:w-64 md:h-80 overflow-hidden rounded-t-xl shadow-2xl border-4 border-[#3e2b22] bg-black">
                <img src={prosecutionImg} alt="Prosecutor" className={`w-full h-full object-cover object-top transition-transform duration-1000 ${activeRole === SpeakerRole.PROSECUTOR ? 'scale-110' : 'scale-100'}`} />
             </div>
             {/* Desk */}
             <div className="w-full h-16 md:h-24 bg-gradient-to-r from-[#3e2b22] to-[#2c1e18] mt-[-20px] relative z-20 rounded-t shadow-inner border-t border-white/10 flex items-center justify-center">
                {/* Desk Props */}
                <div className="absolute top-[-25px] right-4 flex flex-col -space-y-3 transform rotate-6 opacity-80">
                   <div className="w-16 h-2 bg-yellow-100 rounded border border-gray-400"></div>
                   <div className="w-16 h-2 bg-white rounded border border-gray-400"></div>
                   <div className="w-16 h-2 bg-gray-200 rounded border border-gray-400"></div>
                </div>
                <Book className="absolute top-[-20px] left-10 text-[#5c4033] w-10 h-10 transform -rotate-12 drop-shadow-md" />
                <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30"></div>
             </div>
           </div>
        </div>

        {/* Witness/Defendant Stand (Center) */}
        <div className={`flex flex-col items-center justify-end w-1/3 h-full mb-8 md:mb-16 transform ${getRoleStyles(isWitnessRole(activeRole) ? activeRole : null)}`}>
           <div className="relative w-full max-w-[280px] flex flex-col items-center">
             
             {/* Defendant-specific speaking icon */}
             {isDefendant && isSpeaking && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 animate-[bounce_1s_infinite]">
                   <div className="bg-red-900/90 text-white p-2 rounded-full border-2 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                      <MessageSquare className="w-5 h-5" />
                   </div>
                   <div className="w-2 h-2 bg-red-500 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
             )}

             <div className="relative w-36 h-48 md:w-56 md:h-72 overflow-hidden rounded-t-full border-4 border-[#5c4033] shadow-2xl bg-black">
                <img 
                  src={getWitnessImage()} 
                  alt="Witness" 
                  className={`w-full h-full object-cover transition-transform duration-200 ${isSpeaking && isWitnessRole(activeRole) ? 'scale-[1.02]' : 'scale-100'}`} 
                />
             </div>
             {/* Stand */}
             <div className={`w-[120%] h-24 md:h-36 bg-[#5c4033] mt-[-30px] relative z-20 flex flex-col items-center justify-center shadow-2xl rounded-t-lg border-t-8 border-[#3e2b22] overflow-hidden transition-all duration-500 ${isWitnessSpeaking && isDefendant ? 'shadow-[0_0_30px_rgba(200,50,50,0.4)] brightness-110 border-red-900/30' : isWitnessSpeaking ? 'shadow-[0_0_20px_rgba(255,200,100,0.3)] brightness-110' : ''}`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-40"></div>
                
                {/* Microphone Prop with Live Interaction */}
                <div className="absolute top-[-40px] z-50 flex flex-col items-center group">
                   {/* Voice Waves (Only visible when speaking) */}
                   <div className={`absolute -top-6 flex items-end justify-center gap-1 h-6 transition-opacity duration-300 ${isWitnessSpeaking ? 'opacity-100' : 'opacity-0'}`}>
                      <div className={`w-1 rounded-full animate-[bounce_0.5s_infinite] h-2 ${isDefendant ? 'bg-red-500' : 'bg-accent-gold'}`}></div>
                      <div className={`w-1 rounded-full animate-[bounce_0.5s_infinite_0.1s] h-4 ${isDefendant ? 'bg-red-500' : 'bg-accent-gold'}`}></div>
                      <div className={`w-1 rounded-full animate-[bounce_0.5s_infinite_0.2s] h-3 ${isDefendant ? 'bg-red-500' : 'bg-accent-gold'}`}></div>
                   </div>

                   {/* Microphone Head */}
                   <div className={`w-4 h-6 rounded-full border-2 border-gray-600 grid grid-cols-2 gap-[1px] overflow-hidden shadow-lg transition-all duration-300 ${isWitnessSpeaking && isDefendant ? 'bg-red-900 shadow-[0_0_10px_rgba(255,50,50,0.6)] border-red-800' : isWitnessSpeaking ? 'bg-yellow-900/80 shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'bg-gray-800'}`}>
                      <div className={`bg-gray-700/50 ${isWitnessSpeaking ? (isDefendant ? 'animate-pulse bg-red-500/20' : 'animate-pulse bg-yellow-500/20') : ''}`}></div>
                      <div className={`bg-gray-700/50 ${isWitnessSpeaking ? (isDefendant ? 'animate-pulse bg-red-500/20' : 'animate-pulse bg-yellow-500/20') : ''}`}></div>
                      <div className={`bg-gray-700/50 ${isWitnessSpeaking ? (isDefendant ? 'animate-pulse bg-red-500/20' : 'animate-pulse bg-yellow-500/20') : ''}`}></div>
                      <div className={`bg-gray-700/50 ${isWitnessSpeaking ? (isDefendant ? 'animate-pulse bg-red-500/20' : 'animate-pulse bg-yellow-500/20') : ''}`}></div>
                   </div>
                   {/* Stand Pole */}
                   <div className="w-1 h-12 bg-gray-400"></div>
                </div>

                {/* Oath Book Prop */}
                <div className="absolute top-[-10px] right-4 transform rotate-6 z-30">
                   <div className="w-12 h-16 bg-[#3e2b22] rounded-sm border-l-4 border-[#1a1410] shadow flex items-center justify-center">
                      <div className="w-6 h-8 border border-accent-gold/30"></div>
                   </div>
                </div>

                <div className="bg-[#2c221c] px-4 py-2 rounded shadow-inner border border-white/5 relative z-10 mt-4">
                   <span className={`font-serif text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${isWitnessSpeaking && isDefendant ? 'text-red-400 text-shadow-sm' : isWitnessSpeaking ? 'text-white text-shadow-sm' : 'text-accent-gold'}`}>
                     <Mic className={`w-3 h-3 ${isWitnessSpeaking ? (isDefendant ? 'text-red-500 animate-pulse' : 'text-accent-gold animate-pulse') : ''}`} />
                     {isWitnessRole(activeRole) ? activeSpeakerName : t.witnessStand}
                   </span>
                </div>
             </div>
           </div>
        </div>

        {/* Defense Stand (Right) */}
        <div className={`flex flex-col items-center justify-end w-1/3 h-full pb-4 md:pb-10 transform ${getRoleStyles(SpeakerRole.DEFENSE)}`}>
           <div className="relative group w-full max-w-[300px] flex flex-col items-center">
             <div className="bg-[#1a1410] text-gray-300 px-4 py-1 mb-2 rounded border border-gray-700 text-xs md:text-sm uppercase tracking-widest font-serif shadow-lg">
                {t.defense}
             </div>
             <div className="relative w-40 h-56 md:w-64 md:h-80 overflow-hidden rounded-t-xl shadow-2xl border-4 border-[#3e2b22] bg-black">
                <img src={defenseImg} alt="Defense" className={`w-full h-full object-cover object-top transition-transform duration-1000 ${activeRole === SpeakerRole.DEFENSE ? 'scale-110' : 'scale-100'}`} />
             </div>
             {/* Desk */}
             <div className="w-full h-16 md:h-24 bg-gradient-to-l from-[#3e2b22] to-[#2c1e18] mt-[-20px] relative z-20 rounded-t shadow-inner border-t border-white/10 flex items-center justify-center">
                {/* Desk Props */}
                <GlassWater className="absolute top-[-15px] left-10 text-blue-200/40 w-6 h-6" />
                <div className="absolute top-[-5px] right-12 w-12 h-1 bg-white/50 rounded transform rotate-3"></div> {/* Pen */}
                <div className="absolute top-[-8px] right-8 w-20 h-14 bg-white rounded shadow transform -rotate-2 border border-gray-300 flex items-center justify-center">
                   <div className="w-full h-[1px] bg-gray-200 mb-1"></div>
                   <div className="w-full h-[1px] bg-gray-200 mb-1"></div>
                </div>
                <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30"></div>
             </div>
           </div>
        </div>

      </div>

      {/* Atmospheric Particles */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    </div>
  );
};