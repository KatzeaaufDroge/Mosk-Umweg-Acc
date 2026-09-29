import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { Scale, Globe, Info } from 'lucide-react';
import { Seo } from '../components/Seo';

type Language = 'de' | 'en' | 'fr';

interface ContentData {
  title: string;
  description: string;
  content: string[];
}

const contentByLanguage: Record<Language, ContentData> = {
  de: {
    title: 'Allgemeine Geschäftsbedingungen',
    description: 'Stand Januar 2026',
    content: [
      '1. Geltungsbereich: Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen MOSK unlimited, Bahnhofstraße 16/1, 4780 St. Vith, Belgien (nachfolgend "Auftragnehmer") und ihren Kunden ("Auftraggeber"), sowohl im B2B- als auch im B2C-Bereich.',
      '2. Leistungen: Der Auftragnehmer erbringt kreative Dienstleistungen, insbesondere in den Bereichen Fotografie, Videoproduktion, Grafik- und Logodesign, Webdesign, Online- und Social-Media-Marketing, Druck- und Werbetechnik sowie damit verbundene Beratungs- und Koordinationsleistungen. Der Auftragnehmer ist berechtigt, zur Vertragserfüllung Dritte einzusetzen.',
      '3. Vertragsabschluss: Angebote sind, sofern nicht anders angegeben, 7 Tage gültig. Ein Vertrag kommt erst durch schriftliche Auftragsbestätigung oder Beginn der Leistungserbringung zustande.',
      '4. Preise und Anzahlung: Alle Preise verstehen sich zuzüglich der gesetzlichen Mehrwertsteuer, sofern anwendbar. Bei Auftragserteilung ist eine Anzahlung von 25 % des vereinbarten Gesamtpreises fällig, sofern nichts anderes schriftlich vereinbart wurde.',
      '5. Zahlungsbedingungen: Rechnungen sind spätestens zum auf der Rechnung angegebenen Fälligkeitsdatum ohne Abzug zahlbar.',
      '6. Zahlungsverzug: B2B: Bei Zahlungsverzug werden von Rechts wegen und ohne Inverzugsetzung Verzugszinsen gemäß dem Gesetz vom 2. August 2002 über Zahlungsverzug bei Handelsgeschäften fällig. Zusätzlich wird eine pauschale Entschädigung von 10 % des offenen Betrags mit einem Mindestbetrag von 40 € erhoben. B2C: Bei Zahlungsverzug können Verzugszinsen gemäß den geltenden gesetzlichen Bestimmungen geltend gemacht werden.',
      '7. Nutzungsrechte: Sofern nicht anders vereinbart, erhält der Auftraggeber ein einfaches, nicht übertragbares Nutzungsrecht für den vereinbarten Zweck. Eine Bearbeitung, Veränderung, Weitergabe oder sonstige Abänderung der gelieferten Werke ist ohne vorherige schriftliche Zustimmung des Auftragnehmers nicht gestattet.',
      '8. Referenzen: Der Auftragnehmer ist berechtigt, Arbeiten nur nach vorheriger Zustimmung des Auftraggebers als Referenz zu verwenden.',
      '9. Haftung: Der Auftragnehmer haftet nur bei Vorsatz oder grober Fahrlässigkeit. Bei leichter Fahrlässigkeit ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt.',
      '10. Gerichtsstand und anwendbares Recht: Es gilt belgisches Recht. Gerichtsstand ist Eupen (Belgien). Sollte dieser gesetzlich nicht zuständig oder nicht verfügbar sein, gilt der gesetzlich zuständige Gerichtsstand.',
    ],
  },
  en: {
    title: 'Terms and Conditions',
    description: 'Valid from January 2026',
    content: [
      '1. Scope: These terms apply to all contracts between MOSK unlimited, Bahnhofstraße 16/1, 4780 St. Vith, Belgium and its clients (B2B and B2C).',
      '2. Services: MOSK unlimited provides creative services including photography, video production, graphic and logo design, web design, online and social media marketing, printing and signage, and related services. Third parties may be engaged.',
      '3. Contract formation: Offers are valid for 7 days unless stated otherwise. A contract is concluded upon written confirmation or commencement of services.',
      '4. Prices and down payment: A 25% down payment is due upon order unless agreed otherwise.',
      '5. Payment terms: Invoices are payable by the due date stated.',
      '6. Late payment: B2B: statutory interest and compensation according to the Belgian Act of 2 August 2002. B2C: statutory late payment interest may apply.',
      '7. Usage rights: Usage rights are limited to the agreed purpose. Any modification, alteration, transfer or adaptation of the delivered works is prohibited without prior written consent of the contractor.',
      '8. References: Use of work as reference is permitted only with prior consent of the client.',
      '9. Liability: Liability is limited to intent and gross negligence.',
      '10. Applicable law and jurisdiction: Belgian law applies. Jurisdiction: Eupen (Belgium). If this court is not legally competent or available, the legally competent court shall apply.',
    ],
  },
  fr: {
    title: 'Conditions Générales',
    description: 'Valable à partir de janvier 2026',
    content: [
      '1. Champ d\'application: Les présentes conditions générales s\'appliquent à tous les contrats conclus entre MOSK unlimited, Bahnhofstraße 16/1, 4780 St. Vith, Belgique et ses clients, tant en B2B qu\'en B2C.',
      '2. Prestations: MOSK unlimited fournit des services créatifs, notamment en photographie, production vidéo, design graphique et de logo, création de sites web, marketing en ligne et sur les réseaux sociaux, impression et signalétique, ainsi que des services connexes. Elle peut faire appel à des tiers.',
      '3. Conclusion du contrat: Les offres sont valables 7 jours, sauf indication contraire. Le contrat est conclu après confirmation écrite ou début d\'exécution.',
      '4. Prix et acompte: Sauf accord contraire, un acompte de 25 % est exigible à la commande.',
      '5. Conditions de paiement: Les factures sont payables à l\'échéance indiquée.',
      '6. Retard de paiement: B2B : intérêts et indemnité forfaitaire conformément à la loi du 2 août 2002. B2C : intérêts de retard selon les dispositions légales applicables.',
      '7. Droits d\'utilisation: Les droits d\'utilisation sont limités à l\'usage convenu. Toute modification, adaptation, transmission ou altération des œuvres livrées est interdite sans l\'accord écrit préalable du prestataire.',
      '8. Références: L\'utilisation des travaux comme référence n\'est autorisée qu\'après accord préalable du client.',
      '9. Responsabilité: La responsabilité est limitée aux cas de faute lourde ou intentionnelle.',
      '10. Droit applicable et juridiction: Droit belge – tribunal compétent : Eupen (Belgique). À défaut, le tribunal légalement compétent sera d\'application.',
    ],
  },
};

