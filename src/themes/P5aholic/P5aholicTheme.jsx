import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import * as THREE from 'three';
import gsap from 'gsap';

// Original vertex shader (for RawShaderMaterial)
const vertexShader = `
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Original fragment shader exactly as source
const fragmentShader = `
precision highp float;

uniform sampler2D grainTex;
uniform sampler2D blurTex;
uniform float time;
uniform float seed;
uniform vec3 back;
uniform float style;
uniform float param1;
uniform float param2;
uniform float param3;

varying vec2 vUv;

#define PI 3.141592653589793

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 10.0) * x);
}
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float snoise01(vec2 v) {
  return (1.0 + snoise(v)) * 0.5;
}

float noise2d(vec2 st) {
  return snoise01(vec2(st.x + time * 0.02, st.y - time * 0.04 + seed));
}

float pattern(vec2 p) {
  vec2 q = vec2(noise2d(p + vec2(0.0, 0.0)), noise2d(p + vec2(5.2, 1.3)));
  vec2 r = vec2(noise2d(p + 4.0 * q + vec2(1.7, 9.2)), noise2d(p + 4.0 * q + vec2(8.3, 2.8)));
  return noise2d(p + 1.0 * r);
}

void main() {
  vec2 uv = vUv;
  vec2 p = gl_FragCoord.xy;

  uv = style > 0.0 ? ceil(uv * 50.0) / 50.0 : uv;

  // texture
  vec3 grainColor = texture2D(grainTex, mod(p * param1 * 5.0, 1024.0) / 1024.0).rgb;
  float blurAlpha = texture2D(blurTex, uv).a;

  float gr = pow(grainColor.r * 1.0, 1.5) + 0.5 * (1.0 - blurAlpha);
  float gg = grainColor.g;

  float ax = param2 * gr * cos(gg * 2.0 * PI);
  float ay = param2 * gr * sin(gg * 2.0 * PI);

  // noise
  float ndx = 1.0 * 1.0 * param3 + 0.1 * (1.0 - blurAlpha);
  float ndy = 2.0 * 1.0 * param3 + 0.1 * (1.0 - blurAlpha);
  float nx = uv.x * ndx + ax;
  float ny = uv.y * ndy + ay;
  float n = pattern(vec2(nx, ny));
  n = pow(n * 1.05, 6.0);
  n = smoothstep(0.0, 1.0, n);

  vec3 front = vec3(0.5);
  vec3 result = mix(back, front, n);

  gl_FragColor = vec4(result, blurAlpha);
}
`;

// WebGL Canvas Component - matching original implementation
function BackgroundCanvas({ darkMode, isMonospace }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    material: null,
    mesh: null,
    animationId: null,
    backColor: new THREE.Color(darkMode ? 0.05 : 0.9, darkMode ? 0.05 : 0.9, darkMode ? 0.05 : 0.9),
    config: {
      width: 100,
      height: 100,
      dpr: 1,
      aspectRatio: 1,
      sceneWidth: 2,
      sceneHeight: 2
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const state = stateRef.current;

    // Get dimensions
    const rect = container.getBoundingClientRect();
    state.config.width = rect.width;
    state.config.height = rect.height;
    state.config.dpr = Math.min(window.devicePixelRatio, 1.5);
    state.config.aspectRatio = state.config.width / state.config.height;

    // Create canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    canvasRef.current = canvas;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true
    });
    renderer.setSize(state.config.width, state.config.height);
    renderer.setPixelRatio(state.config.dpr);
    state.renderer = renderer;

    // Setup scene
    const scene = new THREE.Scene();
    state.scene = scene;

    // Setup camera (orthographic like original)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10000);
    camera.position.set(0, 0, 10);
    state.camera = camera;

    // Resize scene based on aspect ratio (like original)
    const resizeScene = () => {
      if (state.config.width >= state.config.height) {
        state.camera.left = -1;
        state.camera.right = 1;
        state.camera.top = 1 / state.config.aspectRatio;
        state.camera.bottom = -1 / state.config.aspectRatio;
        state.config.sceneWidth = 2;
        state.config.sceneHeight = 2 / state.config.aspectRatio;
      } else {
        state.camera.left = -1 * state.config.aspectRatio;
        state.camera.right = 1 * state.config.aspectRatio;
        state.camera.top = 1;
        state.camera.bottom = -1;
        state.config.sceneWidth = 2 * state.config.aspectRatio;
        state.config.sceneHeight = 2;
      }
      state.camera.updateProjectionMatrix();
    };
    resizeScene();

    // Load textures
    const loader = new THREE.TextureLoader();
    Promise.all([
      loader.loadAsync('/grain.webp'),
      loader.loadAsync('/blur.webp')
    ]).then(([grainTex, blurTex]) => {
      // Set texture parameters exactly like original
      grainTex.minFilter = THREE.NearestFilter;
      grainTex.magFilter = THREE.NearestFilter;
      grainTex.generateMipmaps = false;

      blurTex.minFilter = THREE.NearestFilter;
      blurTex.magFilter = THREE.NearestFilter;
      blurTex.generateMipmaps = false;

      // Create material using RawShaderMaterial like original
      const material = new THREE.RawShaderMaterial({
        uniforms: {
          grainTex: { value: grainTex },
          blurTex: { value: blurTex },
          time: { value: 0.0 },
          seed: { value: Math.random() * 100.0 },
          back: { value: new THREE.Vector3(state.backColor.r, state.backColor.g, state.backColor.b) },
          style: { value: 0 },
          param1: { value: 1.0 },
          param2: { value: 0.05 },
          param3: { value: 0.2 }
        },
        vertexShader,
        fragmentShader,
        transparent: true
      });
      state.material = material;

      // Create mesh (3x3 plane positioned like original)
      const geometry = new THREE.PlaneGeometry(3, 3);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = -0.8;
      mesh.position.y = -0.5;
      mesh.position.z = 1;
      state.mesh = mesh;
      scene.add(mesh);

      // Start animation loop
      const startTime = Date.now();
      const animate = () => {
        const time = (Date.now() - startTime) / 1000;

        // Update uniforms
        state.material.uniforms.time.value = time;
        state.material.uniforms.back.value.x = state.backColor.r;
        state.material.uniforms.back.value.y = state.backColor.g;
        state.material.uniforms.back.value.z = state.backColor.b;

        state.renderer.render(state.scene, state.camera);
        state.animationId = requestAnimationFrame(animate);
      };
      animate();
    }).catch(err => {
      console.error('Failed to load textures:', err);
    });

    // Handle resize
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      state.config.width = rect.width;
      state.config.height = rect.height;
      state.config.aspectRatio = state.config.width / state.config.height;

      state.renderer.setSize(state.config.width, state.config.height);
      resizeScene();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(state.animationId);
      window.removeEventListener('resize', handleResize);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      if (state.renderer) state.renderer.dispose();
    };
  }, []);

  // Update theme (dark/light)
  useEffect(() => {
    const state = stateRef.current;
    const targetColor = darkMode ? 0.05 : 0.9;
    gsap.to(state.backColor, {
      r: targetColor,
      g: targetColor,
      b: targetColor,
      duration: 1.6
    });
  }, [darkMode]);

  // Update style (mono/sans)
  useEffect(() => {
    const state = stateRef.current;
    if (state.material) {
      state.material.uniforms.style.value = isMonospace ? 1 : 0;
    }
  }, [isMonospace]);

  return <CanvasContainer ref={containerRef} />;
}

export function P5aholicTheme({ darkMode }) {
  const cv = useCV();
  const [activePage, setActivePage] = useState('home');
  const [isMonospace, setIsMonospace] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef(null);

  const handlePageChange = useCallback((pageId) => {
    if (pageId === activePage || isTransitioning) return;

    setIsTransitioning(true);

    gsap.to(contentRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setActivePage(pageId);
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: -20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => setIsTransitioning(false)
          }
        );
      }
    });
  }, [activePage, isTransitioning]);

  if (!cv) return null;

  const {
    name,
    email,
    location,
    about,
    currentJobTitle,
    socialLinks,
    projects,
    experience,
    education,
    skills,
    publications,
    presentations,
    certifications,
    languages,
    volunteer,
    professionalDevelopment,
    sectionsRaw,
  } = cv;

  const awards = (sectionsRaw?.awards || []).filter(e => !Array.isArray(e?.tags) || !e.tags.includes('archived'));
  const activeProjects = projects?.slice(0, 12) || [];
  const recentExperience = experience?.slice(0, 4) || [];
  const recentEducation = education?.slice(0, 3) || [];
  const recentPublications = publications?.slice(0, 3) || [];
  const recentPresentations = presentations?.slice(0, 3) || [];
  const recentCertifications = certifications?.slice(0, 3) || [];
  const recentVolunteer = volunteer?.slice(0, 3) || [];
  const recentProfDev = professionalDevelopment?.slice(0, 3) || [];

  const pages = [
    { id: 'home', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'info', label: 'Info' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <PageWrapper $darkMode={darkMode} $isMonospace={isMonospace}>
      {/* WebGL Background */}
      <BackgroundWrapper>
        <BackgroundCanvas darkMode={darkMode} isMonospace={isMonospace} />
      </BackgroundWrapper>

      {/* Masks for top/bottom fade */}
      <Mask>
        <MaskTop $darkMode={darkMode} />
        <MaskBottom $darkMode={darkMode} />
      </Mask>

      {/* Frame Border */}
      <Frame>
        <FrameLine $position="left" />
        <FrameLine $position="right" />
        <FrameLine $position="top" />
        <FrameLine $position="bottom" />
      </Frame>

      {/* Theme Toggle */}
      <ThemeToggle>
        <ToggleGroup onClick={() => setIsMonospace(!isMonospace)}>
          <ToggleBtn $selected={!isMonospace}>
            <Box>{!isMonospace ? '■' : '□'}</Box>
            <span>Sans</span>
          </ToggleBtn>
          <ToggleBtn $selected={isMonospace}>
            <Box>{isMonospace ? '■' : '□'}</Box>
            <span>Mono</span>
          </ToggleBtn>
        </ToggleGroup>
      </ThemeToggle>

      {/* Header */}
      <SiteHeader>
        <SiteTitle $isMonospace={isMonospace}>
          {name || 'Your Name'}
        </SiteTitle>
        <SiteLabel>
          {currentJobTitle || 'Designer & Developer'}
        </SiteLabel>
        <Navigation>
          {pages.map((page) => (
            <NavItem
              key={page.id}
              $active={activePage === page.id}
              onClick={() => handlePageChange(page.id)}
            >
              <NavDot $active={activePage === page.id}>●</NavDot>
              <NavText $active={activePage === page.id}>
                {page.label}
              </NavText>
            </NavItem>
          ))}
        </Navigation>
      </SiteHeader>

      {/* Copyright */}
      <Copyright>
        <p>&copy; {name || 'Your Name'}</p>
      </Copyright>

      {/* Content */}
      <Content>
        <ContentInner ref={contentRef}>
          {/* Home Page */}
          {activePage === 'home' && (
            <Page>
              <HomeContent>
                <AboutText>
                  {about ? (
                    about.split(/[.,]/).filter(Boolean).slice(0, 6).map((line, i) => (
                      <span key={i}>{line.trim()}.</span>
                    ))
                  ) : (
                    <>
                      <span>Based in {location || 'Earth'}.</span>
                      <span>Building digital experiences</span>
                      <span>with code and creativity.</span>
                    </>
                  )}
                </AboutText>
              </HomeContent>
            </Page>
          )}

          {/* Projects Page */}
          {activePage === 'projects' && (
            <Page>
              <ProjectsContent $isMonospace={isMonospace}>
                <ProjectList>
                  {activeProjects.map((project, idx) => (
                    <ProjectItem key={idx}>
                      {project.url ? (
                        <ProjectLink href={project.url} target="_blank" rel="noreferrer">
                          <ProjectTitle $isMonospace={isMonospace}>
                            {project.name}
                          </ProjectTitle>
                        </ProjectLink>
                      ) : (
                        <ProjectTitle $isMonospace={isMonospace}>
                          {project.name}
                        </ProjectTitle>
                      )}
                      <ProjectInfo>
                        {project.startDate && `${project.startDate}`}
                        {project.summary && ` / ${project.summary.slice(0, 50)}${project.summary.length > 50 ? '...' : ''}`}
                      </ProjectInfo>
                    </ProjectItem>
                  ))}
                </ProjectList>
              </ProjectsContent>
            </Page>
          )}

          {/* Info Page */}
          {activePage === 'info' && (
            <Page>
              <InfoContent>
                {/* Social Links */}
                <InfoItem>
                  <InfoSectionLabel>Links</InfoSectionLabel>
                  <InfoList>
                    {socialLinks.twitter && (
                      <li>
                        <InfoLink href={socialLinks.twitter} target="_blank" rel="noreferrer">
                          Twitter/X ↗
                        </InfoLink>
                      </li>
                    )}
                    {socialLinks.linkedin && (
                      <li>
                        <InfoLink href={socialLinks.linkedin} target="_blank" rel="noreferrer">
                          LinkedIn ↗
                        </InfoLink>
                      </li>
                    )}
                    {socialLinks.github && (
                      <li>
                        <InfoLink href={socialLinks.github} target="_blank" rel="noreferrer">
                          GitHub ↗
                        </InfoLink>
                      </li>
                    )}
                  </InfoList>
                </InfoItem>

                {/* Experience */}
                {recentExperience.length > 0 && (
                  <InfoItem>
                    <InfoSectionLabel>Experience</InfoSectionLabel>
                    <InfoList>
                      {recentExperience.slice(0, 3).map((exp, idx) => (
                        <li key={idx}>
                          {exp.title}
                          <span className="light"> — {exp.company}</span>
                        </li>
                      ))}
                    </InfoList>
                  </InfoItem>
                )}

                {/* Awards */}
                {awards.length > 0 && (
                  <InfoItem>
                    <InfoSectionLabel>Awards</InfoSectionLabel>
                    <InfoList>
                      {awards.slice(0, 3).map((award, idx) => (
                        <li key={idx}>{award.name}</li>
                      ))}
                    </InfoList>
                  </InfoItem>
                )}

                {/* Education */}
                {recentEducation.length > 0 && (
                  <InfoItem>
                    <InfoSectionLabel>Education</InfoSectionLabel>
                    <InfoList>
                      {recentEducation.map((edu, idx) => (
                        <li key={idx}>
                          {edu.degree}{edu.field ? `, ${edu.field}` : ''}
                          <span className="light"> — {edu.institution}</span>
                        </li>
                      ))}
                    </InfoList>
                  </InfoItem>
                )}

                {/* Publications */}
                {recentPublications.length > 0 && (
                  <InfoItem>
                    <InfoSectionLabel>Publications</InfoSectionLabel>
                    <InfoList>
                      {recentPublications.map((pub, idx) => (
                        <li key={idx}>{pub.title}</li>
                      ))}
                    </InfoList>
                  </InfoItem>
                )}

                {/* Presentations */}
                {recentPresentations.length > 0 && (
                  <InfoItem>
                    <InfoSectionLabel>Presentations</InfoSectionLabel>
                    <InfoList>
                      {recentPresentations.map((pres, idx) => (
                        <li key={idx}>
                          {pres.name}
                          {pres.summary && <span className="light"> — {pres.summary}</span>}
                        </li>
                      ))}
                    </InfoList>
                  </InfoItem>
                )}

                {/* Certifications */}
                {recentCertifications.length > 0 && (
                  <InfoItem>
                    <InfoSectionLabel>Certifications</InfoSectionLabel>
                    <InfoList>
                      {recentCertifications.map((cert, idx) => (
                        <li key={idx}>
                          {cert.name}
                          {cert.issuer && <span className="light"> — {cert.issuer}</span>}
                        </li>
                      ))}
                    </InfoList>
                  </InfoItem>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                  <InfoItem>
                    <InfoSectionLabel>Skills</InfoSectionLabel>
                    <InfoList>
                      {skills.slice(0, 4).map((skillGroup, idx) => (
                        <li key={idx}>
                          {Array.isArray(skillGroup.items) ? skillGroup.items.slice(0, 5).join(', ') : skillGroup.name}
                          {skillGroup.category && <span className="light"> — {skillGroup.category}</span>}
                        </li>
                      ))}
                    </InfoList>
                  </InfoItem>
                )}

                {/* Languages */}
                {languages && languages.length > 0 && (
                  <InfoItem>
                    <InfoSectionLabel>Languages</InfoSectionLabel>
                    <InfoList>
                      {languages.map((lang, idx) => (
                        <li key={idx}>
                          {lang.name}
                          {lang.proficiency && <span className="light"> — {lang.proficiency}</span>}
                        </li>
                      ))}
                    </InfoList>
                  </InfoItem>
                )}

                {/* Volunteer */}
                {recentVolunteer.length > 0 && (
                  <InfoItem>
                    <InfoSectionLabel>Volunteer</InfoSectionLabel>
                    <InfoList>
                      {recentVolunteer.map((vol, idx) => (
                        <li key={idx}>
                          {vol.title}
                          <span className="light"> — {vol.company}</span>
                        </li>
                      ))}
                    </InfoList>
                  </InfoItem>
                )}

                {/* Professional Development */}
                {recentProfDev.length > 0 && (
                  <InfoItem>
                    <InfoSectionLabel>Professional Development</InfoSectionLabel>
                    <InfoList>
                      {recentProfDev.map((dev, idx) => (
                        <li key={idx}>
                          {dev.name || dev.title}
                          {dev.summary && <span className="light"> — {dev.summary}</span>}
                        </li>
                      ))}
                    </InfoList>
                  </InfoItem>
                )}
              </InfoContent>
            </Page>
          )}

          {/* Contact Page */}
          {activePage === 'contact' && (
            <Page>
              <ContactContent>
                {email && (
                  <ContactLink href={`mailto:${email}`}>
                    {email} ↗
                  </ContactLink>
                )}
                {socialLinks.linkedin && (
                  <ContactLink href={socialLinks.linkedin} target="_blank" rel="noreferrer">
                    Connect on LinkedIn ↗
                  </ContactLink>
                )}
              </ContactContent>
            </Page>
          )}
        </ContentInner>
      </Content>
    </PageWrapper>
  );
}

// Styled Components
const PageWrapper = styled.div`
  --pad: max(20px, 4vmin);
  --c-bg: ${({ $darkMode }) => ($darkMode ? 'hsl(0, 0%, 5%)' : 'hsl(0, 0%, 90%)')};
  --c-text: ${({ $darkMode }) => ($darkMode ? 'hsl(0, 0%, 95%)' : 'hsl(0, 0%, 10%)')};

  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: var(--c-bg);
  color: var(--c-text);
  font-family: ${({ $isMonospace }) => $isMonospace
    ? "'SF Mono', 'Fira Code', 'Monaco', monospace"
    : "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"};
  font-weight: 600;
  font-size: 12px;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.9s cubic-bezier(0.1, 0.4, 0.2, 1);

  @media (max-width: 768px) {
    overflow: hidden;
  }
