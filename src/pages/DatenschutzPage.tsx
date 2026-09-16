import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Shield, Globe, Info } from 'lucide-react';

type Language = 'de' | 'en' | 'fr';

interface DatenschutzContent {
  title: string;
  description: string;
  content: string[];
}

interface DatenschutzData {
  [key: string]: DatenschutzContent;
}

const datenschutzData: DatenschutzData = {
  de: {
    title: 'Datenschutzerklärung',
    description: 'Stand: Januar 2026',
    content: [
      '1. Verantwortlicher: MOSK unlimited\nBahnhofstraße 16/1\n4780 St. Vith, Belgien\nE-Mail: d.mamon@moskunlimited.be\nTelefon: +32 472 80 44 61',
      '2. Allgemeine Hinweise zur Datenverarbeitung: Wir verarbeiten personenbezogene Daten ausschließlich im Einklang mit der Datenschutz-Grundverordnung (DSGVO) sowie den geltenden belgischen Datenschutzgesetzen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.',
      '3. Erhebung und Verarbeitung personenbezogener Daten: Wir erheben und verarbeiten personenbezogene Daten nur, wenn Sie uns diese freiwillig mitteilen, insbesondere durch: Nutzung des Kontaktformulars, Kontaktaufnahme per E-Mail oder Telefon. Verarbeitete Daten können sein: Vor- und Nachname, E-Mail-Adresse, Telefonnummer, Inhalt der Nachricht.',
      '4. Zweck der Verarbeitung: Die Verarbeitung der Daten erfolgt ausschließlich zum Zweck der: Bearbeitung Ihrer Anfrage, Kontaktaufnahme und Kommunikation, Angebotserstellung und Vertragsvorbereitung.',
      '5. Rechtsgrundlage der Verarbeitung: Die Verarbeitung erfolgt auf Grundlage von: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen), Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Kommunikation).',
      '6. Speicherdauer: Personenbezogene Daten werden nur so lange gespeichert, wie dies zur Bearbeitung Ihrer Anfrage erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.',
      '7. Weitergabe von Daten: Eine Weitergabe Ihrer Daten an Dritte erfolgt nicht, es sei denn: sie ist zur Vertragserfüllung erforderlich oder wir sind gesetzlich dazu verpflichtet.',
      '8. Server-Log-Files: Beim Besuch der Website werden automatisch Informationen durch den Hosting-Provider erfasst (z. B. IP-Adresse, Browsertyp, Datum und Uhrzeit). Diese Daten dienen der technischen Sicherheit und werden nicht mit anderen Datenquellen zusammengeführt.',
      '9. Ihre Rechte: Sie haben jederzeit das Recht auf: Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO), Berichtigung unrichtiger Daten (Art. 16 DSGVO), Löschung Ihrer Daten (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO), Widerspruch gegen die Verarbeitung (Art. 21 DSGVO).',
      '10. Beschwerderecht: Sie haben das Recht, sich bei der zuständigen Aufsichtsbehörde zu beschweren: Autorité de protection des données (APD / GBA), Rue de la Presse 35, 1000 Brüssel, www.dataprotectionauthority.be',
      '11. Kontaktformular – Hinweistext: Mit dem Absenden des Formulars erkläre ich mich mit der Verarbeitung meiner personenbezogenen Daten zur Bearbeitung meiner Anfrage gemäß der Datenschutzerklärung einverstanden.',
    ],
  },
  en: {
    title: 'Privacy Policy',
    description: 'Valid from: January 2026',
    content: [
      '1. Data controller: MOSK unlimited\nBahnhofstraße 16/1\n4780 St. Vith, Belgium\nE-mail: d.mamon@moskunlimited.be\nPhone: +32 472 80 44 61',
      '2. General information: We process personal data in accordance with the General Data Protection Regulation (GDPR) and applicable Belgian data protection laws.',
      '3. Data collection: Personal data is collected only when voluntarily provided, particularly via the contact form or direct communication.',
      '4. Purpose of processing: Data is processed solely for responding to inquiries and preparing contractual relationships.',
      '5. Legal basis: Article 6(1)(b) GDPR, Article 6(1)(f) GDPR.',
      '6. Data retention: Personal data is stored only as long as necessary to process the inquiry or comply with legal obligations.',
      '7. Rights of data subjects: You have the right to access, rectification, erasure, restriction, objection, and data portability.',
      '8. Supervisory authority: Belgian Data Protection Authority (APD/GBA).',
      '9. Contact form notice: By submitting this form, I consent to the processing of my personal data in accordance with the privacy policy.',
    ],
  },
  fr: {
    title: 'Politique de Confidentialité',
    description: 'Valable à partir de: janvier 2026',
    content: [
      '1. Responsable du traitement: MOSK unlimited\nBahnhofstraße 16/1\n4780 St. Vith, Belgique\nE-mail : d.mamon@moskunlimited.be\nTéléphone : +32 472 80 44 61',
      '2. Informations générales: Nous traitons les données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et à la législation belge applicable.',
      '3. Données collectées: Les données personnelles sont collectées uniquement lorsque vous nous les communiquez volontairement, notamment via le formulaire de contact ou par e-mail.',
      '4. Finalité du traitement: Les données sont utilisées exclusivement pour répondre à votre demande et établir une relation contractuelle.',
      '5. Base juridique: Article 6, paragraphe 1, point b) RGPD, Article 6, paragraphe 1, point f) RGPD.',
      '6. Durée de conservation: Les données sont conservées uniquement pendant la durée nécessaire au traitement de votre demande.',
      '7. Droits des personnes concernées: Vous disposez d\'un droit d\'accès, de rectification, de suppression, de limitation, d\'opposition et de portabilité de vos données.',
      '8. Autorité de contrôle: Autorité de protection des données (APD/GBA), Belgique.',
      '9. Mention formulaire de contact: En envoyant ce formulaire, j\'accepte le traitement de mes données personnelles conformément à la politique de confidentialité.',
    ],
  },
};

