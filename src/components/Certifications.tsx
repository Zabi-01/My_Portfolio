import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Shield, Lock, Cpu, CheckCircle2, 
  X, Activity, RefreshCw, Terminal, ExternalLink, Hash, Bookmark 
} from 'lucide-react';
import { motion } from 'motion/react';
import { Certificate } from '../types';

const containerCertVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemCertVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

interface CertificationsProps {
  certs?: Certificate[];
}

export default function Certifications({ certs = [] }: CertificationsProps) {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'scanning' | 'passed'>('idle');
  const [verifyLogs, setVerifyLogs] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'red' | 'blue'>('all');

  // Filter certs based on category
  const parseDate = (dateStr: string): number => {
    const months: Record<string, number> = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
    };
    const parts = dateStr.trim().toLowerCase().split(/[\s,]+/);
    const month = months[parts[0]];
    const year = parseInt(parts[1]);
    if (!isNaN(month) && !isNaN(year)) return new Date(year, month).getTime();
    const fallback = new Date(dateStr).getTime();
    return isNaN(fallback) ? 0 : fallback;
  };

  const filteredCerts = certs
    .filter(cert => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'red') return cert.category === 'Offensive';
      if (activeFilter === 'blue') return cert.category === 'Defensive';
      return true;
    })
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));

  // Simulated cryptographic verification timeline
  useEffect(() => {
    if (!selectedCert) {
      setVerifyStatus('idle');
      setVerifyLogs([]);
      return;
    }

    setVerifyStatus('scanning');
    setVerifyLogs(['INITIALIZING VALIDATION INTEGRITY CHECKSUM...']);

    const steps = [
      `CONNECTING STATE TO CRYPTO REGISTRY: COMPLETED`,
      `DECRYPTING SHA-256 SIGNATURE KEY: ${selectedCert.verificationCode}`,
      `CALCULATING MATCH VALUE FOR CHECKSUM...`,
      `VERIFYING SIGNER STATUS: ${selectedCert.issuer} OK`,
      `STATUS FOR CERTIFICATE SECURE: SIGNATURE VALIDATED!`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setVerifyLogs((prev) => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        setVerifyStatus('passed');
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [selectedCert]);

  // Color mapper utilities
  const getColorClasses = (type: Certificate['colorType']) => {
    switch (type) {
      case 'lime':
        return {
          border: 'border-t-4 border-t-secondary',
          glow: 'bg-secondary/10',
          badge: 'text-secondary bg-secondary/10 border-secondary/40',
          indicator: 'bg-secondary shadow-[0_0_8px_#00FF00]',
          text: 'text-secondary'
        };
      case 'cyan':
        return {
          border: 'border-t-4 border-t-primary-fixed',
          glow: 'bg-primary-fixed/10',
          badge: 'text-primary-fixed bg-primary-fixed/10 border-primary-fixed/40',
          indicator: 'bg-primary-fixed shadow-[0_0_8px_#FF5C00]',
          text: 'text-primary-fixed'
        };
      case 'red':
        return {
          border: 'border-t-4 border-t-error',
          glow: 'bg-error/10',
          badge: 'text-error bg-error/10 border-error/40',
          indicator: 'bg-error shadow-[0_0_8px_#FF3333]',
          text: 'text-error'
        };
      case 'gray':
        return {
          border: 'border-t-4 border-t-tertiary-fixed-dim',
          glow: 'bg-tertiary-fixed-dim/5',
          badge: 'text-on-surface-variant bg-surface-container border-outline-variant/50',
          indicator: 'bg-tertiary-fixed-dim shadow-[0_0_8px_#c7c6ca]',
          text: 'text-on-surface'
        };
      default:
        return {
          border: 'border-t-4 border-t-outline-variant',
          glow: 'bg-outline-variant/10',
          badge: 'text-on-surface-variant bg-surface-container border-outline-variant/30',
          indicator: 'bg-outline-variant shadow-[0_0_8px_#3b494b]',
          text: 'text-on-surface-variant'
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Category Filter Interface */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low p-4 rounded-3xl border border-outline-variant/30 select-none">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl cursor-pointer transition-all ${
              activeFilter === 'all'
                ? 'bg-primary-fixed text-black font-semibold'
                : 'bg-surface-container text-on-surface-variant border border-outline-variant/30 hover:text-white'
            }`}
          >
            [ All Clusters ]
          </button>
          
          <button
            onClick={() => setActiveFilter('red')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl cursor-pointer transition-all ${
              activeFilter === 'red'
                ? 'bg-error text-white font-semibold'
                : 'bg-surface-container text-[#FF5555] border border-red-500/15 hover:bg-error/10 hover:text-white'
            }`}
          >
            [ Red Team / Offensive ]
          </button>

          <button
            onClick={() => setActiveFilter('blue')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl cursor-pointer transition-all ${
              activeFilter === 'blue'
                ? 'bg-secondary text-black font-semibold'
                : 'bg-surface-container text-secondary border border-[#00ff00]/15 hover:bg-secondary/10 hover:text-white'
            }`}
          >
            [ Blue Team / Defensive ]
          </button>
        </div>

        <div className="font-mono text-[11px] text-on-surface-variant flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
          ACTIVE_CREDENTIALS: <span className="text-secondary font-bold font-mono">{filteredCerts.length}</span>
        </div>
      </div>

      {/* Certifications Grid Card Deck */}
      <motion.div 
        key={activeFilter}
        variants={containerCertVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredCerts.map((cert) => {
          const colors = getColorClasses(cert.colorType);
          return (
            <motion.div
              key={cert.id}
              variants={itemCertVariants}
              className={`glass-panel rounded-3xl overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-1.5 border border-outline-variant/20 hover:border-primary-fixed/30 select-none ${colors.border}`}
            >
              <div className="p-6 flex-1 flex flex-col relative overflow-hidden">
                {/* Background decorative cyber-shield glow */}
                <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 ${colors.glow}`} />

                {/* Card Top Information */}
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-sm border text-xs font-mono font-medium ${colors.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.indicator}`} />
                    {cert.status}
                  </div>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    {cert.date}
                  </span>
                </div>



                {/* Certificate Title */}
                <h4 className="font-sans font-bold text-base text-on-surface hover:text-[#7df4ff] transition-colors mb-2 flex-1 relative z-10 md:line-clamp-2">
                  {cert.title}
                </h4>

                <div className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant/80 mb-4 select-all">
                  <Bookmark className="w-3.5 h-3.5" />
                  {cert.issuer}
                </div>

                {/* View Verification Call-to-action */}
                <div className="mt-auto pt-4 border-t border-outline-variant/20 flex justify-between items-center relative z-10">
                  <span className="font-mono text-[10px] text-on-surface-variant">
                    {cert.verificationUrl ? 'SECURE_LINK' : 'HASH SEC_VALID'}
                  </span>
                  <div className="flex items-center gap-2">
                    {cert.verificationUrl && (
                      <a
                        href={cert.verificationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-secondary hover:text-white transition-colors flex items-center gap-1 cursor-pointer py-1 px-2 hover:bg-secondary/10 border border-secondary/20 hover:border-secondary/60 rounded"
                        title="Visit Credential Issuer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Link
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="font-mono text-xs text-primary-fixed hover:text-white transition-colors hover:underline cursor-pointer active:scale-95 py-1 px-2 hover:bg-surface-container rounded"
                    >
                      View Credential →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* VERIFICATION SIGNATURE MODAL OVERLAY */}
      {selectedCert && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease_out]">
          <div 
            className="w-full max-w-xl glass-panel rounded-3xl overflow-hidden border border-primary-fixed/30 flex flex-col shadow-2xl relative animate-[scaleUp_0.25s_cubic-bezier(0.16,1,0.3,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="terminal-header px-4 py-3.5 flex items-center justify-between select-none">
              <span className="font-mono text-xs text-primary-fixed flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-secondary animate-pulse" />
                INTEGRITY AUDIT: CERTIFICATE_CHECK
              </span>
              <button 
                onClick={() => setSelectedCert(null)}
                className="p-1 hover:bg-surface-container rounded-sm transition-colors text-on-surface-variant hover:text-error cursor-pointer"
                aria-label="Close credentials verification scan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">

              {/* Cert Image */}
              {selectedCert.imageUrl && (
                <div className="w-full h-44 rounded-2xl overflow-hidden border border-outline-variant/50 bg-black flex items-center justify-center">
                  <img
                    src={selectedCert.imageUrl}
                    alt={selectedCert.title}
                    className="w-full h-full object-contain p-2"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Header Info */}
              <div className="space-y-1">
                <div className="font-mono text-[11px] text-secondary tracking-widest uppercase">
                  {selectedCert.issuer} ID VALIDATION
                </div>
                <h3 className="font-sans font-extrabold text-xl text-on-surface">
                  {selectedCert.title}
                </h3>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  {selectedCert.description}
                </p>
              </div>

              {/* Topics block */}
              <div className="space-y-2">
                <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1.5 font-bold select-none">
                  <Cpu className="w-3.5 h-3.5 text-secondary" />
                  Key Modules & Target Domains Completed:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-on-surface/90 bg-surface-container-low p-4 rounded border border-outline-variant/30 select-all">
                  {selectedCert.topics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-primary-fixed select-none">▪</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cryptographic check stream panel */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1.5 font-bold select-none">
                    <Terminal className="w-3.5 h-3.5 text-secondary animate-pulse" />
                    Ledger Checksum Verification Terminal:
                  </span>
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-on-surface-variant" />
                    <span className="font-mono text-[10px] text-on-surface-variant select-all">
                      {selectedCert.verificationCode}
                    </span>
                  </div>
                </div>

                <div className="bg-black/60 font-mono text-[11px] text-on-surface p-4 rounded border border-outline-variant/40 space-y-1.5 h-40 overflow-y-auto select-all">
                  {verifyLogs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-secondary select-none">&gt;&gt;</span>
                      <span className={i === verifyLogs.length - 1 && verifyStatus !== 'passed' ? 'text-primary-fixed font-bold' : ''}>
                        {log}
                      </span>
                    </div>
                  ))}
                  {verifyStatus === 'scanning' && (
                    <div className="flex items-center gap-2 text-secondary pt-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Validating cryptographic records...</span>
                    </div>
                  )}
                  {verifyStatus === 'passed' && (
                    <div className="text-secondary font-bold pt-1.5 flex items-center gap-1.5 select-none animate-[pulse_1s_infinite]">
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                      VERIFICATION: SUCCESSFUL. CREDENTIAL DETECTED SECURED ON ACTIVE DATABASE
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end border-t border-outline-variant/20 pt-4">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high transition-colors font-mono text-xs text-on-surface rounded cursor-pointer select-none"
                >
                  Close Audit
                </button>
                {selectedCert.verificationUrl ? (
                  <a
                    href={selectedCert.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-primary-fixed text-[#0A0A0A] hover:bg-white hover:text-[#0A0A0A] transition-all font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 hover:shadow-[0_0_12px_var(--color-primary-fixed-dim)] cursor-pointer select-none"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Verify Credential Source
                  </a>
                ) : (
                  <a
                    href="https://tryhackme.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-primary-fixed text-[#0A0A0A] hover:bg-white hover:text-[#0A0A0A] transition-all font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 hover:shadow-[0_0_12px_var(--color-primary-fixed-dim)] cursor-pointer select-none"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Provider Registry
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