`;

const BackgroundWrapper = styled.div`
  position: absolute;
  z-index: 1;
  left: var(--pad);
  right: var(--pad);
  top: var(--pad);
  bottom: var(--pad);
  pointer-events: none;
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;

  canvas {
    display: block;
  }
`;

const Mask = styled.div`
  position: absolute;
  z-index: 3;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
`;

const MaskTop = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: var(--pad);
  background-color: var(--c-bg);
  opacity: 0.9;
  transition: background-color 0.9s cubic-bezier(0.1, 0.4, 0.2, 1);
`;

const MaskBottom = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: var(--pad);
  background-color: var(--c-bg);
  opacity: 0.9;
  transition: background-color 0.9s cubic-bezier(0.1, 0.4, 0.2, 1);
`;

const Frame = styled.div`
  position: absolute;
  z-index: 10;
  left: var(--pad);
  right: var(--pad);
  top: var(--pad);
  bottom: var(--pad);
  mix-blend-mode: difference;
  pointer-events: none;
`;

const FrameLine = styled.div`
  position: absolute;
  background-color: #fff;
  opacity: 0.5;

  ${({ $position }) => {
    switch ($position) {
      case 'left':
        return css`left: 0; top: 0; width: 1px; height: 100%;`;
      case 'right':
        return css`right: 0; top: 0; width: 1px; height: 100%;`;
      case 'top':
        return css`left: 0; top: 0; width: 100%; height: 1px;`;
      case 'bottom':
        return css`left: 0; bottom: 0; width: 100%; height: 1px;`;
      default:
        return '';
    }
  }}
