import { Skill, Certificate, ProfileInfo, Project, Education } from './types';

export const initialProfile: ProfileInfo = {
  name: "Zabih Ullah",
  title: "Aspiring Cybersecurity Professional",
  location: "Islamabad, Pakistan",
  email: "system-admin@cyber-nodes.io",
  github: "github.com/Zabih1",
  linkedin: "linkedin.com/in/zabih-ullah-563b712ba", // Custom LinkedIn link initially
  twitter: "x.com/zabihullah",
  bio: "Professional BS Cybersecurity student at COMSATS University Islamabad, exploring secure network firewalls, penetration auditing, and packet analysis.",
  redTeamBio: "Currently building defensive mechanics through an offensive lens (Red Teaming). Specializing in automated C++ tracers, custom shell vulnerability auditing, Debian terminal diagnostics, and solving complex reverse engineering CTF vectors.",
  blueTeamBio: "Highlighting corporate security protection (Blue Teaming). Specializing in designing safe relational schemas to prevent SQL injections, auditing network perimeters using Wireshark packets, implementing firewalls, and managing server incidents.",
  purpleTeamBio: "Balancing both red-team penetration scans and blue-team system hardening (Purple Teaming). Aiming to continuously audit and protect digital infrastructures against evolving threats while seeking an entry internship.",
  profilePic: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyRfk862E64ISMGMNoE6ApQUAB9FK0_sxj1YwPgyQjJgy61k5yKVGmoxotUCgjKCfW72s5l0Pf-UNjAniHN5OuAwoeEFy1hIWRxJn3F-xO1H3QNvD-kDd7sttDIESC0Rxf8L16Vk9e1iJKHuKgXaRXJYZ3fk6hXZCrgjUt-dvAf1T-AXLm3dmeYhIE6WUMD_6_RlAO-P38kxAJ4oT9aTCBlKaUfGGwIp0vb4NHumwCBkmeo6tRNxbh3wSO2UJV46ym2xgL1v2wL20",
  competencies: [
    {
      id: '1',
      label: 'Purple Teaming',
      colorClass: 'bg-secondary',
      shadowColor: 'shadow-[0_0_8px_#00FF00]'
    },
    {
      id: '2',
      label: 'Penetration Testing',
      colorClass: 'bg-error',
      shadowColor: 'shadow-[0_0_8px_#FF3333]'
    },
    {
      id: '3',
      label: 'Linux & InfoSec',
      colorClass: 'bg-primary-fixed',
      shadowColor: 'shadow-[0_0_8px_#FF5C00]'
    }
  ]
};

export const initialSkills: Skill[] = [
  {
    name: 'CPP (C++)',
    category: 'Core',
    level: 80,
    iconName: 'Code',
    description: 'System-level secure software development, analyzing buffer overflows, memory diagnostics, and crafting lightweight performance tracing utilities.'
  },
  {
    name: 'Data Structures',
    category: 'Core',
    level: 85,
    iconName: 'Cpu',
    description: 'Designing efficient hashing sequences, evaluating custom data hierarchies, modeling decision trees, and optimizing network routing paths.'
  },
  {
    name: 'DBMS',
    category: 'Defensive',
    level: 78,
    iconName: 'Database',
    description: 'Designing secure SQL architectures, conducting relational payload analysis to audit and mitigate SQL injection (SQLi) vectors, and querying firewall event databases.'
  },
  {
    name: 'Linux',
    category: 'Offensive',
    level: 90,
    iconName: 'Terminal',
    description: 'Experienced in Debian/Arch system administration, writing automated secure bash scripting utilities, configuring iptables rules, and executing custom shell terminal forensics.'
  },
  {
    name: 'Networking',
    category: 'Defensive',
    level: 82,
    iconName: 'Network',
    description: 'Tracing routing nodes, packet auditing via Wireshark, dissecting OSI-model packet segments, isolating subnet leaks, and establishing secure hardware firewall rules.'
  }
];

