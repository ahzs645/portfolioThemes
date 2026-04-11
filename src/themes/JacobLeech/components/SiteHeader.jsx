import React from 'react';

export function SiteHeader({ name, tagline, links }) {
  return (
    <header className="jl-header">
      <div className="jl-container">
        <div className="jl-header-bar">
          <a href="#top" className="jl-header-logo">
            <span className="jl-header-name">{name}</span>
            {tagline ? <span className="jl-header-tagline">{tagline}.</span> : null}
          </a>
          <ul className="jl-header-menu">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="jl-link-detail"
                  {...(link.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
