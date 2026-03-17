import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { BREAKPOINT, FONT } from '../utils/tokens';
import { buildContactLinks } from '../utils/helpers';

/* Phosphor icons – bold weight, 256×256 viewBox, 16×16 rendered */
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M234.38,210a123.36,123.36,0,0,0-60.78-53.23,76,76,0,1,0-91.2,0A123.36,123.36,0,0,0,21.62,210a12,12,0,1,0,20.77,12c18.12-31.32,50.12-50,85.61-50s67.49,18.69,85.61,50a12,12,0,0,0,20.77-12ZM76,96a52,52,0,1,1,52,52A52.06,52.06,0,0,1,76,96Z" />
  </svg>
);

const AtIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128,20a108,108,0,0,0,0,216c1.1,0,2.2,0,3.29-.06a12,12,0,0,0-1.38-24c-.64,0-1.27,0-1.91,0a84,84,0,1,1,84-84c0,25.27-8.18,40-16,40s-16-14.73-16-40a12,12,0,0,0-24,0,52,52,0,1,1-20.46-41.34,12,12,0,0,0,22.1-2.66H160a12,12,0,0,0,12,12c30.93,0,40-30.86,40-52A108.12,108.12,0,0,0,128,20Zm0,136a28,28,0,1,1,28-28A28,28,0,0,1,128,156Z" />
  </svg>
);

const EnvelopeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M228,44H28A12,12,0,0,0,16,56V192a20,20,0,0,0,20,20H220a20,20,0,0,0,20-20V56A12,12,0,0,0,228,44ZM128,146.31,54.19,68H201.81ZM96.82,128,40,189.81V72.19Zm17.48,16.69,6.2,5.81a12,12,0,0,0,16.38-.32l5.87-5.49L199.81,188H55.37ZM159.18,128,216,72.19V189.81Z" />
  </svg>
);

export default function Contact({ cv, theme }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const contactLinks = useMemo(() => buildContactLinks(cv), [cv]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cv.email) return;

    const subject = form.name
      ? `Portfolio inquiry from ${form.name}`
      : 'Portfolio inquiry';

    const bodyLines = [
      form.name ? `Name: ${form.name}` : '',
      form.email ? `Email: ${form.email}` : '',
      '',
      form.message || 'Hi, I would like to connect about your work.',
    ].filter(Boolean);

    window.location.href = `mailto:${cv.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
  };

  return (
    <Section id="contact">
      <OuterCard $theme={theme}>
        <FormContainer $theme={theme}>
          <HeadingGroup>
            <Heading $theme={theme}>Contact</Heading>
            <Description $theme={theme}>
              Fill out the form, or reach out directly. I'll respond within 24 hours.
            </Description>
          </HeadingGroup>

          {cv.email ? (
            <Form onSubmit={handleSubmit}>
              <FieldWrap>
                <FieldIcon $theme={theme}><UserIcon /></FieldIcon>
                <Input
                  $theme={theme}
                  type="text"
                  name="name"
                  placeholder="Name"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </FieldWrap>
              <FieldWrap>
                <FieldIcon $theme={theme}><AtIcon /></FieldIcon>
                <Input
                  $theme={theme}
                  type="email"
                  name="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </FieldWrap>
              <FieldWrap>
                <FieldIcon $theme={theme} $top><EnvelopeIcon /></FieldIcon>
                <TextArea
                  $theme={theme}
                  name="message"
                  placeholder="Message"
                  value={form.message}
                  onChange={handleChange}
                />
              </FieldWrap>
              <SubmitBtn $theme={theme} type="submit">Send message</SubmitBtn>
            </Form>
          ) : (
            <LinksFallback>
              {contactLinks.map(link => (
                <FallbackLink
                  key={link.label}
                  $theme={theme}
                  href={link.href}
                  target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                >
                  {link.label}
                </FallbackLink>
              ))}
            </LinksFallback>
          )}
        </FormContainer>
      </OuterCard>
    </Section>
  );
}

const Section = styled.section`
  padding: 40px 0 60px;
  display: flex;
  justify-content: center;
`;

const OuterCard = styled.div`
  width: 550px;
  max-width: 100%;
  background: ${p => p.$theme.cardBg};
  border: 1px solid ${p => p.$theme.border};
  border-radius: 46px;
  padding: 9px 9px 26px 9px;

  @media (max-width: ${BREAKPOINT}px) {
    width: 390px;
    border-radius: 36px;
    padding: 6px 6px 18px 6px;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  background: ${p => p.$theme.formBg};
  border-radius: 40px;
  padding: 60px;
  overflow: hidden;

  @media (max-width: ${BREAKPOINT}px) {
    border-radius: 32px;
    padding: 40px 30px 30px 30px;
    gap: 28px;
  }
`;

const HeadingGroup = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: ${BREAKPOINT}px) {
    gap: 8px;
  }
`;

const Heading = styled.h2`
  margin: 0;
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: 50px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.05em;
  line-height: 110%;

  @media (max-width: ${BREAKPOINT}px) {
    font-size: 34px;
  }
`;

const Description = styled.p`
  margin: 0;
  color: ${p => p.$theme.text};
  opacity: 0.6;
  font-family: ${FONT.family};
  font-size: 16px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
  width: 100%;

  @media (max-width: ${BREAKPOINT}px) {
    gap: 6px;
  }
`;

const FieldWrap = styled.div`
  position: relative;
  width: 100%;
`;

const FieldIcon = styled.span`
  position: absolute;
  left: 20px;
  top: ${p => p.$top ? '20px' : '50%'};
  transform: ${p => p.$top ? 'none' : 'translateY(-50%)'};
  color: ${p => p.$theme.inputIcon};
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const inputBase = `
  width: 100%;
  border: 0;
  outline: none;
  transition: all 0.3s cubic-bezier(0.44, 0, 0.56, 1);
`;

const Input = styled.input`
  ${inputBase}
  height: 58px;
  border-radius: 50px;
  background: ${p => p.$theme.formBg};
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: 15px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.05em;
  line-height: 1.2;
  padding: 0 20px 0 47px;

  &::placeholder {
    color: ${p => p.$theme.placeholder};
  }

  @media (max-width: ${BREAKPOINT}px) {
    font-size: 16px;
    padding-left: 45px;
  }
`;

const TextArea = styled.textarea`
  ${inputBase}
  min-height: 100px;
  border-radius: 24px;
  background: ${p => p.$theme.formBg};
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: 15px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.05em;
  line-height: 1.4;
  padding: 18px 20px 18px 47px;
  resize: vertical;

  &::placeholder {
    color: ${p => p.$theme.placeholder};
  }

  @media (max-width: ${BREAKPOINT}px) {
    font-size: 16px;
    padding-left: 45px;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 58px;
  border: 0;
  border-radius: 100px;
  background: ${p => p.$theme.accent};
  color: #ffffff;
  font-family: ${FONT.family};
  font-size: 17px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.04em;
  cursor: pointer;
  margin-top: 4px;
  transition: background 0.2s;

  &:hover {
    background: ${p => p.$theme.accentHover};
  }
`;

const LinksFallback = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  max-width: 360px;
  width: 100%;
`;

const FallbackLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 46px;
  padding: 0 18px;
  border-radius: 50px;
  background: ${p => p.$theme.cardBg};
  border: 1px solid ${p => p.$theme.border};
  color: ${p => p.$theme.text};
  text-decoration: none;
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  transition: border-color 0.2s;

  &:hover {
    border-color: ${p => p.$theme.text};
  }
`;
