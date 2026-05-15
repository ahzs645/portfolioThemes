import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { withBase } from '../../utils/assetPath';
import { canUseWebGL, usePrefersReducedMotion } from '../../utils/rendering';
import { heroFrag, introFrag, miniFrag, titleFrag } from './shaders';

const media = (file) => withBase(`noah-finer/media/${file}`);

const ASSETS = {
  font: media('Basteleur-Moonlight.5ab7be37736e313afdc6.otf'),
  logo: media('logo-black.c4b2c5418d1306095f94.png'),
  textureOne: media('generative.0a2f6ae7b6e1989ec97b.png'),
  textureTwo: media('sftransit.c89e4d6dc3dc06c22462.png'),
  textureThree: media('projects.8442bee5d7ea9aed2d11.png'),
  textureFour: media('weword.53cf3c3ec4417ff870bd.png'),
  aboutTitle: media('itme.ca6f7856239e0074ceae.png'),
  projectsTitle: media('projects.8442bee5d7ea9aed2d11.png'),
  picsTitle: media('photos.559f371cc7de15d23c1a.png'),
};

const FALLBACK_PROJECT_IMAGES = [
  media('weword.53cf3c3ec4417ff870bd.png'),
  media('generative.0a2f6ae7b6e1989ec97b.png'),
  media('chime.e71b95d696b3a1c9b473.png'),
  media('rollout.83f64679b4df3e7f3c46.png'),
  media('sftransit.c89e4d6dc3dc06c22462.png'),
  media('affirm.182802e053c664b6e946.png'),
  media('multitaskilus.df8a9396d17ca4b7f4d9.png'),
  media('sqar.9587ef8e349f145dc3c8.png'),
];