export default function DatenschutzPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('de');

  const languageButtons = [
    { code: 'de' as Language, label: 'Deutsch' },
    { code: 'en' as Language, label: 'English' },
    { code: 'fr' as Language, label: 'Français' },
  ];

  const currentContent = datenschutzData[selectedLanguage];

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 sm:pt-32 pb-12 sm:pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-[#22c55e]" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
              Datenschutz / Privacy Policy
            </h1>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Choose your language:</span>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
            {languageButtons.map((lang) => (
              <Button
                key={lang.code}
                variant="ghost"
                onClick={() => setSelectedLanguage(lang.code)}
                className={
                  selectedLanguage === lang.code
                    ? "min-w-[140px] transition-all duration-200 bg-black text-white hover:bg-black border-0"
                    : "min-w-[140px] transition-all duration-200 bg-[#22c55e] text-black hover:bg-[#16a34a] border-0"
                }
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </div>

        <Card className="border-2 border-[#22c55e]/20 shadow-lg bg-neutral-900">
          <CardHeader className="bg-gradient-to-r from-[#22c55e]/10 to-transparent">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 sm:w-6 sm:h-6 text-[#22c55e] mt-1 flex-shrink-0" />
              <div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl text-white">
                  {currentContent.title}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2 text-gray-400">
                  {currentContent.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ScrollArea className="h-[500px] sm:h-[600px] w-full rounded-lg border-2 border-[#22c55e]/20 p-4 sm:p-6 bg-neutral-800/30">
              <div className="space-y-4 sm:space-y-6">
                {currentContent.content.map((paragraph, index) => {
                  const colonIndex = paragraph.indexOf(':');
                  const hasHeader = colonIndex > 0 && colonIndex < 100;

                  if (hasHeader) {
                    const header = paragraph.substring(0, colonIndex);
                    const content = paragraph.substring(colonIndex + 1).trim();

                    return (
                      <div key={index}>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                          {header}:
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm sm:text-base ml-4 whitespace-pre-line">
                          {content}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <p key={index} className="text-gray-300 leading-relaxed text-sm sm:text-base">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
