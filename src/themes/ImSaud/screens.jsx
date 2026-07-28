import { useEffect, useRef } from 'react';
import { SOCIAL_ICONS } from './data';
import { MemoryCard } from './MemoryCard';
import { BackGlyph, ConfirmGlyph, NavGlyph } from './glyphs';
import {
  BrowserGrid,
  BrowserGridWrap,
  BrowserHeader,
  BrowserItem,
  BrowserLoading,
  BrowserScreenEl,
  BrowserTitle,
  ContactDivider,
  ContactForm,
  ContactInner,
  ContactInput,
  ContactNote,
  ContactScreenEl,
  ContactSocials,
  ContactSubmit,
  ContactTextarea,
  ContactTitle,
  DetailAction,
  DetailActions,
  DetailCard,
  DetailCardWrap,
  DetailDesc,
  DetailInfo,
  DetailMeta,
  DetailOverlay,
  DetailTitle,
  FaqAnswer,
  FaqGrid,
  FaqItem,
  FaqQuestion,
  FaqScreenEl,
  FaqTriangle,
  FooterCenter,
  FooterRight,
  GemButton,
  GemCorner,
  GemLabel,
  PromptButton,
  SaveIcon,
  SaveIconInitials,
  SaveIconLabel,
  ScreenFooter,
  SecretBody,
  SecretHead,
  SecretItem,
  SecretsBox,
  SecretsOverlay,
  SecretsTitle,
  SocialIcon,
} from './styles';

/* ---------- save browser ---------- */

function SaveArt({ save, active, width, flat }) {
  return (
    <SaveIcon $active={active} $width={width} $flat={flat}>
      <SaveIconInitials $width={width}>{save.initials}</SaveIconInitials>
      <SaveIconLabel $width={width}>{save.stamp || 'save data'}</SaveIconLabel>
    </SaveIcon>
  );
}

export function BrowserScreen({
  visible,
  opacity,
  duration,
  stack,
  gamepad,
  label,
  meta,
  saves,
  activeIndex,
  revealed,
  loading,
  detail,
  detailAction,
  onHover,
  onPick,
  onAction,
  onBack,
}) {
  const active = saves[activeIndex];
  const columns = Math.min(saves.length || 1, stack ? 2 : 4);

  return (
    <BrowserScreenEl $visible={visible} $opacity={opacity} $duration={duration}>
      <BrowserHeader>
        <span>
          {label}
          <br />
          <small>{meta}</small>
        </span>
        <BrowserTitle>{loading ? '' : active?.title || ''}</BrowserTitle>
      </BrowserHeader>

      <BrowserGridWrap>
        {loading && <BrowserLoading>Now Loading...</BrowserLoading>}
        <BrowserGrid $columns={columns} $stack={stack}>
          {saves.map((save, index) => (
            <BrowserItem
              key={save.id}
              $active={!loading && index === activeIndex}
              $shown={index < revealed}
              onPointerEnter={() => onHover(index)}
              onClick={() => onPick(index)}
            >
              <SaveArt save={save} active={!loading && index === activeIndex} width={150} />
            </BrowserItem>
          ))}
        </BrowserGrid>
      </BrowserGridWrap>

      {detail && active && (
        <DetailOverlay $stack={stack} $tint={`hsla(${active.tint}, 100%, 16%, .95)`}>
          <DetailCardWrap $stack={stack}>
            <DetailCard>
              <SaveArt save={active} active flat width={stack ? 420 : 460} />
              <SaveArt save={active} active flat width={stack ? 420 : 460} />
            </DetailCard>
          </DetailCardWrap>
          <DetailInfo $stack={stack}>
            <DetailTitle>{active.title}</DetailTitle>
            <DetailMeta>{active.subtitle}</DetailMeta>
            <DetailMeta>{active.date}</DetailMeta>
            <DetailMeta>{active.size}</DetailMeta>
            {active.desc && <DetailDesc>{active.desc}</DetailDesc>}
            <DetailActions>
              {active.link && (
                <DetailAction $active={detailAction === 0} onClick={() => onAction(0)}>
                  Launch Title
                </DetailAction>
              )}
              <DetailAction $active={detailAction === 1 || !active.link} onClick={() => onAction(1)}>
                Back
              </DetailAction>
            </DetailActions>
          </DetailInfo>
        </DetailOverlay>
      )}

      <ScreenFooter $stack={stack}>
        <FooterCenter $stack={stack}>
          <PromptButton type="button" onClick={() => onPick(activeIndex)}>
            <ConfirmGlyph gamepad={gamepad} />
            <span>Select</span>
          </PromptButton>
          <PromptButton type="button" onClick={onBack}>
            <BackGlyph gamepad={gamepad} />
            <span>Back</span>
          </PromptButton>
        </FooterCenter>
        <FooterRight $stack={stack}>
          <NavGlyph gamepad={gamepad} dirs={detail ? ['up', 'down'] : ['left', 'right']} row={!detail} />
          <span>Navigate</span>
        </FooterRight>
      </ScreenFooter>
    </BrowserScreenEl>
  );
}

/* ---------- FAQ ---------- */

// Stacked (portrait) layout lays the cards out two per row and slides the grid
// so the selected row sits in the middle of the screen.
const FAQ_ROW_HEIGHT = 550;

function faqOffset(count, index) {
  const rows = Math.max(1, Math.ceil(count / 2));
  return ((rows - 1) / 2 - Math.floor(index / 2)) * FAQ_ROW_HEIGHT;
}

