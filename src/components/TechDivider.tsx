import { motion } from 'motion/react';
import { Cpu, ShieldCheck } from 'lucide-react';

interface TechDividerProps {
  label?: string;
  subLabel?: string;
  hexNum?: string;
}

export default function TechDivider({ label, subLabel, hexNum = "0x00" }: TechDividerProps) {
  return (
    <div className="w-full flex items-center justify-between gap-4 py-2 select-none relative overflow-hidden group">
      {/* Decorative cyber grid scanline overlay (subtle) */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent" />

      {/* Left side tech structure */}
      <div className="flex items-center gap-2 z-10 shrink-0">
        <span className="text-[10px] font-mono text-outline-variant font-bold leading-none select-none">
          +
        </span>
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-low border border-outline-variant/30 text-[10px] font-mono text-on-surface-variant tracking-wider">
          <Cpu className="w-3 h-3 text-secondary animate-pulse" />
          <span>{hexNum}</span>
        </div>
        <div className="h-[2px] w-6 bg-gradient-to-r from-secondary/50 to-outline-variant/25 rounded-full" />
      </div>

      {/* Main horizontal line with custom laser flow animation */}
      <div className="flex-1 relative h-6 flex items-center justify-center">
        {/* Underlayer faint line */}
        <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-outline-variant/10 via-outline-variant/40 to-outline-variant/10" />
        
        {/* High-tech dashed segmented line */}
        <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-outline-variant to-transparent opacity-60 ml-4 mr-4 [mask-image:repeating-linear-gradient(90deg,black,black_8px,transparent_8px,transparent_16px)]" />

        {/* Central visual hub badge */}
        {(label || subLabel) && (
          <div className="relative z-10 px-4 bg-background-dark/90 backdrop-blur border border-outline-variant/50 rounded-full py-1 flex items-center gap-2.5 shadow-sm hover:border-secondary/40 transition-colors duration-300">
            {/* Tiny shield/lock locator indicator */}
            <ShieldCheck className="w-3 h-3 text-secondary" />
            
            {label && (
              <span className="font-mono text-[9px] sm:text-[10px] text-primary-fixed tracking-widest font-bold">
                {label.toUpperCase()}
              </span>
            )}
            
            {label && subLabel && (
              <span className="h-2 w-px bg-outline-variant" />
            )}

            {subLabel && (
              <span className="font-mono text-[9px] sm:text-[10px] text-on-surface-variant font-medium tracking-wide">
                {subLabel.toUpperCase()}
              </span>
            )}

            {/* Micro active pulsing particle inside the hub */}
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-secondary-dim"></span>
            </span>
          </div>
        )}

        {/* Dynamic sliding laser laser dot (light speed particle scan) */}
        <motion.div
          className="absolute h-[2px] w-16 bg-gradient-to-r from-transparent via-secondary to-transparent"
          initial={{ left: "-10%" }}
          animate={{ left: "110%" }}
          transition={{
            repeat: Infinity,
            duration: 3.5,
            ease: "linear",
            repeatDelay: 1
          }}
          style={{
            boxShadow: '0 0 8px #00FF00, 0 0 16px rgba(0,255,0,0.4)'
          }}
        />

        {/* Secondary opposite minor system scanline indicator */}
        <motion.div
          className="absolute h-[1px] w-8 bg-gradient-to-r from-transparent via-primary-fixed to-transparent opacity-80"
          initial={{ right: "-10%" }}
          animate={{ right: "110%" }}
          transition={{
            repeat: Infinity,
            duration: 4.5,
            ease: "linear",
            delay: 1.5,
            repeatDelay: 0.5
          }}
        />
      </div>

      {/* Right side tech structure */}
      <div className="flex items-center gap-2 z-10 shrink-0">
        <div className="h-[2px] w-6 bg-gradient-to-l from-secondary/50 to-outline-variant/25 rounded-full" />
        <div className="hidden sm:block text-[10px] font-mono text-on-surface-variant/80 tracking-wider">
          STATUS: <span className="text-secondary font-bold">LIVE</span>
        </div>
        <span className="text-[10px] font-mono text-outline-variant font-bold leading-none select-none">
          +
        </span>
      </div>
    </div>
  );
}