`;

const ThemeToggle = styled.div`
  position: absolute;
  z-index: 10;
  left: calc(var(--pad) - 0.15em);
  bottom: var(--pad);
  transform-origin: left bottom;
  transform: rotate(-90deg);
  white-space: nowrap;
  mix-blend-mode: difference;
  display: flex;
  column-gap: 15px;
  cursor: pointer;
`;

const ToggleGroup = styled.div`
  display: flex;
  column-gap: 15px;
`;

const ToggleBtn = styled.div`
  display: flex;
  column-gap: 3px;
  font-weight: 400;
  text-transform: uppercase;
  color: #fff;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.5;
  }
`;

const Box = styled.span`
  font-size: 10px;
`;

const SiteHeader = styled.header`
  position: absolute;
  z-index: 10;
  left: calc(var(--pad) * 2);
  top: calc(var(--pad) * 2);
  mix-blend-mode: difference;

  @media (max-width: 768px) {
    left: calc(var(--pad) * 1.5);
    top: calc(var(--pad) * 1.5);
  }
`;

const SiteTitle = styled.h1`
  margin: -0.1em 0 0 -0.04em;
  font-weight: 200;
  font-size: 30px;
  color: #fff;
  letter-spacing: ${({ $isMonospace }) => $isMonospace ? '-0.04em' : '0'};

  @media (min-width: 1280px) {
    font-size: 60px;
  }

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const SiteLabel = styled.p`
  margin-top: 5px;
  font-weight: 400;
  color: #fff;
`;

