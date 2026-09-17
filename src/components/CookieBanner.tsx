import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loadUmamiIfConsented } from '../lib/analytics';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
    loadUmamiIfConsented();
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    loadUmamiIfConsented();
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900 border-t border-neutral-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 pr-8">
            <p className="text-sm text-gray-300 leading-relaxed">
              Diese Website verwendet technisch notwendige Cookies sowie, mit Ihrer Zustimmung, Analyse-Cookies. Sie können weitere Informationen in unser{' '}
              <Link
                to="/datenschutz"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 underline"
              >
                Datenschutzerklärung
              </Link>
              {' '}finden.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors duration-200"
            >
              Schließen
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-black bg-[#f59e0b] hover:bg-[#ffc61a] rounded-lg transition-colors duration-200"
            >
              Akzeptieren
            </button>
            <Link
              to="/datenschutz"
              className="px-4 py-2 text-sm font-medium text-neutral-900 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 inline-block text-center"
            >
              Datenschutzerklärung
            </Link>
          </div>

          <button
            onClick={handleReject}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition-colors duration-200 md:hidden"
            aria-label="Close cookie banner"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
