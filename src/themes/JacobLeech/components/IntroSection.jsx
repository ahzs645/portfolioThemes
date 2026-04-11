import React from 'react';
import { GraphicFrame } from './GraphicFrame';
import { DropCapParagraph } from './DropCapParagraph';
import { useReveal } from '../hooks/useReveal';

export function IntroSection({ initials, externalLinks, featureText, extraParagraphs }) {
  const [ref, revealed] = useReveal();
  return (
    <section className="jl-section jl-intro" id="top">
      <div className="jl-container">
        <div
          ref={ref}
          className={`jl-intro-grid jl-reveal ${revealed ? 'is-revealed' : ''}`}
        >
          <div className="jl-intro-content">
            <DropCapParagraph text={featureText} suffix={<small>(Fig 1.)</small>} />
            {extraParagraphs.map((para, idx) => (
              <p key={idx} className="jl-prose-line">{para}</p>
            ))}
          </div>

          <aside className="jl-intro-aside">
            {externalLinks.length > 0 ? (
              <div className="jl-external">
                <p className="jl-external-title">External</p>
                <ul>
                  {externalLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        className="jl-link-detail"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <GraphicFrame caption="Fig 1." minHeight="13rem">
              <div className="jl-initials jl-initials-big">
                <span>{initials[0]}</span>
                <span>{initials[1]}</span>
              </div>
            </GraphicFrame>
          </aside>
        </div>
      </div>
    </section>
  );
}
