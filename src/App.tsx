import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Contact from './components/Contact';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import { Seo } from './components/Seo';
import { AnimationProvider } from './context/AnimationContext';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const EventServicesPage = lazy(() => import('./pages/EventServicesPage'));
const BusinessServicesPage = lazy(() => import('./pages/BusinessServicesPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const ImpressumPage = lazy(() => import('./pages/ImpressumPage'));
const DatenschutzPage = lazy(() => import('./pages/DatenschutzPage'));
const AGBPage = lazy(() => import('./pages/AGBPage'));

function App() {
  return (
    <AnimationProvider>
      <Router>
        <div className="min-h-screen">
          <Navigation />
          <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Seo
                      title="Mosk Unlimited – Fotografie, Video & Editing in St. Vith"
                      description="Professionelle Fotografie, Videoproduktion und Editing für Privatkunden und Unternehmen in St. Vith, Belgien. Jetzt unverbindlich anfragen."
                      path="/"
                    />
                    <Hero />
                    <Contact />
                  </>
                }
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/event" element={<EventServicesPage />} />
              <Route path="/services/business" element={<BusinessServicesPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/impressum" element={<ImpressumPage />} />
              <Route path="/datenschutz" element={<DatenschutzPage />} />
              <Route path="/agb" element={<AGBPage />} />
            </Routes>
          </Suspense>
          <Footer />
          <CookieBanner />
        </div>
      </Router>
    </AnimationProvider>
  );
}

export default App;