const vertexSource = `
  precision highp float;

  attribute vec2 a_position;
  varying vec2 v_texcoord;

  void main() {
    v_texcoord = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

function compileShader(gl, type, source, label) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`${label}: ${message || 'Shader compile failed'}`);
  }
  return shader;
}

function createProgram(gl, fragmentSource, label) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource, `${label} vertex`);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource, `${label} fragment`);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(message || 'Program link failed');
  }
  return program;
}

function loadTexture(gl, src, unit) {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([180, 207, 130, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const image = new Image();
  image.onload = () => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  };
  image.src = src;
  return texture;
}

function ShaderCanvas({ frag, uniforms = {}, label = 'shader', disabled = false }) {
  const canvasRef = useRef(null);
  const uniformsRef = useRef(uniforms);
  const [unavailable, setUnavailable] = useState(disabled);

  useEffect(() => {
    uniformsRef.current = uniforms;
  }, [uniforms]);

  useEffect(() => {
    if (disabled) {
      setUnavailable(true);
      return undefined;
    }
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { alpha: true, antialias: false });
    if (!canvas || !gl) {
      setUnavailable(true);
      return undefined;
    }
    setUnavailable(false);

    let program;
    try {
      program = createProgram(gl, frag, label);
    } catch (error) {
      console.error('NoahFiner shader error:', error);
      setUnavailable(true);
      return undefined;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const locations = new Map();
    const locationFor = (key) => {
      if (!locations.has(key)) locations.set(key, gl.getUniformLocation(program, key));
      return locations.get(key);
    };
    const textureUnits = new Map();
    let nextTextureUnit = 0;
    let mouse = [0, 0];
    let rafId = 0;

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse = [event.clientX - rect.left, rect.height - (event.clientY - rect.top)];
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = 1;
      const width = Math.max(1, Math.floor(rect.width * ratio));
      const height = Math.max(1, Math.floor(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = (time) => {
      resize();
      gl.useProgram(program);
      gl.uniform1f(locationFor('u_time'), Math.max(0.001, time / 1000));
      gl.uniform2f(locationFor('u_resolution'), canvas.width, canvas.height);
      gl.uniform2f(locationFor('u_mouse'), mouse[0] * (canvas.width / canvas.clientWidth), mouse[1] * (canvas.height / canvas.clientHeight));
      gl.uniform1f(locationFor('u_scroll'), window.scrollY / Math.max(1, window.innerHeight));

      Object.entries(uniformsRef.current).forEach(([key, value]) => {
        const location = locationFor(key);
        if (!location) return;
        if (typeof value === 'number') {
          gl.uniform1f(location, value);
          return;
        }
        if (!textureUnits.has(key)) {
          textureUnits.set(key, nextTextureUnit);
          loadTexture(gl, value, nextTextureUnit);
          nextTextureUnit += 1;
        }
        gl.uniform1i(location, textureUnits.get(key));
      });

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('resize', resize);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', resize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [frag, disabled]);

  if (unavailable) return <ShaderFallback aria-hidden="true" />;
  return <CanvasEl ref={canvasRef} />;
}

function splitTitle(title) {
  const text = title || '';
  const midpoint = Math.max(1, Math.ceil(text.length / 2));
  return `${text.slice(0, midpoint)}*${text.slice(midpoint)}`;
}

function CoolTitle({ text }) {
  return (
    <>
      {text.split('').map((char, index) => (
        char === '*'
          ? <br key={`${text}-${index}`} />
          : <WiggleSpan key={`${text}-${index}`} $delay={(index % 5) * 0.4}>{char}</WiggleSpan>
      ))}
    </>
  );
}

function LogoMark({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <path fill="currentColor" d="M32 4 53.7 16.5v31L32 60 10.3 47.5v-31L32 4Zm0 8.5L17.6 20.8v20.4L32 49.5l14.4-8.3V20.8L32 12.5Z" />
      <path fill="currentColor" d="M24 22h7.2l8.8 14.7V22h5.6v22H38l-8.4-14.1V44H24V22Z" />
    </svg>
  );
}

function HeroSection({ cv, onNavigate, shadersEnabled }) {
  const [effect, setEffect] = useState(0);
  const [visibleIdx, setVisibleIdx] = useState(0);
  const [hideControls, setHideControls] = useState(false);
  const intros = useMemo(() => [
    {
      id: 'about',
      title: 'It is*me',
      body: [
        `I am ${cv.name}.`,
        [cv.currentJobTitle, cv.location].filter(Boolean).join(' in ') || cv.about || 'I build practical things with a careful eye for systems.',
      ],
    },
    {
      id: 'projects',
      title: 'Thi*ngs',
      body: [
        'I have made tools, experiments, research systems, and practical software.',
        'The project cards below pull from CV.yaml and keep the playful Noah Finer layout.',
      ],
    },
    {
      id: 'photos',
      title: 'Pho*tos',
      body: [
        'A compact photo corner keeps the source-site gallery energy.',
        'The personal photos are removed; the motion now leans on shaders and graphic textures.',
      ],
    },
    {
      id: 'contact',
      title: 'Li*nks',
      body: [
        'GitHub, LinkedIn, email, and website live in the contact section.',
        'Hover the top links to bend the shader palette.',
      ],
    },
  ], [cv]);

  useEffect(() => {
    const onScroll = () => {
      const height = Math.max(1, window.innerHeight);
      const scroll = window.scrollY < height ? window.scrollY + 300 : window.scrollY;
      setVisibleIdx(Math.max(0, Math.min(3, Math.floor((scroll + 50) / height) - 1)));
      setHideControls(window.scrollY > height * 4.6);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <HeroViewport>
        <HeroShader>
          <ShaderCanvas
            frag={heroFrag}
            label="hero"
            disabled={!shadersEnabled}
            uniforms={{ texture0: ASSETS.logo, u_textureX: 923.1, u_textureY: 934.1, u_effectType: effect }}
          />
        </HeroShader>
        <HeroNav aria-label="Theme sections" $hidden={hideControls}>
          {[
            ['about', 'me', 1],
            ['projects', 'projs', 2],
            ['photos', 'pics', 3],
          ].map(([target, label, hoverEffect]) => (
            <HeroNavButton
              key={target}
              type="button"
              onClick={() => onNavigate(target)}
              onMouseEnter={() => setEffect(hoverEffect)}
              onMouseLeave={() => setEffect(0)}
            >
              {label}
            </HeroNavButton>
          ))}
        </HeroNav>
        <ScrollButton
          type="button"
          $flipped={visibleIdx === intros.length - 1}
          $hidden={hideControls}
          onClick={() => {
            const height = window.innerHeight;
            window.scrollTo({
              top: visibleIdx === intros.length - 1 ? 0 : Math.floor((window.scrollY + height + 100) / height) * height,
              behavior: 'smooth',
            });
          }}
          aria-label="Scroll"
        >
          <svg viewBox="0 0 64 64" width="64" height="64">
            <path d="M13 26c9 17 29 17 38 0" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
            <path d="M20 34 32 47 44 34" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </ScrollButton>
      </HeroViewport>
      <IntroBackdrop>
        <ShaderCanvas label="intro" frag={introFrag} disabled={!shadersEnabled} uniforms={{ texture1: ASSETS.textureOne, texture2: ASSETS.textureTwo, texture3: ASSETS.textureThree, texture4: ASSETS.textureFour }} />
      </IntroBackdrop>
      {intros.map((intro, index) => (
        <IntroPanel key={intro.id} id={`intro-${intro.id}`}>
          <IntroTitle $visible={index === visibleIdx}>
            <CoolTitle text={intro.title} />
          </IntroTitle>
          <IntroText $visible={index === visibleIdx}>
            {intro.body.map((line) => <p key={line}>{line}</p>)}
          </IntroText>
        </IntroPanel>
      ))}
    </>
  );
}

function ContentHeader({ selected, titleTexture, titleSize, onNavigate, shadersEnabled }) {
  return (
    <Header>
      <HeaderNav>
        <LogoButton type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <LogoMark size={64} />
        </LogoButton>
        {[
          ['about', 'me'],
          ['projects', 'projs'],
          ['photos', 'pics'],
        ].map(([target, label]) => (
          <HeaderLink key={target} type="button" $active={selected === target} onClick={() => onNavigate(target)}>
            {label}
          </HeaderLink>
        ))}
      </HeaderNav>
      <MiniShader><ShaderCanvas label="mini-header" frag={miniFrag} disabled={!shadersEnabled} /></MiniShader>
      <TitleShader>
        <ShaderCanvas label="title" frag={titleFrag} disabled={!shadersEnabled} uniforms={{ texture0: titleTexture, image_size_x: titleSize[0], image_size_y: titleSize[1] }} />
      </TitleShader>
    </Header>
  );
}

function ShadowCard({ children, href }) {
  const content = (
    <CardWrap>
      <CardShadow />
      <CardBody>{children}</CardBody>
    </CardWrap>
  );

  return href ? <CardLink href={href} target="_blank" rel="noreferrer">{content}</CardLink> : content;
}

function AboutSection({ cv, onNavigate, shadersEnabled }) {
  const links = [
    cv.socialLinks?.linkedin && ['linkedin', cv.socialLinks.linkedin],
    cv.socialLinks?.github && ['github', cv.socialLinks.github],
    cv.socialLinks?.twitter && ['twitter', cv.socialLinks.twitter],
    cv.website && ['website', cv.website],
    cv.email && ['email me', `mailto:${cv.email}`],
  ].filter(Boolean);

  return (
    <SectionBlock id="about">
      <ContentHeader selected="about" titleTexture={ASSETS.aboutTitle} titleSize={[993, 254]} onNavigate={onNavigate} shadersEnabled={shadersEnabled} />
      <AboutGrid>
        <AboutCopy>
          <p><strong>yeah you heard it</strong></p>
          <p>{cv.name}{cv.currentJobTitle ? `, ${cv.currentJobTitle}` : ''}{cv.location ? ` based in ${cv.location}` : ''}</p>
          {cv.about && <p>{cv.about}</p>}
          <p>here are some links that belong in the noisy little button pile</p>
          <ButtonPile>
            {links.map(([label, href]) => (
              <PillLink key={label} href={href} target="_blank" rel="noreferrer">{label}</PillLink>
            ))}
          </ButtonPile>
        </AboutCopy>
        <IdentityPlate aria-label={cv.name}>
          <ShaderCanvas label="identity" frag={miniFrag} disabled={!shadersEnabled} />
          <IdentityInitials>{(cv.name || 'AJ').split(/\s+/).map((part) => part[0]).join('').slice(0, 3)}</IdentityInitials>
        </IdentityPlate>
      </AboutGrid>
    </SectionBlock>
  );
}

function ProjectsSection({ cv, onNavigate, shadersEnabled }) {
  const projects = (cv.projects || []).slice(0, 8);
  const experience = (cv.experience || []).slice(0, 4);

  return (
    <SectionBlock id="projects">
      <ContentHeader selected="projects" titleTexture={ASSETS.projectsTitle} titleSize={[1211, 296]} onNavigate={onNavigate} shadersEnabled={shadersEnabled} />
      <ContentColumn>
        <SectionIntro>
          <h2>fun stuff</h2>
          <p>some things from the CV that can reasonably be described as useful, cool, or at least suspiciously elaborate</p>
        </SectionIntro>
        <ProjectList>
          {projects.map((project, index) => (
            <ShadowCard key={project.name || project.title} href={project.url}>
              <ProjectImage src={project.image || FALLBACK_PROJECT_IMAGES[index % FALLBACK_PROJECT_IMAGES.length]} alt="" />
              <ProjectContent>
                <ProjectTopline>
                  <strong>{project.name || project.title}</strong>
                  <span>{project.date || project.startDate || 'selected'}</span>
                </ProjectTopline>
                <p>{project.summary || project.description || project.highlights?.[0]}</p>
              </ProjectContent>
            </ShadowCard>
          ))}
        </ProjectList>
        <SectionIntro>
          <h2>work things</h2>
          <p>the serious bits, still wearing the same strange jacket</p>
        </SectionIntro>
        <ProjectList>
          {experience.map((item, index) => (
            <ShadowCard key={`${item.company}-${item.title || item.position}-${index}`}>
              <ProjectImage src={FALLBACK_PROJECT_IMAGES[(index + 4) % FALLBACK_PROJECT_IMAGES.length]} alt="" />
              <ProjectContent>
                <ProjectTopline>
                  <strong>{item.title || item.position}</strong>
                  <span>{[item.startDate || item.start_date, item.endDate || item.end_date].filter(Boolean).join(' - ')}</span>
                </ProjectTopline>
                <p>{item.company}{item.location ? ` / ${item.location}` : ''}</p>
                {item.highlights?.[0] && <p>{item.highlights[0]}</p>}
              </ProjectContent>
            </ShadowCard>
          ))}
        </ProjectList>
      </ContentColumn>
    </SectionBlock>
  );
}

function PhotosSection({ cv, onNavigate, shadersEnabled }) {
  const panels = [
    ['profile', cv.location || 'current base', cv.website],
    ['contact', cv.email || 'email available', cv.email ? `mailto:${cv.email}` : cv.website],
    ['links', cv.socialLinks?.github ? 'github linked' : 'selected links', cv.socialLinks?.github || cv.website],
  ];

  return (
    <SectionBlock id="photos">
      <ContentHeader selected="photos" titleTexture={ASSETS.picsTitle} titleSize={[1029, 242]} onNavigate={onNavigate} shadersEnabled={shadersEnabled} />
      <PhotoIntro>
        <div>
          <p><strong>oh snap</strong></p>
          <p>the source page had a photo corner, but this version keeps the layout without using personal images.</p>
          <p>{cv.name}'s links and CV content drive these graphic panels instead.</p>
        </div>
      </PhotoIntro>
      <PhotoGrid>
        {panels.map(([title, label, href]) => (
          <PhotoTile key={title} href={href || '#'} target="_blank" rel="noreferrer">
            <TileShader aria-hidden="true">
              <ShaderCanvas label={`tile-${title}`} frag={miniFrag} disabled={!shadersEnabled} />
            </TileShader>
            <TileTitle>{title}</TileTitle>
            <PhotoLabel>{label}</PhotoLabel>
          </PhotoTile>
        ))}
      </PhotoGrid>
    </SectionBlock>
  );
}

export function NoahFinerTheme() {
  const cv = useCV();
  const reducedMotion = usePrefersReducedMotion();
  const [webglAvailable] = useState(() => canUseWebGL());
  if (!cv) return null;
  const shadersEnabled = webglAvailable && !reducedMotion;

  const onNavigate = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <ThemeRoot>
      <GlobalStyles />
      <HeroSection cv={cv} onNavigate={onNavigate} shadersEnabled={shadersEnabled} />
      <AboutSection cv={cv} onNavigate={onNavigate} shadersEnabled={shadersEnabled} />
      <ProjectsSection cv={cv} onNavigate={onNavigate} shadersEnabled={shadersEnabled} />
      <PhotosSection cv={cv} onNavigate={onNavigate} shadersEnabled={shadersEnabled} />
    </ThemeRoot>
  );
}

const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'Noah Basteleur';
    src: url('${ASSETS.font}') format('opentype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
`;