const Navigation = styled.nav`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  row-gap: 15px;

  @media (max-width: 768px) {
    margin-top: 30px;
  }
`;

const NavItem = styled.div`
  position: relative;
  cursor: pointer;
  pointer-events: ${({ $active }) => $active ? 'none' : 'auto'};
`;

const NavDot = styled.div`
  position: absolute;
  left: 0;
  top: 2px;
  font-size: 10px;
  opacity: ${({ $active }) => $active ? 1 : 0};
  color: #fff;
  transition: opacity 0.4s cubic-bezier(0.1, 0.4, 0.2, 1);
`;

const NavText = styled.span`
  position: relative;
  color: #fff;
  opacity: ${({ $active }) => $active ? 0 : 1};
  transition: opacity 0.4s cubic-bezier(0.1, 0.4, 0.2, 1);

  &:hover {
    opacity: 0.25;
  }

  &::before {
    content: "";
    display: block;
    position: absolute;
    left: -5px;
    top: -5px;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
  }
`;

const Copyright = styled.div`
  position: absolute;
  z-index: 10;
  left: var(--pad);
  bottom: calc(var(--pad) * 0.5 - 0.5em);
  font-size: 80%;
  opacity: 0.5;
  mix-blend-mode: difference;
  color: #fff;

  @media (max-width: 640px) {
    display: none;
  }
`;

