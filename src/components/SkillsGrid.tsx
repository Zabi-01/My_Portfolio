import { useState } from 'react';
import { Terminal, Database, Shield, Code, Cpu, Network, Sparkles, Server, Flame, ShieldAlert, Key } from 'lucide-react';
import { motion } from 'motion/react';
import { Skill } from '../types';

const containerSkillVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemSkillVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

interface SkillsGridProps {
  skills?: Skill[];
}

export default function SkillsGrid({ skills = [] }: SkillsGridProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'red' | 'blue' | 'core'>('all');

  const iconMap = {
    Code: Code,
    Database: Database,
    Terminal: Terminal,
    Network: Network,
    Cpu: Cpu,
    Shield: Shield,
    GitFork: Shield,
    Search: Shield
  };

  // Filter skills based on tab selection
  // 'Offensive' maps to Red Team, 'Defensive' to Blue Team, 'Core' to Core
  const filteredSkills = skills.filter(skill => {
    if (activeTab === 'all') return true;
    if (activeTab === 'red') return skill.category === 'Offensive';
    if (activeTab === 'blue') return skill.category === 'Defensive';
    if (activeTab === 'core') return skill.category === 'Core';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tab Control Interface Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low p-4 rounded-3xl border border-outline-variant/30 select-none">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setActiveTab('all'); setSelectedSkill(null); }}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl cursor-pointer transition-all ${
              activeTab === 'all'
                ? 'bg-primary-fixed text-black font-semibold shadow-[0_0_12px_rgba(255,92,0,0.3)]'
                : 'bg-surface-container text-on-surface-variant border border-outline-variant/30 hover:text-white'
            }`}
          >
            [ All Skillsets ]
          </button>
          
          <button
            onClick={() => { setActiveTab('red'); setSelectedSkill(null); }}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl cursor-pointer transition-all flex items-center gap-1 ${
              activeTab === 'red'
                ? 'bg-error text-white font-semibold shadow-[0_0_12px_rgba(255,51,51,0.4)]'
                : 'bg-surface-container text-[#FF5555] border border-red-500/15 hover:bg-error/10 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> [ Red Team / Offensive ]
          </button>

          <button
            onClick={() => { setActiveTab('blue'); setSelectedSkill(null); }}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl cursor-pointer transition-all flex items-center gap-1 ${
              activeTab === 'blue'
                ? 'bg-secondary text-black font-semibold shadow-[0_0_12px_rgba(0,255,0,0.4)]'
                : 'bg-surface-container text-secondary border border-[#00ff00]/15 hover:bg-secondary/10 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> [ Blue Team / Defensive ]
          </button>

          <button
            onClick={() => { setActiveTab('core'); setSelectedSkill(null); }}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl cursor-pointer transition-all flex items-center gap-1 ${
              activeTab === 'core'
                ? 'bg-surface-container-highest text-white font-semibold border border-primary-fixed/40'
                : 'bg-surface-container text-on-surface-variant border border-outline-variant/30 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-primary-fixed" /> [ Core Foundations ]
          </button>
        </div>

        <div className="font-mono text-[11px] text-on-surface-variant flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
          MATCHED_ALLOCATIONS: <span className="text-secondary font-bold font-mono">{filteredSkills.length}</span>
        </div>
      </div>

      {/* Dynamic Skill Level Filter Info banner */}
      <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/30">
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-fixed animate-pulse" />
          Interactive Console: Click a skill card to dissect advanced execution vectors, core audits, and diagnostics.
        </span>
        <span className="hidden sm:inline text-secondary font-bold select-none">[ ENCRYPTED ]</span>
      </div>

      {filteredSkills.length === 0 ? (
        <div className="text-center p-12 glass-panel border border-outline-variant/30 rounded-3xl">
          <ShieldAlert className="w-12 h-12 text-error mx-auto mb-2 animate-bounce" />
          <p className="font-mono text-sm text-on-surface">No registered skillset blocks found in this sector cluster.</p>
          <span className="font-mono text-xs text-on-surface-variant">Inject some in the Decryption Panel to reload this node.</span>
        </div>
      ) : (
        <motion.div 
          key={activeTab} // reconstruct on tab change for playability
          variants={containerSkillVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {filteredSkills.map((skill) => {
            const IconComponent = iconMap[skill.iconName] || Terminal;
            const isSelected = selectedSkill?.name === skill.name;

            // Compute neon color highlights based on skill category
            let badgeText = "CORE";
            let colorString = "primary-fixed";
            let glowHoverClass = "cyber-glow-hover";
            let borderSelectedColor = "border-primary-fixed";
            let trailBgColor = "bg-[#FF5C00]/30";
            let categoryLabelColor = "text-[#FF5C00]";

            if (skill.category === 'Offensive') {
              badgeText = "RED TEAM";
              colorString = "error";
              glowHoverClass = "cyber-glow-hover-error";
              borderSelectedColor = "border-error";
              trailBgColor = "bg-[#FF3333]/30";
              categoryLabelColor = "text-[#FF5555]";
            } else if (skill.category === 'Defensive') {
              badgeText = "BLUE TEAM";
              colorString = "secondary";
              glowHoverClass = "cyber-glow-hover-lime";
              borderSelectedColor = "border-secondary";
              trailBgColor = "bg-[#00FF00]/30";
              categoryLabelColor = "text-secondary";
            }

            return (
              <motion.button
                key={skill.name}
                variants={itemSkillVariants}
                onClick={() => setSelectedSkill(isSelected ? null : skill)}
                className={`glass-panel p-6 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-300 group cursor-pointer text-center outline-none select-none border ${
                  isSelected 
                    ? `${borderSelectedColor} bg-surface-container-high shadow-[0_0_20px_rgba(var(--color-${colorString}),0.35)] scale-102` 
                    : `border-outline-variant/30 ${glowHoverClass} hover:scale-101`
                }`}
              >
                <div className={`p-4 rounded-full transition-transform duration-300 group-hover:scale-110 ${
                  isSelected 
                    ? `bg-surface-container-high text-${colorString}` 
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  <IconComponent className="w-8 h-8" />
                </div>

                <div className="space-y-1 w-full font-mono">
                  <span className={`text-[10px] tracking-widest ${categoryLabelColor} uppercase block font-bold select-none`}>
                    {badgeText}
                  </span>
                  <h4 className="font-sans text-sm font-bold text-on-surface group-hover:text-primary-fixed transition-colors">
                    {skill.name}
                  </h4>
                </div>

                {/* Secure proficiency bar */}
                <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden border border-outline-variant/20">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      isSelected ? `bg-${colorString}` : trailBgColor
                    }`}
                    style={{ width: `${skill.level}%` }}
                  />
                </div>

                <div className="font-mono text-[10px] text-on-surface-variant flex justify-between w-full">
                  <span>SECTOR_ID</span>
                  <span className="text-primary-fixed font-semibold">{skill.level}% PRO</span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Audit Detail Expansion Panel (Animated/Collapsible) */}
      {selectedSkill && (
        <div className="glass-panel p-6 rounded-3xl border border-primary-fixed/30 bg-surface-container-high/45 animate-[fadeIn_0.3s_ease_out] relative overflow-hidden">
          <div className="absolute right-3 top-3 select-none">
            <Server className="w-24 h-24 text-secondary/5 rotate-12 pointer-events-none" />
          </div>

          <div className="flex items-start gap-4">
            <div className={`mt-1 p-2 bg-primary-fixed/10 border ${
              selectedSkill.category === 'Offensive' ? 'border-error/40 text-[#FF5555]' : 
              selectedSkill.category === 'Defensive' ? 'border-secondary/40 text-secondary' : 
              'border-primary-fixed/40 text-primary-fixed'
            } rounded flex-shrink-0 animate-pulse`}>
              {selectedSkill.category === 'Offensive' ? <Flame className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            
            <div className="space-y-2 relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-primary-fixed font-bold tracking-wider">
                  [ INTROSPECT_SEC_AUDIT ]
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  selectedSkill.category === 'Offensive' ? 'border-error/30 text-error bg-error/10' :
                  selectedSkill.category === 'Defensive' ? 'border-secondary/30 text-secondary bg-secondary/10' :
                  'border-primary-fixed/30 text-primary-fixed bg-primary-fixed/10'
                }`}>
                  {selectedSkill.category === 'Offensive' ? 'RED TEAM (OFFENSIVE)' :
                   selectedSkill.category === 'Defensive' ? 'BLUE TEAM (DEFENSIVE)' :
                   'CORE SUBSTRUCTURE'}
                </span>
                <h5 className="font-sans font-bold text-base text-on-surface">
                  Cybersecurity Application: {selectedSkill.name}
                </h5>
              </div>
              <p className="font-mono text-sm leading-relaxed text-on-surface-variant">
                {selectedSkill.description}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-outline-variant/20 mt-2">
                <div className="font-mono text-[11px] text-on-surface-variant/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping" />
                  VERIFICATION COMPLETE: COMPLIANT WITH SEC_STANDARDS
                </div>
                {selectedSkill.externalUrl && (
                  <a
                    href={selectedSkill.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-primary-fixed text-black hover:bg-white transition-all font-mono text-[10px] font-extrabold rounded-xl flex items-center gap-1.5 hover:shadow-[0_0_12px_var(--color-primary-fixed-dim)] cursor-pointer select-none"
                    title="Inspect external project evidence repository"
                  >
                    <span>View Evidence Codebase →</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
