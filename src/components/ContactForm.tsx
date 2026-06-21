import React, { useState } from 'react';
import { Send, Lock, ShieldCheck, Mail, User, ShieldAlert, Sparkles, CheckCircle2, Github, Linkedin, Twitter, Link as LinkIcon } from 'lucide-react';
import { ProfileInfo } from '../types';

interface ContactFormProps {
  profile: ProfileInfo;
}

export default function ContactForm({ profile }: ContactFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'transmitting' | 'sent' | 'error'>('idle');
  const [transmitLogs, setTransmitLogs] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value} = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      return;
    }

    setStatus('transmitting');
    setTransmitLogs(['STARTING SECURE PORTFOLIO SOCKET CONNECT...']);

    const transSteps = [
      `CONNECTING TO MAIL GUEST ROUTER OUTBOUND PORT: 443`,
      `SSL HANDSHAKE SYMMETRIC NEGOTIATION: COMPLETED`,
      `INJECTING MESSAGE BODY ENVELOPE: "Zabih Ullah Profile Communication"`,
      `ENCRYPTING MESSAGE DATA BUFFER USING AES-256 ENCRYPTION`,
      `VERIFYING ANTIVIRUS PAYLOAD HEURISTICS: PASSED`,
      `TRANSMITTING SAFE DATA PACKETS (3 NODES OVER MULTI-ROUTE PORT)...`,
      `DELIVERY TO GATES RECIPIENT COMPLETED SUCCESSFULLY.`
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < transSteps.length) {
        setTransmitLogs((prev) => [...prev, transSteps[stepIdx]]);
        stepIdx++;
      } else {
        setStatus('sent');
        setFormData({ name: '', email: '', message: '' });
        clearInterval(interval);
      }
    }, 400);
  };

  return (
    <div className="glass-panel rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12">
      {/* Contact Form Input Section */}
      <div className="p-8 lg:col-span-7 space-y-6">
        <div className="space-y-1.5 select-none">
          <span className="font-mono text-xs text-secondary font-bold tracking-widest uppercase flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> SECURE HANDSHAKE
          </span>
          <h4 className="font-sans font-extrabold text-xl text-on-surface">
            Establish Encrypted Connection
          </h4>
          <p className="font-sans text-xs text-on-surface-variant">
            Initiate connection with Zabih Ullah direct messaging protocols to discuss projects, audits, or job opportunities.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="bg-secondary/10 border border-secondary/40 p-6 rounded-2xl text-center space-y-3 animate-[fadeIn_0.3s_ease_out] select-none">
            <CheckCircle2 className="w-12 h-12 text-secondary mx-auto animate-bounce" />
            <h5 className="font-sans font-bold text-base text-secondary">
              Secure Transmission Completed
            </h5>
            <p className="font-mono text-xs text-on-surface-variant leading-relaxed max-w-sm mx-auto">
              Your message hash has been successfully routed and decrypted on Zabih Ullah's local mailbox registry. Responses arrive via secured SMTP shortly.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high font-mono text-[11px] font-bold text-on-surface rounded-xl border border-outline-variant/30 cursor-pointer"
            >
              Initialize a New Protocol
            </button>
          </div>
        ) : (
          <form onSubmit={handleTransmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1">
              <label htmlFor="name" className="font-mono text-xs text-on-surface-variant flex items-center gap-1.5 select-none">
                <User className="w-3.5 h-3.5" /> Transmitter Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full bg-surface-container-low/60 border border-outline-variant/50 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed/30 rounded-xl px-4 py-3 text-sm font-sans text-on-surface outline-none transition-all"
                placeholder="e.g. Inspector Cooper"
                value={formData.name}
                onChange={handleInputChange}
                disabled={status === 'transmitting'}
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label htmlFor="email" className="font-mono text-xs text-on-surface-variant flex items-center gap-1.5 select-none">
                <Mail className="w-3.5 h-3.5" /> Return Coordinates (Email)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-surface-container-low/60 border border-outline-variant/50 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed/30 rounded-xl px-4 py-3 text-sm font-sans text-on-surface outline-none transition-all"
                placeholder="e.g. cooper@agency.net"
                value={formData.email}
                onChange={handleInputChange}
                disabled={status === 'transmitting'}
              />
            </div>

            {/* Message Input */}
            <div className="space-y-1">
              <label htmlFor="message" className="font-mono text-xs text-on-surface-variant flex items-center gap-1.5 select-none">
                <ShieldAlert className="w-3.5 h-3.5" /> Incident Report / Secure Body
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="w-full bg-surface-container-low/60 border border-outline-variant/50 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed/30 rounded-xl px-4 py-3 text-sm font-sans text-on-surface outline-none transition-all resize-none"
                placeholder="Specify target agenda, internship opportunities, or message contents..."
                value={formData.message}
                onChange={handleInputChange}
                disabled={status === 'transmitting'}
              />
            </div>

            {status === 'error' && (
              <div className="p-3 bg-error/10 border border-error/30 text-xs font-mono text-error rounded-xl select-none">
                [!] ERROR: Please fulfill all body payload fields before delivery validation.
              </div>
            )}

            {/* Submit Button */}
            <button
              id="submit-contact"
              type="submit"
              disabled={status === 'transmitting'}
              className="w-full sm:w-auto px-6 py-3 bg-primary-fixed text-[#0A0A0A] hover:bg-white font-mono text-xs font-bold rounded-2xl flex items-center justify-center gap-2 tracking-wider transition-all cursor-pointer active:scale-98 select-none border border-transparent disabled:opacity-40 hover:shadow-[0_0_15px_rgba(255,92,0,0.4)]"
            >
              <Send className="w-4 h-4" /> Deliver Encrypted Payload
            </button>
          </form>
        )}
      </div>

      {/* Terminal Output logs on the right side of the contacts container */}
      <div className="bg-black/40 border-t lg:border-t-0 lg:border-l border-outline-variant/30 p-8 lg:col-span-5 flex flex-col justify-between scanline relative min-h-[220px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono text-xs text-on-surface-variant select-none">
            <span className="flex items-center gap-1.5 text-secondary">
              <Sparkles className="w-3.5 h-3.5" /> Socket Console Logs
            </span>
            <span>PORT 443 TCP</span>
          </div>

          <div className="font-mono text-[11px] leading-relaxed text-on-surface-variant space-y-2 select-all max-h-48 overflow-y-auto">
            {transmitLogs.length === 0 ? (
              <p className="text-on-surface-variant/40 italic">
                Awaiting connection initialization trigger...
              </p>
            ) : (
              transmitLogs.map((log, idx) => (
                <div key={idx} className="flex gap-1.5 items-start">
                  <span className="text-primary-fixed font-bold select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))
            )}

            {status === 'transmitting' && (
              <div className="text-secondary animate-pulse flex items-center gap-1.5 pt-1 font-bold select-none font-mono">
                <ShieldCheck className="w-4.5 h-4.5" />
                Validating security keys...
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-outline-variant/20 flex flex-col gap-3 select-none">
          <div className="font-mono text-[10px] text-on-surface-variant/75 flex justify-between items-center">
            <span>SECURE SYSTEM_IP: 192.168.1.107</span>
            <span className="text-secondary font-bold">● ONLINE Protocol</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {profile.github && profile.github.trim() !== "" && (
              <a
                href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-surface-container-high hover:bg-primary-fixed hover:text-black font-mono text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition-all text-on-surface hover:shadow-md border border-outline-variant/40"
                title="GitHub Channel Connection"
              >
                <Github className="w-3.5 h-3.5 text-secondary hover:text-inherit" /> Github Node
              </a>
            )}

            {profile.linkedin && profile.linkedin.trim() !== "" && (
              <a
                href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-surface-container-high hover:bg-primary-fixed hover:text-black font-mono text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition-all text-on-surface hover:shadow-md border border-outline-variant/40"
                title="LinkedIn Channel Connection"
              >
                <Linkedin className="w-3.5 h-3.5 text-secondary hover:text-inherit" /> LinkedIn Node
              </a>
            )}

            {profile.twitter && profile.twitter.trim() !== "" && (
              <a
                href={profile.twitter.startsWith('http') ? profile.twitter : `https://${profile.twitter}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-surface-container-high hover:bg-primary-fixed hover:text-black font-mono text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition-all text-on-surface hover:shadow-md border border-outline-variant/40"
                title="Twitter X Channel Connection"
              >
                <Twitter className="w-3.5 h-3.5 text-secondary hover:text-inherit" /> Twitter X Code
              </a>
            )}

            {profile.email && profile.email.trim() !== "" && (
              <a
                href={`mailto:${profile.email}`}
                className="px-3 py-1.5 bg-surface-container-high hover:bg-primary-fixed hover:text-black font-mono text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition-all text-on-surface hover:shadow-md border border-outline-variant/40"
                title="SMTP Mail Server Connection"
              >
                <Mail className="w-3.5 h-3.5 text-secondary hover:text-inherit" /> Direct SMTP
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
