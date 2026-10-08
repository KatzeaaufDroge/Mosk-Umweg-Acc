import { Mail, Phone, MapPin, Send, Clock, Loader2, X } from 'lucide-react';
import { siWhatsapp } from 'simple-icons';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { ContactPrefill } from '../hooks/useScrollToContact';

type Kundentyp = 'Privatperson' | 'Unternehmen';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_SUBMIT_DELAY_MS = 2500;

// Belgische Mobilnummer (0472 80 44 61) im internationalen Format, ohne +.
// Gilt für WhatsApp (wa.me) und den Anruf-Link.
const WHATSAPP_NUMBER = '32472804461';
const PHONE_DISPLAY = '+32 472 80 44 61';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={siWhatsapp.path} />
    </svg>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState({
    kundentyp: 'Privatperson' as Kundentyp,
    vorname: '',
    nachname: '',
    unternehmensname: '',
    ansprechpartner: '',
    email: '',
    telefonnummer: '',
    message: '',
    website: '' // honeypot: real users never see or fill this field
  });
  const [mountedAt] = useState(() => Date.now());
  // Gewählter Service aus dem Service-Flow, geht in den Mail-Betreff
  const [leistung, setLeistung] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Vorausfüllen, wenn man über eine Service-Karte hierher kommt
  useEffect(() => {
    const prefill = (location.state as { contactPrefill?: ContactPrefill } | null)?.contactPrefill;
    if (!prefill) return;
    setFormData((prev) => ({ ...prev, kundentyp: prefill.kundentyp, message: prefill.message }));
    setLeistung(prefill.leistung);
    setStatus({ type: null, message: '' });
    // State entfernen, damit ein Reload das Formular nicht erneut überschreibt
    navigate(location.pathname, { replace: true, state: null });
    // Fokus erst nach dem Scrollen setzen, sonst springt die Seite
    setTimeout(() => messageRef.current?.focus({ preventScroll: true }), 700);
  }, [location.state, location.pathname, navigate]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    // Bot defense: honeypot filled or submitted suspiciously fast — pretend
    // success without touching the database, don't tip off the bot.
    if (formData.website || Date.now() - mountedAt < MIN_SUBMIT_DELAY_MS) {
      setStatus({ type: 'success', message: 'Nachricht erfolgreich gesendet!' });
      setIsSubmitting(false);
      return;
    }

    if (!EMAIL_REGEX.test(formData.email)) {
      setStatus({ type: 'error', message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionData = {
        kundentyp: formData.kundentyp,
        unternehmensname: formData.kundentyp === 'Unternehmen' ? formData.unternehmensname : null,
        ansprechpartner: formData.kundentyp === 'Unternehmen' ? formData.ansprechpartner : null,
        vorname: formData.kundentyp === 'Privatperson' ? formData.vorname : null,
        nachname: formData.kundentyp === 'Privatperson' ? formData.nachname : null,
        telefonnummer: formData.telefonnummer || null,
        email: formData.email,
        message: formData.message,
        leistung: leistung || null
      };

      const response = await fetch('/api/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      setStatus({ type: 'success', message: 'Nachricht erfolgreich gesendet!' });
      setLeistung('');
      setFormData({
        kundentyp: 'Privatperson',
        vorname: '',
        nachname: '',
        unternehmensname: '',
        ansprechpartner: '',
        email: '',
        telefonnummer: '',
        message: '',
        website: ''
      });
    } catch (error) {
      console.error('Fehler:', error);
      setStatus({ type: 'error', message: 'Fehler beim Senden.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const field =
    'w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm sm:text-base text-white placeholder:text-white/30 outline-none transition-colors hover:border-white/20 focus:border-brand/70 focus:bg-white/[0.06] disabled:opacity-60';
  const label = 'mb-2 block text-sm font-medium text-white/70';

  return (
    <section id="contact" className="relative isolate overflow-hidden bg-[#111211] py-24 sm:py-32">
      {/* Hintergrund: eigenes Eventfoto, stark abgedunkelt und entsättigt */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <img
          src="/images/kontakt-hintergrund.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full scale-105 object-cover opacity-90 blur-[2px] brightness-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111211] via-[#111211]/15 to-[#111211]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111211]/50 via-transparent to-[#111211]/50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 sm:mb-16 text-center">
          <h2 className="font-display font-normal text-5xl sm:text-6xl md:text-7xl tracking-wide text-white">
            Kontakt aufnehmen
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <div className="glass-card rounded-2xl p-5 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {leistung && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-brand/40 bg-brand/10 px-4 py-3">
                  <p className="text-sm sm:text-base text-white">
                    <span className="text-white/60">Anfrage für: </span>
                    <span className="font-semibold">{leistung}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setLeistung('')}
                    className="shrink-0 rounded-md p-1 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Service-Auswahl entfernen"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {/* Honeypot: hidden from real users, bots that autofill every field trip it */}
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] w-px h-px overflow-hidden"
              />

              {/* Kundentyp als Umschalter */}
              <div>
                <span id="kundentyp-label" className={label}>Ich bin</span>
                <div
                  role="radiogroup"
                  aria-labelledby="kundentyp-label"
                  className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1"
                >
                  {(['Privatperson', 'Unternehmen'] as Kundentyp[]).map((typ) => {
                    const on = formData.kundentyp === typ;
                    return (
                      <button
                        key={typ}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        disabled={isSubmitting}
                        onClick={() => setFormData((prev) => ({ ...prev, kundentyp: typ }))}
                        className={`rounded-md py-2.5 text-sm font-semibold transition-colors ${
                          on ? 'bg-brand text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {typ}
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.kundentyp === 'Privatperson' ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
                  <div>
                    <label htmlFor="vorname" className={label}>Vorname *</label>
                    <input
                      type="text"
                      id="vorname"
                      name="vorname"
                      autoComplete="given-name"
                      value={formData.vorname}
                      onChange={handleChange}
                      required
                      className={field}
                      placeholder="Ihr Vorname"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="nachname" className={label}>Nachname *</label>
                    <input
                      type="text"
                      id="nachname"
                      name="nachname"
                      autoComplete="family-name"
                      value={formData.nachname}
                      onChange={handleChange}
                      required
                      className={field}
                      placeholder="Ihr Nachname"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
                  <div>
                    <label htmlFor="unternehmensname" className={label}>Unternehmen *</label>
                    <input
                      type="text"
                      id="unternehmensname"
                      name="unternehmensname"
                      autoComplete="organization"
                      value={formData.unternehmensname}
                      onChange={handleChange}
                      required
                      className={field}
                      placeholder="Name des Unternehmens"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="ansprechpartner" className={label}>Ansprechpartner *</label>
                    <input
                      type="text"
                      id="ansprechpartner"
                      name="ansprechpartner"
                      autoComplete="name"
                      value={formData.ansprechpartner}
                      onChange={handleChange}
                      required
                      className={field}
                      placeholder="Ihr Name"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
                <div>
                  <label htmlFor="email" className={label}>E-Mail *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={field}
                    placeholder="ihre@email.de"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="telefonnummer" className={label}>
                    Telefon <span className="font-normal text-white/40">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="telefonnummer"
                    name="telefonnummer"
                    autoComplete="tel"
                    value={formData.telefonnummer}
                    onChange={handleChange}
                    className={field}
                    placeholder="+32 …"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className={label}>Nachricht *</label>
                <textarea
                  ref={messageRef}
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className={`${field} resize-none`}
                  placeholder="Worum geht es? Datum, Ort, Umfang …"
                  disabled={isSubmitting}
                ></textarea>
              </div>

              {status.message && (
                <div
                  role="status"
                  className={`rounded-lg border px-4 py-3 text-sm sm:text-base ${
                    status.type === 'success'
                      ? 'border-brand/40 bg-brand/10 text-white'
                      : 'border-red-500/40 bg-red-500/10 text-red-200'
                  }`}
                >
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-2 sm:gap-3 rounded-lg bg-brand px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base lg:text-lg font-bold text-black transition-all hover:bg-brand-light active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    Nachricht senden
                    <Send className="group-hover:translate-x-1 transition-transform" size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-xs sm:text-sm leading-relaxed text-white/45">
                Mit dem Absenden des Formulars erkläre ich mich mit der Verarbeitung meiner personenbezogenen Daten zur Bearbeitung meiner Anfrage gemäß der{' '}
                <Link to="/datenschutz" className="text-brand hover:text-brand-light underline transition-colors">
                  Datenschutzerklärung
                </Link>{' '}
                einverstanden
              </p>
            </form>
          </div>

          {/* Direkter Kontakt */}
          <div className="flex flex-col lg:pt-4">
            <h3 className="text-xl sm:text-2xl font-semibold text-white">Lieber direkt?</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/60">
              Egal ob Fotografie, Videoproduktion oder professionelle Videobearbeitung – ich setze Ihr Projekt zuverlässig um.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-lg bg-brand px-5 py-3.5 font-bold text-black transition-all hover:bg-brand-light active:scale-[0.98]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp
              </a>
              <a
                href={`tel:+${WHATSAPP_NUMBER}`}
                className="flex items-center justify-center gap-2.5 rounded-lg border border-white/15 bg-white/[0.03] px-5 py-3.5 font-semibold text-white transition-colors hover:border-brand/60 hover:bg-brand/10 active:scale-[0.98]"
              >
                <Phone size={18} />
                Anrufen
              </a>
            </div>

            <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
              <div className="flex items-start gap-4 py-4">
                <dt className="sr-only">Telefon</dt>
                <Phone className="mt-0.5 shrink-0 text-brand" size={18} />
                <dd>
                  <a href={`tel:+${WHATSAPP_NUMBER}`} className="text-white/80 transition-colors hover:text-brand">
                    {PHONE_DISPLAY}
                  </a>
                </dd>
              </div>
              <div className="flex items-start gap-4 py-4">
                <dt className="sr-only">E-Mail</dt>
                <Mail className="mt-0.5 shrink-0 text-brand" size={18} />
                <dd>
                  <a href="mailto:d.mamon@moskunlimited.be" className="break-all text-white/80 transition-colors hover:text-brand">
                    d.mamon@moskunlimited.be
                  </a>
                </dd>
              </div>
              <div className="flex items-start gap-4 py-4">
                <dt className="sr-only">Standort</dt>
                <MapPin className="mt-0.5 shrink-0 text-brand" size={18} />
                <dd className="text-white/80">Bahnhofstraße 16/1, 4780 St. Vith, Belgien</dd>
              </div>
            </dl>

            <p className="mt-6 flex items-center gap-2 text-sm font-medium text-brand">
              <Clock size={16} />
              Antwort innerhalb von 48 Stunden
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