export const initialCertificates: Certificate[] = [
  {
    id: 'thm-pre-security',
    title: 'Pre Security Certificate',
    issuer: 'TryHackMe (THM)',
    status: 'Verified',
    colorType: 'lime',
    date: 'May 2024',
    verificationCode: 'THM-96E8AFB032D9',
    topics: [
      'Cyber Security Introduction',
      'Network Fundamentals (OSI, DNS, IPs, Packets)',
      'Web Security Baselines',
      'Linux & Windows OS Architecture'
    ],
    description: 'Hands-on training path covering critical core networking, operating system capabilities, web security basics, and essential command lines.',
    category: 'Offensive',
    verificationUrl: 'https://tryhackme.com/p/Zabih1'
  },
  {
    id: 'google-cybersecurity',
    title: 'Google Cybersecurity Professional',
    issuer: 'Google Career Credentials',
    status: 'Google',
    colorType: 'cyan',
    date: 'October 2024',
    verificationCode: 'GGL-SEC-4D7F8A329',
    topics: [
      'Assets, Threats, and Vulnerabilities Security Auditing',
      'SQL & Python Automation Scripts',
      'SIEM tools (Splunk, Chronicle) and TCP packet inspection',
      'Network Security Analysis (Nmap, Wireshark, TCPDump)',
      'Linux Administration and terminal system security controls'
    ],
    description: 'An intensive 8-course professional specialization dealing extensively with real-world incident trigger reports, threat investigation, risk frameworks, and security mitigation.',
    category: 'Defensive',
    verificationUrl: 'https://coursera.org/verify/professional-cert/google-cybersecurity'
  },
  {
    id: 'cui-ctf-25',
    title: 'CUI TECH FEST\'25 CTF FINALE',
    issuer: 'COMSATS University Islamabad',
    status: 'CTF',
    colorType: 'red',
    date: 'February 2025',
    verificationCode: 'CUI-CTF-RANK5',
    topics: [
      'Jeopardy-style Cryptography decoding',
      'Reverse Engineering compiled packages',
      'Web Exploitation sandbox breaches',
      'Digital Forensics logs (Wireshark audits)'
    ],
    description: 'Ranked as one of the Top 5 Finalist teams. Successfully solved complex cybersecurity operations under strict time conditions, covering reverse-engineering and packet captures.',
    category: 'Offensive',
    verificationUrl: 'https://github.com/Zabih1/'
  },
  {
    id: 'connect-protect',
    title: 'Connect and Protect: Networks and Network Security',
    issuer: 'Cisco Networking Academies',
    status: 'Network',
    colorType: 'gray',
    date: 'November 2024',
    verificationCode: 'CSCO-NETSEC-99B',
    topics: [
      'TCP/IP networking & DNS records routing',
      'Deploying firewalls & port filters safely',
      'Intrusion Detection Systems (IDS)',
      'VPN configuration protocols (IPsec, SSL)'
    ],
    description: 'Verified training course highlighting strict local network security, firewall implementation, threat perimeter modeling, and security policy architecture.',
    category: 'Defensive',
    verificationUrl: 'https://www.netacad.com/'
  },
  {
    id: 'science-well-being',
    title: 'The Science of Well-Being',
    issuer: 'Yale University (Coursera Associate)',
    status: 'Misc',
    colorType: 'neutral',
    date: 'July 2024',
    verificationCode: 'YALE-WELLB-Z8B5',
    topics: [
      'Psychology of performance, cognitive biases',
      'Habit-building loops and productivity systems',
      'Resilience & focus optimization metrics'
    ],
    description: 'Acquiring high-level cognitive resilience, structured goal management, and focus optimization strategies to ensure high-performance execution.',
    category: 'General',
    verificationUrl: 'https://coursera.org/verify/wellbeing'
  }
];

export const initialEducation: Education[] = [
  {
    id: "comsats-bs-cyber",
    institution: "COMSATS University Islamabad",
    degree: "Bachelor of Science - BS, Cyber Security",
    period: "January 2025 - January 2029",
    semester: "3rd Semester Scholar",
    description: "Engaging deeply in theoretical foundations and laboratory simulations. Dynamic studies focus heavily on safe code compiler design, memory boundary auditing, public-key cryptographic structures, network sniffing protocols, and system defenses.",
    order: 1
  }
];

