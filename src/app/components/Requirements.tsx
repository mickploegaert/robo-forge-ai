"use client";
import { Cpu, Wrench, Zap } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from 'framer-motion';

export default function Requirements() {
  const { t } = useLanguage();
  
  const features = [
    { icon: Cpu, key: 'design' },
    { icon: Wrench, key: 'solution' },
    { icon: Zap, key: 'future' }
  ];

  return (
    <section id="requirements" className="border-b border-black/5 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="mb-12">
          <h2 className="text-3xl font-bold mb-3">{t('vision.title')}</h2>
          <p className="text-black/70 text-lg max-w-2xl">{t('vision.subtitle')}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-8 mb-12">
          <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.6}}>
            <h3 className="text-xl font-semibold mb-3">{t('vision.innovation.title')}</h3>
            <p className="text-black/70 leading-relaxed">{t('vision.innovation.text')}</p>
          </motion.div>
          <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.6,delay:0.1}}>
            <h3 className="text-xl font-semibold mb-3">{t('vision.ai.title')}</h3>
            <p className="text-black/70 leading-relaxed">{t('vision.ai.text')}</p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, key }, i) => (
            <motion.div key={key} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:i*0.1}} className="p-6 rounded-xl card bg-white">
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center mb-4">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">{t(`vision.${key}.title`)}</h3>
              <p className="text-sm text-black/70 leading-relaxed">{t(`vision.${key}.text`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}