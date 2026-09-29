import eventPhoto from '../../assets/djmax.webp';
import eventVideoPhoto from '../../assets/Bunterrave.webp';
import eventEditingPhoto from '../../assets/fest.webp';
import businessPhotoPhoto from '../../assets/e94e52c6c69a93e4b17a2570bb1a9e20.jpg';
import eventFotografieIcon from '../../assets/cammicon.png';
import eventVideografieIcon from '../../assets/cam.png';
import eventEditingIcon from '../../assets/editing.png';

export interface IdealFor {
  title: string;
  text: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  // Werden beim Aufklappen einer Karte zu eigenen Karten; aufgeklappt zeigen
  // sie den kurzen Text und "Auswählen" -> vorausgefülltes Kontaktformular.
  // Texte = Entwurf, von Dima noch freizugeben.
  idealFor: IdealFor[];
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
      { title: 'Geburtstage & private Feiern', text: 'Ich halte die Stimmung eurer Feier fest – vom Anstoßen bis zur Tanzfläche, unaufdringlich und ohne gestellte Posen.' },
      { title: 'Verlobungen & Jubiläen', text: 'Für die Momente, die man nur einmal erlebt: der Antrag, die Rede, die Umarmung danach – festgehalten in ruhigen, klaren Bildern.' },
      { title: 'Familien- & Paarfotos', text: 'Entspannte Fotos von euch, drinnen oder draußen. Wir suchen gemeinsam einen Ort, an dem ihr euch wohlfühlt.' },
      { title: 'Taufen & besondere Anlässe', text: 'Ich begleite die Zeremonie dezent im Hintergrund und fange die Details und Momente des Tages ein.' },
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
      { title: 'Geburtstage & private Feiern', text: 'Ein Video, das die Atmosphäre eurer Feier einfängt – als kurzer Clip oder als längerer Film zum Wiederanschauen.' },
      { title: 'Verlobungen & Jubiläen', text: 'Bewegte Erinnerungen an euren besonderen Tag, mit Reden, Stimmen und den Emotionen des Moments.' },
      { title: 'Familienmomente & Paare', text: 'Natürliche Aufnahmen von euch, die zeigen, wie ihr wirklich seid – ruhig geschnitten und mit passender Musik.' },
      { title: 'Besondere Anlässe', text: 'Ob Taufe, Abschluss oder ein anderes Fest: Ich dokumentiere den Ablauf und die schönsten Augenblicke.' },
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
    idealFor: [
      { title: 'Aftermovies', text: 'Aus eurem Rohmaterial wird ein Aftermovie mit Rhythmus, stimmigen Farben und passender Musik.' },
      { title: 'Konzert- & Festivalvideos', text: 'Schnitt und Farbkorrektur für Live-Aufnahmen, damit Bühne, Licht und Publikum so wirken wie vor Ort.' },
      { title: 'Social-Media-Clips', text: 'Kurze, hochkant geschnittene Clips für Instagram, TikTok & Co. – aus eurem vorhandenen Material.' },
      { title: 'Event-Fotos', text: 'Bearbeitung eurer Eventfotos: Farben, Licht und Auswahl, damit die ganze Serie einheitlich wirkt.' },
    ],
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
      { title: 'Firmenveranstaltungen & Business-Events', text: 'Fotos von eurem Event für Website, Social Media und Presse – von der Begrüßung bis zum Networking.' },
      { title: 'Konferenzen & Messen', text: 'Dokumentation von Vorträgen, Ständen und Gesprächen, damit ihr euren Auftritt später zeigen könnt.' },
      { title: 'Corporate Portraits & Teams', text: 'Einheitliche Portraits für euer Team – für Website, LinkedIn und Unternehmensunterlagen.' },
      { title: 'Branding-, Presse- & Dokumentationsfotos', text: 'Bilder, die eure Marke, eure Räume und eure Arbeit zeigen – passend zu eurem Auftritt.' },
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
      { title: 'Firmen- & Eventvideos', text: 'Ein Video von eurer Veranstaltung oder eurem Unternehmen, das ihr intern und extern nutzen könnt.' },
      { title: 'Image- & Brandingvideos', text: 'Ein Film, der zeigt, wer ihr seid und was euch ausmacht – mit klarer Bildsprache und Struktur.' },
      { title: 'Social-Media- & Webcontent', text: 'Kurze Videos für eure Kanäle und eure Website, abgestimmt auf Format und Plattform.' },
      { title: 'Dokumentationen & Recaps', text: 'Zusammenfassungen von Projekten, Events oder Abläufen – sachlich und gut nachvollziehbar.' },
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
      { title: 'Schnitt von vorhandenem Material', text: 'Ihr habt Material, aber keine Zeit zum Schneiden? Ich mache daraus ein fertiges Video.' },
      { title: 'Social-Media- & Onlinevideos', text: 'Ich bringe eure Videos in die passenden Formate für Instagram, LinkedIn, YouTube & Co.' },
      { title: 'Image- & Unternehmensvideos', text: 'Feinschliff für eure Imagefilme: Schnitt, Farbkorrektur und ein stimmiger Gesamteindruck.' },
      { title: 'Optimierung für Web & Präsentationen', text: 'Ich passe eure Videos für Website und Präsentationen an – Länge, Format und Dateigröße.' },
    ],
    image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/services/business/editing',
    icon: eventEditingIcon,
  },
];
