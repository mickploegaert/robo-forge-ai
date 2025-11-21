"use client";
import { Lightbulb, Users, Zap, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from 'framer-motion';

export default function Vision() {
  const { t } = useLanguage();

  const cards = [
    { icon: Lightbulb, key: 'innovation', delay: 0 },
    { icon: Users, key: 'community', delay: 0.15 },
    { icon: Zap, key: 'future', delay: 0.3 }
  ];

  return (
    <section id="vision" className="py-20 bg-gradient-to-b from-white to-gray-50 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 bg-white/60 mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Onze Visie</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
            {t('vision.title')}
          </h2>
          <p className="text-xl text-black/70 max-w-3xl mx-auto">
            {t('vision.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {cards.map(({ icon: Icon, key, delay }) => (
            <motion.div key={key} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6,delay}} className="card p-8 bg-white hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-6">
                <Icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-black">
                {t(`vision.${key}.title`)}
              </h3>
              <p className="text-black/70 leading-relaxed">
                {t(`vision.${key}.text`)}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6,delay:0.4}} className="text-center">
          <div className="border border-black/10 rounded-2xl p-12 bg-white shadow-lg">
            <h3 className="text-3xl font-bold mb-4 text-black">
              {t('vision.cta.title')}
            </h3>
            <p className="text-xl mb-8 text-black/70">
              {t('vision.cta.text')}
            </p>
            <a href="#input" className="btn btn-black btn-hover-effect inline-flex items-center gap-3">
              {t('vision.cta.button')}
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}