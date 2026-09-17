import { useNavigate, useLocation } from 'react-router-dom';
import { getNavHeight } from '../lib/utils';

export function useScrollToContact(navHeightOverride?: number) {
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    const scroll = () => {
      const element = document.getElementById('contact');
      if (!element) return;
      const navHeight = navHeightOverride ?? getNavHeight();
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - navHeight, behavior: 'smooth' });
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(scroll, 100);
    } else {
      scroll();
    }
  };
}
