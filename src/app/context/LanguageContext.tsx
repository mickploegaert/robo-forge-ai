"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'nl' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navbar
    'home': 'Home',
    'requirements': 'Requirements',
    'input': 'Input',
    'results': 'Results',
    'language': 'Language',
    
    // Hero
    'hero.title': 'Plan, design and build robots faster with an AI assistant.',
    'hero.subtitle': 'Provide text or concept image. Get immediate parts lists, wiring, Arduino code and 3D housing placeholders. Open-source components first (Pi, Arduino, micro:bit).',
    'hero.start': 'Start now',
    'hero.requirements': 'View requirements',
    // Stats
    'stats.robots': 'Robots',
    'stats.users': 'Users',
    'stats.projects': 'Projects',
    
    // Vision
    'vision.title': 'Our Vision',
    'vision.subtitle': 'We make robotics accessible with an AI-first workflow from idea to prototype.',
    'vision.innovation.title': 'Innovation in Robotics',
    'vision.innovation.text': 'At ROBO Forge AI, we believe in democratizing robotics. Our mission is to make innovative technology accessible to everyone - from hobbyists to professionals.',
    'vision.community.title': 'Community & Collaboration',
    'vision.community.text': 'Build together, share improvements and learn from best practices with an open community.',
    'vision.ai.title': 'AI-Driven Development',
    'vision.ai.text': 'By combining AI with robotics, we make the design process more efficient and intuitive. From concept to working prototype in a fraction of traditional time.',
    'vision.design.title': 'Smart Design',
    'vision.design.text': 'Upload your concept or describe your idea. Our AI immediately generates a complete parts list focusing on open-source components.',
    'vision.solution.title': 'Complete Solution',
    'vision.solution.text': 'Get not only parts, but also wiring diagrams, Arduino code and 3D model files for your housing.',
    'vision.future.title': 'Future-Oriented',
    'vision.future.text': 'Continuous updates with new features like energy optimization, performance comparisons and a growing community.',
    'vision.models.title': '3D Models & Prototypes',
    'vision.models.text': 'Preview housing ideas and iterate quickly with generated specifications.',
    'vision.models.preview': '3D previews coming soon.',
    'vision.cta.title': 'Start building your robot today',
    'vision.cta.text': 'Describe your robot and generate parts, wiring, code and model specs.',
    'vision.cta.button': 'Get started',

    // Input
    'input.title': 'Robot Concept Input',
    'input.subtitle': 'Describe your robot idea or paste a concept image URL. We generate parts, wiring, Arduino code, and 3D specs.',
    'input.placeholder': "Describe your robot... e.g. 'An autonomous robot that avoids obstacles using ultrasonic sensors and servos'",
    'input.image.label': 'Concept Image (Optional)',
    'input.image.placeholder': 'Paste image URL here...',
    'input.generate.parts': 'Generate Parts List',
    'input.generate.code': 'Generate Code',
    'input.generate.circuit': 'Generate Circuit',
    'input.generate.model': 'Generate 3D Model',

    // Loading labels
    'loading.parts': 'Generating parts...',
    'loading.code': 'Generating code...',
    'loading.circuit': 'Generating circuit...',
    'loading.model': 'Generating model...',

    // Results
    'results.parts.title': 'Generated Parts List',
    'results.code.title': 'Generated Arduino Code',
    'results.circuit.title': 'Circuit Design & Wiring',
    'results.model.title': '3D Model Specifications',
    'results.download': 'Download .ino',
    'results.copy': 'Copy',

    // Search
    'search.title': 'Search Parts',
    'search.subtitle': 'Find specific parts and add them to your configuration',
    'search.placeholder': "Search parts... e.g. 'Arduino Uno', 'servo motor', 'ultrasonic sensor'",
    'search.button': 'Search',
    'search.add': 'Add',
    'search.web.title': 'Web Search Results',
    'search.error': 'An error occurred during search. Please try again.',

    // Config
    'config.title': 'Robot Configurations',
    'config.new': 'New Configuration',
    'config.parts': 'parts',
    'config.empty': 'No parts added yet. Search and add parts to this configuration.',
    'config.remove': 'Remove from configuration',
  },
  nl: {
    // Navbar
    'home': 'Home',
    'requirements': 'Eisen',
    'input': 'Invoer',
    'results': 'Resultaten',
    'language': 'Taal',
    
    // Hero
    'hero.title': 'Plan, ontwerp en bouw sneller robots met een AI‑assistent.',
    'hero.subtitle': 'Geef een tekst of conceptafbeelding. Krijg directe onderdelenlijsten, bedrading, Arduino‑code en 3D‑behuizing‑placeholders. Open‑source onderdelen eerst (Pi, Arduino, micro:bit).',
    'hero.start': 'Start nu',
    'hero.requirements': 'Bekijk eisen',
    // Stats
    'stats.robots': 'Robots',
    'stats.users': 'Gebruikers',
    'stats.projects': 'Projecten',
    
    // Vision
    'vision.title': 'Onze Visie',
    'vision.subtitle': 'We maken robotica toegankelijk met een AI‑first workflow van idee tot prototype.',
    'vision.innovation.title': 'Innovatie in Robotica',
    'vision.innovation.text': 'Bij ROBO Forge AI geloven we in het democratiseren van robotica. Onze missie is om innovatieve technologie toegankelijk te maken voor iedereen - van hobbyisten tot professionals.',
    'vision.community.title': 'Community & Samenwerking',
    'vision.community.text': 'Bouw samen, deel verbeteringen en leer van best‑practices in een open community.',
    'vision.ai.title': 'AI-Gedreven Ontwikkeling',
    'vision.ai.text': 'Door AI te combineren met robotica maken we het ontwerpproces efficiënter en intuïtiever. Van concept tot werkend prototype in een fractie van de traditionele tijd.',
    'vision.design.title': 'Smart Design',
    'vision.design.text': 'Upload je concept of beschrijf je idee. Onze AI genereert direct een complete onderdelenlijst met focus op open-source componenten.',
    'vision.solution.title': 'Complete Oplossing',
    'vision.solution.text': 'Krijg niet alleen onderdelen, maar ook bedradingsschema\'s, Arduino-code en 3D-modelbestanden voor je behuizing.',
    'vision.future.title': 'Toekomstgericht',
    'vision.future.text': 'Continue updates met nieuwe features zoals energieoptimalisatie, prestatievergelijkingen en een groeiende community.',
    'vision.models.title': '3D Modellen & Prototypes',
    'vision.models.text': 'Bekijk behuizingsideeën en itereren snel met gegenereerde specificaties.',
    'vision.models.preview': '3D previews komen binnenkort.',
    'vision.cta.title': 'Begin vandaag met je robot bouwen',
    'vision.cta.text': 'Beschrijf je robot en genereer onderdelen, bedrading, code en modelspecificaties.',
    'vision.cta.button': 'Aan de slag',

    // Input
    'input.title': 'Robot Concept Invoer',
    'input.subtitle': 'Beschrijf je robotidee of plak een conceptafbeelding‑URL. We genereren onderdelen, bedrading, Arduino‑code en 3D‑specificaties.',
    'input.placeholder': "Beschrijf je robot... bijv. 'Een autonome robot die obstakels vermijdt met ultrasone sensoren en servo\'s'",
    'input.image.label': 'Conceptafbeelding (Optioneel)',
    'input.image.placeholder': 'Plak afbeelding‑URL hier...',
    'input.generate.parts': 'Genereer Onderdelenlijst',
    'input.generate.code': 'Genereer Code',
    'input.generate.circuit': 'Genereer Circuit',
    'input.generate.model': 'Genereer 3D Model',

    // Loading labels
    'loading.parts': 'Onderdelen genereren...',
    'loading.code': 'Code genereren...',
    'loading.circuit': 'Circuit genereren...',
    'loading.model': 'Model genereren...',

    // Results
    'results.parts.title': 'Gegenereerde Onderdelenlijst',
    'results.code.title': 'Gegenereerde Arduino Code',
    'results.circuit.title': 'Circuit Ontwerp & Bedrading',
    'results.model.title': '3D Model Specificaties',
    'results.download': 'Download .ino',
    'results.copy': 'Kopiëren',

    // Search
    'search.title': 'Onderdelen Zoeken',
    'search.subtitle': 'Zoek naar specifieke onderdelen en voeg ze toe aan je configuratie',
    'search.placeholder': "Zoek onderdelen... bijv. 'Arduino Uno', 'servo motor', 'ultrasone sensor'",
    'search.button': 'Zoeken',
    'search.add': 'Toevoegen',
    'search.web.title': 'Web Zoekresultaten',
    'search.error': 'Er is een fout opgetreden bij het zoeken. Probeer het opnieuw.',

    // Config
    'config.title': 'Robot Configuraties',
    'config.new': 'Nieuwe Configuratie',
    'config.parts': 'onderdelen',
    'config.empty': 'Geen onderdelen toegevoegd. Zoek en voeg onderdelen toe aan deze configuratie.',
    'config.remove': 'Verwijderen uit configuratie',
  }
} as const;

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('nl');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}