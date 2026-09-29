import eventPhoto from '../../assets/djmax.webp';
import eventVideoPhoto from '../../assets/Bunterrave.webp';
import eventEditingPhoto from '../../assets/fest.webp';
import businessPhotoPhoto from '../../assets/e94e52c6c69a93e4b17a2570bb1a9e20.jpg';
import eventFotografieIcon from '../../assets/cammicon.png';
import eventVideografieIcon from '../../assets/cam.png';
import eventEditingIcon from '../../assets/editing.png';

export interface Service {
  id: string;
  title: string;
  description: string;
  // Werden beim Aufklappen einer Karte zu eigenen, anklickbaren Karten,
  // die zum vorausgefüllten Kontaktformular führen.
  idealFor: string[];
  image: string;
  link: string;
  icon?: string;
}

export const eventServices: Service[] = [
  {
    id: 'event-photography',
    title: 'Fotografie',
    description:
      'Erinnerungen, die bleiben – in ruhigen, klaren Bildern. Ich begleite deinen Anlass dezent und fokussiere mich auf echte Momente, Details und Stimmung.',
    idealFor: [
      'Geburtstage & private Feiern',
      'Verlobungen & Jubiläen',
      'Familien- & Paarfotos',
      'Taufen & besondere Anlässe',
    ],
    image: eventPhoto,
    link: '/services/event/fotografie',
    icon: eventFotografieIcon,
  },
  {
    id: 'event-videography',
    title: 'Videografie',
    description:
      'Bewegte Bilder, die Atmosphäre und Emotionen authentisch einfangen. Ich dokumentiere private Anlässe unaufdringlich und mit Fokus auf natürliche Abläufe, Stimmung und Details.',
    idealFor: [
      'Geburtstage & private Feiern',
      'Verlobungen & Jubiläen',
      'Familienmomente & Paare',
      'Besondere Anlässe',
    ],
    image: eventVideoPhoto,
    link: '/services/event/videografie',
    icon: eventVideografieIcon,
  },
  {
    id: 'event-editing',
    title: 'Editing',
    description:
      'Nachbearbeitung für Event-Fotos und Event-Videos.\nSaubere Farben, ruhige Schnitte und Optimierungen, damit euer Eventmaterial gut aussieht und direkt nutzbar ist.',
    idealFor: ['Aftermovies', 'Konzert- & Festivalvideos', 'Social-Media-Clips', 'Event-Fotos'],
    image: eventEditingPhoto,
    link: '/services/event/editing',
    icon: eventEditingIcon,
  },
];

export const businessServices: Service[] = [
  {
    id: 'business-photography',
    title: 'Fotografie',
    description:
      'Professionelle Fotografie für Unternehmen, Marken und Veranstaltungen. Ich liefere klare, konsistente Bilder, die dein Business authentisch repräsentieren und vielseitig einsetzbar sind – online wie offline.',
    idealFor: [
      'Firmenveranstaltungen & Business-Events',
      'Konferenzen & Messen',
      'Corporate Portraits & Teams',
      'Branding-, Presse- & Dokumentationsfotos',
    ],
    image: businessPhotoPhoto,
    link: '/services/business/fotografie',
    icon: eventFotografieIcon,
  },
  {
    id: 'business-videography',
    title: 'Videografie',
    description:
      'Sachliche, wirkungsvolle Videos für Unternehmen und professionelle Auftritte. Ich setze Inhalte strukturiert um und lege Wert auf eine klare Bildsprache sowie einen professionellen Produktionsablauf.',
    idealFor: [
      'Firmen- & Eventvideos',
      'Image- & Brandingvideos',
      'Social-Media- & Webcontent',
      'Dokumentationen & Recaps',
    ],
    image: 'https://images.pexels.com/photos/4970330/pexels-photo-4970330.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/services/business/videografie',
    icon: eventVideografieIcon,
  },
  {
    id: 'business-editing',
    title: 'Editing',
    description:
      'Professionelle Postproduktion für bestehendes Videomaterial. Ich übernehme Schnitt, Farbkorrektur und Feinschliff – abgestimmt auf Zielgruppe, Plattform und Einsatzzweck.',
    idealFor: [
      'Schnitt von vorhandenem Material',
      'Social-Media- & Onlinevideos',
      'Image- & Unternehmensvideos',
      'Optimierung für Web & Präsentationen',
    ],
    image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/services/business/editing',
    icon: eventEditingIcon,
  },
];
