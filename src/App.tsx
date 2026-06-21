import { useState, useEffect } from 'react';
import { 
  Shield, School, Calendar, Terminal as TerminalIcon, Sparkles, Award, 
  Mail, ShieldAlert, Cpu, Heart, CheckCircle2, BookOpen, X
} from 'lucide-react';
import { motion } from 'motion/react';

import CyberCanvas from './components/CyberCanvas';
import Sidebar from './components/Sidebar';
import Terminal from './components/Terminal';
import SkillsGrid from './components/SkillsGrid';
import Certifications from './components/Certifications';
import ProjectsPanel from './components/ProjectsPanel';
import ContactForm from './components/ContactForm';
import ResumeBuilder from './components/ResumeBuilder';
import AdminPanel from './components/AdminPanel';
import BootSequence from './components/BootSequence';
import TechDivider from './components/TechDivider';
import CustomCursor from './components/CustomCursor';
import ScrollControls from './components/ScrollControls';
import { initialProfile, initialSkills, initialCertificates, initialBlogs, initialProjects, initialEducation } from './initialData';
import { ProfileInfo, Skill, Certificate, BlogPost, Project, Education } from './types';
import { playClickSound, playHoverSound, getSystemAudioEnabled, setSystemAudioEnabled } from './utils/audio';