export const initialProjects: Project[] = [
  {
    id: 'proj-malware-sandbox',
    title: 'Automated Malware Sandbox Environment',
    description: 'A customized, isolated virtual environment to dynamically analyze suspicious executables. Included automated tracking of registry modifications, API hooking monitors, and network traffic interception using custom Python scripts and Cuckoo Sandbox.',
    techStack: ['Python', 'Cuckoo Sandbox', 'Wireshark', 'VirtualBox', 'Windows API'],
    githubUrl: 'https://github.com/Zabih1',
    order: 1
  },
  {
    id: 'proj-network-scanner',
    title: 'Custom Network Vulnerability Scanner',
    description: 'A lightweight, multi-threaded network scanner written in C++ that maps active hosts, probes for open ports, and checks against a local database of known CVEs. Optimized for low-bandwidth environments.',
    techStack: ['C++', 'Sockets', 'Multi-threading', 'CVE Database API'],
    githubUrl: 'https://github.com/Zabih1',
    order: 2
  },
  {
    id: 'proj-secure-chat',
    title: 'End-to-End Encrypted Terminal Chat',
    description: 'A terminal-based chat application utilizing RSA for key exchange and AES-GCM for message encryption. Designed to securely bypass standard network traffic analysis and prevent eavesdropping on local network environments.',
    techStack: ['Python', 'Cryptography', 'Socket Programming', 'Linux Terminal'],
    githubUrl: 'https://github.com/Zabih1',
    order: 3
  }
];

export const initialBlogs = [
  {
    id: 'post-wireshark-dissect',
    title: 'OSI Segment Diagnostics: Deep Dive with Wireshark',
    summary: 'An step-by-step diagnostic guide to sniffing network nodes, isolating packet segments, and profiling unauthorized traffic behavior.',
    content: `## Packet Analysis Under the Microscope

Analyzing network traffic requires a deep understanding of the OSI (Open Systems Interconnection) model layers. In this field guide, we walk through isolating an abnormal TCP/IP flow on a local network node.

### 1. The Anomaly Detection
During a routine network scan, we noticed intermittent high-frequency outbound queries targeting high port counts on destination subnets. This signature aligns with typical scanning engines or port mapping operations.

### 2. Isolating flows using Wireshark display filters:
To isolate this traffic quickly, you can use the active Wireshark capture filter string:
\`\`\`bash
tcp.flags.syn == 1 && tcp.flags.ack == 0
\`\`\`
This filter limits the view strictly to initial handshake synchronization queries.

### 3. OSI Layer Review:
* **Physical & Data Link Layers**: Inspected MAC addresses to ensure no spoofing anomalies were present.
* **Network Layer**: Confirmed IP header routing structures matched designated local nodes.
* **Transport Layer**: Dissected TCP sequence numbers, uncovering sequence-prediction variations indicating pre-fabricated exploit tool usage.

Deploying proper intrusion rules (e.g. Snort rules) against packet segmentation limits protects the overall perimeter from automated scanner crawlers. Make sure to audit firewall logs daily.`,
    date: 'Jan 15, 2026',
    author: 'Zabih Ullah',
    category: 'Network Auditing',
    readTime: '4 min read',
    tags: ['Wireshark', 'OSI', 'Network Security', 'Sniffing']
  },
  {
    id: 'post-sqli-remediation',
    title: 'Securing DBMS Schemas: Thwarting SQLi Injection Attacks',
    summary: 'How to design secure relational schemas, evaluate parameterized query buffers, and safely block classic SQL injection vectors.',
    content: `## Mitigating SQL Injections in Modern Databases

SQL Injection (SQLi) remains one of the most critical vulnerabilities in database security. It occurs when untrusted user input is directly concatenated into database query strings instead of parsing separated data values.

### The Vulnerable Architecture:
Consider this classic insecure paradigm:
\`\`\`sql
-- UNSAFE STRING CONCATENATION (DO NOT USE)
SELECT * FROM users WHERE user_input = 'admin' OR '1'='1';
\`\`\`

### Defensive Countermeasures:
1. **Parameterized Queries / Prepared Statements**:
   Prepared statements ensure that the SQL compile stage is separated from the variable injection phase. The DBMS treats input *purely* as parameter values, preventing parsing as actionable engine operations.
   
2. **Input Sanitation & Strict Typing**:
   Ensure input models reject regex anomalies. Employ strong primary key constraints and map inputs to predictable types.

3. **Least Privilege Principle**:
   Ensure web application database users do not retain global write/drop permissions on systemic database tables.`,
    date: 'Dec 08, 2025',
    author: 'Zabih Ullah',
    category: 'Database Security',
    readTime: '3 min read',
    tags: ['SQLi', 'DBMS', 'Defense', 'Secure Coding']
  }
];

