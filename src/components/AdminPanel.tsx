import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Lock, Unlock, Save, Plus, Trash2, Edit3, CheckCircle2, ShieldAlert,
  Globe, User, Award, Terminal as TerminalIcon, Sparkles, Key, Link2, 
  HelpCircle, Eye, Cpu, BookOpen, Mail, Github, Linkedin, Twitter, Image,
  Download, Upload, Moon, Sun, Monitor, Palette, CaseUpper, Volume2, VolumeX,
  CloudLightning, Database, LogOut, Check, Code
} from 'lucide-react';
import { Skill, Certificate, ProfileInfo, BlogPost, Project, Education, Competency } from '../types';
import { initialProfile, initialSkills, initialCertificates, initialBlogs, initialProjects, initialEducation } from '../initialData';
import { playClickSound, playHoverSound, playBootAudioSequence, playAlertSecSound } from '../utils/audio';
import ImageUploader from './ImageUploader';

// Firebase Auth & Firestore dependencies
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileInfo;
  setProfile: (profile: ProfileInfo) => void;
  skills: Skill[];
  setSkills: (skills: Skill[]) => void;
  certs: Certificate[];
  setCerts: (certs: Certificate[]) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  blogs: BlogPost[];
  setBlogs: (blogs: BlogPost[]) => void;
  educations: Education[];
  setEducations: (educations: Education[]) => void;
  onNotify: (msg: string) => void;
  themeScheme: string;
  setThemeScheme: (scheme: string) => void;
  bgStyle: 'particles-drift' | 'cyber-grid' | 'clean';
  setBgStyle: (style: 'particles-drift' | 'cyber-grid' | 'clean') => void;
  fontFamilyCombo: string;
  setFontFamilyCombo: (combo: string) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
}