const Content = styled.main`
  position: absolute;
  z-index: 2;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  mix-blend-mode: difference;

  @media (max-width: 768px) {
    position: absolute;
    inset: 0;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-left: 120px;
    padding-top: calc(var(--pad) * 1.5 + 75px);
    padding-right: var(--pad);
    padding-bottom: var(--pad);
  }
`;

const ContentInner = styled.div`
  position: relative;
  min-height: 100%;
`;

const Page = styled.section`
  width: 100%;
  min-height: 100%;
`;

// Home Page
const HomeContent = styled.div`
  position: absolute;
  right: calc(var(--pad) * 2);
  bottom: calc(var(--pad) * 2);
  white-space: nowrap;

  @media (max-width: 768px) {
    position: relative;
    right: auto;
    bottom: auto;
    white-space: normal;
  }
`;

const AboutText = styled.p`
  line-height: 1.5;
  color: #fff;
  text-align: right;

  span {
    display: block;
  }

  @media (max-width: 768px) {
    text-align: left;
  }
`;

// Projects Page
const ProjectsContent = styled.div`
  padding: calc(var(--pad) * 2 + 96px) calc(var(--pad) * 2);
  text-align: right;
  white-space: nowrap;

  @media (min-width: 1280px) {
    padding: calc(var(--pad) * 2 + 125px) calc(var(--pad) * 2);
  }

  @media (max-width: 768px) {
    padding: calc(var(--pad) * 1.5) calc(var(--pad) * 1.5);
    padding-left: 0;
    padding-top: 0;
    text-align: left;
    white-space: normal;
  }
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  row-gap: 30px;

  @media (min-width: 800px) {
    row-gap: 45px;
  }

  @media (max-width: 768px) {
    align-items: flex-start;
    row-gap: 25px;
  }
`;

