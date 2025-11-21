"use client";
import { useState } from "react";
import Image from 'next/image';
import { Menu, X, Home, Eye, Code, Zap, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ appName }: { appName: string }) {
  const [navOpen, setNavOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => setLanguage(language === 'nl' ? 'en' : 'nl');

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-black/10 text-black shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border border-black/10 bg-white/60">
              <Image src="/robo forge.png" alt="ROBO Forge AI" fill className="object-contain p-1" priority />
            </div>
            <div>
              <div className="font-semibold text-lg leading-none">{appName}</div>
              <div className="text-xs text-black/60">AI robot prototyping</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#hero" className="flex items-center gap-2 text-black hover:opacity-90 transition-colors text-sm font-medium">
              <Home className="h-4 w-4" />
              {t('home')}
            </a>
            <a href="#vision" className="flex items-center gap-2 text-black hover:opacity-90 transition-colors text-sm font-medium">
              <Eye className="h-4 w-4" />
              {t('vision.title')}
            </a>
            <a href="#input" className="flex items-center gap-2 text-black hover:opacity-90 transition-colors text-sm font-medium">
              <Code className="h-4 w-4" />
              {t('input')}
            </a>
            <a href="#results" className="flex items-center gap-2 text-black hover:opacity-90 transition-colors text-sm font-medium">
              <Zap className="h-4 w-4" />
              {t('results')}
            </a>

            <button onClick={toggleLanguage} className="flex items-center gap-2 text-sm font-medium px-3 py-1 rounded border border-black/10 hover:bg-black/5">
              <Globe className="h-4 w-4" />
              {language.toUpperCase()}
            </button>
          </nav>

          <button aria-label="Toggle menu" onClick={() => setNavOpen(v => !v)} className="md:hidden h-10 w-10 flex items-center justify-center rounded border border-black/10 bg-white/80 hover:scale-105 transition-transform">
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {navOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="md:hidden border-t border-black/10 bg-white/95 text-black">
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              <a onClick={() => setNavOpen(false)} href="#hero" className="flex items-center gap-3 text-black hover:opacity-80 transition-colors text-sm font-medium py-2">
                <Home className="h-4 w-4" />
                {t('home')}
              </a>
              <a onClick={() => setNavOpen(false)} href="#vision" className="flex items-center gap-3 text-black hover:opacity-80 transition-colors text-sm font-medium py-2">
                <Eye className="h-4 w-4" />
                {t('vision.title')}
              </a>
              <a onClick={() => setNavOpen(false)} href="#input" className="flex items-center gap-3 text-black hover:opacity-80 transition-colors text-sm font-medium py-2">
                <Code className="h-4 w-4" />
                {t('input')}
              </a>
              <a onClick={() => setNavOpen(false)} href="#results" className="flex items-center gap-3 text-black hover:opacity-80 transition-colors text-sm font-medium py-2">
                <Zap className="h-4 w-4" />
                {t('results')}
              </a>

              <div className="pt-2 border-t border-black/5">
                <button onClick={() => { toggleLanguage(); setNavOpen(false); }} className="w-full flex items-center gap-3 text-sm font-medium py-2">
                  <Globe className="h-4 w-4" />
                  {t('language')}: {language.toUpperCase()}
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}