const wiggle = keyframes`
  0%, 100% { transform: rotate(-2deg) translateY(0); }
  50% { transform: rotate(2deg) translateY(-0.05em); }
`;

const ThemeRoot = styled.div`
  --noah-primary: #b5cf82;
  --noah-secondary: #46461a;
  min-height: 100vh;
  overflow-x: hidden;
  background: var(--noah-secondary);
  color: var(--noah-primary);
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0;
  isolation: isolate;

  * {
    box-sizing: border-box;
  }

  a {
    color: inherit;
  }
`;

const CanvasEl = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

const ShaderFallback = styled.div`
  width: 100%;
  height: 100%;
  background:
    linear-gradient(135deg, rgba(181, 207, 130, 0.18), transparent 36%),
    radial-gradient(circle at 30% 30%, rgba(181, 207, 130, 0.32), transparent 28%),
    var(--noah-secondary);
`;

const HeroViewport = styled.section`
  width: 100vw;
  height: 100svh;
  position: relative;
  z-index: 2;
  background: var(--noah-secondary);
`;

const HeroShader = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;

  canvas {
    mix-blend-mode: normal;
  }
`;

const HeroNav = styled.nav`
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  padding: 1rem clamp(1rem, 4vw, 3rem);
  pointer-events: ${({ $hidden }) => ($hidden ? 'none' : 'none')};
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  transition: opacity 180ms ease;
`;

const HeroNavButton = styled.button`
  min-width: 9rem;
  border: 0;
  background: transparent;
  color: var(--noah-primary);
  padding: 1rem;
  font: inherit;
  font-size: 1.25rem;
  text-align: right;
  cursor: pointer;
  pointer-events: auto;
  text-shadow: 0 2px 14px rgba(0,0,0,0.7);

  &:hover {
    background: var(--noah-primary);
    color: var(--noah-secondary);
    text-shadow: none;
  }
