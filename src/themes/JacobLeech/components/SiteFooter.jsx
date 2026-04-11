import React from 'react';

export function SiteFooter({ initials, links, year }) {
  return (
    <footer className="jl-footer">
      <div className="jl-container">
        <div className="jl-footer-bar">
          <a className="jl-footer-logo" href="#top" aria-label="Back to top">
            <span>{initials[0]}</span>
            <span>{initials[1]}</span>
          </a>
          <ul className="jl-footer-menu">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  className="jl-link-detail"
                  href={link.href}
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
        <p className="jl-footer-fine">
          <span className="jl-detail">Hand-set in Bluu Titling & Cormorant Garamond.</span>
          {year ? <span> &copy; {year}.</span> : null}
        </p>
      </div>
    </footer>
  );
}