export function FaqScreen({
  visible,
  opacity,
  duration,
  stack,
  gamepad,
  cards,
  activeIndex,
  onHover,
  onBack,
  secretsOpen,
  onOpenSecrets,
  onCloseSecrets,
  secrets,
  openSecret,
  onToggleSecret,
}) {
  return (
    <FaqScreenEl $visible={visible} $opacity={opacity} $duration={duration}>
      <GemCorner>
        <GemLabel>Little Secrets</GemLabel>
        <GemButton type="button" onClick={onOpenSecrets} aria-label="How this theme was built">
          <MemoryCard rainbow spin bare active />
        </GemButton>
      </GemCorner>

      <FaqGrid $stack={stack} $offset={faqOffset(cards.length, activeIndex)}>
        {cards.map((card, index) => (
          <FaqItem key={card.q} onPointerEnter={() => onHover(index)} onClick={() => onHover(index)}>
            <FaqQuestion $active={index === activeIndex}>{card.q}</FaqQuestion>
            <FaqTriangle $active={index === activeIndex} />
            <MemoryCard
              active={index === activeIndex}
              spin={index === activeIndex}
              capacity={String(8 * (index + 1))}
            />
            <FaqAnswer $active={index === activeIndex}>{card.a}</FaqAnswer>
          </FaqItem>
        ))}
      </FaqGrid>

      {secretsOpen && (
        <SecretsOverlay onClick={onCloseSecrets}>
          <SecretsBox onClick={(event) => event.stopPropagation()}>
            <SecretsTitle>Little Secrets</SecretsTitle>
            {secrets.map((secret, index) => (
              <SecretItem key={secret.heading}>
                <SecretHead
                  type="button"
                  $open={openSecret === index}
                  aria-expanded={openSecret === index}
                  onClick={() => onToggleSecret(index)}
                >
                  <span>▸</span>
                  <span>{secret.heading}</span>
                </SecretHead>
                {openSecret === index && <SecretBody>{secret.body}</SecretBody>}
              </SecretItem>
            ))}
          </SecretsBox>
        </SecretsOverlay>
      )}

      <ScreenFooter $stack={stack}>
        <FooterCenter $stack={stack}>
          <PromptButton type="button" onClick={secretsOpen ? onCloseSecrets : onBack}>
            <BackGlyph gamepad={gamepad} />
            <span>Back</span>
          </PromptButton>
        </FooterCenter>
        <FooterRight $stack={stack}>
          <NavGlyph gamepad={gamepad} dirs={['up', 'down', 'left', 'right']} row />
          <span>Navigate</span>
        </FooterRight>
      </ScreenFooter>
    </FaqScreenEl>
  );
}

/* ---------- contact ---------- */

export function ContactScreen({
  visible,
  opacity,
  duration,
  stack,
  gamepad,
  title,
  socials,
  email,
  focusIndex,
  onFocusIndex,
  onBack,
}) {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    const refs = [nameRef, emailRef, messageRef];
    refs[focusIndex]?.current?.focus?.();
  }, [visible, focusIndex]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email) return;
    const from = nameRef.current?.value || '';
    const reply = emailRef.current?.value || '';
    const body = [messageRef.current?.value || '', '', from && `— ${from}`, reply]
      .filter(Boolean)
      .join('\n');
    const subject = from ? `Portfolio message from ${from}` : 'Portfolio message';
    window.open(
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_self',
    );
  };

  return (
    <ContactScreenEl $visible={visible} $opacity={opacity} $duration={duration}>
      <ContactInner $stack={stack}>
        <ContactTitle>{title}</ContactTitle>
        <ContactSocials>
          {socials.map((social) => (
            <SocialIcon
              key={social.key}
              href={social.href}
              target={social.key === 'email' ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label={social.label}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
                <path d={social.path} />
              </svg>
            </SocialIcon>
          ))}
        </ContactSocials>
        <ContactDivider />
        <ContactForm onSubmit={handleSubmit} noValidate>
          <ContactInput
            ref={nameRef}
            type="text"
            name="name"
            placeholder="Enter your name"
            $active={focusIndex === 0}
            onFocus={() => onFocusIndex(0)}
          />
          <ContactInput
            ref={emailRef}
            type="email"
            name="email"
            placeholder="Enter your email address"
            $active={focusIndex === 1}
            onFocus={() => onFocusIndex(1)}
          />
          <ContactTextarea
            ref={messageRef}
            name="message"
            placeholder="Message"
            $active={focusIndex === 2}
            onFocus={() => onFocusIndex(2)}
          />
          <ContactSubmit type="submit" $active={focusIndex === 3} onFocus={() => onFocusIndex(3)}>
            Send Message
          </ContactSubmit>
        </ContactForm>
        <ContactNote>
          No server behind this screen — sending opens your own mail client.
        </ContactNote>
      </ContactInner>

      <ScreenFooter $stack={stack}>
        <FooterCenter $stack={stack}>
          <PromptButton type="button" onClick={onBack}>
            <BackGlyph gamepad={gamepad} />
            <span>Back</span>
          </PromptButton>
        </FooterCenter>
        <FooterRight $stack={stack}>
          <NavGlyph gamepad={gamepad} dirs={['up', 'down']} />
          <span>Navigate</span>
        </FooterRight>
      </ScreenFooter>
    </ContactScreenEl>
  );
}
