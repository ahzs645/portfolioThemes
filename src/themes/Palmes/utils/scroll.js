// Scroll utility functions

// Calculate scroll percentage (0-100)
export function getScrollPercent() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

  if (scrollHeight <= 0) return 0;

  return Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
}

// Debounce function for scroll events
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for smoother scroll updates
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
