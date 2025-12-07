import React, { useEffect, useRef } from 'react';
import { CaseData, Evidence } from '../types';
import { FileText, Users, Eye, Fingerprint } from 'lucide-react';
import { t, getRoleName } from '../utils/translations';

interface CaseFileProps {
  caseData: CaseData;
  activeEvidence?: Evidence | null;
}

export const CaseFile: React.FC<CaseFileProps> = ({ caseData, activeEvidence }) => {
  
  // Updated high quality, reliable mugshot/biometric style image for defendant
  const defendantImg = "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=300";
  
  // Refs for scrolling to active evidence
  const evidenceRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

  // Auto-scroll to active evidence when it changes
  useEffect(() => {
    if (activeEvidence && evidenceRefs.current[activeEvidence.item]) {
      evidenceRefs.current[activeEvidence.item]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [activeEvidence]);

  return (
    <div className="h-full bg-[#1a1410] border-r border-[#3e2b22] flex flex-col overflow-hidden text-[#f3e5d8]">
      {/* Header */}
      <div className="p-4 bg-[#2c221c] border-b border-[#3e2b22] shadow-md shrink-0">
        <h2 className="text-lg font-serif font-bold text-accent-gold uppercase tracking-widest flex items-center gap-2">
          <Fingerprint className="w-5 h-5" /> {t.evidenceFile}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {/* Defendant Mugshot */}
        <div className="bg-[#2a201a] p-3 rounded border border-[#3e2b22] shadow-inner">
          <div className="flex items-start gap-3">
             <div className="w-16 h-20 bg-gray-900 rounded overflow-hidden shrink-0 border border-gray-600">
               <img src={defendantImg} alt="Defendant" className="w-full h-full object-cover grayscale contrast-125" />
             </div>
             <div>
               <p className="text-xs text-gray-500 uppercase font-bold">{t.defendant}</p>
               <p className="font-bold text-lg leading-tight mb-1">{caseData.defendantName}</p>
               <span className="inline-block bg-red-900/30 text-red-400 text-[10px] px-2 py-0.5 rounded border border-red-900/50">
                 {caseData.crime}
               </span>
             </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2 flex items-center gap-1 border-b border-white/5 pb-1">
            <FileText className="w-3 h-3" /> {t.incidentReport}
          </h3>
          <p className="text-xs text-gray-300 italic leading-relaxed">
            "{ "\u00A0" + caseData.summary}"
          </p>
        </div>

        {/* Evidence List */}
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2 flex items-center gap-1 border-b border-white/5 pb-1">
            <Eye className="w-3 h-3" /> {t.exhibits}
          </h3>
          <ul className="space-y-3">
            {caseData.evidence.map((ev, idx) => {
              const isActive = activeEvidence?.item === ev.item;
              return (
                <li 
                  key={idx} 
                  ref={(el) => { evidenceRefs.current[ev.item] = el; }}
                  className={`p-2 rounded border transition-all duration-500 group cursor-help ${
                    isActive 
                      ? "bg-accent-gold/10 border-accent-gold shadow-[0_0_15px_rgba(212,175,55,0.2)] scale-[1.02]" 
                      : "bg-[#241c18] border-[#3e2b22]/50 hover:border-accent-gold/30"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`font-bold text-sm block transition-colors ${isActive ? "text-accent-gold" : "text-gray-300 group-hover:text-yellow-200"}`}>
                      {ev.item}
                    </span>
                    {isActive && <span className="text-[10px] text-accent-gold animate-pulse uppercase tracking-widest font-bold">Sunuluyor</span>}
                  </div>
                  <span className={`text-xs block mt-1 leading-snug transition-colors ${isActive ? "text-justice-100" : "text-gray-400"}`}>
                    { "\u00A0" + ev.description}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Witness List */}
        <div className="pb-12">
          <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2 flex items-center gap-1 border-b border-white/5 pb-1">
            <Users className="w-3 h-3" /> {t.witnessList}
          </h3>
          <ul className="space-y-2">
            {caseData.witnesses.map((w, idx) => (
              <li key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-600 bg-black/40">
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
                        {w.name.charAt(0)}
                    </div>
                </div>
                <div>
                  <span className="font-bold block text-gray-200 text-sm">{w.name}</span>
                  <span className="text-[10px] text-gray-500 uppercase">{getRoleName(w.role)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};