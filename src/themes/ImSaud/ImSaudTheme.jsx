import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { ClockSystem } from './ClockSystem';
import { BackGlyph, ConfirmGlyph, Key, NavGlyph } from './glyphs';
import { BrowserScreen, ContactScreen, FaqScreen } from './screens';
import {
  SECRETS,
  buildAboutPanels,
  buildExperienceSaves,
  buildFaqCards,
  buildProjectSaves,
  buildSocialList,
  totalTaken,
} from './data';
import {
  AboutDot,
  AboutDots,
  AboutPanel,
  AboutPanelInner,
  AboutText,
  AboutTitle,
  CrtOverlay,
  MenuScreen,
  NavPrompt,
  PromptButton,
  Ps2Container,
  Ps2Item,
  Ps2Nav,
  Ps2Scene,
  Root,
  SelectPrompt,
  Stage,
  SysPrompt,
  ps2Palette,
} from './styles';

/**
 * ImSaudTheme — a CV-driven rebuild of www.imsaud.me, a portfolio dressed as a
 * PlayStation 2 BIOS.
 *
 * The source has five menu entries: About, Projects, Play Game, FAQs, Contact.
 * "Play Game" boots a full kaplay/WebGL walking sim whose spritesheets and
 * tilemaps are not part of the site's own bundle, so it cannot be rebuilt here.
 * That slot is given to Experience instead — a second memory-card browser over
 * the resume's work history, which keeps the five-item rhythm of the original
 * and gives the CV's largest section a home.
 *
 * Everything else is transcribed: the real-time orb clock and twelve-hour
 * crystal ring, the tumbling cubes behind the About panels, the save browser
 * with its "Now Loading..." stagger and spinning detail card, the floating
 * memory-card FAQ, and the keyboard/controller prompt strip.
 *
 * Like the source, the whole UI is laid out on a fixed-width pixel stage and
 * scaled to fit — here into the theme container rather than the document.
 */

const DESIGN_WIDTH_WIDE = 2560;
const DESIGN_WIDTH_NARROW = 1700;
const DESIGN_WIDTH_STACK = 1000;
const FADE_MS = 700;
const REVEAL_STEP_MS = 160;

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

// Modulo that stays positive when the step is larger than the list.
function wrap(index, length) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function layoutFor(width, height) {
  if (width >= 900) return { designWidth: DESIGN_WIDTH_WIDE, stack: false };
  if (width > height) return { designWidth: DESIGN_WIDTH_NARROW, stack: false };
  return { designWidth: DESIGN_WIDTH_STACK, stack: true };
}

