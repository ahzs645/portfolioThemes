import { useEffect, useState } from 'react';

export function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30 * 1000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

export function formatTime(now) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
}

export function useDotLottiePlayer() {
  const [isReady, setIsReady] = useState(() => {
    if (typeof window === 'undefined' || !window.customElements) return false;
    return Boolean(window.customElements.get('dotlottie-player'));
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.customElements) return undefined;

    let cancelled = false;

    const markReady = () => {
      window.customElements
        .whenDefined('dotlottie-player')
        .then(() => {
          if (!cancelled) setIsReady(true);
        })
        .catch(() => {});
    };

    if (window.customElements.get('dotlottie-player')) {
      markReady();
      return () => {
        cancelled = true;
      };
    }

    let script = document.querySelector('script[data-dotlottie-player]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'module';
      script.src =
        'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs';
      script.setAttribute('data-dotlottie-player', 'true');
      document.head.appendChild(script);
    }

    script.addEventListener('load', markReady, { once: true });
    markReady();

    return () => {
      cancelled = true;
      script?.removeEventListener('load', markReady);
    };
  }, []);

  return isReady;
}
