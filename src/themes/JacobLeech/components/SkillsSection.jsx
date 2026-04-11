import React from 'react';
import { SectionHeader } from './SectionHeader';
import { DropCapParagraph } from './DropCapParagraph';
import { GraphicFrame } from './GraphicFrame';
import { useReveal } from '../hooks/useReveal';

export function SkillsSection({ groups, featureText, secondaryText }) {
  const [ref, revealed] = useReveal();
  if (!groups || groups.length === 0) return null;

  return (
    <section className="jl-section jl-section-right">
      <div className="jl-container">
        <div
          ref={ref}
          className={`jl-border-detail jl-border-detail-right jl-reveal ${revealed ? 'is-revealed' : ''}`}
        >
          <SectionHeader title="Skills" aside="Fig 2." align="right" />
          <div className="jl-cols jl-cols-skills">
            <div className="jl-prose jl-prose-offset">
              <DropCapParagraph text={featureText} />
              {secondaryText ? <p>{secondaryText}</p> : null}
              <div className="jl-skill-groups">
                {groups.map((group) => (
                  <div key={group.label} className="jl-skill-group">
                    <h6>{group.label}</h6>
                    <ul className="jl-skill-chips">
                      {group.items.map((item) => (
                        <li key={item} className="jl-skill-chip">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="jl-skills-aside">
              <GraphicFrame caption="Fig 3." minHeight="9rem" className="jl-graphic-small">
                <span className="jl-glyph">&#x2767;</span>
              </GraphicFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
