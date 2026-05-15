import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCV } from '../../contexts/ConfigContext';
import { withBase } from '../../utils/assetPath';
import { canUseWebGL, usePrefersReducedMotion } from '../../utils/rendering';
import './comp.css';

const SVG = {
  blackMarker: withBase('comp/assets/svg/black-marker.svg'),
  redMarker: withBase('comp/assets/svg/red-marker.svg'),
  greenMarker: withBase('comp/assets/svg/green-marker.svg'),
  blueMarker: withBase('comp/assets/svg/blue-marker.svg'),
  eraser: withBase('comp/assets/svg/eraser.svg'),
};

function detectMobile() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isMobileUA = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isMobileHint = navigator.userAgentData?.mobile;
  return Boolean(isMobileUA || isMobileHint || window.innerWidth <= 768);
}

function MobileFallback({ cv, reason = 'The interactive 3D scene is desktop-only.' }) {
  const projects = (cv?.projects || []).slice(0, 8);
  const experience = (cv?.experience || []).slice(0, 6);
  return (
    <div className="comp-mobile-fallback">
      <h1>{cv?.name}</h1>
      <p>{cv?.currentJobTitle}{cv?.location ? ` · ${cv.location}` : ''}</p>
      <p style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>
        {reason} Below is the same content as a list.
      </p>
      <h2>Experience</h2>
      <ul>
        {experience.map((e, i) => (
          <li key={i}>
            <strong>{e.position || e.title}</strong> — {e.company}
          </li>
        ))}
      </ul>
      <h2>Projects</h2>
      <ul>
        {projects.map((p, i) => (
          <li key={i}>
            {p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.name}</a> : p.name}
            {p.summary ? ` — ${p.summary}` : ''}
          </li>
        ))}
      </ul>
      <h2>Contact</h2>
      <ul>
        {cv?.email && <li><a href={`mailto:${cv.email}`}>{cv.email}</a></li>}
        {cv?.socialLinks?.linkedin && <li><a href={cv.socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>}
        {cv?.socialLinks?.github && <li><a href={cv.socialLinks.github} target="_blank" rel="noreferrer">GitHub</a></li>}
      </ul>
    </div>
  );
}

export function CompTheme() {
  const cv = useCV();
  const rootRef = useRef(null);
  const webglRef = useRef(null);
  const cssArcadeRef = useRef(null);
  const cssLeftRef = useRef(null);
  const cssRightRef = useRef(null);
  const [isMobile] = useState(detectMobile);
  const [webglAvailable] = useState(() => canUseWebGL());
  const reducedMotion = usePrefersReducedMotion();
  const useFallback = isMobile || !webglAvailable || reducedMotion;

  const socialUrls = useMemo(
    () => ({
      linkedin: cv?.socialLinks?.linkedin || null,
      github: cv?.socialLinks?.github || null,
      itchio: cv?.website || cv?.socialLinks?.website || null,
    }),
    [cv]
  );

  useEffect(() => {
    if (useFallback || !cv) return undefined;
    let experience;
    let cancelled = false;

    (async () => {
      const { default: Experience } = await import('./engine/Experience.js');
      if (cancelled) return;
      experience = new Experience({
        rootElement: rootRef.current,
        webglElement: webglRef.current,
        cssArcadeMachine: cssArcadeRef.current,
        cssLeftMonitor: cssLeftRef.current,
        cssRightMonitor: cssRightRef.current,
        cv,
        socialUrls,
        leftMonitorUrl: 'https://xp.ahmadjalil.com/',
        rightMonitorUrl: 'https://xp.ahmadjalil.com/',
      });
    })();

    return () => {
      cancelled = true;
      if (experience?.dispose) experience.dispose();
    };
  }, [cv, useFallback, socialUrls]);

  if (!cv) return null;

  if (useFallback) {
    const reason = reducedMotion
      ? 'The interactive 3D scene is disabled while reduced motion is enabled.'
      : webglAvailable
        ? 'The interactive 3D scene is desktop-only.'
        : 'WebGL is unavailable in this browser.';
    return (
      <div className="comp-root" ref={rootRef}>
        <MobileFallback cv={cv} reason={reason} />
      </div>
    );
  }

  return (
    <div className="comp-root" ref={rootRef}>
      <div className="loadingScreen">
        {(cv.name || '').split(' ').map((part, i) => (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {part.toUpperCase()}
          </React.Fragment>
        ))}
      </div>
      <div className="banner">
        <span className="banner-link" id="leftMonitor">ABOUT ME</span>
        <span className="banner-link" id="rightMonitor">PROJECTS</span>
        <span className="banner-link" id="arcadeMachine">EXPERIENCE</span>
        <span className="banner-link" id="whiteboard">WHITEBOARD</span>
        <span className="banner-link" id="rubikGroup">RUBIK&apos;S CUBE</span>
      </div>
      <div className="audio-button" />
      <a className="circular-button" id="back-button" />
      <div className="button-row" id="whiteboard-buttons">
        <a
          className="circular-button-whiteboard whiteboard-selected"
          id="black-marker"
          style={{ backgroundImage: `url(${SVG.blackMarker})` }}
        />
        <a
          className="circular-button-whiteboard"
          id="red-marker"
          style={{ backgroundImage: `url(${SVG.redMarker})` }}
        />
        <a
          className="circular-button-whiteboard"
          id="green-marker"
          style={{ backgroundImage: `url(${SVG.greenMarker})` }}
        />
        <a
          className="circular-button-whiteboard"
          id="blue-marker"
          style={{ backgroundImage: `url(${SVG.blueMarker})` }}
        />
        <a
          className="circular-button-whiteboard"
          id="eraser"
          style={{ backgroundImage: `url(${SVG.eraser})` }}
        />
      </div>
      <div className="rubik-message">
        Click and drag anywhere on the cube to rotate it in that direction.
      </div>
      <div id="cssArcadeMachine" ref={cssArcadeRef} />
      <div id="cssLeftMonitor" ref={cssLeftRef} />
      <div id="cssRightMonitor" ref={cssRightRef} />
      <div id="webgl" ref={webglRef} />
      <canvas id="drawing-canvas" width={2048} height={1024} />
    </div>
  );
}

export default CompTheme;
