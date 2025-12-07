import React, { useEffect, useRef } from 'react';
import { ChatMessage, SpeakerRole } from '../types';
import { t } from '../utils/translations';

interface TrialLogProps {
  logs: ChatMessage[];
}

export const TrialLog: React.FC<TrialLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 font-serif text-justice-900 bg-[#faf6f1]">
      <div className="text-center mb-6 border-b-2 border-justice-900/10 pb-4">
        <h3 className="text-2xl font-bold uppercase tracking-widest text-justice-800">{t.officialRecord}</h3>
        <p className="text-xs text-justice-600 italic">{t.certifiedTranscript}</p>
      </div>

      <div className="space-y-6">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-6 border-l-2 border-justice-300">
            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-justice-400"></div>
            
            <div className="flex items-baseline justify-between mb-1">
               <span className="font-bold text-justice-900 uppercase text-sm tracking-wide">
                 {log.speakerName}
               </span>
               <span className="text-xs text-justice-400 font-sans">{formatTime(log.timestamp)}</span>
            </div>
            
            <p className={`text-base leading-relaxed ${log.role === SpeakerRole.SYSTEM ? 'italic text-justice-500' : 'text-justice-800'}`}>
              {"\u00A0" + log.text}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};