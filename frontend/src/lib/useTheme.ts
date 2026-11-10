import { useCallback, useEffect, useState } from 'react';
import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  type ResolvedTheme,
  type ThemePreference,
} from './theme';

/** Hook de tema: mantém a preferência, aplica e reage a mudanças do sistema. */
export function useTheme(): {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (pref: ThemePreference) => void;
  toggle: () => void;
} {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredTheme);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(readStoredTheme()));

  useEffect(() => {
    setResolved(applyTheme(preference));
  }, [preference]);

  useEffect(() => {
    if (preference !== 'system' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolved(applyTheme('system'));
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [preference]);

  const setPreference = useCallback((pref: ThemePreference) => {
    storeTheme(pref);
    setPreferenceState(pref);
  }, []);

  const toggle = useCallback(() => {
    setPreferenceState((current) => {
      const next: ThemePreference = resolveTheme(current) === 'dark' ? 'light' : 'dark';
      storeTheme(next);
      return next;
    });
  }, []);

  return { preference, resolved, setPreference, toggle };
}
