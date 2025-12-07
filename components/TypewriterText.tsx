import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per char
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 25, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  
  // Prepend a non-breaking space to ensure indentation is visible
  const effectiveText = "\u00A0" + text;
  const currentTextRef = useRef(effectiveText);

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText("");
    indexRef.current = 0;
    currentTextRef.current = effectiveText;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      // Check if text has changed mid-interval (safety check)
      if (effectiveText !== currentTextRef.current) return;

      if (indexRef.current < effectiveText.length) {
        // Use functional state update to ensure we append to the latest value
        setDisplayedText((prev) => {
          // Double check we haven't exceeded length in a race condition
          if (prev.length >= effectiveText.length) return prev;
          return prev + effectiveText.charAt(indexRef.current);
        });
        indexRef.current++;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed, onComplete, effectiveText]);

  return <span>{displayedText}</span>;
};