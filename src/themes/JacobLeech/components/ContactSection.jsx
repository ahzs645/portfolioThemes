import React from 'react';
import { SectionHeader } from './SectionHeader';
import { useReveal } from '../hooks/useReveal';

export function ContactSection({ email, location, website, socialLinks }) {
  const [ref, revealed] = useReveal();
  const items = [
    email ? { label: 'Email', value: email, href: `mailto:${email}` } : null,
    location ? { label: 'Based', value: location } : null,
    website
      ? { label: 'Web', value: website.replace(/^https?:\/\//, ''), href: website, external: true }
      : null,
    socialLinks?.linkedin
      ? {
          label: 'LinkedIn',
          value: 'linkedin.com',
          href: socialLinks.linkedin,
          external: true,
        }
      : null,
    socialLinks?.github
      ? {
          label: 'GitHub',
          value: 'github.com',
          href: socialLinks.github,
          external: true,
        }
      : null,
  ].filter(Boolean);

  return (
    <section className="jl-section jl-section-right" id="contact">
      <div className="jl-container">
        <div
          ref={ref}
          className={`jl-border-detail jl-border-detail-right jl-reveal ${revealed ? 'is-revealed' : ''}`}
        >
          <SectionHeader title="Contact" aside="Say hello." align="right" />
          <div className="jl-contact-card">
            <h5>Drop a line</h5>
            <p className="jl-contact-copy">
              Always happy to talk about air quality science, environmental health, research
              collaborations, or a good data story. The easiest way to reach me is by email.
            </p>
            <dl className="jl-contact-list">
              {items.map((item) => (
                <div key={item.label} className="jl-contact-row">
                  <dt>{item.label}</dt>
                  <dd>
                    {item.href ? (
                      <a
                        className="jl-link-detail"
                        href={item.href}
                        {...(item.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
