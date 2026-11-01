import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { Scale, Globe, Info } from 'lucide-react';
import { Seo } from '../components/Seo';
import { agb as texte, type Language } from '../data/seiten';

const languageLabels: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
};

export default function AGBPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('de');

  const currentContent = texte[selectedLanguage];

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 sm:pt-32 pb-12 sm:pb-16">
      <Seo
        title="AGB – Mosk Unlimited"
        description="Allgemeine Geschäftsbedingungen von Mosk Unlimited, Ostbelgien – Amel."
        path="/agb"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-brand" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-normal text-white text-center">
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
                  {currentContent.titel}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2 text-gray-400">
                  {currentContent.stand}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ScrollArea className="h-[500px] sm:h-[600px] w-full rounded-lg border-2 border-brand/20 p-4 sm:p-6 bg-neutral-800/30">
              <div className="space-y-4 sm:space-y-6">
                {currentContent.absaetze.map((absatz, index) =>
                  absatz.ueberschrift ? (
                    <div key={index}>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                        {absatz.ueberschrift}:
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-sm sm:text-base ml-4 whitespace-pre-line">
                        {absatz.text}
                      </p>
                    </div>
                  ) : (
                    <p key={index} className="text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                      {absatz.text}
                    </p>
                  ),
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
