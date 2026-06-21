import { useState, useRef } from 'react';
import { 
  X, Printer, Target, Shield, HelpCircle, 
  MapPin, Mail, Phone, Calendar, Briefcase, Award, Download, Loader2, ArrowLeft
} from 'lucide-react';
import { ProfileInfo, Skill, Certificate } from '../types';
import { initialProfile, initialSkills, initialCertificates } from '../initialData';

interface ResumeBuilderProps {
  onClose: () => void;
  profile?: ProfileInfo;
  onNotify?: (msg: string) => void;
  skills?: Skill[];
  certs?: Certificate[];
}

export default function ResumeBuilder({ onClose, profile, onNotify, skills, certs }: ResumeBuilderProps) {
  const [profileFocus, setProfileFocus] = useState<'all' | 'red' | 'blue'>('all');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const printableRef = useRef<HTMLDivElement | null>(null);
  
  const activeProfile = profile || initialProfile;

  const activeSkills: Skill[] = skills || (() => {
    try {
      const saved = localStorage.getItem('cyber_skills');
      return saved ? JSON.parse(saved) : initialSkills;
    } catch {
      return initialSkills;
    }
  })();

  const activeCerts: Certificate[] = certs || (() => {
    try {
      const saved = localStorage.getItem('cyber_certs');
      return saved ? JSON.parse(saved) : initialCertificates;
    } catch {
      return initialCertificates;
    }
  })();

  const offensiveSkills = activeSkills.filter(s => s.category === 'Offensive');
  const defensiveSkills = activeSkills.filter(s => s.category === 'Defensive');
  const coreSkills = activeSkills.filter(s => s.category === 'Core');

  const handlePrint = () => {
    window.print();
  };

  const convertOklColorToStandard = (colorStr: string): string => {
    if (typeof colorStr !== 'string') return colorStr;
    
    // Replace oklch(...) occurrences
    let result = colorStr.replace(/oklch\(([^)]+)\)/g, (match, contents) => {
      try {
        const parts = contents.trim().split(/[\s,/\s]+/).filter(Boolean);
        if (parts.length >= 3) {
          let L = parseFloat(parts[0]);
          if (parts[0].includes('%')) L = L / 100;
          
          let C = parseFloat(parts[1]);
          if (parts[1].includes('%')) C = C / 100;
          
          const H = parseFloat(parts[2]);
          
          let alpha = 1;
          if (parts.length >= 4) {
            alpha = parseFloat(parts[3]);
            if (parts[3].includes('%')) alpha = alpha / 100;
          }
          
          const hue = isNaN(H) ? 0 : ((H % 360) + 360) % 360;
          const sat = Math.min(100, Math.max(0, (C / 0.4) * 100));
          const light = Math.min(100, Math.max(0, L * 100));
          
          if (parts.length >= 4) {
            return `hsla(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%, ${alpha})`;
          } else {
            return `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%)`;
          }
        }
      } catch (e) {
        console.warn("Failed parsing oklch color:", match, e);
      }
      return 'rgba(0,0,0,0)';
    });

    // Replace oklab(...) occurrences
    result = result.replace(/oklab\(([^)]+)\)/g, (match, contents) => {
      try {
        const parts = contents.trim().split(/[\s,/\s]+/).filter(Boolean);
        if (parts.length >= 3) {
          let L = parseFloat(parts[0]);
          if (parts[0].includes('%')) L = L / 100;
          
          const a = parseFloat(parts[1]);
          const b = parseFloat(parts[2]);
          
          let alpha = 1;
          if (parts.length >= 4) {
            alpha = parseFloat(parts[3]);
            if (parts[3].includes('%')) alpha = alpha / 100;
          }
          
          const C = Math.sqrt(a * a + b * b);
          let H = Math.atan2(b, a) * (180 / Math.PI);
          if (H < 0) H += 360;
          
          const hue = isNaN(H) ? 0 : ((H % 360) + 360) % 360;
          const sat = Math.min(100, Math.max(0, (C / 0.4) * 100));
          const light = Math.min(100, Math.max(0, L * 100));
          
          if (parts.length >= 4) {
            return `hsla(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%, ${alpha})`;
          } else {
            return `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%)`;
          }
        }
      } catch (e) {
        console.warn("Failed parsing oklab color:", match, e);
      }
      return 'rgba(0,0,0,0)';
    });

    return result;
  };

  const cleanOklabColors = async () => {
    const styleBackups: { el: HTMLStyleElement; originalText: string }[] = [];
    const linkBackups: { el: HTMLLinkElement; tempStyleEl: HTMLStyleElement }[] = [];

    // Setup monkeypatch for computed styles
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function (elt, pseudoElt) {
      const style = originalGetComputedStyle.call(window, elt, pseudoElt);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return function(this: any, name: string) {
              try {
                const val = target.getPropertyValue(name);
                return convertOklColorToStandard(val);
              } catch (e) {
                return '';
              }
            };
          }
          
          try {
            const value = target[prop as any];
            if (typeof value === 'string') {
              return convertOklColorToStandard(value);
            }
            if (typeof value === 'function') {
              return value.bind(target);
            }
            return value;
          } catch (e) {
            return undefined;
          }
        }
      });
    };

    try {
      // 1. Process all <style> elements
      const styleEls = Array.from(document.querySelectorAll('style'));
      for (const el of styleEls) {
        const text = el.textContent || '';
        if (text.includes('oklab') || text.includes('oklch')) {
          styleBackups.push({ el, originalText: text });
          const cleaned = text.replace(/okl(ab|ch)\([^)]+\)/g, (match) => convertOklColorToStandard(match));
          el.textContent = cleaned;
        }
      }

      // 2. Process all <link rel="stylesheet"> elements
      const linkEls = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
      for (const el of linkEls) {
        try {
          const href = el.href;
          if (href && (href.startsWith(window.location.origin) || href.startsWith('/') || !href.startsWith('http'))) {
            const response = await fetch(href);
            if (response.ok) {
              const text = await response.text();
              if (text.includes('oklab') || text.includes('oklch')) {
                const cleaned = text.replace(/okl(ab|ch)\([^)]+\)/g, (match) => convertOklColorToStandard(match));
                
                // Create temp style
                const tempStyleEl = document.createElement('style');
                tempStyleEl.setAttribute('data-temp-clean', 'true');
                tempStyleEl.textContent = cleaned;
                document.head.appendChild(tempStyleEl);

                // Disable original link
                el.disabled = true;
                linkBackups.push({ el, tempStyleEl });
              }
            }
          }
        } catch (e) {
          console.warn("Could not clean link stylesheet:", el.href, e);
        }
      }
    } catch (err) {
      console.error("Error during color cleanup setup:", err);
    }

    return () => {
      // Restore getComputedStyle
      window.getComputedStyle = originalGetComputedStyle;

      // Restore styles
      styleBackups.forEach(({ el, originalText }) => {
        el.textContent = originalText;
      });

      // Restore links
      linkBackups.forEach(({ el, tempStyleEl }) => {
        el.disabled = false;
        tempStyleEl.remove();
      });
    };
  };

  const handleExportPDF = async () => {
    if (!printableRef.current) return;
    setIsExportingPDF(true);

    const restoreStyles = await cleanOklabColors();

    const element = printableRef.current;
    
    const opt = {
      margin:       0.3,
      filename:     `resume_${activeProfile.name.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#0c0f1d' 
      },
      jsPDF:        { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
    };

    // @ts-ignore
    import('html2pdf.js').then((module) => {
      // Robust resolution of default constructor in various environments (CommonJS/ESM mix)
      let html2pdf = module.default || module;
      if (html2pdf && typeof html2pdf !== 'function' && (html2pdf as any).default) {
        html2pdf = (html2pdf as any).default;
      }

      if (typeof html2pdf !== 'function') {
        throw new Error("html2pdf generator library is not a callable function.");
      }

      html2pdf().from(element).set(opt).save().then(() => {
        setIsExportingPDF(false);
        if (typeof restoreStyles === 'function') restoreStyles();
        if (onNotify) {
          onNotify("DOWNLOAD COMPLETE: PDF document compiled and downloaded successfully!");
        }
      }).catch((err: any) => {
        console.error("PDF engine rendering issue:", err);
        setIsExportingPDF(false);
        if (typeof restoreStyles === 'function') restoreStyles();
        if (onNotify) {
          onNotify("PDF ENGINE FALLBACK: Browser sandboxing is active. Running high-fidelity Print system...");
        }
        window.print();
      });
    }).catch((err) => {
      console.error("PDF engine library import failed:", err);
      setIsExportingPDF(false);
      if (typeof restoreStyles === 'function') restoreStyles();
      if (onNotify) {
        onNotify("PDF ENGINE FALLBACK: Operating in restricted sandboxed mode. Opening system print dialogue...");
      }
      window.print();
    });
  };

  const handleOriginalExport = () => {
    try {
      const fullBackup = {
        profile: JSON.parse(localStorage.getItem('cyber_profile') || 'null') || activeProfile,
        skills: JSON.parse(localStorage.getItem('cyber_skills') || '[]'),
        certs: JSON.parse(localStorage.getItem('cyber_certs') || '[]'),
        themeScheme: localStorage.getItem('cyber_theme_scheme') || 'dark-cosmic',
        bgStyle: localStorage.getItem('cyber_bg_style') || 'matrix-rain',
        fontFamilyCombo: localStorage.getItem('cyber_font_family_combo') || 'modern-sans'
      };
      
      const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cyber_portfolio_backup_${activeProfile.name.toLowerCase().replace(/\s+/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl h-full bg-surface-container-lowest border-l border-outline-variant flex flex-col shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="terminal-header px-4 py-3 pb-3 flex items-center justify-between select-none shrink-0 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-mono text-on-surface hover:text-white flex items-center gap-1.5 transition-all border border-outline-variant/50 hover:border-secondary/50 cursor-pointer shadow-sm group"
              title="Return to cyber portfolio main index"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-secondary group-hover:-translate-x-0.5 transition-transform" />
              <span>BACK</span>
            </button>
            <span className="font-mono text-xs text-primary-fixed flex items-center gap-1.5 font-bold">
              <Target className="w-4 h-4 text-secondary animate-pulse animate-[pulse_2s_infinite]" />
              RESUME PORTFOLIO GENERATOR v1.0.9
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-surface-container rounded-sm transition-colors text-on-surface-variant hover:text-error cursor-pointer flex items-center gap-1 text-[11px] font-mono group"
            aria-label="Close CV preview"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">CLOSE </span>
            <X className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-5 py-3.5 bg-surface-container-low border-b border-outline-variant/30 flex flex-wrap gap-3 justify-between items-center select-none shrink-0">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setProfileFocus('all')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg cursor-pointer transition-all ${
                profileFocus === 'all' 
                  ? 'bg-primary-fixed text-black font-semibold' 
                  : 'bg-surface-container text-on-surface-variant border border-outline-variant/30 hover:text-white'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setProfileFocus('red')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg cursor-pointer transition-all ${
                profileFocus === 'red' 
                  ? 'bg-error text-black font-semibold shadow-[0_0_8px_rgba(255,180,171,0.4)]' 
                  : 'bg-surface-container text-on-surface-variant border border-outline-variant/30 hover:text-white'
              }`}
            >
              [ Red Team ]
            </button>
            <button
              onClick={() => setProfileFocus('blue')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg cursor-pointer transition-all ${
                profileFocus === 'blue' 
                  ? 'bg-secondary text-black font-semibold shadow-[0_0_8px_rgba(0,255,0,0.4)]' 
                  : 'bg-surface-container text-on-surface-variant border border-outline-variant/30 hover:text-white'
              }`}
            >
              [ Blue Team ]
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-2.5 py-1 bg-secondary/20 hover:bg-secondary text-secondary hover:text-black hover:shadow-sm border border-secondary/30 hover:border-transparent disabled:opacity-50 transition-all font-mono text-[11px] rounded-lg cursor-pointer flex items-center gap-1 font-bold"
              title="Generate and download PDF file of current resume layout"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> Exporting...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" /> Export PDF
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-surface-container hover:bg-primary-fixed hover:text-black hover:shadow-sm border border-outline-variant/50 hover:border-transparent transition-all font-mono text-[11px] rounded-lg cursor-pointer flex items-center gap-1"
              title="Fire browser systemic print mechanism"
            >
              <Printer className="w-3 h-3" /> Print
            </button>
            <button
              onClick={handleOriginalExport}
              className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high hover:text-white hover:shadow-sm border border-outline-variant/50 transition-all font-mono text-[11px] rounded-lg cursor-pointer flex items-center gap-1"
              title="Download full original raw backup JSON of portfolio data"
            >
              <Download className="w-3 h-3 text-secondary" /> Raw JSON
            </button>
          </div>
        </div>

        {/* Resume Sheet Container (Scrollable rest of viewport) */}
        <div className="flex-1 p-5 sm:p-6 md:p-8 overflow-y-auto bg-black/40 select-all" ref={printableRef}>
          <div className="space-y-6 max-w-full mx-auto border border-outline-variant/20 bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-md font-sans text-on-surface">
            {/* CV Header */}
            <div className="border-b border-outline-variant/30 pb-6 flex flex-col sm:flex-row justify-between gap-4 items-start select-none">
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-primary-fixed tracking-tight">
                  {activeProfile.name}
                </h1>
                <p className="text-sm font-mono text-secondary tracking-widest uppercase">
                  {activeProfile.title}
                </p>
                <p className="text-xs text-on-surface-variant max-w-md">
                  {activeProfile.bio}
                </p>
              </div>

              <div className="font-mono text-xs text-on-surface-variant space-y-1">
                <div className="flex items-center gap-1.5 justify-end">
                  <span>{activeProfile.email}</span>
                  <Mail className="w-3.5 h-3.5 text-secondary" />
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <span>{activeProfile.location}</span>
                  <MapPin className="w-3.5 h-3.5 text-secondary" />
                </div>
                {activeProfile.github && activeProfile.github.trim() !== "" && (
                  <div className="flex items-center gap-1.5 justify-end">
                    <span>{activeProfile.github}</span>
                    <Target className="w-3.5 h-3.5 text-secondary" />
                  </div>
                )}
                {activeProfile.linkedin && activeProfile.linkedin.trim() !== "" && (
                  <div className="flex items-center gap-1.5 justify-end">
                    <span>{activeProfile.linkedin}</span>
                    <Award className="w-3.5 h-3.5 text-secondary" />
                  </div>
                )}
                {activeProfile.twitter && activeProfile.twitter.trim() !== "" && (
                  <div className="flex items-center gap-1.5 justify-end">
                    <span>{activeProfile.twitter}</span>
                    <Briefcase className="w-3.5 h-3.5 text-secondary" />
                  </div>
                )}
              </div>
            </div>

            {/* Profiles Alignment statement tag */}
            <div className="bg-surface-container-low/80 p-4 border border-outline-variant/30 rounded-2xl select-none">
              <span className="font-mono text-xs text-primary-fixed font-bold block mb-1">
                ✔ FOCUS DESIGNATION KEY: {profileFocus.toUpperCase()}
              </span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {profileFocus === 'red' && (
                  activeProfile.redTeamBio
                )}
                {profileFocus === 'blue' && (
                  activeProfile.blueTeamBio
                )}
                {profileFocus === 'all' && (
                  activeProfile.purpleTeamBio
                )}
              </p>
            </div>

            {/* Academic Journey */}
            <div className="space-y-3">
              <h2 className="text-sm font-mono text-secondary uppercase tracking-widest border-b border-outline-variant/20 pb-1 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary-fixed" /> Education
              </h2>
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-primary-fixed">
                    COMSATS University Islamabad
                  </h3>
                  <span className="font-mono text-xs text-on-surface-variant">
                    Jan 2025 - Jan 2029
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  BS Cybersecurity — Current 3rd Semester Scholar
                </p>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {['Core Algorithmic Logic', 'Data Structures', 'Linux Forensics', 'Network Routing Protocols', 'Relational DBMS security'].map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-surface-container text-on-surface-[10px] font-mono rounded-xl">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Certifications Log */}
            <div className="space-y-3">
              <h2 className="text-sm font-mono text-secondary uppercase tracking-widest border-b border-outline-variant/20 pb-1 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-fixed" /> Certified Verifications
              </h2>
              {activeCerts.length > 0 ? (
                <ul className="space-y-2 text-xs font-mono">
                  {activeCerts.map((cert) => (
                    <li key={cert.id} className="flex justify-between items-start">
                      <div>
                        <span className="text-secondary font-semibold">✔ {cert.title}</span>
                        <p className="text-[10px] text-on-surface-variant">
                          {cert.description || cert.topics?.join(', ')}
                        </p>
                        <p className="text-[9px] text-on-surface-variant/75">
                          Issuer: {cert.issuer} {cert.verificationCode ? `| Validation Key: ${cert.verificationCode}` : ''}
                        </p>
                      </div>
                      <span className="text-on-surface-variant text-[11px] shrink-0 ml-2">{cert.date}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] font-mono text-on-surface-variant italic">No certified verifications logged.</p>
              )}
            </div>

            {/* Technical Skills Overview */}
            <div className="space-y-3">
              <h2 className="text-sm font-mono text-secondary uppercase tracking-widest border-b border-outline-variant/20 pb-1 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-fixed" /> Key Tech Stack
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                {offensiveSkills.length > 0 && (
                  <div>
                    <span className="text-error block mb-1 font-bold">OFFENSIVE SEC OPS</span>
                    <ul className="list-disc list-inside space-y-0.5 text-on-surface-variant text-[11px]">
                      {offensiveSkills.map((s) => (
                        <li key={s.name}>{s.name} ({s.level}%)</li>
                      ))}
                    </ul>
                  </div>
                )}
                {defensiveSkills.length > 0 && (
                  <div>
                    <span className="text-secondary block mb-1 font-bold">DEFENSIVE SHIELDS</span>
                    <ul className="list-disc list-inside space-y-0.5 text-on-surface-variant text-[11px]">
                      {defensiveSkills.map((s) => (
                        <li key={s.name}>{s.name} ({s.level}%)</li>
                      ))}
                    </ul>
                  </div>
                )}
                {coreSkills.length > 0 && (
                  <div>
                    <span className="text-primary-fixed block mb-1 font-bold">CORE CAPABILITIES</span>
                    <ul className="list-disc list-inside space-y-0.5 text-on-surface-variant text-[11px]">
                      {coreSkills.map((s) => (
                        <li key={s.name}>{s.name} ({s.level}%)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Sign-off */}
            <div className="pt-4 border-t border-outline-variant/20 text-center font-mono text-[10px] text-on-surface-variant/50 select-none">
              THIS GENERATED DOCUMENT WAS DIGITALLY PARSED FROM PORTFOLIO LEDGER SECURITY SYSTEMS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
