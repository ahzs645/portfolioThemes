import React from 'react';
import { SectionHeader } from './SectionHeader';
import { DropCapParagraph } from './DropCapParagraph';
import { useReveal } from '../hooks/useReveal';

export function EducationSection({ education, awards, featureText }) {
  const [ref, revealed] = useReveal();
  if (!education || education.length === 0) return null;

  return (
    <section className="jl-section">
      <div className="jl-container">
        <div
          ref={ref}
          className={`jl-border-detail jl-reveal ${revealed ? 'is-revealed' : ''}`}
        >
          <SectionHeader title="Education" aside="Background." />
          <div className="jl-edu-grid">
            <div className="jl-edu-intro">
              <DropCapParagraph text={featureText} className="jl-feature-narrow" />
            </div>
            <div className="jl-edu-list">
              {education.map((edu, idx) => (
                <div key={`edu-${idx}`} className="jl-edu-item">
                  <h6>{edu.institution || edu.school || 'School'}</h6>
                  <p>
                    {[edu.degree, edu.area].filter(Boolean).join(' — ')}
                  </p>
                  <small>{edu.range}</small>
                </div>
              ))}
            </div>
            {awards && awards.length > 0 ? (
              <aside className="jl-awards">
                <h4>Honours &amp; awards</h4>
                <ul className="jl-awards-list">
                  {awards.map((award, idx) => (
                    <li key={`award-${idx}`}>
                      <span className="jl-award-name">{award.name}</span>
                      {award.summary ? (
                        <span className="jl-award-meta"> — {award.summary}</span>
                      ) : null}
                      {award.date ? (
                        <small className="jl-award-date"> ({award.date})</small>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
