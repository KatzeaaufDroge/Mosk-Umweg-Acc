import { useNavigate, useLocation } from 'react-router-dom';
import { getNavHeight } from '../lib/utils';

export interface ContactPrefill {
  kundentyp: 'Privatperson' | 'Unternehmen';
  // z.B. "Fotografie – Geburtstage & private Feiern"; landet im Mail-Betreff
  leistung: string;
  message: string;
}

function scrollToContactSection(navHeightOverride?: number) {
  const element = document.getElementById('contact');
  if (!element) return;
  const navHeight = navHeightOverride ?? getNavHeight();
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: elementPosition - navHeight, behavior: 'smooth' });
}

export function useScrollToContact(navHeightOverride?: number) {
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToContactSection(navHeightOverride), 100);
    } else {
      scrollToContactSection(navHeightOverride);
    }
  };
}

// Springt zum Kontaktformular auf der Startseite und füllt es vor.
// Contact.tsx liest den Prefill aus dem Router-State.
export function useContactWithPrefill() {
  const navigate = useNavigate();

  return (prefill: ContactPrefill) => {
    navigate('/', { state: { contactPrefill: prefill } });
    setTimeout(() => scrollToContactSection(), 100);
  };
}
