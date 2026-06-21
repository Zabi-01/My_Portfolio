import { motion } from 'motion/react';
import { Github, ExternalLink, Terminal } from 'lucide-react';
import { Project } from '../types';

interface ProjectsPanelProps {
  projects: Project[];
}

export default function ProjectsPanel({ projects }: ProjectsPanelProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 w-full mb-12">
      {projects.map((project, idx) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className="group relative bg-[#0A0A0A]/80 backdrop-blur-sm border border-outline-variant rounded-xl overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(var(--color-primary-fixed),0.2)] hover:border-primary-fixed/50 transition-all duration-300 flex flex-col"
        >
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-fixed-dim/50 to-transparent group-hover:via-primary-fixed transition-colors duration-300" />
          
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-surface-container-highest border border-outline-variant/50 text-secondary">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="flex space-x-2">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-on-surface-variant hover:text-primary-fixed transition-colors pointer-events-auto">
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-on-surface-variant hover:text-secondary transition-colors pointer-events-auto">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-on-surface mb-3 group-hover:text-primary-fixed transition-colors font-sans tracking-tight">
              {project.title}
            </h3>
            
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 flex-1">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-outline-variant/30">
              {(project.techStack || []).map(tech => (
                <span 
                  key={tech} 
                  className="px-2.5 py-1 text-xs font-mono rounded bg-surface-container-highest text-secondary border border-outline-variant/30"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
