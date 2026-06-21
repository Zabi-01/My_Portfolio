import { useState, useEffect, useRef } from 'react';
import { User, Terminal, Award, Mail, FileDown, Github, Linkedin, Menu, X, Link as LinkIcon, Code, ShieldAlert, Key, Twitter, BookOpen, Image } from 'lucide-react';
import { ProfileInfo } from '../types';
import { playClickSound, playHoverSound } from '../utils/audio';
import { motion } from 'motion/react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenContactModal: () => void;
  onOpenCvModal: () => void;
  onOpenAdmin: () => void;
  profile: ProfileInfo;
  themeScheme: string;
  setThemeScheme: (scheme: string) => void;
  bgStyle: 'particles-drift' | 'cyber-grid' | 'clean';
  setBgStyle: (style: 'particles-drift' | 'cyber-grid' | 'clean') => void;
  isAdmin?: boolean;
}

export default function Sidebar({
  activeSection, 
  setActiveSection, 
  onOpenContactModal, 
  onOpenCvModal,
  onOpenAdmin,
  profile,
  themeScheme,
  setThemeScheme,
  bgStyle,
  setBgStyle,
  isAdmin = false
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  const menuListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const el = document.getElementById(`nav-${activeSection}`);
    if (el && menuListRef.current) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [activeSection]);

  const menuItems = [
    { id: 'summary', label: 'Summary', icon: User },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'skills', label: 'Skills', icon: Terminal },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'blogs', label: 'Blogs', icon: BookOpen },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const handleNavClick = (sectionId: string) => {
    playClickSound();
    setActiveSection(sectionId);
    setIsOpen(false);
    
    // Smooth scroll
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // offset for mobile header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const headShotUrl = profile.profilePic || "https://lh3.googleusercontent.com/aida-public/AB6AXuAyRfk862E64ISMGMNoE6ApQUAB9FK0_sxj1YwPgyQjJgy61k5yKVGmoxotUCgjKCfW72s5l0Pf-UNjAniHN5OuAwoeEFy1hIWRxJn3F-xO1H3QNvD-kDd7sttDIESC0Rxf8L16Vk9e1iJKHuKgXaRXJYZ3fk6hXZCrgjUt-dvAf1T-AXLm3dmeYhIE6WUMD_6_RlAO-P38kxAJ4oT9aTCBlKaUfGGwIp0vb4NHumwCBkmeo6tRNxbh3wSO2UJV46ym2xgL1v2wL20";

  return (
    <>
      {/* Mobile Header Navigation Menu */}
      <nav id="mobile-header" className="md:hidden flex justify-between items-center px-6 h-16 w-full bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline-variant fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="font-sans text-lg font-bold text-primary-fixed tracking-tight hover:pulse-ambient transition-all select-none">
          {profile.name}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-on-surface hover:text-primary-fixed transition-colors active:scale-95"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6 text-error" /> : <Menu className="w-6 h-6 text-primary-fixed" />}
        </button>
      </nav>

      {/* Mobile Drawer Overlay Background blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Navigation Bar (Dual Responsive Layout) */}
      <motion.nav 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: (isDesktop || isOpen) ? 0 : -300, opacity: (isDesktop || isOpen) ? 1 : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed top-0 bottom-0 left-0 h-full w-[300px] bg-surface-container-lowest border-r border-outline-variant flex flex-col z-45 shadow-2xl py-6 md:py-8`}
      >
        {/* Profile Card Block */}
        <div className="px-8 flex flex-col items-center mb-8 mt-4 md:mt-0">
          <div className="relative group">
            {/* Rotating Tech Orbitals */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-dashed border-primary-fixed/20 rounded-full pointer-events-none"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 border border-primary-fixed/10 rounded-full pointer-events-none"
            />
            
            {/* Profile Image Container */}
            <div className="relative w-40 h-40 rounded-3xl overflow-hidden border-2 border-primary-fixed shadow-[0_0_30px_rgba(255,92,0,0.2)] transition-all hover:shadow-[0_0_40px_rgba(255,92,0,0.4)] duration-500 z-10 flex items-center justify-center bg-black/40">
              <img 
                className="w-full h-full object-cover select-none scale-110 hover:scale-125 transition-transform duration-700 origin-center filter contrast-[1.05] brightness-[1.05]" 
                src={headShotUrl}
                alt="Zabih Ullah Professional Headshot" 
                referrerPolicy="no-referrer"
              />
              
              {/* Scanline Effect */}
              <motion.div 
                animate={{ top: ['-10%', '110%', '-10%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 w-full h-[1.5px] bg-primary-fixed/60 shadow-[0_0_10px_var(--color-primary-fixed)] z-20 opacity-50"
              />

              {/* Ambient cyber grid scanline overlay inside avatar */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-10" />
            </div>

            {/* Corner Markers */}
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-primary-fixed z-20" />
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-primary-fixed z-20" />
            
            {/* Status Indicator Pulse */}
            <div className="absolute -bottom-2 -right-2 bg-black border border-primary-fixed/40 px-2 py-0.5 rounded text-[8px] font-mono text-primary-fixed z-30 uppercase tracking-tighter">
              id_valid
            </div>
          </div>

          <h1 className="font-sans text-xl font-extrabold text-on-surface text-center mt-6 mb-2 select-all tracking-tight uppercase">
            {profile.name}
          </h1>
        </div>

        <ul ref={menuListRef} className="flex flex-col w-full font-mono text-sm flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <button
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  onMouseEnter={playHoverSound}
                  className={`flex items-center gap-4 w-full text-left px-8 py-4 transition-all duration-300 border-l-4 cursor-pointer outline-none group/item ${
                    isActive
                      ? 'bg-primary-fixed/10 text-primary-fixed border-primary-fixed font-bold shadow-[inset_4px_0_12px_rgba(255,92,0,0.1)]'
                      : 'text-on-surface-variant/80 border-transparent hover:text-primary-fixed hover:bg-surface-container-low hover:border-primary-fixed/40'
                  }`}
                >
                  <div className={`transition-transform duration-300 group-hover/item:scale-110 ${isActive ? 'scale-110' : ''}`}>
                    <IconComponent className={`w-5 h-5 ${isActive ? 'text-primary-fixed' : ''}`} />
                  </div>
                  <span className="tracking-[0.1em] uppercase text-[11px] font-bold">
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-glow"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-fixed shadow-[0_0_10px_var(--color-primary-fixed)]"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        
        {/* Placeholder removed */}
        
        {/* Bottom Utility Panel */}
        <div className="mt-auto px-8 w-full flex flex-col gap-3">
          {/* Quick Mode Toggler */}
          <div className="flex items-center justify-between px-3.5 py-2.5 text-xs font-mono text-on-surface-variant bg-surface-container-low/60 rounded-2xl border border-outline-variant/30 select-none">
            <span className="text-[10px] tracking-wider text-on-surface/80 uppercase font-semibold">THEME_CORE</span>
            <button
              onClick={() => {
                playClickSound();
                const themes = ['dark-cosmic', 'light-sleek', 'light-protocol', 'dark-nordic'];
                const currentIndex = themes.indexOf(themeScheme);
                const nextScheme = themes[(currentIndex + 1) % themes.length];
                setThemeScheme(nextScheme);
                localStorage.setItem('cyber_theme_scheme', nextScheme);
              }}
              onMouseEnter={playHoverSound}
              className="px-2 py-0.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 hover:border-primary-fixed text-primary-fixed rounded-lg cursor-pointer text-[10px] font-bold transition-all"
              title="Instant mode toggler"
            >
              [ CYCLE_THEME ]
            </button>
          </div>

          {/* Quick Background Selector */}
          <div className="flex flex-col gap-1.5 p-3 text-xs font-mono text-on-surface-variant bg-surface-container-low/60 rounded-2xl border border-outline-variant/30 select-none">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-wider text-on-surface/80 uppercase font-semibold">BG_SHADER</span>
              <span className="text-[8px] bg-[#00FF00]/15 text-[#00FF00] px-1 rounded border border-[#00FF00]/20 font-bold uppercase">{bgStyle}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 select-none">
              {(['cyber-grid', 'particles-drift', 'clean'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    playClickSound();
                    setBgStyle(style);
                    localStorage.setItem('cyber_bg_style', style);
                  }}
                  onMouseEnter={playHoverSound}
                  className={`py-1 px-1 rounded font-mono text-[9px] font-bold text-center border cursor-pointer uppercase transition-all ${
                    bgStyle === style 
                      ? 'bg-primary-fixed/20 text-primary-fixed border-primary-fixed' 
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant/70 border-outline-variant/40'
                  }`}
                  title={`Shift configuration to ${style.toUpperCase()}`}
                >
                  {style === 'cyber-grid' ? 'GRID' : style === 'particles-drift' ? 'DRIFT' : 'OFF'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onOpenCvModal();
            }}
            onMouseEnter={playHoverSound}
            className="w-full py-3 bg-primary-fixed text-black font-mono text-xs font-bold rounded-2xl hover:bg-primary-fixed-dim transition-all tracking-wider uppercase glitch-hover shadow-[0_0_12px_rgba(255,92,0,0.25)] flex items-center justify-center gap-2 cursor-pointer border border-transparent select-none active:scale-98"
          >
            <FileDown className="w-4 h-4" /> Download CV
          </button>
          
          <div className="flex justify-center flex-wrap gap-3.5 mt-2 pt-4 border-t border-outline-variant/30 text-on-surface-variant">
            <button 
              onClick={onOpenContactModal} 
              className="hover:text-secondary hover:scale-110 drop-shadow-[0_0_8px_rgba(188,255,95,0.3)] transition-all cursor-pointer p-1"
              title="Secure encrypted contact payload"
            >
              <LinkIcon className="w-4.5 h-4.5" />
            </button>
            {profile.github && profile.github.trim() !== "" && (
              <a 
                href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-primary-fixed hover:scale-110 drop-shadow-[0_0_8px_rgba(125,244,255,0.3)] transition-all p-1"
                title="GitHub Open Repository"
              >
                <Github className="w-4.5 h-4.5" />
              </a>
            )}
            {profile.linkedin && profile.linkedin.trim() !== "" && (
              <a 
                href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-primary-fixed hover:scale-110 drop-shadow-[0_0_8px_rgba(125,244,255,0.3)] transition-all p-1"
                title="LinkedIn Cyber Profile"
              >
                <Linkedin className="w-4.5 h-4.5" />
              </a>
            )}
            {profile.twitter && profile.twitter.trim() !== "" && (
              <a 
                href={profile.twitter.startsWith('http') ? profile.twitter : `https://${profile.twitter}`} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-primary-fixed hover:scale-110 drop-shadow-[0_0_8px_rgba(125,244,255,0.3)] transition-all p-1"
                title="Twitter / X Profile"
              >
                <Twitter className="w-4.5 h-4.5" />
              </a>
            )}
            
            {/* Admin Key Cryptographic Access Trigger Gateway */}
            {isAdmin ? (
              <button
                onClick={onOpenAdmin}
                className="hover:text-secondary hover:scale-110 drop-shadow-[0_0_8px_rgba(0,255,0,0.45)] text-secondary animate-pulse transition-all cursor-pointer p-1"
                title="TERMINAL_GATEWAY_ACCESS"
              >
                <Key className="w-4.5 h-4.5" />
              </button>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="hover:text-primary-fixed hover:scale-110 opacity-40 hover:opacity-100 transition-all cursor-pointer p-1"
                title="ENCRYPTED_ENTRY_POINT"
              >
                <ShieldAlert className="w-4.5 h-4.5 text-primary-fixed/60 hover:text-primary-fixed" />
              </button>
            )}
          </div>
        </div>
      </motion.nav>
    </>
  );
}
