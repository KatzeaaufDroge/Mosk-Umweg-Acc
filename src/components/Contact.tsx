import { Mail, Phone, MapPin, Send, Clock, Loader2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type Kundentyp = 'Privatperson' | 'Unternehmen';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_SUBMIT_DELAY_MS = 2500;

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
        message: formData.message
      };

      const response = await fetch('/.netlify/functions/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      setStatus({ type: 'success', message: 'Nachricht erfolgreich gesendet!' });
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

  return (
    <section id="contact" className="py-24 bg-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#22c55e] mb-3 sm:mb-4 uppercase tracking-widest">Kontakt aufnehmen</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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

              {/* Kundentyp Select */}
              <div>
                <label htmlFor="kundentyp" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">Kundentyp *</label>
                <select
                  id="kundentyp"
                  name="kundentyp"
                  value={formData.kundentyp}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 bg-[#171717] text-white focus:border-[#f59e0b] outline-none text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  <option value="Privatperson">Privatperson</option>
                  <option value="Unternehmen">Unternehmen</option>
                </select>
              </div>

              {/* Conditional Fields - Privatperson */}
              {formData.kundentyp === 'Privatperson' && (
                <>
                  <div>
                    <label htmlFor="vorname" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">Vorname *</label>
                    <input
                      type="text"
                      id="vorname"
                      name="vorname"
                      value={formData.vorname}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 bg-[#171717] text-white focus:border-[#f59e0b] outline-none text-sm sm:text-base"
                      placeholder="Ihr Vorname"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="nachname" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">Nachname *</label>
                    <input
                      type="text"
                      id="nachname"
                      name="nachname"
                      value={formData.nachname}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 bg-[#171717] text-white focus:border-[#f59e0b] outline-none text-sm sm:text-base"
                      placeholder="Ihr Nachname"
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              {/* Conditional Fields - Unternehmen */}
              {formData.kundentyp === 'Unternehmen' && (
                <>
                  <div>
                    <label htmlFor="unternehmensname" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">Name des Unternehmens *</label>
                    <input
                      type="text"
                      id="unternehmensname"
                      name="unternehmensname"
                      value={formData.unternehmensname}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 bg-[#171717] text-white focus:border-[#f59e0b] outline-none text-sm sm:text-base"
                      placeholder="Unternehmensname"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="ansprechpartner" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">Ansprechpartner *</label>
                    <input
                      type="text"
                      id="ansprechpartner"
                      name="ansprechpartner"
                      value={formData.ansprechpartner}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 bg-[#171717] text-white focus:border-[#f59e0b] outline-none text-sm sm:text-base"
                      placeholder="Ihr Name"
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              {/* Always Visible Fields */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">E-Mail Adresse *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 bg-[#171717] text-white focus:border-[#f59e0b] outline-none text-sm sm:text-base"
                  placeholder="ihre@email.de"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="telefonnummer" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">Telefonnummer</label>
                <input
                  type="tel"
                  id="telefonnummer"
                  name="telefonnummer"
                  value={formData.telefonnummer}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 bg-[#171717] text-white focus:border-[#f59e0b] outline-none text-sm sm:text-base"
                  placeholder="Optional"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">Nachricht *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 bg-[#171717] text-white focus:border-[#f59e0b] outline-none resize-none text-sm sm:text-base"
                  placeholder="Ihre Nachricht..."
                  disabled={isSubmitting}
                ></textarea>
              </div>

              {status.message && (
                <div className={`p-3 sm:p-4 rounded-lg text-sm sm:text-base ${status.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full bg-[#f59e0b] text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base lg:text-lg hover:bg-[#ffc61a] transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50"
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

              <p className="text-xs sm:text-sm text-gray-400 text-center leading-relaxed">
                Mit dem Absenden des Formulars erkläre ich mich mit der Verarbeitung meiner personenbezogenen Daten zur Bearbeitung meiner Anfrage gemäß der{' '}
                <Link to="/datenschutz" className="text-[#22c55e] hover:text-[#16a34a] underline transition-colors">
                  Datenschutzerklärung
                </Link>{' '}
                einverstanden
              </p>
            </form>
          </div>

          <div>
             <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 sm:mb-8">KONTAKTINFORMATIONEN</h3>
             <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-[#f59e0b] w-10 sm:w-12 h-10 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"><Mail className="text-[#0A1F44]" size={20} /></div>
                  <div><h4 className="font-semibold text-gray-300 mb-1 text-sm sm:text-base">E-MAIL</h4><a href="mailto:d.mamon@moskunlimited.be" className="text-gray-400 hover:text-[#f59e0b] text-xs sm:text-sm break-all">d.mamon@moskunlimited.be</a></div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-[#f59e0b] w-10 sm:w-12 h-10 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"><Phone className="text-[#0A1F44]" size={20} /></div>
                  <div><h4 className="font-semibold text-gray-300 mb-1 text-sm sm:text-base">TELEFON</h4><a href="tel:+32472804461" className="text-gray-400 hover:text-[#f59e0b] text-xs sm:text-sm">(+32) 0472 80 44 61</a></div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-[#f59e0b] w-10 sm:w-12 h-10 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"><MessageCircle className="text-[#0A1F44]" size={20} /></div>
                  <div><h4 className="font-semibold text-gray-300 mb-1 text-sm sm:text-base">WHATSAPP</h4><a href="https://wa.me/32472804461" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#f59e0b] text-xs sm:text-sm">Chat starten</a></div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-[#f59e0b] w-10 sm:w-12 h-10 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"><MapPin className="text-[#0A1F44]" size={20} /></div>
                  <div><h4 className="font-semibold text-gray-300 mb-1 text-sm sm:text-base">STANDORT</h4><p className="text-gray-400 text-xs sm:text-sm">Bahnhofstraße 16/1<br />4780 St. Vith<br />Belgien</p></div>
                </div>
             </div>
             <div className="bg-black p-6 sm:p-8 rounded-xl">
               <h4 className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-4">Starten wir Ihr Projekt.</h4>
               <p className="text-white mb-4 sm:mb-6 text-sm sm:text-base">Egal ob Fotografie, Videoproduktion oder professionelle Videobearbeitung-ich setze Ihr Projekt zuverlässig um.</p>
               <div className="flex items-center gap-2 text-[#FFB400] font-semibold text-sm sm:text-base"><Clock size={18} /><span>Antwort innerhalb von 48 Stunden</span></div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}