`;

const ScrollButton = styled.button`
  position: absolute;
  right: clamp(1rem, 4vw, 2rem);
  bottom: 2rem;
  z-index: 6;
  width: 4rem;
  height: 4rem;
  border: 0;
  background: transparent;
  color: var(--noah-primary);
  cursor: pointer;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  pointer-events: ${({ $hidden }) => ($hidden ? 'none' : 'auto')};
  transform: ${({ $flipped }) => ($flipped ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: opacity 180ms ease, transform 180ms ease;

  &:hover {
    transform: ${({ $flipped }) => ($flipped ? 'rotate(180deg) translateY(-0.4rem)' : 'translateY(0.4rem)')};
  }
`;

const IntroBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
`;

const IntroPanel = styled.section`
  position: relative;
  z-index: 1;
  width: min(80vw, 42rem);
  height: 100lvh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(2rem, 6vw, 4rem);
`;

const IntroTitle = styled.h1`
  margin: 0;
  font-family: 'Noah Basteleur', Georgia, serif;
  font-weight: 400;
  font-size: clamp(5rem, 17vw, 12rem);
  line-height: 0.75;
  text-shadow: 0 0.06em 0 rgba(35, 35, 10, 0.78);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? '0' : '-1rem')});
  transition: opacity 280ms ease, transform 280ms ease;
`;

const WiggleSpan = styled.span`
  display: inline-block;
  animation: ${wiggle} 2.8s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

const IntroText = styled.div`
  display: grid;
  gap: 1.5rem;
  max-width: 38rem;
  font-weight: 700;
  font-size: clamp(1rem, 2vw, 1.25rem);
  text-shadow: 0 0.12em 0 rgba(35, 35, 10, 0.8);

  p {
    margin: 0;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    transform: translateY(${({ $visible }) => ($visible ? '0' : '-0.75rem')});
    transition: opacity 280ms ease, transform 280ms ease;
  }
`;

const SectionBlock = styled.section`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  background: var(--noah-secondary);
  padding-bottom: 5rem;
`;

const Header = styled.header`
  position: relative;
  min-height: clamp(13rem, 24vw, 18rem);
  border-bottom: 2px solid var(--noah-primary);
  padding: 2rem;
  overflow: hidden;
`;

const HeaderNav = styled.nav`
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const LogoButton = styled.button`
  width: 4rem;
  height: 4rem;
  border: 0;
  padding: 0;
  color: var(--noah-primary);
  background: transparent;
  cursor: pointer;

  &:hover {
    transform: rotate(18deg);
  }
`;

const HeaderLink = styled.button`
  min-width: 6rem;
  border: 0;
  background: transparent;
  color: var(--noah-primary);
  padding: 0.5rem;
  font: inherit;
  font-size: 1rem;
  text-align: right;
  text-decoration: ${({ $active }) => ($active ? 'underline' : 'none')};
  cursor: pointer;

  &:hover {
    background: var(--noah-primary);
    color: var(--noah-secondary);
  }
`;

const MiniShader = styled.div`
  position: absolute;
  left: 0;
  top: 3rem;
  z-index: 1;
  width: calc(100vw - 12rem);
  height: 8rem;
`;

const TitleShader = styled.div`
  position: absolute;
  z-index: 2;
  left: clamp(-1rem, 4vw, 2rem);
  top: clamp(6rem, 9vw, 4rem);
  width: min(48rem, calc(100vw - 2rem));
  height: clamp(8rem, 17vw, 16rem);
  pointer-events: none;
`;

const AboutGrid = styled.div`
  width: min(66rem, calc(100vw - 2rem));
  min-height: 32rem;
  margin: 0 auto;
  padding: clamp(2rem, 6vw, 5rem) 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: clamp(2rem, 6vw, 5rem);
  align-items: center;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const AboutCopy = styled.div`
  p {
    margin: 0 0 2rem;
    font-size: 1rem;
  }
`;

const ButtonPile = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const PillLink = styled.a`
  border: 2px solid var(--noah-primary);
  padding: 1rem;
  text-decoration: none;

  &:hover {
    background: var(--noah-primary);
    color: var(--noah-secondary);
  }
`;

const IdentityPlate = styled.div`
  position: relative;
  width: min(15rem, 70vw);
  aspect-ratio: 1;
  margin: 0 auto;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 2px solid var(--noah-primary);
  box-shadow: -0.75rem 0.75rem 0 var(--noah-primary);
`;

const IdentityInitials = styled.div`
  position: relative;
  z-index: 1;
  font-family: 'Noah Basteleur', Georgia, serif;
  font-size: clamp(4rem, 15vw, 7rem);
  line-height: 0.8;
  color: var(--noah-secondary);
  text-shadow: 0.05em 0.05em 0 var(--noah-primary);
`;

const ContentColumn = styled.div`
  width: min(900px, calc(100vw - 2rem));
  margin: 0 auto;
`;

const SectionIntro = styled.div`
  padding: 3rem 0 2rem;

  h2 {
    margin: 0;
    font-family: 'Noah Basteleur', Georgia, serif;
    font-weight: 400;
    font-size: clamp(3.8rem, 10vw, 6rem);
    line-height: 0.85;
  }

  p {
    margin: 1rem 0 0;
  }
`;

const ProjectList = styled.div`
  display: grid;
  gap: 2rem;
  margin-bottom: 3rem;
`;

const CardLink = styled.a`
  display: block;
  text-decoration: none;
`;

const CardWrap = styled.div`
  position: relative;
  min-height: 16rem;
`;

const CardShadow = styled.div`
  position: absolute;
  inset: 0;
  background: var(--noah-primary);
  transition: transform 180ms ease;

  ${CardWrap}:hover & {
    transform: translate(-0.5rem, 0.5rem);
  }
`;

const CardBody = styled.div`
  position: relative;
  min-height: 16rem;
  display: grid;
  grid-template-columns: 14rem minmax(0, 1fr);
  gap: 2rem;
  align-items: center;
  padding: 2rem;
  border: 2px solid var(--noah-primary);
  background: var(--noah-secondary);
  transition: transform 180ms ease;

  ${CardWrap}:hover & {
    transform: translate(0.5rem, -0.5rem);
  }

  ${CardWrap}:hover ${CardShadow} + & {
    transform: translate(0.5rem, -0.5rem);
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectImage = styled.img`
  max-width: 100%;
  max-height: 12rem;
  width: auto;
  height: auto;
  margin: 0 auto;
`;

const ProjectContent = styled.div`
  display: grid;
  gap: 1.25rem;

  p {
    margin: 0;
  }
`;

const ProjectTopline = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PhotoIntro = styled.div`
  width: min(58rem, calc(100vw - 2rem));
  margin: 3rem auto;
  display: grid;
  grid-template-columns: minmax(0, 34rem);
  gap: 2rem;
  align-items: center;

  p {
    margin: 0 0 1.5rem;
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const PhotoGrid = styled.div`
  width: min(64rem, calc(100vw - 2rem));
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: clamp(2rem, 8vw, 6rem);
  flex-wrap: wrap;
`;

const PhotoTile = styled.a`
  position: relative;
  width: 18rem;
  aspect-ratio: 1;
  color: inherit;
  text-decoration: none;
  display: grid;
  place-items: center;
  border: 2px solid var(--noah-primary);
  overflow: visible;
  background: var(--noah-secondary);
  transition: transform 180ms ease;

  &:hover {
    transform: scale(1.035);
  }
`;

const TileShader = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`;

const TileTitle = styled.div`
  position: relative;
  z-index: 1;
  font-family: 'Noah Basteleur', Georgia, serif;
  font-size: 4rem;
  line-height: 0.8;
  color: var(--noah-secondary);
  text-shadow: 0.04em 0.04em 0 var(--noah-primary);
`;

const PhotoLabel = styled.div`
  position: absolute;
  left: -2rem;
  top: 1rem;
  width: 12rem;
  min-height: 6rem;
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid var(--noah-primary);
  background: var(--noah-secondary);
  box-shadow: -0.5rem 0.5rem 0 var(--noah-primary);
`;