const languageLabels: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
};

export default function AGBPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('de');

  const currentContent = contentByLanguage[selectedLanguage];

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 sm:pt-32 pb-12 sm:pb-16">
      <Seo
        title="AGB – Mosk Unlimited"
        description="Allgemeine Geschäftsbedingungen von Mosk Unlimited, St. Vith, Belgien."
        path="/agb"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-brand" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
              AGB / Terms & Conditions
            </h1>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Choose your language:</span>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
            {(Object.keys(languageLabels) as Language[]).map((lang) => (
              <Button
                key={lang}
                variant="ghost"
                onClick={() => setSelectedLanguage(lang)}
                className={
                  selectedLanguage === lang
                    ? "min-w-[140px] transition-all duration-200 bg-black text-white hover:bg-black border-0"
                    : "min-w-[140px] transition-all duration-200 bg-brand text-black hover:bg-brand-dark border-0"
                }
              >
                {languageLabels[lang]}
              </Button>
            ))}
          </div>
        </div>

        <Card className="border-2 border-brand/20 shadow-lg bg-neutral-900">
          <CardHeader className="bg-gradient-to-r from-brand/10 to-transparent">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 sm:w-6 sm:h-6 text-brand mt-1 flex-shrink-0" />
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
            <ScrollArea className="h-[500px] sm:h-[600px] w-full rounded-lg border-2 border-brand/20 p-4 sm:p-6 bg-neutral-800/30">
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