// Firebase dynamic sync engines and security guards
import { db, auth } from './firebase';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [activeSection, setActiveSection] = useState('summary');
  const [showCvModal, setShowCvModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [termsNotification, setTermsNotification] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email?.toLowerCase() === 'zabihullah9046@gmail.com') {
          setFirebaseUser(user);
        } else {
          signOut(auth);
          setFirebaseUser(null);
          setShowAdminPanel(false);
          handleDisplayNotification("ACCESS DENIED: Credentials mismatch. Force decoupling session.");
        }
      } else {
        setFirebaseUser(null);
      }
    });
    return unsub;
  }, []);

  // Secure Inactivity Monitor: Auto-signout admin after 120 seconds of silence
  useEffect(() => {
    if (!firebaseUser) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        signOut(auth);
        handleDisplayNotification("PROTOCOL BREACH: Session terminated due to 120s inactivity.");
        setShowAdminPanel(false);
      }, 120000); // 120000ms = 2 minutes
    };

    const monitoringEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    monitoringEvents.forEach(evt => window.addEventListener(evt, resetInactivityTimer));

    resetInactivityTimer(); // Initial boot

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      monitoringEvents.forEach(evt => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [firebaseUser]);

  const [audioEnabled, setAudioEnabled] = useState(() => {
    return getSystemAudioEnabled();
  });

  // Keep preference saved
  useEffect(() => {
    setSystemAudioEnabled(audioEnabled);
  }, [audioEnabled]);

  // Theme & Canvas States
  const [themeScheme, setThemeScheme] = useState<string>(() => {
    return localStorage.getItem('cyber_theme_scheme') || 'dark-cosmic';
  });

  const [bgStyle, setBgStyle] = useState<'particles-drift' | 'cyber-grid' | 'clean'>(() => {
    const saved = localStorage.getItem('cyber_bg_style');
    if (saved === 'matrix-rain') return 'particles-drift';
    return (saved as any) || 'cyber-grid';
  });

  const [fontFamilyCombo, setFontFamilyCombo] = useState<string>(() => {
    return localStorage.getItem('cyber_font_family_combo') || 'modern-sans';
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Dynamic Theme Preset configurations
  const COLOR_SCHEMES: Record<string, Record<string, string>> = {
    'dark-cosmic': {
      '--color-primary-fixed': '#FF5C00',
      '--color-primary-fixed-dim': '#E04E00',
      '--color-on-primary-fixed': '#000000',
      '--color-secondary': '#00FF00',
      '--color-on-secondary': '#000000',
      '--color-background-dark': '#0A0A0A',
      '--color-surface-container': '#141414',
      '--color-surface-container-low': '#0F0F0F',
      '--color-surface-container-lowest': '#050505',
      '--color-surface-container-high': '#1E1E1E',
      '--color-surface-container-highest': '#282828',
      '--color-on-surface': '#ffffff',
      '--color-on-surface-variant': '#A3A3A3',
      '--color-outline-variant': '#262626',
      '--color-error': '#FF3333',
      '--color-error-container': '#550000',
      '--color-success': '#00FF00'
    },
    'dark-matrix': {
      '--color-primary-fixed': '#00FF00',
      '--color-primary-fixed-dim': '#00CC00',
      '--color-on-primary-fixed': '#000000',
      '--color-secondary': '#FF5C00',
      '--color-on-secondary': '#000000',
      '--color-background-dark': '#050B05',
      '--color-surface-container': '#0C180C',
      '--color-surface-container-low': '#081008',
      '--color-surface-container-lowest': '#040804',
      '--color-surface-container-high': '#142814',
      '--color-surface-container-highest': '#1E3A1E',
      '--color-on-surface': '#DCFCDC',
      '--color-on-surface-variant': '#8FBF8F',
      '--color-outline-variant': '#143514',
      '--color-error': '#FF3333',
      '--color-error-container': '#550000',
      '--color-success': '#00FF00'
    },
    'light-protocol': {
      '--color-primary-fixed': '#0A8491',
      '--color-primary-fixed-dim': '#076E79',
      '--color-on-primary-fixed': '#FFFFFF',
      '--color-secondary': '#008000',
      '--color-on-secondary': '#FFFFFF',
      '--color-background-dark': '#F4F7F6',
      '--color-surface-container': '#FFFFFF',
      '--color-surface-container-low': '#EDEFF1',
      '--color-surface-container-lowest': '#E5E8EA',
      '--color-surface-container-high': '#E1E4E6',
      '--color-surface-container-highest': '#D7DADE',
      '--color-on-surface': '#111A1C',
      '--color-on-surface-variant': '#4E5F62',
      '--color-outline-variant': '#D0DCE0',
      '--color-error': '#FF3333',
      '--color-error-container': '#FFCCCC',
      '--color-success': '#00FF00'
    },
    'light-retro': {
      '--color-primary-fixed': '#B14A00',
      '--color-primary-fixed-dim': '#903C00',
      '--color-on-primary-fixed': '#FFFFFF',
      '--color-secondary': '#115E59',
      '--color-on-secondary': '#FFFFFF',
      '--color-background-dark': '#FAF6EE',
      '--color-surface-container': '#FCFAF2',
      '--color-surface-container-low': '#F4ECE1',
      '--color-surface-container-lowest': '#EBE1D2',
      '--color-surface-container-high': '#E1D6C4',
      '--color-surface-container-highest': '#D0C2AB',
      '--color-on-surface': '#2E251B',
      '--color-on-surface-variant': '#6B5C4E',
      '--color-outline-variant': '#DFCBB4',
      '--color-error': '#B91C1C',
      '--color-error-container': '#FEE2E2',
      '--color-success': '#115E59'
    },
    'dark-cyberpunk': {
      '--color-primary-fixed': '#FF007F',
      '--color-primary-fixed-dim': '#C0005F',
      '--color-on-primary-fixed': '#000000',
      '--color-secondary': '#00F0FF',
      '--color-on-secondary': '#000000',
      '--color-background-dark': '#0B0516',
      '--color-surface-container': '#140E24',
      '--color-surface-container-low': '#0E091B',
      '--color-surface-container-lowest': '#06030D',
      '--color-surface-container-high': '#1E1632',
      '--color-surface-container-highest': '#2A1F42',
      '--color-on-surface': '#FFEEFF',
      '--color-on-surface-variant': '#B0A8C5',
      '--color-outline-variant': '#332454',
      '--color-error': '#FF3333',
      '--color-error-container': '#4A001A',
      '--color-success': '#00FFAD'
    },
    'dark-nordic': {
      '--color-primary-fixed': '#88C0D0',
      '--color-primary-fixed-dim': '#5E81AC',
      '--color-on-primary-fixed': '#2E3440',
      '--color-secondary': '#A3BE8C',
      '--color-on-secondary': '#2E3440',
      '--color-background-dark': '#1C2028',
      '--color-surface-container': '#242933',
      '--color-surface-container-low': '#20242D',
      '--color-surface-container-lowest': '#171A21',
      '--color-surface-container-high': '#2E3440',
      '--color-surface-container-highest': '#3B4252',
      '--color-on-surface': '#E5E9F0',
      '--color-on-surface-variant': '#9FB2C4',
      '--color-outline-variant': '#3D4653',
      '--color-error': '#BF616A',
      '--color-error-container': '#4C2429',
      '--color-success': '#A3BE8C'
    },
    'light-ocean': {
      '--color-primary-fixed': '#005D9E',
      '--color-primary-fixed-dim': '#003E6C',
      '--color-on-primary-fixed': '#FFFFFF',
      '--color-secondary': '#0284C7',
      '--color-on-secondary': '#FFFFFF',
      '--color-background-dark': '#EAF3F9',
      '--color-surface-container': '#FFFFFF',
      '--color-surface-container-low': '#DCEAF4',
      '--color-surface-container-lowest': '#CFDEE8',
      '--color-surface-container-high': '#C4D6E4',
      '--color-surface-container-highest': '#AEBFCB',
      '--color-on-surface': '#0D233A',
      '--color-on-surface-variant': '#34495E',
      '--color-outline-variant': '#AED0EB',
      '--color-error': '#DC2626',
      '--color-error-container': '#FEE2E2',
      '--color-success': '#16A34A'
    },
    'light-sleek': {
      '--color-primary-fixed': '#2563EB',
      '--color-primary-fixed-dim': '#1D4ED8',
      '--color-on-primary-fixed': '#FFFFFF',
      '--color-secondary': '#64748B',
      '--color-on-secondary': '#FFFFFF',
      '--color-background-dark': '#FFFFFF',
      '--color-surface-container': '#FFFFFF',
      '--color-surface-container-low': '#F8FAFC',
      '--color-surface-container-lowest': '#FFFFFF',
      '--color-surface-container-high': '#F1F5F9',
      '--color-surface-container-highest': '#E2E8F0',
      '--color-on-surface': '#0F172A',
      '--color-on-surface-variant': '#475569',
      '--color-outline-variant': '#CBD5E1',
      '--color-error': '#EF4444',
      '--color-error-container': '#FEE2E2',
      '--color-success': '#22C55E'
    }
  };

  const FONT_COMBOS: Record<string, Record<string, string>> = {
    'modern-sans': {
      '--font-sans': '"Inter", ui-sans-serif, system-ui, sans-serif',
      '--font-mono': '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace'
    },
    'cyber-technical': {
      '--font-sans': '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
      '--font-mono': '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace'
    },
    'space-grotesk': {
      '--font-sans': '"Space Grotesk", "Inter", ui-sans-serif, system-ui, sans-serif',
      '--font-mono': '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace'
    }
  };

  // Google Fonts stylesheet injection for Space Grotesk
  useEffect(() => {
    const linkId = 'cyber-fonts-gsetup';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Sync design CSS custom color variables
  useEffect(() => {
    const scheme = COLOR_SCHEMES[themeScheme] || COLOR_SCHEMES['dark-cosmic'];
    Object.entries(scheme).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
  }, [themeScheme]);

  // Sync typography font variables
  useEffect(() => {
    const combo = FONT_COMBOS[fontFamilyCombo] || FONT_COMBOS['modern-sans'];
    Object.entries(combo).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
  }, [fontFamilyCombo]);

  // Core Dynamic States retrieved from localStorage or fallback to standard templates
  const [profile, setProfile] = useState<ProfileInfo>(() => {
    try {
      const saved = localStorage.getItem('cyber_profile');
      return saved ? JSON.parse(saved) : initialProfile;
    } catch {
      return initialProfile;
    }
  });

  const [skills, setSkills] = useState<Skill[]>(() => {
    try {
      const saved = localStorage.getItem('cyber_skills');
      return saved ? JSON.parse(saved) : initialSkills;
    } catch {
      return initialSkills;
    }
  });

  const [certs, setCerts] = useState<Certificate[]>(() => {
    try {
      const saved = localStorage.getItem('cyber_certs');
      return saved ? JSON.parse(saved) : initialCertificates;
    } catch {
      return initialCertificates;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('cyber_projects');
      return saved ? JSON.parse(saved) : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('cyber_blogs');
      return saved ? JSON.parse(saved) : initialBlogs;
    } catch {
      return initialBlogs;
    }
  });

  const [educations, setEducations] = useState<Education[]>(() => {
    try {
      const saved = localStorage.getItem('cyber_educations');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : initialEducation;
      }
      return initialEducation;
    } catch {
      return initialEducation;
    }
  });

  // Real-time synchronization from Firestore with failsafe fallbacks
  useEffect(() => {
    // 1. Profile Live Tracker
    const unsubProfile = onSnapshot(doc(db, 'portfolio_settings', 'profile'), (snap) => {
      if (snap.exists()) {
        const val = snap.data() as ProfileInfo;
        setProfile(val);
        localStorage.setItem('cyber_profile', JSON.stringify(val));
      }
    }, (err) => {
      console.warn("Firestore subscription blocked or non-existent profile document:", err);
    });

    // 2. Skills Live Tracker
    const unsubSkills = onSnapshot(collection(db, 'skills'), (snap) => {
      const list: Skill[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as Skill);
      });
      setSkills(list);
      localStorage.setItem('cyber_skills', JSON.stringify(list));
    }, (err) => {
      console.warn("Firestore subscription blocked or unpopulated skills registry:", err);
    });

    // 3. Certifications Live Tracker
    const unsubCerts = onSnapshot(collection(db, 'certs'), (snap) => {
      const list: Certificate[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as Certificate);
      });
      setCerts(list);
      localStorage.setItem('cyber_certs', JSON.stringify(list));
    }, (err) => {
      console.warn("Firestore subscription blocked or unpopulated certifications registry:", err);
    });

    // 4. Blogs Live Tracker
    const unsubBlogs = onSnapshot(collection(db, 'blogs'), (snap) => {
      const list: BlogPost[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as BlogPost);
      });
      setBlogs(list);
      localStorage.setItem('cyber_blogs', JSON.stringify(list));
    }, (err) => {
      console.warn("Firestore subscription blocked or unpopulated blogs registry:", err);
    });

    // 5. Projects Live Tracker
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snap) => {
      const list: Project[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as Project);
      });
      setProjects(list.sort((a, b) => (a.order || 0) - (b.order || 0)));
      localStorage.setItem('cyber_projects', JSON.stringify(list));
    }, (err) => {
      console.warn("Firestore subscription blocked or unpopulated projects registry:", err);
    });

    // 6. Education Live Tracker
    const unsubEducations = onSnapshot(collection(db, 'education'), (snap) => {
      const list: import('./types').Education[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as import('./types').Education);
      });
      setEducations(list.sort((a, b) => (a.order || 0) - (b.order || 0)));
      localStorage.setItem('cyber_educations', JSON.stringify(list));
    }, (err) => {
      console.warn("Firestore subscription blocked or unpopulated education registry:", err);
    });

    return () => {
      unsubProfile();
      unsubSkills();
      unsubCerts();
      unsubBlogs();
      unsubProjects();
      unsubEducations();
    };
  }, []);

  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [selectedBlogCategory, setSelectedBlogCategory] = useState('All');

  // ScrollSpy Logic to automatically highlight Active Section in Navigation
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const handleScroll = () => {
      const sections = ['summary', 'skills', 'certifications', 'blogs', 'contact'];
      const scrollPosition = window.scrollY + 200; // Offset

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleDisplayNotification(msg: string) {
    setTermsNotification(msg);
    setTimeout(() => {
      setTermsNotification(null);
    }, 4000);
  }

  useEffect(() => {
    if (!isBooting) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 200);
    }
  }, [isBooting]);

  if (isBooting) {
    return <BootSequence onComplete={() => {
      window.scrollTo(0, 0);
      setIsBooting(false);
    }} />;
  }

  return (
    <div className="min-h-screen text-on-surface font-sans selection:bg-primary-fixed/30 selection:text-white flex flex-col md:flex-row relative">
      <CustomCursor />
      <ScrollControls />
      {/* Falling Particle Shader Background */}
      <CyberCanvas themeScheme={themeScheme} bgStyle={bgStyle} />

      {/* Cyber ambient grid lines overlay */}
      <div className="bg-pattern fixed inset-0 pointer-events-none z-[-1] opacity-70" />

      {/* Side Navigation panel */}
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenContactModal={() => handleDisplayNotification("Secure Contact Node activated. Scroll down to formulate secure packet.")}
        onOpenCvModal={() => setShowCvModal(true)}
        onOpenAdmin={() => setShowAdminPanel(true)}
        profile={profile}
        themeScheme={themeScheme}
        setThemeScheme={setThemeScheme}
        bgStyle={bgStyle}
        setBgStyle={setBgStyle}
        isAdmin={firebaseUser?.email?.toLowerCase() === 'zabihullah9046@gmail.com'}
      />

      {/* Notification Toast */}
      {termsNotification && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-surface-container border border-secondary shadow-lg animate-[fadeIn_0.2s_ease_out] flex items-center gap-2 font-mono text-xs text-secondary select-none max-w-sm">
          <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
          <span>{termsNotification}</span>
        </div>
      )}

      {/* Primary Scrollable Canvas Grid */}
      <main className="flex-1 w-full md:pl-[320px] pt-20 md:pt-12 pb-24 px-6 sm:px-14 max-w-[1440px] mx-auto space-y-12 md:space-y-16 relative z-10">
        
        {/* HERO SUMMARY SECTION */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          id="summary" 
          className="scroll-mt-24 space-y-8 select-all"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <p className="font-mono text-xs text-secondary tracking-widest uppercase font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
              SYSTEM OVERVIEW_STATION READY
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-on-surface tracking-tight leading-none">
              {profile.name}
            </h2>
            <div className="font-mono text-xs text-primary-fixed tracking-wide bg-primary-fixed/5 px-3 py-1 rounded-xl border border-primary-fixed/20 inline-block uppercase">
              {profile.title}
            </div>
          </motion.div>

          {/* Core competency Status Badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3 select-none">
            {(profile.competencies || []).map((comp) => (
              <span key={comp.id} className="px-3.5 py-1.5 bg-surface-container/90 backdrop-blur border border-outline-variant/50 rounded-xl text-xs font-mono text-on-surface-variant flex items-center gap-2 shadow-sm hover:border-secondary/50 transition-colors duration-200">
                <span className={`w-2 h-2 rounded-full ${comp.colorClass} ${comp.shadowColor}`} /> 
                {comp.label}
              </span>
            ))}
          </motion.div>

          {/* Interactive Live Shell console Terminal */}
          <motion.div variants={itemVariants} className="space-y-2">
            <span className="font-mono text-xs text-on-surface-variant block select-none">
              SECURE IDENTIFICATION PAYLOAD:
            </span>
            <Terminal profile={profile} skills={skills} certs={certs} educations={educations} />
          </motion.div>
        </motion.section>

        <TechDivider label="SYS.ACADEMIC" subLabel="Education Modules" hexNum="0x0A" />

        {/* EDUCATION ROADMAP SECTION */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          id="education" 
          className="scroll-mt-24 space-y-6"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 border-b border-outline-variant/40 pb-3">
            <School className="w-6 h-6 text-primary-fixed shadow-[0_0_8px_rgba(255,92,0,0.4)]" />
            <h3 className="text-xl font-extrabold text-on-surface uppercase tracking-tight">
              Education History
            </h3>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
            {(educations || []).map((edu) => (
              <div key={edu.id} className="glass-panel p-6 rounded-3xl border-l-4 border-l-primary-fixed cyber-glow-hover transition-all duration-300 relative overflow-hidden select-all group">
                <div className="absolute right-4 top-4 text-primary-fixed/5 pointer-events-none">
                  <School className="w-20 h-20 rotate-12 transition-transform duration-500 group-hover:rotate-0" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-secondary tracking-widest block uppercase font-bold select-none">
                      ACCREDITED ACADEMIC HOST
                    </span>
                    <h4 className="text-lg font-bold text-primary-fixed">
                      {edu.institution}
                    </h4>
                    <p className="text-sm text-on-surface font-semibold">
                      {edu.degree}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-on-surface-variant select-none">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary-fixed" /> {edu.period}
                    </span>
                    <span className="flex items-center gap-1.5 bg-surface-container px-2.5 py-0.5 rounded-xl border border-outline-variant/20">
                      <Cpu className="w-3.5 h-3.5 text-secondary" /> {edu.semester}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-4xl">
                    {edu.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.section>

        <TechDivider label="SYS.PROJECTS" subLabel="Field Operations" hexNum="0x0B" />

        {/* PROJECTS SECTION */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          id="projects" 
          className="scroll-mt-24 space-y-6"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 border-b border-outline-variant/40 pb-3">
            <TerminalIcon className="w-6 h-6 text-primary-fixed shadow-[0_0_8px_rgba(var(--color-primary-fixed),0.4)]" />
            <h3 className="text-xl font-extrabold text-on-surface uppercase tracking-tight">
              Project Deployments
            </h3>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ProjectsPanel projects={projects} />
          </motion.div>
        </motion.section>

        <TechDivider label="SYS.SKILLS" subLabel="Information Armory" hexNum="0x0C" />

        {/* TOP SKILLS SECTION */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          id="skills" 
          className="scroll-mt-24 space-y-6"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 border-b border-outline-variant/40 pb-3">
            <TerminalIcon className="w-6 h-6 text-secondary shadow-[0_0_8px_rgba(0,255,0,0.4)]" />
            <h3 className="text-xl font-extrabold text-on-surface uppercase tracking-tight">
              Top Technical Skills
            </h3>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SkillsGrid skills={skills} />
          </motion.div>
        </motion.section>

        <TechDivider label="SYS.CRITICAL" subLabel="Credential Verifications" hexNum="0x0D" />

        {/* VERIFIED CERTIFICATIONS SECTION */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          id="certifications" 
          className="scroll-mt-24 space-y-6"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 border-b border-outline-variant/40 pb-3">
            <Award className="w-6 h-6 text-secondary shadow-[0_0_8px_rgba(0,255,0,0.4)]" />
            <h3 className="text-xl font-extrabold text-on-surface uppercase tracking-tight">
              Verified Certifications
            </h3>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Certifications certs={certs} />
          </motion.div>
        </motion.section>

        <TechDivider label="SYS.INTELLIGENCE" subLabel="Blogs & Writeups" hexNum="0x0E" />

        {/* BLOGS SECTION */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          id="blogs" 
          className="scroll-mt-24 space-y-8"
        >
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-secondary/10 border border-secondary/30 rounded-xl">
                <BookOpen className="w-5 h-5 text-secondary shadow-[0_0_8px_rgba(0,255,0,0.4)] animate-pulse" />
              </span>
              <div>
                <h3 className="text-xl font-extrabold text-on-surface uppercase tracking-tight">
                  Blogs
                </h3>
                <p className="text-xs text-on-surface-variant font-mono">CYBER INTELLIGENCE DIARY // WRITEUPS</p>
              </div>
            </div>

            {/* Quick in-place search input */}
            <div className="relative w-full sm:w-64 select-none">
              <input 
                type="text"
                placeholder="Query database logs..."
                value={blogSearchQuery}
                onChange={(e) => setBlogSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/50 focus:border-secondary focus:ring-1 focus:ring-secondary/20 rounded-xl px-4 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all"
              />
            </div>
          </motion.div>

          {/* Categories Selector */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2 select-none">
            {['All', ...Array.from(new Set((blogs || []).map(b => b.category)))].map((cat) => {
              const catStr = String(cat);
              return (
                <button
                  key={catStr}
                  onClick={() => {
                    playClickSound();
                    setSelectedBlogCategory(catStr);
                  }}
                  className={`px-3 py-1 text-[10px] font-mono rounded-lg border transition-all cursor-pointer ${
                    selectedBlogCategory === catStr
                      ? 'bg-secondary/15 text-secondary border-secondary font-bold shadow-[0_0_12px_rgba(0,255,0,0.1)]'
                      : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:text-white hover:border-outline-variant'
                  }`}
                >
                  [{catStr.toUpperCase()}]
                </button>
              );
            })}
          </motion.div>

          {/* Blogs list or fallback */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(blogs || [])
              .filter(b => {
                const matchesCat = selectedBlogCategory === 'All' || b.category === selectedBlogCategory;
                const matchesSearch = b.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) || 
                                     b.summary.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                                     (b.tags && b.tags.some(t => t.toLowerCase().includes(blogSearchQuery.toLowerCase())));
                return matchesCat && matchesSearch;
              })
              .map((post) => (
                <div 
                  key={post.id}
                  onClick={() => {
                    playClickSound();
                    setActiveBlogPost(post);
                  }}
                  onMouseEnter={playHoverSound}
                  className="glass-panel group border border-outline-variant/40 hover:border-secondary/40 bg-surface-container-low/30 hover:bg-surface-container-low/60 rounded-3xl p-5 cursor-pointer flex flex-col justify-between gap-5 transition-all duration-300 relative overflow-hidden select-none"
                >
                  {/* Decorative glow backing */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors" />

                  <div className="space-y-4">
                    {/* Header Image or decorative terminal placeholder */}
                    {post.imageUrl ? (
                      <div className="w-full h-32 rounded-2xl overflow-hidden border border-outline-variant/30">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02] brightness-95" 
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 rounded-2xl bg-surface-container border border-outline-variant/30 p-4 font-mono text-[9px] text-secondary/70 flex flex-col justify-between leading-tight overflow-hidden select-none">
                        <div className="flex justify-between border-b border-outline-variant/20 pb-1">
                          <span>LOG_NODE_ID: {post.id.toUpperCase()}</span>
                          <span>SYS: OK</span>
                        </div>
                        <div className="py-2 opacity-60 font-medium whitespace-nowrap">
                          &gt; CAT {post.category.replace(/\s+/g, '_').toUpperCase()}<br />
                          &gt; READ_TIME: {post.readTime || '3 MIN'}<br />
                          &gt; STATUS: DECLASSIFIED
                        </div>
                        <div className="text-right text-[8px] text-on-surface-variant/40 font-mono">Zabih Security Terminal • 2026</div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span className="text-secondary">{post.readTime || '3 min'}</span>
                      </div>

                      <h4 className="font-sans font-extrabold text-base text-on-surface tracking-tight leading-snug group-hover:text-secondary transition-colors line-clamp-2">
                        {post.title}
                      </h4>

                      <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 select-all font-mono">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  {/* Tags and Action trigger */}
                  <div className="flex items-center justify-between gap-2 border-t border-outline-variant/20 pt-3 select-none">
                    <div className="flex flex-wrap gap-1">
                      {post.tags && post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[9px] font-mono text-on-surface-variant/80 bg-surface-container border border-outline-variant/30 px-1.5 py-0.5 rounded">
                          #{tag.toLowerCase()}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-secondary font-bold group-hover:underline flex items-center gap-1 shrink-0">
                      READ_FILE &gt;_
                    </span>
                  </div>
                </div>
              ))}
            
            {(blogs || []).filter(b => {
              const matchesCat = selectedBlogCategory === 'All' || b.category === selectedBlogCategory;
              const matchesSearch = b.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) || 
                                   b.summary.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                                   (b.tags && b.tags.some(t => t.toLowerCase().includes(blogSearchQuery.toLowerCase())));
              return matchesCat && matchesSearch;
            }).length === 0 && (
              <div className="p-8 border border-dashed border-outline-variant/30 rounded-3xl text-center md:col-span-2 select-none">
                <p className="text-xs font-mono text-on-surface-variant">No matching audit logs found in the security registers.</p>
              </div>
            )}
          </motion.div>
        </motion.section>

        <TechDivider label="SYS.COMMS" subLabel="Secure Terminus Link" hexNum="0x0F" />

        {/* CONTACT / CORRESPONDENCE FORM */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          id="contact" 
          className="scroll-mt-24 space-y-6"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 border-b border-outline-variant/40 pb-3">
            <Mail className="w-6 h-6 text-primary-fixed shadow-[0_0_8px_rgba(255,92,0,0.45)]" />
            <h3 className="text-xl font-extrabold text-on-surface uppercase tracking-tight">
              Secure Communications
            </h3>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ContactForm profile={profile} />
          </motion.div>
        </motion.section>

        {/* COMPLIANT RESUME VIEWER DRAWER */}
        {showCvModal && (
          <ResumeBuilder 
            onClose={() => setShowCvModal(false)} 
            profile={profile} 
            onNotify={handleDisplayNotification} 
            skills={skills}
            certs={certs}
            educations={educations}
          />
        )}

        {/* BLOG READER - FULL SCREEN PAGE EXPERIENCE */}
        {activeBlogPost && (
          <div className="fixed inset-0 z-55 bg-[#0D0E12] overflow-y-auto flex flex-col animate-[fadeIn_0.18s_ease_out]">
            {/* High-tech Sticky Header */}
            <div className="sticky top-0 z-10 w-full bg-surface-container-low/90 backdrop-blur border-b border-outline-variant/40 px-4 sm:px-8 py-4 flex items-center justify-between select-none">
              <button 
                onClick={() => {
                  playClickSound();
                  setActiveBlogPost(null);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/50 hover:border-secondary hover:text-white text-xs font-mono text-on-surface-variant transition-all cursor-pointer shadow-sm group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span>RETURN_TO_PORTFOLIO</span>
              </button>

              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                <span className="font-mono text-[10px] text-primary-fixed uppercase tracking-widest font-bold hidden xs:inline">
                  BLOG READOUT // LOG_{activeBlogPost.id.toUpperCase()}
                </span>
              </div>

              <button 
                onClick={() => {
                  playClickSound();
                  setActiveBlogPost(null);
                }}
                className="p-1.5 hover:bg-surface-container-high rounded-xl text-on-surface-variant hover:text-white cursor-pointer transition-colors"
                title="Dismiss readout session"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Centered Readout Body Panel for optimal readability */}
            <div className="flex-1 w-full max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-16 space-y-10 animate-[scaleIn_0.2s_ease_out]">
              {/* Cover Banner Header Image */}
              {activeBlogPost.imageUrl ? (
                <div className="w-full h-56 sm:h-80 md:h-96 rounded-3xl overflow-hidden border border-outline-variant/30 select-none relative shadow-lg">
                  <img 
                    src={activeBlogPost.imageUrl} 
                    alt={activeBlogPost.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter contrast-[1.03] brightness-[0.88] hover:scale-102 transition-transform duration-700" 
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0D0E12] to-transparent" />
                </div>
              ) : (
                <div className="w-full p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 font-mono text-xs text-secondary/70 flex flex-col justify-between leading-tight overflow-hidden select-none min-h-[140px] relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2 z-10">
                    <span>INDEX_REGISTERED_NODE_ID: {activeBlogPost.id.toUpperCase()}</span>
                    <span>SYSTEM_DECRYPTED: OK</span>
                  </div>
                  <div className="py-4 space-y-1 opacity-85 font-medium z-10 text-[11px]">
                    <div>&gt; LOG_NAME: {activeBlogPost.title.toUpperCase()}</div>
                    <div>&gt; CLASSIFICATION_CATEGORY: {activeBlogPost.category.replace(/\s+/g, '_').toUpperCase()}</div>
                    <div>&gt; AUTH_SIGNATURE: {activeBlogPost.author.toUpperCase()}</div>
                    <div>&gt; DECRYPT_DATE: {activeBlogPost.date.toUpperCase()}</div>
                  </div>
                  <div className="text-right text-[9px] text-on-surface-variant/40 font-mono z-10">Zabih Local Node Controller • Terminal Connection Established</div>
                </div>
              )}

              {/* Meta details alignment */}
              <div className="space-y-4 pb-6 border-b border-outline-variant/20">
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-on-surface-variant select-none">
                  <span className="px-2.5 py-1 bg-secondary/15 text-secondary border border-secondary/30 rounded-lg font-bold text-[10px] tracking-wider uppercase">
                    {activeBlogPost.category}
                  </span>
                  <span>{activeBlogPost.date}</span>
                  <span className="text-outline-variant/60">•</span>
                  <span className="text-secondary font-bold">{activeBlogPost.readTime || '3 min'}</span>
                  <span className="text-outline-variant/60">•</span>
                  <span>By: <strong className="text-on-surface">{activeBlogPost.author}</strong></span>
                </div>

                <h1 className="font-sans font-extrabold text-3xl sm:text-4xl md:text-5xl text-on-surface tracking-tight leading-tight select-all">
                  {activeBlogPost.title}
                </h1>

                {/* Tags block index bar */}
                {activeBlogPost.tags && activeBlogPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 select-none">
                    {(activeBlogPost.tags || []).map((tag) => (
                      <span key={tag} className="text-[10px] font-mono text-secondary hover:text-white bg-secondary/5 border border-secondary/15 hover:border-secondary/35 px-2.5 py-0.5 rounded-lg transition-colors">
                        #{tag.toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rich Markdown render payload panel */}
              <div className="space-y-8 text-on-surface-variant select-all font-sans">
                {activeBlogPost.content.split('\n\n').map((block, idx) => {
                  const trimmed = block.trim();
                  if (trimmed.startsWith('## ')) {
                    return (
                      <h2 key={idx} className="font-sans font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight pt-5 mt-6 border-b border-outline-variant/20 pb-2 uppercase select-all">
                        {trimmed.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (trimmed.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="font-sans font-bold text-lg sm:text-xl text-primary-fixed tracking-wide pt-4 mt-4 select-all">
                        {trimmed.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (trimmed.startsWith('```')) {
                    // Code block parser
                    const lines = trimmed.split('\n');
                    const bodyLines = lines.slice(1, lines.length - (lines[lines.length - 1].startsWith('```') ? 1 : 0));
                    return (
                      <div key={idx} className="relative group my-6">
                        <div className="absolute top-3 right-4 select-none text-[9px] font-mono text-on-surface-variant/40 uppercase tracking-widest">
                          Source Segment Code
                        </div>
                        <pre className="p-5 bg-[#08090C] border border-outline-variant/50 rounded-2xl font-mono text-xs overflow-x-auto text-secondary/95 shadow-lg select-all leading-relaxed whitespace-pre">
                          <code>{bodyLines.join('\n')}</code>
                        </pre>
                      </div>
                    );
                  }
                  if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                    // Bullets parser
                    const items = trimmed.split(/\n[\*-]\s+/);
                    return (
                      <ul key={idx} className="list-disc pl-6 py-2 space-y-3 select-all text-sm sm:text-base text-on-surface-variant/90 leading-relaxed">
                        {items.map((it, itemIdx) => (
                          <li key={itemIdx} className="leading-relaxed">
                            {it.replace(/^[\*-]\s+/, '')}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  // Standard academic/professional paragraph spacing and size
                  return (
                    <p key={idx} className="whitespace-pre-line select-all text-base sm:text-lg leading-relaxed text-on-surface-variant/90 font-sans tracking-normal font-light">
                      {trimmed}
                    </p>
                  );
                })}
              </div>

              {/* End status indicators */}
              <div className="border-t border-outline-variant/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container border border-outline-variant/40 text-on-surface-variant">
                    HASH: SHA-256 SECURED
                  </span>
                  <span className="text-xs text-on-surface-variant/40 font-mono">// END_OF_FILE_STREAM</span>
                </div>

                <button 
                  onClick={() => {
                    playClickSound();
                    setActiveBlogPost(null);
                    window.scrollTo({ top: document.getElementById('blogs')?.offsetTop || 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-secondary hover:bg-white text-black font-mono font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-secondary/10"
                >
                  ← Finished Reading
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER ANCHOR BLOCK */}
        <footer className="border-t border-outline-variant/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-on-surface-variant select-none">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-secondary" />
            <span>© 2026 {profile.name}. Secured Local Environment.</span>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => handleDisplayNotification("Local security protocol: Communications are fully end-to-end encrypted on the client socket.")}
              className="hover:text-secondary transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-outline-variant/55">•</span>
            <button 
              onClick={() => handleDisplayNotification("Terms: Access is provided under open-source portfolio distribution rules.")}
              className="hover:text-secondary transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
          </div>
        </footer>

      </main>

      {/* SECURE ADMINISTRATOR CONTROL DASHBOARD */}
      <AdminPanel 
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        profile={profile}
        setProfile={setProfile}
        skills={skills}
        setSkills={setSkills}
        certs={certs}
        setCerts={setCerts}
        projects={projects}
        setProjects={setProjects}
        blogs={blogs}
        setBlogs={setBlogs}
        educations={educations}
        setEducations={setEducations}
        onNotify={handleDisplayNotification}
        themeScheme={themeScheme}
        setThemeScheme={setThemeScheme}
        bgStyle={bgStyle}
        setBgStyle={setBgStyle}
        fontFamilyCombo={fontFamilyCombo}
        setFontFamilyCombo={setFontFamilyCombo}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
      />
    </div>
  );
}
