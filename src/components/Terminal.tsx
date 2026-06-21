import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, HelpCircle, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { TerminalCommand } from '../types';

export default function Terminal() {
  const [history, setHistory] = useState<TerminalCommand[]>([
    { command: 'whoami', output: '', type: 'input' },
    {
      command: '',
      output: `SYSTEM BOOT: v4.2.1-SECURE
STATUS: ACTIVE
SECURE PROTOCOL DETECTED
Type 'help' to review directory controls and security protocols, or use the quick buttons below.`,
      type: 'system',
    },
    {
      command: '',
      output: `I am Zabih Ullah, a cybersecurity student in my 3rd semester of a Bachelor's in Cybersecurity at COMSATS University Islamabad. I am passionate about protecting digital networks. I explore Purple Teaming, combining offensive (Red Team) and defensive (Blue Team) insights to secure environments.

Latest objectives include labs on TryHackMe (THM), Hack The Box (HTB), network forensics, and security audits.`,
      type: 'output',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleCommandRun = (rawCmd: string) => {
    const cleanCmd = rawCmd.trim().toLowerCase();
    const parts = cleanCmd.split(' ');
    const baseCmd = parts[0];
    const arg = parts.slice(1).join(' ');

    const newEntries: TerminalCommand[] = [
      { command: rawCmd, output: '', type: 'input' }
    ];

    switch (baseCmd) {
      case 'clear':
        setHistory([]);
        return;

      case 'help':
        newEntries.push({
          command: '',
          output: `Available Security Consoles:
  whoami          - Inspect user identification payload
  skills          - Query core proficiency vectors (CPP, Databases, Linux)
  certs           - Show active verified cryptographic credentials
  educ            - Print academic qualifications timeline
  scan [target]   - Launch simulated vulnerability scanner (e.g., 'scan localhost')
  hack            - Execute a network intrusion & defensive response drill demo
  clear           - Wipe the terminal display buffer`,
          type: 'system',
        });
        break;

      case 'whoami':
        newEntries.push({
          command: '',
          output: `TARGET: ZABIH ULLAH
ROLE: ASPIRING CYBERSECURITY PROFESSIONAL
EDUC: COMSATS University Islamabad (BS Cybersecurity, Sem 3)
SECTORS: Purple Teaming, Networking Security, InfoSec Audits
SUMMARY: Exploring Red Team / Blue Team mechanics. Pursuing a professional internship to defend corporate systems dynamically. Currently solving labs on HackTheBox & TryHackMe.`,
          type: 'success',
        });
        break;

      case 'skills':
        newEntries.push({
          command: '',
          output: `DETERMINED SKILL Proficiencies:
  [===================>      ] 80%  -  C++ (CPP)
  [====================>     ] 85%  -  Data Structures & Algorithms
  [=====================>    ] 90%  -  Linux & Bash Automations
  [===================>      ] 82%  -  Networking & Packet Analysis
  [==================>       ] 78%  -  DBMS & Structured SQL Queries`,
          type: 'output',
        });
        break;

      case 'certs':
        newEntries.push({
          command: '',
          output: `VERIFIED AUTH CREDENTIALS:
  ✔ [PRE-SECURITY] TryHackMe Verified Path — Completed
  ✔ [GOOGLE-CYBER] Google Professional Cybersecurity Specialization — Verified
  ✔ [CTF-FINALE_] CUI Tech Fest'25 CTF Finalist — Ranked Top 5
  ✔ [NET-DEFENSE] Connect & Protect Network Security Badge — Issued
  ✔ [WELL-BEING] Yale University: Science of Well-Being — Academic Badge`,
          type: 'success',
        });
        break;

      case 'educ':
        newEntries.push({
          command: '',
          output: `ACADEMIC FOOTPRINT:
  COMSATS UNIVERSITY ISLAMABAD
  Degree: BS Cyber Security
  Range:  Jan 2025 - Jan 2029 (Current: 3rd Semester)
  Focus:  Network Security, Operating Systems, Defensive Cryptography, Ethical Hacking`,
          type: 'output',
        });
        break;

      case 'scan': {
        const targetHost = arg || '127.0.0.1';
        newEntries.push({
          command: '',
          output: `Initializing secure portfolio network scan on [${targetHost}]...
[+] Connected to router gateway: 192.168.1.1
[+] Querying TCP ports range [21-443]...
  Port 22 (SSH)   - CLOSED (Encrypted authentication)
  Port 80 (HTTP)  - VERIFIED (Portfolio Content Delivery Webserver)
  Port 443 (HTTPS)- SECURE (SSL Handshake complete - SHA-256)
  Port 3306 (SQL) - SHIELDED (Relational DBMS shielded behind local firewall)
SCAN COMPLETED: Target is secure. No loose leak vectors detected.`,
          type: 'success',
        });
        break;
      }

      case 'hack':
        newEntries.push({
          command: '',
          output: `[!] STAGE 1: DEPLOYING LOCAL BRUTE-FORCE DECRYPTOR...
[+] Scanning firewall rule overrides... OK
[+] Injecting mock shellcode payload (Buffer size: 512)...
[+] Cracking password hash sequence (MD5)... [SUCCESS]
=========================================
  ACCESS LEVEL: ROOT AUTHORIZED
=========================================
[!] ALERT: Security Operations Center launched counter-breach intrusion response!
[✓] Intruder traced and neutralised. Secure mode re-implemented successfully.`,
          type: 'error',
        });
        break;

      case '':
        // Empty enter key
        return;

      default:
        newEntries.push({
          command: '',
          output: `Unknown control command: '${baseCmd}'. Type 'help' to review secure terminal options.`,
          type: 'error',
        });
        break;
    }

    setHistory((prev) => [...prev, ...newEntries]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommandRun(inputVal);
    }
  };

  return (
    <div 
      className="glass-panel rounded-3xl overflow-hidden border border-primary-fixed/20 shadow-2xl transition-all duration-300 hover:border-primary-fixed/40 cursor-text"
      onClick={focusInput}
    >
      {/* Terminal Title Bar */}
      <div className="terminal-header px-4 py-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-error hover:opacity-80 transition-opacity"></div>
          <div className="w-3 h-3 rounded-full bg-secondary hover:opacity-80 transition-opacity"></div>
          <div className="w-3 h-3 rounded-full bg-primary-fixed hover:opacity-80 transition-opacity"></div>
          <span className="ml-3 font-mono text-xs text-on-surface-variant flex items-center gap-1.5">
            <TerminalIcon className="w-3 h-3 text-secondary animate-pulse" />
            guest@zabih-ullah: ~/summary.txt
          </span>
        </div>
        <div className="text-[10px] text-on-surface-variant/70 font-mono tracking-widest hidden sm:block">
          STATUS: ONLINE
        </div>
      </div>

      {/* Terminal Output buffer */}
      <div className="p-6 font-mono text-sm leading-relaxed space-y-4 max-h-[460px] overflow-y-auto bg-black/40 scanline relative">
        {history.map((item, index) => {
          if (item.type === 'input') {
            return (
              <div key={index} className="flex items-start gap-2">
                <span className="text-secondary select-none">guest@zabih-ullah:~$</span>
                <span className="text-primary-fixed font-semibold select-all">{item.command}</span>
              </div>
            );
          }

          let style = 'text-on-surface-variant';
          let prefix = '';

          if (item.type === 'system') {
            style = 'text-[#7df4ff] opacity-90';
            prefix = '⚡ ';
          } else if (item.type === 'success') {
            style = 'text-[#bcff5f] font-medium';
            prefix = '[✔] ';
          } else if (item.type === 'error') {
            style = 'text-error font-medium';
            prefix = '[!] ';
          }

          return (
            <div key={index} className={`whitespace-pre-wrap ${style}`}>
              {prefix}{item.output}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Live Interactive Line */}
      <div className="px-6 py-4 bg-black/60 border-t border-outline-variant/30 flex items-center gap-2">
        <span className="text-secondary font-mono text-sm select-none">guest@zabih-ullah:~$</span>
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-primary-fixed focus:ring-0 p-0"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a security command e.g., 'help' or 'scan'..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <div className="w-2 h-4 bg-primary-fixed animate-pulse inline-block select-none" />
      </div>

      {/* Quick Access Macros Bar */}
      <div className="px-6 py-3 bg-surface-container-lowest/80 border-t border-outline-variant/20 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-on-surface-variant font-mono flex items-center gap-1 mr-1 select-none">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          Quick Injectors:
        </span>
        <button
          onClick={() => handleCommandRun('whoami')}
          className="px-2.5 py-1 text-xs font-mono rounded bg-surface-container hover:bg-primary-fixed hover:text-black transition-all cursor-pointer flex items-center gap-1 border border-outline-variant/40"
        >
          <HelpCircle className="w-3 h-3 text-primary-fixed" /> whoami
        </button>
        <button
          onClick={() => handleCommandRun('skills')}
          className="px-2.5 py-1 text-xs font-mono rounded bg-surface-container hover:bg-secondary hover:text-black transition-all cursor-pointer flex items-center gap-1 border border-outline-variant/40"
        >
          <TerminalIcon className="w-3 h-3 text-secondary" /> skills
        </button>
        <button
          onClick={() => handleCommandRun('certs')}
          className="px-2.5 py-1 text-xs font-mono rounded bg-surface-container hover:bg-primary-fixed hover:text-black transition-all cursor-pointer flex items-center gap-1 border border-outline-variant/40"
        >
          <CheckCircle2 className="w-3 h-3 text-primary-fixed" /> certs
        </button>
        <button
          onClick={() => handleCommandRun('scan localhost')}
          className="px-2.5 py-1 text-xs font-mono rounded bg-surface-container hover:bg-secondary hover:text-black transition-all cursor-pointer flex items-center gap-1 border border-outline-variant/40"
        >
          <Play className="w-3 h-3 text-secondary" /> scan port
        </button>
        <button
          onClick={() => handleCommandRun('hack')}
          className="px-2.5 py-1 text-xs font-mono rounded bg-surface-container hover:bg-error hover:text-black transition-all cursor-pointer flex items-center gap-1 border border-outline-variant/40"
        >
          <ShieldAlert className="w-3 h-3 text-error" /> intrusion drill
        </button>
      </div>
    </div>
  );
}
