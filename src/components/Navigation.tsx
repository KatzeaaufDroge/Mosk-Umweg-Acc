import { Home, Info, Image, Mail, Zap, FileText } from 'lucide-react';
import { NavBar } from './ui/tubelight-navbar';
import { MobileDropdown } from './ui/mobile-dropdown';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getNavHeight } from '../lib/utils';
import logoIcon from '../../public/Logo.png';
import houseIcon from '../../assets/house.png';
import zahnradIcon from '../../public/Zahnrad.png';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('');
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (location.pathname === '/services' || location.pathname === '/services/event' || location.pathname === '/services/business') {
      setActiveSection('Services');
      return;
    } else if (location.pathname === '/about') {
      setActiveSection('Über mich');
      return;
    } else if (location.pathname === '/portfolio') {
      setActiveSection('Galerie');
      return;
    } else if (location.pathname === '/impressum') {
      setActiveSection('Impressum');
      return;
    }

    if (location.pathname === '/') {
      const handleScroll = () => {
        if (isScrollingRef.current) return;

        const scrollPosition = window.scrollY;
        const contactSection = document.getElementById('contact');

        if (contactSection) {
          const contactRect = contactSection.getBoundingClientRect();
          const contactTop = contactRect.top + scrollPosition;

          if (scrollPosition + window.innerHeight * 0.5 >= contactTop) {
            setActiveSection('Kontakt');
          } else {
            setActiveSection('Home');
          }
        } else {
          setActiveSection('Home');
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setActiveSection('Home');
    }
  }, [location.pathname]);

  const scrollToContact = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('contact');
        if (element) {
          isScrollingRef.current = true;
          const navHeight = getNavHeight();
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - navHeight;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          setTimeout(() => { isScrollingRef.current = false; }, 1000);
        }
      }, 100);
    } else {
      const element = document.getElementById('contact');
      if (element) {
        isScrollingRef.current = true;
        const navHeight = getNavHeight();
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - navHeight;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        setTimeout(() => { isScrollingRef.current = false; }, 1000);
      }
    }
  };

  const goToHome = () => {
    isScrollingRef.current = true;
    window.scrollTo({ top: 0, behavior: 'auto' });
    setActiveSection('Home');
    navigate('/');
    setTimeout(() => { isScrollingRef.current = false; }, 100);
  };

  const goToServices = () => {
    navigate('/services');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const goToAbout = () => {
    navigate('/about');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const goToPortfolio = () => {
    navigate('/portfolio');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const goToImpressum = () => {
    navigate('/impressum');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navItems = [
    { name: 'Home', to: '/', icon: Home, onClick: () => goToHome(), image: houseIcon },
    { name: 'Services', to: '/services', icon: Zap, onClick: () => goToServices() },
    { name: 'Über mich', to: '/about', icon: Info, onClick: () => goToAbout() },
    { name: 'Galerie', to: '/portfolio', icon: Image, onClick: () => goToPortfolio() },
    { name: 'Kontakt', icon: Mail, onClick: () => scrollToContact() },
    { name: 'Impressum', to: '/impressum', icon: FileText, onClick: () => goToImpressum() },
  ]

  const mobileNavItems = navItems.map(item => ({
    name: item.name,
    to: item.to,
    icon: item.icon || Mail,
    onClick: item.onClick,
    image: item.image || (item.name === 'Services' ? zahnradIcon : undefined),
  }))

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black py-3 px-4 sm:py-4">
      <div className="flex justify-between items-center w-full">
        <button
          onClick={goToHome}
          className="hover:opacity-80 transition-opacity duration-300 flex-shrink-0"
        >
          <img src={logoIcon} alt="Logo" className="h-12 sm:h-16" />
        </button>
        <div className="flex-shrink-0">
          <div className="hidden md:block">
            <NavBar items={navItems} activeSection={activeSection} />
          </div>
          <div className="md:hidden">
            <MobileDropdown items={mobileNavItems} activeSection={activeSection} />
          </div>
        </div>
      </div>
    </div>
  );
}
