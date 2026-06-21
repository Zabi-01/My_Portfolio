export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  status: string;
  colorType: 'cyan' | 'lime' | 'red' | 'gray' | 'neutral';
  date: string;
  verificationCode: string;
  topics: string[];
  description: string;
  category: 'Offensive' | 'Defensive' | 'General';
  imageUrl?: string;
  verificationUrl?: string;
}

export interface ProfileInfo {
  name: string;
  title: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  twitter?: string;
  bio: string;
  redTeamBio?: string;
  blueTeamBio?: string;
  purpleTeamBio?: string;
  profilePic?: string;
}

export interface Skill {
  name: string;
  category: 'Offensive' | 'Defensive' | 'Core';
  level: number; // proficiency out of 100
  iconName: 'Code' | 'GitFork' | 'Database' | 'Terminal' | 'Network' | 'Shield' | 'Cpu' | 'Search';
  description: string;
  externalUrl?: string;
}

export interface TerminalCommand {
  command: string;
  output: string;
  type?: 'input' | 'output' | 'error' | 'success' | 'system';
}

export interface ProjectScenario {
  id: string;
  name: string;
  category: 'Red Team' | 'Blue Team';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  steps: string[];
  completionFlag: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  order?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  author: string;
  category: string;
  imageUrl?: string;
  readTime?: string;
  tags?: string[];
}
