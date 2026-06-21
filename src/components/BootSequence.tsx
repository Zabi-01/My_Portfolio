import { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Check, Shield, Lock, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playBootAudioSequence, playClickSound } from '../utils/audio';

interface BootSequenceProps {
  onComplete: () => void;
}

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+~`|}{[]:;?><,./-=";
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = new Array(columns).fill(1).map(() => Math.floor(Math.random() * -100));

    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 5, 0.15)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#00FF00";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-[0.12] pointer-events-none" />;
};

const SystemPulse = () => {
  return (
    <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
      {/* Outer Rotating Circles */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border border-t-[#00FF00]/40 border-r-transparent border-b-transparent border-l-transparent rounded-full shadow-[0_0_15px_rgba(0,255,0,0.1)]"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-4 border border-b-[#00FF00]/30 border-t-transparent border-r-transparent border-l-transparent rounded-full"
      />
      
      {/* Core Hexagon / Pulse */}
      <div className="relative z-10 flex items-center justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <Shield className="w-16 h-16 text-[#00FF00] drop-shadow-[0_0_15px_rgba(0,255,0,0.6)]" />
          
          {/* Internal data pings */}
          <motion.div 
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 border-2 border-[#00FF00] rounded-full blur-md"
          />
        </motion.div>

        {/* Floating Data Bits */}
        <div className="absolute -inset-10 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -40, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                delay: i * 0.4,
                ease: "easeInOut" 
              }}
              className="absolute text-[8px] font-mono text-[#00FF00]"
              style={{
                left: `${50 + 40 * Math.cos(i * Math.PI / 4)}%`,
                top: `${50 + 40 * Math.sin(i * Math.PI / 4)}%`,
              }}
            >
              {Math.random() > 0.5 ? '1' : '0'}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Horizon Scanner */}
      <motion.div 
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        className="absolute h-[1px] left-[-20%] right-[-20%] bg-linear-to-r from-transparent via-[#00FF00]/50 to-transparent shadow-[0_0_10px_#00FF00] opacity-30 z-20 pointer-events-none"
      />
    </div>
  );
};

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [percent, setPercent] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const bootSteps = [
    { text: "INITIALIZING ENCRYPTED KERNEL...", duration: 200 },
    { text: "MOUNTING SYSTEM NODES...", duration: 150 },
    { text: "ESTABLISHING SECURE HANDSHAKE...", duration: 180 },
    { text: "VERIFYING BIOMETRIC HASHES...", duration: 140 },
    { text: "DECRYPTING PORTFOLIO ASSETS...", duration: 160 },
    { text: "SYSTEM STABILIZED. ACCESS GRANTED.", duration: 120 }
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

        setLogs(prev => [...prev.slice(-15), `[ OK ] ${step.text}`]);
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
    <div className="fixed inset-0 z-[200] bg-[#050505] text-[#00FF00] font-mono flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Matrix Code Rain Background */}
      <MatrixRain />

      <SystemPulse />


      {/* Absolute CRT scanning line effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[size:100%_4px,3px_100%] z-50 opacity-30 pointer-events-none" />
      
      {/* Glitzy Cyberpunk Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff0005_1px,transparent_1px),linear-gradient(to_bottom,#00ff0005_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />

      {/* Floating Animated Hacker Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 100 + "%", y: "110%" }}
            animate={{ 
              y: "-10%",
              x: (Math.random() * 100) + "%",
              rotate: 360
            }}
            transition={{ 
              duration: 15 + Math.random() * 10, 
              repeat: Infinity,
              ease: "linear",
              delay: i * 3
            }}
            className="absolute"
          >
            {i % 2 === 0 ? <Shield className="w-12 h-12" /> : <Lock className="w-12 h-12" />}
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg bg-[#0a0a0a]/90 border border-[#00FF00]/40 rounded-xl shadow-[0_0_50px_rgba(0,255,0,0.15)] overflow-hidden flex flex-col relative z-20 backdrop-blur-md"
      >
        {/* Terminal Header */}
        <div className="bg-[#121212] border-b border-[#00FF00]/25 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Cpu className="w-4 h-4 text-[#00FF00] animate-pulse" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-[#00FF00] rounded-full blur-sm"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#00FF00] uppercase">
                SYSTEM OVERRIDE IN PROGRESS
              </span>
              <span className="text-[7px] text-[#00FF00]/50 font-mono">NODE_IDENTIFIER: 0x74860FD3</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Activity className="w-4 h-4 text-primary-fixed/40 animate-bounce" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#00FF00] shadow-[0_0_8px_#00FF00] animate-pulse" />
          </div>
        </div>

        {/* Console Body */}
        <div className="p-6 space-y-5">
          {/* Scrolling simulated logs box */}
          <div className="bg-[#050505] border border-[#00FF00]/15 rounded-lg p-4 h-40 overflow-y-auto text-[11px] space-y-1.5 font-mono scrollbar-none shadow-inner">
            <AnimatePresence mode="popLayout">
              {logs.map((log, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 items-center text-[#00FF00]/90"
                >
                  <span className="text-[#00FF00]/40 font-bold">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                  <span className="leading-relaxed">{log}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="animate-pulse inline-block w-2 h-3.5 bg-[#00FF00]/60 ml-1 translate-y-0.5" />
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold font-mono">
              <span className="text-[#00FF00] flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF00]"></span>
                </span>
                DECODING PROTOCOL: {percent}%
              </span>
              <span className="text-[#00FF00]/40 tracking-wider">BIT_STREAM_ACTIVE</span>
            </div>
            <div className="w-full bg-[#111] h-2.5 rounded-full overflow-hidden border border-[#00FF00]/20 p-[2px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                className="bg-[linear-gradient(90deg,#00FF0044_0%,#00FF00_50%,#00FF0044_100%)] bg-[length:200%_100%] h-full rounded-full shadow-[0_0_15px_#00FF0066]"
                style={{ 
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite linear'
                }}
              />
            </div>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="bg-[#121212] border-t border-[#00FF00]/20 px-5 py-3 flex items-center justify-between text-[9px] text-[#00FF00]/50 select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> SECURED</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> AES-256-GCM</span>
          </div>
          <button 
            onClick={onComplete}
            className="text-[10px] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 bg-[#00FF00]/5 border border-[#00FF00]/20 px-2 py-0.5 rounded hover:bg-[#00FF00]/20"
          >
            BYPASS_AUTH [ESC] ⏭
          </button>
        </div>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