export default function AdminPanel({
  isOpen,
  onClose,
  profile,
  setProfile,
  skills,
  setSkills,
  certs,
  setCerts,
  projects,
  setProjects,
  blogs,
  setBlogs,
  educations,
  setEducations,
  onNotify,
  themeScheme,
  setThemeScheme,
  bgStyle,
  setBgStyle,
  fontFamilyCombo,
  setFontFamilyCombo,
  audioEnabled,
  setAudioEnabled
}: AdminPanelProps) {
  // Authentication State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Time-out logic
  useEffect(() => {
    if (!isUnlocked) return;
    const interval = setInterval(() => {
      const savedTime = localStorage.getItem('admin_login_time');
      if (savedTime) {
        const elapsed = Date.now() - parseInt(savedTime);
        if (elapsed > 2 * 60 * 1000) {
          setIsUnlocked(false);
          localStorage.removeItem('admin_login_time');
          onNotify("SESSION EXPIRED: Admin access timed out (2 min reached). Re-authentication required.");
        }
      }
    }, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [isUnlocked, onNotify]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        if (user.email?.toLowerCase() === 'zabihullah9046@gmail.com') {
          // Check if already expired on reload
          const savedTime = localStorage.getItem('admin_login_time');
          if (savedTime && (Date.now() - parseInt(savedTime) < 2 * 60 * 1000)) {
            setIsUnlocked(true);
          } else {
             localStorage.removeItem('admin_login_time');
             setIsUnlocked(false);
          }
          setLoginError('');
        } else {
          signOut(auth);
          setIsUnlocked(false);
          setLoginError("ACCESS DENIED: Unauthorized identity.");
          onNotify("ACCESS DENIED: Credentials mismatch. Terminating session.");
          onClose();
        }
      } else {
        setIsUnlocked(false);
      }
    });
    return unsub;
  }, [onClose, onNotify]);
  
  const setUnlock = (val: boolean) => {
    setIsUnlocked(val);
    if (val) {
      localStorage.setItem('admin_login_time', Date.now().toString());
    } else {
      localStorage.removeItem('admin_login_time');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      playClickSound();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user && user.email?.toLowerCase() === 'system-admin@cyber-nodes.io') {
        setUnlock(true);
        setLoginError('');
        onNotify("SYSTEM ACCESS GRANTED: Firebase Google Administrator verified.");
      } else {
        await signOut(auth);
        setUnlock(false);
        setLoginError("ACCESS DENIED: Unauthorized identity. Only system-admin@cyber-nodes.io is permitted.");
        onNotify("ACCESS DENIED: Credentials mismatch. Redirecting...");
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setLoginError("FIREBASE HANDSHAKE FAILED: Popup authentication closed or rejected.");
      onNotify("ERROR: Google login cancelled or rejected.");
    }
  };

  const handleFirebaseSignOut = async () => {
    try {
      playClickSound();
      await signOut(auth);
      setUnlock(false);
      onNotify("SECURE DECOUPLING: Logged out from Firebase session.");
    } catch (err) {
      onNotify("ERROR: Failed to decouple current Firebase session.");
    }
  };

  const handleSeedCloudDatabase = async () => {
    if (!firebaseUser || firebaseUser.email !== 'zabihullah9046@gmail.com') {
      onNotify("ALARM: Seeding transaction rejected. Administrative cloud privilege required.");
      return;
    }

    if (!confirm("Are you sure you want to seed the Cloud Firestore database with the initial portfolio dataset?")) {
      return;
    }

    setIsSeeding(true);
    onNotify("CLOUDSYNC: Seeding profile, skills, certificates, and blogs datasets...");

    try {
      const batchList: Promise<any>[] = [];

      // Write Profile
      batchList.push(setDoc(doc(db, 'portfolio_settings', 'profile'), profile));

      // Write Skills
      skills.forEach((sk) => {
        const id = sk.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        batchList.push(setDoc(doc(db, 'skills', id), sk));
      });

      // Write Certs
      certs.forEach((ct) => {
        batchList.push(setDoc(doc(db, 'certs', ct.id), ct));
      });

      // Write Blogs
      blogs.forEach((bl) => {
        batchList.push(setDoc(doc(db, 'blogs', bl.id), bl));
      });

      // Write Educations
      educations.forEach((edu) => {
        batchList.push(setDoc(doc(db, 'education', edu.id), edu));
      });

      await Promise.all(batchList);
      onNotify("CLOUDSYNC COMPLETE: Seeding successful! Database records are now persistent in the cloud.");
    } catch (err: any) {
      onNotify("ALARM: Seeding failed. See browser console of Firestore rules.");
      handleFirestoreError(err, OperationType.WRITE, 'seed_transaction');
    } finally {
      setIsSeeding(false);
    }
  };

  // Active Management Tab
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'certs' | 'themes' | 'blogs' | 'projects' | 'educations'>('profile');

  // Edit states for Profile
  const [tempProfile, setTempProfile] = useState<ProfileInfo>({ ...profile });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportConfig = () => {
    const backupData = {
      profile,
      skills,
      certs,
      blogs,
      themeScheme,
      bgStyle,
      fontFamilyCombo
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cyber_security_portfolio_backup_${profile.name.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onNotify("EXPORTER SUCCESS: Config backup ledger package downloaded successfully.");
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) {
          setProfile(parsed.profile);
          setTempProfile({ ...parsed.profile });
          localStorage.setItem('cyber_profile', JSON.stringify(parsed.profile));
        }
        if (parsed.skills) {
          setSkills(parsed.skills);
          localStorage.setItem('cyber_skills', JSON.stringify(parsed.skills));
        }
        if (parsed.certs) {
          setCerts(parsed.certs);
          localStorage.setItem('cyber_certs', JSON.stringify(parsed.certs));
        }
        if (parsed.blogs) {
          setBlogs(parsed.blogs);
          localStorage.setItem('cyber_blogs', JSON.stringify(parsed.blogs));
        }
        if (parsed.themeScheme) {
          setThemeScheme(parsed.themeScheme);
          localStorage.setItem('cyber_theme_scheme', parsed.themeScheme);
        }
        if (parsed.bgStyle) {
          setBgStyle(parsed.bgStyle);
          localStorage.setItem('cyber_bg_style', parsed.bgStyle);
        }
        if (parsed.fontFamilyCombo) {
          setFontFamilyCombo(parsed.fontFamilyCombo);
          localStorage.setItem('cyber_font_family_combo', parsed.fontFamilyCombo);
        }
        onNotify("DECRYPTION SUCCESS: Ledger elements re-aligned and imported correctly.");
      } catch (err) {
        onNotify("DECRYPTION ERROR: Failed to parse backup file. Invalid checksum or format.");
      }
    };
    reader.readAsText(file);
  };

  // Skills Editing state
  const [editingSkillName, setEditingSkillName] = useState<string | null>(null);
  const [skillForm, setSkillForm] = useState<Skill>({
    name: '',
    category: 'Core',
    level: 80,
    iconName: 'Code',
    description: '',
    externalUrl: ''
  });

  // Competencies Editing state
  const [editingCompetencyId, setEditingCompetencyId] = useState<string | null>(null);
  const [competencyForm, setCompetencyForm] = useState<Competency>({
    id: '', label: '', colorClass: 'bg-secondary', shadowColor: 'shadow-[0_0_8px_#00FF00]'
  });

  const handleEditCompetency = (comp: Competency) => {
    setEditingCompetencyId(comp.id);
    setCompetencyForm({ ...comp });
  };

  // Certifications Editing state
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certForm, setCertForm] = useState<Certificate>({
    id: '',
    title: '',
    issuer: '',
    status: '',
    colorType: 'cyan',
    date: '',
    verificationCode: '',
    topics: [],
    description: '',
    category: 'Offensive',
    imageUrl: '',
    verificationUrl: ''
  });
  const [topicInput, setTopicInput] = useState('');

  // Projects Editing state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Project>({
    id: '', title: '', description: '', techStack: [], githubUrl: '', liveUrl: '', imageUrl: '', order: 0
  });
  const [techStackInput, setTechStackInput] = useState('');

  // Blog posts Editing state
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState<BlogPost>({
    id: '',
    title: '',
    summary: '',
    content: '',
    date: '',
    author: profile.name || 'Zabih Ullah',
    category: 'General Security',
    imageUrl: '',
    readTime: '3 min read',
    tags: []
  });
  const [tagsInput, setTagsInput] = useState('');

  // Education Editing state
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [educationForm, setEducationForm] = useState<import('../types').Education>({
    id: '',
    institution: '',
    degree: '',
    period: '',
    semester: '',
    description: '',
    order: 0
  });

  const handleSaveEducation = async () => {
    if (!educationForm.institution || !educationForm.degree) {
      onNotify("SYSTEM ALERT: Institution and Degree fields are required.");
      return;
    }

    playClickSound();
    let newId = educationForm.id;
    if (!newId) {
      newId = `edu-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    const readyEdu = { ...educationForm, id: newId };

    try {
      if (firebaseUser?.email === 'zabihullah9046@gmail.com') {
        await setDoc(doc(db, 'education', readyEdu.id), readyEdu);
        onNotify("SUCCESS: Education record synced to cloud successfully.");
      } else {
        const existing = educations.filter(e => e.id !== newId);
        const newList = [...existing, readyEdu];
        setEducations(newList);
        localStorage.setItem('cyber_educations', JSON.stringify(newList));
        onNotify("OFFLINE SUCCESS: Education saved locally.");
      }
      
      setEditingEducationId(null);
      setEducationForm({
        id: '', institution: '', degree: '', period: '', semester: '', description: '', order: 0
      });
    } catch (err: any) {
      console.warn("Save Education failed: ", err);
      onNotify("ERROR: Failed to save education to cloud registry. Proceeding locally.");
    }
  };

  const handleEditEducation = (edu: import('../types').Education) => {
    playHoverSound();
    setEditingEducationId(edu.id);
    setEducationForm({ ...edu });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEducation = async (idToDelete: string) => {
    if (!confirm("Remove this education segment? This action executes permanently.")) return;
    
    playClickSound();
    try {
      if (firebaseUser?.email === 'zabihullah9046@gmail.com') {
        await deleteDoc(doc(db, 'education', idToDelete));
        onNotify("SUCCESS: Cloud Education segment deleted successfully.");
      } else {
        const filtered = educations.filter(e => e.id !== idToDelete);
        setEducations(filtered);
        localStorage.setItem('cyber_educations', JSON.stringify(filtered));
        onNotify("OFFLINE SUCCESS: Education segment deleted locally.");
      }
    } catch (err: any) {
      console.error(err);
      onNotify("ERROR: Could not finalize deletion. Access restricted.");
    }
  };

  if (!isOpen) return null;

  // Handle Login authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    const emailInput = username.trim().toLowerCase();
    
    // Using a placeholder secure email format for logic if necessary,
    // but the system should accept defined credentials
    if (!emailInput) {
      setLoginError('ACCESS DENIED: Identity required.');
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, emailInput, password);
      const user = result.user;
      if (user) {
        setUnlock(true);
        setLoginError('');
        onNotify("SYSTEM ACCESS GRANTED: Protocol encrypted and authenticated.");
      } else {
        setLoginError("ACCESS DENIED: Unauthorized identity.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        // Automatically create user on first sign-in attempt
        try {
          const result = await createUserWithEmailAndPassword(auth, emailInput, password);
          const user = result.user;
          if (user && user.email?.toLowerCase() === 'zabihullah9046@gmail.com') {
            setUnlock(true);
            setLoginError('');
            onNotify("SYSTEM IDENTITY CREATED: New administrator profile initialized with remote sync.");
            return;
          }
        } catch (regErr: any) {
          console.error(regErr);
          setLoginError(`ACCESS DENIED: ${regErr.message || 'Passcode or credential schema failure.'}`);
          return;
        }
      }
      setLoginError(`ACCESS DENIED: ${err.message || 'Invalid passcode or credential sequence.'}`);
    }
  };

  // Save profile changes
  const saveProfile = async () => {
    setProfile(tempProfile);
    localStorage.setItem('cyber_profile', JSON.stringify(tempProfile));
    
    if (firebaseUser?.email === 'zabihullah9046@gmail.com') {
      try {
        await setDoc(doc(db, 'portfolio_settings', 'profile'), tempProfile);
        onNotify("LEDGER UPDATED: Profile committed to Cloud and local backups successfully.");
      } catch (err: any) {
        onNotify("ALARM: Cloud sync blocked. Local copy committed.");
        handleFirestoreError(err, OperationType.WRITE, 'portfolio_settings/profile');
      }
    } else {
      onNotify("LEDGER UPDATED: General profile, bios and cybernet links committed.");
    }
  };

  // Skill CRUD
  const handleEditSkill = (skill: Skill) => {
    setEditingSkillName(skill.name);
    setSkillForm({ ...skill });
  };

  const handleSaveSkill = async () => {
    if (!skillForm.name.trim()) {
      onNotify("ERROR: Skill name required for registry validation.");
      return;
    }

    let updatedSkills: Skill[];
    if (editingSkillName) {
      updatedSkills = skills.map((s) => s.name === editingSkillName ? skillForm : s);
      onNotify(`SKILL COMMITTED: Configured ${skillForm.name}.`);
    } else {
      if (skills.some((s) => s.name.toLowerCase() === skillForm.name.toLowerCase())) {
        onNotify("ERROR: Sector identity key collision. Skill name already exists.");
        return;
      }
      updatedSkills = [...skills, skillForm];
      onNotify(`SKILL CREATED: Registered ${skillForm.name} to core index.`);
    }

    setSkills(updatedSkills);
    localStorage.setItem('cyber_skills', JSON.stringify(updatedSkills));

    if (firebaseUser?.email === 'zabihullah9046@gmail.com') {
      try {
        const skillId = skillForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        await setDoc(doc(db, 'skills', skillId), skillForm);
        
        if (editingSkillName && editingSkillName !== skillForm.name) {
          const oldId = editingSkillName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          await deleteDoc(doc(db, 'skills', oldId));
        }
        onNotify(`SKILL SYNCED: Synchronized "${skillForm.name}" with Firestore Cloud.`);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, `skills`);
      }
    }
    
    // Reset form
    setEditingSkillName(null);
    setSkillForm({
      name: '',
      category: 'Core',
      level: 80,
      iconName: 'Code',
      description: '',
      externalUrl: ''
    });
  };

  const handleDeleteSkill = async (nameToDelete: string) => {
    const updated = skills.filter((s) => s.name !== nameToDelete);
    setSkills(updated);
    localStorage.setItem('cyber_skills', JSON.stringify(updated));

    if (firebaseUser?.email === 'zabihullah9046@gmail.com') {
      const skillId = nameToDelete.toLowerCase().replace(/[^a-z0-9]/g, '-');
      try {
        await deleteDoc(doc(db, 'skills', skillId));
        onNotify(`SKILL PURGED: Terminated ${nameToDelete} from cloud database.`);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.DELETE, `skills/${skillId}`);
      }
    } else {
      onNotify(`SKILL ERASED: Terminated ${nameToDelete} memory allocation.`);
    }
  };

  // Certifications CRUD
  const handleEditCert = (cert: Certificate) => {
    setEditingCertId(cert.id);
    setCertForm({ ...cert });
    setTopicInput(cert.topics.join(', '));
  };

  const handleSaveCert = async () => {
    if (!certForm.title.trim()) {
      onNotify("ERROR: Certification title required.");
      return;
    }

    const topicsArray = topicInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const readyCert: Certificate = {
      ...certForm,
      id: certForm.id || `cert-${Date.now()}`,
      topics: topicsArray
    };

    let updatedCerts: Certificate[];
    if (editingCertId) {
      updatedCerts = certs.map((c) => c.id === editingCertId ? readyCert : c);
      onNotify(`CERTIFICATE COMMITTED: Re-audited ${readyCert.title}.`);
    } else {
      updatedCerts = [...certs, readyCert];
      onNotify(`CERTIFICATE REGISTERED: Lodged new credentials for ${readyCert.title}.`);
    }

    setCerts(updatedCerts);
    localStorage.setItem('cyber_certs', JSON.stringify(updatedCerts));

    if (firebaseUser?.email === 'zabihullah9046@gmail.com') {
      try {
        await setDoc(doc(db, 'certs', readyCert.id), readyCert);
        onNotify(`CERT SYNCED: Uploaded "${readyCert.title}" to cloud Firestore.`);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, `certs/${readyCert.id}`);
      }
    }

    // Reset Form
    setEditingCertId(null);
    setCertForm({
      id: '',
      title: '',
      issuer: '',
      status: '',
      colorType: 'cyan',
      date: '',
      verificationCode: '',
      topics: [],
      description: '',
      category: 'Offensive',
      imageUrl: '',
      verificationUrl: ''
    });
    setTopicInput('');
  };

  const handleDeleteCert = async (idToDelete: string) => {
    const updated = certs.filter((c) => c.id !== idToDelete);
    setCerts(updated);
    localStorage.setItem('cyber_certs', JSON.stringify(updated));

    if (firebaseUser?.email === 'zabihullah9046@gmail.com') {
      try {
        await deleteDoc(doc(db, 'certs', idToDelete));
        onNotify(`CERT PURGED: Deleted item database reference.`);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.DELETE, `certs/${idToDelete}`);
      }
    } else {
      onNotify(`CERTIFICATE PURGED: Deleted item database reference.`);
    }
  };

  // Projects CRUD
  const handleEditProject = (proj: Project) => {
    setEditingProjectId(proj.id);
    setProjectForm({ ...proj });
    setTechStackInput(proj.techStack ? proj.techStack.join(', ') : '');
  };

  const handleSaveProject = async () => {
    let finalProject = { ...projectForm };
    if (!finalProject.id) {
      finalProject.id = `proj-${Date.now()}`;
    }

    if (techStackInput) {
      finalProject.techStack = techStackInput.split(',').map(t => t.trim()).filter(Boolean);
    }
    
    let updated;
    if (editingProjectId) {
      updated = projects.map(p => p.id === finalProject.id ? finalProject : p);
    } else {
      updated = [...projects, finalProject];
    }

    // Always ensure internal ordering logic
    updated.sort((a, b) => (a.order || 0) - (b.order || 0));
    setProjects(updated);
    localStorage.setItem('cyber_projects', JSON.stringify(updated));

    if (firebaseUser?.email === 'zabihullah9046@gmail.com') {
      try {
        await setDoc(doc(db, 'projects', finalProject.id), finalProject);
        onNotify("PROJECT DB SYNC: Changes pushed correctly.");
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, `projects/${finalProject.id}`);
      }
    } else {
      onNotify("PROJECT SAVED: Saved deployed field operation to local storage.");
    }
    handleCancelEditProject();
  };

  const handleSaveCompetency = async () => {
    if (!competencyForm.label.trim()) {
      onNotify("ERROR: Competency label is required.");
      return;
    }

    const newComp: Competency = {
      ...competencyForm,
      id: competencyForm.id || `comp-${Date.now()}`
    };

    let updated = [...(tempProfile.competencies || [])];
    if (editingCompetencyId) {
      updated = updated.map(c => c.id === editingCompetencyId ? newComp : c);
    } else {
      updated = [...updated, newComp];
    }
    
    setTempProfile({ ...tempProfile, competencies: updated });
    setEditingCompetencyId(null);
    setCompetencyForm({ id: '', label: '', colorClass: 'bg-secondary', shadowColor: 'shadow-[0_0_8px_#00FF00]' });
    onNotify("COMPETENCY COMMITTED: Save the profile to persist changes.");
  };

  const handleDeleteCompetency = (idToDelete: string) => {
    const updated = (tempProfile.competencies || []).filter(c => c.id !== idToDelete);
    setTempProfile({ ...tempProfile, competencies: updated });
    onNotify("COMPETENCY REMOVED: Save the profile to persist changes.");
  };

  const handleCancelEditProject = () => {
    setEditingProjectId(null);
    setProjectForm({
      id: '', title: '', description: '', techStack: [], githubUrl: '', liveUrl: '', imageUrl: '', order: 0
    });
    setTechStackInput('');
  };

  const handleDeleteProject = async (idToDelete: string) => {
    const updated = projects.filter(p => p.id !== idToDelete);
    setProjects(updated);
    localStorage.setItem('cyber_projects', JSON.stringify(updated));

    if (firebaseUser?.email === 'zabihullah9046@gmail.com') {
      try {
        await deleteDoc(doc(db, 'projects', idToDelete));
        onNotify("PROJECT PURGED: Deleted item database reference.");
      } catch (err: any) {
        handleFirestoreError(err, OperationType.DELETE, `projects/${idToDelete}`);
      }
    } else {
      onNotify("PROJECT PURGED: Deleted item database reference.");
    }
  };

  // Blogs CRUD
  const handleEditBlog = (blog: BlogPost) => {
    setEditingBlogId(blog.id);
    setBlogForm({ ...blog });
    setTagsInput(blog.tags ? blog.tags.join(', ') : '');
  };

  const handleSaveBlog = async () => {
    if (!blogForm.title.trim()) {
      onNotify("ERROR: Blog title required.");
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const formattedDate = blogForm.date || new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const readyBlog: BlogPost = {
      ...blogForm,
      id: blogForm.id || `post-${Date.now()}`,
      date: formattedDate,
      tags: tagsArray
    };

    let updatedBlogs: BlogPost[];
    if (editingBlogId) {
      updatedBlogs = blogs.map((b) => b.id === editingBlogId ? readyBlog : b);
      onNotify(`BLOG COMMITTED: Published updates for "${readyBlog.title}".`);
    } else {
      updatedBlogs = [...blogs, readyBlog];
      onNotify(`BLOG REGISTERED: Published new log entry "${readyBlog.title}".`);
    }

    setBlogs(updatedBlogs);
    localStorage.setItem('cyber_blogs', JSON.stringify(updatedBlogs));

    if (firebaseUser?.email === 'zabihullah9046@gmail.com') {
      try {
        await setDoc(doc(db, 'blogs', readyBlog.id), readyBlog);
        onNotify(`BLOG SYNCED: Published "${readyBlog.title}" to cloud Firestore.`);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, `blogs/${readyBlog.id}`);
      }
    }

    // Reset form
    setEditingBlogId(null);
    setBlogForm({
      id: '',
      title: '',
      summary: '',
      content: '',
      date: '',
      author: profile.name || 'Zabih Ullah',
      category: 'General Security',
      imageUrl: '',
      readTime: '3 min read',
      tags: []
    });
    setTagsInput('');
  };

  const handleDeleteBlog = async (idToDelete: string) => {
    const updated = blogs.filter((b) => b.id !== idToDelete);
    setBlogs(updated);
    localStorage.setItem('cyber_blogs', JSON.stringify(updated));

    if (firebaseUser?.email === 'zabihullah9046@gmail.com') {
      try {
        await deleteDoc(doc(db, 'blogs', idToDelete));
        onNotify(`BLOG DELETED: Removed log entry memory reference.`);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.DELETE, `blogs/${idToDelete}`);
      }
    } else {
      onNotify(`BLOG DELETED: Removed log entry memory reference.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-container text-on-surface animate-[fadeIn_0.2s_ease_out] overflow-hidden">
      <div 
        className="w-full h-full flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="terminal-header px-6 py-4 flex items-center justify-between select-none">
          <span className="font-mono text-xs text-primary-fixed flex items-center gap-2 font-bold tracking-tight">
            <Lock className="w-4 h-4 text-primary-fixed animate-pulse" />
            SYSTEM OVERRIDE CONSOLE v1.2.0
          </span>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-surface-container-high rounded-xl transition-colors text-on-surface-variant hover:text-primary-fixed cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOT UNLOCKED MODULE: Cyber Security Lock/Auth */}
        {!isUnlocked ? (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center space-y-8 select-none max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary-fixed/10 border border-primary-fixed/30 flex items-center justify-center animate-pulse">
              <Key className="w-8 h-8 text-primary-fixed" />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="font-bold text-xl tracking-tight text-on-surface">Secure Decryption Matrix</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Unlock writing permission for skills ledger, certification files, bio statements, and network redirection indexes.
              </p>
            </div>

             <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-primary-fixed tracking-wider">SECURE IDENTITY</label>
                <input 
                  type="email" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="system-admin@cyber-nodes.io"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/60 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed/20 rounded-xl px-4 py-3 text-sm font-mono text-on-surface outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-primary-fixed tracking-wider">PASSPHRASE CODEKEY</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/60 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed/20 rounded-xl px-4 py-3 text-sm font-mono text-on-surface outline-none"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-error/10 border border-error/30 rounded-xl flex gap-2 items-start">
                  <ShieldAlert className="w-4 h-4 text-error shrink-0 mt-0.5" />
                  <p className="text-[10px] font-mono text-error leading-relaxed">{loginError}</p>
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-3 bg-primary-fixed text-black font-semibold font-mono text-xs rounded-xl hover:bg-primary-fixed-dim transition-all tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4 text-black" /> Evaluate Cryptographic Access
              </button>
            </form>

            {/* Google Authentication Option */}
            <div className="w-full pt-1.5 pb-1 border-t border-outline-variant/30 text-center space-y-2 select-none">
              <span className="text-[10px] font-mono text-secondary font-bold block">[ FIREBASE CRYPTO PORTAL ]</span>
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-secondary text-black font-semibold font-mono text-xs rounded-xl hover:bg-secondary-dim transition-all tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-secondary/15"
              >
                <CloudLightning className="w-4 h-4 text-black animate-pulse" /> Direct Google Auth Sync
              </button>
            </div>
          </div>
        ) : (
          /* UNLOCKED: MAIN CRUD TERMINAL DASHBOARD */
          <div className="flex-1 flex flex-col min-h-[500px] overflow-hidden">
            
            {/* Tab Selectors */}
            <div className="px-6 py-2 bg-surface-container-low border-b border-outline-variant/50 flex flex-wrap gap-2 select-none">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 text-xs font-mono rounded-xl cursor-pointer transition-all flex items-center gap-2 border ${
                  activeTab === 'profile' 
                    ? 'bg-primary-fixed text-black border-transparent font-semibold shadow-sm' 
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant/40 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" /> [ Profile & Links Ledger ]
              </button>

              <button
                onClick={() => setActiveTab('skills')}
                className={`px-4 py-2 text-xs font-mono rounded-xl cursor-pointer transition-all flex items-center gap-2 border ${
                  activeTab === 'skills' 
                    ? 'bg-primary-fixed text-black border-transparent font-semibold shadow-sm' 
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant/40 hover:text-white'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" /> [ Technical Skills CRUD ]
              </button>

              <button
                onClick={() => setActiveTab('certs')}
                className={`px-4 py-2 text-xs font-mono rounded-xl cursor-pointer transition-all flex items-center gap-2 border ${
                  activeTab === 'certs' 
                    ? 'bg-primary-fixed text-black border-transparent font-semibold shadow-sm' 
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant/40 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" /> [ Certifications Matrix ]
              </button>

              <button
                onClick={() => setActiveTab('themes')}
                className={`px-4 py-2 text-xs font-mono rounded-xl cursor-pointer transition-all flex items-center gap-2 border ${
                  activeTab === 'themes' 
                    ? 'bg-primary-fixed text-black border-transparent font-semibold shadow-sm' 
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant/40 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" /> [ System Themes & Backups ]
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`px-4 py-2 text-xs font-mono rounded-xl cursor-pointer transition-all flex items-center gap-2 border ${
                  activeTab === 'projects' 
                    ? 'bg-primary-fixed text-black border-transparent font-semibold shadow-sm' 
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant/40 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" /> [ Project Deployments ]
              </button>

              <button
                onClick={() => setActiveTab('educations')}
                className={`px-4 py-2 text-xs font-mono rounded-xl cursor-pointer transition-all flex items-center gap-2 border ${
                  activeTab === 'educations' 
                    ? 'bg-primary-fixed text-black border-transparent font-semibold shadow-sm' 
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant/40 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> [ Education Log ]
              </button>

              <button
                onClick={() => setActiveTab('blogs')}
                className={`px-4 py-2 text-xs font-mono rounded-xl cursor-pointer transition-all flex items-center gap-2 border ${
                  activeTab === 'blogs' 
                    ? 'bg-primary-fixed text-black border-transparent font-semibold shadow-sm' 
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant/40 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> [ Blogs Intelligence ]
              </button>
            </div>

            {/* Scrollable Workspace Container */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

              {/* Firebase Live Cloud Connection Status banner */}
              <div className="p-4 bg-surface-container border border-outline-variant/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 select-none no-print">
                <div className="flex items-center gap-2.5 self-start md:self-center">
                  <span className={`w-2.5 h-2.5 rounded-full ${firebaseUser ? 'bg-secondary animate-pulse' : 'bg-primary-fixed shadow-[0_0_8px_var(--primary-fixed)]'}`}></span>
                  <div className="font-mono text-[10px] text-on-surface leading-normal">
                    {firebaseUser ? (
                      <span>
                        DATABASE REPLICA: <span className="text-secondary font-bold">SECURE FIREBASE SYNC ACTIVE</span> <br />
                        <span className="text-on-surface-variant text-[9px]">SOP AUTH: <span className="text-secondary-dim font-bold">ACTIVE</span></span>
                      </span>
                    ) : (
                      <span>
                        DATABASE REPLICA: <span className="text-primary-fixed font-bold">LOCAL OFFLINE REGISTRY</span> <br />
                        <span className="text-on-surface-variant text-[9px]">All changes are cached locally on this client</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  {firebaseUser && firebaseUser.email === 'zabihullah9046@gmail.com' && (
                    <button
                      onClick={handleSeedCloudDatabase}
                      disabled={isSeeding}
                      className="px-2.5 py-1.5 bg-secondary/10 hover:bg-secondary/25 text-secondary border border-secondary/25 hover:border-secondary/50 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider disabled:opacity-40"
                      title="Write default datasets to remote Cloud database"
                    >
                      <Database className="w-3.5 h-3.5" /> {isSeeding ? "SEEDING CLOUD..." : "SEED CLOUD DATABASE"}
                    </button>
                  )}
                  
                  {firebaseUser ? (
                    <button
                      onClick={handleFirebaseSignOut}
                      className="px-2.5 py-1.5 bg-error/10 hover:bg-error/20 text-error border border-error/25 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                    >
                      <LogOut className="w-3.5 h-3.5" /> DECOUPLE SESSION
                    </button>
                  ) : (
                    <button
                      onClick={handleGoogleLogin}
                      className="px-2.5 py-1.5 bg-secondary text-black rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer hover:bg-secondary-dim uppercase tracking-wider hover:shadow-md hover:shadow-secondary/10"
                    >
                      <CloudLightning className="w-3.5 h-3.5" /> CONNECT CLOUD SYNC
                    </button>
                  )}
                </div>
              </div>

              {/* TAB 1: PROFILE MANAGEMENT */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="border-b border-outline-variant/40 pb-4">
                    <h4 className="font-sans font-bold text-base text-on-surface">General Identity & Dynamic Redirect Index</h4>
                    <p className="text-xs text-on-surface-variant">Update primary biography elements, titles, contact records, and social hyperlink references across the entire portfolio layout.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-primary-fixed block">FULL NAME</label>
                      <input 
                        type="text" 
                        value={tempProfile.name}
                        onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-primary-fixed block">PORTFOLIO DESIGNATION TITLE</label>
                      <input 
                        type="text" 
                        value={tempProfile.title}
                        onChange={(e) => setTempProfile({ ...tempProfile, title: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-primary-fixed block">GEOLOCATION LOCATION</label>
                      <input 
                        type="text" 
                        value={tempProfile.location}
                        onChange={(e) => setTempProfile({ ...tempProfile, location: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-primary-fixed block">EMAIL ADDRESS</label>
                      <input 
                        type="email" 
                        value={tempProfile.email}
                        onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-primary-fixed block">GITHUB REDIRECT LINK (e.g. github.com/Zabih1)</label>
                      <input 
                        type="text" 
                        value={tempProfile.github}
                        onChange={(e) => setTempProfile({ ...tempProfile, github: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-primary-fixed block">LINKEDIN REDIRECT LINK</label>
                      <input 
                        type="text" 
                        value={tempProfile.linkedin}
                        onChange={(e) => setTempProfile({ ...tempProfile, linkedin: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-sans"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-mono text-primary-fixed block">X / TWITTER LINK (OPTIONAL)</label>
                      <input 
                        type="text" 
                        value={tempProfile.twitter || ''}
                        onChange={(e) => setTempProfile({ ...tempProfile, twitter: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-sans"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <ImageUploader 
                        label="PROFILE PICTURE SECTOR PAYLOAD"
                        currentValue={tempProfile.profilePic || ''}
                        onChange={(base64) => setTempProfile({ ...tempProfile, profilePic: base64 })}
                        onClear={() => setTempProfile({ ...tempProfile, profilePic: '' })}
                        onNotify={onNotify}
                        placeholderText="Enter direct web image link or upload payload..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-primary-fixed block">MAIN ACADEMIC BIOGRAPHY SUMMARY</label>
                      <textarea 
                        rows={3}
                        value={tempProfile.bio}
                        onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-sans resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-primary-fixed block">CYBER RED TEAM HIGHLIGHT (SUB-BIO)</label>
                      <textarea 
                        rows={2}
                        value={tempProfile.redTeamBio || ''}
                        onChange={(e) => setTempProfile({ ...tempProfile, redTeamBio: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-sans resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-primary-fixed block">CYBER BLUE TEAM HIGHLIGHT (SUB-BIO)</label>
                      <textarea 
                        rows={2}
                        value={tempProfile.blueTeamBio || ''}
                        onChange={(e) => setTempProfile({ ...tempProfile, blueTeamBio: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-sans resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-primary-fixed block">PURPLE TEAMING ALL HIGHLIGHT (SUB-BIO)</label>
                      <textarea 
                        rows={2}
                        value={tempProfile.purpleTeamBio || ''}
                        onChange={(e) => setTempProfile({ ...tempProfile, purpleTeamBio: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-sans resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={saveProfile}
                      className="px-6 py-3 bg-primary-fixed hover:bg-white text-[#0A0A0A] font-bold font-mono text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Save Global Identity Elements
                    </button>
                  </div>

                  {/* Competencies Editing UI */}
                  <div className="space-y-4 pt-6 border-t border-outline-variant/40">
                    <h5 className="font-sans font-bold text-sm text-on-surface">Manage Competency Badges</h5>
                    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={competencyForm.label}
                          onChange={(e) => setCompetencyForm({...competencyForm, label: e.target.value})}
                          placeholder="Label (e.g. Purple Teaming)"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-lg px-3 py-2 text-sm"
                        />
                        <button
                          onClick={handleSaveCompetency}
                          className="bg-secondary text-black font-bold py-2 rounded-lg text-sm"
                        >
                          {editingCompetencyId ? 'Update Competency' : 'Add Competency'}
                        </button>
                      </div>
                      <div className="mt-4 space-y-2">
                        {tempProfile.competencies?.map(comp => (
                          <div key={comp.id} className="flex justify-between items-center p-2 bg-surface-container rounded-lg border border-outline-variant/20">
                            <span>{comp.label}</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleEditCompetency(comp)} className="text-primary-fixed">Edit</button>
                              <button onClick={() => handleDeleteCompetency(comp.id)} className="text-error">Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SKILLS CRUD */}
              {activeTab === 'skills' && (
                <div className="space-y-8">
                  {/* Skill Entry Form Block */}
                  <div className="p-5 bg-surface-container-low border border-outline-variant/50 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center select-none border-b border-outline-variant/30 pb-2">
                      <span className="font-mono text-xs text-primary-fixed font-bold">
                        {editingSkillName ? `[ EDITING SKILL NODE: ${editingSkillName} ]` : '[ REGISTER NEW SKILL INTERRUPT ]'}
                      </span>
                      {editingSkillName && (
                        <button 
                          onClick={() => {
                            setEditingSkillName(null);
                            setSkillForm({ name: '', category: 'Core', level: 80, iconName: 'Code', description: '' });
                          }}
                          className="text-[10px] font-mono text-[#FF3333] hover:underline"
                        >
                          Cancel Edit Mode
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed">SKILL TITLE</label>
                        <input 
                          type="text" 
                          value={skillForm.name}
                          onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                          placeholder="e.g. Wireshark"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed">CATEGORY LAYER</label>
                        <select 
                          value={skillForm.category}
                          onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value as 'Offensive' | 'Defensive' | 'Core' })}
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        >
                          <option value="Offensive">Offensive (Red Teaming)</option>
                          <option value="Defensive">Defensive (Blue Teaming)</option>
                          <option value="Core">Core Foundations (Compiler/Logic)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed">CYBER LOG VISUAL ICON</label>
                        <select 
                          value={skillForm.iconName}
                          onChange={(e) => setSkillForm({ ...skillForm, iconName: e.target.value as any })}
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        >
                          <option value="Code">C++ (Code Icon)</option>
                          <option value="Database">Database Security (Database Icon)</option>
                          <option value="Terminal">Terminal Console (Terminal Icon)</option>
                          <option value="Network">Traffic Network (Network Icon)</option>
                          <option value="Cpu">Process Algorithm (Cpu Icon)</option>
                          <option value="Shield">Defense Shield (Shield Icon)</option>
                        </select>
                      </div>

                      <div className="space-y-1 md:col-span-3">
                        <label className="text-[10px] font-mono text-primary-fixed flex justify-between">
                          <span>PROFICIENCY INDEX SCORE</span>
                          <span className="text-[#00FF00] font-semibold">{skillForm.level}%</span>
                        </label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="10" 
                            max="100" 
                            value={skillForm.level}
                            onChange={(e) => setSkillForm({ ...skillForm, level: parseInt(e.target.value) })}
                            className="flex-1 accent-[#FF5C00] h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="font-mono text-xs w-8 text-right">{skillForm.level}%</span>
                        </div>
                      </div>

                      <div className="space-y-1 md:col-span-3">
                        <label className="text-[10px] font-mono text-primary-fixed flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-primary-fixed" /> EXTERNAL PROJECT EVIDENCE LINK (URL)
                        </label>
                        <input 
                          type="text" 
                          value={skillForm.externalUrl || ''}
                          onChange={(e) => setSkillForm({ ...skillForm, externalUrl: e.target.value })}
                          placeholder="e.g. https://github.com/username/exploit-poc"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                        <span className="text-[10px] font-mono text-on-surface-variant block leading-tight mt-1">
                          ✔ Provide direct POC or documentation hyperlinks (e.g. Wireshark profile, CVE research) for evidence audit circles.
                        </span>
                      </div>

                      <div className="space-y-1 md:col-span-3">
                        <label className="text-[10px] font-mono text-primary-fixed">EXPLANATOR DIAGNOSTIC LOG</label>
                        <textarea 
                          rows={2}
                          value={skillForm.description}
                          onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                          placeholder="Brief technical breakdown of capabilities and environments applied..."
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end p-1">
                      <button 
                        onClick={handleSaveSkill}
                        className="px-4 py-2 bg-primary-fixed text-black text-xs font-mono font-bold rounded-xl hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" /> Commit Skill Ledger Block
                      </button>
                    </div>
                  </div>

                  {/* Existing Skills Grid List */}
                  <div className="space-y-3">
                    <h5 className="font-sans font-bold text-xs text-on-surface-variant uppercase tracking-widest select-none">Existing Registry Memory Allocations ({skills.length})</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {skills.map((skill) => (
                        <div key={skill.name} className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl flex flex-col justify-between space-y-3 hover:border-primary-fixed/40 transition-colors">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="font-sans font-bold text-sm text-on-surface">{skill.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-tight text-primary-fixed bg-primary-fixed/10 border border-primary-fixed/30">
                                {skill.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-on-surface-variant line-clamp-2 leading-relaxed">{skill.description}</p>
                            <div className="font-mono text-[9px] text-secondary flex items-center justify-between">
                              <span>{skill.level}% Proficient</span>
                              {skill.externalUrl && (
                                <span className="text-[8px] text-primary-fixed uppercase tracking-wider bg-primary-fixed/5 px-1.5 py-0.5 rounded border border-primary-fixed/20">
                                  Linked
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-1.5 border-t border-outline-variant/20 pt-2 select-none">
                            <button 
                              onClick={() => handleEditSkill(skill)}
                              className="p-1.5 hover:bg-surface-container hover:text-primary-fixed rounded transition-colors text-on-surface-variant cursor-pointer"
                              title="Edit Skill Data"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSkill(skill.name)}
                              className="p-1.5 hover:bg-surface-container hover:text-[#FF3333] rounded transition-colors text-on-surface-variant cursor-pointer"
                              title="Erase Skill Memory Node"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CERTUNICATIONS CRUD */}
              {activeTab === 'certs' && (
                <div className="space-y-8">
                  {/* Cert Registry Form Block */}
                  <div className="p-5 bg-surface-container-low border border-outline-variant/50 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center select-none border-b border-outline-variant/30 pb-2">
                      <span className="font-mono text-xs text-primary-fixed font-bold">
                        {editingCertId ? `[ RE-AUDITING CERTIFICATION REF: ${certs.find(c => c.id === editingCertId)?.title} ]` : '[ REGISTER UNVERIFIED SYSTEM CREDENTIAL ]'}
                      </span>
                      {editingCertId && (
                        <button 
                          onClick={() => {
                            setEditingCertId(null);
                            setCertForm({
                              id: '', title: '', issuer: '', status: '', colorType: 'cyan', date: '', verificationCode: '', topics: [], description: '', category: 'Offensive', imageUrl: ''
                            });
                            setTopicInput('');
                          }}
                          className="text-[10px] font-mono text-[#FF3333] hover:underline"
                        >
                          Cancel Edit Mode
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed">CERTIFICATE TITLE</label>
                        <input 
                          type="text" 
                          value={certForm.title}
                          onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                          placeholder="Google Security Specialist"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed">CREDENTIAL ISSUER</label>
                        <input 
                          type="text" 
                          value={certForm.issuer}
                          onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                          placeholder="TryHackMe / Google"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed">SHORT KEY STATUS BADGE</label>
                        <input 
                          type="text" 
                          value={certForm.status}
                          onChange={(e) => setCertForm({ ...certForm, status: e.target.value })}
                          placeholder="Verified / CTF / Network"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed">VERIFIED DATE</label>
                        <input 
                          type="text" 
                          value={certForm.date}
                          onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                          placeholder="October 2024"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed">VERIFICATION CHECKSUM CODE</label>
                        <input 
                          type="text" 
                          value={certForm.verificationCode}
                          onChange={(e) => setCertForm({ ...certForm, verificationCode: e.target.value })}
                          placeholder="GGL-SEC-4D7F8A"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed">DESIGN VISUALS THEME</label>
                        <select 
                          value={certForm.colorType}
                          onChange={(e) => setCertForm({ ...certForm, colorType: e.target.value as any })}
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        >
                          <option value="lime">Lime Accent Glow (THM Greenish)</option>
                          <option value="cyan">Cyan Glow (Tech Blue/Secondary)</option>
                          <option value="red">Red Alert Glow (CTF/Security Block)</option>
                          <option value="gray">Gray Steel (Classic defensive border)</option>
                          <option value="neutral">Neutral White (Standard text card)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed">TACTICAL AREA SECTOR</label>
                        <select 
                          value={certForm.category}
                          onChange={(e) => setCertForm({ ...certForm, category: e.target.value as any })}
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        >
                          <option value="Offensive">Offensive</option>
                          <option value="Defensive">Defensive</option>
                          <option value="General">General/Miscellaneous</option>
                        </select>
                      </div>

                      {/* Image Field & Safety Notice */}
                      <div className="space-y-1 md:col-span-2">
                        <ImageUploader 
                          label="CERTIFICATION IMAGE DECRYPTION PAYLOAD"
                          currentValue={certForm.imageUrl || ''}
                          onChange={(base64) => setCertForm({ ...certForm, imageUrl: base64 })}
                          onClear={() => setCertForm({ ...certForm, imageUrl: '' })}
                          onNotify={onNotify}
                          placeholderText="Enter direct high-tech badge URL or upload image payload..."
                        />
                      </div>

                      <div className="space-y-1 md:col-span-1">
                        <label className="text-[10px] font-mono text-primary-fixed flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-primary-fixed" /> CREDENTIAL VERIFICATION LINK (URL)
                        </label>
                        <input 
                          type="text" 
                          value={certForm.verificationUrl || ''}
                          onChange={(e) => setCertForm({ ...certForm, verificationUrl: e.target.value })}
                          placeholder="e.g. https://coursera.org/verify/..."
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                        <span className="text-[10px] font-mono text-on-surface-variant block leading-tight mt-1">
                          ✔ Provide direct hyperlink (e.g. TryHackMe, Google, Cisco) for verification badging loops.
                        </span>
                      </div>

                      <div className="space-y-1 md:col-span-3">
                        <label className="text-[10px] font-mono text-primary-fixed">EXAMINED TOPICS INDEX (Comma Separated)</label>
                        <input 
                          type="text" 
                          value={topicInput}
                          onChange={(e) => setTopicInput(e.target.value)}
                          placeholder="e.g. Asset Security, SQL payloads, SIEM tools, Packet sniffing, Cryptology"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-3">
                        <label className="text-[10px] font-mono text-primary-fixed">CREDENTIAL STATEMENT SUMMARY</label>
                        <textarea 
                          rows={2}
                          value={certForm.description}
                          onChange={(e) => setCertForm({ ...certForm, description: e.target.value })}
                          placeholder="Comprehensive description of curriculum highlights, and verified parameters..."
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end p-1">
                      <button 
                        onClick={handleSaveCert}
                        className="px-4 py-2 bg-primary-fixed text-black text-xs font-mono font-bold rounded-xl hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" /> Commit Credential File
                      </button>
                    </div>
                  </div>

                  {/* Existing Certs list */}
                  <div className="space-y-3">
                    <h5 className="font-sans font-bold text-xs text-on-surface-variant uppercase tracking-widest select-none">Existing Verified Certifications ({certs.length})</h5>
                    <div className="space-y-2">
                      {certs.map((cert) => (
                        <div key={cert.id} className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary-fixed/40 transition-colors">
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {cert.imageUrl ? (
                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-outline-variant/60 flex items-center justify-center bg-black">
                                  <img 
                                    src={cert.imageUrl} 
                                    alt={cert.title} 
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      // Fallback on broken URL error so that it does NOT look broken
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.parentElement!.innerHTML = '<span class="text-[8px] font-mono text-primary-fixed">SAFE</span>';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg border border-primary-fixed/30 flex items-center justify-center bg-black shrink-0">
                                  <Award className="w-5 h-5 text-primary-fixed" />
                                </div>
                              )}
                              <div>
                                <h6 className="font-sans font-bold text-sm text-on-surface leading-snug">{cert.title}</h6>
                                <p className="font-mono text-[10px] text-on-surface-variant">Issuer: {cert.issuer} • Code: {cert.verificationCode}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 select-none">
                            <span className="font-mono text-[10px] text-secondary">{cert.date}</span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleEditCert(cert)}
                                className="p-1.5 hover:bg-surface-container hover:text-primary-fixed rounded transition-colors text-on-surface-variant cursor-pointer"
                                title="Edit Cert Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteCert(cert.id)}
                                className="p-1.5 hover:bg-surface-container hover:text-[#FF3333] rounded transition-colors text-on-surface-variant cursor-pointer"
                                title="Erase Credential Entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: THEMES, FONTS & BACKUPS */}
              {activeTab === 'themes' && (
                <div className="space-y-6">
                  <div className="border-b border-outline-variant/40 pb-4">
                    <h4 className="font-sans font-bold text-base text-on-surface">System Aesthetic & Data Portability Ledger</h4>
                    <p className="text-xs text-on-surface-variant">Adjust color themes, fonts, falling background matrix systems, and execute full client backups (Original JSON exports & restores).</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Presets & Fonts */}
                    <div className="glass-panel p-5 rounded-2xl border border-outline-variant/40 bg-surface-container-low/40 space-y-4">
                      <h5 className="font-sans font-bold text-xs text-primary-fixed uppercase tracking-widest select-none flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-primary-fixed" /> Visual Color Presets
                      </h5>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-on-surface-variant block">ACTIVE CONFIGURATION THEME SCHEME</label>
                          <select 
                            value={themeScheme}
                            onChange={(e) => {
                              setThemeScheme(e.target.value);
                              localStorage.setItem('cyber_theme_scheme', e.target.value);
                              onNotify(`ENVIRONMENT ALIGNED: Preset scheme shifted to ${e.target.value.toUpperCase()}`);
                            }}
                            className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface font-sans"
                          >
                            <optgroup label="Dark Presets (Eye-Safe Cyberpunk)">
                              <option value="dark-cosmic">Dark Cosmic Amber (Warm Amber & High Contrast)</option>
                              <option value="dark-matrix">Dark Phosphorous Matrix (Luminous Classic Green)</option>
                              <option value="dark-cyberpunk">Dark Cyberpunk Neon (Hot Pink, Cyber Cyan & Violet)</option>
                              <option value="dark-nordic">Dark Arctic Nordic (Frost Blue, Sage Green & Charcoal)</option>
                            </optgroup>
                            <optgroup label="Light Presets (Professional Technical)">
                              <option value="light-protocol">Light Cyber Protocol (Cool Oceanic Teal & Steel)</option>
                              <option value="light-retro">Light Retro Terminal (Smooth Clay Amber & Soft Cream)</option>
                              <option value="light-ocean">Light Deep Sea (Strategic Blue, Sky Highlights & Ice Blue)</option>
                            </optgroup>
                          </select>
                        </div>

                        {/* Interactive Mode Toggle Badge */}
                        <div className="flex items-center justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/30 select-none">
                          <span className="font-mono text-[11px] text-on-surface-variant">Instant Mode Shift (Dark / Light Toggle)</span>
                          <button
                            onClick={() => {
                              const isDark = themeScheme.startsWith('dark');
                              const nextScheme = isDark ? 'light-protocol' : 'dark-cosmic';
                              setThemeScheme(nextScheme);
                              localStorage.setItem('cyber_theme_scheme', nextScheme);
                              onNotify(`THEME TOGGLE: Shifted to ${nextScheme.startsWith('dark') ? 'DARK' : 'LIGHT'} mode.`);
                            }}
                            className="px-3 py-1 bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed border border-primary-fixed/20 hover:border-primary-fixed rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            {themeScheme.startsWith('dark') ? (
                              <>
                                <Sun className="w-3.5 h-3.5 text-amber-500" /> Light Mode
                              </>
                            ) : (
                              <>
                                <Moon className="w-3.5 h-3.5 text-indigo-400" /> Dark Mode
                              </>
                            )}
                          </button>
                        </div>

                        {/* Dynamic typography */}
                        <div className="space-y-1 pt-2">
                          <label className="text-[10px] font-mono text-on-surface-variant block">SYSTEM TYPOGRAPHY PAIRINGS</label>
                          <select 
                            value={fontFamilyCombo}
                            onChange={(e) => {
                              setFontFamilyCombo(e.target.value);
                              localStorage.setItem('cyber_font_family_combo', e.target.value);
                              onNotify(`FONTS LINKED: Typographic pairing set to ${e.target.value.toUpperCase()}`);
                            }}
                            className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface font-sans"
                          >
                            <option value="modern-sans">Inter Clean Sans (UI focus) & JetBrains Mono</option>
                            <option value="cyber-technical">JetBrains Mono Everywhere (True Terminal Feel)</option>
                            <option value="space-grotesk">Space Grotesk Display & JetBrains Mono (Tech-forward)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Hacker Background adjustments */}
                    <div className="glass-panel p-5 rounded-2xl border border-outline-variant/40 bg-surface-container-low/40 space-y-4">
                      <h5 className="font-sans font-bold text-xs text-primary-fixed uppercase tracking-widest select-none flex items-center gap-1.5">
                        <TerminalIcon className="w-4 h-4 text-primary-fixed" /> Hacker Canvas Canvas Background Style
                      </h5>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-on-surface-variant block">ACTIVE CANVAS RENDER ENGINE</label>
                          <select 
                            value={bgStyle}
                            onChange={(e) => {
                              const styleVal = e.target.value as any;
                              setBgStyle(styleVal);
                              localStorage.setItem('cyber_bg_style', styleVal);
                              onNotify(`ENGINE LOADED: Background style switched to ${styleVal.toUpperCase()}`);
                            }}
                            className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface font-sans"
                          >
                            <option value="particles-drift">✨ Stellar Node Network Particles Drift (High Performance & Low CPU Fluidity)</option>
                            <option value="cyber-grid">🛡 Bento Technical Scan Laser Grid (Modern Bento Lines)</option>
                            <option value="clean">⚪ Clean Solid Flat Canvas (No animation, high legible focus)</option>
                          </select>
                        </div>

                        <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/40 font-mono text-[11px] text-on-surface-variant space-y-1 leading-relaxed">
                          <span className="text-secondary font-bold">[ RENDERING MATRIX STATUS ]</span>
                          <p>
                            • Style: <span className="text-primary-fixed">{bgStyle.toUpperCase()}</span><br />
                            • Mode: <span className="text-primary-fixed">{themeScheme.startsWith('dark') ? 'DARK_MODE(HIGH_CONTRAST)' : 'LIGHT_MODE(DECREASED_GLARE)'}</span><br />
                            • Frame Rate: <span className="text-secondary">30 FPS (Throttled for lower CPU usage)</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Synthesized System Sound Controls */}
                    <div className="glass-panel p-5 rounded-2xl border border-outline-variant/40 bg-surface-container-low/40 space-y-4">
                      <h5 className="font-sans font-bold text-xs text-primary-fixed uppercase tracking-widest select-none flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-primary-fixed" /> Core Synthesizer Audio Controls
                      </h5>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3.5 bg-surface-container rounded-xl border border-outline-variant/30 select-none">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-[11px] text-on-surface block">SYSTEM AUDITORY FEEDBACK</span>
                            <span className="text-[10px] text-on-surface-variant font-mono block">Terminal clicks, beeps & startup sweeps</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              const nextState = !audioEnabled;
                              setAudioEnabled(nextState);
                              if (nextState) {
                                setTimeout(() => playBootAudioSequence(), 50);
                              }
                              onNotify(`AUDIO MODULATION: Audio feedback protocol set to ${nextState ? 'ACTIVE' : 'INACTIVE'}`);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                              audioEnabled 
                                ? 'bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/40 font-bold' 
                                : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/40'
                            }`}
                          >
                            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                            {audioEnabled ? 'SOUNDS: ON' : 'SOUNDS: OFF'}
                          </button>
                        </div>

                        {/* Auditory Pulse Playground Triggers */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-on-surface-variant block uppercase tracking-wider">[ WAVEFORM PLAYGROUND TEST PACKETS ]</label>
                          <div className="grid grid-cols-2 gap-2 select-none">
                            <button
                              onClick={() => {
                                playClickSound();
                              }}
                              disabled={!audioEnabled}
                              className={`py-2 px-2.5 font-mono text-[10px] rounded-lg transition-colors text-center border cursor-pointer ${
                                audioEnabled 
                                  ? 'bg-surface-container hover:bg-surface-container-high text-on-surface border-outline-variant/50 hover:border-primary-fixed-dim' 
                                  : 'bg-surface-container-low/50 text-on-surface-variant/40 border-outline-variant/10 cursor-not-allowed'
                              }`}
                            >
                              ▶ Send Click Beep
                            </button>

                            <button
                              onClick={() => {
                                playHoverSound();
                              }}
                              disabled={!audioEnabled}
                              className={`py-2 px-2.5 font-mono text-[10px] rounded-lg transition-colors text-center border cursor-pointer ${
                                audioEnabled 
                                  ? 'bg-surface-container hover:bg-surface-container-high text-on-surface border-outline-variant/50 hover:border-primary-fixed-dim' 
                                  : 'bg-surface-container-low/50 text-on-surface-variant/40 border-outline-variant/10 cursor-not-allowed'
                              }`}
                            >
                              ▶ Send Hover Tick
                            </button>

                            <button
                              onClick={() => {
                                playBootAudioSequence();
                              }}
                              disabled={!audioEnabled}
                              className={`py-2 px-2.5 font-mono text-[10px] rounded-lg transition-colors text-center border cursor-pointer ${
                                audioEnabled 
                                  ? 'bg-surface-container hover:bg-surface-container-high text-on-surface border-outline-variant/50 hover:border-primary-fixed-dim col-span-2' 
                                  : 'bg-surface-container-low/50 text-on-surface-variant/40 border-outline-variant/10 cursor-not-allowed col-span-2'
                              }`}
                            >
                              ▶ Send Decryption Boot Sweep
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ledger backup section */}
                    <div className="glass-panel p-5 rounded-2xl border border-outline-variant/40 bg-surface-container-low/40 md:col-span-2 space-y-4">
                      <div>
                        <h5 className="font-sans font-bold text-xs text-primary-fixed uppercase tracking-widest select-none flex items-center gap-1.5">
                          <Download className="w-4 h-4 text-primary-fixed" /> Full Portfolio Configuration Backups (Original Export/Import)
                        </h5>
                        <p className="text-[10px] font-mono text-on-surface-variant mt-1">Export your whole customized portfolio (your customized general bio, skills list, credential marks, and visual preferences) as a single JSON file. You can import it back anytime to restore your edits!</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleExportConfig}
                          className="flex-1 py-3 bg-secondary text-black font-semibold font-mono text-xs rounded-xl hover:bg-secondary-dim hover:scale-101 active:scale-98 cursor-pointer transition-all flex items-center justify-center gap-2 select-none border border-transparent shadow-[0_0_12px_rgba(0,255,0,0.15)]"
                        >
                          <Download className="w-4 h-4" /> Export Ledger Configuration
                        </button>

                        <button
                          onClick={handleSeedCloudDatabase}
                          disabled={isSeeding}
                          className="flex-1 py-3 bg-primary-fixed/20 text-primary-fixed font-semibold font-mono text-xs rounded-xl hover:bg-primary-fixed hover:text-black hover:scale-101 active:scale-98 cursor-pointer transition-all flex items-center justify-center gap-2 select-none border border-primary-fixed/40 disabled:opacity-50 disabled:cursor-wait"
                        >
                          {isSeeding ? (
                            <>
                              <CloudLightning className="w-4 h-4 animate-spin" /> Seeding DB...
                            </>
                          ) : (
                            <>
                              <Database className="w-4 h-4" /> Seed Firestore (DB)
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-3 bg-surface-container-high text-white font-semibold font-mono text-xs rounded-xl hover:bg-surface-container-highest hover:scale-101 active:scale-98 cursor-pointer transition-all flex items-center justify-center gap-2 select-none border border-outline-variant/60 hover:border-primary-fixed"
                        >
                          <Upload className="w-4 h-4 text-primary-fixed" /> Upload & Restore Ledger Backup (.json)
                        </button>
                        
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleImportConfig}
                          accept=".json"
                          className="hidden"
                        />
                      </div>

                      <div className="text-[10px] font-mono text-center text-on-surface-variant select-none border-t border-outline-variant/20 pt-2 flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-primary-fixed" /> SECURE DECRYPTION LAYER ACTIVE • COMPLIANT WITH THE ORIGINAL EXPORT GUIDELINES
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* PROJECTS MANAGEMENT */}
              {activeTab === 'projects' && (
                <div className="space-y-8 animate-[fadeIn_0.2s_ease_out]">
                  <div className="p-5 bg-surface-container-low border border-outline-variant/50 rounded-2xl space-y-4">
                    <h3 className="font-sans font-bold text-on-surface uppercase tracking-wider flex items-center gap-2 select-none text-sm border-b border-outline-variant/30 pb-2">
                      <Code className="w-4 h-4 text-primary-fixed" /> {editingProjectId ? 'EDIT DEPLOYMENT RECORD' : 'INITIALIZE NEW DEPLOYMENT'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-on-surface-variant font-semibold">TITLE / NAME SIGNATURE</label>
                        <input
                          type="text"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary-fixed transition-colors font-sans"
                          placeholder="Project title constraint..."
                          value={projectForm.title}
                          onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-on-surface-variant font-semibold">TECH STACK (COMMA SEPARATED)</label>
                        <input
                          type="text"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary-fixed transition-colors font-sans"
                          placeholder="Python, C++, AWS, Docker..."
                          value={techStackInput}
                          onChange={(e) => setTechStackInput(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-on-surface-variant font-semibold">GITHUB SECURE LINK (OPTIONAL)</label>
                        <input
                          type="text"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary-fixed transition-colors font-sans"
                          placeholder="https://github.com/..."
                          value={projectForm.githubUrl || ''}
                          onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-on-surface-variant font-semibold">LIVE LINK OR DEPLOYMENT (OPTIONAL)</label>
                        <input
                          type="text"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary-fixed transition-colors font-sans"
                          placeholder="https://example.com/..."
                          value={projectForm.liveUrl || ''}
                          onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-on-surface-variant font-semibold">PROJECT SPECIFICATION OVERVIEW</label>
                      <textarea
                        className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary-fixed transition-colors min-h-[120px] font-sans resize-y"
                        placeholder="Detail the technical specifications, architectures, challenges and overall functionality..."
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                       {editingProjectId && (
                        <button
                          type="button"
                          onClick={handleCancelEditProject}
                          className="px-5 py-2 text-xs font-mono font-bold bg-surface-container border border-outline-variant hover:bg-surface-container-high rounded-xl transition-colors cursor-pointer"
                        >
                          ABORT
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveProject}
                        className="px-5 py-2 text-xs font-mono font-bold bg-primary-fixed text-black hover:bg-primary-fixed-dim rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        {editingProjectId ? 'COMPILE & UPDATE' : 'COMPILE NEW RECORD'}
                      </button>
                    </div>
                  </div>

                  {/* Projects Matrix */}
                  <div className="space-y-3">
                    <h3 className="font-mono font-bold text-on-surface text-xs uppercase tracking-widest pl-1 mt-6 border-b border-outline-variant/30 pb-2">
                      AUTHORIZED DEPLOYMENTS LEDGER
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                      {projects.map((proj) => (
                        <div key={proj.id} className="p-4 bg-surface-container border border-outline-variant/50 rounded-2xl flex flex-col hover:border-primary-fixed/50 transition-colors group">
                          <div>
                            <h4 className="font-sans font-bold text-primary-fixed text-base">{proj.title}</h4>
                            <p className="text-[10px] text-on-surface-variant font-mono mt-1 mb-2 line-clamp-3">
                              {proj.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {proj.techStack?.slice(0,3).map((t, idx) => (
                                <span key={idx} className="bg-surface-container-highest px-1.5 py-0.5 rounded text-[9px] font-mono text-secondary">{t}</span>
                              ))}
                              {(proj.techStack?.length || 0) > 3 && <span className="bg-surface-container-highest px-1.5 py-0.5 rounded text-[9px] font-mono text-secondary">+{proj.techStack?.length! - 3}</span>}
                            </div>
                          </div>
                          
                          {/* Actions overlay */}
                          <div className="mt-auto pt-3 border-t border-outline-variant/30 flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditProject(proj)}
                              className="px-3 py-1.5 bg-surface-container-high hover:bg-primary-fixed border border-transparent hover:border-black hover:text-black rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                              title="Modify Project Vector"
                            >
                              EDIT
                            </button>
                            <button
                             onClick={(e) => handleDeleteProject(proj.id)}
                             className="px-3 py-1.5 bg-surface-container-high hover:bg-error border border-transparent hover:border-black hover:text-black text-error rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                             title="Purge Project Reference"
                            >
                              PURGE
                            </button>
                          </div>
                        </div>
                      ))}
                      {projects.length === 0 && (
                        <div className="col-span-full py-8 text-center border-2 border-dashed border-outline-variant/30 rounded-2xl">
                          <Code className="w-8 h-8 text-outline-variant mx-auto mb-2 opacity-50" />
                          <p className="text-xs font-mono text-on-surface-variant">NO DEPLOYMENT RECORDS FOUND IN REGISTRY</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5 (now 6): BLOGS MANAGEMENT */}
              {activeTab === 'blogs' && (
                <div className="space-y-8 animate-[fadeIn_0.2s_ease_out]">
                  {/* Blog Entry Form */}
                  <div className="p-5 bg-surface-container-low border border-outline-variant/50 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center select-none border-b border-outline-variant/30 pb-2">
                      <span className="font-mono text-xs text-primary-fixed font-bold">
                        {editingBlogId ? `[ EDITING BLOG LAB NODE: "${blogs.find(b => b.id === editingBlogId)?.title}" ]` : '[ REGISTER NEW CYBER LOG ENTRY ]'}
                      </span>
                      {editingBlogId && (
                        <button 
                          onClick={() => {
                            setEditingBlogId(null);
                            setBlogForm({
                              id: '', title: '', summary: '', content: '', date: '', author: profile.name || 'Zabih Ullah', category: 'General Security', imageUrl: '', readTime: '3 min read', tags: []
                            });
                            setTagsInput('');
                          }}
                          className="text-[10px] font-mono text-[#FF3333] hover:underline cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Title */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-mono text-primary-fixed block">BLOG ENTRY TITLE</label>
                        <input 
                          type="text" 
                          value={blogForm.title}
                          onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                          placeholder="e.g. Reverse Engineering Compiled ELF Binaries"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed block">LOG CATEGORY</label>
                        <input 
                          type="text" 
                          value={blogForm.category}
                          onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                          placeholder="e.g. Reverse Engineering"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      {/* Summary */}
                      <div className="space-y-1 md:col-span-3">
                        <label className="text-[10px] font-mono text-primary-fixed block">SUMMARY INDEX STATEMENT</label>
                        <input 
                          type="text" 
                          value={blogForm.summary}
                          onChange={(e) => setBlogForm({ ...blogForm, summary: e.target.value })}
                          placeholder="A brief high-level index statement explaining the post focal objectives..."
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      {/* Author */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed block">SIGNATURE AUTHOR</label>
                        <input 
                          type="text" 
                          value={blogForm.author}
                          onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                          placeholder="e.g. Zabih Ullah"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      {/* Read Time */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed block">READ TIME INDEX</label>
                        <input 
                          type="text" 
                          value={blogForm.readTime}
                          onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                          placeholder="e.g. 5 min read"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      {/* Date */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed block">LOG DATE STATEMENT</label>
                        <input 
                          type="text" 
                          value={blogForm.date}
                          onChange={(e) => setBlogForm({ ...blogForm, date: e.target.value })}
                          placeholder="e.g. Feb 28, 2026 (or leave blank for today)"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      {/* Header image / upload */}
                      <div className="space-y-1 md:col-span-2">
                        <ImageUploader 
                          label="BLOG DECORATIVE HEADER PAYLOAD"
                          currentValue={blogForm.imageUrl || ''}
                          onChange={(base64) => setBlogForm({ ...blogForm, imageUrl: base64 })}
                          onClear={() => setBlogForm({ ...blogForm, imageUrl: '' })}
                          onNotify={onNotify}
                          placeholderText="Enter direct web image link or upload payload..."
                        />
                      </div>

                      {/* Tags */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed block">TAG INDEXING (Separated by commas)</label>
                        <input 
                          type="text" 
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                          placeholder="CTF, ELF, Linux"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      {/* Content block with markdown details */}
                      <div className="space-y-1 md:col-span-3">
                        <label className="text-[10px] font-mono text-primary-fixed block">BLOG MARKDOWN CONTENT BODY</label>
                        <textarea 
                          rows={8}
                          value={blogForm.content}
                          onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                          placeholder={`## Section Head\nUse standard Markdown tags to write declassified walklogs or write-ups. Supports lists, headers, code, and more!`}
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs font-mono resize-none leading-relaxed text-on-surface animate-pulse"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end p-1 select-none">
                      <button 
                        onClick={handleSaveBlog}
                        className="px-5 py-2.5 bg-primary-fixed hover:bg-white text-black text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> Save Blog Post Entry
                      </button>
                    </div>
                  </div>

                  {/* Existing Blogs Registry Lists */}
                  <div className="space-y-4">
                    <h5 className="font-sans font-bold text-xs text-on-surface-variant uppercase tracking-widest select-none">Existing Blogs Entries ({blogs.length})</h5>
                    
                    {blogs.length === 0 ? (
                      <div className="p-8 border border-dashed border-outline-variant/40 rounded-2xl text-center">
                        <BookOpen className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2 animate-bounce" />
                        <p className="text-xs font-mono text-on-surface-variant">No system logs published yet. Initialize above.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {blogs.map((b) => (
                          <div 
                            key={b.id} 
                            className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary-fixed/40 transition-colors"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 select-none">
                                <span className="px-2 py-0.5 text-[9px] font-mono font-bold text-secondary bg-secondary/10 border border-secondary/30 rounded-full shrink-0">
                                  {b.category}
                                </span>
                                <span className="text-[10px] font-mono text-on-surface-variant">
                                  {b.date} • {b.readTime || '3 min'}
                                </span>
                              </div>
                              <h6 className="font-sans font-bold text-sm text-on-surface truncate">{b.title}</h6>
                              <p className="text-xs text-on-surface-variant line-clamp-1 leading-relaxed">{b.summary}</p>
                            </div>
                            
                            <div className="flex gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 sm:pt-0 pt-2 border-outline-variant/20 select-none">
                              <button 
                                onClick={() => handleEditBlog(b)}
                                className="p-2 hover:bg-surface-container hover:text-primary-fixed rounded-xl transition-colors text-on-surface-variant cursor-pointer flex items-center gap-1.5 text-xs font-mono"
                                title="Edit Blog"
                              >
                                <Edit3 className="w-4 h-4" /> Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteBlog(b.id)}
                                className="p-2 hover:bg-surface-container hover:text-[#FF3333] rounded-xl transition-colors text-on-surface-variant cursor-pointer flex items-center gap-1.5 text-xs font-mono"
                                title="Delete Blog"
                              >
                                <Trash2 className="w-4 h-4" /> Erase
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: EDUCATION MANAGEMENT */}
              {activeTab === 'educations' && (
                <div className="space-y-8 animate-[fadeIn_0.2s_ease_out]">
                  {/* Education Form */}
                  <div className="p-5 bg-surface-container-low border border-outline-variant/50 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center select-none border-b border-outline-variant/30 pb-2">
                      <span className="font-mono text-xs text-primary-fixed font-bold">
                        {editingEducationId ? `[ EDITING ACADEMIC RECORD: "${educations.find(e => e.id === editingEducationId)?.institution}" ]` : '[ REGISTER NEW ACADEMIC RECORD ]'}
                      </span>
                      {editingEducationId && (
                        <button 
                          onClick={() => {
                            setEditingEducationId(null);
                            setEducationForm({
                              id: '', institution: '', degree: '', period: '', semester: '', description: '', order: 0
                            });
                          }}
                          className="text-[10px] font-mono text-[#FF3333] hover:underline cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Institution */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed block">INSTITUTION (e.g. COMSATS University)</label>
                        <input 
                          type="text" 
                          value={educationForm.institution}
                          onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                          placeholder="Host Institution Name"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      {/* Degree */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed block">DEGREE / ROLE (e.g. BS, Cyber Security)</label>
                        <input 
                          type="text" 
                          value={educationForm.degree}
                          onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                          placeholder="Degrees or Titles"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      {/* Period */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed block">PERIOD (e.g. Jan 2025 - Jan 2029)</label>
                        <input 
                          type="text" 
                          value={educationForm.period}
                          onChange={(e) => setEducationForm({ ...educationForm, period: e.target.value })}
                          placeholder="Date range"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      {/* Semester / Status */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed block">SEMESTER / STATUS (e.g. 3rd Semester Scholar)</label>
                        <input 
                          type="text" 
                          value={educationForm.semester}
                          onChange={(e) => setEducationForm({ ...educationForm, semester: e.target.value })}
                          placeholder="Current academic status"
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      {/* Display Order */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-primary-fixed block">CHRONOLOGICAL ORDER INDEX (1 is highest)</label>
                        <input 
                          type="number" 
                          value={educationForm.order}
                          onChange={(e) => setEducationForm({ ...educationForm, order: parseInt(e.target.value) || 0 })}
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-mono text-primary-fixed block">ACADEMIC DESCRIPTION</label>
                        <textarea 
                          rows={4}
                          value={educationForm.description}
                          onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })}
                          placeholder="Describe key studies, focus, honors..."
                          className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-3 py-2 text-xs font-sans resize-none leading-relaxed text-on-surface"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end p-1 select-none">
                      <button 
                        onClick={handleSaveEducation}
                        className="px-5 py-2.5 bg-primary-fixed hover:bg-white text-black text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> Save Education Record
                      </button>
                    </div>
                  </div>

                  {/* Existing Education Lists */}
                  <div className="space-y-4">
                    <h5 className="font-sans font-bold text-xs text-on-surface-variant uppercase tracking-widest select-none">Existing Academic Records ({educations?.length || 0})</h5>
                    
                    {(!educations || educations.length === 0) ? (
                      <div className="p-8 border border-dashed border-outline-variant/40 rounded-2xl text-center">
                        <BookOpen className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-mono text-on-surface-variant">NO ACADEMIC RECORDS FOUND IN REGISTRY</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {educations.map((e) => (
                          <div 
                            key={e.id} 
                            className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary-fixed/40 transition-colors"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <h6 className="font-sans font-bold text-sm text-on-surface truncate">{e.institution} - {e.degree}</h6>
                              <p className="text-xs text-on-surface-variant line-clamp-1 leading-relaxed">
                                {e.period} • {e.semester}
                              </p>
                            </div>
                            
                            <div className="flex gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 sm:pt-0 pt-2 border-outline-variant/20 select-none">
                              <button 
                                onClick={() => handleEditEducation(e)}
                                className="p-2 hover:bg-surface-container hover:text-primary-fixed rounded-xl transition-colors text-on-surface-variant cursor-pointer flex items-center gap-1.5 text-xs font-mono"
                                title="Edit Record"
                              >
                                <Edit3 className="w-4 h-4" /> Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteEducation(e.id)}
                                className="p-2 hover:bg-surface-container hover:text-[#FF3333] rounded-xl transition-colors text-on-surface-variant cursor-pointer flex items-center gap-1.5 text-xs font-mono"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" /> Erase
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