const ProjectItem = styled.div``;

const ProjectLink = styled.a`
  text-decoration: none;
  color: inherit;
  transition: opacity 0.4s cubic-bezier(0.1, 0.4, 0.2, 1);

  &:hover {
    opacity: 0.25;
  }
`;

const ProjectTitle = styled.h2`
  font-weight: 200;
  font-size: 6.5vw;
  text-align: right;
  color: #fff;
  letter-spacing: ${({ $isMonospace }) => $isMonospace ? '-0.04em' : '0'};

  @media (min-width: 800px) {
    font-size: 60px;
  }

  @media (max-width: 768px) {
    font-size: 6vw;
    text-align: left;
  }
`;

const ProjectInfo = styled.p`
  margin-top: 2vw;
  color: #fff;
  opacity: 0.7;

  @media (min-width: 800px) {
    margin-top: 15px;
  }
`;

// Info Page
const InfoContent = styled.div`
  position: relative;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: calc(var(--pad) * 2);
  padding-top: calc(var(--pad) * 2 + 85px);
  padding-bottom: calc(var(--pad) * 4);
  padding-left: calc(var(--pad) * 2 + 250px);

  @media (min-width: 1280px) {
    padding-top: calc(var(--pad) * 2 + 115px);
    padding-left: calc(var(--pad) * 2 + 350px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: auto;
    overflow-y: visible;
    padding: calc(var(--pad) * 1.5);
    padding-left: 0;
    gap: 30px;
  }
`;

