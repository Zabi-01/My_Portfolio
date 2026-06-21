import { useState, useEffect } from 'react';
import { Terminal, Cpu, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { playBootAudioSequence, playClickSound } from '../utils/audio';

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [percent, setPercent] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const bootSteps = [
    { text: "ACCESSING FIREWALL ADAPTERS...", duration: 150 },
    { text: "DECRYPTING PRIVATE SEC_STANDARDS LABS...", duration: 180 },
    { text: "STABILIZING RELATIONAL DATABASE SCHEMAS...", duration: 140 },
    { text: "SECURING PORT 3000 WEBSOCKETS...", duration: 130 },
    { text: "INITIALIZING RE-ACTIVE CYBER MATRIX...", duration: 170 },
    { text: "DECRYPTED ZABIH_ULLAH.NODE SUCCESSFULLY.", duration: 130 }
  ];

  useEffect(() => {
    // Play full high fidelity system wake-up sound sequence on mount
    playBootAudioSequence();

    let currentLogIndex = 0;
    let timer: any;

    const processNextStep = () => {
      if (currentLogIndex < bootSteps.length) {
        const step = bootSteps[currentLogIndex];
        
        // Play terminal step click beep
        playClickSound();

        setLogs(prev => [...prev, `[ OK ] ${step.text}`]);
        setCurrentStep(currentLogIndex);
        
        // Progress percent boost
        const nextPercent = Math.min(100, Math.floor(((currentLogIndex + 1) / bootSteps.length) * 100));
        
        // Animate percentage increments
        let startPct = percent;
        const diff = nextPercent - startPct;
        const steps = 5;
        let s = 0;
        const pctInterval = setInterval(() => {
          if (s < steps) {
            setPercent(prev => Math.min(nextPercent, prev + Math.ceil(diff / steps)));
            s++;
          } else {
            clearInterval(pctInterval);
          }
        }, step.duration / steps);

        timer = setTimeout(() => {
          currentLogIndex++;
          processNextStep();
        }, step.duration);
      } else {
        setPercent(100);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    };

    processNextStep();

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-100 bg-[#050505] text-[#00FF00] font-mono flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Absolute CRT scanning line effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[size:100%_4px,3px_100%] z-50 opacity-30 pointer-events-none" />
      
      {/* Glitzy Cyberpunk Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff0005_1px,transparent_1px),linear-gradient(to_bottom,#00ff0005_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />

      <motion.div 
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#0a0a0a]/90 border border-[#00FF00]/30 rounded-xl shadow-[0_0_25px_rgba(0,255,0,0.1)] overflow-hidden flex flex-col relative z-20"
      >
        {/* Terminal Header */}
        <div className="bg-[#121212] border-b border-[#00FF00]/20 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#00FF00] animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-[#00FF00]/80 uppercase">
              DECRYPTING PORTFOLIO NODE
            </span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[#00FF00]/40 animate-pulse" />
          </div>
        </div>

        {/* Console Body */}
        <div className="p-5 space-y-4">
          {/* Scrolling simulated logs box */}
          <div className="bg-[#050505] border border-[#00FF00]/10 rounded-lg p-3.5 h-32 overflow-y-auto text-[10px] space-y-1 font-mono scrollbar-none">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-2 items-center text-[#00FF00]/80">
                <span className="leading-relaxed">{log}</span>
              </div>
            ))}
          </div>

          {/* Progress Section */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold font-mono">
              <span className="text-[#FF5C00] uppercase tracking-wider">
                DECRYPTING: {percent}%
              </span>
              <span className="text-[#00FF00]/60">PORT 3000 // HOST 0.0.0.0</span>
            </div>
            <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden border border-[#00FF00]/10">
              <div 
                className="bg-[#00FF00] h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_#00FF00]"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="bg-[#121212] border-t border-[#00FF00]/15 px-4 py-2 flex items-center justify-between text-[8px] text-[#00FF00]/40 select-none">
          <span>AES-256 ENCRYPTED</span>
          <button 
            onClick={onComplete}
            className="text-[9px] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            Skip [Enter] ⏭
          </button>
        </div>
      </motion.div>
    </div>
  );
}
