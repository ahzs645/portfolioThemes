import React from 'react';
import { SectionHeader } from './SectionHeader';
import { DropCapParagraph } from './DropCapParagraph';
import { useReveal } from '../hooks/useReveal';

function getDomainLabel(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function ProjectCard({ project, index }) {
  const [ref, revealed] = useReveal();
  const title = project.name || project.title || 'Project';
  const summary = project.summary || project.description || '';
  const date = project.date || project.endDate || project.startDate || '';
  const domain = getDomainLabel(project.url);
  return (
    <article
      ref={ref}
      className={`jl-project-card jl-reveal ${revealed ? 'is-revealed' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <span className="jl-project-ordinal">{String(index + 1).padStart(2, '0')}</span>
      <h3>{title}</h3>
      {date ? <span className="jl-project-date">{date}</span> : null}
      {summary ? <p>{summary}</p> : null}
      {project.url ? (
        <a
          className="jl-project-link jl-link-detail"
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {domain ? `Visit ${domain}` : 'Visit site'}
        </a>
      ) : null}
    </article>
  );
}

export function ProjectsSection({ projects, featureText }) {
  const [ref, revealed] = useReveal();
  if (!projects || projects.length === 0) return null;

  return (
    <section className="jl-section jl-section-right">
      <div className="jl-container">
        <div
          ref={ref}
          className={`jl-border-detail jl-border-detail-right jl-reveal ${revealed ? 'is-revealed' : ''}`}
        >
          <SectionHeader title="Projects" aside="Assorted." align="right" />
          <div className="jl-projects-intro">
            <DropCapParagraph text={featureText} />
          </div>
          <div className="jl-projects-grid">
            {projects.map((project, idx) => (
              <ProjectCard key={`proj-${idx}`} project={project} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