const InfoItem = styled.div`
  position: relative;
  white-space: nowrap;
  flex: 0 0 auto;

  @media (max-width: 768px) {
    white-space: normal;
  }
`;

const InfoSectionLabel = styled.div`
  font-weight: 400;
  opacity: 0.5;
  color: #fff;
  margin-bottom: 0.75em;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.1em;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  line-height: 1.6;
  color: #fff;

  li + li {
    margin-top: 0.75em;
  }

  .light {
    font-weight: 400;
    opacity: 0.7;
  }
`;

const InfoLink = styled.a`
  color: #fff;
  text-decoration: none;
  transition: opacity 0.4s cubic-bezier(0.1, 0.4, 0.2, 1);

  &:hover {
    opacity: 0.25;
  }
`;

// Contact Page
const ContactContent = styled.div`
  position: absolute;
  right: calc(var(--pad) * 2);
  bottom: calc(var(--pad) * 2);
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  gap: 1em;

  @media (max-width: 768px) {
    position: relative;
    right: auto;
    bottom: auto;
    white-space: normal;
  }
`;

const ContactLink = styled.a`
  display: block;
  color: #fff;
  text-decoration: none;
  transition: opacity 0.4s cubic-bezier(0.1, 0.4, 0.2, 1);

  &:hover {
    opacity: 0.25;
  }
`;