export function ImSaudTheme({ darkMode = true, onDarkModeChange }) {
  const cv = useCV();

  const panels = useMemo(() => buildAboutPanels(cv), [cv]);
  const projectSaves = useMemo(() => buildProjectSaves(cv), [cv]);
  const experienceSaves = useMemo(() => buildExperienceSaves(cv), [cv]);
  const faqCards = useMemo(() => buildFaqCards(cv), [cv]);
  const socials = useMemo(() => buildSocialList(cv), [cv]);
  const palette = useMemo(() => ps2Palette(darkMode), [darkMode]);

  const menu = useMemo(() => {
    const items = [{ key: 'about', label: 'About' }];
    if (projectSaves.length) items.push({ key: 'projects', label: 'Projects' });
    if (experienceSaves.length) items.push({ key: 'experience', label: 'Experience' });
    if (faqCards.length) items.push({ key: 'faq', label: 'FAQs' });
    if (socials.length || cv?.email) items.push({ key: 'contact', label: 'Contact' });
    return items;
  }, [projectSaves, experienceSaves, faqCards, socials, cv]);

  /* ---------- stage sizing ---------- */

  const rootRef = useRef(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      setBox({ width: rect.width, height: rect.height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { designWidth, stack } = layoutFor(box.width || 1280, box.height || 800);
  const scale = box.width ? box.width / designWidth : 0;
  const stageHeight = scale ? box.height / scale : 0;
  // The source keeps a 2560px stage at every size and scales the crystal ring
  // and cubes up on phones. Narrow stages here are already smaller, so the same
  // multipliers have to be brought back down in proportion.
  const fieldScale = designWidth / DESIGN_WIDTH_WIDE;

  /* ---------- screen state ---------- */

  const [screen, setScreen] = useState('main');
  const [fade, setFade] = useState(1);
  const [menuIndex, setMenuIndex] = useState(0);
  const [aboutMode, setAboutMode] = useState(false);
  const [aboutIndex, setAboutIndex] = useState(0);
  const [browserKind, setBrowserKind] = useState('projects');
  const [browserIndex, setBrowserIndex] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(false);
  const [detailAction, setDetailAction] = useState(0);
  const [faqIndex, setFaqIndex] = useState(0);
  const [secretsOpen, setSecretsOpen] = useState(false);
  const [openSecret, setOpenSecret] = useState(0);
  const [contactIndex, setContactIndex] = useState(0);
  const [gamepad, setGamepad] = useState(false);

  const busyRef = useRef(false);
  const timersRef = useRef([]);
  // Bumped on every browser entry so a stale reveal timer from a browser the
  // reader already backed out of cannot write over the current one.
  const browserRunRef = useRef(0);

  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const saves = browserKind === 'experience' ? experienceSaves : projectSaves;

  // The source's third prompt toggles the site language. There is no second
  // language here, so the slot drives the console's display instead — and it
  // reports back so the app shell's own toggle stays in sync.
  const toggleDisplay = useCallback(() => {
    onDarkModeChange?.(!darkMode);
  }, [onDarkModeChange, darkMode]);

  // Crossfade between full-screen surfaces, the way the source fades the BIOS
  // menu out before a screen fades in.
  const transitionTo = useCallback((next, onSwap) => {
    if (busyRef.current) return;
    const duration = prefersReducedMotion() ? 0 : FADE_MS;

    // Input reopens as soon as the new surface is mounted; the fade back in is
    // cosmetic and holding the controller through it just feels broken.
    const swap = () => {
      setScreen(next);
      onSwap?.();
      setFade(1);
      busyRef.current = false;
    };

    busyRef.current = true;
    if (duration === 0) {
      swap();
      return;
    }
    setFade(0);
    later(swap, duration);
  }, [later]);

  const openBrowser = useCallback((kind) => {
    const list = kind === 'experience' ? experienceSaves : projectSaves;
    browserRunRef.current += 1;
    const run = browserRunRef.current;

    transitionTo('browser', () => {
      setBrowserKind(kind);
      setBrowserIndex(0);
      setDetail(false);
      setDetailAction(0);
      setRevealed(0);
      setLoading(true);
    });

    const step = prefersReducedMotion() ? 0 : REVEAL_STEP_MS;
    if (step === 0) {
      setRevealed(list.length);
      setLoading(false);
      return;
    }
    list.forEach((_, index) => {
      later(() => {
        if (browserRunRef.current === run) setRevealed(index + 1);
      }, FADE_MS + step * index);
    });
    later(() => {
      if (browserRunRef.current === run) setLoading(false);
    }, FADE_MS + step * list.length + 200);
  }, [experienceSaves, projectSaves, transitionTo, later]);

  const backToMenu = useCallback(() => {
    transitionTo('main', () => {
      setDetail(false);
      setSecretsOpen(false);
      setLoading(false);
    });
  }, [transitionTo]);

  const activate = useCallback((key) => {
    if (key === 'about') {
      setAboutMode(true);
      setAboutIndex(0);
      return;
    }
    if (key === 'projects') { openBrowser('projects'); return; }
    if (key === 'experience') { openBrowser('experience'); return; }
    if (key === 'faq') {
      transitionTo('faq', () => {
        setFaqIndex(0);
        setSecretsOpen(false);
      });
      return;
    }
    if (key === 'contact') {
      transitionTo('contact', () => setContactIndex(0));
    }
  }, [openBrowser, transitionTo]);

  const openSave = useCallback((index) => {
    const save = saves[index];
    if (!save) return;
    setBrowserIndex(index);
    setDetail(true);
    setDetailAction(save.link ? 0 : 1);
  }, [saves]);

  const runDetailAction = useCallback((action) => {
    const save = saves[browserIndex];
    if (action === 0 && save?.link) {
      window.open(save.link, '_blank', 'noopener,noreferrer');
      return;
    }
    setDetail(false);
  }, [saves, browserIndex]);

  /* ---------- input ---------- */

  const handleAction = useCallback((action) => {
    if (busyRef.current) return;

    if (secretsOpen) {
      if (action === 'back' || action === 'confirm') setSecretsOpen(false);
      if (action === 'up') setOpenSecret((i) => wrap(i - 1, SECRETS.length));
      if (action === 'down') setOpenSecret((i) => wrap(i + 1, SECRETS.length));
      return;
    }

    if (screen === 'main') {
      if (aboutMode) {
        if (action === 'up') setAboutIndex((i) => wrap(i - 1, panels.length));
        if (action === 'down') setAboutIndex((i) => wrap(i + 1, panels.length));
        if (action === 'back' || action === 'confirm') setAboutMode(false);
        return;
      }
      if (action === 'up') setMenuIndex((i) => wrap(i - 1, menu.length));
      if (action === 'down') setMenuIndex((i) => wrap(i + 1, menu.length));
      if (action === 'confirm') activate(menu[menuIndex]?.key);
      return;
    }

    if (screen === 'browser') {
      if (detail) {
        const hasLink = Boolean(saves[browserIndex]?.link);
        if (!hasLink) {
          if (action === 'confirm' || action === 'back') setDetail(false);
          return;
        }
        if (action === 'up') setDetailAction(0);
        if (action === 'down') setDetailAction(1);
        if (action === 'confirm') runDetailAction(detailAction);
        if (action === 'back') setDetail(false);
        return;
      }
      if (loading) return;
      if (action === 'left' || action === 'up') setBrowserIndex((i) => wrap(i - 1, saves.length));
      if (action === 'right' || action === 'down') setBrowserIndex((i) => wrap(i + 1, saves.length));
      if (action === 'confirm') openSave(browserIndex);
      if (action === 'back') backToMenu();
      return;
    }

    if (screen === 'faq') {
      const columns = stack ? 2 : 4;
      if (action === 'left') setFaqIndex((i) => wrap(i - 1, faqCards.length));
      if (action === 'right') setFaqIndex((i) => wrap(i + 1, faqCards.length));
      if (action === 'up') setFaqIndex((i) => wrap(i - columns, faqCards.length));
      if (action === 'down') setFaqIndex((i) => wrap(i + columns, faqCards.length));
      if (action === 'confirm') setSecretsOpen(true);
      if (action === 'back') backToMenu();
      return;
    }

    if (screen === 'contact') {
      if (action === 'up') setContactIndex((i) => Math.max(0, i - 1));
      if (action === 'down') setContactIndex((i) => Math.min(3, i + 1));
      if (action === 'back') backToMenu();
    }
  }, [
    secretsOpen, screen, aboutMode, panels.length, menu, menuIndex, activate,
    detail, saves, browserIndex, detailAction, runDetailAction, loading,
    openSave, backToMenu, faqCards.length, stack,
  ]);

  const actionRef = useRef(handleAction);
  actionRef.current = handleAction;

  const displayRef = useRef(toggleDisplay);
  displayRef.current = toggleDisplay;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      // The console keys are only ours while the theme has focus, or while
      // nothing at all does. Otherwise they belong to whatever the reader is
      // using in the app shell around us.
      const target = event.target;
      const root = rootRef.current;
      const inTheme = root && target instanceof Node && root.contains(target);
      const unfocused = target === document.body || target === document.documentElement;
      if (!inTheme && !unfocused) return;

      const tag = target?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable;
      // A focused link or button activates itself — do not swallow its Enter.
      const nativeControl = tag === 'A' || tag === 'BUTTON' || tag === 'SELECT';

      if (event.key === 'Shift' && !typing) {
        event.preventDefault();
        displayRef.current();
        return;
      }

      const map = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        Enter: 'confirm',
        Backspace: 'back',
        Escape: 'back',
      };
      const action = map[event.key];
      if (!action) return;

      // While a field has focus the console keys belong to the field —
      // Backspace must still delete text. Escape always leaves.
      if (typing && event.key !== 'Escape') return;
      if (nativeControl && event.key === 'Enter') return;

      event.preventDefault();
      actionRef.current(action);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Gamepad support, as on the source: the prompt strip swaps to controller
  // glyphs as soon as a pad reports any input.
  useEffect(() => {
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
      return undefined;
    }

    let frame = 0;
    let last = 0;
    const previous = {};

    const poll = (time) => {
      frame = requestAnimationFrame(poll);
      if (time - last < 33) return;
      last = time;

      let pad = null;
      const pads = navigator.getGamepads() || [];
      for (let i = 0; i < pads.length; i += 1) {
        if (pads[i]) { pad = pads[i]; break; }
      }
      if (!pad) return;

      const state = {
        up: Boolean(pad.buttons[12]?.pressed) || pad.axes[1] < -0.5,
        down: Boolean(pad.buttons[13]?.pressed) || pad.axes[1] > 0.5,
        left: Boolean(pad.buttons[14]?.pressed) || pad.axes[0] < -0.5,
        right: Boolean(pad.buttons[15]?.pressed) || pad.axes[0] > 0.5,
        confirm: Boolean(pad.buttons[0]?.pressed),
        back: Boolean(pad.buttons[1]?.pressed),
      };

      let pressed = false;
      Object.keys(state).forEach((action) => {
        if (state[action] && !previous[action]) {
          pressed = true;
          actionRef.current(action);
        }
        previous[action] = state[action];
      });
      if (pressed) setGamepad(true);
    };

    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, []);

  /* ---------- render ---------- */

  if (!cv) return <Root ref={rootRef} />;

  const fadeMs = prefersReducedMotion() ? 0 : FADE_MS;
  const onMenu = screen === 'main';
  const panel = panels[aboutIndex] || panels[0];

  return (
    <ThemeProvider theme={palette}>
      <Root ref={rootRef}>
        {scale > 0 && (
          <Stage
            style={{
              width: `${designWidth}px`,
              height: `${stageHeight}px`,
              transform: `scale(${scale})`,
            }}
          >
            <MenuScreen $visible={onMenu} $opacity={onMenu ? fade : 0} $duration={fadeMs}>
              <Ps2Container $stack={stack}>
                <Ps2Scene $stack={stack} $about={aboutMode}>
                  <ClockSystem
                    running={onMenu}
                    showCrystals={aboutMode}
                    showCubes={aboutMode}
                    activeCube={aboutIndex % 5}
                    crystalScale={fieldScale * (stack ? 3.25 : 2.33)}
                    fieldScale={fieldScale}
                  />
                </Ps2Scene>

                <Ps2Nav $stack={stack} $hidden={aboutMode}>
                  {menu.map((item, index) => (
                    <Ps2Item
                      key={item.key}
                      role="button"
                      tabIndex={0}
                      $active={index === menuIndex}
                      onFocus={() => setMenuIndex(index)}
                      onPointerEnter={() => setMenuIndex(index)}
                      onClick={() => {
                        setMenuIndex(index);
                        activate(item.key);
                      }}
                    >
                      {item.label}
                    </Ps2Item>
                  ))}
                </Ps2Nav>
              </Ps2Container>

              <AboutPanel $visible={aboutMode}>
                <AboutPanelInner $stack={stack}>
                  <AboutTitle>{panel?.title}</AboutTitle>
                  <AboutText>{panel?.text}</AboutText>
                  {panels.length > 1 && (
                    <AboutDots>
                      {panels.map((entry, index) => (
                        <AboutDot key={entry.title} $active={index === aboutIndex} />
                      ))}
                    </AboutDots>
                  )}
                </AboutPanelInner>
              </AboutPanel>

              <SelectPrompt $stack={stack}>
                <PromptButton
                  type="button"
                  onClick={() => (aboutMode ? setAboutMode(false) : activate(menu[menuIndex]?.key))}
                >
                  {aboutMode ? <BackGlyph gamepad={gamepad} /> : <ConfirmGlyph gamepad={gamepad} />}
                  <span>{aboutMode ? 'Back' : 'Select'}</span>
                </PromptButton>
              </SelectPrompt>

              <SysPrompt $stack={stack}>
                <PromptButton type="button" onClick={toggleDisplay}>
                  <Key label="SHIFT" />
                  <span>Display</span>
                </PromptButton>
              </SysPrompt>

              <NavPrompt $stack={stack}>
                <NavGlyph gamepad={gamepad} dirs={['up', 'down']} />
                <span>Navigate</span>
              </NavPrompt>
            </MenuScreen>

            <BrowserScreen
              visible={screen === 'browser'}
              opacity={screen === 'browser' ? fade : 0}
              duration={fadeMs}
              stack={stack}
              gamepad={gamepad}
              label={browserKind === 'experience' ? 'Work History (MC2)/1' : 'Local Workspace (SYS)/1'}
              meta={totalTaken(saves)}
              saves={saves}
              activeIndex={browserIndex}
              revealed={revealed}
              loading={loading}
              detail={detail}
              detailAction={detailAction}
              onHover={(index) => !loading && !detail && setBrowserIndex(index)}
              onPick={(index) => !loading && openSave(index)}
              onAction={runDetailAction}
              onBack={() => (detail ? setDetail(false) : backToMenu())}
            />

            <FaqScreen
              visible={screen === 'faq'}
              opacity={screen === 'faq' ? fade : 0}
              duration={fadeMs}
              stack={stack}
              gamepad={gamepad}
              cards={faqCards}
              activeIndex={faqIndex}
              onHover={setFaqIndex}
              onBack={backToMenu}
              secrets={SECRETS}
              secretsOpen={secretsOpen}
              openSecret={openSecret}
              onOpenSecrets={() => setSecretsOpen(true)}
              onCloseSecrets={() => setSecretsOpen(false)}
              onToggleSecret={(index) => setOpenSecret((current) => (current === index ? -1 : index))}
            />

            <ContactScreen
              visible={screen === 'contact'}
              opacity={screen === 'contact' ? fade : 0}
              duration={fadeMs}
              stack={stack}
              gamepad={gamepad}
              title="Connect With Me"
              socials={socials}
              email={cv.email}
              focusIndex={contactIndex}
              onFocusIndex={setContactIndex}
              onBack={backToMenu}
            />

            <CrtOverlay $compact={stack} />
          </Stage>
        )}
      </Root>
    </ThemeProvider>
  );
}

export default ImSaudTheme;
