"use client";
import { useState, useEffect } from "react";
import { Play, ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from 'framer-motion';

export default function Hero() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ robots: 0, users: 0, projects: 0 });

  useEffect(() => {
    const targets = { robots: 1250, users: 5600, projects: 890 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setStats({
        robots: Math.floor(targets.robots * progress),
        users: Math.floor(targets.users * progress),
        projects: Math.floor(targets.projects * progress)
      });
      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(targets);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60">
          <source src="/videoai.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-transparent"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.h1 initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.8}} className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4">
          {t('hero.title')}
        </motion.h1>

        <motion.p initial={{y:18,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.9, delay:0.1}} className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-white/90">
          {t('hero.subtitle')}
        </motion.p>

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.9, delay:0.2}} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a href="#input" className="btn btn-black btn-hover-effect flex items-center gap-3">
            <Play className="h-4 w-4" />
            {t('hero.start')}
            <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#vision" className="btn btn-outline flex items-center gap-3">
            {t('hero.requirements')}
          </a>
        </motion.div>

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.9, delay:0.3}} className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold mb-1">{stats.robots.toLocaleString()}+</div>
            <div className="text-white/70 text-xs uppercase tracking-wide">{t('stats.robots')}</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold mb-1">{stats.users.toLocaleString()}+</div>
            <div className="text-white/70 text-xs uppercase tracking-wide">{t('stats.users')}</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold mb-1">{stats.projects.toLocaleString()}+</div>
            <div className="text-white/70 text-xs uppercase tracking-wide">{t('stats.projects')}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}