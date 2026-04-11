import React from 'react';
import { SectionHeader } from './SectionHeader';
import { DropCapParagraph } from './DropCapParagraph';
import { useReveal } from '../hooks/useReveal';

export function HistorySection({ experience, featureText, companies }) {
  const [ref, revealed] = useReveal();
  if (!experience || experience.length === 0) return null;

  return (
    <section className="jl-section" id="history">
      <div className="jl-container">
        <div
          ref={ref}
          className={`jl-border-detail jl-reveal ${revealed ? 'is-revealed' : ''}`}
        >
          <SectionHeader title="History" aside="A chronicle." />
          <div className="jl-work-grid">
            <div className="jl-work-column">
              <DropCapParagraph text={featureText} className="jl-feature-narrow" />
              <div className="jl-work-list">
                {experience.map((item, idx) => (
                  <article key={`exp-${idx}`} className="jl-work-item">
                    <h6>{item.company}</h6>
                    <p>{item.title}</p>
                    <small>{item.range}</small>
                  </article>
                ))}
              </div>
            </div>
            <aside className="jl-clients">
              <h4>Affiliations</h4>
              <p>
                A cross-section of the institutions, labs, and teams I&rsquo;ve had the pleasure
                of collaborating with.
              </p>
              <div className="jl-client-logos">
                {companies.map((company, idx) => (
                  <div key={`${company}-${idx}`} className="jl-client-chip">
                    {company}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
