// Texte und Bilder der Seiten liegen als JSON unter /content/seiten und werden
// über das Admin-Panel (/admin, Sammlungen "Seiten" und "Rechtliches")
// gepflegt. Aufbau und Design stehen fest im Code, im Admin ändert Dima nur
// Inhalte – plus Service-Karten anlegen/löschen.
// Neues Feld: hier im Typ ergänzen + in public/admin/config.yml eintragen.
import fotografieIcon from '../../assets/cammicon.png';
import videografieIcon from '../../assets/cam.png';
import editingIcon from '../../assets/editing.png';

import startseiteJson from '../../content/seiten/startseite.json';
import servicesJson from '../../content/seiten/services.json';
import servicesPrivatJson from '../../content/seiten/services-privat.json';
import servicesBusinessJson from '../../content/seiten/services-business.json';
import kontaktJson from '../../content/seiten/kontakt.json';
import footerJson from '../../content/seiten/footer.json';
import ueberMichJson from '../../content/seiten/ueber-mich.json';
import impressumJson from '../../content/seiten/impressum.json';
import datenschutzJson from '../../content/seiten/datenschutz.json';
import agbJson from '../../content/seiten/agb.json';

export interface IdealFor {
  title: string;
  text: string;
}

export interface Service {
  // Aus dem Titel erzeugt, steht in der Adresse (?service=…)
  id: string;
  title: string;
  description: string;
  // Werden beim Aufklappen einer Karte zu eigenen Karten; aufgeklappt zeigen
  // sie den kurzen Text und "Auswählen" -> vorausgefülltes Kontaktformular.
  idealFor: IdealFor[];
  image: string;
  icon?: string;
}

interface ServiceFile {
  titel: string;
  untertitel: string;
  karten?: {
    titel: string;
    beschreibung?: string;
    bild?: string;
    symbol?: string;
    anlaesse?: { titel: string; text?: string }[];
  }[];
  abschluss: { titel: string; text: string; button: string };
}

// Symbole sind fest (Design), im Admin nur auswählbar
const ICONS: Record<string, string> = {
  fotografie: fotografieIcon,
  videografie: videografieIcon,
  editing: editingIcon,
};

// "Social Media & Web" -> "social-media-web"
function slug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toServices(file: ServiceFile): Service[] {
  const used = new Set<string>();
  return (file.karten ?? [])
    .filter((k) => k.titel)
    .map((k) => {
      // Gleicher Titel zweimal -> "-2", "-3", damit jede Karte eindeutig bleibt
      const base = slug(k.titel) || 'service';
      let id = base;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
      used.add(id);
      return {
        id,
        title: k.titel,
        description: k.beschreibung ?? '',
        idealFor: (k.anlaesse ?? []).filter((a) => a.titel).map((a) => ({ title: a.titel, text: a.text ?? '' })),
        image: k.bild ?? '',
        icon: k.symbol ? ICONS[k.symbol] : undefined,
      };
    });
}

function toServicePage(file: ServiceFile) {
  return { ...file, services: toServices(file) };
}

export const startseite = startseiteJson as {
  titel: string;
  untertitel: string;
  button: string;
  bilder: { bild: string }[];
};

export const servicesUebersicht = servicesJson;
export const servicesPrivat = toServicePage(servicesPrivatJson);
export const servicesBusiness = toServicePage(servicesBusinessJson);

export const kontakt = kontaktJson;
// "+32 472 80 44 61" -> "32472804461" für wa.me und tel:
export const kontaktNummer = kontakt.telefon.replace(/\D/g, '');

export const footer = footerJson;

export const ueberMich = ueberMichJson as {
  titel: string;
  name: string;
  rolle?: string;
  einleitung: string;
  portrait?: string;
  geschichte: { titel: string; text?: string };
  werte: { titel: string; punkte?: { titel: string; text: string }[] };
  bilder?: { bild: string; beschreibung?: string }[];
  abschluss: { titel: string; text: string; button: string };
};

export const impressum = impressumJson as { abschnitte: { titel: string; text: string }[] };

export type Language = 'de' | 'en' | 'fr';

export interface LegalText {
  titel: string;
  stand: string;
  absaetze: { ueberschrift?: string; text: string }[];
}

export const datenschutz = datenschutzJson as Record<Language, LegalText>;
export const agb = agbJson as Record<Language, LegalText>;
