import { useEffect, useState } from 'preact/hooks';

const THEME_STORAGE_KEY = 'private-text-compare-theme';
type Theme = 'dark' | 'light';

function readTheme(): Theme {
  if (typeof document !== 'undefined') {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  }
  return 'dark';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The visual theme still changes for this session when storage is unavailable.
    }
  };

  const nextLabel = theme === 'dark' ? 'Light' : 'Dark';

  return (
    <button
      type="button"
      class="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextLabel.toLowerCase()} theme`}
      data-theme-toggle
    >
      <svg class="theme-toggle-icon theme-toggle-icon--sun" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="3.25" />
        <path d="M10 1.75v2M10 16.25v2M1.75 10h2M16.25 10h2M4.17 4.17l1.42 1.42M14.41 14.41l1.42 1.42M15.83 4.17l-1.42 1.42M5.59 14.41l-1.42 1.42" />
      </svg>
      <svg class="theme-toggle-icon theme-toggle-icon--moon" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M15.65 12.65A6.65 6.65 0 0 1 7.35 4.35 6.7 6.7 0 1 0 15.65 12.65Z" />
      </svg>
      <span>{nextLabel}</span>
    </button>
  );
}
